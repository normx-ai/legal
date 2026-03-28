import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateMiseEnDemeureDefaillant(data: Record<string, unknown>): ValidationError[] {
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
  const montant_a_verser = data.montant_a_verser as number;
  if (!montant_a_verser || montant_a_verser <= 0) {
    errors.push({ field: "montant_a_verser", message: "Le montant à verser est obligatoire" });
  }

  return errors;
}
