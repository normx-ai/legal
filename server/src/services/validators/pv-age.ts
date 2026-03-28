import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validatePvAge(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination sociale est obligatoire" });
  }
  if (!(data.forme_juridique as string)?.trim()) {
    errors.push({ field: "forme_juridique", message: "La forme juridique est obligatoire" });
  }
  if (!(data.siege_social as string)?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège social est obligatoire" });
  }

  const capital = data.capital as number;
  if (!capital || capital <= 0) {
    errors.push({ field: "capital", message: "Le capital social est obligatoire" });
  }

  if (!(data.date_ag as string)?.trim()) {
    errors.push({ field: "date_ag", message: "La date de l'assemblée est obligatoire" });
  }
  if (!(data.heure_ag as string)?.trim()) {
    errors.push({ field: "heure_ag", message: "L'heure de l'assemblée est obligatoire" });
  }
  if (!(data.lieu_ag as string)?.trim()) {
    errors.push({ field: "lieu_ag", message: "Le lieu de l'assemblée est obligatoire" });
  }

  const presents = (data.associes_presents || []) as Array<Record<string, unknown>>;
  const representes = (data.associes_representes || []) as Array<Record<string, unknown>>;
  if (presents.length === 0 && representes.length === 0) {
    errors.push({ field: "associes_presents", message: "Au moins un associé présent ou représenté est requis" });
  }

  presents.forEach((a, i) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes_presents[${i}].nom`, message: `Nom de l'associé présent ${i + 1} obligatoire` });
    if (!(a.prenom as string)?.trim()) errors.push({ field: `associes_presents[${i}].prenom`, message: `Prénom de l'associé présent ${i + 1} obligatoire` });
  });

  representes.forEach((a, i) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes_representes[${i}].nom`, message: `Nom de l'associé représenté ${i + 1} obligatoire` });
    if (!(a.mandataire_nom as string)?.trim()) errors.push({ field: `associes_representes[${i}].mandataire_nom`, message: `Nom du mandataire de l'associé représenté ${i + 1} obligatoire` });
  });

  if (!(data.president_seance as Record<string, unknown>)?.nom) {
    errors.push({ field: "president_seance.nom", message: "Le nom du président de séance est obligatoire" });
  }

  const resolutions = (data.resolutions || []) as Array<Record<string, unknown>>;
  if (resolutions.length === 0) {
    errors.push({ field: "resolutions", message: "Au moins une résolution est requise" });
  }
  resolutions.forEach((r, i) => {
    if (!(r.titre as string)?.trim()) errors.push({ field: `resolutions[${i}].titre`, message: `Titre de la résolution ${i + 1} obligatoire` });
    if (!(r.texte as string)?.trim()) errors.push({ field: `resolutions[${i}].texte`, message: `Texte de la résolution ${i + 1} obligatoire` });
  });

  return errors;
}
