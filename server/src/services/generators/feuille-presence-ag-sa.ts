import { formatNumber, numberToWords } from "./utils";

export function prepareFeuillePresenceAgSaData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    date_ag: formData.date_ag || "",
    type_ag: formData.type_ag || "AGO",
    actionnaires: formData.actionnaires || [],
    nombre_actionnaires_presents: formData.nombre_actionnaires_presents || 0,
    nombre_actions_presentes: formData.nombre_actions_presentes || 0,
    scrutateur1_nom: formData.scrutateur1_nom || "",
    scrutateur2_nom: formData.scrutateur2_nom || "",
  };
}
