import { formatNumber, numberToWords } from "./utils";

export function prepareCertificatActionsNominativesData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    titulaire_civilite: formData.titulaire_civilite || "Monsieur",
    titulaire_nom: formData.titulaire_nom || "",
    titulaire_prenom: formData.titulaire_prenom || "",
    titulaire_adresse: formData.titulaire_adresse || "",
    nombre_actions: formData.nombre_actions || 0,
    nombre_actions_lettres: formData.nombre_actions_lettres || numberToWords(formData.nombre_actions || 0),
    valeur_nominale_action: formatNumber(formData.valeur_nominale_action || 0),
    numero_certificat: formData.numero_certificat || "001",
    actions: formData.actions || [],
    date_certificat: formData.date_certificat || new Date().toLocaleDateString("fr-FR"),
    signataire_fonction: formData.signataire_fonction || "Le PCA",
    lieu_signature: formData.lieu_signature || "...",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
  };
}
