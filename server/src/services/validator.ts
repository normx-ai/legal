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
