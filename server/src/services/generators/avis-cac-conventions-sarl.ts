import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareAvisCacConventionsSarlData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SARL",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    commissaire_nom: formData.commissaire_nom || "",
    commissaire_adresse: formData.commissaire_adresse || "",
    date_convention: formData.date_convention || "",
    parties_convention: formData.parties_convention || "entre la société et moi-même",
    convention_description: formData.convention_description || "",
    has_conventions_anterieures: !!formData.has_conventions_anterieures,
    conventions_anterieures: formData.conventions_anterieures || "",
    exercice: formData.exercice || "",
    signataire_nom: formData.signataire_nom || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
