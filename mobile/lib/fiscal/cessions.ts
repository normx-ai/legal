// Bareme fiscal des cessions OHADA / Congo (loi de finances 2025).
// Sources : Code general des impots du Congo + AU OHADA pour la procedure.
// A actualiser avec les lois de finances annuelles.

import { findCountry } from "@/lib/ohada/countries";

export interface FiscalImpact {
  /** Type de droit ou taxe */
  label: string;
  /** Taux en % */
  rate: number;
  /** Base de calcul */
  base: number;
  /** Montant calcule */
  amount: number;
  /** Reference legale */
  reference: string;
}

export interface FiscalSummary {
  type: "cession-parts-sarl" | "cession-actions-sa" | "augmentation-capital" | "fusion";
  countryCode: string;
  prixCession: number;
  impacts: FiscalImpact[];
  totalDue: number;
  notes: string[];
}

export interface CessionPartsInput {
  prixCession: number;
  countryCode: string;
  /** Cessionnaire deja associe ? (impacte le taux dans certains pays) */
  entreAssocies?: boolean;
}

/**
 * Cession de parts sociales SARL — droits d'enregistrement.
 * Congo (CGI art. 297) : 5% du prix de cession + droit fixe de timbre.
 * Cote d'Ivoire (CGI art. 1116) : 5%.
 * Senegal (CGI art. 469) : 1% (avec abattement specifique).
 * Cameroun : 5%.
 * Defaut : 5% conformement a la moyenne OHADA.
 */
export function calculateCessionParts({ prixCession, countryCode, entreAssocies }: CessionPartsInput): FiscalSummary {
  const country = findCountry(countryCode);
  const impacts: FiscalImpact[] = [];
  const notes: string[] = [];

  // Taux droits d'enregistrement
  let rate = 5;
  let reference = "CGI Congo art. 297 — droit proportionnel";

  if (countryCode === "SN") {
    rate = 1;
    reference = "CGI Senegal art. 469";
  } else if (countryCode === "CI") {
    rate = 5;
    reference = "CGI Cote d'Ivoire art. 1116";
  } else if (countryCode === "CM") {
    rate = 5;
    reference = "CGI Cameroun";
  } else if (countryCode === "BJ") {
    rate = 8;
    reference = "CGI Benin art. 295";
  } else if (countryCode === "BF") {
    rate = 5;
    reference = "CGI Burkina Faso";
  } else if (countryCode === "ML") {
    rate = 5;
    reference = "CGI Mali art. 374";
  } else if (countryCode === "TG") {
    rate = 5;
    reference = "CGI Togo";
  }

  if (entreAssocies && countryCode === "CG") {
    notes.push("Cession entre associes pre-existants : pas de reduction specifique au Congo, taux plein applicable.");
  }

  impacts.push({
    label: "Droits d'enregistrement",
    rate,
    base: prixCession,
    amount: Math.round(prixCession * rate / 100),
    reference,
  });

  // Droit fixe de timbre (variable selon pays)
  const timbre = countryCode === "SN" ? 2_000 : countryCode === "CI" ? 18_000 : 6_000;
  impacts.push({
    label: "Droit de timbre (acte)",
    rate: 0,
    base: timbre,
    amount: timbre,
    reference: `Droit fixe — ${country?.name || "OHADA"}`,
  });

  // Plus-value (si applicable, hors champ pour cessions entre associes < seuil)
  notes.push("La plus-value de cession peut etre soumise a l'impot sur le revenu du cedant (a verifier selon residence fiscale).");
  notes.push("L'enregistrement doit etre realise dans le mois suivant la signature (art. 70 AUSCGIE).");

  const totalDue = impacts.reduce((s, i) => s + i.amount, 0);

  return {
    type: "cession-parts-sarl",
    countryCode,
    prixCession,
    impacts,
    totalDue,
    notes,
  };
}

/**
 * Cession d'actions SA / SAS — droits d'enregistrement.
 * Generalement taux reduit vs cession de parts (instruments financiers).
 */
export function calculateCessionActions({ prixCession, countryCode }: CessionPartsInput): FiscalSummary {
  const country = findCountry(countryCode);
  const impacts: FiscalImpact[] = [];
  const notes: string[] = [];

  // Taux droits d'enregistrement actions (generalement 1-2%)
  let rate = 1;
  let reference = "CGI Congo art. 297";

  if (countryCode === "CI") rate = 1;
  else if (countryCode === "SN") rate = 1;
  else if (countryCode === "CM") rate = 2;
  else if (countryCode === "BJ") rate = 1;

  impacts.push({
    label: "Droits d'enregistrement",
    rate,
    base: prixCession,
    amount: Math.round(prixCession * rate / 100),
    reference,
  });

  // Droit de timbre
  const timbre = 6_000;
  impacts.push({
    label: "Droit de timbre (acte)",
    rate: 0,
    base: timbre,
    amount: timbre,
    reference: `Droit fixe — ${country?.name || "OHADA"}`,
  });

  notes.push("Les actions de societes cotees ne sont pas soumises aux droits d'enregistrement (regime des valeurs mobilieres).");
  notes.push("Plus-value sur cession d'actions : verifier le regime IRPP/IS du cedant selon residence fiscale.");

  const totalDue = impacts.reduce((s, i) => s + i.amount, 0);

  return {
    type: "cession-actions-sa",
    countryCode,
    prixCession,
    impacts,
    totalDue,
    notes,
  };
}

export interface AugmentationCapitalInput {
  augmentation: number;
  countryCode: string;
  /** Augmentation par incorporation de reserves (taux reduit) */
  parIncorporationReserves?: boolean;
}

/**
 * Augmentation de capital — droits d'apport / d'enregistrement.
 */
export function calculateAugmentationCapital({ augmentation, countryCode, parIncorporationReserves }: AugmentationCapitalInput): FiscalSummary {
  const country = findCountry(countryCode);
  const impacts: FiscalImpact[] = [];
  const notes: string[] = [];

  let rate = parIncorporationReserves ? 1 : 1;
  let reference = "CGI — droit d'apport";

  // Generalement 1% sur les apports purs et simples, ou un droit fixe selon montant
  impacts.push({
    label: parIncorporationReserves ? "Droit d'enregistrement (incorp. reserves)" : "Droit d'apport",
    rate,
    base: augmentation,
    amount: Math.round(augmentation * rate / 100),
    reference,
  });

  notes.push("Augmentation par apports en numeraire : libration possible en plusieurs fois (1/4 minimum a la souscription).");
  notes.push("Augmentation par apports en nature : commissaire aux apports obligatoire au-dela de certains seuils.");

  const totalDue = impacts.reduce((s, i) => s + i.amount, 0);

  return {
    type: "augmentation-capital",
    countryCode,
    prixCession: augmentation,
    impacts,
    totalDue,
    notes,
  };
}

export function formatFCFA(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA";
}
