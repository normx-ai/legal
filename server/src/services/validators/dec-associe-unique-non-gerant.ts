import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateDecAssocieUniqueNonGerant(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.associe_nom as string)?.trim()) {
    errors.push({ field: "associe_nom", message: "Le nom de l'associé unique est obligatoire" });
  }
  if (!(data.associe_prenom as string)?.trim()) {
    errors.push({ field: "associe_prenom", message: "Le prénom de l'associé unique est obligatoire" });
  }
  if (!(data.gerant_nom as string)?.trim()) {
    errors.push({ field: "gerant_nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!(data.date_decisions as string)?.trim()) {
    errors.push({ field: "date_decisions", message: "La date des décisions est obligatoire" });
  }

  return errors;
}
