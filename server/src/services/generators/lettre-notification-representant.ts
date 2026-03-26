import { formatNumber, numberToWords } from "./utils";

export function prepareLettreNotificationRepresentantData(formData: any): Record<string, any> {
  const capital_administrateur = formData.capital_administrateur as number;
  return {
    denomination_administrateur: formData.denomination_administrateur || "",
    forme_administrateur: formData.forme_administrateur || "SA",
    capital_administrateur: capital_administrateur ? formatNumber(capital_administrateur) : "",
    capital_administrateur_lettres: capital_administrateur ? numberToWords(capital_administrateur) : "",
    siege_administrateur: formData.siege_administrateur || "",
    denomination_societe: formData.denomination_societe || "",
    representant_civilite: formData.representant_civilite || "Monsieur",
    representant_nom: formData.representant_nom || "",
    representant_prenom: formData.representant_prenom || "",
    representant_adresse: formData.representant_adresse || "",
    is_designation: !!formData.is_designation,
    is_revocation: !!formData.is_revocation,
    date_seance: formData.date_seance || "",
    ancien_representant_nom: formData.ancien_representant_nom || "",
    nouveau_representant_nom: formData.nouveau_representant_nom || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
    devise: "FCFA",
  };
}
