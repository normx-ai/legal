import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateCertificatActionsNominatives(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.titulaire_nom as string)?.trim()) {
    errors.push({ field: "titulaire_nom", message: "Le nom du titulaire est obligatoire" });
  }
  const nombre_actions = data.nombre_actions as number;
  if (!nombre_actions || nombre_actions <= 0) {
    errors.push({ field: "nombre_actions", message: "Le nombre d'actions est obligatoire" });
  }
  const valeur_nominale_action = data.valeur_nominale_action as number;
  if (!valeur_nominale_action || valeur_nominale_action <= 0) {
    errors.push({ field: "valeur_nominale_action", message: "La valeur nominale de l'action est obligatoire" });
  }

  return errors;
}
