import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareProjetFusionData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    // Société absorbée (A)
    societe_absorbee_denomination: formData.societe_absorbee_denomination || "",
    societe_absorbee_forme: formData.societe_absorbee_forme || "société anonyme",
    societe_absorbee_capital: formData.societe_absorbee_capital ? formatNumber(formData.societe_absorbee_capital as number) : "",
    societe_absorbee_siege: formData.societe_absorbee_siege || "",
    societe_absorbee_rccm: formData.societe_absorbee_rccm || "",
    societe_absorbee_representant: formData.societe_absorbee_representant || "",
    societe_absorbee_qualite: formData.societe_absorbee_qualite || "",
    societe_absorbee_objet: formData.societe_absorbee_objet || "",
    societe_absorbee_date_ca: formData.societe_absorbee_date_ca || "",
    societe_absorbee_nombre_actions: formData.societe_absorbee_nombre_actions ? formatNumber(formData.societe_absorbee_nombre_actions as number || 0) : "",
    societe_absorbee_valeur_nominale: formData.societe_absorbee_valeur_nominale ? formatNumber(formData.societe_absorbee_valeur_nominale as number || 0) : "",

    // Société absorbante (B)
    societe_absorbante_denomination: formData.societe_absorbante_denomination || "",
    societe_absorbante_forme: formData.societe_absorbante_forme || "société anonyme",
    societe_absorbante_capital: formData.societe_absorbante_capital ? formatNumber(formData.societe_absorbante_capital as number) : "",
    societe_absorbante_siege: formData.societe_absorbante_siege || "",
    societe_absorbante_rccm: formData.societe_absorbante_rccm || "",
    societe_absorbante_representant: formData.societe_absorbante_representant || "",
    societe_absorbante_qualite: formData.societe_absorbante_qualite || "",
    societe_absorbante_objet: formData.societe_absorbante_objet || "",
    societe_absorbante_date_ca: formData.societe_absorbante_date_ca || "",
    societe_absorbante_nombre_actions: formData.societe_absorbante_nombre_actions ? formatNumber(formData.societe_absorbante_nombre_actions as number || 0) : "",
    societe_absorbante_valeur_nominale: formData.societe_absorbante_valeur_nominale ? formatNumber(formData.societe_absorbante_valeur_nominale as number || 0) : "",

    // Motifs de la fusion
    motifs_fusion: formData.motifs_fusion || "",

    // Comptes de référence
    comptes_reference_a_date: formData.comptes_reference_a_date || "",
    comptes_reference_a_approbation: formData.comptes_reference_a_approbation || "",
    comptes_reference_b_date: formData.comptes_reference_b_date || "",
    comptes_reference_b_approbation: formData.comptes_reference_b_approbation || "",
    date_bilan_evaluation: formData.date_bilan_evaluation || "",

    // Actif à transmettre
    actif_immobilisations_incorporelles: formData.actif_immobilisations_incorporelles ? formatNumber(formData.actif_immobilisations_incorporelles as number) : "",
    actif_immobilisations_corporelles: formData.actif_immobilisations_corporelles ? formatNumber(formData.actif_immobilisations_corporelles as number) : "",
    actif_immobilisations_financieres: formData.actif_immobilisations_financieres ? formatNumber(formData.actif_immobilisations_financieres as number) : "",
    actif_stocks: formData.actif_stocks ? formatNumber(formData.actif_stocks as number) : "",
    actif_creances: formData.actif_creances ? formatNumber(formData.actif_creances as number) : "",
    actif_tresorerie: formData.actif_tresorerie ? formatNumber(formData.actif_tresorerie as number) : "",
    total_actif: formData.total_actif ? formatNumber(formData.total_actif as number) : "",

    // Passif à prendre en charge
    passif_dettes_financieres: formData.passif_dettes_financieres ? formatNumber(formData.passif_dettes_financieres as number) : "",
    passif_dettes_commerciales: formData.passif_dettes_commerciales ? formatNumber(formData.passif_dettes_commerciales as number) : "",
    passif_dettes_fiscales: formData.passif_dettes_fiscales ? formatNumber(formData.passif_dettes_fiscales as number) : "",
    passif_dettes_sociales: formData.passif_dettes_sociales ? formatNumber(formData.passif_dettes_sociales as number) : "",
    passif_autres: formData.passif_autres ? formatNumber(formData.passif_autres as number) : "",
    passif_banques: formData.passif_banques ? formatNumber(formData.passif_banques as number) : "",
    total_passif: formData.total_passif ? formatNumber(formData.total_passif as number) : "",

    // Actif net
    actif_net: formData.actif_net ? formatNumber(formData.actif_net as number) : "",

    // Rapport d'échange
    rapport_echange: formData.rapport_echange || "",
    rapport_echange_detail: formData.rapport_echange_detail || "",
    methode_evaluation: formData.methode_evaluation || "",
    nombre_actions_a: formData.nombre_actions_a ? formatNumber(formData.nombre_actions_a as number || 0) : "",
    nombre_actions_nouvelles_b: formData.nombre_actions_nouvelles_b ? formatNumber(formData.nombre_actions_nouvelles_b as number || 0) : "",

    // Augmentation capital absorbante
    augmentation_capital_b: formData.augmentation_capital_b ? formatNumber(formData.augmentation_capital_b as number) : "",
    nouvelles_actions_b_valeur: formData.nouvelles_actions_b_valeur ? formatNumber(formData.nouvelles_actions_b_valeur as number || 0) : "",
    actions_numerotees_de: formData.actions_numerotees_de || "",
    actions_numerotees_a: formData.actions_numerotees_a || "",
    date_effet_fusion: formData.date_effet_fusion || "",

    // Prime de fusion
    apport_net_a: formData.apport_net_a ? formatNumber(formData.apport_net_a as number) : "",
    montant_augmentation_b: formData.montant_augmentation_b ? formatNumber(formData.montant_augmentation_b as number) : "",
    prime_fusion: formData.prime_fusion ? formatNumber(formData.prime_fusion as number) : "",

    // Réalisation
    date_realisation: formData.date_realisation || "",
    date_limite_realisation: formData.date_limite_realisation || "",

    // Chiffres d'affaires et résultats
    ca_n_moins_2: formData.ca_n_moins_2 ? formatNumber(formData.ca_n_moins_2) : "",
    ca_n_moins_1: formData.ca_n_moins_1 ? formatNumber(formData.ca_n_moins_1) : "",
    ca_n: formData.ca_n ? formatNumber(formData.ca_n as number || 0) : "",
    resultat_n_moins_2: formData.resultat_n_moins_2 ? formatNumber(formData.resultat_n_moins_2) : "",
    resultat_n_moins_1: formData.resultat_n_moins_1 ? formatNumber(formData.resultat_n_moins_1) : "",
    resultat_n: formData.resultat_n ? formatNumber(formData.resultat_n as number || 0) : "",
    ca_exercice_courant: formData.ca_exercice_courant ? formatNumber(formData.ca_exercice_courant as number || 0) : "",
    benefice_exercice_courant: formData.benefice_exercice_courant ? formatNumber(formData.benefice_exercice_courant as number || 0) : "",
    date_ouverture_exercice: formData.date_ouverture_exercice || "",

    // Notaire
    notaire_nom: formData.notaire_nom || "",
    notaire_ville: formData.notaire_ville || "",
    nombre_exemplaires: formData.nombre_exemplaires || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
