import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template Pouvoir AG (procuration).
 */
export function preparePouvoirAgData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const mandantParts = formData.mandant_parts as number;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    mandant_civilite: formData.mandant_civilite || "Monsieur",
    mandant_nom: formData.mandant_nom || "",
    mandant_prenom: formData.mandant_prenom || "",
    mandant_adresse: formData.mandant_adresse || "",
    mandant_parts: formatNumber(mandantParts),

    mandataire_civilite: formData.mandataire_civilite || "Monsieur",
    mandataire_nom: formData.mandataire_nom || "",
    mandataire_prenom: formData.mandataire_prenom || "",
    mandataire_adresse: formData.mandataire_adresse || "",

    type_ag: formData.type_ag || "ordinaire",
    is_ago: (formData.type_ag || "ordinaire") === "ordinaire",
    is_age: (formData.type_ag || "ordinaire") === "extraordinaire",

    date_ag: formData.date_ag,
    heure_ag: formData.heure_ag,
    lieu_ag: formData.lieu_ag,

    ordre_du_jour: formData.ordre_du_jour || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
