import { formatNumber, numberToWords } from "./utils";

export function prepareLettreInfoCaConventionsData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    personnes_concernees: formData.personnes_concernees || "",
    nature_objet_convention: formData.nature_objet_convention || "",
    modalites_convention: formData.modalites_convention || "",
    duree_convention: formData.duree_convention || "",
    signataire_nom: formData.signataire_nom || "",
    signataire_qualite: formData.signataire_qualite || "Le Conseil d'administration",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
