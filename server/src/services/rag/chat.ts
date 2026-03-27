/**
 * Service de chat IA avec RAG pour le droit OHADA
 */

import Anthropic from "@anthropic-ai/sdk";
import { searchChunks } from "./embedder";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Tu es un assistant juridique expert en droit OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires).

Tu dois :
- Répondre aux questions sur le droit des sociétés commerciales et du GIE en zone OHADA
- Citer les articles de l'Acte Uniforme relatif au Droit des Sociétés Commerciales et du GIE (AUSCGIE)
- Recommander les documents juridiques appropriés parmi les modèles disponibles dans NORMX Legal
- Être précis sur les seuils (capital minimum, quorums, majorités, délais)
- Distinguer les règles par forme juridique (SNC, SCS, SARL, SA, SAS, GIE, etc.)

Tu as accès au Guide Pratique des Sociétés Commerciales et du GIE - OHADA comme source de référence.

Formes juridiques et leurs caractéristiques principales :
- SNC : pas de capital minimum, associés commerçants, responsabilité indéfinie et solidaire
- SCS : commandités (responsabilité indéfinie) + commanditaires (responsabilité limitée)
- SARL : capital min 1.000.000 FCFA, parts sociales de min 5.000 FCFA, 1-50 associés
- SA : capital min 10.000.000 FCFA (NAPE) ou 100.000.000 FCFA (APE), actions
- SAS : capital min 1.000.000 FCFA, grande liberté statutaire
- GIE : pas de capital minimum

Quand tu cites un article, utilise le format : "article X de l'AUSCGIE" ou "(art. X)".
Quand tu recommandes un document, indique son nom exact dans NORMX Legal.

Réponds en français. Sois concis mais complet.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatOptions {
  formeJuridique?: string;
  chapitre?: string;
}

/**
 * Envoyer un message au chat IA avec contexte RAG
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<{ response: string; sources: any[] }> {
  const lastUserMessage = messages.filter((m) => m.role === "user").pop();
  if (!lastUserMessage) throw new Error("Aucun message utilisateur");

  // Rechercher les chunks pertinents via RAG
  const relevantChunks = await searchChunks(lastUserMessage.content, {
    limit: 8,
    formeJuridique: options.formeJuridique,
    chapitre: options.chapitre,
  });

  // Construire le contexte RAG
  let ragContext = "";
  if (relevantChunks.length > 0) {
    ragContext = "\n\n--- CONTEXTE DU GUIDE PRATIQUE OHADA ---\n\n";
    for (const chunk of relevantChunks) {
      ragContext += `[§${chunk.paragraphe} - ${chunk.chapitre} - ${chunk.titre}]\n`;
      ragContext += `${chunk.contenu}\n`;
      if (chunk.articles_auscgie.length > 0) {
        ragContext += `Articles cités : ${chunk.articles_auscgie.join(", ")}\n`;
      }
      ragContext += "\n---\n\n";
    }
  }

  // Appeler Claude avec le contexte
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT + ragContext,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const responseText = textBlock ? textBlock.text : "Désolé, je n'ai pas pu générer de réponse.";

  return {
    response: responseText,
    sources: relevantChunks.map((c) => ({
      paragraphe: c.paragraphe,
      chapitre: c.chapitre,
      titre: c.titre,
      forme_juridique: c.forme_juridique,
    })),
  };
}
