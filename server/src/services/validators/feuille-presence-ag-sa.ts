import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateFeuillePresenceAgSa(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination sociale est obligatoire" });
  }
  if (!(data.siege_social as string)?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège social est obligatoire" });
  }
  const capital = data.capital as number;
  if (!capital || capital <= 0) {
    errors.push({ field: "capital", message: "Le capital social est obligatoire" });
  }
  if (!(data.date_ag as string)?.trim()) {
    errors.push({ field: "date_ag", message: "La date de l'assemblée générale est obligatoire" });
  }

  return errors;
}
