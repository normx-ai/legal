import { formatNumber, numberToWords } from "./utils";

export function prepareLettreConsultationGeranceData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const nombrePartsTotal = formData.nombre_parts_total as number;
  const seuilOrdinaire = Math.floor(nombrePartsTotal / 2) + 1;
  const seuilExtraordinaire = Math.ceil((nombrePartsTotal * 3) / 4);
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SARL",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    destinataire_civilite: formData.destinataire_civilite || "Monsieur",
    destinataire_nom: formData.destinataire_nom || "",
    destinataire_prenom: formData.destinataire_prenom || "",
    destinataire_adresse: formData.destinataire_adresse || "",
    article_statuts: formData.article_statuts || "...",
    resolutions: formData.resolutions || "",
    nombre_parts_total: formatNumber(nombrePartsTotal),
    seuil_ordinaire: formatNumber(seuilOrdinaire),
    seuil_extraordinaire: formatNumber(seuilExtraordinaire),
    delai_reponse: formData.delai_reponse || "15",
    date_limite_reponse: formData.date_limite_reponse || "",
    gerant_civilite: formData.gerant_civilite || "Monsieur",
    gerant_nom: formData.gerant_nom || "",
    gerant_prenom: formData.gerant_prenom || "",
    pieces_jointes: formData.pieces_jointes || "",
    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
