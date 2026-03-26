import { ValidationError } from "./types";

export function validateBulletinSouscriptionConstitution(data: Record<string, unknown>): ValidationError[] {
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
  if (!(data.sigle as string)?.trim()) {
    errors.push({ field: "sigle", message: "Le sigle est obligatoire" });
  }
  if (!(data.rc_numero as string)?.trim()) {
    errors.push({ field: "rc_numero", message: "Le numéro RC est obligatoire" });
  }
  if (!(data.objet_social as string)?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }
  if (!(data.souscripteur_nom as string)?.trim()) {
    errors.push({ field: "souscripteur_nom", message: "Le nom du souscripteur est obligatoire" });
  }

  return errors;
}
