import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareAvisCacConventionsSaData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    commissaire_nom: formData.commissaire_nom || "",
    commissaire_adresse: formData.commissaire_adresse || "",
    convention_description: formData.convention_description || "",
    convention_forme: formData.convention_forme || "convention signée entre les parties",
    exercice: formData.exercice || "",
    has_conventions_anterieures: !!formData.has_conventions_anterieures,
    conventions_anterieures: formData.conventions_anterieures || "",
    signataire_nom: formData.signataire_nom || "",
    signataire_qualite: formData.signataire_qualite || "L'administrateur Général",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
