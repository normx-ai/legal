import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validatePvConsultationEcrite(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.date_consultation as string)?.trim()) {
    errors.push({ field: "date_consultation", message: "La date de la consultation est obligatoire" });
  }
  if (!(data.gerant_nom as string)?.trim()) {
    errors.push({ field: "gerant_nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!(data.article_statuts as string)?.trim()) {
    errors.push({ field: "article_statuts", message: "L'article des statuts est obligatoire" });
  }
  const associes = data.associes as Associe[];
  if (!associes || associes.length === 0) {
    errors.push({ field: "associes", message: "Au moins un associé est requis" });
  }

  return errors;
}
