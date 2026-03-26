import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template SAS (Société par Actions Simplifiée).
 */
export function prepareSasData(formData: Record<string, unknown>): Record<string, unknown> {
  const capital = formData.capital as number;
  const valeurNominale = formData.valeur_nominale as number;
  const nombreActions = Math.floor(capital / valeurNominale);

  const rawAssocies = (formData.associes || []) as Array<Record<string, unknown>>;

  const associes = rawAssocies.map((a: Record<string, unknown>, i: number) => {
    const apport = a.apport as number;
    const actions = Math.floor(apport / valeurNominale);
    const pourcentage = ((apport / capital) * 100).toFixed(2);
    const previousActions = rawAssocies.slice(0, i).reduce(
      (sum: number, prev: Record<string, unknown>) => sum + Math.floor((prev.apport as number) / valeurNominale), 0
    );
    return {
      rang: i + 1,
      civilite: a.civilite || "Monsieur",
      nom: a.nom,
      prenom: a.prenom,
      nom_complet: `${a.prenom} ${a.nom}`,
      date_naissance: a.date_naissance,
      lieu_naissance: a.lieu_naissance,
      nationalite: a.nationalite,
      profession: a.profession,
      adresse: a.adresse,
      apport: formatNumber(apport),
      apport_lettres: numberToWords(apport),
      actions,
      pourcentage,
      type_apport: a.type_apport === "numeraire" ? "numéraire" : a.type_apport === "nature" ? "nature" : "industrie",
      numero_debut: previousActions + 1,
      numero_fin: previousActions + actions,
    };
  });

  const associesNumeraire = rawAssocies.filter((a: Record<string, unknown>) => a.type_apport === "numeraire");
  const associesNature = rawAssocies.filter((a: Record<string, unknown>) => a.type_apport === "nature");
  const associesIndustrie = rawAssocies.filter((a: Record<string, unknown>) => a.type_apport === "industrie");

  const totalApportsNumeraire = associesNumeraire.reduce((sum: number, a: Record<string, unknown>) => sum + (a.apport as number), 0);
  const totalApportsNature = associesNature.reduce((sum: number, a: Record<string, unknown>) => sum + (a.apport as number), 0);

  const president = (formData.president || {}) as Record<string, unknown>;
  const presidentType = (president.type as string) || "physique";
  const dg = (formData.dg || {}) as Record<string, unknown>;
  const cacTitulaire = (formData.cac_titulaire || {}) as Record<string, unknown>;
  const cacSuppleant = (formData.cac_suppleant || {}) as Record<string, unknown>;

  const modeLiberation = (formData.mode_liberation as string) || "intégralement";

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    forme_juridique: "Société par Actions Simplifiée",
    objet_social: formData.objet_social,
    siege_social: formData.siege_social,
    ville: formData.ville,
    pays: formData.pays || "République du Congo",
    duree: formData.duree || 99,
    exercice_debut: formData.exercice_debut || "1er janvier",
    exercice_fin: formData.exercice_fin || "31 décembre",
    premier_exercice_fin: formData.premier_exercice_fin || "31 décembre " + new Date().getFullYear(),
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    valeur_nominale: formatNumber(valeurNominale),
    nombre_actions: nombreActions,
    nombre_actions_numeraire: Math.floor(totalApportsNumeraire / valeurNominale) || nombreActions,
    nombre_actions_nature: Math.floor(totalApportsNature / valeurNominale),

    // Associés / actionnaires
    associes,
    nombre_associes: associes.length,
    total_apports_numeraire: formatNumber(totalApportsNumeraire || capital),
    total_apports_numeraire_lettres: numberToWords(totalApportsNumeraire || capital),
    total_apports_nature: formatNumber(totalApportsNature),
    total_apports: formatNumber(capital),
    total_apports_lettres: numberToWords(capital),
    has_apports_nature: totalApportsNature > 0,
    has_apports_industrie: associesIndustrie.length > 0,

    // Apports en nature
    associes_nature: associesNature.map((a: Record<string, unknown>) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_nature: a.description_apport || "...",
      montant_apport_nature: formatNumber(a.apport as number),
      actions_nature: Math.floor((a.apport as number) / valeurNominale),
    })),

    // Apports en industrie
    associes_industrie: associesIndustrie.map((a: Record<string, unknown>) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_industrie: a.description_apport || "...",
    })),

    // Commissaire aux apports
    has_commissaire_apports: totalApportsNature > 0,
    commissaire_apports_nom: formData.commissaire_apports_nom || "...",
    date_rapport_commissaire: formData.date_rapport_commissaire || "...",
    date_depot_rapport: formData.date_depot_rapport || "...",

    // Libération
    mode_liberation: modeLiberation,
    date_certificat_depot: formData.date_certificat_depot || "...",
    nom_depositaire: formData.nom_depositaire || "...",
    lieu_depot: formData.lieu_depot || "...",
    jours_appel_fonds: formData.jours_appel_fonds || "quinze",

    // Président
    president_personne_physique: presidentType === "physique",
    president_personne_morale: presidentType === "morale",
    president_civilite: president.civilite || "Monsieur",
    president_nom: president.nom || "",
    president_prenom: president.prenom || "",
    president_nom_complet: `${president.prenom || ""} ${president.nom || ""}`.trim(),
    president_date_naissance: president.date_naissance || "",
    president_lieu_naissance: president.lieu_naissance || "",
    president_nationalite: president.nationalite || "",
    president_adresse: president.adresse || "",
    president_duree_mandat: president.duree_mandat || "quatre ans",
    // Président personne morale
    president_denomination_pm: president.denomination_pm || "",
    president_forme_pm: president.forme_pm || "",
    president_capital_pm: president.capital_pm || "",
    president_siege_pm: president.siege_pm || "",
    president_rccm_pm: president.rccm_pm || "",
    president_representant_nom: president.representant_nom || "",
    president_representant_qualite: president.representant_qualite || "",

    // DG optionnel
    has_dg: !!formData.has_dg,
    dg_civilite: dg.civilite || "Monsieur",
    dg_nom: dg.nom || "",
    dg_prenom: dg.prenom || "",
    dg_adresse: dg.adresse || "",

    // Quorum et majorité (liberté statutaire)
    quorum_ago_1: formData.quorum_ago_1 || "25",
    quorum_ago_2: formData.quorum_ago_2 || "0",
    quorum_age_1: formData.quorum_age_1 || "50",
    quorum_age_2: formData.quorum_age_2 || "25",
    majorite_ago: formData.majorite_ago || "50",
    majorite_age: formData.majorite_age || "67",
    majorite_ecrite: formData.majorite_ecrite || "50",

    // Clauses de cession (4 variantes)
    clause_agrement: !!formData.clause_agrement,
    clause_preemption: !!formData.clause_preemption,
    clause_inalienabilite: !!formData.clause_inalienabilite,
    clause_exclusion: !!formData.clause_exclusion,
    delai_preemption: formData.delai_preemption || "3",
    duree_inalienabilite: formData.duree_inalienabilite || "5",
    jours_notification_exclusion: formData.jours_notification_exclusion || "30",

    // CAC (conditionnel pour SAS)
    has_cac: !!formData.has_cac,
    no_cac: !formData.has_cac,
    cac_titulaire_nom: cacTitulaire.nom || "...",
    cac_titulaire_prenom: cacTitulaire.prenom || "",
    cac_titulaire_adresse: cacTitulaire.adresse || "...",
    cac_suppleant_nom: cacSuppleant.nom || "...",
    cac_suppleant_prenom: cacSuppleant.prenom || "",
    cac_suppleant_adresse: cacSuppleant.adresse || "...",

    // Contestations
    contestation_droit_commun: formData.mode_contestation !== "arbitrage",
    contestation_arbitrage: formData.mode_contestation === "arbitrage",

    // Engagements
    mandataire_civilite: (formData.mandataire as Record<string, unknown>)?.civilite || president.civilite || "Monsieur",
    mandataire_prenom: (formData.mandataire as Record<string, unknown>)?.prenom || president.prenom || "...",
    mandataire_nom: (formData.mandataire as Record<string, unknown>)?.nom || president.nom || "...",
    mandataire_adresse: (formData.mandataire as Record<string, unknown>)?.adresse || president.adresse || "...",
    engagements_mandataire: formData.engagements_mandataire || "...",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville,
    reference_legale: "Acte Uniforme OHADA relatif au droit des sociétés commerciales et du GIE",
  };
}
