import { ValidationError } from "./types";

export function validateProjetFusionParticipation(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.societe_absorbee_denomination as string)?.trim()) {
    errors.push({ field: "societe_absorbee_denomination", message: "La d\u00e9nomination de la soci\u00e9t\u00e9 absorb\u00e9e est obligatoire" });
  }
  if (!(data.societe_absorbante_denomination as string)?.trim()) {
    errors.push({ field: "societe_absorbante_denomination", message: "La d\u00e9nomination de la soci\u00e9t\u00e9 absorbante est obligatoire" });
  }
  const actions_detenues = data.actions_detenues_par_b as number;
  if (!actions_detenues || actions_detenues <= 0) {
    errors.push({ field: "actions_detenues_par_b", message: "Le nombre d'actions d\u00e9tenues par B est obligatoire" });
  }

  return errors;
}
