import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

export function prepareSncData(formData: FormData): TemplateData {
  const capital = formData.capital;
  const valeurNominale = formData.valeur_nominale || 10000;
  const nombreParts = Math.floor(capital / valeurNominale);

  const associes = (formData.associes || []).map((a: Associe, i: number) => {
    const parts = Math.floor(a.apport / valeurNominale);
    const pourcentage = ((a.apport / capital) * 100).toFixed(2);
    return {
      rang: i + 1,
      civilite: a.civilite || "Monsieur",
      nom: a.nom,
      prenom: a.prenom,
      nom_complet: `${a.prenom} ${a.nom}`,
      date_naissance: a.date_naissance || "...",
      lieu_naissance: a.lieu_naissance || "...",
      nationalite: a.nationalite || "congolaise",
      profession: a.profession || "...",
      adresse: a.adresse || "...",
      apport: formatNumber(a.apport),
      apport_lettres: numberToWords(a.apport),
      parts,
      pourcentage,
      type_apport: a.type_apport === "nature" ? "nature" : a.type_apport === "industrie" ? "industrie" : "num\u00e9raire",
      numero_debut: i === 0 ? 1 : (formData.associes.slice(0, i).reduce((sum: number, prev: Associe) => sum + Math.floor(prev.apport / valeurNominale), 0) + 1),
      numero_fin: formData.associes.slice(0, i + 1).reduce((sum: number, prev: Associe) => sum + Math.floor(prev.apport / valeurNominale), 0),
    };
  });

  const totalApportsNumeraire = (formData.associes || []).filter((a: Associe) => a.type_apport !== "nature" && a.type_apport !== "industrie").reduce((sum: number, a: Associe) => sum + ((a.apport || 0) || 0), 0);
  const totalApportsNature = (formData.associes || []).filter((a: Associe) => a.type_apport === "nature").reduce((sum: number, a: Associe) => sum + ((a.apport || 0) || 0), 0);

  return {
    denomination: formData.denomination,
    forme_juridique: "Soci\u00e9t\u00e9 en Nom Collectif",
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
    associes,
    nombre_associes: associes.length,
    total_apports_numeraire: formatNumber(totalApportsNumeraire),
    total_apports_nature: formatNumber(totalApportsNature),
    total_apports: formatNumber(capital),
    has_apports_nature: totalApportsNature > 0,
    has_apports_industrie: (formData.associes || []).some((a: Associe) => a.type_apport === "industrie"),
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
