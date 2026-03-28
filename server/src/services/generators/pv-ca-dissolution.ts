import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function preparePvCaDissolutionData(formData: FormData): TemplateData {
  const capital = formData.capital as number;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",

    // Réunion CA
    date_reunion: formData.date_reunion || "",
    date_reunion_lettres: formData.date_reunion_lettres || "",
    heure_reunion: formData.heure_reunion || "",
    heure_reunion_lettres: formData.heure_reunion_lettres || "",
    lieu_reunion: formData.lieu_reunion || formData.siege_social || "",

    // Président CA
    president_ca_civilite: formData.president_ca_civilite || "Monsieur",
    president_ca_nom: formData.president_ca_nom || "",
    president_ca_prenom: formData.president_ca_prenom || "",

    // Secrétaire
    secretaire_nom: formData.secretaire_nom || "",

    // Administrateurs présents
    administrateurs_presents: formData.administrateurs_presents || "",
    administrateurs_absents_representes: formData.administrateurs_absents_representes || "",
    administrateurs_absents_non_representes: formData.administrateurs_absents_non_representes || "",
    administrateurs_visioconference: formData.administrateurs_visioconference || "",
    nombre_administrateurs_presents: formData.nombre_administrateurs_presents || "",
    pourcentage_administrateurs: formData.pourcentage_administrateurs || "",

    // CAC
    commissaire_nom: formData.commissaire_nom || "",
    commissaire_representant: formData.commissaire_representant || "",

    // Personnes invitées
    personnes_presentes: formData.personnes_presentes || "",
    personnes_absentes: formData.personnes_absentes || "",

    // Convocation AGE
    date_age: formData.date_age || "",
    heure_age: formData.heure_age || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
