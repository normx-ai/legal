/**
 * Script pour créer le template DOCX des Décisions de l'associé unique non gérant — SARL OHADA (Model 20)
 * Basé sur le modèle officiel du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-dec-associe-unique-non-gerant-template.ts
 */

import PizZip from "pizzip";
import fs from "fs";
import path from "path";

function createEmptyDocx(): PizZip {
  const zip = new PizZip();
  zip.file("[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`);
  zip.file("_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.file("word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`);

  zip.file("word/header1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">{denomination}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">{forme_juridique} au capital de {capital} {devise}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">D\u00e9cisions associ\u00e9 unique non g\u00e9rant \u2014 {denomination}</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Page </w:t></w:r>
    <w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve"> / </w:t></w:r>
    <w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText> NUMPAGES </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>
  </w:p>
</w:ftr>`);

  return zip;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function p(text: string, bold = false, size = 24, center = false, italic = false): string {
  const align = center ? `<w:jc w:val="center"/>` : `<w:jc w:val="both"/>`;
  const bTag = bold ? `<w:b/>` : "";
  const iTag = italic ? `<w:i/>` : "";
  const sz = `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>`;
  const font = `<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>`;
  const runs = text.split("\n").map((line, i) => {
    const br = i > 0 ? `<w:br/>` : "";
    return `<w:r><w:rPr>${font}${bTag}${iTag}${sz}</w:rPr>${br}<w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>`;
  }).join("");
  return `<w:p><w:pPr>${align}<w:spacing w:after="120" w:line="276" w:lineRule="auto"/><w:rPr>${font}</w:rPr></w:pPr>${runs}</w:p>`;
}

const t = (text: string) => p(text);
const b = (text: string) => p(text, true);
const c = (text: string) => p(text, true, 28, true);
const it = (text: string) => p(text, false, 24, false, true);

function createTemplate() {
  const zip = createEmptyDocx();

  const body = [
    // ===== TITRE =====
    c("D\u00c9CISIONS DE L\u2019ASSOCI\u00c9 UNIQUE NON G\u00c9RANT DU {date_decisions}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_decisions_lettres}, et le {date_decisions} \u00e0 {heure_decisions_lettres} heures,"),
    t(""),
    t("{associe_civilite} {associe_prenom} {associe_nom}, associ\u00e9 unique non g\u00e9rant de la soci\u00e9t\u00e9, d\u00e9clare que :"),
    t(""),
    t("- les \u00e9tats financiers de l\u2019exercice ;"),
    t("- le rapport de gestion \u00e9tabli par {gerant_civilite} {gerant_prenom} {gerant_nom}, g\u00e9rant ;"),
    t("- les rapports du commissaire aux comptes (\u00e9ventuellement)"),
    t(""),
    t("lui ont \u00e9t\u00e9 adress\u00e9s par le g\u00e9rant le {date_envoi_documents}, et qu\u2019\u00e0 partir de cette date, l\u2019inventaire a \u00e9t\u00e9 tenu \u00e0 sa disposition au si\u00e8ge social."),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant a pris les d\u00e9cisions suivantes :"),
    t(""),

    // ===== A. PREMIERE DECISION : APPROBATION DES COMPTES =====
    t("{#has_approbation_comptes}"),
    b("A. Premi\u00e8re d\u00e9cision : Approbation des comptes"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant, apr\u00e8s avoir pris connaissance du rapport de la g\u00e9rance sur la marche de la soci\u00e9t\u00e9, {#has_rapport_cac}du rapport du commissaire aux comptes {/has_rapport_cac}et des comptes annuels aff\u00e9rents \u00e0 l\u2019exercice clos le {exercice_clos_le}, les approuve tels qu\u2019ils lui ont \u00e9t\u00e9 pr\u00e9sent\u00e9s. Ces comptes font appara\u00eetre un r\u00e9sultat {resultat_type} de {resultat_montant} FCFA."),
    t(""),
    t("En cons\u00e9quence, il donne quitus au g\u00e9rant {#has_rapport_cac}et au commissaire aux comptes {/has_rapport_cac}pour ledit exercice."),
    t(""),
    t("{/has_approbation_comptes}"),

    // ===== B. DEUXIEME DECISION : AFFECTATION DES RESULTATS =====
    t("{#has_affectation_resultats}"),
    b("B. Deuxi\u00e8me d\u00e9cision : Affectation des r\u00e9sultats"),
    t(""),
    t("{#is_beneficiaire}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide d\u2019affecter le r\u00e9sultat net b\u00e9n\u00e9ficiaire de {resultat_montant} francs CFA de l\u2019exercice {exercice_clos_le} de la mani\u00e8re suivante :"),
    t(""),
    t("{affectation_details}"),
    t("{/is_beneficiaire}"),
    t("{#is_deficitaire}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide d\u2019affecter le r\u00e9sultat net d\u00e9ficitaire de {resultat_montant} francs CFA au report \u00e0 nouveau."),
    t("{/is_deficitaire}"),
    t(""),
    t("{/has_affectation_resultats}"),

    // ===== C. TROISIEME DECISION : APPROBATION DES CONVENTIONS =====
    t("{#has_conventions_decision}"),
    b("C. Troisi\u00e8me d\u00e9cision : Approbation des conventions"),
    t(""),
    t("{#has_conventions}"),
    t("{#has_conventions_variante1}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant, apr\u00e8s avoir pris connaissance du rapport sp\u00e9cial du commissaire aux comptes sur la convention conclue au cours de l\u2019exercice entre {convention_details}, le g\u00e9rant et la soci\u00e9t\u00e9, approuve les op\u00e9rations ressortant de ladite convention."),
    t("{/has_conventions_variante1}"),
    t("{#has_conventions_variante2}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant approuve la convention relative \u00e0 {convention_objet} conclue au cours de l\u2019exercice entre la soci\u00e9t\u00e9 et le g\u00e9rant."),
    t("{/has_conventions_variante2}"),
    t("{/has_conventions}"),
    t("{^has_conventions}"),
    t("{#has_absence_conventions_variante1}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant, apr\u00e8s avoir pris connaissance du rapport sp\u00e9cial du commissaire aux comptes sur les conventions mentionnant l\u2019absence de conventions devant \u00eatre soumises \u00e0 son approbation, en prend acte."),
    t("{/has_absence_conventions_variante1}"),
    t("{#has_absence_conventions_variante2}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant prend acte de l\u2019absence de convention entre la soci\u00e9t\u00e9 et le G\u00e9rant au cours de l\u2019exercice."),
    t("{/has_absence_conventions_variante2}"),
    t("{/has_conventions}"),
    t(""),
    t("{/has_conventions_decision}"),

    // ===== D. QUATRIEME DECISION : RENOUVELLEMENT DES FONCTIONS DU GERANT =====
    t("{#has_renouvellement_gerant}"),
    b("D. Quatri\u00e8me d\u00e9cision : Renouvellement des fonctions du g\u00e9rant"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant renouvelle le mandat de g\u00e9rant de la soci\u00e9t\u00e9 de {gerant_civilite} {gerant_prenom} {gerant_nom} pour une dur\u00e9e de {duree_mandat_gerant}, venant \u00e0 expiration le {date_expiration_mandat_gerant}."),
    t(""),
    t("{gerant_civilite} {gerant_prenom} {gerant_nom} d\u00e9clare accepter le renouvellement de son mandat et affirme n\u2019\u00eatre frapp\u00e9 d\u2019aucune interdiction ou incapacit\u00e9 susceptible de l\u2019emp\u00eacher d\u2019exercer ce mandat."),
    t(""),
    t("{/has_renouvellement_gerant}"),

    // ===== E. CINQUIEME DECISION : REMUNERATION DU GERANT =====
    t("{#has_remuneration_gerant}"),
    b("E. Cinqui\u00e8me d\u00e9cision : R\u00e9mun\u00e9ration du g\u00e9rant"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide que pour l\u2019exercice de ses fonctions, et pendant la dur\u00e9e de son mandat, {gerant_civilite} {gerant_prenom} {gerant_nom}, g\u00e9rant, aura droit \u00e0 une r\u00e9mun\u00e9ration ainsi d\u00e9termin\u00e9e : {remuneration_gerant}."),
    t(""),
    t("Il aura \u00e9galement droit au remboursement de ses frais de repr\u00e9sentation et de d\u00e9placement sur justificatif."),
    t(""),
    t("{/has_remuneration_gerant}"),

    // ===== F. SIXIEME DECISION : REVOCATION DU GERANT =====
    t("{#has_revocation_gerant}"),
    b("F. Sixi\u00e8me d\u00e9cision : R\u00e9vocation du g\u00e9rant"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de mettre fin au mandat de g\u00e9rant de {gerant_civilite} {gerant_prenom} {gerant_nom} \u00e0 compter de ce jour."),
    t(""),
    t("{#has_quitus_revocation}"),
    t("Il lui donne quitus de sa gestion."),
    t("{/has_quitus_revocation}"),
    t("{^has_quitus_revocation}"),
    t("Il statuera ult\u00e9rieurement sur le quitus de sa gestion."),
    t("{/has_quitus_revocation}"),
    t(""),
    t("{/has_revocation_gerant}"),

    // ===== G. SEPTIEME DECISION : REMPLACEMENT DU GERANT =====
    t("{#has_remplacement_gerant}"),
    b("G. Septi\u00e8me d\u00e9cision : Remplacement du g\u00e9rant"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de nommer {nouveau_gerant_civilite} {nouveau_gerant_prenom} {nouveau_gerant_nom}, en qualit\u00e9 de g\u00e9rant, en remplacement de {gerant_civilite} {gerant_prenom} {gerant_nom}, g\u00e9rant r\u00e9voqu\u00e9."),
    t(""),
    t("{nouveau_gerant_civilite} {nouveau_gerant_prenom} {nouveau_gerant_nom} exercera ses fonctions dans les conditions pr\u00e9vues par les statuts. Son mandat expirera le {date_expiration_nouveau_gerant}."),
    t(""),
    t("{/has_remplacement_gerant}"),

    // ===== H. HUITIEME DECISION : NOMINATION DE COMMISSAIRE AUX COMPTES =====
    t("{#has_nomination_cac}"),
    b("H. Huiti\u00e8me d\u00e9cision : Nomination de commissaire aux comptes"),
    t(""),
    t("L\u2019Associ\u00e9 Unique non g\u00e9rant nomme :"),
    t("- {commissaire_titulaire_nom}, demeurant \u00e0 {commissaire_titulaire_adresse}, en qualit\u00e9 de commissaire aux comptes titulaire ;"),
    t("- {commissaire_suppleant_nom}, demeurant \u00e0 {commissaire_suppleant_adresse}, en qualit\u00e9 de commissaire aux comptes suppl\u00e9ant,"),
    t("pour une p\u00e9riode de {commissaire_duree}, prenant fin \u00e0 l\u2019issue de l\u2019exercice clos le {commissaire_fin_mandat}."),
    t(""),
    t("{/has_nomination_cac}"),

    // ===== I. NEUVIEME DECISION : RENOUVELLEMENT OU NON RENOUVELLEMENT MANDAT CAC =====
    t("{#has_renouvellement_cac}"),
    b("I. Neuvi\u00e8me d\u00e9cision : Renouvellement du mandat du commissaire aux comptes"),
    t(""),
    t("{#has_renouvellement_cac_oui}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de renouveler le mandat de commissaire aux comptes titulaire de {commissaire_titulaire_nom} et de commissaire aux comptes suppl\u00e9ant de {commissaire_suppleant_nom}, pour une nouvelle p\u00e9riode de {commissaire_duree_renouvellement}, prenant fin \u00e0 l\u2019issue de l\u2019exercice clos le {commissaire_fin_mandat_renouvellement}."),
    t("{/has_renouvellement_cac_oui}"),
    t("{#has_renouvellement_cac_non}"),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de ne pas renouveler le mandat de commissaire aux comptes titulaire de {commissaire_titulaire_nom} et de commissaire aux comptes suppl\u00e9ant de {commissaire_suppleant_nom}, arriv\u00e9 \u00e0 expiration \u00e0 l\u2019issue de la pr\u00e9sente d\u00e9lib\u00e9ration."),
    t("{/has_renouvellement_cac_non}"),
    t(""),
    t("{/has_renouvellement_cac}"),

    // ===== J. DIXIEME DECISION : CHANGEMENT DE DENOMINATION SOCIALE =====
    t("{#has_changement_denomination}"),
    b("J. Dixi\u00e8me d\u00e9cision : Changement de d\u00e9nomination sociale"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de changer la d\u00e9nomination sociale de la soci\u00e9t\u00e9 de \u00ab {ancienne_denomination} \u00bb en \u00ab {nouvelle_denomination} \u00bb."),
    t(""),

    // Onzième décision : Modification de l'article des statuts relatif à la dénomination
    b("Onzi\u00e8me d\u00e9cision : Modification de l\u2019article {article_denomination} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019article {article_denomination} des statuts relatif \u00e0 la d\u00e9nomination sociale, qui sera d\u00e9sormais r\u00e9dig\u00e9 comme suit :"),
    t("\u00ab {nouveau_texte_article_denomination} \u00bb"),
    t(""),
    t("{/has_changement_denomination}"),

    // ===== K. DOUZIEME DECISION : PROROGATION DE LA DUREE DE LA SOCIETE =====
    t("{#has_prorogation_duree}"),
    b("K. Douzi\u00e8me d\u00e9cision : Prorogation de la dur\u00e9e de la soci\u00e9t\u00e9"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de proroger la dur\u00e9e de la soci\u00e9t\u00e9 pour une nouvelle p\u00e9riode de {duree_prorogation}, \u00e0 compter du {date_prorogation}."),
    t(""),

    // Treizième décision : Modification de l'article des statuts relatif à la durée
    b("Treizi\u00e8me d\u00e9cision : Modification de l\u2019article {article_duree} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019article {article_duree} des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9, qui sera d\u00e9sormais r\u00e9dig\u00e9 comme suit :"),
    t("\u00ab {nouveau_texte_article_duree} \u00bb"),
    t(""),
    t("{/has_prorogation_duree}"),

    // ===== L. QUATORZIEME DECISION : MODIFICATION DE L'OBJET SOCIAL =====
    t("{#has_modification_objet}"),
    b("L. Quatorzi\u00e8me d\u00e9cision : Modification de l\u2019objet social"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019objet social de la soci\u00e9t\u00e9 comme suit : {nouveau_objet_social}."),
    t(""),

    // Quinzième décision : Modification de l'article des statuts relatif à l'objet
    b("Quinzi\u00e8me d\u00e9cision : Modification de l\u2019article {article_objet} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019article {article_objet} des statuts relatif \u00e0 l\u2019objet social, qui sera d\u00e9sormais r\u00e9dig\u00e9 comme suit :"),
    t("\u00ab {nouveau_texte_article_objet} \u00bb"),
    t(""),
    t("{/has_modification_objet}"),

    // ===== M. SEIZIEME DECISION : TRANSFERT DU SIEGE SOCIAL =====
    t("{#has_transfert_siege}"),
    b("M. Seizi\u00e8me d\u00e9cision : Transfert du si\u00e8ge social"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de transf\u00e9rer le si\u00e8ge social de la soci\u00e9t\u00e9 de {ancien_siege} \u00e0 {nouveau_siege}, \u00e0 compter du {date_transfert_siege}."),
    t(""),

    // Dix septième décision (modification article siège) est incluse dans le bloc transfert
    b("Dix-septi\u00e8me d\u00e9cision : Modification de l\u2019article {article_siege} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019article {article_siege} des statuts relatif au si\u00e8ge social, qui sera d\u00e9sormais r\u00e9dig\u00e9 comme suit :"),
    t("\u00ab {nouveau_texte_article_siege} \u00bb"),
    t(""),
    t("{/has_transfert_siege}"),

    // ===== N. DIX SEPTIEME DECISION : CONTINUATION MALGRE PERTE DE PLUS DE LA MOITIE DU CAPITAL =====
    t("{#has_continuation_perte_capital}"),
    b("N. Dix-septi\u00e8me d\u00e9cision : Continuation de la soci\u00e9t\u00e9 malgr\u00e9 la perte de plus de la moiti\u00e9 du capital"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant, constatant que les capitaux propres de la soci\u00e9t\u00e9 sont devenus inf\u00e9rieurs \u00e0 la moiti\u00e9 du capital social, d\u00e9cide de ne pas dissoudre la soci\u00e9t\u00e9 et de poursuivre l\u2019activit\u00e9 sociale."),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant s\u2019engage \u00e0 reconstituer les capitaux propres de la soci\u00e9t\u00e9 \u00e0 une valeur au moins \u00e9gale \u00e0 la moiti\u00e9 du capital social, au plus tard \u00e0 la cl\u00f4ture du deuxi\u00e8me exercice suivant celui au cours duquel la perte a \u00e9t\u00e9 constat\u00e9e."),
    t(""),
    t("{/has_continuation_perte_capital}"),

    // ===== O. DIX HUITIEME DECISION : AUGMENTATION DE CAPITAL PAR APPORTS EN NUMERAIRE =====
    t("{#has_augmentation_capital_numeraire}"),
    b("O. Dix-huiti\u00e8me d\u00e9cision : Augmentation de capital par apports en num\u00e9raire"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide d\u2019augmenter le capital social d\u2019une somme de {montant_augmentation_numeraire} FCFA pour le porter de {ancien_capital} FCFA \u00e0 {nouveau_capital_numeraire} FCFA, par la cr\u00e9ation de {nombre_parts_nouvelles_numeraire} parts sociales nouvelles de {valeur_nominale} FCFA chacune, enti\u00e8rement lib\u00e9r\u00e9es, souscrites par l\u2019associ\u00e9 unique."),
    t(""),

    // Dix-neuvième décision : Modification des articles des statuts
    b("Dix-neuvi\u00e8me d\u00e9cision : Modification des articles {articles_capital} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier les articles {articles_capital} des statuts relatifs au capital social et \u00e0 la r\u00e9partition des parts sociales."),
    t(""),
    t("{/has_augmentation_capital_numeraire}"),

    // ===== P. VINGTIEME DECISION : AUGMENTATION DE CAPITAL PAR APPORT EN NATURE =====
    t("{#has_augmentation_capital_nature}"),
    b("P. Vingti\u00e8me d\u00e9cision : Augmentation de capital par apport en nature"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide d\u2019augmenter le capital social d\u2019une somme de {montant_augmentation_nature} FCFA pour le porter de {ancien_capital} FCFA \u00e0 {nouveau_capital_nature} FCFA, par la cr\u00e9ation de {nombre_parts_nouvelles_nature} parts sociales nouvelles de {valeur_nominale} FCFA chacune, en r\u00e9mun\u00e9ration de l\u2019apport en nature suivant : {description_apport_nature}, \u00e9valu\u00e9 \u00e0 {valeur_apport_nature} FCFA."),
    t(""),

    // Vingt et unième décision : Modification des articles des statuts
    b("Vingt et uni\u00e8me d\u00e9cision : Modification des articles {articles_capital} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier les articles {articles_capital} des statuts relatifs au capital social et \u00e0 la r\u00e9partition des parts sociales."),
    t(""),
    t("{/has_augmentation_capital_nature}"),

    // ===== Q. VINGT DEUXIEME DECISION : AUGMENTATION CAPITAL PAR INCORPORATION DE RESERVES =====
    t("{#has_augmentation_capital_reserves}"),
    b("Q. Vingt-deuxi\u00e8me d\u00e9cision : Augmentation de capital par incorporation de r\u00e9serves"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide d\u2019augmenter le capital social d\u2019une somme de {montant_incorporation_reserves} FCFA, par incorporation de r\u00e9serves, pour le porter de {ancien_capital} FCFA \u00e0 {nouveau_capital_reserves} FCFA, par la cr\u00e9ation de {nombre_parts_nouvelles_reserves} parts sociales nouvelles de {valeur_nominale} FCFA chacune, attribu\u00e9es \u00e0 l\u2019associ\u00e9 unique."),
    t(""),

    // Vingt-troisième décision : Modification des articles des statuts
    b("Vingt-troisi\u00e8me d\u00e9cision : Modification des articles {articles_capital} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier les articles {articles_capital} des statuts relatifs au capital social et \u00e0 la r\u00e9partition des parts sociales."),
    t(""),
    t("{/has_augmentation_capital_reserves}"),

    // ===== R. VINGT QUATRIEME DECISION : AUGMENTATION CAPITAL PAR INCORPORATION RESERVES AVEC MAJORATION VALEUR NOMINALE =====
    t("{#has_augmentation_capital_majoration}"),
    b("R. Vingt-quatri\u00e8me d\u00e9cision : Augmentation de capital par incorporation de r\u00e9serves avec majoration de la valeur nominale"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide d\u2019augmenter le capital social d\u2019une somme de {montant_incorporation_majoration} FCFA, par incorporation de r\u00e9serves, pour le porter de {ancien_capital} FCFA \u00e0 {nouveau_capital_majoration} FCFA, par majoration de la valeur nominale de chaque part sociale de {ancienne_valeur_nominale} FCFA \u00e0 {nouvelle_valeur_nominale} FCFA."),
    t(""),

    // Vingt-cinquième décision : Modification des articles des statuts
    b("Vingt-cinqui\u00e8me d\u00e9cision : Modification des articles {articles_capital} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier les articles {articles_capital} des statuts relatifs au capital social, \u00e0 la valeur nominale et \u00e0 la r\u00e9partition des parts sociales."),
    t(""),
    t("{/has_augmentation_capital_majoration}"),

    // ===== S. VINGT SIXIEME DECISION : REDUCTION DE CAPITAL =====
    t("{#has_reduction_capital}"),
    b("S. Vingt-sixi\u00e8me d\u00e9cision : R\u00e9duction de capital"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de r\u00e9duire le capital social d\u2019une somme de {montant_reduction_capital} FCFA pour le porter de {ancien_capital} FCFA \u00e0 {nouveau_capital_reduit} FCFA, par {modalite_reduction_capital}."),
    t(""),

    // Vingt-septième décision : Modification de l'article des statuts
    b("Vingt-septi\u00e8me d\u00e9cision : Modification de l\u2019article {article_capital} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019article {article_capital} des statuts relatif au capital social."),
    t(""),
    t("{/has_reduction_capital}"),

    // ===== T. VINGT HUITIEME DECISION : TRANSFORMATION =====
    t("{#has_transformation}"),
    b("T. Vingt-huiti\u00e8me d\u00e9cision : Transformation de la soci\u00e9t\u00e9"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de transformer la soci\u00e9t\u00e9 {denomination} actuellement sous forme de {ancienne_forme_juridique} en {nouvelle_forme_juridique}."),
    t(""),
    t("Cette transformation n\u2019entra\u00eene pas la cr\u00e9ation d\u2019une personne morale nouvelle."),
    t(""),

    // Vingt-neuvième décision : Modification des statuts
    b("Vingt-neuvi\u00e8me d\u00e9cision : Modification des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier les statuts de la soci\u00e9t\u00e9 pour les adapter \u00e0 la nouvelle forme juridique."),
    t(""),

    // Trentième décision : Désignation des dirigeants
    b("Trenti\u00e8me d\u00e9cision : D\u00e9signation des dirigeants"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9signe en qualit\u00e9 de {titre_dirigeant} : {nom_dirigeant_transformation}, pour une dur\u00e9e de {duree_mandat_dirigeant_transformation}."),
    t(""),

    // Trente et unième décision : Désignation du CAC
    b("Trente et uni\u00e8me d\u00e9cision : D\u00e9signation du commissaire aux comptes"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9signe en qualit\u00e9 de commissaire aux comptes titulaire {commissaire_titulaire_transformation} et en qualit\u00e9 de commissaire aux comptes suppl\u00e9ant {commissaire_suppleant_transformation}, pour une dur\u00e9e de {commissaire_duree_transformation}."),
    t(""),
    t("{/has_transformation}"),

    // ===== U. TRENTE DEUXIEME DECISION : DISSOLUTION ET LIQUIDATION =====
    t("{#has_dissolution}"),
    b("U. Trente-deuxi\u00e8me d\u00e9cision : Dissolution et liquidation de la soci\u00e9t\u00e9"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 \u00e0 compter de ce jour et sa mise en liquidation."),
    t(""),

    // Trente-troisième décision : Modification de l'article Durée
    b("Trente-troisi\u00e8me d\u00e9cision : Modification de l\u2019article {article_duree} des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de modifier l\u2019article {article_duree} des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9 pour y mentionner la dissolution anticip\u00e9e."),
    t(""),

    // Trente-quatrième décision : Nomination du liquidateur
    b("Trente-quatri\u00e8me d\u00e9cision : Nomination du liquidateur"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant nomme {liquidateur_civilite} {liquidateur_prenom} {liquidateur_nom}, demeurant \u00e0 {liquidateur_adresse}, en qualit\u00e9 de liquidateur de la soci\u00e9t\u00e9."),
    t(""),
    t("Le liquidateur aura les pouvoirs les plus \u00e9tendus pour proc\u00e9der \u00e0 la r\u00e9alisation de l\u2019actif et au paiement du passif. Le si\u00e8ge de la liquidation est fix\u00e9 au si\u00e8ge social."),
    t(""),
    t("{/has_dissolution}"),

    // ===== V. TRENTE CINQUIEME DECISION : MISE EN HARMONIE DES STATUTS =====
    t("{#has_mise_en_harmonie}"),
    b("V. Trente-cinqui\u00e8me d\u00e9cision : Mise en harmonie des statuts"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de mettre en harmonie les statuts de la soci\u00e9t\u00e9 avec les dispositions de l\u2019Acte uniforme r\u00e9vis\u00e9 relatif au droit des soci\u00e9t\u00e9s commerciales et du groupement d\u2019int\u00e9r\u00eat \u00e9conomique."),
    t(""),

    // Trente-sixième décision : Refonte des statuts
    b("Trente-sixi\u00e8me d\u00e9cision : Refonte des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision qui pr\u00e9c\u00e8de, l\u2019associ\u00e9 unique non g\u00e9rant d\u00e9cide de proc\u00e9der \u00e0 une refonte compl\u00e8te des statuts de la soci\u00e9t\u00e9 pour les mettre en conformit\u00e9 avec les nouvelles dispositions l\u00e9gales. Les nouveaux statuts annulent et remplacent les pr\u00e9c\u00e9dents."),
    t(""),
    t("{/has_mise_en_harmonie}"),

    // ===== W. TRENTE SEPTIEME DECISION : POUVOIRS =====
    t("{#has_pouvoirs}"),
    b("W. Trente-septi\u00e8me d\u00e9cision : Pouvoirs"),
    t(""),
    t("L\u2019associ\u00e9 unique non g\u00e9rant d\u00e9l\u00e8gue tous pouvoirs au porteur d\u2019une copie ou d\u2019un extrait du proc\u00e8s-verbal constatant les d\u00e9lib\u00e9rations \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales ou autres."),
    t(""),
    t("{/has_pouvoirs}"),

    // ===== CLOTURE =====
    t("De tout ce que dessus, l\u2019associ\u00e9 unique non g\u00e9rant a dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal qu\u2019il a sign\u00e9."),
    t(""),
    t(""),
    b("L\u2019Associ\u00e9 Unique"),
    t("M............"),
    t(""),
    t(""),
  ];

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml">
  <w:body>
    ${body.join("\n    ")}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
      <w:footerReference w:type="default" r:id="rId2" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1800" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="400" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file("word/document.xml", documentXml);

  const outputDir = path.join(__dirname, "../templates/dec-associe-unique-non-gerant");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "decisions.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
