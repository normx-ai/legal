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
