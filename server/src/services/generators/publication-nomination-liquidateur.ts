import { formatNumber, numberToWords } from "./utils";

export function preparePublicationNominationLiquidateurData(formData: any): Record<string, any> {
  const capital = formData.capital as number;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    // AG
    date_ag: formData.date_ag || "",
    date_ag_lettres: formData.date_ag_lettres || "",

    // Dissolution
    date_dissolution: formData.date_dissolution || "",
    motif_dissolution: formData.motif_dissolution || "la cessation des activités de la société",

    // Liquidateur
    liquidateur_civilite: formData.liquidateur_civilite || "Monsieur",
    liquidateur_nom: formData.liquidateur_nom || "",
    liquidateur_prenom: formData.liquidateur_prenom || "",
    liquidateur_adresse: formData.liquidateur_adresse || "",

    // Siège liquidation
    siege_liquidation: formData.siege_liquidation || formData.siege_social || "",

    // Tribunal
    tribunal_lieu: formData.tribunal_lieu || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
