import { formatNumber, numberToWords } from "./utils";

export function prepareScsData(formData: any): Record<string, any> {
  const capital = formData.capital;
  const valeurNominale = formData.valeur_nominale || 10000;
  const nombreParts = Math.floor(capital / valeurNominale);

  const mapAssocie = (a: any, i: number, allBefore: any[]) => {
    const parts = Math.floor(a.apport / valeurNominale);
    const pourcentage = ((a.apport / capital) * 100).toFixed(2);
    const partsBefore = allBefore.reduce((sum: number, prev: any) => sum + Math.floor(prev.apport / valeurNominale), 0);
    return {
      rang: i + 1, civilite: a.civilite || "Monsieur", nom: a.nom, prenom: a.prenom,
      nom_complet: `${a.prenom} ${a.nom}`, date_naissance: a.date_naissance || "...",
      lieu_naissance: a.lieu_naissance || "...", nationalite: a.nationalite || "congolaise",
      profession: a.profession || "...", adresse: a.adresse || "...",
      apport: formatNumber(a.apport), apport_lettres: numberToWords(a.apport),
      parts, pourcentage, type_apport: "num\u00e9raire",
      numero_debut: partsBefore + 1, numero_fin: partsBefore + parts,
    };
  };

  const allAssocies = [...(formData.commandites || []), ...(formData.commanditaires || [])];
  const commandites = (formData.commandites || []).map((a: any, i: number) => mapAssocie(a, i, allAssocies.slice(0, i)));
  const commanditaires = (formData.commanditaires || []).map((a: any, i: number) => {
    const offset = (formData.commandites || []).length;
    return mapAssocie(a, i, allAssocies.slice(0, offset + i));
  });

  const totalCommandites = (formData.commandites || []).reduce((s: number, a: any) => s + (a.apport || 0), 0);
  const totalCommanditaires = (formData.commanditaires || []).reduce((s: number, a: any) => s + (a.apport || 0), 0);

  return {
    denomination: formData.denomination,
    forme_juridique: "Soci\u00e9t\u00e9 en Commandite Simple",
    objet_social: formData.objet_social,
    siege_social: formData.siege_social,
    ville: formData.ville || "Brazzaville",
    pays: formData.pays || "R\u00e9publique du Congo",
    duree: formData.duree || 99,
    exercice_debut: formData.exercice_debut || "1er janvier",
    exercice_fin: formData.exercice_fin || "31 d\u00e9cembre",
    premier_exercice_fin: formData.premier_exercice_fin || "31 d\u00e9cembre " + new Date().getFullYear(),
    capital: formatNumber(capital),
    capital_lettres: numberToWords(capital),
    devise: "FCFA",
    valeur_nominale: formatNumber(valeurNominale),
    nombre_parts: nombreParts,
    commandites,
    commanditaires,
    nombre_commandites: commandites.length,
    nombre_commanditaires: commanditaires.length,
    total_apports_commandites: formatNumber(totalCommandites),
    total_apports_commanditaires: formatNumber(totalCommanditaires),
    total_apports: formatNumber(capital),
    gerant_civilite: formData.gerant?.civilite || "Monsieur",
    gerant_nom: formData.gerant?.nom || "...",
    gerant_prenom: formData.gerant?.prenom || "...",
    gerant_nom_complet: `${formData.gerant?.prenom || "..."} ${formData.gerant?.nom || "..."}`,
    gerant_date_naissance: formData.gerant?.date_naissance || "...",
    gerant_lieu_naissance: formData.gerant?.lieu_naissance || "...",
    gerant_nationalite: formData.gerant?.nationalite || "congolaise",
    gerant_adresse: formData.gerant?.adresse || "...",
    gerant_duree_mandat: formData.gerant?.duree_mandat || "dur\u00e9e de la soci\u00e9t\u00e9",
    gerant_remuneration: formData.gerant?.remuneration || "fix\u00e9e par d\u00e9cision collective des associ\u00e9s",
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || formData.ville || "Brazzaville",
  };
}
