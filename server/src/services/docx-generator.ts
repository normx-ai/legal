import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";

/**
 * Génère un fichier DOCX à partir d'un template et de données.
 * Retourne le Buffer du document généré.
 */
export function generateDocx(templateName: string, data: Record<string, any>): Buffer {
  const templatePath = path.join(__dirname, "../../templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template non trouvé : ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
  });

  doc.render(data);

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}

/**
 * Prépare les données du formulaire SARL pour injection dans le template docxtemplater.
 */
export function prepareSarlData(formData: any): Record<string, any> {
  const capital = formData.capital;
  const valeurNominale = formData.valeur_nominale;
  const nombreParts = Math.floor(capital / valeurNominale);

  const associes = (formData.associes || []).map((a: any, i: number) => {
    const parts = Math.floor(a.apport / valeurNominale);
    const pourcentage = ((a.apport / capital) * 100).toFixed(2);
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
      apport: formatNumber(a.apport),
      apport_lettres: numberToWords(a.apport),
      parts,
      pourcentage,
      type_apport: a.type_apport === "numeraire" ? "numéraire" : a.type_apport === "nature" ? "nature" : "industrie",
      numero_debut: i === 0 ? 1 : (formData.associes.slice(0, i).reduce((sum: number, prev: any) => sum + Math.floor(prev.apport / valeurNominale), 0) + 1),
      numero_fin: formData.associes.slice(0, i + 1).reduce((sum: number, prev: any) => sum + Math.floor(prev.apport / valeurNominale), 0),
    };
  });

  const associesNumeraire = formData.associes.filter((a: any) => a.type_apport === "numeraire");
  const associesNature = formData.associes.filter((a: any) => a.type_apport === "nature");
  const associesIndustrie = formData.associes.filter((a: any) => a.type_apport === "industrie");

  const totalApportsNumeraire = associesNumeraire.reduce((sum: number, a: any) => sum + a.apport, 0);
  const totalApportsNature = associesNature.reduce((sum: number, a: any) => sum + a.apport, 0);

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    forme_juridique: "Société à Responsabilité Limitée",
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
    nombre_parts: nombreParts,
    associes,
    nombre_associes: associes.length,
    total_apports_numeraire: formatNumber(totalApportsNumeraire),
    total_apports_nature: formatNumber(totalApportsNature),
    total_apports: formatNumber(capital),
    has_apports_nature: totalApportsNature > 0,
    has_apports_industrie: associesIndustrie.length > 0,
    has_commissaire_apports: formData.has_commissaire_apports !== false && totalApportsNature > 0 &&
      (associesNature.some((a: any) => a.apport > 5000000) || totalApportsNature > capital / 2),
    sans_commissaire_apports: totalApportsNature > 0 &&
      !associesNature.some((a: any) => a.apport > 5000000) && totalApportsNature <= capital / 2,
    ville_tribunal: formData.ville_tribunal || formData.ville || "...",
    date_ordonnance: formData.date_ordonnance || "...",
    requerant_nom: formData.requerant_nom || "...",
    associes_nature: associesNature.map((a: any) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_nature: a.description_apport || "...",
      montant_apport_nature: formatNumber(a.apport),
      parts_nature: Math.floor(a.apport / valeurNominale),
    })),
    associes_industrie: associesIndustrie.map((a: any) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_industrie: a.description_apport || "...",
    })),
    mode_liberation: formData.mode_liberation || "intégralement",
    is_liberation_partielle: formData.mode_liberation === "la moitié",
    montant_surplus: formData.mode_liberation === "la moitié" ? formatNumber(Math.floor(valeurNominale / 2)) : "",
    date_certificat_depot: formData.date_certificat_depot || "...",
    nom_depositaire: formData.nom_depositaire || "...",
    commissaire_apports_nom: formData.commissaire_apports_nom || "...",
    lieu_depot: formData.lieu_depot || "...",
    // Cessions (art. 12)
    cession_associes_libre: formData.cession_associes !== "agrement",
    cession_associes_agrement: formData.cession_associes === "agrement",
    seuil_cession_associes: formData.seuil_cession_associes || "la moitié",
    cession_famille_libre: formData.cession_famille !== "agrement",
    cession_famille_agrement: formData.cession_famille === "agrement",
    // Transmission décès (art. 13)
    transmission_deces_libre: formData.transmission_deces !== "agrement",
    transmission_deces_agrement: formData.transmission_deces === "agrement",

    // Gérance (art. 16)
    majorite_superieure_nomination: !!formData.seuil_majorite_nomination,
    seuil_majorite_nomination: formData.seuil_majorite_nomination || "",
    majorite_superieure_vie_sociale: !!formData.seuil_majorite_vie_sociale,
    seuil_majorite_vie_sociale: formData.seuil_majorite_vie_sociale || "",
    // Pouvoirs du gérant (art. 17)
    limitation_pouvoirs: !!formData.limitations_pouvoirs,
    limitations_pouvoirs_liste: formData.limitations_pouvoirs || "",
    // Contestations (art. 28)
    contestation_droit_commun: formData.mode_contestation !== "arbitrage",
    contestation_arbitrage: formData.mode_contestation === "arbitrage",
    // Engagements (art. 29)
    mandataire_civilite: formData.mandataire?.civilite || formData.gerant?.civilite || "Monsieur",
    mandataire_prenom: formData.mandataire?.prenom || formData.gerant?.prenom || "...",
    mandataire_nom: formData.mandataire?.nom || formData.gerant?.nom || "...",
    mandataire_adresse: formData.mandataire?.adresse || formData.gerant?.adresse || "...",
    engagements_mandataire: formData.engagements_mandataire || "...",
    gerant_preavis_mois: formData.gerant_preavis_mois || "trois",
    gerant_civilite: formData.gerant.civilite || "Monsieur",
    gerant_nom: formData.gerant.nom,
    gerant_prenom: formData.gerant.prenom,
    gerant_nom_complet: `${formData.gerant.prenom} ${formData.gerant.nom}`,
    gerant_date_naissance: formData.gerant.date_naissance,
    gerant_lieu_naissance: formData.gerant.lieu_naissance,
    gerant_nationalite: formData.gerant.nationalite,
    gerant_adresse: formData.gerant.adresse,
    gerant_duree_mandat: formData.gerant.duree_mandat || "durée de la société",
    gerant_remuneration: formData.gerant.remuneration || "fixée par décision collective des associés",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville,
    reference_legale: "Acte Uniforme OHADA relatif au droit des sociétés commerciales et du GIE",
  };
}

