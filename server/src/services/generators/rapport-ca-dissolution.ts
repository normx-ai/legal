import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareRapportCaDissolutionData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    // AG
    date_ag: formData.date_ag || "",
    date_ag_lettres: formData.date_ag_lettres || "",

    // Président CA
    president_ca_civilite: formData.president_ca_civilite || "Monsieur",
    president_ca_nom: formData.president_ca_nom || "",
    president_ca_prenom: formData.president_ca_prenom || "",

    // Dissolution
    date_dissolution: formData.date_dissolution || "",
    motif_dissolution: formData.motif_dissolution || "",

    // Modification article durée
    article_duree: formData.article_duree || "",
    duree_initiale: formData.duree_initiale || "",
    date_creation: formData.date_creation || "",
    duree_reduite: formData.duree_reduite || "",
    date_expiration: formData.date_expiration || "",

    // Administrateur signataire
    administrateur_nom: formData.administrateur_nom || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
