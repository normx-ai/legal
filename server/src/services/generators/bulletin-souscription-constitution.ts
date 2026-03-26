import { formatNumber, numberToWords } from "./utils";

export function prepareBulletinSouscriptionConstitutionData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const valeur_nominale_action = formData.valeur_nominale_action as number || 0;
  const montant_verse = formData.montant_verse as number || 0;
  const prime_emission = formData.prime_emission as number || 0;
  const montant_solde = formData.montant_solde as number || 0;
  return {
    denomination: formData.denomination,
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    sigle: formData.sigle || "",
    rc_numero: formData.rc_numero || "",
    objet_social: formData.objet_social || "",
    souscripteur_civilite: formData.souscripteur_civilite || "Monsieur",
    souscripteur_nom: formData.souscripteur_nom || "",
    souscripteur_prenom: formData.souscripteur_prenom || "",
    souscripteur_adresse: formData.souscripteur_adresse || "",
    nombre_actions_souscrites: formData.nombre_actions_souscrites || 0,
    valeur_nominale_action: formatNumber(valeur_nominale_action),
    montant_verse: formatNumber(montant_verse),
    montant_verse_lettres: numberToWords(montant_verse),
    has_prime_emission: formData.has_prime_emission || false,
    prime_emission: formatNumber(prime_emission),
    prime_emission_lettres: numberToWords(prime_emission),
    modalite_liberation: formData.modalite_liberation || "totale",
    montant_solde: formatNumber(montant_solde),
    nombre_actions_total: formData.nombre_actions_total || 0,
    notaire_nom: formData.notaire_nom || "",
    notaire_adresse: formData.notaire_adresse || "",
    banque_nom: formData.banque_nom || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