/**
 * Prépare les données pour le template SARLU (associé unique).
 */
export function prepareSarluData(formData: any): Record<string, any> {
  const capital = formData.capital;
  const valeurNominale = formData.valeur_nominale;
  const nombreParts = Math.floor(capital / valeurNominale);
  const a = formData.associes[0]; // associé unique

  const apportNumeraire = a.type_apport === "numeraire" ? a.apport : 0;
  const apportNature = a.type_apport === "nature" ? a.apport : 0;
  const partsNumeraire = Math.floor(apportNumeraire / valeurNominale);
  const partsNature = Math.floor(apportNature / valeurNominale);

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    forme_juridique: "Société à Responsabilité Limitée Unipersonnelle",
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
    nombre_parts: nombreParts,

    // Associé unique
    associe_civilite: a.civilite || "Monsieur",
    associe_nom: a.nom,
    associe_prenom: a.prenom,
    associe_date_naissance: a.date_naissance,
    associe_lieu_naissance: a.lieu_naissance,
    associe_nationalite: a.nationalite,
    associe_profession: a.profession,
    associe_adresse: a.adresse,

    // Apports
    apport_numeraire: formatNumber(apportNumeraire || capital),
    nombre_parts_numeraire: partsNumeraire || nombreParts,
    total_apports_numeraire: formatNumber(apportNumeraire || capital),
    total_apports_nature: formatNumber(apportNature),
    total_apports: formatNumber(capital),
    has_apports_nature: apportNature > 0,
    has_parts_nature: partsNature > 0,
    description_apport_nature: a.description_apport || "...",
    montant_apport_nature: formatNumber(apportNature),
    parts_nature: partsNature,
    numero_debut_nature: 1,
    numero_fin_nature: partsNature,
    numero_debut_numeraire: partsNature > 0 ? partsNature + 1 : 1,
    numero_fin_numeraire: nombreParts,

    // Libération
    mode_liberation: formData.mode_liberation || "intégralement",
    is_liberation_partielle: formData.mode_liberation === "la moitié",
    montant_surplus: formData.mode_liberation === "la moitié" ? formatNumber(Math.floor(valeurNominale / 2)) : "",
    date_certificat_depot: formData.date_certificat_depot || "...",
    nom_depositaire: formData.nom_depositaire || "...",
    lieu_depot: formData.lieu_depot || "...",

    // Commissaire aux apports
    has_commissaire_apports: apportNature > 5000000 || apportNature > capital / 2,
    sans_commissaire_apports: apportNature > 0 && apportNature <= 5000000 && apportNature <= capital / 2,
    commissaire_apports_nom: formData.commissaire_apports_nom || "...",
    date_ordonnance: formData.date_ordonnance || "...",

    // Gérance
    gerant_civilite: formData.gerant.civilite || "Monsieur",
    gerant_nom: formData.gerant.nom,
    gerant_prenom: formData.gerant.prenom,
    gerant_date_naissance: formData.gerant.date_naissance,
    gerant_lieu_naissance: formData.gerant.lieu_naissance,
    gerant_nationalite: formData.gerant.nationalite,
    gerant_adresse: formData.gerant.adresse,
    gerant_duree_mandat: formData.gerant.duree_mandat || "durée de la société",
    gerant_remuneration: formData.gerant.remuneration || "fixée par décision de l'associé unique",
    gerant_preavis_mois: formData.gerant.preavis_mois || "trois",

    // Pouvoirs
    limitation_pouvoirs: !!formData.gerant.limitations_pouvoirs,
    limitations_pouvoirs_liste: formData.gerant.limitations_pouvoirs || "",

    // Engagements
    engagements_mandataire: formData.engagements_mandataire || "...",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville,
  };
}

