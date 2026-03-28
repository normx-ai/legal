import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareConvocationCacData(formData: FormData): TemplateData {
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
    type_reunion: formData.type_reunion || "ago",
    type_reunion_label: formData.type_reunion_label || "assemblée générale",
    date_reunion: formData.date_reunion,
    heure_reunion: formData.heure_reunion,
    lieu_reunion: formData.lieu_reunion,
    ordre_du_jour: formData.ordre_du_jour || "",
    signataire_fonction: formData.signataire_fonction || "Le Gérant",
    signataire_nom: formData.signataire_nom || "",
    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
