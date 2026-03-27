import { formatNumber, numberToWords } from "./utils";

export function prepareRequeteProrogationAgoData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    rc_numero: formData.rc_numero || "",
    requerant_civilite: formData.requerant_civilite || "Monsieur",
    requerant_nom: formData.requerant_nom || "",
    requerant_prenom: formData.requerant_prenom || "",
    requerant_qualite: formData.requerant_qualite || "",
    tribunal: formData.tribunal || "",
    date_cloture_exercice: formData.date_cloture_exercice || "",
    delai_legal: formData.delai_legal || "six mois",
    date_limite_legale: formData.date_limite_legale || "",
    duree_prorogation_demandee: formData.duree_prorogation_demandee || "",
    motif_prorogation: formData.motif_prorogation || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
