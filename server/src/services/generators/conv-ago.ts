import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template Convocation AGO.
 */
export function prepareConvAgoData(formData: any): Record<string, any> {
  const capital = formData.capital as number;

  const defaultOdj = `1. Rapport de gestion du Gérant sur les opérations de l'exercice clos le ${formData.exercice_clos_le || "..."}
2. Rapport du Commissaire aux Comptes (le cas échéant)
3. Approbation des comptes annuels de l'exercice
4. Affectation du résultat de l'exercice
5. Quitus au Gérant pour sa gestion
6. Questions diverses`;

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
    exercice_clos_le: formData.exercice_clos_le || "...",

    ordre_du_jour: formData.ordre_du_jour || defaultOdj,

    gerant_civilite: formData.gerant_civilite || "Monsieur",
    gerant_nom: formData.gerant_nom || "",
    gerant_prenom: formData.gerant_prenom || "",

    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
