import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateActeCessionParts(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.cedant_prenom as string)?.trim()) {
    errors.push({ field: "cedant_prenom", message: "Le prénom du cédant est obligatoire" });
  }
  if (!(data.cedant_adresse as string)?.trim()) {
    errors.push({ field: "cedant_adresse", message: "L'adresse du cédant est obligatoire" });
  }
  const cedant_parts = data.cedant_parts as number;
  if (!cedant_parts || cedant_parts <= 0) {
    errors.push({ field: "cedant_parts", message: "Le nombre de parts du cédant est obligatoire" });
  }
  if (!(data.cessionnaire_nom as string)?.trim()) {
    errors.push({ field: "cessionnaire_nom", message: "Le nom du cessionnaire est obligatoire" });
  }
  if (!(data.cessionnaire_prenom as string)?.trim()) {
    errors.push({ field: "cessionnaire_prenom", message: "Le prénom du cessionnaire est obligatoire" });
  }
  if (!(data.cessionnaire_adresse as string)?.trim()) {
    errors.push({ field: "cessionnaire_adresse", message: "L'adresse du cessionnaire est obligatoire" });
  }
  const nombre_parts_cedees = data.nombre_parts_cedees as number;
  if (!nombre_parts_cedees || nombre_parts_cedees <= 0) {
    errors.push({ field: "nombre_parts_cedees", message: "Le nombre de parts cédées est obligatoire" });
  }
  const prix_cession = data.prix_cession as number;
  if (!prix_cession || prix_cession <= 0) {
    errors.push({ field: "prix_cession", message: "Le prix de cession est obligatoire" });
  }
  const valeur_nominale = data.valeur_nominale as number;
  if (!valeur_nominale || valeur_nominale <= 0) {
    errors.push({ field: "valeur_nominale", message: "La valeur nominale est obligatoire" });
  }

  return errors;
}
