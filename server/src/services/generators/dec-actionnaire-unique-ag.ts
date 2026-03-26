import { formatNumber, numberToWords } from "./utils";

export function prepareDecActionnaireUniqueAgData(formData: any): Record<string, any> {
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

    // Actionnaire unique
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
    qualite_actionnaire: formData.qualite_actionnaire || "administrateur général",

    // Dates
    date_decisions: formData.date_decisions || "",
    date_decisions_lettres: formData.date_decisions_lettres || "",
    heure_decisions: formData.heure_decisions || "",
    heure_decisions_lettres: formData.heure_decisions_lettres || "",
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

    // Conventions
    has_conventions: !!formData.has_conventions,
    convention_details: formData.convention_details || "",

    // Decisions conditionnelles
    has_approbation_comptes: decisions.includes("approbation_comptes"),
    has_affectation_resultats: decisions.includes("affectation_resultats"),
    has_renouvellement_cac: decisions.includes("renouvellement_cac"),
    has_non_renouvellement_cac: decisions.includes("non_renouvellement_cac"),
    has_nomination_cac: decisions.includes("nomination_cac"),
    has_conventions_decision: decisions.includes("conventions"),
    has_augmentation_capital_numeraire: decisions.includes("augmentation_capital_numeraire"),
    has_augmentation_capital_nature: decisions.includes("augmentation_capital_nature"),
    has_augmentation_capital_reserves: decisions.includes("augmentation_capital_reserves"),
    has_continuation_perte: decisions.includes("continuation_perte"),
    has_mise_harmonie: decisions.includes("mise_harmonie"),
    has_changement_denomination: decisions.includes("changement_denomination"),
    has_prorogation_duree: decisions.includes("prorogation_duree"),
    has_modification_objet: decisions.includes("modification_objet"),
    has_transfert_siege: decisions.includes("transfert_siege"),
    has_transformation: decisions.includes("transformation"),
    has_dissolution: decisions.includes("dissolution"),
    has_pouvoirs: decisions.includes("pouvoirs"),

    // Variables conditionnelles
    nouvelle_denomination: formData.nouvelle_denomination || "",
    article_denomination: formData.article_denomination || "",
    date_expiration: formData.date_expiration || "",
    duree_prorogation: formData.duree_prorogation || "",
    nouvelle_date_expiration: formData.nouvelle_date_expiration || "",
    nouvel_objet_social: formData.nouvel_objet_social || "",
    ancien_siege: formData.ancien_siege || "",
    nouveau_siege: formData.nouveau_siege || "",
    date_effet: formData.date_effet || "",
    date_etats_financiers: formData.date_etats_financiers || "",
    montant_capitaux_propres: formData.montant_capitaux_propres ? formatNumber(formData.montant_capitaux_propres as number) : "",
    montant_augmentation: formData.montant_augmentation ? formatNumber(formData.montant_augmentation as number) : "",
    nouveau_capital: formData.nouveau_capital ? formatNumber(formData.nouveau_capital as number) : "",
    nouvelles_actions: formData.nouvelles_actions ? formatNumber(formData.nouvelles_actions as number) : "",
    nouvelle_valeur_nominale: formData.nouvelle_valeur_nominale ? formatNumber(formData.nouvelle_valeur_nominale as number) : "",
    commissaire_apports_nom: formData.commissaire_apports_nom || "",
    date_designation_commissaire: formData.date_designation_commissaire || "",
    montant_reduction: formData.montant_reduction ? formatNumber(formData.montant_reduction as number) : "",
    nouvelle_forme_juridique: formData.nouvelle_forme_juridique || "",
    liquidateur_nom: formData.liquidateur_nom || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
