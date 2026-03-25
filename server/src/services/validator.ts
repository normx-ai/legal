import ohadaRules from "../../data/ohada-rules.json";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSarl(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = ohadaRules.rules.sarl;

  // Dénomination
  if (!data.denomination?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination sociale est obligatoire" });
  }

  // Objet social
  if (!data.objet_social?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }

  // Siège social
  if (!data.siege_social?.trim()) {
    errors.push({ field: "siege_social", message: "Le siège social est obligatoire" });
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

  // Associés
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

  // Vérifier que la somme des apports = capital
  const totalApports = associes.reduce((sum: number, a: any) => sum + (a.apport || 0), 0);
  if (totalApports !== data.capital) {
    errors.push({
      field: "apports",
      message: `La somme des apports (${totalApports.toLocaleString("fr-FR")} FCFA) doit être égale au capital social (${data.capital.toLocaleString("fr-FR")} FCFA)`,
    });
  }

  // Chaque associé doit avoir des infos complètes
  associes.forEach((a: any, i: number) => {
    if (!a.nom?.trim()) errors.push({ field: `associes[${i}].nom`, message: `Nom de l'associé ${i + 1} obligatoire` });
    if (!a.prenom?.trim()) errors.push({ field: `associes[${i}].prenom`, message: `Prénom de l'associé ${i + 1} obligatoire` });
    if (!a.apport || a.apport <= 0) errors.push({ field: `associes[${i}].apport`, message: `Apport de l'associé ${i + 1} obligatoire` });
  });

  // Gérant
  if (!data.gerant?.nom?.trim()) {
    errors.push({ field: "gerant.nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!data.gerant?.prenom?.trim()) {
    errors.push({ field: "gerant.prenom", message: "Le prénom du gérant est obligatoire" });
  }

  return errors;
}

export function validateSarlu(data: any): ValidationError[] {
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

export function validateSaAg(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const SA_AG_CAPITAL_MINIMUM = 10_000_000;
  const SA_AG_VALEUR_NOMINALE_MINIMUM = 10_000;
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
  if (capital < SA_AG_CAPITAL_MINIMUM) {
    errors.push({
      field: "capital",
      message: `Le capital minimum d'une SA avec AG est de ${SA_AG_CAPITAL_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Valeur nominale minimum
  if (valeurNominale < SA_AG_VALEUR_NOMINALE_MINIMUM) {
    errors.push({
      field: "valeur_nominale",
      message: `La valeur nominale minimum est de ${SA_AG_VALEUR_NOMINALE_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Capital divisible par valeur nominale
  if (capital % valeurNominale !== 0) {
    errors.push({
      field: "capital",
      message: "Le capital doit être divisible par la valeur nominale des actions",
    });
  }

  // Actionnaires
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length < 1) {
    errors.push({
      field: "associes",
      message: "Une SA avec AG doit avoir au moins 1 actionnaire",
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

export function validateSaCa(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const SA_CA_CAPITAL_MINIMUM = 10_000_000;
  const SA_CA_VALEUR_NOMINALE_MINIMUM = 10_000;
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
  if (capital < SA_CA_CAPITAL_MINIMUM) {
    errors.push({
      field: "capital",
      message: `Le capital minimum d'une SA avec CA est de ${SA_CA_CAPITAL_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Valeur nominale minimum
  if (valeurNominale < SA_CA_VALEUR_NOMINALE_MINIMUM) {
    errors.push({
      field: "valeur_nominale",
      message: `La valeur nominale minimum est de ${SA_CA_VALEUR_NOMINALE_MINIMUM.toLocaleString("fr-FR")} ${devise}`,
    });
  }

  // Capital divisible par valeur nominale
  if (capital % valeurNominale !== 0) {
    errors.push({
      field: "capital",
      message: "Le capital doit être divisible par la valeur nominale des actions",
    });
  }

  // Actionnaires
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length < 1) {
    errors.push({
      field: "associes",
      message: "Une SA avec CA doit avoir au moins 1 actionnaire",
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

  // Conseil d'Administration (3 à 12 membres)
  const administrateurs = (data.conseil_administration || []) as Array<Record<string, unknown>>;
  if (administrateurs.length < 3) {
    errors.push({
      field: "conseil_administration",
      message: "Le conseil d'administration doit comporter au moins 3 membres",
    });
  }
  if (administrateurs.length > 12) {
    errors.push({
      field: "conseil_administration",
      message: "Le conseil d'administration ne peut comporter plus de 12 membres",
    });
  }

  // Président du CA
  const presidentCa = (data.president_ca || {}) as Record<string, unknown>;
  if (!(presidentCa.nom as string)?.trim()) {
    errors.push({ field: "president_ca.nom", message: "Le nom du président du conseil d'administration est obligatoire" });
  }

  // Direction Générale : si PCA+DG, vérifier le DG
  const directionGenerale = data.direction_generale as string;
  if (directionGenerale === "variante_pca_dg") {
    const dg = (data.dg || {}) as Record<string, unknown>;
    if (!(dg.nom as string)?.trim()) {
      errors.push({ field: "dg.nom", message: "Le nom du directeur général est obligatoire" });
    }
    if (!(dg.prenom as string)?.trim()) {
      errors.push({ field: "dg.prenom", message: "Le prénom du directeur général est obligatoire" });
    }
  }

  // Commissaire aux comptes titulaire
  const cacTitulaireCa = (data.cac_titulaire || {}) as Record<string, unknown>;
  if (!(cacTitulaireCa.nom as string)?.trim()) {
    errors.push({ field: "cac_titulaire.nom", message: "Le nom du commissaire aux comptes titulaire est obligatoire" });
  }

  return errors;
}

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

export function validateStePart(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Dénomination
  if (!(data.denomination as string)?.trim()) {
    errors.push({ field: "denomination", message: "La dénomination de la société est obligatoire" });
  }

  // Objet
  if (!(data.objet_social as string)?.trim()) {
    errors.push({ field: "objet_social", message: "L'objet social est obligatoire" });
  }

  // Domicile
  if (!(data.domicile as string)?.trim()) {
    errors.push({ field: "domicile", message: "Le domicile de la société est obligatoire" });
  }

  // Associés (au moins 2)
  const associes = (data.associes || []) as Array<Record<string, unknown>>;
  if (associes.length < 2) {
    errors.push({ field: "associes", message: "Une société en participation doit avoir au moins 2 associés" });
  }

  // Chaque associé doit avoir des infos complètes
  associes.forEach((a: Record<string, unknown>, i: number) => {
    if (!(a.nom as string)?.trim()) errors.push({ field: `associes[${i}].nom`, message: `Nom de l'associé ${i + 1} obligatoire` });
    if (!(a.prenom as string)?.trim()) errors.push({ field: `associes[${i}].prenom`, message: `Prénom de l'associé ${i + 1} obligatoire` });
    if (!(a.apport as number) || (a.apport as number) <= 0) errors.push({ field: `associes[${i}].apport`, message: `Apport de l'associé ${i + 1} obligatoire` });
  });

  // Total apports
  const totalApports = associes.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.apport as number) || 0), 0);
  if (totalApports <= 0) {
    errors.push({ field: "apports", message: "Le total des apports doit être supérieur à 0" });
  }

  // Gérant
  const gerant = (data.gerant || {}) as Record<string, unknown>;
  if (!(gerant.nom as string)?.trim()) {
    errors.push({ field: "gerant.nom", message: "Le nom du gérant est obligatoire" });
  }
  if (!(gerant.prenom as string)?.trim()) {
    errors.push({ field: "gerant.prenom", message: "Le prénom du gérant est obligatoire" });
  }

  return errors;
}