/**
 * Prépare les données pour le template SA avec Administrateur Général.
 */
export function prepareSaAgData(formData: Record<string, unknown>): Record<string, unknown> {
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

  const totalApportsNumeraire = associesNumeraire.reduce((sum: number, a: Record<string, unknown>) => sum + (a.apport as number), 0);
  const totalApportsNature = associesNature.reduce((sum: number, a: Record<string, unknown>) => sum + (a.apport as number), 0);

  const ag = (formData.ag || formData.administrateur_general || {}) as Record<string, unknown>;
  const cacTitulaire = (formData.cac_titulaire || {}) as Record<string, unknown>;
  const cacSuppleant = (formData.cac_suppleant || {}) as Record<string, unknown>;

  const modeLiberation = (formData.mode_liberation as string) || "intégralement";

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    forme_juridique: "Société Anonyme avec Administrateur Général",
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

    // Associés / actionnaires
    associes,
    nombre_associes: associes.length,
    total_apports_numeraire: formatNumber(totalApportsNumeraire),
    total_apports_nature: formatNumber(totalApportsNature),
    total_apports: formatNumber(capital),
    has_apports_nature: totalApportsNature > 0,

    // Apports en nature
    associes_nature: associesNature.map((a: Record<string, unknown>) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_nature: a.description_apport || "...",
      montant_apport_nature: formatNumber(a.apport as number),
      actions_nature: Math.floor((a.apport as number) / valeurNominale),
    })),

    // Commissaire aux apports
    has_commissaire_apports: totalApportsNature > 0,
    commissaire_apports_nom: formData.commissaire_apports_nom || "...",
    date_ordonnance: formData.date_ordonnance || "...",
    ville_tribunal: formData.ville_tribunal || formData.ville || "...",

    // Libération
    mode_liberation: modeLiberation,
    is_liberation_integrale: modeLiberation === "intégralement",
    is_liberation_quart: modeLiberation === "du quart",
    is_liberation_moitie: modeLiberation === "de la moitié",
    montant_libere: modeLiberation === "du quart"
      ? formatNumber(Math.floor(capital / 4))
      : modeLiberation === "de la moitié"
        ? formatNumber(Math.floor(capital / 2))
        : formatNumber(capital),
    montant_libere_lettres: modeLiberation === "du quart"
      ? numberToWords(Math.floor(capital / 4))
      : modeLiberation === "de la moitié"
        ? numberToWords(Math.floor(capital / 2))
        : numberToWords(capital),
    date_certificat_depot: formData.date_certificat_depot || "...",
    nom_depositaire: formData.nom_depositaire || "...",
    lieu_depot: formData.lieu_depot || "...",

    // Clauses
    clause_agrement: !!formData.clause_agrement,
    clause_preemption: !!formData.clause_preemption,
    clause_inalienabilite: !!formData.clause_inalienabilite,

    // Représentation
    representation_libre: !!formData.representation_libre,
    representation_actionnaire: !!formData.representation_actionnaire,

    // Administrateur Général
    ag_civilite: ag.civilite || "Monsieur",
    ag_nom: ag.nom,
    ag_prenom: ag.prenom,
    ag_nom_complet: `${ag.prenom || ""} ${ag.nom || ""}`.trim(),
    ag_date_naissance: ag.date_naissance,
    ag_lieu_naissance: ag.lieu_naissance,
    ag_nationalite: ag.nationalite,
    ag_adresse: ag.adresse,
    ag_duree_mandat: ag.duree_mandat || "quatre ans",
    ag_remuneration: ag.remuneration || "fixée par l'assemblée générale des actionnaires",

    // Commissaire aux comptes titulaire
    cac_titulaire_nom: cacTitulaire.nom || "...",
    cac_titulaire_prenom: cacTitulaire.prenom || "",
    cac_titulaire_adresse: cacTitulaire.adresse || "...",
    cac_titulaire_duree_mandat: cacTitulaire.duree_mandat || "six exercices",

    // Commissaire aux comptes suppléant
    cac_suppleant_nom: cacSuppleant.nom || "...",
    cac_suppleant_prenom: cacSuppleant.prenom || "",
    cac_suppleant_adresse: cacSuppleant.adresse || "...",

    // Contestations
    contestation_droit_commun: formData.mode_contestation !== "arbitrage",
    contestation_arbitrage: formData.mode_contestation === "arbitrage",

    // Engagements
    mandataire_civilite: (formData.mandataire as Record<string, unknown>)?.civilite || ag.civilite || "Monsieur",
    mandataire_prenom: (formData.mandataire as Record<string, unknown>)?.prenom || ag.prenom || "...",
    mandataire_nom: (formData.mandataire as Record<string, unknown>)?.nom || ag.nom || "...",
    mandataire_adresse: (formData.mandataire as Record<string, unknown>)?.adresse || ag.adresse || "...",
    engagements_mandataire: formData.engagements_mandataire || "...",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville,
    reference_legale: "Acte Uniforme OHADA relatif au droit des sociétés commerciales et du GIE",
  };
}

