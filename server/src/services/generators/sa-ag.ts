import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template SA avec Administrateur Général.
 */
export function prepareSaAgData(formData: Record<string, unknown>): Record<string, unknown> {
  const capital = formData.capital as number;
  const valeurNominale = formData.valeur_nominale as number;
  const nombreActions = Math.floor(capital / valeurNominale);

  const rawAssocies = (formData.associes || []) as Array<Record<string, unknown>>;

  const associes = rawAssocies.map((a: Record<string, unknown>, i: number) => {
    const apport = (a.apport || 0) as number;
    const actions = Math.floor(apport / valeurNominale);
    const pourcentage = ((apport / capital) * 100).toFixed(2);
    const previousActions = rawAssocies.slice(0, i).reduce(
      (sum: number, prev: Record<string, unknown>) => sum + Math.floor(((prev.apport || 0) as number) / valeurNominale), 0
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

  const totalApportsNumeraire = associesNumeraire.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.apport || 0) as number), 0);
  const totalApportsNature = associesNature.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.apport || 0) as number), 0);

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
      montant_apport_nature: formatNumber((a.apport || 0) as number),
      actions_nature: Math.floor(((a.apport || 0) as number) / valeurNominale),
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
