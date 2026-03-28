/**
 * Types partages pour les generators de documents juridiques
 */

/** Donnees du formulaire — champs communs a tous les documents */
export interface FormData {
  denomination?: string;
  siege_social?: string;
  capital?: number;
  devise?: string;
  rccm?: string;
  forme_juridique?: string;
  objet_social?: string;
  duree?: number;
  date_signature?: string;
  lieu_signature?: string;
  nombre_originaux?: number;

  // Associes / Actionnaires
  associes_presents?: Associe[];
  associes_representes?: Associe[];
  associes_absents?: Associe[];
  associes?: Associe[];
  actionnaires?: Associe[];
  membres?: Membre[];
  administrateurs?: Administrateur[];
  signataires?: Signataire[];

  // Cession
  cedant_civilite?: string;
  cedant_nom?: string;
  cedant_prenom?: string;
  cedant_adresse?: string;
  cedant_parts?: number;
  cessionnaire_civilite?: string;
  cessionnaire_nom?: string;
  cessionnaire_prenom?: string;
  cessionnaire_adresse?: string;
  nombre_parts_cedees?: number;
  prix_cession?: number;
  valeur_nominale?: number;
  numero_parts_de?: string;
  numero_parts_a?: string;
  has_agrement?: boolean;
  date_agrement?: string;
  article_capital?: string;
  nombre_parts_total?: number;

  // AG / PV
  date_ag?: string;
  heure_ag?: string;
  lieu_ag?: string;
  exercice?: string;
  type_ag?: string;
  president_ag?: string;
  secretaire_ag?: string;
  scrutateur_ag?: string;
  ordre_du_jour?: string[];
  resolutions?: Resolution[];
  total_parts?: number;
  total_parts_presentes?: number;
  total_parts_representees?: number;
  total_parts_absentes?: number;
  quorum_atteint?: boolean;

  // Gerant / Dirigeant
  gerant_civilite?: string;
  gerant_nom?: string;
  gerant_prenom?: string;
  gerant_adresse?: string;
  gerant_nationalite?: string;
  gerant_date_naissance?: string;
  gerant_lieu_naissance?: string;

  // Commissaire aux comptes
  cac_nom?: string;
  cac_adresse?: string;

}

export interface Associe {
  civilite?: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  nationalite?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  parts?: number;
  apport?: number;
  type_apport?: string;
  representant?: string;
}

export interface Membre {
  civilite?: string;
  nom?: string;
  prenom?: string;
  denomination?: string;
  adresse?: string;
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
}

export interface Resolution {
  numero?: number;
  titre?: string;
  texte?: string;
  vote_pour?: number;
  vote_contre?: number;
  abstention?: number;
}

/** Resultat d'un generator — donnees pretes pour le template docx */
export type TemplateData = Record<string, string | number | boolean | undefined | TemplateData[] | TemplateData>;
