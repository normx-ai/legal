import { formatNumber, numberToWords } from "./utils";

export function prepareBulletinSouscriptionAugmentationData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const augmentation_montant = formData.augmentation_montant as number || 0;
  const nouveau_capital = formData.nouveau_capital as number || 0;
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
    nombre_actions_detenues: formData.nombre_actions_detenues || 0,
    actions_irreductible: formData.actions_irreductible || 0,
    actions_reductible: formData.actions_reductible || 0,
    valeur_nominale_action: formatNumber(valeur_nominale_action),
    montant_verse: formatNumber(montant_verse),
    montant_verse_lettres: numberToWords(montant_verse),
    has_prime_emission: formData.has_prime_emission || false,
    prime_emission: formatNumber(prime_emission),
    prime_emission_lettres: numberToWords(prime_emission),
    modalite_liberation: formData.modalite_liberation || "totale",
    montant_solde: formatNumber(montant_solde),
    augmentation_montant: formatNumber(augmentation_montant),
    augmentation_montant_lettres: numberToWords(augmentation_montant),
    nouveau_capital: formatNumber(nouveau_capital),
    nouveau_capital_lettres: numberToWords(nouveau_capital),
    nombre_nouvelles_actions: formData.nombre_nouvelles_actions || 0,
    notaire_nom: formData.notaire_nom || "",
    notaire_adresse: formData.notaire_adresse || "",
    banque_nom: formData.banque_nom || "",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
