import { formatNumber, numberToWords } from "./utils";

export function prepareDecActionnaireUniqueNonAgData(formData: any): Record<string, any> {
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
    nombre_actions: formatNumber(nombreActions),

    // Actionnaire unique (non AG/Président)
    actionnaire_civilite: formData.actionnaire_civilite || "Monsieur",
    actionnaire_nom: formData.actionnaire_nom || "",
    actionnaire_prenom: formData.actionnaire_prenom || "",
    is_personne_physique: formData.is_personne_physique !== false,
    is_personne_morale: !!formData.is_personne_morale,
    actionnaire_denomination: formData.actionnaire_denomination || "",
    actionnaire_forme: formData.actionnaire_forme || "",
    actionnaire_capital: formData.actionnaire_capital ? formatNumber(formData.actionnaire_capital) : "",
    actionnaire_siege: formData.actionnaire_siege || "",
    actionnaire_rc: formData.actionnaire_rc || "",
    actionnaire_representant: formData.actionnaire_representant || "",

    // AG / Président qui envoie les rapports
    ag_civilite: formData.ag_civilite || "Monsieur",
    ag_nom: formData.ag_nom || "",
    ag_prenom: formData.ag_prenom || "",
    qualite_dirigeant: formData.qualite_dirigeant || "administrateur général",

    // Dates
    date_decisions: formData.date_decisions || "",
    date_decisions_lettres: formData.date_decisions_lettres || "",
    heure_decisions: formData.heure_decisions || "",
    heure_decisions_lettres: formData.heure_decisions_lettres || "",
    exercice_clos_le: formData.exercice_clos_le || "",
    date_envoi_documents: formData.date_envoi_documents || "",

    // Résultat
    resultat_montant: formatNumber(resultatMontant),
    resultat_montant_lettres: numberToWords(resultatMontant),
    resultat_type: formData.resultat_type || "bénéficiaire",
    is_beneficiaire: (formData.resultat_type || "bénéficiaire") === "bénéficiaire",
    is_deficitaire: formData.resultat_type === "déficitaire",
    affectation_details: formData.affectation_details || "",

    // Conventions
    has_conventions: !!formData.has_conventions,
    has_conventions_variante1: !!formData.has_conventions_variante1,
    has_conventions_variante2: !!formData.has_conventions_variante2,
    has_absence_conventions_variante1: !!formData.has_absence_conventions_variante1,
    has_absence_conventions_variante2: !!formData.has_absence_conventions_variante2,
    convention_details: formData.convention_details || "",
    convention_objet: formData.convention_objet || "",

    // CAC
    has_commissaire: !!formData.has_commissaire,
    has_rapport_cac: !!formData.has_rapport_cac,
    commissaire_titulaire_nom: formData.commissaire_titulaire_nom || "",
    commissaire_titulaire_adresse: formData.commissaire_titulaire_adresse || "",
    commissaire_suppleant_nom: formData.commissaire_suppleant_nom || "",
    commissaire_suppleant_adresse: formData.commissaire_suppleant_adresse || "",
    commissaire_duree: formData.commissaire_duree || "trois exercices",
    commissaire_fin_mandat: formData.commissaire_fin_mandat || "",

    // Renouvellement / Non renouvellement CAC
    has_renouvellement_cac_oui: !!formData.has_renouvellement_cac_oui,
    has_renouvellement_cac_non: !!formData.has_renouvellement_cac_non,
    commissaire_duree_renouvellement: formData.commissaire_duree_renouvellement || "trois exercices",
    commissaire_fin_mandat_renouvellement: formData.commissaire_fin_mandat_renouvellement || "",

    // Changement dénomination
    ancienne_denomination: formData.ancienne_denomination || formData.denomination || "",
    nouvelle_denomination: formData.nouvelle_denomination || "",
    article_denomination: formData.article_denomination || "",
    nouveau_texte_article_denomination: formData.nouveau_texte_article_denomination || "",

    // Prorogation durée
    duree_prorogation: formData.duree_prorogation || "",
    date_prorogation: formData.date_prorogation || "",
    article_duree: formData.article_duree || "",
    nouveau_texte_article_duree: formData.nouveau_texte_article_duree || "",

    // Modification objet social
    nouveau_objet_social: formData.nouveau_objet_social || "",
    article_objet: formData.article_objet || "",
    nouveau_texte_article_objet: formData.nouveau_texte_article_objet || "",

    // Transfert siège social
    ancien_siege: formData.ancien_siege || formData.siege_social || "",
    nouveau_siege: formData.nouveau_siege || "",
    date_transfert_siege: formData.date_transfert_siege || "",
    article_siege: formData.article_siege || "",
    nouveau_texte_article_siege: formData.nouveau_texte_article_siege || "",

    // Augmentation capital numéraire
    montant_augmentation_numeraire: formData.montant_augmentation_numeraire ? formatNumber(formData.montant_augmentation_numeraire) : "",
    ancien_capital: formatNumber(capital),
    nouveau_capital_numeraire: formData.nouveau_capital_numeraire ? formatNumber(formData.nouveau_capital_numeraire) : "",
    nombre_actions_nouvelles_numeraire: formData.nombre_actions_nouvelles_numeraire ? formatNumber(formData.nombre_actions_nouvelles_numeraire) : "",
    articles_capital: formData.articles_capital || "",

    // Augmentation capital nature
    montant_augmentation_nature: formData.montant_augmentation_nature ? formatNumber(formData.montant_augmentation_nature) : "",
    nouveau_capital_nature: formData.nouveau_capital_nature ? formatNumber(formData.nouveau_capital_nature) : "",
    nombre_actions_nouvelles_nature: formData.nombre_actions_nouvelles_nature ? formatNumber(formData.nombre_actions_nouvelles_nature) : "",
    description_apport_nature: formData.description_apport_nature || "",
    valeur_apport_nature: formData.valeur_apport_nature ? formatNumber(formData.valeur_apport_nature) : "",

    // Augmentation capital par incorporation de réserves
    montant_incorporation_reserves: formData.montant_incorporation_reserves ? formatNumber(formData.montant_incorporation_reserves) : "",
    nouveau_capital_reserves: formData.nouveau_capital_reserves ? formatNumber(formData.nouveau_capital_reserves) : "",
    nombre_actions_nouvelles_reserves: formData.nombre_actions_nouvelles_reserves ? formatNumber(formData.nombre_actions_nouvelles_reserves) : "",

    // Réduction de capital
    montant_reduction_capital: formData.montant_reduction_capital ? formatNumber(formData.montant_reduction_capital) : "",
    nouveau_capital_reduit: formData.nouveau_capital_reduit ? formatNumber(formData.nouveau_capital_reduit) : "",
    modalite_reduction_capital: formData.modalite_reduction_capital || "",
    article_capital: formData.article_capital || "",

    // Transformation
    ancienne_forme_juridique: formData.ancienne_forme_juridique || formData.forme_juridique || "SA",
    nouvelle_forme_juridique: formData.nouvelle_forme_juridique || "",
    titre_dirigeant: formData.titre_dirigeant || "",
    nom_dirigeant_transformation: formData.nom_dirigeant_transformation || "",

    // Dissolution et liquidation
    liquidateur_civilite: formData.liquidateur_civilite || "Monsieur",
    liquidateur_nom: formData.liquidateur_nom || "",
    liquidateur_prenom: formData.liquidateur_prenom || "",
    liquidateur_adresse: formData.liquidateur_adresse || "",

    // Continuation malgré pertes
    date_etats_financiers: formData.date_etats_financiers || "",
    montant_capitaux_propres: formData.montant_capitaux_propres ? formatNumber(formData.montant_capitaux_propres) : "",

    // Decisions conditionnelles
    has_approbation_comptes: decisions.includes("approbation_comptes"),
    has_affectation_resultats: decisions.includes("affectation_resultats"),
    has_conventions_decision: decisions.includes("conventions"),
    has_nomination_cac: decisions.includes("nomination_cac"),
    has_renouvellement_cac: decisions.includes("renouvellement_cac"),
    has_non_renouvellement_cac: decisions.includes("non_renouvellement_cac"),
    has_changement_denomination: decisions.includes("changement_denomination"),
    has_prorogation_duree: decisions.includes("prorogation_duree"),
    has_modification_objet: decisions.includes("modification_objet"),
    has_transfert_siege: decisions.includes("transfert_siege"),
    has_continuation_perte_capital: decisions.includes("continuation_perte_capital"),
    has_augmentation_capital_numeraire: decisions.includes("augmentation_capital_numeraire"),
    has_augmentation_capital_nature: decisions.includes("augmentation_capital_nature"),
    has_augmentation_capital_reserves: decisions.includes("augmentation_capital_reserves"),
    has_reduction_capital: decisions.includes("reduction_capital"),
    has_transformation: decisions.includes("transformation"),
    has_dissolution: decisions.includes("dissolution"),
    has_mise_en_harmonie: decisions.includes("mise_en_harmonie"),
    has_pouvoirs: decisions.includes("pouvoirs"),

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
