import { ValidationError } from "./types";

export function validateDrc(data: Record<string, unknown>): ValidationError[] {
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

  const valeurNominale = data.valeur_nominale as number;
  if (!valeurNominale || valeurNominale <= 0) {
    errors.push({ field: "valeur_nominale", message: "La valeur nominale est obligatoire" });
  }

  if (capital && valeurNominale && capital % valeurNominale !== 0) {
    errors.push({ field: "capital", message: "Le capital doit être divisible par la valeur nominale" });
  }

  const signataires = (data.signataires || []) as Array<Record<string, unknown>>;
  if (signataires.length < 1) {
    errors.push({ field: "signataires", message: "Au moins un signataire est obligatoire" });
  }
  signataires.forEach((s: Record<string, unknown>, i: number) => {
    if (!(s.nom as string)?.trim()) errors.push({ field: `signataires[${i}].nom`, message: `Nom du signataire ${i + 1} obligatoire` });
    if (!(s.prenom as string)?.trim()) errors.push({ field: `signataires[${i}].prenom`, message: `Prénom du signataire ${i + 1} obligatoire` });
  });

  if (!(data.nom_banque as string)?.trim()) {
    errors.push({ field: "nom_banque", message: "Le nom de la banque dépositaire est obligatoire" });
  }

  return errors;
}
