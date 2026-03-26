import { ValidationError } from "./types";

export function validateProjetFusion(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.societe_absorbee_denomination as string)?.trim()) {
    errors.push({ field: "societe_absorbee_denomination", message: "La dénomination de la société absorbée est obligatoire" });
  }
  if (!(data.societe_absorbante_denomination as string)?.trim()) {
    errors.push({ field: "societe_absorbante_denomination", message: "La dénomination de la société absorbante est obligatoire" });
  }

  return errors;
}
