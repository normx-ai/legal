import { ValidationError } from "./types";

export function validateRapportGestion(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination sociale est obligatoire" });
  }
  if (!(data.forme_juridique as string)?.trim()) {
    errors.push({ field: "forme_juridique", message: "La forme juridique est obligatoire" });
  }
  if (!(data.siege_social as string)?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège social est obligatoire" });
  }

  const capital = data.capital as number;
  if (!capital || capital <= 0) {
    errors.push({ field: "capital", message: "Le capital social est obligatoire" });
  }

  if (!(data.exercice_clos_le as string)?.trim()) {
    errors.push({ field: "exercice_clos_le", message: "La date de clôture de l'exercice est obligatoire" });
  }
  if (!(data.date_ago as string)?.trim()) {
    errors.push({ field: "date_ago", message: "La date de l'AGO est obligatoire" });
  }

  if (!(data.description_activites as string)?.trim()) {
    errors.push({ field: "description_activites", message: "La description des activités est obligatoire" });
  }

  if (data.chiffre_affaires === undefined || data.chiffre_affaires === null) {
    errors.push({ field: "chiffre_affaires", message: "Le chiffre d'affaires est obligatoire" });
  }
  if (data.resultat_net === undefined || data.resultat_net === null) {
    errors.push({ field: "resultat_net", message: "Le résultat net est obligatoire" });
  }

  if (!(data.perspectives_avenir as string)?.trim()) {
    errors.push({ field: "perspectives_avenir", message: "Les perspectives d'avenir sont obligatoires" });
  }

  if (!(data.resolutions_proposees as string)?.trim()) {
    errors.push({ field: "resolutions_proposees", message: "Les résolutions proposées sont obligatoires" });
  }

  if (!(data.signataire as string)?.trim()) {
    errors.push({ field: "signataire", message: "Le signataire est obligatoire" });
  }

  return errors;
}
