import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validatePouvoirCa(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.mandant_nom as string)?.trim()) {
    errors.push({ field: "mandant_nom", message: "Le nom du mandant est obligatoire" });
  }
  if (!(data.mandant_prenom as string)?.trim()) {
    errors.push({ field: "mandant_prenom", message: "Le prénom du mandant est obligatoire" });
  }
  if (!(data.mandant_adresse as string)?.trim()) {
    errors.push({ field: "mandant_adresse", message: "L'adresse du mandant est obligatoire" });
  }
  if (!(data.mandataire_nom as string)?.trim()) {
    errors.push({ field: "mandataire_nom", message: "Le nom du mandataire est obligatoire" });
  }
  if (!(data.mandataire_prenom as string)?.trim()) {
    errors.push({ field: "mandataire_prenom", message: "Le prénom du mandataire est obligatoire" });
  }
  if (!(data.date_reunion as string)?.trim()) {
    errors.push({ field: "date_reunion", message: "La date de la réunion est obligatoire" });
  }
  if (!(data.heure_reunion as string)?.trim()) {
    errors.push({ field: "heure_reunion", message: "L'heure de la réunion est obligatoire" });
  }
  if (!(data.lieu_reunion as string)?.trim()) {
    errors.push({ field: "lieu_reunion", message: "Le lieu de la réunion est obligatoire" });
  }

  return errors;
}
