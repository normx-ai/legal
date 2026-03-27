/**
 * Service d'embedding (Voyage AI) et d'indexation dans Qdrant
 * Utilise voyage-multilingual-2 (1024 dims) - optimisé français
 *
 * Usage : npx tsx src/services/rag/embedder.ts
 */

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import fs from "fs";
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "ohada_guide";
const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-multilingual-2";
const VECTOR_SIZE = 1024;

const qdrant = new QdrantClient({ url: QDRANT_URL });

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

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
  usage: { total_tokens: number };
}

/**
 * Appelle l'API Voyage AI pour générer des embeddings
 */
async function callVoyageApi(input: string[]): Promise<VoyageResponse> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY non configurée. Ajoutez-la dans server/.env");
  }

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input, model: VOYAGE_MODEL }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Voyage AI API error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<VoyageResponse>;
}

/**
 * Génère un embedding pour un texte
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const truncated = text.substring(0, 8000);
  const result = await callVoyageApi([truncated]);
  return result.data[0].embedding;
}

/**
 * Génère des embeddings par lot (max 128 textes)
 */
async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const truncated = texts.map((t) => t.substring(0, 8000));
  const result = await callVoyageApi(truncated);
  return result.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/**
 * Créer la collection Qdrant
 */
async function ensureCollection() {
  try {
    await qdrant.getCollection(COLLECTION_NAME);
    console.log(`✅ Collection "${COLLECTION_NAME}" existe déjà`);
  } catch {
    console.log(`📦 Création de la collection "${COLLECTION_NAME}"...`);
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });

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
    console.log(`✅ Collection + index créés`);
  }
}

/**
 * Hash pour convertir chunk_id en entier positif pour Qdrant
 */
function hashId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2147483647 || 1;
}

/**
 * Indexer les chunks dans Qdrant
 */
async function indexChunks(chunksFile: string) {
  const chunks: OhadaChunk[] = JSON.parse(fs.readFileSync(chunksFile, "utf-8"));
  console.log(`\n📚 Indexation de ${chunks.length} chunks dans Qdrant...`);

  await ensureCollection();

  const batchSize = 20; // Voyage AI supporte max 128 par appel
  let totalTokens = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => `${c.titre}\n${c.contenu}`);

    try {
      const embeddings = await generateEmbeddingsBatch(texts);
      totalTokens += texts.reduce((s, t) => s + t.length, 0);

      const points = batch.map((chunk, idx) => ({
        id: hashId(chunk.id),
        vector: embeddings[idx],
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
      }));

      await qdrant.upsert(COLLECTION_NAME, { points });
      console.log(`   ✅ Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} (${batch.length} chunks)`);
    } catch (err) {
      console.error(`   ❌ Erreur lot ${Math.floor(i / batchSize) + 1}:`, (err as Error).message);
    }

    // Rate limiting Voyage AI
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ ${chunks.length} chunks indexés (~${(totalTokens / 1000).toFixed(0)}k chars)`);
}

/**
 * Rechercher des chunks similaires
 */
export async function searchChunks(
  query: string,
  options: { limit?: number; formeJuridique?: string; chapitre?: string } = {}
): Promise<OhadaChunk[]> {
  const { limit = 5, formeJuridique, chapitre } = options;
  const vector = await generateEmbedding(query);

  const filter: { must: { key: string; match: { value: string } }[] } = { must: [] };
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

  return results.map((r) => {
    const p = r.payload as Record<string, unknown>;
    return {
      id: p.chunk_id as string,
      paragraphe: p.paragraphe as string,
      chapitre: p.chapitre as string,
      section: p.section as string,
      titre: p.titre as string,
      contenu: p.contenu as string,
      articles_auscgie: (p.articles_auscgie as string[]) || [],
      forme_juridique: p.forme_juridique as string,
      page: (p.page as number) || 0,
      source: p.source as string,
    };
  });
}

// ── CLI ──
if (require.main === module) {
  const chunksFile = path.join(__dirname, "../../../data/chunks/all-chunks.json");
  if (!fs.existsSync(chunksFile)) {
    console.error("❌ all-chunks.json introuvable. Lancez d'abord le merge des chunks.");
    process.exit(1);
  }
  indexChunks(chunksFile).catch(console.error);
}
