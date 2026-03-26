import { formatNumber, numberToWords } from "./utils";

export function prepareMiseEnDemeureDefaillantData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const montant_a_verser = formData.montant_a_verser as number || 0;
  const montant_appele = formData.montant_appele as number || 0;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    destinataire_civilite: formData.destinataire_civilite || "Monsieur",
    destinataire_nom: formData.destinataire_nom || "",
    destinataire_prenom: formData.destinataire_prenom || "",
    destinataire_adresse: formData.destinataire_adresse || "",
    date_courrier_initial: formData.date_courrier_initial || "",
    organe_decision: formData.organe_decision || "",
    date_deliberation: formData.date_deliberation || "",
    montant_appele: formatNumber(montant_appele),
    montant_appele_lettres: numberToWords(montant_appele),
    montant_a_verser: formatNumber(montant_a_verser),
    montant_a_verser_lettres: numberToWords(montant_a_verser),
    date_expiration_delai: formData.date_expiration_delai || "",
    signataire_fonction: formData.signataire_fonction || "",
    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
