import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateSnc(data: FormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.denomination?.trim()) {
    errors.push({ field: "denomination", message: "La d\u00e9nomination sociale est obligatoire" });
  }
  if (!data.objet_social?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }
  if (!data.siege_social?.trim()) {
    errors.push({ field: "siege_social", message: "Le si\u00e8ge social est obligatoire" });
  }
  if (!data.duree || data.duree <= 0) {
    errors.push({ field: "duree", message: "La dur\u00e9e de la soci\u00e9t\u00e9 est obligatoire" });
  }

  const associes = data.associes || [];
  if (associes.length < 2) {
    errors.push({ field: "associes", message: "Une SNC doit avoir au moins 2 associ\u00e9s" });
  }

  associes.forEach((a: Associe, i: number) => {
    if (!a.nom?.trim()) errors.push({ field: `associes[${i}].nom`, message: `Nom de l'associ\u00e9 ${i + 1} obligatoire` });
    if (!a.prenom?.trim()) errors.push({ field: `associes[${i}].prenom`, message: `Pr\u00e9nom de l'associ\u00e9 ${i + 1} obligatoire` });
    if (!a.apport || a.apport <= 0) errors.push({ field: `associes[${i}].apport`, message: `Apport de l'associ\u00e9 ${i + 1} obligatoire` });
  });

  if (!data.gerant?.nom?.trim()) {
    errors.push({ field: "gerant.nom", message: "Le nom du g\u00e9rant est obligatoire" });
  }
  if (!data.gerant?.prenom?.trim()) {
    errors.push({ field: "gerant.prenom", message: "Le pr\u00e9nom du g\u00e9rant est obligatoire" });
  }

  return errors;
}