/**
 * Prépare les données pour le template SA avec Conseil d'Administration.
 */
export function prepareSaCaData(formData: Record<string, unknown>): Record<string, unknown> {
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

  const totalApportsNumeraire = associesNumeraire.reduce((sum: number, a: Record<string, unknown>) => sum + (a.apport as number), 0);
  const totalApportsNature = associesNature.reduce((sum: number, a: Record<string, unknown>) => sum + (a.apport as number), 0);

  // Conseil d'Administration
  const rawAdministrateurs = (formData.conseil_administration || []) as Array<Record<string, unknown>>;
  const administrateurs = rawAdministrateurs.map((adm: Record<string, unknown>, i: number) => ({
    rang: i + 1,
    civilite: adm.civilite || "Monsieur",
    nom: adm.nom,
    prenom: adm.prenom,
    nom_complet: `${adm.prenom || ""} ${adm.nom || ""}`.trim(),
    adresse: adm.adresse,
  }));

  const presidentCa = (formData.president_ca || {}) as Record<string, unknown>;
  const directionGenerale = formData.direction_generale as string || "variante_pca_dg";
  const dg = (formData.dg || {}) as Record<string, unknown>;

  const cacTitulaire = (formData.cac_titulaire || {}) as Record<string, unknown>;
  const cacSuppleant = (formData.cac_suppleant || {}) as Record<string, unknown>;

  const modeLiberation = (formData.mode_liberation as string) || "intégralement";

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    forme_juridique: "Société Anonyme avec Conseil d'Administration",
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

    // Associés / actionnaires
    associes,
    nombre_associes: associes.length,
    total_apports_numeraire: formatNumber(totalApportsNumeraire),
    total_apports_nature: formatNumber(totalApportsNature),
    total_apports: formatNumber(capital),
    has_apports_nature: totalApportsNature > 0,

    // Apports en nature
    associes_nature: associesNature.map((a: Record<string, unknown>) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_nature: a.description_apport || "...",
      montant_apport_nature: formatNumber(a.apport as number),
      actions_nature: Math.floor((a.apport as number) / valeurNominale),
    })),

    // Commissaire aux apports
    has_commissaire_apports: totalApportsNature > 0,
    commissaire_apports_nom: formData.commissaire_apports_nom || "...",
    date_ordonnance: formData.date_ordonnance || "...",
    ville_tribunal: formData.ville_tribunal || formData.ville || "...",

    // Libération
    mode_liberation: modeLiberation,
    is_liberation_integrale: modeLiberation === "intégralement",
    is_liberation_quart: modeLiberation === "du quart",
    is_liberation_moitie: modeLiberation === "de la moitié",
    montant_libere: modeLiberation === "du quart"
      ? formatNumber(Math.floor(capital / 4))
      : modeLiberation === "de la moitié"
        ? formatNumber(Math.floor(capital / 2))
        : formatNumber(capital),
    montant_libere_lettres: modeLiberation === "du quart"
      ? numberToWords(Math.floor(capital / 4))
      : modeLiberation === "de la moitié"
        ? numberToWords(Math.floor(capital / 2))
        : numberToWords(capital),
    date_certificat_depot: formData.date_certificat_depot || "...",
    nom_depositaire: formData.nom_depositaire || "...",
    lieu_depot: formData.lieu_depot || "...",

    // Conseil d'Administration
    administrateurs,
    nombre_administrateurs: administrateurs.length,
    duree_mandat_admin: formData.duree_mandat_admin || "deux ans",
    jours_convocation_ca: formData.jours_convocation_ca || "quinze",
    voix_preponderante: !!formData.voix_preponderante,

    // Président du Conseil d'Administration
    president_ca_civilite: presidentCa.civilite || "Monsieur",
    president_ca_nom: presidentCa.nom,
    president_ca_prenom: presidentCa.prenom,
    president_ca_nom_complet: `${presidentCa.prenom || ""} ${presidentCa.nom || ""}`.trim(),
    president_ca_adresse: presidentCa.adresse,

    // Direction Générale
    variante_pca_dg: directionGenerale === "variante_pca_dg",
    variante_pdg: directionGenerale === "variante_pdg",

    // Directeur Général (si PCA + DG séparés)
    dg_civilite: dg.civilite || "Monsieur",
    dg_nom: dg.nom || "",
    dg_prenom: dg.prenom || "",
    dg_nom_complet: `${dg.prenom || ""} ${dg.nom || ""}`.trim(),
    dg_date_naissance: dg.date_naissance || "",
    dg_lieu_naissance: dg.lieu_naissance || "",
    dg_nationalite: dg.nationalite || "",
    dg_adresse: dg.adresse || "",

    // Clauses
    clause_agrement: !!formData.clause_agrement,
    clause_preemption: !!formData.clause_preemption,
    clause_inalienabilite: !!formData.clause_inalienabilite,

    // Représentation CA
    representation_ca_libre: !!formData.representation_ca_libre,
    representation_ca_administrateur: !!formData.representation_ca_administrateur,

    // Représentation AG
    representation_ag_libre: !!formData.representation_ag_libre,
    representation_ag_actionnaire: !!formData.representation_ag_actionnaire,

    // Commissaire aux comptes titulaire
    cac_titulaire_nom: cacTitulaire.nom || "...",
    cac_titulaire_prenom: cacTitulaire.prenom || "",
    cac_titulaire_adresse: cacTitulaire.adresse || "...",
    cac_titulaire_duree_mandat: cacTitulaire.duree_mandat || "six exercices",

    // Commissaire aux comptes suppléant
    cac_suppleant_nom: cacSuppleant.nom || "...",
    cac_suppleant_prenom: cacSuppleant.prenom || "",
    cac_suppleant_adresse: cacSuppleant.adresse || "...",

    // Contestations
    contestation_droit_commun: formData.mode_contestation !== "arbitrage",
    contestation_arbitrage: formData.mode_contestation === "arbitrage",

    // Engagements
    mandataire_civilite: (formData.mandataire as Record<string, unknown>)?.civilite || presidentCa.civilite || "Monsieur",
    mandataire_prenom: (formData.mandataire as Record<string, unknown>)?.prenom || presidentCa.prenom || "...",
    mandataire_nom: (formData.mandataire as Record<string, unknown>)?.nom || presidentCa.nom || "...",
    mandataire_adresse: (formData.mandataire as Record<string, unknown>)?.adresse || presidentCa.adresse || "...",
    engagements_mandataire: formData.engagements_mandataire || "...",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville,
    reference_legale: "Acte Uniforme OHADA relatif au droit des sociétés commerciales et du GIE",
  };
}

