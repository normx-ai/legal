import { ValidationError, ohadaRules } from "./types";

export function validateSaUni(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const SA_UNI_CAPITAL_MINIMUM = 10_000_000;
  const SA_UNI_VALEUR_NOMINALE_MINIMUM = 10_000;
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
  if (capital < SA_UNI_CAPITAL_MINIMUM) {
    errors.push({
      field: "capital",
      message: `Le capital minimum d'une SA Unipersonnelle est de ${SA_UNI_CAPITAL_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Valeur nominale minimum
  if (valeurNominale < SA_UNI_VALEUR_NOMINALE_MINIMUM) {
    errors.push({
      field: "valeur_nominale",
      message: `La valeur nominale minimum est de ${SA_UNI_VALEUR_NOMINALE_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Capital divisible par valeur nominale
  if (capital % valeurNominale !== 0) {
    errors.push({
      field: "capital",
      message: "Le capital doit être divisible par la valeur nominale des actions",
    });
  }

  // Actionnaire unique — exactement 1
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length !== 1) {
    errors.push({
      field: "associes",
      message: "Une SA Unipersonnelle doit avoir exactement 1 actionnaire",
    });
  }

  if (associes[0]) {
    const a = associes[0];
    if (!(a.nom as string)?.trim()) errors.push({ field: "associes[0].nom", message: "Nom de l'actionnaire obligatoire" });
    if (!(a.prenom as string)?.trim()) errors.push({ field: "associes[0].prenom", message: "Prénom de l'actionnaire obligatoire" });
    if (!(a.apport as number) || (a.apport as number) <= 0) errors.push({ field: "associes[0].apport", message: "Apport de l'actionnaire obligatoire" });
    if ((a.apport as number) !== capital) {
      errors.push({
        field: "apports",
        message: `L'apport de l'actionnaire unique (${((a.apport as number) || 0).toLocaleString("fr-FR")} FCFA) doit être égal au capital social (${capital.toLocaleString("fr-FR")} FCFA)`,
      });
    }
  }

  // Administrateur Général
  const ag = (data.ag || data.administrateur_general || {}) as Record<string, unknown>;
  if (!(ag.nom as string)?.trim()) {
    errors.push({ field: "ag.nom", message: "Le nom de l'administrateur général est obligatoire" });
  }
  if (!(ag.prenom as string)?.trim()) {
    errors.push({ field: "ag.prenom", message: "Le prénom de l'administrateur général est obligatoire" });
  }

  // Commissaire aux comptes titulaire
  const cacTitulaire = (data.cac_titulaire || {}) as Record<string, unknown>;
  if (!(cacTitulaire.nom as string)?.trim()) {
    errors.push({ field: "cac_titulaire.nom", message: "Le nom du commissaire aux comptes titulaire est obligatoire" });
  }

  return errors;
}
