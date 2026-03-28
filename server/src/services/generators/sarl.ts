import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données du formulaire SARL pour injection dans le template docxtemplater.
 */
export function prepareSarlData(formData: FormData): TemplateData {
  const capital = formData.capital;
  const valeurNominale = formData.valeur_nominale;
  const nombreParts = Math.floor(capital / valeurNominale);

  const associes = (formData.associes || []).map((a: Associe, i: number) => {
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
      numero_debut: i === 0 ? 1 : (formData.associes.slice(0, i).reduce((sum: number, prev: Associe) => sum + Math.floor(prev.apport / valeurNominale), 0) + 1),
      numero_fin: formData.associes.slice(0, i + 1).reduce((sum: number, prev: Associe) => sum + Math.floor(prev.apport / valeurNominale), 0),
    };
  });

  const associesNumeraire = formData.associes.filter((a: Associe) => a.type_apport === "numeraire");
  const associesNature = formData.associes.filter((a: Associe) => a.type_apport === "nature");
  const associesIndustrie = formData.associes.filter((a: Associe) => a.type_apport === "industrie");

  const totalApportsNumeraire = associesNumeraire.reduce((sum: number, a: Associe) => sum + a.apport, 0);
  const totalApportsNature = associesNature.reduce((sum: number, a: Associe) => sum + a.apport, 0);

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
      (associesNature.some((a: Associe) => a.apport > 5000000) || totalApportsNature > capital / 2),
    sans_commissaire_apports: totalApportsNature > 0 &&
      !associesNature.some((a: Associe) => a.apport > 5000000) && totalApportsNature <= capital / 2,
    ville_tribunal: formData.ville_tribunal || formData.ville || "...",
    date_ordonnance: formData.date_ordonnance || "...",
    requerant_nom: formData.requerant_nom || "...",
    associes_nature: associesNature.map((a: Associe) => ({
      civilite: a.civilite,
      prenom: a.prenom,
      nom: a.nom,
      description_apport_nature: a.description_apport || "...",
      montant_apport_nature: formatNumber(a.apport),
      parts_nature: Math.floor(a.apport / valeurNominale),
    })),
    associes_industrie: associesIndustrie.map((a: Associe) => ({
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
