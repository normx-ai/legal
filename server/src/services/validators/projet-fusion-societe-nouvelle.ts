import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateProjetFusionSocieteNouvelle(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(data.denomination_a as string)?.trim()) {
    errors.push({ field: "denomination_a", message: "La d\u00e9nomination de la soci\u00e9t\u00e9 A est obligatoire" });
  }
  if (!(data.denomination_b as string)?.trim()) {
    errors.push({ field: "denomination_b", message: "La d\u00e9nomination de la soci\u00e9t\u00e9 B est obligatoire" });
  }
  if (!(data.denomination_c as string)?.trim()) {
    errors.push({ field: "denomination_c", message: "La d\u00e9nomination de la soci\u00e9t\u00e9 nouvelle C est obligatoire" });
  }

  return errors;
}
