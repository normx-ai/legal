import type { FormData, Associe } from "../../types/generator";
import { ValidationError, ohadaRules } from "./types";

export function validateSarlu(data: FormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = ohadaRules.rules.sarl;

  if (!data.denomination?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination sociale est obligatoire" });
  }
  if (!data.objet_social?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }
  if (!data.siege_social?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège social est obligatoire" });
  }
  if (data.capital < rules.capital_minimum) {
    errors.push({ field: "capital", message: `Le capital minimum est de ${rules.capital_minimum.toLocaleString("fr-FR")} ${ohadaRules.devise}` });
  }
  if (data.valeur_nominale < rules.valeur_nominale_minimum) {
    errors.push({ field: "valeur_nominale", message: `La valeur nominale minimum est de ${rules.valeur_nominale_minimum.toLocaleString("fr-FR")} ${ohadaRules.devise}` });
  }
  if (data.capital % data.valeur_nominale !== 0) {
    errors.push({ field: "capital", message: "Le capital doit être divisible par la valeur nominale des parts" });
  }

  const associes = data.associes || [];
  if (associes.length !== 1) {
    errors.push({ field: "associes", message: "Une SARL unipersonnelle doit avoir exactement 1 associé" });
  }
  if (associes[0]) {
    const a = associes[0];
    if (!a.nom?.trim()) errors.push({ field: "associes[0].nom", message: "Nom de l'associé obligatoire" });
    if (!a.prenom?.trim()) errors.push({ field: "associes[0].prenom", message: "Prénom de l'associé obligatoire" });
    if (!a.apport || a.apport <= 0) errors.push({ field: "associes[0].apport", message: "Apport de l'associé obligatoire" });
    if (a.apport !== data.capital) {
      errors.push({ field: "apports", message: `L'apport de l'associé unique (${(a.apport || 0).toLocaleString("fr-FR")} FCFA) doit être égal au capital social (${data.capital.toLocaleString("fr-FR")} FCFA)` });
    }
  }

  if (!data.gerant?.nom?.trim()) {
    errors.push({ field: "gerant.nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!data.gerant?.prenom?.trim()) {
    errors.push({ field: "gerant.prenom", message: "Le prénom du gérant est obligatoire" });
  }

  return errors;
}
