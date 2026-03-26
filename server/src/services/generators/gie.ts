import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template GIE (Groupement d'Intérêt Économique).
 */
export function prepareGieData(formData: any): Record<string, any> {
  const hasCapital = !!formData.has_capital;
  const capital = hasCapital ? formData.capital : 0;
  const valeurNominale = hasCapital ? formData.valeur_nominale : 0;
  const nombreParts = hasCapital && valeurNominale > 0 ? Math.floor(capital / valeurNominale) : 0;

  const membres = (formData.membres || []).map((m: any, i: number) => {
    const apport = m.apport || 0;
    const parts = hasCapital && valeurNominale > 0 ? Math.floor(apport / valeurNominale) : 0;
    return {
      rang: i + 1,
      civilite: m.civilite || "Monsieur",
      nom: m.nom,
      prenom: m.prenom,
      nom_complet: `${m.prenom} ${m.nom}`,
      date_naissance: m.date_naissance || "",
      lieu_naissance: m.lieu_naissance || "",
      nationalite: m.nationalite || "",
      profession: m.profession || "",
      adresse: m.adresse || "",
      raison_sociale: m.raison_sociale || "",
      forme_juridique_membre: m.forme_juridique || "",
      siege_social_membre: m.siege_social || "",
      rccm_membre: m.rccm || "",
      is_personne_morale: !!m.is_personne_morale,
      apport: formatNumber(apport),
      apport_lettres: numberToWords(apport),
      type_apport: m.type_apport === "numeraire" ? "numéraire" : m.type_apport === "nature" ? "nature" : "numéraire",
      parts,
    };
  });

  const membresNumeraire = formData.membres?.filter((m: any) => m.type_apport === "numeraire" || !m.type_apport) || [];
  const membresNature = formData.membres?.filter((m: any) => m.type_apport === "nature") || [];
  const totalApportsNumeraire = membresNumeraire.reduce((sum: number, m: any) => sum + (m.apport || 0), 0);
  const totalApportsNature = membresNature.reduce((sum: number, m: any) => sum + (m.apport || 0), 0);

  const modeAdmin = formData.mode_administration || "admin_unique";

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    objet_social: formData.objet_social,
    siege_social: formData.siege_social,
    ville: formData.ville || "",
    pays: formData.pays || "République du Congo",
    duree: formData.duree || 99,
    exercice_debut: formData.exercice_debut || "1er janvier",
    exercice_fin: formData.exercice_fin || "31 décembre",
    premier_exercice_fin: formData.premier_exercice_fin || "31 décembre " + new Date().getFullYear(),

    // Capital
    has_capital: hasCapital,
    sans_capital: !hasCapital,
    capital: hasCapital ? formatNumber(capital) : "",
    capital_lettres: hasCapital ? numberToWords(capital) : "",
    devise: "FCFA",
    valeur_nominale: hasCapital ? formatNumber(valeurNominale) : "",
    nombre_parts: nombreParts,

    // Membres
    membres,
    nombre_membres: membres.length,
    total_apports_numeraire: formatNumber(totalApportsNumeraire),
    total_apports_nature: formatNumber(totalApportsNature),
    total_apports: formatNumber(capital || (totalApportsNumeraire + totalApportsNature)),
    has_apports_nature: totalApportsNature > 0,

    // Obligations
    responsabilite_nouveaux_membres: formData.responsabilite_nouveaux_membres || "solidairement tenus",

    // Nouveaux membres
    majorite_admission: formData.majorite_admission || "l'unanimité",
    droit_entree: !!formData.montant_droit_entree,
    sans_droit_entree: !formData.montant_droit_entree,
    montant_droit_entree: formData.montant_droit_entree ? formatNumber(formData.montant_droit_entree) : "",

    // Démission
    delai_preavis_retrait: formData.delai_preavis_retrait || "trois (3) mois",

    // Exclusion
    motifs_exclusion: formData.motifs_exclusion || "tout acte contraire à l'intérêt du groupement",
    conditions_exclusion: formData.conditions_exclusion || "décision prise à l'unanimité des autres membres",

    // Administration
    mode_ca: modeAdmin === "ca",
    mode_admin_unique: modeAdmin === "admin_unique",
    nombre_administrateurs: formData.nombre_administrateurs || 3,
    admin_civilite: formData.administrateur?.civilite || "Monsieur",
    admin_prenom: formData.administrateur?.prenom || "...",
    admin_nom: formData.administrateur?.nom || "...",
    duree_mandat_admin: formData.duree_mandat_admin || "4",
    remuneration_admin: formData.remuneration_admin || "à titre gratuit",
    attributions_admin: formData.attributions_admin || "la gestion courante du groupement",
    pouvoirs_admin: formData.pouvoirs_admin || "les plus étendus pour agir au nom du groupement",
    conditions_revocation: formData.conditions_revocation || "ad nutum par décision de l'assemblée générale",

    // AG
    convocateur_ag: formData.convocateur_ag || "le conseil d'administration ou l'administrateur unique",
    delai_convocation_ago_comptes: formData.delai_convocation_ago_comptes || "quinze (15) jours",
    delai_convocation_ago: formData.delai_convocation_ago || "quinze (15) jours",
    delai_convocation_age: formData.delai_convocation_age || "quinze (15) jours",
    quorum_ago: formData.quorum_ago || "la moitié des",
    majorite_ago: formData.majorite_ago || "la majorité simple",
    quorum_age: formData.quorum_age || "les deux tiers des",
    majorite_age: formData.majorite_age || "les deux tiers des voix",

    // Résultats
    pourcentage_report: formData.pourcentage_report || "...",
    plafond_report: formData.plafond_report ? formatNumber(formData.plafond_report) : "...",
    pourcentage_plafond: formData.pourcentage_plafond || "...",
    date_disponibilite_report: formData.date_disponibilite_report || "...",
    cle_repartition: formData.cle_repartition || "parts égales entre les membres",

    // Contrôle de gestion
    duree_mandat_controleur: formData.duree_mandat_controleur || "3",
    type_ag_controleur: formData.type_ag_controleur || "AGO",
    mission_controleur: formData.mission_controleur || "le contrôle de la gestion du groupement et la vérification de la conformité des opérations",
    remuneration_controleur: formData.remuneration_controleur || "à titre gratuit",

    // Contrôle des états financiers
    gie_emet_obligations: !!formData.gie_emet_obligations,
    gie_sans_obligations: !formData.gie_emet_obligations,

    // Dissolution
    conditions_dissolution: formData.conditions_dissolution || "l'unanimité des membres",

    // Publications
    mandataire_civilite: formData.mandataire?.civilite || formData.administrateur?.civilite || "Monsieur",
    mandataire_prenom: formData.mandataire?.prenom || formData.administrateur?.prenom || "...",
    mandataire_nom: formData.mandataire?.nom || formData.administrateur?.nom || "...",

    nombre_exemplaires: formData.nombre_exemplaires || (membres.length + 2).toString(),
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville || "...",
    reference_legale: "Acte Uniforme OHADA relatif au droit des sociétés commerciales et du GIE",
  };
}
