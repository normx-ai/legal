/**
 * Service d'embedding et d'indexation dans Qdrant
 * Utilise l'API Anthropic pour les embeddings via Voyage AI
 * ou un modèle local si disponible
 *
 * Usage : npx tsx src/services/rag/embedder.ts
 */

import fs from "fs";
import path from "path";
import { QdrantClient } from "@qdrant/js-client-rest";
import Anthropic from "@anthropic-ai/sdk";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "ohada_guide";
const EMBEDDING_DIM = 1024; // Dimension pour voyage-3

const qdrant = new QdrantClient({ url: QDRANT_URL });
const anthropic = new Anthropic();

interface OhadaChunk {
  id: string;
  paragraphe: string;
  chapitre: string;
  section: string;
  titre: string;
  contenu: string;
  articles_auscgie: string[];
  forme_juridique: string;
  page: number;
  source: string;
}

/**
 * Génère un embedding via Claude/Voyage
 */
async function getEmbedding(text: string): Promise<number[]> {
  // Utiliser l'API Anthropic messages pour créer un embedding approximatif
  // En production, utiliser Voyage AI ou un modèle d'embedding dédié
  // Pour l'instant, on utilise un hash déterministe comme placeholder

  // Option 1 : Voyage AI (recommandé)
  // const voyageResponse = await fetch("https://api.voyageai.com/v1/embeddings", { ... });

  // Option 2 : Embedding simple basé sur le contenu (placeholder)
  // On va utiliser une approche avec Claude pour extraire des features
  const hash = simpleHash(text);
  const embedding = new Array(EMBEDDING_DIM).fill(0);
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    embedding[i] = Math.sin(hash * (i + 1) * 0.001) * Math.cos(hash * (i + 2) * 0.002);
  }

  // Normaliser
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  return embedding.map((v) => v / (norm || 1));
}

function simpleHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Créer la collection Qdrant si elle n'existe pas
 */
async function ensureCollection() {
  try {
    await qdrant.getCollection(COLLECTION_NAME);
    console.log(`✅ Collection "${COLLECTION_NAME}" existe déjà`);
  } catch {
    console.log(`📦 Création de la collection "${COLLECTION_NAME}"...`);
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: EMBEDDING_DIM,
        distance: "Cosine",
      },
    });
    console.log(`✅ Collection créée`);

    // Créer des index sur les métadonnées
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "chapitre",
      field_schema: "keyword",
    });
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "forme_juridique",
      field_schema: "keyword",
    });
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: "paragraphe",
      field_schema: "keyword",
    });
    console.log(`✅ Index créés`);
  }
}

/**
 * Indexer les chunks dans Qdrant
 */
async function indexChunks(chunksFile: string) {
  const chunks: OhadaChunk[] = JSON.parse(fs.readFileSync(chunksFile, "utf-8"));
  console.log(`\n📚 Indexation de ${chunks.length} chunks dans Qdrant...`);

  await ensureCollection();

  // Indexer par lots de 50
  const batchSize = 50;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const points = [];

    for (const chunk of batch) {
      // Texte à embedder : titre + contenu pour un meilleur matching
      const textToEmbed = `${chunk.titre}\n${chunk.contenu}`.substring(0, 8000);
      const vector = await getEmbedding(textToEmbed);

      points.push({
        id: simpleHash(chunk.id) % 2147483647, // Qdrant needs positive integer or UUID
        vector,
        payload: {
          chunk_id: chunk.id,
          paragraphe: chunk.paragraphe,
          chapitre: chunk.chapitre,
          section: chunk.section,
          titre: chunk.titre,
          contenu: chunk.contenu,
          articles_auscgie: chunk.articles_auscgie,
          forme_juridique: chunk.forme_juridique,
          page: chunk.page,
          source: chunk.source,
        },
      });
    }

    await qdrant.upsert(COLLECTION_NAME, { points });
    console.log(`   ✅ Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} indexé (${points.length} points)`);
  }

  console.log(`\n✅ ${chunks.length} chunks indexés dans Qdrant`);
}

/**
 * Rechercher des chunks similaires
 */
export async function searchChunks(
  query: string,
  options: { limit?: number; formeJuridique?: string; chapitre?: string } = {}
): Promise<OhadaChunk[]> {
  const { limit = 5, formeJuridique, chapitre } = options;
  const vector = await getEmbedding(query);

  const filter: any = { must: [] };
  if (formeJuridique) {
    filter.must.push({ key: "forme_juridique", match: { value: formeJuridique } });
  }
  if (chapitre) {
    filter.must.push({ key: "chapitre", match: { value: chapitre } });
  }

  const results = await qdrant.search(COLLECTION_NAME, {
    vector,
    limit,
    filter: filter.must.length > 0 ? filter : undefined,
    with_payload: true,
  });

  return results.map((r) => ({
    id: (r.payload as any).chunk_id,
    paragraphe: (r.payload as any).paragraphe,
    chapitre: (r.payload as any).chapitre,
    section: (r.payload as any).section,
    titre: (r.payload as any).titre,
    contenu: (r.payload as any).contenu,
    articles_auscgie: (r.payload as any).articles_auscgie || [],
    forme_juridique: (r.payload as any).forme_juridique,
    page: (r.payload as any).page || 0,
    source: (r.payload as any).source,
  }));
}

// ── CLI ──
if (require.main === module) {
  const chunksFile = path.join(__dirname, "../../../data/chunks/all-chunks.json");
  if (!fs.existsSync(chunksFile)) {
    console.error("❌ Fichier all-chunks.json introuvable. Lancez d'abord le parser :");
    console.error("   npx tsx src/services/rag/pdf-parser.ts");
    process.exit(1);
  }
  indexChunks(chunksFile).catch(console.error);
}
