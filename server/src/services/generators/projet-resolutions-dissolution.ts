import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareProjetResolutionsDissolutionData(formData: FormData): TemplateData {
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

    // Dissolution
    date_dissolution: formData.date_dissolution || "",
    date_dissolution_lettres: formData.date_dissolution_lettres || "",

    // Modification article durée
    article_duree: formData.article_duree || "",
    duree_initiale: formData.duree_initiale || "",
    date_creation: formData.date_creation || "",
    duree_reduite: formData.duree_reduite || "",
    date_expiration: formData.date_expiration || "",

    // Liquidateur
    liquidateur_civilite: formData.liquidateur_civilite || "Monsieur",
    liquidateur_nom: formData.liquidateur_nom || "",
    liquidateur_prenom: formData.liquidateur_prenom || "",
    liquidateur_adresse: formData.liquidateur_adresse || "",
    liquidateur_date_debut: formData.liquidateur_date_debut || "",
    liquidateur_duree: formData.liquidateur_duree || "",
    liquidateur_remuneration: formData.liquidateur_remuneration ? formatNumber(formData.liquidateur_remuneration as number) : "",

    // Siège liquidation
    siege_liquidation: formData.siege_liquidation || formData.siege_social || "",

    // Pouvoirs CA
    has_dissolution_ca: !!formData.has_dissolution_ca,
    has_maintien_ca: !!formData.has_maintien_ca,
    has_limitation_ca: !!formData.has_limitation_ca,
    limitation_ca_details: formData.limitation_ca_details || "",

    // Continuation affaires
    has_continuation_affaires: !!formData.has_continuation_affaires,

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
