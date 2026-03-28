import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template Rapport de Gestion.
 */
export function prepareRapportGestionData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const chiffreAffaires = formData.chiffre_affaires as number;
  const resultatExploitation = formData.resultat_exploitation as number;
  const resultatNet = formData.resultat_net as number;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    exercice_clos_le: formData.exercice_clos_le || "...",
    date_ago: formData.date_ago || "...",

    // Activité
    description_activites: formData.description_activites || "",
    part_marche: formData.part_marche || "",
    has_part_marche: !!(formData.part_marche?.trim()),
    position_concurrence: formData.position_concurrence || "",
    has_position_concurrence: !!(formData.position_concurrence?.trim()),
    conjoncture_economique: formData.conjoncture_economique || "",
    has_conjoncture: !!(formData.conjoncture_economique?.trim()),

    // Moyens
    moyens_techniques: formData.moyens_techniques || "",
    has_moyens_techniques: !!(formData.moyens_techniques?.trim()),
    moyens_humains: formData.moyens_humains || "",
    has_moyens_humains: !!(formData.moyens_humains?.trim()),

    // Progrès et difficultés
    progres_realises: formData.progres_realises || "",
    has_progres: !!(formData.progres_realises?.trim()),
    difficultes_rencontrees: formData.difficultes_rencontrees || "",
    has_difficultes: !!(formData.difficultes_rencontrees?.trim()),

    // Chiffres
    chiffre_affaires: formatNumber(chiffreAffaires || 0),
    resultat_exploitation: formatNumber(resultatExploitation || 0),
    resultat_net: formatNumber(resultatNet || 0),
    resultat_net_lettres: numberToWords(Math.abs(resultatNet || 0)),
    is_benefice: (resultatNet || 0) >= 0,
    is_perte: (resultatNet || 0) < 0,

    analyse_financiere: formData.analyse_financiere || "",
    has_analyse_financiere: !!(formData.analyse_financiere?.trim()),
    evolution_tresorerie: formData.evolution_tresorerie || "",
    has_evolution_tresorerie: !!(formData.evolution_tresorerie?.trim()),

    // Sections optionnelles
    travaux_ca: formData.travaux_ca || "",
    has_travaux_ca: !!(formData.travaux_ca?.trim()),
    activites_rd: formData.activites_rd || "",
    has_activites_rd: !!(formData.activites_rd?.trim()),
    perspectives_avenir: formData.perspectives_avenir || "",
    plan_financement: formData.plan_financement || "",
    has_plan_financement: !!(formData.plan_financement?.trim()),
    evenements_posterieurs: formData.evenements_posterieurs || "",
    has_evenements_posterieurs: !!(formData.evenements_posterieurs?.trim()),
    changement_methode: formData.changement_methode || "",
    has_changement_methode: !!(formData.changement_methode?.trim()),
    nb_actionnaires_salaries: formData.nb_actionnaires_salaries || 0,
    has_actionnaires_salaries: !!(formData.nb_actionnaires_salaries && formData.nb_actionnaires_salaries > 0),

    // Résolutions
    resolutions_proposees: formData.resolutions_proposees || "",

    // Signature
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
    signataire: formData.signataire || "Le Gérant",
  };
}
