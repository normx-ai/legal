import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template SA Unipersonnelle (actionnaire unique).
 */
export function prepareSaUniData(formData: Record<string, unknown>): Record<string, unknown> {
  const capital = formData.capital as number;
  const valeurNominale = formData.valeur_nominale as number;
  const nombreActions = Math.floor(capital / valeurNominale);

  const rawAssocies = (formData.associes || []) as Array<Record<string, unknown>>;
  const a = rawAssocies[0] || {} as Record<string, unknown>;
  const apport = ((a.apport || 0) as number) || capital;

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
