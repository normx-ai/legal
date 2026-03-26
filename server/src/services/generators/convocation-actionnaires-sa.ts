import { formatNumber, numberToWords } from "./utils";

export function prepareConvocationActionnairesSaData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const typeAg = formData.type_ag || "ordinaire";
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
    type_ag: typeAg,
    type_ag_label: typeAg === "ordinaire" ? "Ordinaire" : typeAg === "extraordinaire" ? "Extraordinaire" : typeAg === "mixte" ? "Mixte" : "Spéciale",
    date_ag: formData.date_ag,
    heure_ag: formData.heure_ag,
    lieu_ag: formData.lieu_ag,
    ordre_du_jour: formData.ordre_du_jour || "",
    signataire_fonction: formData.signataire_fonction || "Le Conseil d'administration",
    signataire_nom: formData.signataire_nom || "",
    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
