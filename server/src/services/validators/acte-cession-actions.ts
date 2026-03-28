import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateActeCessionActions(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.rccm as string)?.trim()) {
    errors.push({ field: "rccm", message: "Le numéro RCCM est obligatoire" });
  }
  if (!(data.cedant_nom as string)?.trim()) {
    errors.push({ field: "cedant_nom", message: "Le nom du cédant est obligatoire" });
  }
  if (!(data.cessionnaire_nom as string)?.trim()) {
    errors.push({ field: "cessionnaire_nom", message: "Le nom du cessionnaire est obligatoire" });
  }
  const nombre_actions_cedees = data.nombre_actions_cedees as number;
  if (!nombre_actions_cedees || nombre_actions_cedees <= 0) {
    errors.push({ field: "nombre_actions_cedees", message: "Le nombre d'actions cédées est obligatoire" });
  }
  const prix_par_action = data.prix_par_action as number;
  if (!prix_par_action || prix_par_action <= 0) {
    errors.push({ field: "prix_par_action", message: "Le prix par action est obligatoire" });
  }

  return errors;
}
