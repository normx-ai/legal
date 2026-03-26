import { ValidationError } from "./types";

export function validateConvocationActionnairesSa(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.destinataire_nom as string)?.trim()) {
    errors.push({ field: "destinataire_nom", message: "Le nom du destinataire est obligatoire" });
  }
  if (!(data.type_ag as string)?.trim()) {
    errors.push({ field: "type_ag", message: "Le type d'assemblée est obligatoire" });
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
  if (!(data.ordre_du_jour as string)?.trim()) {
    errors.push({ field: "ordre_du_jour", message: "L'ordre du jour est obligatoire" });
  }

  return errors;
}
