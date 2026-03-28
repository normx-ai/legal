import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateFeuillePresence(data: Record<string, unknown>): ValidationError[] {
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

  if (!(data.type_ag as string)?.trim()) {
    errors.push({ field: "type_ag", message: "Le type d'assemblée est obligatoire (ordinaire ou extraordinaire)" });
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

  const totalPartsCapital = data.total_parts_capital as number;
  if (!totalPartsCapital || totalPartsCapital <= 0) {
    errors.push({ field: "total_parts_capital", message: "Le nombre total de parts du capital est obligatoire" });
  }

  const presents = (data.associes_presents || []) as Array<Record<string, unknown>>;
  const representes = (data.associes_representes || []) as Array<Record<string, unknown>>;
  if (presents.length === 0 && representes.length === 0) {
    errors.push({ field: "associes_presents", message: "Au moins un associé présent ou représenté est requis" });
  }

  presents.forEach((a, i) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes_presents[${i}].nom`, message: `Nom de l'associé présent ${i + 1} obligatoire` });
    if (!(a.parts as number) || (a.parts as number) <= 0) errors.push({ field: `associes_presents[${i}].parts`, message: `Nombre de parts de l'associé présent ${i + 1} obligatoire` });
  });

  representes.forEach((a, i) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes_representes[${i}].nom`, message: `Nom de l'associé représenté ${i + 1} obligatoire` });
    if (!(a.mandataire_nom as string)?.trim()) errors.push({ field: `associes_representes[${i}].mandataire_nom`, message: `Nom du mandataire de l'associé représenté ${i + 1} obligatoire` });
  });

  if (!(data.president_seance_nom as string)?.trim()) {
    errors.push({ field: "president_seance_nom", message: "Le nom du président de séance est obligatoire" });
  }

  return errors;
}
