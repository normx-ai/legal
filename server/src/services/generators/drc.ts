import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template DRC (Déclaration de Régularité et de Conformité).
 */
export function prepareDrcData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const valeurNominale = formData.valeur_nominale as number;
  const nombreTitres = valeurNominale > 0 ? Math.floor(capital / valeurNominale) : 0;

  const signataires = (formData.signataires || []).map((s: any) => ({
    civilite: s.civilite || "Monsieur",
    nom: s.nom,
    prenom: s.prenom,
    adresse: s.adresse || "",
  }));

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique,
    siege_social: formData.siege_social,
    date_statuts: formData.date_statuts || "...",
    devise: "FCFA",

    // Signataires
    signataires,
    qualite_signataires: formData.qualite_signataires || "fondateurs, premiers membres des organes de gestion, d'administration et de direction",

    // Capital
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    valeur_nominale: formatNumber(valeurNominale),
    nombre_titres: nombreTitres,
    type_titres: formData.type_titres || "actions",

    // Libération
    liberation_fractionnee: !!formData.liberation_fractionnee,
    quotite_liberee: formData.quotite_liberee || "la moitié",

    // Banque
    nom_banque: formData.nom_banque || "...",
    adresse_banque: formData.adresse_banque || "...",

    // Organes de direction
    has_president_ca: !!formData.has_president_ca,
    president_ca_civilite: formData.president_ca_civilite || "Monsieur",
    president_ca_nom: formData.president_ca_nom || "",
    president_ca_prenom: formData.president_ca_prenom || "",

    has_dg: !!formData.has_dg,
    dg_civilite: formData.dg_civilite || "Monsieur",
    dg_nom: formData.dg_nom || "",
    dg_prenom: formData.dg_prenom || "",

    has_ag: !!formData.has_ag,
    ag_civilite: formData.ag_civilite || "Monsieur",
    ag_nom: formData.ag_nom || "",
    ag_prenom: formData.ag_prenom || "",

    has_president_sas: !!formData.has_president_sas,
    president_sas_civilite: formData.president_sas_civilite || "Monsieur",
    president_sas_nom: formData.president_sas_nom || "",
    president_sas_prenom: formData.president_sas_prenom || "",

    has_gerant: !!formData.has_gerant,
    gerant_civilite: formData.gerant_civilite || "Monsieur",
    gerant_nom: formData.gerant_nom || "",
    gerant_prenom: formData.gerant_prenom || "",

    has_cac: !!formData.has_cac,
    cac_civilite: formData.cac_civilite || "Monsieur",
    cac_nom: formData.cac_nom || "",
    cac_prenom: formData.cac_prenom || "",
    duree_mandat_cac: formData.duree_mandat_cac || "6",

    has_cac_suppleant: !!formData.has_cac_suppleant,
    cac_suppleant_civilite: formData.cac_suppleant_civilite || "Monsieur",
    cac_suppleant_nom: formData.cac_suppleant_nom || "",
    cac_suppleant_prenom: formData.cac_suppleant_prenom || "",

    // Actes antérieurs
    has_actes_anterieurs: !!formData.has_actes_anterieurs,
    sans_actes_anterieurs: !formData.has_actes_anterieurs,

    // Signature
    nombre_exemplaires: formData.nombre_exemplaires || (signataires.length + 2).toString(),
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
