import { formatNumber, numberToWords } from "./utils";

export function prepareActeCessionActionsData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const prix_par_action = formData.prix_par_action as number;
  const nombre_actions_cedees = formData.nombre_actions_cedees as number;
  const prix_total = prix_par_action * nombre_actions_cedees;

  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    rccm: formData.rccm || "",
    cedant_civilite: formData.cedant_civilite || "Monsieur",
    cedant_nom: formData.cedant_nom || "",
    cedant_prenom: formData.cedant_prenom || "",
    cedant_adresse: formData.cedant_adresse || "",
    cedant_representant: formData.cedant_representant || "",
    cessionnaire_civilite: formData.cessionnaire_civilite || "Monsieur",
    cessionnaire_nom: formData.cessionnaire_nom || "",
    cessionnaire_prenom: formData.cessionnaire_prenom || "",
    cessionnaire_adresse: formData.cessionnaire_adresse || "",
    cessionnaire_representant: formData.cessionnaire_representant || "",
    nombre_actions_cedees: formatNumber(nombre_actions_cedees),
    nombre_actions_cedees_lettres: numberToWords(nombre_actions_cedees),
    prix_par_action: formatNumber(prix_par_action),
    prix_par_action_lettres: numberToWords(prix_par_action),
    prix_total: formatNumber(prix_total),
    prix_total_lettres: numberToWords(prix_total),
    has_agrement: formData.has_agrement || false,
    date_agrement: formData.date_agrement || "",
    organe_agrement: formData.organe_agrement || "conseil d'administration",
    article_agrement: formData.article_agrement || "",
    nombre_originaux: formData.nombre_originaux || 6,
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
