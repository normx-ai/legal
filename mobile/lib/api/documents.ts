import { api } from "./client";

export interface GenerateSarlPayload {
  denomination: string;
  sigle?: string;
  objet_social: string;
  siege_social: string;
  ville: string;
  pays: string;
  duree: number;
  exercice_debut: string;
  exercice_fin: string;
  premier_exercice_fin?: string;
  capital: number;
  valeur_nominale: number;
  mode_liberation: string;
  lieu_depot: string;
  nom_depositaire: string;
  date_certificat_depot: string;
  associes: {
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
    description_apport?: string;
  }[];
  gerant: {
    civilite: string;
    nom: string;
    prenom: string;
    date_naissance: string;
    lieu_naissance: string;
    nationalite: string;
    adresse: string;
    duree_mandat: string;
    remuneration: string;
    preavis_mois?: string;
    seuil_majorite_nomination?: string;
    seuil_majorite_vie_sociale?: string;
    limitations_pouvoirs?: string;
  };
  cession_associes?: string;
  seuil_cession_associes?: string;
  cession_famille?: string;
  transmission_deces?: string;
  mode_contestation?: string;
  mandataire?: {
    civilite: string;
    nom: string;
    prenom: string;
    adresse: string;
  };
  engagements_mandataire?: string;
  date_signature: string;
  lieu_signature: string;
}

export interface DocumentItem {
  id: string;
  type: string;
  label: string;
  forme_juridique: string;
  denomination: string;
  status: "draft" | "generated" | "error";
  docx_url?: string;
  pdf_url?: string;
  created_at: string;
}

export const documentsApi = {
  generate: <T>(endpoint: string, data: T) =>
    api.post<{ document: DocumentItem; docx_url: string }>(endpoint, data),

  generateSarl: (data: GenerateSarlPayload) =>
    api.post<{ document: DocumentItem; docx_url: string }>("/generate/sarl", data),

  list: () => api.get<{ documents: DocumentItem[] }>("/documents"),

  get: (id: string) => api.get<{ document: DocumentItem }>(`/documents/${id}`),

  download: (id: string, format: "docx" | "pdf") =>
    api.get(`/documents/${id}/download?format=${format}`, { responseType: "blob" }),

  getTemplates: () =>
    api.get<{ templates: { id: string; label: string; forme: string }[] }>("/templates"),
};
