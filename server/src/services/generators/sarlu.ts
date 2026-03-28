import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template SARLU (associé unique).
 */
export function prepareSarluData(formData: FormData): TemplateData {
  const capital = formData.capital;
  const valeurNominale = formData.valeur_nominale;
  const nombreParts = Math.floor(capital / valeurNominale);
  const a = formData.associes[0]; // associé unique

  const apportNumeraire = a.type_apport === "numeraire" ? (a.apport || 0) : 0;
  const apportNature = a.type_apport === "nature" ? (a.apport || 0) : 0;
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
