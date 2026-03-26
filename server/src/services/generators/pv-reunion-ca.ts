import { formatNumber, numberToWords } from "./utils";

export function preparePvReunionCaData(formData: any): Record<string, any> {
  const capital = formData.capital as number;
  const decisions = formData.decisions_selectionnees || [];

  const administrateurs_presents = (formData.administrateurs_presents || []).map((a: any) => ({
    civilite: a.civilite || "M.",
    prenom: a.prenom || "",
    nom: a.nom || "",
  }));
  const administrateurs_representes = (formData.administrateurs_representes || []).map((a: any) => ({
    civilite: a.civilite || "M.",
    prenom: a.prenom || "",
    nom: a.nom || "",
    represente_par: a.represente_par || "",
  }));
  const administrateurs_absents = (formData.administrateurs_absents || []).map((a: any) => ({
    civilite: a.civilite || "M.",
    prenom: a.prenom || "",
    nom: a.nom || "",
  }));
  const administrateurs_visio = (formData.administrateurs_visio || []).map((a: any) => ({
    civilite: a.civilite || "M.",
    prenom: a.prenom || "",
    nom: a.nom || "",
  }));

  const nombreTotal = administrateurs_presents.length + administrateurs_representes.length + administrateurs_absents.length + administrateurs_visio.length;
  const nombrePresents = administrateurs_presents.length + administrateurs_representes.length + administrateurs_visio.length;

  return {
    denomination: formData.denomination,
    forme_juridique: formData.forme_juridique || "SA",
    siege_social: formData.siege_social,
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    date_reunion: formData.date_reunion || "",
    date_reunion_lettres: formData.date_reunion_lettres || "",
    heure_reunion: formData.heure_reunion || "",
    heure_reunion_lettres: formData.heure_reunion_lettres || "",
    lieu_reunion: formData.lieu_reunion || "",
    president_civilite: formData.president_civilite || "Monsieur",
    president_nom: formData.president_nom || "",
    president_prenom: formData.president_prenom || "",
    secretaire_nom: formData.secretaire_nom || "",
    administrateurs_presents,
    has_presents: administrateurs_presents.length > 0,
    administrateurs_representes,
    has_representes: administrateurs_representes.length > 0,
    administrateurs_absents,
    has_absents: administrateurs_absents.length > 0,
    administrateurs_visio,
    has_visio: administrateurs_visio.length > 0,
    nombre_total_administrateurs: nombreTotal,
    nombre_presents: nombrePresents,
    commissaire_present: !!formData.commissaire_present,
    commissaire_nom: formData.commissaire_nom || "",
    commissaire_represente_par: formData.commissaire_represente_par || "",
    exercice_clos_le: formData.exercice_clos_le || "",
    ordre_du_jour: formData.ordre_du_jour || "",
    // Decisions conditionnelles
    has_arrete_comptes: decisions.includes("arrete_comptes"),
    has_nomination_president: decisions.includes("nomination_president"),
    has_remplacement_president: decisions.includes("remplacement_president"),
    has_demission_president: decisions.includes("demission_president"),
    has_revocation_president: decisions.includes("revocation_president"),
    has_empechement_president: decisions.includes("empechement_president"),
    has_deces_president: decisions.includes("deces_president"),
    has_nomination_dg: decisions.includes("nomination_dg"),
    has_demission_dg: decisions.includes("demission_dg"),
    has_revocation_dg: decisions.includes("revocation_dg"),
    has_autorisation_conventions: decisions.includes("autorisation_conventions"),
    has_cooptation: decisions.includes("cooptation"),
    has_mise_harmonie: decisions.includes("mise_harmonie"),
    has_transfert_siege: decisions.includes("transfert_siege"),
    has_examen_registre: decisions.includes("examen_registre"),
    has_rapport_ag: decisions.includes("rapport_ag"),
    has_convocation_ag: decisions.includes("convocation_ag"),
    has_communication_documents: decisions.includes("communication_documents"),
    has_transfert_siege_autre_ville: decisions.includes("transfert_siege_autre_ville"),
    has_augmentation_capital_numeraire: decisions.includes("augmentation_capital_numeraire"),
    has_reduction_capital_pertes: decisions.includes("reduction_capital_pertes"),
    has_reduction_capital_remboursement: decisions.includes("reduction_capital_remboursement"),

    // Variables template - Arrêté des comptes
    projet_repartition: formData.projet_repartition || "",

    // Variables template - Nomination président
    nouveau_president_nom: formData.nouveau_president_nom || "",
    remuneration_president: formData.remuneration_president || "",

    // Variables template - Remplacement président
    ancien_president_nom: formData.ancien_president_nom || "",

    // Variables template - Nomination DG
    dg_nom: formData.dg_nom || "",
    dg_duree: formData.dg_duree || "",
    dg_remuneration: formData.dg_remuneration || "",

    // Variables template - Autorisation conventions
    convention_personne: formData.convention_personne || "",
    convention_details: formData.convention_details || "",
    votes_pour: formData.votes_pour || "",
    votes_contre: formData.votes_contre || "",

    // Variables template - Cooptation
    administrateur_coopte_nom: formData.administrateur_coopte_nom || "",

    // Variables template - Mise en harmonie
    mise_harmonie_details: formData.mise_harmonie_details || "",

    // Variables template - Transfert siège social
    ancien_siege: formData.ancien_siege || "",
    nouveau_siege: formData.nouveau_siege || "",

    // Variables template - Convocation AG
    date_convocation_ag: formData.date_convocation_ag || "",

    // Variables template - Transfert siège autre ville
    date_effet: formData.date_effet || "",
    raisons_transfert: formData.raisons_transfert || "",
    date_age: formData.date_age || "",
    heure_age: formData.heure_age || "",
    lieu_age: formData.lieu_age || "",

    // Variables template - Augmentation capital
    montant_augmentation: formData.montant_augmentation || "",
    nombre_actions: formData.nombre_actions || "",
    prime_emission: formData.prime_emission || "",

    // Variables template - Réduction capital
    ancien_capital: formData.ancien_capital || "",
    nouveau_capital: formData.nouveau_capital || "",
    montant_perte: formData.montant_perte || "",
    montant_remboursement: formData.montant_remboursement || "",

    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
