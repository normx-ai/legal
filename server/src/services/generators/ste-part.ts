import type { FormData, TemplateData, Associe, Membre, Administrateur, Signataire } from "../../types/generator";
import { formatNumber, numberToWords } from "./utils";

/**
 * Prépare les données pour le template Société en Participation.
 */
export function prepareStePartData(formData: FormData): TemplateData {
  const totalApports = (formData.associes || []).reduce((sum: number, a: Associe) => sum + ((a.apport || 0) || 0), 0);
  const valeurPart = formData.valeur_part || 10000;
  const nombreParts = valeurPart > 0 ? Math.floor(totalApports / valeurPart) : 0;

  const associes = (formData.associes || []).map((a: Associe, i: number) => {
    const parts = valeurPart > 0 ? Math.floor(((a.apport || 0) || 0) / valeurPart) : 0;
    return {
      rang: i + 1,
      civilite: a.civilite || "Monsieur",
      nom: a.nom,
      prenom: a.prenom,
      nom_complet: `${a.prenom} ${a.nom}`,
      date_naissance: a.date_naissance || "",
      lieu_naissance: a.lieu_naissance || "",
      nationalite: a.nationalite || "",
      profession: a.profession || "",
      adresse: a.adresse || "",
      apport: formatNumber((a.apport || 0) || 0),
      apport_lettres: numberToWords((a.apport || 0) || 0),
      type_apport: a.type_apport === "numeraire" ? "numéraire" : a.type_apport === "nature" ? "nature" : "numéraire",
      parts,
    };
  });

  return {
    denomination: formData.denomination,
    objet_social: formData.objet_social,
    domicile: formData.domicile,
    duree: formData.duree || 99,
    date_effet: formData.date_effet || new Date().toLocaleDateString("fr-FR"),
    duree_indeterminee: !!formData.duree_indeterminee,
    delai_preavis: formData.delai_preavis || "3",

    // Apports
    associes,
    nombre_associes: associes.length,
    total_apports: formatNumber(totalApports),
    total_apports_lettres: numberToWords(totalApports),
    devise: "FCFA",
    valeur_part: formatNumber(valeurPart),
    nombre_parts: nombreParts,
    conditions_mise_disposition: formData.conditions_mise_disposition || "immédiatement à la signature des présents statuts",

    // Décès
    deces_details: formData.deces_details || "",

    // Gérance
    gerant_civilite: formData.gerant?.civilite || "Monsieur",
    gerant_nom: formData.gerant?.nom || "...",
    gerant_prenom: formData.gerant?.prenom || "...",
    gerant_nom_complet: `${formData.gerant?.prenom || "..."} ${formData.gerant?.nom || "..."}`,
    remuneration_gerant: formData.gerant?.remuneration ? formatNumber(formData.gerant.remuneration) : "...",
    limitations_supplementaires: formData.limitations_supplementaires || "",

    // Contestations
    mode_tribunaux: formData.mode_contestation !== "arbitrage",
    mode_arbitrage: formData.mode_contestation === "arbitrage",

    nombre_exemplaires: formData.nombre_exemplaires || (associes.length + 2).toString(),
    date_signature: formData.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: formData.lieu_signature || "...",
  };
}
