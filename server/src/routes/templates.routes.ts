import { Router, Response } from "express";
import ohadaRules from "../../data/ohada-rules.json";

export const templatesRoutes = Router();

// GET /templates — Catalogue des modèles disponibles
templatesRoutes.get("/", (_req, res: Response) => {
  const templates = [];

  // Templates par forme juridique
  for (const [key, rule] of Object.entries(ohadaRules.rules)) {
    const r = rule as any;
    for (const docId of r.documents) {
      templates.push({
        id: `${key}-${docId}`,
        forme: r.sigle,
        label: `${formatDocLabel(docId)} — ${r.label}`,
        available: key === "sarl" && docId === "statuts", // Seul statuts SARL est dispo pour l'instant
      });
    }
  }

  // Templates transversaux
  for (const doc of ohadaRules.documents_transversaux) {
    templates.push({
      id: doc.id,
      forme: "Transversal",
      label: doc.label,
      available: false,
    });
  }

  res.json({ templates });
});

function formatDocLabel(id: string): string {
  const labels: Record<string, string> = {
    "statuts": "Statuts",
    "pv-nomination-gerant": "PV de nomination du gérant",
    "registre-associes": "Registre des associés",
    "pv-ag-constitutive": "PV AG constitutive",
    "pv-nomination-dg": "PV de nomination du DG",
    "registre-actionnaires": "Registre des actionnaires",
    "pv-president": "PV de nomination du président",
    "pv-gerant": "PV de nomination du gérant",
    "convention-constitutive": "Convention constitutive",
    "declaration-activite": "Déclaration d'activité",
  };
  return labels[id] || id;
}
