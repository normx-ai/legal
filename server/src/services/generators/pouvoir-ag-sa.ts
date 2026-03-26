import { formatNumber, numberToWords } from "./utils";

export function preparePouvoirAgSaData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    mandant_civilite: formData.mandant_civilite || "Monsieur",
    mandant_nom: formData.mandant_nom || "",
    mandant_prenom: formData.mandant_prenom || "",
    mandant_adresse: formData.mandant_adresse || "",
    mandant_nombre_actions: formData.mandant_nombre_actions || 0,
    mandant_nombre_voix: formData.mandant_nombre_voix || 0,
    mandataire_nom: formData.mandataire_nom || "",
    mandataire_prenom: formData.mandataire_prenom || "",
    mandataire_adresse: formData.mandataire_adresse || "",
    date_ag: formData.date_ag || "",
    heure_ag: formData.heure_ag || "",
    lieu_ag: formData.lieu_ag || "",
    type_ag: formData.type_ag || "AGO",
    ordre_du_jour: formData.ordre_du_jour || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
