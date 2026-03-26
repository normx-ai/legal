import { formatNumber, numberToWords } from "./utils";

export function prepareActeCessionPartsData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const prix_cession = formData.prix_cession as number;
  const valeur_nominale = formData.valeur_nominale as number;
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
    cedant_parts: formData.cedant_parts || 0,
    cessionnaire_civilite: formData.cessionnaire_civilite || "Monsieur",
    cessionnaire_nom: formData.cessionnaire_nom || "",
    cessionnaire_prenom: formData.cessionnaire_prenom || "",
    cessionnaire_adresse: formData.cessionnaire_adresse || "",
    nombre_parts_cedees: formData.nombre_parts_cedees || 0,
    nombre_parts_cedees_lettres: numberToWords(formData.nombre_parts_cedees || 0),
    prix_cession: formatNumber(prix_cession),
    prix_cession_lettres: numberToWords(prix_cession),
    valeur_nominale: formatNumber(valeur_nominale),
    valeur_nominale_lettres: numberToWords(valeur_nominale),
    numero_parts_de: formData.numero_parts_de || "",
    numero_parts_a: formData.numero_parts_a || "",
    date_agrement: formData.date_agrement || "",
    article_capital: formData.article_capital || "",
    nombre_parts_total: formData.nombre_parts_total || 0,
    nombre_originaux: formData.nombre_originaux || 6,
    has_agrement: formData.has_agrement || false,
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
