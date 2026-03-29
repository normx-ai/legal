import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareDecAssocieUniqueNonGerantData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const valeurNominale = formData.valeur_nominale as number || 5000;
  const nombreParts = capital / valeurNominale;
  const resultatMontant = formData.resultat_montant as number || 0;
  const decisions = formData.decisions_selectionnees || [];

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SARL",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    valeur_nominale: formatNumber(valeurNominale),
    nombre_parts: formatNumber(nombreParts),
    associe_civilite: formData.associe_civilite || "Monsieur",
    associe_nom: formData.associe_nom || "",
    associe_prenom: formData.associe_prenom || "",
    associe_date_naissance: formData.associe_date_naissance || "",
    associe_lieu_naissance: formData.associe_lieu_naissance || "",
    associe_nationalite: formData.associe_nationalite || "",
    associe_adresse: formData.associe_adresse || "",
    gerant_civilite: formData.gerant_civilite || "Monsieur",
    gerant_nom: formData.gerant_nom || "",
    gerant_prenom: formData.gerant_prenom || "",
    date_decisions: formData.date_decisions || "",
    date_decisions_lettres: formData.date_decisions_lettres || "",
    heure_decisions: formData.heure_decisions || "",
    heure_decisions_lettres: formData.heure_decisions_lettres || "",
    exercice_clos_le: formData.exercice_clos_le || "",
    date_envoi_documents: formData.date_envoi_documents || "",
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

    // Gérant
    duree_mandat_gerant: formData.duree_mandat_gerant || formData.duree_gerant || "",
    duree_gerant: formData.duree_gerant || "",
    date_expiration_mandat_gerant: formData.date_expiration_mandat_gerant || "",
    remuneration_gerant: formData.remuneration_gerant || "",

    // Révocation / Remplacement gérant
    has_quitus_revocation: !!formData.has_quitus_revocation,
    nouveau_gerant_civilite: formData.nouveau_gerant_civilite || "Monsieur",
    nouveau_gerant_nom: formData.nouveau_gerant_nom || "",
    nouveau_gerant_prenom: formData.nouveau_gerant_prenom || "",
    date_expiration_nouveau_gerant: formData.date_expiration_nouveau_gerant || "",

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
    montant_augmentation_numeraire: formData.montant_augmentation_numeraire ? formatNumber(formData.montant_augmentation_numeraire as number || 0) : "",
    ancien_capital: formatNumber(capital),
    nouveau_capital_numeraire: formData.nouveau_capital_numeraire ? formatNumber(formData.nouveau_capital_numeraire as number || 0) : "",
    nombre_parts_nouvelles_numeraire: formData.nombre_parts_nouvelles_numeraire ? formatNumber(formData.nombre_parts_nouvelles_numeraire as number || 0) : "",
    articles_capital: formData.articles_capital || "",

    // Augmentation capital nature
    montant_augmentation_nature: formData.montant_augmentation_nature ? formatNumber(formData.montant_augmentation_nature as number || 0) : "",
    nouveau_capital_nature: formData.nouveau_capital_nature ? formatNumber(formData.nouveau_capital_nature as number || 0) : "",
    nombre_parts_nouvelles_nature: formData.nombre_parts_nouvelles_nature ? formatNumber(formData.nombre_parts_nouvelles_nature as number || 0) : "",
    description_apport_nature: formData.description_apport_nature || "",
    valeur_apport_nature: formData.valeur_apport_nature ? formatNumber(formData.valeur_apport_nature as number || 0) : "",

    // Augmentation capital par incorporation de réserves
    montant_incorporation_reserves: formData.montant_incorporation_reserves ? formatNumber(formData.montant_incorporation_reserves as number || 0) : "",
    nouveau_capital_reserves: formData.nouveau_capital_reserves ? formatNumber(formData.nouveau_capital_reserves as number || 0) : "",
    nombre_parts_nouvelles_reserves: formData.nombre_parts_nouvelles_reserves ? formatNumber(formData.nombre_parts_nouvelles_reserves as number || 0) : "",

    // Augmentation capital par majoration valeur nominale
    montant_incorporation_majoration: formData.montant_incorporation_majoration ? formatNumber(formData.montant_incorporation_majoration as number || 0) : "",
    nouveau_capital_majoration: formData.nouveau_capital_majoration ? formatNumber(formData.nouveau_capital_majoration as number || 0) : "",
    ancienne_valeur_nominale: formData.ancienne_valeur_nominale ? formatNumber(formData.ancienne_valeur_nominale as number || 0) : formatNumber(valeurNominale),
    nouvelle_valeur_nominale: formData.nouvelle_valeur_nominale ? formatNumber(formData.nouvelle_valeur_nominale as number || 0) : "",

    // Réduction de capital
    montant_reduction_capital: formData.montant_reduction_capital ? formatNumber(formData.montant_reduction_capital as number || 0) : "",
    nouveau_capital_reduit: formData.nouveau_capital_reduit ? formatNumber(formData.nouveau_capital_reduit as number || 0) : "",
    modalite_reduction_capital: formData.modalite_reduction_capital || "",
    article_capital: formData.article_capital || "",

    // Transformation
    ancienne_forme_juridique: formData.ancienne_forme_juridique || formData.forme_juridique || "SARL",
    nouvelle_forme_juridique: formData.nouvelle_forme_juridique || "",
    titre_dirigeant: formData.titre_dirigeant || "",
    nom_dirigeant_transformation: formData.nom_dirigeant_transformation || "",
    duree_mandat_dirigeant_transformation: formData.duree_mandat_dirigeant_transformation || "",
    commissaire_titulaire_transformation: formData.commissaire_titulaire_transformation || "",
    commissaire_suppleant_transformation: formData.commissaire_suppleant_transformation || "",
    commissaire_duree_transformation: formData.commissaire_duree_transformation || "",

    // Dissolution et liquidation
    liquidateur_civilite: formData.liquidateur_civilite || "Monsieur",
    liquidateur_nom: formData.liquidateur_nom || "",
    liquidateur_prenom: formData.liquidateur_prenom || "",
    liquidateur_adresse: formData.liquidateur_adresse || "",

    // Decisions conditionnelles
    has_approbation_comptes: decisions.includes("approbation_comptes"),
    has_affectation_resultats: decisions.includes("affectation_resultats"),
    has_conventions_decision: decisions.includes("conventions"),
    has_renouvellement_gerant: decisions.includes("renouvellement_gerant"),
    has_remuneration_gerant: decisions.includes("remuneration_gerant"),
    has_revocation_gerant: decisions.includes("revocation_gerant"),
    has_remplacement_gerant: decisions.includes("remplacement_gerant"),
    has_nomination_cac: decisions.includes("nomination_cac"),
    has_renouvellement_cac: decisions.includes("renouvellement_cac"),
    has_changement_denomination: decisions.includes("changement_denomination"),
    has_prorogation_duree: decisions.includes("prorogation_duree"),
    has_modification_objet: decisions.includes("modification_objet"),
    has_transfert_siege: decisions.includes("transfert_siege"),
    has_continuation_perte_capital: decisions.includes("continuation_perte_capital"),
    has_augmentation_capital_numeraire: decisions.includes("augmentation_capital_numeraire"),
    has_augmentation_capital_nature: decisions.includes("augmentation_capital_nature"),
    has_augmentation_capital_reserves: decisions.includes("augmentation_capital_reserves"),
    has_augmentation_capital_majoration: decisions.includes("augmentation_capital_majoration"),
    has_reduction_capital: decisions.includes("reduction_capital"),
    has_transformation: decisions.includes("transformation"),
    has_dissolution: decisions.includes("dissolution"),
    has_mise_en_harmonie: decisions.includes("mise_en_harmonie"),
    has_pouvoirs: decisions.includes("pouvoirs"),

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
