export interface OhadaCountry {
  code: string;
  name: string;
  flag: string;
  /** Numéro ISO du pays utilisé dans les statuts/RCCM */
  rccmPrefix?: string;
}

// Les 17 États membres de l'OHADA
export const OHADA_COUNTRIES: OhadaCountry[] = [
  { code: "BJ", name: "Bénin", flag: "🇧🇯", rccmPrefix: "RB" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", rccmPrefix: "BF" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", rccmPrefix: "CM" },
  { code: "CF", name: "Centrafrique", flag: "🇨🇫", rccmPrefix: "CF" },
  { code: "KM", name: "Comores", flag: "🇰🇲", rccmPrefix: "KM" },
  { code: "CG", name: "Congo", flag: "🇨🇬", rccmPrefix: "CG" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩", rccmPrefix: "CD" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", rccmPrefix: "CI" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", rccmPrefix: "GA" },
  { code: "GQ", name: "Guinée Équatoriale", flag: "🇬🇶", rccmPrefix: "GQ" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", rccmPrefix: "GN" },
  { code: "GW", name: "Guinée-Bissau", flag: "🇬🇼", rccmPrefix: "GW" },
  { code: "ML", name: "Mali", flag: "🇲🇱", rccmPrefix: "ML" },
  { code: "NE", name: "Niger", flag: "🇳🇪", rccmPrefix: "NE" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", rccmPrefix: "SN" },
  { code: "TD", name: "Tchad", flag: "🇹🇩", rccmPrefix: "TD" },
  { code: "TG", name: "Togo", flag: "🇹🇬", rccmPrefix: "TG" },
];

const STORAGE_KEY = "normx-legal:ohada-country";

export function getStoredCountry(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredCountry(code: string | null): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (code) window.localStorage.setItem(STORAGE_KEY, code);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function findCountry(code: string | null | undefined): OhadaCountry | undefined {
  if (!code) return undefined;
  return OHADA_COUNTRIES.find(c => c.code === code);
}
