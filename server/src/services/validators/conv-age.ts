import { ValidationError } from "./types";

export function validateConvAge(data: Record<string, unknown>): ValidationError[] {
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

  if (!(data.destinataire_nom as string)?.trim()) {
    errors.push({ field: "destinataire_nom", message: "Le nom du destinataire est obligatoire" });
  }
  if (!(data.destinataire_prenom as string)?.trim()) {
    errors.push({ field: "destinataire_prenom", message: "Le prénom du destinataire est obligatoire" });
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

  if (!(data.gerant_nom as string)?.trim()) {
    errors.push({ field: "gerant_nom", message: "Le nom du gérant est obligatoire" });
  }

  return errors;
}
