import { ValidationError } from "./types";

export function validateLettreInfoCaConventions(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.nature_objet_convention as string)?.trim()) {
    errors.push({ field: "nature_objet_convention", message: "La nature et l'objet de la convention sont obligatoires" });
  }
  if (!(data.personnes_concernees as string)?.trim()) {
    errors.push({ field: "personnes_concernees", message: "Les personnes concernées par la convention sont obligatoires" });
  }

  return errors;
}
