import { ValidationError } from "./types";

export function validateRenonciationDroitsSouscription(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.rc_numero as string)?.trim()) {
    errors.push({ field: "rc_numero", message: "Le numéro RC est obligatoire" });
  }
  if (!(data.actionnaire_nom as string)?.trim()) {
    errors.push({ field: "actionnaire_nom", message: "Le nom de l'actionnaire est obligatoire" });
  }
  const nombre_actions_detenues = data.nombre_actions_detenues as number;
  if (!nombre_actions_detenues || nombre_actions_detenues <= 0) {
    errors.push({ field: "nombre_actions_detenues", message: "Le nombre d'actions détenues est obligatoire" });
  }
  const nombre_actions_renoncees = data.nombre_actions_renoncees as number;
  if (!nombre_actions_renoncees || nombre_actions_renoncees <= 0) {
    errors.push({ field: "nombre_actions_renoncees", message: "Le nombre d'actions renoncées est obligatoire" });
  }
  if (!(data.date_age as string)?.trim()) {
    errors.push({ field: "date_age", message: "La date de l'AGE est obligatoire" });
  }

  return errors;
}
