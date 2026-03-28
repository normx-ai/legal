import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validatePouvoirAg(data: Record<string, unknown>): ValidationError[] {
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

  if (!(data.mandant_nom as string)?.trim()) {
    errors.push({ field: "mandant_nom", message: "Le nom du mandant est obligatoire" });
  }
  if (!(data.mandant_prenom as string)?.trim()) {
    errors.push({ field: "mandant_prenom", message: "Le prénom du mandant est obligatoire" });
  }
  if (!(data.mandant_adresse as string)?.trim()) {
    errors.push({ field: "mandant_adresse", message: "L'adresse du mandant est obligatoire" });
  }

  const mandantParts = data.mandant_parts as number;
  if (!mandantParts || mandantParts <= 0) {
    errors.push({ field: "mandant_parts", message: "Le nombre de parts du mandant est obligatoire" });
  }

  if (!(data.mandataire_nom as string)?.trim()) {
    errors.push({ field: "mandataire_nom", message: "Le nom du mandataire est obligatoire" });
  }
  if (!(data.mandataire_prenom as string)?.trim()) {
    errors.push({ field: "mandataire_prenom", message: "Le prénom du mandataire est obligatoire" });
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

  return errors;
}
