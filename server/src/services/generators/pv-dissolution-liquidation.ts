import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function preparePvDissolutionLiquidationData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const valeurNominaleAction = formData.valeur_nominale_action as number || 10000;
  const nombreActions = capital / valeurNominaleAction;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    valeur_nominale_action: formatNumber(valeurNominaleAction),
    nombre_actions_total: formatNumber(nombreActions),

    // AG
    date_ag: formData.date_ag || "",
    date_ag_lettres: formData.date_ag_lettres || "",
    heure_ag: formData.heure_ag || "",
    heure_ag_lettres: formData.heure_ag_lettres || "",
    lieu_ag: formData.lieu_ag || "",
    convoque_par: formData.convoque_par || "le président du conseil d'administration",

    // Bureau
    president_civilite: formData.president_civilite || "Monsieur",
    president_nom: formData.president_nom || "",
    president_prenom: formData.president_prenom || "",
    secretaire_nom: formData.secretaire_nom || "",
    scrutateur1_nom: formData.scrutateur1_nom || "",
    scrutateur2_nom: formData.scrutateur2_nom || "",

    // Quorum
    nombre_actions_presentes: formData.nombre_actions_presentes || "",
    pourcentage_capital: formData.pourcentage_capital || "",

    // Dissolution
    date_dissolution: formData.date_dissolution || "",
    date_dissolution_lettres: formData.date_dissolution_lettres || "",
    motif_dissolution: formData.motif_dissolution || "la cessation des activités de la société",

    // Liquidateur
    liquidateur_civilite: formData.liquidateur_civilite || "Monsieur",
    liquidateur_nom: formData.liquidateur_nom || "",
    liquidateur_prenom: formData.liquidateur_prenom || "",
    liquidateur_adresse: formData.liquidateur_adresse || "",
    liquidateur_duree: formData.liquidateur_duree || "",
    liquidateur_remuneration: formData.liquidateur_remuneration ? formatNumber(formData.liquidateur_remuneration as number) : "",

    // Durée société
    duree_initiale: formData.duree_initiale || "",
    date_creation: formData.date_creation || "",
    duree_reduite: formData.duree_reduite || "",
    date_expiration: formData.date_expiration || "",
    article_duree: formData.article_duree || "",

    // Siège liquidation
    siege_liquidation: formData.siege_liquidation || formData.siege_social || "",

    // Continuation affaires
    has_continuation_affaires: !!formData.has_continuation_affaires,
    has_cession_globale: !!formData.has_cession_globale,
    cession_societe_nom: formData.cession_societe_nom || "",
    cession_montant: formData.cession_montant ? formatNumber(formData.cession_montant as number) : "",
    cession_passif: formData.cession_passif ? formatNumber(formData.cession_passif as number) : "",

    // Rapport liquidateur
    rapport_liquidateur: formData.rapport_liquidateur || "",

    // Pouvoirs CA
    has_dissolution_ca: !!formData.has_dissolution_ca,
    has_maintien_ca: !!formData.has_maintien_ca,
    has_limitation_ca: !!formData.has_limitation_ca,
    limitation_ca_details: formData.limitation_ca_details || "",

    // Tribunal
    tribunal_lieu: formData.tribunal_lieu || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
