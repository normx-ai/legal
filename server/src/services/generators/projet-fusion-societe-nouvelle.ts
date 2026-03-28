import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareProjetFusionSocieteNouvelleData(formData: FormData): TemplateData {
  return {
    // Soci\u00e9t\u00e9 A
    denomination_a: formData.denomination_a || "",
    forme_a: formData.forme_a || "soci\u00e9t\u00e9 anonyme",
    capital_a: formData.capital_a ? formatNumber(formData.capital_a as number) : "",
    siege_a: formData.siege_a || "",
    rccm_a: formData.rccm_a || "",
    representant_a: formData.representant_a || "",
    qualite_a: formData.qualite_a || "",
    objet_a: formData.objet_a || "",
    nombre_actions_a: formData.nombre_actions_a ? formatNumber(formData.nombre_actions_a) : "",
    valeur_nominale_a: formData.valeur_nominale_a ? formatNumber(formData.valeur_nominale_a) : "",

    // Soci\u00e9t\u00e9 B
    denomination_b: formData.denomination_b || "",
    forme_b: formData.forme_b || "soci\u00e9t\u00e9 anonyme",
    capital_b: formData.capital_b ? formatNumber(formData.capital_b as number) : "",
    siege_b: formData.siege_b || "",
    rccm_b: formData.rccm_b || "",
    representant_b: formData.representant_b || "",
    qualite_b: formData.qualite_b || "",
    objet_b: formData.objet_b || "",
    nombre_actions_b: formData.nombre_actions_b ? formatNumber(formData.nombre_actions_b) : "",
    valeur_nominale_b: formData.valeur_nominale_b ? formatNumber(formData.valeur_nominale_b) : "",

    // Soci\u00e9t\u00e9 nouvelle C
    denomination_c: formData.denomination_c || "",
    forme_c: formData.forme_c || "soci\u00e9t\u00e9 anonyme",
    capital_c: formData.capital_c ? formatNumber(formData.capital_c as number) : "",
    siege_c: formData.siege_c || "",
    objet_c: formData.objet_c || "",
    nombre_actions_c: formData.nombre_actions_c ? formatNumber(formData.nombre_actions_c) : "",
    valeur_nominale_c: formData.valeur_nominale_c ? formatNumber(formData.valeur_nominale_c) : "",

    // Fraction attribu\u00e9e
    fraction_a_pourcent: formData.fraction_a_pourcent || "",
    fraction_b_pourcent: formData.fraction_b_pourcent || "",

    // Motifs
    motifs_fusion: formData.motifs_fusion || "",

    // Actif / Passif soci\u00e9t\u00e9 A
    actif_a_immobilisations: formData.actif_a_immobilisations ? formatNumber(formData.actif_a_immobilisations as number) : "",
    actif_a_stocks: formData.actif_a_stocks ? formatNumber(formData.actif_a_stocks as number) : "",
    actif_a_creances: formData.actif_a_creances ? formatNumber(formData.actif_a_creances as number) : "",
    actif_a_tresorerie: formData.actif_a_tresorerie ? formatNumber(formData.actif_a_tresorerie as number) : "",
    total_actif_a: formData.total_actif_a ? formatNumber(formData.total_actif_a as number) : "",
    passif_a_dettes: formData.passif_a_dettes ? formatNumber(formData.passif_a_dettes as number) : "",
    total_passif_a: formData.total_passif_a ? formatNumber(formData.total_passif_a as number) : "",
    actif_net_a: formData.actif_net_a ? formatNumber(formData.actif_net_a as number) : "",

    // Actif / Passif soci\u00e9t\u00e9 B
    actif_b_immobilisations: formData.actif_b_immobilisations ? formatNumber(formData.actif_b_immobilisations as number) : "",
    actif_b_stocks: formData.actif_b_stocks ? formatNumber(formData.actif_b_stocks as number) : "",
    actif_b_creances: formData.actif_b_creances ? formatNumber(formData.actif_b_creances as number) : "",
    actif_b_tresorerie: formData.actif_b_tresorerie ? formatNumber(formData.actif_b_tresorerie as number) : "",
    total_actif_b: formData.total_actif_b ? formatNumber(formData.total_actif_b as number) : "",
    passif_b_dettes: formData.passif_b_dettes ? formatNumber(formData.passif_b_dettes as number) : "",
    total_passif_b: formData.total_passif_b ? formatNumber(formData.total_passif_b as number) : "",
    actif_net_b: formData.actif_net_b ? formatNumber(formData.actif_net_b as number) : "",

    // Rapport d'\u00e9change
    rapport_echange: formData.rapport_echange || "",
    methode_evaluation: formData.methode_evaluation || "",

    // Dates
    date_effet_fusion: formData.date_effet_fusion || "",
    date_realisation: formData.date_realisation || "",
    date_limite_realisation: formData.date_limite_realisation || "",

    // Chiffres d'affaires A
    ca_a_n_moins_2: formData.ca_a_n_moins_2 ? formatNumber(formData.ca_a_n_moins_2) : "",
    ca_a_n_moins_1: formData.ca_a_n_moins_1 ? formatNumber(formData.ca_a_n_moins_1) : "",
    ca_a_n: formData.ca_a_n ? formatNumber(formData.ca_a_n) : "",

    // Chiffres d'affaires B
    ca_b_n_moins_2: formData.ca_b_n_moins_2 ? formatNumber(formData.ca_b_n_moins_2) : "",
    ca_b_n_moins_1: formData.ca_b_n_moins_1 ? formatNumber(formData.ca_b_n_moins_1) : "",
    ca_b_n: formData.ca_b_n ? formatNumber(formData.ca_b_n) : "",

    nombre_exemplaires: formData.nombre_exemplaires || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
    devise: "FCFA",
  };
}
