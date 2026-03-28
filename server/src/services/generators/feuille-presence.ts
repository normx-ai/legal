import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber } from "./utils";

/**
 * Prépare les données pour le template Feuille de Présence AG.
 */
export function prepareFeuillePresenceData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  const associesPresents = (formData.associes_presents || []).map((a: Associe) => ({
    civilite: a.civilite || "Monsieur",
    nom: a.nom,
    prenom: a.prenom,
    parts: a.parts || 0,
  }));

  const associesRepresentes = (formData.associes_representes || []).map((a: Associe) => ({
    civilite: a.civilite || "Monsieur",
    nom: a.nom,
    prenom: a.prenom,
    parts: a.parts || 0,
    mandataire_nom: a.mandataire_nom || "",
  }));

  const associesAbsents = (formData.associes_absents || []).map((a: Associe) => ({
    civilite: a.civilite || "Monsieur",
    nom: a.nom,
    prenom: a.prenom,
    parts: a.parts || 0,
  }));

  const totalPartsPresentes = formData.total_parts_presentes || associesPresents.reduce((s: number, a: Associe) => s + a.parts, 0);
  const totalPartsRepresentees = formData.total_parts_representees || associesRepresentes.reduce((s: number, a: Associe) => s + a.parts, 0);
  const totalPartsAbsentes = formData.total_parts_absentes || associesAbsents.reduce((s: number, a: Associe) => s + a.parts, 0);
  const totalPartsCapital = formData.total_parts_capital as number;
  const totalPresRepres = totalPartsPresentes + totalPartsRepresentees;
  const pourcentagePresents = totalPartsCapital > 0 ? ((totalPresRepres / totalPartsCapital) * 100).toFixed(2) : "0";

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    devise: "FCFA",

    type_ag: formData.type_ag || "ordinaire",
    type_ag_label: (formData.type_ag || "ordinaire") === "ordinaire" ? "Ordinaire" : "Extraordinaire",
    date_ag: formData.date_ag,
    heure_ag: formData.heure_ag,
    lieu_ag: formData.lieu_ag,

    total_parts_capital: formatNumber(totalPartsCapital),

    associes_presents: associesPresents,
    has_associes_presents: associesPresents.length > 0,
    associes_representes: associesRepresentes,
    has_associes_representes: associesRepresentes.length > 0,
    associes_absents: associesAbsents,
    has_associes_absents: associesAbsents.length > 0,

    total_parts_presentes: formatNumber(totalPartsPresentes),
    total_parts_representees: formatNumber(totalPartsRepresentees),
    total_parts_absentes: formatNumber(totalPartsAbsentes),
    total_parts_pres_repres: formatNumber(totalPresRepres),
    pourcentage_presents: pourcentagePresents,

    president_seance_nom: formData.president_seance_nom || "",
    secretaire_nom: formData.secretaire_nom || "",
    has_secretaire: !!(formData.secretaire_nom?.trim()),
  };
}
