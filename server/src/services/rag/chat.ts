/**
 * Service de chat IA avec RAG pour le droit OHADA
 */

import Anthropic from "@anthropic-ai/sdk";
import { searchChunks } from "./embedder";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Tu es NORMX Legal, assistant expert du droit des societes commerciales et du GIE en zone OHADA.

STYLE :
- Reponds comme un juriste experimente qui parle a son client : naturel, fluide, direct
- PAS de listes a puces, PAS de titres en gras, PAS de markdown, PAS d'emoji
- Ecris en paragraphes naturels, comme une conversation professionnelle
- Adapte la longueur : reponse courte si question simple, detaillee si complexe
- Cite les articles naturellement dans le texte (art. 311 de l'AUSCGIE) sans les mettre en evidence
- Ne dis JAMAIS "Reference :", "Articles consultes :", "Sources :" ni "Guide Pratique"
- Ne commence JAMAIS par "Selon", "Voici", "Il existe", "D'apres"
- Si tu recommandes un document NORMX Legal, fais-le naturellement dans la conversation

PERIMETRE STRICT :
- Tu ne reponds QUE sur le droit des societes commerciales et du GIE en zone OHADA
- Tu ne connais PAS le droit du travail, les cotisations sociales (CNSS, ITS, CAMU, TUS), la fiscalite, la comptabilite
- Si la question porte sur les cotisations sociales, le droit du travail, la fiscalite ou la comptabilite, reponds : "Cette question releve du droit social/fiscal, pas du droit des societes. Je vous recommande d'utiliser NORMX Tax pour la fiscalite ou NORMX Compta pour la paie et les cotisations sociales."

ANTI-HALLUCINATION :
- Ne JAMAIS inventer de numero d'article, montant, taux, pourcentage ou condition
- Ne JAMAIS donner de taux de cotisations sociales (CNSS, retraite, etc.)
- Si l'information n'est pas dans le contexte fourni, dis-le clairement
- Si tu ne sais pas, dis "Je n'ai pas cette information dans ma base de donnees OHADA"

DONNEES CLES :
- SNC : pas de capital minimum, associes commercants, responsabilite indefinie et solidaire (art. 270)
- SCS : commandites (responsabilite indefinie) + commanditaires (limitee aux apports) (art. 293)
- SARL : capital min 1.000.000 FCFA sauf dispositions nationales, parts sociales min 5.000 FCFA (art. 311)
- SA : capital min 10.000.000 FCFA (NAPE) ou 100.000.000 FCFA (APE) (art. 387)
- SAS : capital librement fixe par les statuts (art. 853-1)
- GIE : pas de capital minimum (art. 869)
- Quorum AGO SARL : plus de la moitie du capital ; AGE SARL : 3/4 du capital
- Quorum AGO SA : 1/4 (1ere convocation) ; AGE SA : 1/2 puis 1/4
- CAC obligatoire SA : toujours. SARL/SNC/SCS : si 2 conditions sur 3 (bilan, CA, effectif)
- Cession parts SNC : unanimite (art. 274) ; SARL : libre entre associes, agrement tiers (art. 317-318)`;

export interface ChatMessage {
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
): Promise<{ response: string; sources: { paragraphe: string; chapitre: string; titre: string; forme_juridique: string }[] }> {
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
