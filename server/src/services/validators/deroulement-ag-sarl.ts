import { ValidationError } from "./types";

export function validateDeroulementAgSarl(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La d\u00e9nomination sociale est obligatoire" });
  }
  if (!(data.siege_social as string)?.trim()) {
    errors.push({ field: "siege_social", message: "Le si\u00e8ge social est obligatoire" });
  }
  const capital = data.capital as number;
  if (!capital || capital <= 0) {
    errors.push({ field: "capital", message: "Le capital social est obligatoire" });
  }
  if (!(data.type_ag as string)?.trim()) {
    errors.push({ field: "type_ag", message: "Le type d'assembl\u00e9e g\u00e9n\u00e9rale est obligatoire" });
  }

  return errors;
}
