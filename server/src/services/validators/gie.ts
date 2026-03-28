import type { FormData, Associe } from "../../types/generator";
import { ValidationError } from "./types";

export function validateGie(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Dénomination
  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination du GIE est obligatoire" });
  }

  // Objet
  if (!(data.objet_social as string)?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet du GIE est obligatoire" });
  }

  // Siège social
  if (!(data.siege_social as string)?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège du GIE est obligatoire" });
  }

  // Membres (au moins 2)
  const membres = (data.membres || []) as Array<Record<string, unknown>>;
  if (membres.length < 2) {
    errors.push({ field: "membres", message: "Un GIE doit avoir au moins 2 membres" });
  }

  // Chaque membre doit avoir des infos complètes
  membres.forEach((m: Record<string, unknown>, i: number) => {
    if (!(m.nom as string)?.trim()) errors.push({ field: `membres[${i}].nom`, message: `Nom du membre ${i + 1} obligatoire` });
    if (!(m.prenom as string)?.trim()) errors.push({ field: `membres[${i}].prenom`, message: `Prénom du membre ${i + 1} obligatoire` });
  });

  // Si capital, vérifier les apports
  const hasCapital = data.has_capital as boolean;
  if (hasCapital) {
    const capital = data.capital as number;
    const valeurNominale = data.valeur_nominale as number;

    if (!capital || capital <= 0) {
      errors.push({ field: "capital", message: "Le capital doit être supérieur à 0" });
    }
    if (!valeurNominale || valeurNominale <= 0) {
      errors.push({ field: "valeur_nominale", message: "La valeur nominale doit être supérieure à 0" });
    }
    if (capital && valeurNominale && capital % valeurNominale !== 0) {
      errors.push({ field: "capital", message: "Le capital doit être divisible par la valeur nominale des parts" });
    }

    const totalApports = membres.reduce((sum: number, m: Record<string, unknown>) => sum + ((m.apport as number) || 0), 0);
    if (capital && totalApports !== capital) {
      errors.push({
        field: "apports",
        message: `La somme des apports (${totalApports.toLocaleString("fr-FR")} FCFA) doit être égale au capital (${(capital || 0).toLocaleString("fr-FR")} FCFA)`,
      });
    }
  }

  // Administration
  const modeAdmin = data.mode_administration as string;
  if (modeAdmin === "admin_unique") {
    const admin = (data.administrateur || {}) as Record<string, unknown>;
    if (!(admin.nom as string)?.trim()) {
      errors.push({ field: "administrateur.nom", message: "Le nom de l'administrateur est obligatoire" });
    }
    if (!(admin.prenom as string)?.trim()) {
      errors.push({ field: "administrateur.prenom", message: "Le prénom de l'administrateur est obligatoire" });
    }
  }

  return errors;
}
