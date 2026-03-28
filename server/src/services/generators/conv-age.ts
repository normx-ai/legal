import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template Convocation AGE.
 */
export function prepareConvAgeData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  const defaultOdj = `1. Augmentation du capital social
2. Modification de la date de clôture de l'exercice social
3. Changement de gérant
4. Transfert du siège social
5. Modification des statuts
6. Pouvoirs pour l'accomplissement des formalités
7. Questions diverses`;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    destinataire_civilite: formData.destinataire_civilite || "Monsieur",
    destinataire_nom: formData.destinataire_nom || "",
    destinataire_prenom: formData.destinataire_prenom || "",
    destinataire_adresse: formData.destinataire_adresse || "",

    date_ag: formData.date_ag,
    heure_ag: formData.heure_ag,
    lieu_ag: formData.lieu_ag,

    ordre_du_jour: formData.ordre_du_jour || defaultOdj,

    gerant_civilite: formData.gerant_civilite || "Monsieur",
    gerant_nom: formData.gerant_nom || "",
    gerant_prenom: formData.gerant_prenom || "",

    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
