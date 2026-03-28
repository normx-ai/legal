import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareAvisConvocationAgSaData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const typeAg = formData.type_ag || "ordinaire";
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    type_ag: typeAg,
    type_ag_label: typeAg === "ordinaire" ? "Ordinaire" : typeAg === "extraordinaire" ? "Extraordinaire" : "Mixte",
    is_ordinaire: typeAg === "ordinaire",
    is_extraordinaire: typeAg === "extraordinaire",
    is_mixte: typeAg === "mixte",
    date_ag: formData.date_ag,
    heure_ag: formData.heure_ag,
    lieu_ag: formData.lieu_ag,
    ordre_du_jour: formData.ordre_du_jour || "",
    signataire_fonction: formData.signataire_fonction || "Le Conseil d'administration",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
