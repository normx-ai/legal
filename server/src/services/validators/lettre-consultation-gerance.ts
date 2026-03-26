import { ValidationError } from "./types";

export function validateLettreConsultationGerance(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.resolutions as string)?.trim()) {
    errors.push({ field: "resolutions", message: "Le texte des résolutions est obligatoire" });
  }
  if (!(data.gerant_nom as string)?.trim()) {
    errors.push({ field: "gerant_nom", message: "Le nom du gérant est obligatoire" });
  }
  const nombre_parts_total = data.nombre_parts_total as number;
  if (!nombre_parts_total || nombre_parts_total <= 0) {
    errors.push({ field: "nombre_parts_total", message: "Le nombre total de parts est obligatoire" });
  }
  if (!(data.date_limite_reponse as string)?.trim()) {
    errors.push({ field: "date_limite_reponse", message: "La date limite de réponse est obligatoire" });
  }

  return errors;
}
