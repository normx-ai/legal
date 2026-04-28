import { create } from "zustand";
import { getStoredCountry, setStoredCountry } from "./countries";

interface OhadaState {
  /** Pays OHADA actif (code ISO 2 lettres). null = "Tous les pays". */
  country: string | null;
  setCountry: (code: string | null) => void;
}

export const useOhadaStore = create<OhadaState>((set) => ({
  country: getStoredCountry(),
  setCountry: (code) => {
    setStoredCountry(code);
    set({ country: code });
  },
}));
