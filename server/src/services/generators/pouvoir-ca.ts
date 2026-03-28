import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function preparePouvoirCaData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    mandant_civilite: formData.mandant_civilite || "Monsieur",
    mandant_nom: formData.mandant_nom || "",
    mandant_prenom: formData.mandant_prenom || "",
    mandant_adresse: formData.mandant_adresse || "",
    mandataire_civilite: formData.mandataire_civilite || "Monsieur",
    mandataire_nom: formData.mandataire_nom || "",
    mandataire_prenom: formData.mandataire_prenom || "",
    date_reunion: formData.date_reunion,
    heure_reunion: formData.heure_reunion,
    lieu_reunion: formData.lieu_reunion,
    ordre_du_jour: formData.ordre_du_jour || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
