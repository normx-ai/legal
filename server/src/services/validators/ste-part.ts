import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateStePart(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Dénomination
  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination de la société est obligatoire" });
  }

  // Objet
  if (!(data.objet_social as string)?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }

  // Domicile
  if (!(data.domicile as string)?.trim()) {
    errors.push({ field: "domicile", message: "Le domicile de la société est obligatoire" });
  }

  // Associés (au moins 2)
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length < 2) {
    errors.push({ field: "associes", message: "Une société en participation doit avoir au moins 2 associés" });
  }

  // Chaque associé doit avoir des infos complètes
  associes.forEach((a: Record<string, unknown>, i: number) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes[${i}].nom`, message: `Nom de l'associé ${i + 1} obligatoire` });
    if (!(a.prenom as string)?.trim()) errors.push({ field: `associes[${i}].prenom`, message: `Prénom de l'associé ${i + 1} obligatoire` });
    if (!(a.apport as number) || (a.apport as number) <= 0) errors.push({ field: `associes[${i}].apport`, message: `Apport de l'associé ${i + 1} obligatoire` });
  });

  // Total apports
  const totalApports = associes.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.apport as number) || 0), 0);
  if (totalApports <= 0) {
    errors.push({ field: "apports", message: "Le total des apports doit être supérieur à 0" });
  }

  // Gérant
  const gerant = (data.gerant || {}) as Record<string, unknown>;
  if (!(gerant.nom as string)?.trim()) {
    errors.push({ field: "gerant.nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!(gerant.prenom as string)?.trim()) {
    errors.push({ field: "gerant.prenom", message: "Le prénom du gérant est obligatoire" });
  }

  return errors;
}
