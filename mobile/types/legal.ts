export interface AssocieRow {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
  parts: number;
  mandataire_nom?: string;
}

export interface ActionnaireRow {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
  nombre_actions: number;
  nombre_voix?: number;
  mandataire_nom?: string;
}

export interface GerantRow {
  civilite: string;
  nom: string;
  prenom: string;
}

export interface ResolutionRow {
  titre: string;
  texte: string;
  adoptee: boolean;
}

export interface PresidentSeance {
  civilite: string;
  nom: string;
  prenom: string;
}

export const emptyAssocie = (): AssocieRow => ({
  civilite: "Monsieur",
  nom: "",
  prenom: "",
  adresse: "",
  parts: 0,
});

export const emptyActionnaire = (): ActionnaireRow => ({
  civilite: "Monsieur",
  nom: "",
  prenom: "",
  adresse: "",
  nombre_actions: 0,
});

export const emptyGerant = (): GerantRow => ({
  civilite: "Monsieur",
  nom: "",
  prenom: "",
});

export const emptyResolution = (): ResolutionRow => ({
  titre: "",
  texte: "",
  adoptee: true,
});

export const emptyPresident = (): PresidentSeance => ({
  civilite: "Monsieur",
  nom: "",
  prenom: "",
});
