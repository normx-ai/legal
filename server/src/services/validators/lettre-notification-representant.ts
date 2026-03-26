import { ValidationError } from "./types";

export function validateLettreNotificationRepresentant(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(data.denomination_administrateur as string)?.trim()) {
    errors.push({ field: "denomination_administrateur", message: "La dénomination de la société administrateur est obligatoire" });
  }
  if (!(data.denomination_societe as string)?.trim()) {
    errors.push({ field: "denomination_societe", message: "La dénomination de la société administrée est obligatoire" });
  }
  if (!(data.representant_nom as string)?.trim()) {
    errors.push({ field: "representant_nom", message: "Le nom du représentant permanent est obligatoire" });
  }
  if (!data.is_designation && !data.is_revocation) {
    errors.push({ field: "is_designation", message: "Vous devez choisir au moins un type : désignation ou révocation" });
  }
  if (data.is_revocation && !(data.ancien_representant_nom as string)?.trim()) {
    errors.push({ field: "ancien_representant_nom", message: "Le nom de l'ancien représentant est obligatoire en cas de révocation" });
  }

  return errors;
}
