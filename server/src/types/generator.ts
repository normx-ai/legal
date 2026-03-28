/**
 * Types partages pour les generators de documents juridiques OHADA
 */

// ══ Type d'entree — donnees formulaire (JSON du frontend) ══

/** Les donnees du formulaire sont un objet JSON libre dont la structure
 *  varie selon le type de document (65+ types). On utilise un Record
 *  avec des helpers d'extraction typee pour eviter les `any`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormData = Record<string, any>;

// ══ Types pour les sous-objets recurrents ══

export interface Associe {
  civilite?: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  nationalite?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  profession?: string;
  parts?: number;
  nombre_parts?: number;
  apport?: number;
  type_apport?: string;
  description_apport?: string;
  representant?: string;
  represente_par?: string;
  mandataire_nom?: string;
  qualite?: string;
  present?: boolean;
}

export interface Membre {
  civilite?: string;
  nom?: string;
  prenom?: string;
  denomination?: string;
  raison_sociale?: string;
  adresse?: string;
  siege_social?: string;
  nationalite?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  profession?: string;
  forme_juridique?: string;
  rccm?: string;
  is_personne_morale?: boolean;
  apport?: number;
  type_apport?: string;
  parts?: number;
}

export interface Administrateur {
  civilite?: string;
  nom?: string;
  prenom?: string;
  fonction?: string;
  present?: boolean;
}

export interface Signataire {
  civilite?: string;
  nom?: string;
  prenom?: string;
  qualite?: string;
  adresse?: string;
}

export interface Resolution {
  numero?: number;
  titre?: string;
  texte?: string;
  vote_pour?: number;
  vote_contre?: number;
  abstention?: number;
  adoptee?: boolean;
}

// ══ Type de sortie — donnees pretes pour le template docx ══

export type TemplateData = Record<string, string | number | boolean | undefined | Record<string, string | number | boolean | undefined>[] | Record<string, string | number | boolean | undefined>>;
