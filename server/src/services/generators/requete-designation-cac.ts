import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareRequeteDesignationCacData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const valeur_estimee = formData.valeur_estimee as number || 0;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    requerant_civilite: formData.requerant_civilite || "Monsieur",
    requerant_nom: formData.requerant_nom || "",
    requerant_prenom: formData.requerant_prenom || "",
    requerant_qualite: formData.requerant_qualite || "",
    tribunal: formData.tribunal || "",
    article_reference: formData.article_reference || "",
    description_apport: formData.description_apport || "",
    nature_apport: formData.nature_apport || "",
    valeur_estimee: formatNumber(valeur_estimee),
    valeur_estimee_lettres: numberToWords(valeur_estimee),
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
