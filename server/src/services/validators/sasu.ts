import type { FormData, Associe } from "../../types/generator";
import { ValidationError, ohadaRules } from "./types";

export function validateSasu(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const SASU_CAPITAL_MINIMUM = 1_000_000;
  const SASU_VALEUR_NOMINALE_MINIMUM = 10_000;
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
  if (capital < SASU_CAPITAL_MINIMUM) {
    errors.push({
      field: "capital",
      message: `Le capital minimum d'une SASU est de ${SASU_CAPITAL_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Valeur nominale minimum
  if (valeurNominale < SASU_VALEUR_NOMINALE_MINIMUM) {
    errors.push({
      field: "valeur_nominale",
      message: `La valeur nominale minimum est de ${SASU_VALEUR_NOMINALE_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Capital divisible par valeur nominale
  if (capital % valeurNominale !== 0) {
    errors.push({
      field: "capital",
      message: "Le capital doit être divisible par la valeur nominale des actions",
    });
  }

  // Associé unique — exactement 1
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length !== 1) {
    errors.push({
      field: "associes",
      message: "Une SASU doit avoir exactement 1 associé",
    });
  }

  if (associes[0]) {
    const a = associes[0];
    if (!(a.nom as string)?.trim()) errors.push({ field: "associes[0].nom", message: "Nom de l'associé unique obligatoire" });
    if (!(a.prenom as string)?.trim()) errors.push({ field: "associes[0].prenom", message: "Prénom de l'associé unique obligatoire" });
    if (!(a.apport as number) || (a.apport as number) <= 0) errors.push({ field: "associes[0].apport", message: "Apport de l'associé unique obligatoire" });
    if ((a.apport as number) !== capital) {
      errors.push({
        field: "apports",
        message: `L'apport de l'associé unique (${((a.apport as number) || 0).toLocaleString("fr-FR")} FCFA) doit être égal au capital social (${capital.toLocaleString("fr-FR")} FCFA)`,
      });
    }
  }

  // Président
  const president = (data.president || {}) as Record<string, unknown>;
  if (!(president.nom as string)?.trim()) {
    errors.push({ field: "president.nom", message: "Le nom du président est obligatoire" });
  }
  if (!(president.prenom as string)?.trim()) {
    errors.push({ field: "president.prenom", message: "Le prénom du président est obligatoire" });
  }

  // Commissaire aux comptes (conditionnel)
  if (data.has_cac) {
    const cacTitulaire = (data.cac_titulaire || {}) as Record<string, unknown>;
    if (!(cacTitulaire.nom as string)?.trim()) {
      errors.push({ field: "cac_titulaire.nom", message: "Le nom du commissaire aux comptes titulaire est obligatoire" });
    }
  }

  return errors;
}
