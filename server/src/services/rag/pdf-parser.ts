/**
 * Parse les PDFs du Guide Pratique OHADA en chunks JSON structurés.
 * Utilise pdf-parse pour le texte, et Claude API pour l'OCR des pages scannées.
 *
 * Usage : npx tsx src/services/rag/pdf-parser.ts
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

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

// ── Mapping fichiers → métadonnées ──
const PDF_CONFIG: Record<string, { chapitre: string; forme_juridique: string }> = {
  "1.pdf": { chapitre: "Généralités", forme_juridique: "TOUTES" },
  "snc.pdf": { chapitre: "SNC", forme_juridique: "SNC" },
  "scs.pdf": { chapitre: "SCS", forme_juridique: "SCS" },
  "sarl (1).pdf": { chapitre: "SARL", forme_juridique: "SARL" },
};

/**
 * Estimer le nombre de pages d'un PDF (approximation via taille fichier)
 */
function estimatePages(filePath: string): number {
  const stats = fs.statSync(filePath);
  // ~100Ko par page pour un PDF scanné
  return Math.max(1, Math.ceil(stats.size / 100000));
}

/**
 * Extraire le texte d'un PDF scanné via Claude API (OCR haute qualité)
 * Envoie le PDF entier à Claude pour extraction page par page
 */
