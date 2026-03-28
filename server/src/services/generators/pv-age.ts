import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template PV AGE (Procès-Verbal d'Assemblée Générale Extraordinaire).
 */
export function preparePvAgeData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  const associesPresents = (formData.associes_presents || []).map((a: Associe) => ({
    civilite: a.civilite || "Monsieur",
    nom: a.nom,
    prenom: a.prenom,
    adresse: a.adresse || "",
    parts: a.parts || 0,
  }));

  const associesRepresentes = (formData.associes_representes || []).map((a: Associe) => ({
    civilite: a.civilite || "Monsieur",
    nom: a.nom,
    prenom: a.prenom,
    adresse: a.adresse || "",
    parts: a.parts || 0,
    mandataire_nom: a.mandataire_nom || "",
  }));

  const associesAbsents = (formData.associes_absents || []).map((a: Associe) => ({
    civilite: a.civilite || "Monsieur",
    nom: a.nom,
    prenom: a.prenom,
    adresse: a.adresse || "",
    parts: a.parts || 0,
  }));

  const totalPartsPresentes = formData.total_parts_presentes || associesPresents.reduce((s: number, a: Associe) => s + a.parts, 0) + associesRepresentes.reduce((s: number, a: Associe) => s + a.parts, 0);
  const totalParts = formData.total_parts || totalPartsPresentes + associesAbsents.reduce((s: number, a: Associe) => s + a.parts, 0);
  const pourcentagePresents = totalParts > 0 ? ((totalPartsPresentes / totalParts) * 100).toFixed(2) : "0";

  const resolutions = (formData.resolutions || []).map((r: Resolution, i: number) => ({
    numero: i + 1,
    titre: r.titre || "",
    texte: r.texte || "",
    adoptee: r.adoptee !== false,
    rejetee: r.adoptee === false,
    mention_adoption: r.adoptee !== false ? "Cette résolution est adoptée à l'unanimité." : "Cette résolution est rejetée.",
  }));

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    date_ag: formData.date_ag,
    heure_ag: formData.heure_ag,
    lieu_ag: formData.lieu_ag,

    // Associés
    associes_presents: associesPresents,
    has_associes_presents: associesPresents.length > 0,
    associes_representes: associesRepresentes,
    has_associes_representes: associesRepresentes.length > 0,
    associes_absents: associesAbsents,
    has_associes_absents: associesAbsents.length > 0,

    total_parts_presentes: formatNumber(totalPartsPresentes),
    total_parts: formatNumber(totalParts),
    pourcentage_presents: pourcentagePresents,

    // Président de séance
    president_civilite: formData.president_seance?.civilite || "Monsieur",
    president_nom: formData.president_seance?.nom || "",
    president_prenom: formData.president_seance?.prenom || "",

    // Ordre du jour
    ordre_du_jour: formData.ordre_du_jour || "",

    // Résolutions
    resolutions,

    // Clôture
    heure_levee_seance: formData.heure_levee_seance || "...",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
