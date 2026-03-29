import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareLettreAppelFondsData(formData: FormData): TemplateData {
  const capital = formData.capital as number;
  const montant_a_liberer = formData.montant_a_liberer as number || 0;
  const montant_souscription = formData.montant_souscription as number || 0;
  const valeur_nominale = formData.valeur_nominale as number || 0;
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
    nombre_titres_souscrits: formData.nombre_titres_souscrits || 0,
    type_titres: formData.type_titres || "actions",
    valeur_nominale: formatNumber(valeur_nominale),
    montant_souscription: formatNumber(montant_souscription),
    montant_souscription_lettres: numberToWords(montant_souscription),
    quotite_liberee: formData.quotite_liberee || "",
    montant_a_liberer: formatNumber(montant_a_liberer),
    montant_a_liberer_lettres: numberToWords(montant_a_liberer),
    date_deliberation: formData.date_deliberation || "",
    organe_decision: formData.organe_decision || "",
    date_limite: formData.date_limite || "",
    signataire_fonction: formData.signataire_fonction || "",
    signataire_nom: formData.signataire_nom || "",
    rccm: formData.rccm || "",
    dirigeant_civilite: formData.dirigeant_civilite || "",
    dirigeant_nom: formData.dirigeant_nom || "",
    dirigeant_prenom: formData.dirigeant_prenom || "",
    dirigeant_qualite: formData.dirigeant_qualite || "",
    banque_depot: formData.banque_depot || "",
    reference_ag: formData.reference_ag || "",
    date_envoi: formData.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: formData.lieu_envoi || "...",
  };
}
