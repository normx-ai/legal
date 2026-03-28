import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function preparePvAgoSaData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const valeurNominaleAction = formData.valeur_nominale_action as number || 10000;
  const nombreActions = capital / valeurNominaleAction;
  const resultatMontant = formData.resultat_montant as number || 0;
  const decisions = formData.decisions_selectionnees || [];

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

    // Exercice
    exercice_clos_le: formData.exercice_clos_le || "",

    // Résultat
    resultat_montant: formatNumber(resultatMontant),
    resultat_montant_lettres: numberToWords(resultatMontant),
    resultat_type: formData.resultat_type || "bénéficiaire",
    is_beneficiaire: (formData.resultat_type || "bénéficiaire") === "bénéficiaire",
    is_deficitaire: formData.resultat_type === "déficitaire",
    affectation_details: formData.affectation_details || "",

    // CAC
    has_commissaire: !!formData.has_commissaire,
    commissaire_titulaire_nom: formData.commissaire_titulaire_nom || "",
    commissaire_titulaire_adresse: formData.commissaire_titulaire_adresse || "",
    commissaire_suppleant_nom: formData.commissaire_suppleant_nom || "",
    commissaire_suppleant_adresse: formData.commissaire_suppleant_adresse || "",
    commissaire_duree: formData.commissaire_duree || "trois exercices",

    // Administrateurs
    administrateur_ratifie_nom: formData.administrateur_ratifie_nom || "",
    administrateur_ratifie_date: formData.administrateur_ratifie_date || "",
    administrateurs_nommes: formData.administrateurs_nommes || "",
    administrateurs_renouveles: formData.administrateurs_renouveles || "",
    administrateur_revoque_nom: formData.administrateur_revoque_nom || "",
    duree_mandat_administrateur: formData.duree_mandat_administrateur || "",
    indemnite_fonction_montant: formData.indemnite_fonction_montant ? formatNumber(formData.indemnite_fonction_montant as number || 0) : "",

    // Conventions
    has_conventions: !!formData.has_conventions,
    convention_details: formData.convention_details || "",

    // Transfert siège
    ancien_siege: formData.ancien_siege || "",
    nouveau_siege: formData.nouveau_siege || "",
    date_transfert_siege: formData.date_transfert_siege || "",

    // Decisions conditionnelles
    has_approbation_comptes: decisions.includes("approbation_comptes"),
    has_affectation_resultats: decisions.includes("affectation_resultats"),
    has_ratification_administrateur: decisions.includes("ratification_administrateur"),
    has_nomination_administrateurs: decisions.includes("nomination_administrateurs"),
    has_renouvellement_administrateurs: decisions.includes("renouvellement_administrateurs"),
    has_revocation_administrateur: decisions.includes("revocation_administrateur"),
    has_nomination_cac: decisions.includes("nomination_cac"),
    has_indemnite_fonction: decisions.includes("indemnite_fonction"),
    has_renouvellement_cac: decisions.includes("renouvellement_cac"),
    has_non_renouvellement_cac: decisions.includes("non_renouvellement_cac"),
    has_ratification_transfert_siege: decisions.includes("ratification_transfert_siege"),
    has_pouvoirs: decisions.includes("pouvoirs"),

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
