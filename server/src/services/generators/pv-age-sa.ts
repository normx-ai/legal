import { formatNumber, numberToWords } from "./utils";

export function preparePvAgeSaData(formData: any): Record<string, any> {
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

    // Augmentation de capital
    montant_augmentation: formData.montant_augmentation ? formatNumber(formData.montant_augmentation as number) : "",
    nouveau_capital: formData.nouveau_capital ? formatNumber(formData.nouveau_capital as number) : "",
    nouvelles_actions: formData.nouvelles_actions ? formatNumber(formData.nouvelles_actions as number) : "",
    prime_emission: formData.prime_emission ? formatNumber(formData.prime_emission as number) : "",
    commissaire_apports_nom: formData.commissaire_apports_nom || "",
    description_apport_nature: formData.description_apport_nature || "",
    valeur_apport_nature: formData.valeur_apport_nature ? formatNumber(formData.valeur_apport_nature) : "",
    montant_incorporation_reserves: formData.montant_incorporation_reserves ? formatNumber(formData.montant_incorporation_reserves) : "",

    // Réduction de capital
    montant_reduction: formData.montant_reduction ? formatNumber(formData.montant_reduction as number) : "",
    nouveau_capital_reduit: formData.nouveau_capital_reduit ? formatNumber(formData.nouveau_capital_reduit as number) : "",
    modalite_reduction: formData.modalite_reduction || "",

    // Transformation
    nouvelle_forme_juridique: formData.nouvelle_forme_juridique || "",

    // Dissolution
    liquidateur_civilite: formData.liquidateur_civilite || "Monsieur",
    liquidateur_nom: formData.liquidateur_nom || "",
    liquidateur_prenom: formData.liquidateur_prenom || "",
    liquidateur_adresse: formData.liquidateur_adresse || "",

    // Modification statuts
    article_modifie: formData.article_modifie || "",
    nouveau_texte_article: formData.nouveau_texte_article || "",
    nouvelle_denomination: formData.nouvelle_denomination || "",
    nouvel_objet_social: formData.nouvel_objet_social || "",
    ancien_siege: formData.ancien_siege || "",
    nouveau_siege: formData.nouveau_siege || "",
    duree_prorogation: formData.duree_prorogation || "",

    // Fusion
    societe_fusionnee_denomination: formData.societe_fusionnee_denomination || "",

    // Continuation malgré pertes
    date_etats_financiers: formData.date_etats_financiers || "",
    montant_capitaux_propres: formData.montant_capitaux_propres ? formatNumber(formData.montant_capitaux_propres) : "",

    // Decisions conditionnelles
    has_augmentation_capital_numeraire: decisions.includes("augmentation_capital_numeraire"),
    has_augmentation_capital_nature: decisions.includes("augmentation_capital_nature"),
    has_augmentation_capital_reserves: decisions.includes("augmentation_capital_reserves"),
    has_reduction_capital: decisions.includes("reduction_capital"),
    has_transformation: decisions.includes("transformation"),
    has_dissolution: decisions.includes("dissolution"),
    has_modification_statuts: decisions.includes("modification_statuts"),
    has_changement_denomination: decisions.includes("changement_denomination"),
    has_modification_objet: decisions.includes("modification_objet"),
    has_transfert_siege: decisions.includes("transfert_siege"),
    has_prorogation_duree: decisions.includes("prorogation_duree"),
    has_fusion: decisions.includes("fusion"),
    has_continuation_perte: decisions.includes("continuation_perte"),
    has_mise_harmonie: decisions.includes("mise_harmonie"),
    has_pouvoirs: decisions.includes("pouvoirs"),

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
