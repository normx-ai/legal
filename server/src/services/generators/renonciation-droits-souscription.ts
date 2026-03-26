import { formatNumber, numberToWords } from "./utils";

export function prepareRenonciationDroitsSouscriptionData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    rc_numero: formData.rc_numero || "",
    actionnaire_civilite: formData.actionnaire_civilite || "Monsieur",
    actionnaire_nom: formData.actionnaire_nom || "",
    actionnaire_prenom: formData.actionnaire_prenom || "",
    actionnaire_adresse: formData.actionnaire_adresse || "",
    nombre_actions_detenues: formData.nombre_actions_detenues || 0,
    nombre_actions_renoncees: formData.nombre_actions_renoncees || 0,
    date_age: formData.date_age || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
