import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareConvocationCaData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    destinataire_civilite: formData.destinataire_civilite || "Monsieur",
    destinataire_nom: formData.destinataire_nom || "",
    destinataire_prenom: formData.destinataire_prenom || "",
    destinataire_adresse: formData.destinataire_adresse || "",
    destinataire_qualite: formData.destinataire_qualite || "administrateur",
    date_reunion: formData.date_reunion,
    heure_reunion: formData.heure_reunion || "",
    lieu_reunion: formData.lieu_reunion,
    ordre_du_jour: formData.ordre_du_jour || "",
    president_nom: formData.president_nom || "",
    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
