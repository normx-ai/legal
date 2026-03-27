import { formatNumber, numberToWords } from "./utils";

export function prepareDeroulementAgSarlData(formData: any): Record<string, any> {
  const capital = formData.capital as number;

  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    type_ag: formData.type_ag || "ordinaire",
    president_nom: formData.president_nom || "",
    president_civilite: formData.president_civilite || "Monsieur",
    president_qualite: formData.president_qualite || "G\u00e9rant",
    heure_reunion: formData.heure_reunion || "",
    nombre_parts_presentes: formData.nombre_parts_presentes || "",
    pourcentage_capital: formData.pourcentage_capital || "",
    quorum_type: formData.quorum_type || "50% + 1 pour AGO",
    documents_deposes: formData.documents_deposes || "",
    documents_15_jours: formData.documents_15_jours || "",
    ordre_du_jour: formData.ordre_du_jour || "",
    questions_diverses: formData.questions_diverses || "",
    heure_levee: formData.heure_levee || "",
    date_reunion: formData.date_reunion || new Date().toLocaleDateString("fr-FR"),
  };
}
