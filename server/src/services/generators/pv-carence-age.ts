import { formatNumber, numberToWords } from "./utils";

export function preparePvCarenceAgeData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    date_ag: formData.date_ag || "",
    date_ag_lettres: formData.date_ag_lettres || "",
    heure_ag: formData.heure_ag || "",
    lieu_ag: formData.lieu_ag || "",
    convoque_par: formData.convoque_par || "",
    president_civilite: formData.president_civilite || "Monsieur",
    president_nom: formData.president_nom || "",
    president_prenom: formData.president_prenom || "",
    secretaire_nom: formData.secretaire_nom || "",
    scrutateur1_nom: formData.scrutateur1_nom || "",
    scrutateur2_nom: formData.scrutateur2_nom || "",
    nombre_actions_presentes: formData.nombre_actions_presentes || 0,
    pourcentage_capital: formData.pourcentage_capital || "",
    ordre_du_jour: formData.ordre_du_jour || "",
    heure_levee: formData.heure_levee || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
