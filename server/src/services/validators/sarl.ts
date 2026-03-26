import { ValidationError, ohadaRules } from "./types";

export function validateSarl(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = ohadaRules.rules.sarl;

  // Denomination
  if (!data.denomination?.trim()) {
    errors.push({ field: "denomination", message: "La denomination sociale est obligatoire" });
  }

  // Objet social
  if (!data.objet_social?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }

  // Siege social
  if (!data.siege_social?.trim()) {
    errors.push({ field: "siege_social", message: "Le siege social est obligatoire" });
  }

  // Capital minimum
  if (data.capital < rules.capital_minimum) {
    errors.push({
      field: "capital",
      message: `Le capital minimum d'une SARL est de ${rules.capital_minimum.toLocaleString("fr-FR")} ${ohadaRules.devise}`,
    });
  }

  // Valeur nominale minimum
  if (data.valeur_nominale < rules.valeur_nominale_minimum) {
    errors.push({
      field: "valeur_nominale",
      message: `La valeur nominale minimum est de ${rules.valeur_nominale_minimum.toLocaleString("fr-FR")} ${ohadaRules.devise}`,
    });
  }

  // Capital divisible par valeur nominale
  if (data.capital % data.valeur_nominale !== 0) {
    errors.push({
      field: "capital",
      message: "Le capital doit être divisible par la valeur nominale des parts",
    });
  }

  // Associes
  const associes = data.associes || [];
  if (associes.length < rules.associes_min) {
    errors.push({
      field: "associes",
      message: `Une SARL doit avoir au moins ${rules.associes_min} associé(s)`,
    });
  }
  if (associes.length > rules.associes_max) {
    errors.push({
      field: "associes",
      message: `Une SARL ne peut avoir plus de ${rules.associes_max} associés`,
    });
  }

  // Verifier que la somme des apports = capital
  const totalApports = associes.reduce((sum: number, a: any) => sum + (a.apport || 0), 0);
  if (totalApports !== data.capital) {
    errors.push({
      field: "apports",
      message: `La somme des apports (${totalApports.toLocaleString("fr-FR")} FCFA) doit être égale au capital social (${data.capital.toLocaleString("fr-FR")} FCFA)`,
    });
  }

  // Chaque associe doit avoir des infos completes
  associes.forEach((a: any, i: number) => {
    if (!a.nom?.trim()) errors.push({ field: `associes[${i}].nom`, message: `Nom de l'associé ${i + 1} obligatoire` });
    if (!a.prenom?.trim()) errors.push({ field: `associes[${i}].prenom`, message: `Prénom de l'associé ${i + 1} obligatoire` });
    if (!a.apport || a.apport <= 0) errors.push({ field: `associes[${i}].apport`, message: `Apport de l'associé ${i + 1} obligatoire` });
  });

  // Gerant
  if (!data.gerant?.nom?.trim()) {
    errors.push({ field: "gerant.nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!data.gerant?.prenom?.trim()) {
    errors.push({ field: "gerant.prenom", message: "Le prénom du gérant est obligatoire" });
  }

  return errors;
}
