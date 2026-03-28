import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validatePvAgeDissolution(data: Record<string, unknown>): ValidationError[] {
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
    errors.push({ field: "date_ag", message: "La date de l'assemblée générale extraordinaire est obligatoire" });
  }
  if (!(data.lieu_ag as string)?.trim()) {
    errors.push({ field: "lieu_ag", message: "Le lieu de l'assemblée générale est obligatoire" });
  }
  if (!(data.president_nom as string)?.trim()) {
    errors.push({ field: "president_nom", message: "Le nom du président est obligatoire" });
  }
  if (!(data.liquidateur_nom as string)?.trim()) {
    errors.push({ field: "liquidateur_nom", message: "Le nom du liquidateur est obligatoire" });
  }

  return errors;
}