/**
 * Prépare les données pour le template SA Unipersonnelle (actionnaire unique).
 */
export function prepareSaUniData(formData: Record<string, unknown>): Record<string, unknown> {
  const capital = formData.capital as number;
  const valeurNominale = formData.valeur_nominale as number;
  const nombreActions = Math.floor(capital / valeurNominale);

  const rawAssocies = (formData.associes || []) as Array<Record<string, unknown>>;
  const a = rawAssocies[0] || {} as Record<string, unknown>;
  const apport = (a.apport as number) || capital;

  const typeApport = (a.type_apport as string) || "numeraire";
  const apportNumeraire = typeApport === "numeraire" ? apport : 0;
  const apportNature = typeApport === "nature" ? apport : 0;
  const actionsNumeraire = Math.floor((apportNumeraire || capital) / valeurNominale);
  const actionsNature = Math.floor(apportNature / valeurNominale);

  const ag = (formData.ag || formData.administrateur_general || {}) as Record<string, unknown>;
  const cacTitulaire = (formData.cac_titulaire || {}) as Record<string, unknown>;
  const cacSuppleant = (formData.cac_suppleant || {}) as Record<string, unknown>;

  const modeLiberation = (formData.mode_liberation as string) || "intégralement";

  return {
    denomination: formData.denomination,
    sigle: formData.sigle || "",
    has_sigle: !!formData.sigle,
    forme_juridique: "Société Anonyme Unipersonnelle",
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

    // Actionnaire unique
    associe_civilite: a.civilite || "Monsieur",
    associe_nom: a.nom,
    associe_prenom: a.prenom,
    associe_nom_complet: `${a.prenom || ""} ${a.nom || ""}`.trim(),
    associe_date_naissance: a.date_naissance,
    associe_lieu_naissance: a.lieu_naissance,
    associe_nationalite: a.nationalite,
    associe_profession: a.profession,
    associe_adresse: a.adresse,

    // Apports
    total_apports_numeraire: formatNumber(apportNumeraire || capital),
    total_apports_numeraire_lettres: numberToWords(apportNumeraire || capital),
    nombre_actions_numeraire: actionsNumeraire || nombreActions,
    total_apports_nature: formatNumber(apportNature),
    total_apports: formatNumber(capital),
    total_apports_lettres: numberToWords(capital),
    has_apports_nature: apportNature > 0,
    nombre_actions_nature: actionsNature,
    description_apport_nature: (a.description_apport as string) || "...",
    montant_apport_nature: formatNumber(apportNature),
    date_rapport_commissaire: (formData.date_rapport_commissaire as string) || "...",
    date_depot_rapport: (formData.date_depot_rapport as string) || "...",

    // Libération
    mode_liberation: modeLiberation,
    is_liberation_integrale: modeLiberation === "intégralement",
    is_liberation_partielle: modeLiberation !== "intégralement",
    is_liberation_quart: modeLiberation === "du quart",
    is_liberation_moitie: modeLiberation === "de la moitié",
    montant_libere: modeLiberation === "du quart"
      ? formatNumber(Math.floor(capital / 4))
      : modeLiberation === "de la moitié"
        ? formatNumber(Math.floor(capital / 2))
        : formatNumber(capital),
    montant_libere_lettres: modeLiberation === "du quart"
      ? numberToWords(Math.floor(capital / 4))
      : modeLiberation === "de la moitié"
        ? numberToWords(Math.floor(capital / 2))
        : numberToWords(capital),
    date_certificat_depot: formData.date_certificat_depot || "...",
    nom_depositaire: formData.nom_depositaire || "...",
    lieu_depot: formData.lieu_depot || "...",

    // Administrateur Général
    ag_civilite: ag.civilite || "Monsieur",
    ag_nom: ag.nom,
    ag_prenom: ag.prenom,
    ag_nom_complet: `${ag.prenom || ""} ${ag.nom || ""}`.trim(),
    ag_date_naissance: ag.date_naissance,
    ag_lieu_naissance: ag.lieu_naissance,
    ag_nationalite: ag.nationalite,
    ag_adresse: ag.adresse,
    ag_duree_mandat: ag.duree_mandat || "deux ans",

    // Commissaire aux comptes titulaire
    cac_titulaire_civilite: cacTitulaire.civilite || "Monsieur",
    cac_titulaire_nom: cacTitulaire.nom || "...",
    cac_titulaire_prenom: cacTitulaire.prenom || "",
    cac_titulaire_adresse: cacTitulaire.adresse || "...",

    // Commissaire aux comptes suppléant
    cac_suppleant_civilite: cacSuppleant.civilite || "Monsieur",
    cac_suppleant_nom: cacSuppleant.nom || "...",
    cac_suppleant_prenom: cacSuppleant.prenom || "",
    cac_suppleant_adresse: cacSuppleant.adresse || "...",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville,
    reference_legale: "Acte Uniforme OHADA relatif au droit des sociétés commerciales et du GIE",
  };
}