async function extractTextWithClaude(filePath: string, startPage: number, endPage: number): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");
  const mediaType = "application/pdf";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: `Extrais fidèlement TOUT le texte des pages ${startPage} à ${endPage} de ce document PDF.

IMPORTANT :
- Reproduis le texte EXACTEMENT comme il apparaît (orthographe, ponctuation, accents)
- Conserve les numéros de paragraphe (§1100, §1101, etc.)
- Conserve les titres, sous-titres, sections
- Pour les tableaux, reproduis-les en format structuré
- Indique les références d'articles (art. 270, art. 7, etc.)
- Sépare chaque paragraphe numéroté par "---CHUNK---"
- Format de sortie pour chaque chunk :
  §NUMERO: [numéro du paragraphe]
  TITRE: [titre de la section]
  CONTENU: [texte complet du paragraphe]
  ARTICLES: [liste des articles AUSCGIE cités, séparés par des virgules]
  ---CHUNK---

Ne résume pas, ne paraphrase pas. Reproduis fidèlement.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "";
}

/**
 * Parse le texte extrait en chunks structurés
 */
function parseChunks(
  rawText: string,
  chapitre: string,
  formeJuridique: string,
  source: string
): OhadaChunk[] {
  const chunks: OhadaChunk[] = [];
  const rawChunks = rawText.split("---CHUNK---").filter((c) => c.trim());

  for (const raw of rawChunks) {
    const lines = raw.trim().split("\n");
    let paragraphe = "";
    let titre = "";
    let contenu = "";
    let articles: string[] = [];
    let currentField = "";

    for (const line of lines) {
      if (line.startsWith("§NUMERO:") || line.startsWith("§NUMERO :")) {
        paragraphe = line.replace(/§NUMERO\s*:\s*/, "").trim();
        currentField = "numero";
      } else if (line.startsWith("TITRE:") || line.startsWith("TITRE :")) {
        titre = line.replace(/TITRE\s*:\s*/, "").trim();
        currentField = "titre";
      } else if (line.startsWith("CONTENU:") || line.startsWith("CONTENU :")) {
        contenu = line.replace(/CONTENU\s*:\s*/, "").trim();
        currentField = "contenu";
      } else if (line.startsWith("ARTICLES:") || line.startsWith("ARTICLES :")) {
        const artStr = line.replace(/ARTICLES\s*:\s*/, "").trim();
        articles = artStr
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a);
        currentField = "articles";
      } else if (currentField === "contenu") {
        contenu += "\n" + line;
      }
    }

    if (contenu.trim()) {
      const id = `${chapitre.toLowerCase()}-${paragraphe || chunks.length + 1}`;
      chunks.push({
        id,
        paragraphe: paragraphe || String(chunks.length + 1),
        chapitre,
        section: titre ? titre.split(" - ")[0] || titre : "Général",
        titre: titre || "Sans titre",
        contenu: contenu.trim(),
        articles_auscgie: articles,
        forme_juridique: formeJuridique,
        page: 0,
        source,
      });
    }
  }

  return chunks;
}

/**
 * Fallback : découper le texte brut (pdf-parse) en chunks par paragraphe §
 */
function parseRawTextToChunks(
  text: string,
  chapitre: string,
  formeJuridique: string,
  source: string
): OhadaChunk[] {
  const chunks: OhadaChunk[] = [];

  // Découper par numéros de paragraphe §XXXX
  const paragraphPattern = /(\d{4}(?:-\d+)?)\s+(.*?)(?=\n\d{4}(?:-\d+)?\s|\n*$)/gs;
  let match;

  while ((match = paragraphPattern.exec(text)) !== null) {
    const paragraphe = match[1];
    const contenu = match[2].trim();

    if (contenu.length < 20) continue;

    // Extraire les articles cités
    const articleRefs: string[] = [];
    const artPattern = /art\.\s*(\d+(?:-\d+)?)/gi;
    let artMatch;
    while ((artMatch = artPattern.exec(contenu)) !== null) {
      articleRefs.push(artMatch[1]);
    }

    // Détecter le titre (première ligne en majuscules ou avant le premier point)
    const firstLine = contenu.split("\n")[0];
    const titre = firstLine.length < 100 ? firstLine : `§${paragraphe}`;

    const id = `${chapitre.toLowerCase()}-${paragraphe}`;
    chunks.push({
      id,
      paragraphe,
      chapitre,
      section: titre,
      titre,
      contenu,
      articles_auscgie: [...new Set(articleRefs)],
      forme_juridique: formeJuridique,
      page: 0,
      source,
    });
  }

  // Si aucun paragraphe numéroté trouvé, découper en blocs de ~1000 chars
  if (chunks.length === 0) {
    const sentences = text.split(/\n\n+/);
    let currentChunk = "";
    let chunkIdx = 0;

    for (const sentence of sentences) {
      currentChunk += sentence + "\n\n";
      if (currentChunk.length > 1000) {
        chunkIdx++;
        const articleRefs: string[] = [];
        const artPattern = /art\.\s*(\d+(?:-\d+)?)/gi;
        let artMatch;
        while ((artMatch = artPattern.exec(currentChunk)) !== null) {
          articleRefs.push(artMatch[1]);
        }

        chunks.push({
          id: `${chapitre.toLowerCase()}-block-${chunkIdx}`,
          paragraphe: String(chunkIdx),
          chapitre,
          section: "Général",
          titre: `Bloc ${chunkIdx}`,
          contenu: currentChunk.trim(),
          articles_auscgie: [...new Set(articleRefs)],
          forme_juridique: formeJuridique,
          page: 0,
          source,
        });
        currentChunk = "";
      }
    }

    if (currentChunk.trim().length > 50) {
      chunkIdx++;
      chunks.push({
        id: `${chapitre.toLowerCase()}-block-${chunkIdx}`,
        paragraphe: String(chunkIdx),
        chapitre,
        section: "Général",
        titre: `Bloc ${chunkIdx}`,
        contenu: currentChunk.trim(),
        articles_auscgie: [],
        forme_juridique: formeJuridique,
        page: 0,
        source,
      });
    }
  }

  return chunks;
}

/**
 * Pipeline principal : parse tous les PDFs
 */
async function main() {
  const pdfDir = path.join(__dirname, "../../../../pdf-a-traiter");
  const outputDir = path.join(__dirname, "../../../data/chunks");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allChunks: OhadaChunk[] = [];
  const files = fs.readdirSync(pdfDir).filter((f) => f.endsWith(".pdf"));

  console.log(`\n📚 Parsing ${files.length} PDFs du Guide Pratique OHADA...\n`);

  for (const file of files) {
    const filePath = path.join(pdfDir, file);
    const config = PDF_CONFIG[file] || { chapitre: file.replace(".pdf", "").toUpperCase(), forme_juridique: "TOUTES" };

    console.log(`📄 ${file} → ${config.chapitre}`);

    try {
      const totalPages = estimatePages(filePath);
      console.log(`   📖 ~${totalPages} pages estimées, utilisation de Claude API pour OCR...`);

      // Envoyer le PDF entier à Claude (les PDFs sont supportés directement)
      const ocrText = await extractTextWithClaude(filePath, 1, totalPages);
      const chunks = parseChunks(ocrText, config.chapitre, config.forme_juridique, file);

      if (chunks.length === 0) {
        // Fallback : essayer le parsing brut
        const rawChunks = parseRawTextToChunks(ocrText, config.chapitre, config.forme_juridique, file);
        console.log(`   📦 ${rawChunks.length} chunks (fallback)`);
        allChunks.push(...rawChunks);
      } else {
        console.log(`   📦 ${chunks.length} chunks extraits`);
        allChunks.push(...chunks);
      }
    } catch (err) {
      console.error(`   ❌ Erreur parsing ${file}:`, (err as Error).message);
    }

    // Sauvegarder par fichier
    const fileChunks = allChunks.filter((c) => c.source === file);
    const outputFile = path.join(outputDir, `${config.chapitre.toLowerCase()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(fileChunks, null, 2), "utf-8");
    console.log(`   💾 Sauvegardé: ${outputFile} (${fileChunks.length} chunks)\n`);
  }

  // Sauvegarder tout dans un fichier consolidé
  const consolidatedFile = path.join(outputDir, "all-chunks.json");
  fs.writeFileSync(consolidatedFile, JSON.stringify(allChunks, null, 2), "utf-8");
  console.log(`\n✅ Total: ${allChunks.length} chunks sauvegardés dans ${consolidatedFile}`);
}

main().catch(console.error);
