import { ValidationError } from "./types";

export function validateRequeteProrogationAgo(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.requerant_nom as string)?.trim()) {
    errors.push({ field: "requerant_nom", message: "Le nom du requérant est obligatoire" });
  }
  if (!(data.date_cloture_exercice as string)?.trim()) {
    errors.push({ field: "date_cloture_exercice", message: "La date de clôture de l'exercice est obligatoire" });
  }
  if (!(data.motif_prorogation as string)?.trim()) {
    errors.push({ field: "motif_prorogation", message: "Le motif de prorogation est obligatoire" });
  }

  return errors;
}