function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

const UNITS = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
const TEENS = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

function numberToWords(n: number): string {
  if (n === 0) return "zéro";
  if (n < 0) return "moins " + numberToWords(-n);

  let result = "";

  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    result += (millions === 1 ? "un million" : numberToWords(millions) + " millions");
    n %= 1000000;
    if (n > 0) result += " ";
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    result += (thousands === 1 ? "mille" : numberToWords(thousands) + " mille");
    n %= 1000;
    if (n > 0) result += " ";
  }

  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    result += (hundreds === 1 ? "cent" : UNITS[hundreds] + " cent");
    n %= 100;
    if (n > 0) result += " ";
    else if (hundreds > 1) result += "s";
  }

  if (n >= 10) {
    if (n < 20) {
      result += TEENS[n - 10];
      n = 0;
    } else {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (ten === 7 || ten === 9) {
        result += TENS[ten];
        if (unit + (ten === 7 ? 10 : 10) < 20) {
          result += (unit === 1 && ten === 7 ? " et " : "-") + TEENS[unit + (ten === 7 ? 0 : 0)];
        } else {
          result += "-" + TEENS[unit];
        }
        n = 0;
      } else {
        result += TENS[ten];
        if (unit === 1 && ten !== 8) result += " et ";
        else if (unit > 0) result += "-";
        n = unit;
      }
    }
  }

  if (n > 0) {
    result += UNITS[n];
  }

  return result.trim();
}
