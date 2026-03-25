import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AssocieData {
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  profession: string;
  adresse: string;
  apport: number;
  type_apport: "numeraire" | "nature" | "industrie";
  description_apport: string;
}

export interface GerantData {
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
  duree_mandat: string;
  remuneration: string;
  preavis_mois: string;
  seuil_majorite_nomination: string;
  seuil_majorite_vie_sociale: string;
  limitations_pouvoirs: string;
}

export interface ClausesData {
  // Art. 12 — Cessions
  cession_associes: "libre" | "agrement";
  seuil_cession_associes: string;
  cession_famille: "libre" | "agrement";
  // Art. 13 — Transmission décès
  transmission_deces: "libre" | "agrement";
  // Art. 28 — Contestations
  mode_contestation: "droit_commun" | "arbitrage";
  // Art. 29 — Mandataire
  mandataire_civilite: string;
  mandataire_nom: string;
  mandataire_prenom: string;
  mandataire_adresse: string;
  engagements_mandataire: string;
}

export interface SarlWizardState {
  // Étape 0 — Société
  denomination: string;
  sigle: string;
  objet_social: string;
  siege_social: string;
  ville: string;
  pays: string;
  duree: number;
  exercice_debut: string;
  exercice_fin: string;
  premier_exercice_fin: string;

  // Étape 1 — Associés
  associes: AssocieData[];

  // Étape 2 — Capital & Libération
  capital: number;
  valeur_nominale: number;
  mode_liberation: "intégralement" | "la moitié";
  lieu_depot: string;
  nom_depositaire: string;
  date_certificat_depot: string;

  // Étape 3 — Gérance & Pouvoirs
  gerant: GerantData;

  // Étape 4 — Clauses
  clauses: ClausesData;

  // Signature
  date_signature: string;
  lieu_signature: string;

  // Navigation (7 étapes : 0-6)
  currentStep: number;

  // Actions
  setSociete: (data: Partial<Pick<SarlWizardState, "denomination" | "sigle" | "objet_social" | "siege_social" | "ville" | "pays" | "duree" | "exercice_debut" | "exercice_fin" | "premier_exercice_fin">>) => void;
  setAssocies: (associes: AssocieData[]) => void;
  addAssocie: () => void;
  updateAssocie: (index: number, data: Partial<AssocieData>) => void;
  removeAssocie: (index: number) => void;
  setCapital: (data: Partial<Pick<SarlWizardState, "capital" | "valeur_nominale" | "mode_liberation" | "lieu_depot" | "nom_depositaire" | "date_certificat_depot">>) => void;
  setGerant: (gerant: Partial<GerantData>) => void;
  setClauses: (clauses: Partial<ClausesData>) => void;
  setSignature: (date: string, lieu: string) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultAssocie: AssocieData = {
  civilite: "Monsieur",
  nom: "",
  prenom: "",
  date_naissance: "",
  lieu_naissance: "",
  nationalite: "Congolaise",
  profession: "",
  adresse: "",
  apport: 0,
  type_apport: "numeraire",
  description_apport: "",
};

const defaultGerant: GerantData = {
  civilite: "Monsieur",
  nom: "",
  prenom: "",
  date_naissance: "",
  lieu_naissance: "",
  nationalite: "Congolaise",
  adresse: "",
  duree_mandat: "Durée de la société",
  remuneration: "Fixée par décision collective des associés",
  preavis_mois: "trois",
  seuil_majorite_nomination: "",
  seuil_majorite_vie_sociale: "",
  limitations_pouvoirs: "",
};

const defaultClauses: ClausesData = {
  cession_associes: "libre",
  seuil_cession_associes: "la moitié",
  cession_famille: "libre",
  transmission_deces: "libre",
  mode_contestation: "droit_commun",
  mandataire_civilite: "Monsieur",
  mandataire_nom: "",
  mandataire_prenom: "",
  mandataire_adresse: "",
  engagements_mandataire: "",
};

const initialState = {
  denomination: "",
  sigle: "",
  objet_social: "",
  siege_social: "",
  ville: "Brazzaville",
  pays: "République du Congo",
  duree: 99,
  exercice_debut: "1er janvier",
  exercice_fin: "31 décembre",
  premier_exercice_fin: "",
  associes: [{ ...defaultAssocie }],
  capital: 1000000,
  valeur_nominale: 5000,
  mode_liberation: "intégralement" as const,
  lieu_depot: "",
  nom_depositaire: "",
  date_certificat_depot: "",
  gerant: { ...defaultGerant },
  clauses: { ...defaultClauses },
  date_signature: "",
  lieu_signature: "Brazzaville",
  currentStep: 0,
};

const wizardStorage = createJSONStorage(() => ({
  getItem: (key: string) => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(key);
    }
  },
}));

export const useWizardStore = create<SarlWizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setSociete: (data) => set(data),

      setAssocies: (associes) => set({ associes }),

      addAssocie: () =>
        set((s) => ({ associes: [...s.associes, { ...defaultAssocie }] })),

      updateAssocie: (index, data) =>
        set((s) => ({
          associes: s.associes.map((a, i) => (i === index ? { ...a, ...data } : a)),
        })),

      removeAssocie: (index) =>
        set((s) => ({
          associes: s.associes.filter((_, i) => i !== index),
        })),

      setCapital: (data) => set(data),

      setGerant: (gerant) =>
        set((s) => ({ gerant: { ...s.gerant, ...gerant } })),

      setClauses: (clauses) =>
        set((s) => ({ clauses: { ...s.clauses, ...clauses } })),

      setSignature: (date_signature, lieu_signature) =>
        set({ date_signature, lieu_signature }),

      setStep: (currentStep) => set({ currentStep }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      reset: () => set({
        ...initialState,
        associes: [{ ...defaultAssocie }],
        gerant: { ...defaultGerant },
        clauses: { ...defaultClauses },
      }),
    }),
    {
      name: "normx-legal-wizard",
      storage: wizardStorage,
    },
  ),
);
