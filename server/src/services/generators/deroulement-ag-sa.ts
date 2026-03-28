import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareDeroulementAgSaData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    type_ag: formData.type_ag || "ordinaire",
    president_nom: formData.president_nom || "",
    president_qualite: formData.president_qualite || "pr\u00e9sident du CA",
    scrutateur1_nom: formData.scrutateur1_nom || "",
    scrutateur2_nom: formData.scrutateur2_nom || "",
    secretaire_nom: formData.secretaire_nom || "",
    nombre_actions_presentes: formData.nombre_actions_presentes || "",
    pourcentage_capital: formData.pourcentage_capital || "",
    heure_reunion: formData.heure_reunion || "",
    documents: formData.documents || "",
    ordre_du_jour: formData.ordre_du_jour || "",
    questions_diverses: formData.questions_diverses || "",
    heure_levee: formData.heure_levee || "",
    date_reunion: formData.date_reunion || new Date().toLocaleDateString("fr-FR"),
  };
}
