import { formatNumber, numberToWords } from "./utils";

export function prepareFeuillePresenceCaData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const administrateurs = (formData.administrateurs || []).map((a: any) => ({
    civilite: a.civilite || "M.",
    prenom: a.prenom || "",
    nom: a.nom || "",
    qualite: a.qualite || "Administrateur",
    present: a.present ? "Oui" : "Non",
    represente_par: a.represente_par || "",
  }));
  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    date_reunion: formData.date_reunion,
    heure_reunion: formData.heure_reunion || "",
    lieu_reunion: formData.lieu_reunion || "",
    president_nom: formData.president_nom || "",
    secretaire_nom: formData.secretaire_nom || "",
    administrateurs,
    nombre_administrateurs: administrateurs.length,
  };
}
