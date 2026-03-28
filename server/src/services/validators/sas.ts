import type { FormData, Associe } from "../../types/generator";
import { ValidationError, ohadaRules } from "./types";

export function validateSas(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const SAS_CAPITAL_MINIMUM = 1_000_000;
  const devise = ohadaRules.devise;

  // Dénomination
  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination sociale est obligatoire" });
  }

  // Objet social
  if (!(data.objet_social as string)?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }

  // Siège social
  if (!(data.siege_social as string)?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège social est obligatoire" });
  }

  const capital = data.capital as number;
  const valeurNominale = data.valeur_nominale as number;

  // Capital minimum
  if (capital < SAS_CAPITAL_MINIMUM) {
    errors.push({
      field: "capital",
      message: `Le capital minimum d'une SAS est de ${SAS_CAPITAL_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Valeur nominale : pas de minimum pour SAS, mais doit être > 0
  if (!valeurNominale || valeurNominale <= 0) {
    errors.push({
      field: "valeur_nominale",
      message: "La valeur nominale doit être supérieure à 0",
    });
  }

  // Capital divisible par valeur nominale
  if (valeurNominale > 0 && capital % valeurNominale !== 0) {
    errors.push({
      field: "capital",
      message: "Le capital doit être divisible par la valeur nominale des actions",
    });
  }

  // Actionnaires (au moins 1)
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length < 1) {
    errors.push({
      field: "associes",
      message: "Une SAS doit avoir au moins 1 associé",
    });
  }

  // Vérifier que la somme des apports = capital
  const totalApports = associes.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.apport as number) || 0), 0);
  if (totalApports !== capital) {
    errors.push({
      field: "apports",
      message: `La somme des apports (${totalApports.toLocaleString("fr-FR")} FCFA) doit être égale au capital social (${capital.toLocaleString("fr-FR")} FCFA)`,
    });
  }

  // Chaque actionnaire doit avoir des infos complètes
  associes.forEach((a: Record<string, unknown>, i: number) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes[${i}].nom`, message: `Nom de l'actionnaire ${i + 1} obligatoire` });
    if (!(a.prenom as string)?.trim()) errors.push({ field: `associes[${i}].prenom`, message: `Prénom de l'actionnaire ${i + 1} obligatoire` });
    if (!(a.apport as number) || (a.apport as number) <= 0) errors.push({ field: `associes[${i}].apport`, message: `Apport de l'actionnaire ${i + 1} obligatoire` });
  });

  // Président obligatoire
  const president = (data.president || {}) as Record<string, unknown>;
  if (!(president.nom as string)?.trim()) {
    errors.push({ field: "president.nom", message: "Le nom du président est obligatoire" });
  }

  return errors;
}
