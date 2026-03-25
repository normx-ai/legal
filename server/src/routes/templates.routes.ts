import { Router, Response } from "express";
import ohadaRules from "../../data/ohada-rules.json";

export const templatesRoutes = Router();

// GET /templates — Catalogue des modèles disponibles
templatesRoutes.get("/", (_req, res: Response) => {
  const templates = [];

  // Templates par forme juridique
  for (const [key, rule] of Object.entries(ohadaRules.rules)) {
    const r = rule as Record<string, unknown>;
    const documents = r.documents as string[];
    for (const docId of documents) {
      templates.push({
        id: `${key}-${docId}`,
        forme: r.sigle as string,
        label: `${formatDocLabel(docId)} — ${r.label as string}`,
        available: (key === "sarl" && docId === "statuts") || (key === "sa" && docId === "statuts"),
      });
    }
  }

  // SA avec Administrateur Général (sous-type de SA)
  templates.push({
    id: "sa-ag-statuts",
    forme: "SA AG",
    label: "Statuts — Société Anonyme avec Administrateur Général",
    available: true,
  });

  // SA avec Conseil d'Administration (sous-type de SA)
  templates.push({
    id: "sa-ca-statuts",
    forme: "SA CA",
    label: "Statuts — Société Anonyme avec Conseil d'Administration",
    available: true,
  });

  // SA Unipersonnelle (sous-type de SA)
  templates.push({
    id: "sa-uni-statuts",
    forme: "SA UNI",
    label: "Statuts — Société Anonyme Unipersonnelle",
    available: true,
  });

  // SAS (Société par Actions Simplifiée)
  templates.push({
    id: "sas-statuts",
    forme: "SAS",
    label: "Statuts — Société par Actions Simplifiée",
    available: true,
  });

  // SASU (SAS Unipersonnelle)
  templates.push({
    id: "sasu-statuts",
    forme: "SASU",
    label: "Statuts — Société par Actions Simplifiée Unipersonnelle",
    available: true,
  });

  // GIE (Groupement d'Intérêt Économique)
  templates.push({
    id: "gie-convention",
    forme: "GIE",
    label: "Convention constitutive — Groupement d'Intérêt Économique",
    available: true,
  });

  // Société en Participation
  templates.push({
    id: "ste-part-statuts",
    forme: "STE PART",
    label: "Statuts — Société en Participation",
    available: true,
  });

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
