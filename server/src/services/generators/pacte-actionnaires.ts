import { formatNumber, numberToWords } from "./utils";

export function preparePacteActionnairesData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    rc_numero: formData.rc_numero || "",
    objet_social: formData.objet_social || "",
    signataires: formData.signataires || [],
    dirigeants: formData.dirigeants || [],
    duree_pacte: formData.duree_pacte || "",
    relations_associes: formData.relations_associes || "",
    composition_organes: formData.composition_organes || "",
    conduite_affaires: formData.conduite_affaires || "",
    acces_capital: formData.acces_capital || "",
    transmission_titres: formData.transmission_titres || "",
    clause_arbitrage: formData.clause_arbitrage || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
