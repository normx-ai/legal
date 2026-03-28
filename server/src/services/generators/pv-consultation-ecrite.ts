import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire, Resolution } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function preparePvConsultationEcriteData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const nombrePartsTotal = formData.nombre_parts_total as number;
  const seuilOrdinaire = Math.floor(nombrePartsTotal / 2) + 1;
  const seuilExtraordinaire = Math.ceil((nombrePartsTotal * 3) / 4);

  const associes = (formData.associes || []).map((a: Associe) => ({
    civilite: a.civilite || "M.",
    prenom: a.prenom || "",
    nom: a.nom || "",
    nombre_parts: formatNumber(a.nombre_parts || 0),
  }));

  const resolutions = (formData.resolutions || []).map((r: Resolution, i: number) => ({
    numero: i + 1,
    numero_lettres: ["Première", "Deuxième", "Troisième", "Quatrième", "Cinquième", "Sixième", "Septième", "Huitième", "Neuvième", "Dixième"][i] || `${i + 1}ème`,
    texte: r.texte || "",
    adoptee: r.adoptee ? "adoptée" : "refusée",
  }));

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SARL",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    date_consultation: formData.date_consultation || "",
    date_consultation_lettres: formData.date_consultation_lettres || "",
    gerant_civilite: formData.gerant_civilite || "Monsieur",
    gerant_nom: formData.gerant_nom || "",
    gerant_prenom: formData.gerant_prenom || "",
    article_statuts: formData.article_statuts || "...",
    mode_envoi: formData.mode_envoi || "par lettre recommandée avec demande d'avis de réception",
    associes,
    resolutions,
    nombre_parts_total: formatNumber(nombrePartsTotal),
    seuil_ordinaire: formatNumber(seuilOrdinaire),
    seuil_extraordinaire: formatNumber(seuilExtraordinaire),
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
