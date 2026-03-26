import { ValidationError } from "./types";

export function validateAvisCacConventionsSa(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.commissaire_nom as string)?.trim()) {
    errors.push({ field: "commissaire_nom", message: "Le nom du commissaire aux comptes est obligatoire" });
  }
  if (!(data.convention_description as string)?.trim()) {
    errors.push({ field: "convention_description", message: "La description de la convention est obligatoire" });
  }
  if (!(data.convention_forme as string)?.trim()) {
    errors.push({ field: "convention_forme", message: "La forme de la convention est obligatoire" });
  }

  return errors;
}
