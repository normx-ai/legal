/**
 * Script pour créer le template DOCX des Décisions de l'associé unique gérant — SARL OHADA (Model 19)
 * Basé sur le modèle officiel du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-dec-associe-unique-gerant-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">D\u00e9cisions associ\u00e9 unique g\u00e9rant \u2014 {denomination}</w:t></w:r>
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
    c("D\u00c9CISIONS DE L\u2019ASSOCI\u00c9 UNIQUE G\u00c9RANT DU {date_decisions}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_decisions_lettres}, et le {date_decisions} \u00e0 {heure_decisions_lettres} heures,"),
    t(""),
    t("{associe_civilite} {associe_prenom} {associe_nom}, associ\u00e9 unique et seul g\u00e9rant de la soci\u00e9t\u00e9, apr\u00e8s avoir pris connaissance des rapports du commissaire aux comptes (\u00e9ventuellement) a pris les d\u00e9cisions suivantes :"),
    t(""),

    // ===== A. PREMIERE DECISION : APPROBATION DES COMPTES =====
    t("{#has_approbation_comptes}"),
    b("A. Premi\u00e8re d\u00e9cision : Approbation des comptes"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant approuve l\u2019inventaire et les comptes annuels tels qu\u2019il les a pr\u00e9sent\u00e9s, et qui font appara\u00eetre un r\u00e9sultat {resultat_type} de {resultat_montant} {devise}."),
    t(""),
    t("En cons\u00e9quence, il donne quitus au commissaire aux comptes pour ledit exercice."),
    t(""),
    t("{/has_approbation_comptes}"),

    // ===== B. DEUXIEME DECISION : AFFECTATION DES RESULTATS =====
    t("{#has_affectation_resultats}"),
    b("B. Deuxi\u00e8me d\u00e9cision : Affectation des r\u00e9sultats"),
    t(""),
    t("{#is_beneficiaire}"),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide d\u2019affecter le r\u00e9sultat net b\u00e9n\u00e9ficiaire de {resultat_montant} francs CFA de l\u2019exercice {exercice_clos_le} de la mani\u00e8re suivante :"),
    t(""),
    t("{affectation_details}"),
    t("{/is_beneficiaire}"),
    t("{#is_deficitaire}"),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide d\u2019affecter le r\u00e9sultat net d\u00e9ficitaire de {resultat_montant} francs CFA au report \u00e0 nouveau."),
    t("{/is_deficitaire}"),
    t(""),
    t("{/has_affectation_resultats}"),

    // ===== C. TROISIEME DECISION : APPROBATION DES CONVENTIONS =====
    t("{#has_conventions_decision}"),
    b("C. Troisi\u00e8me d\u00e9cision : Approbation des conventions"),
    t(""),
    t("{#has_conventions}"),
    t("L\u2019associ\u00e9 unique g\u00e9rant, apr\u00e8s avoir entendu la lecture du rapport sp\u00e9cial du commissaire aux comptes sur la convention conclue au cours de l\u2019exercice entre {convention_details} et la soci\u00e9t\u00e9 et lui m\u00eame approuve les op\u00e9rations ressortant de ladite convention."),
    t("{/has_conventions}"),
    t(""),
    t("{/has_conventions_decision}"),

    // ===== D. QUATRIEME DECISION : RENOUVELLEMENT DU GERANT =====
    t("{#has_renouvellement_gerant}"),
    b("D. Quatri\u00e8me d\u00e9cision : Renouvellement des fonctions du g\u00e9rant"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant renouvelle son mandat de g\u00e9rant de la soci\u00e9t\u00e9 pour une dur\u00e9e de {duree_gerant}, venant \u00e0 expiration le ..."),
    t(""),
    t("{/has_renouvellement_gerant}"),

    // ===== E. CINQUIEME DECISION : REMUNERATION DU GERANT =====
    t("{#has_remuneration_gerant}"),
    b("E. Cinqui\u00e8me d\u00e9cision : R\u00e9mun\u00e9ration du g\u00e9rant"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide que pour l\u2019exercice de ses fonctions, et pendant la dur\u00e9e de son mandat, il aura droit \u00e0 une r\u00e9mun\u00e9ration ainsi d\u00e9termin\u00e9e : {remuneration_gerant}"),
    t(""),
    t("Il aura \u00e9galement droit au remboursement de ses frais de repr\u00e9sentation et de d\u00e9placement sur justificatif."),
    t(""),
    t("{/has_remuneration_gerant}"),

    // ===== F. SIXIEME DECISION : NOMINATION DE COMMISSAIRE AUX COMPTES =====
    t("{#has_nomination_cac}"),
    b("F. Sixi\u00e8me d\u00e9cision : Nomination de commissaire aux comptes"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de nommer :"),
    t("- {commissaire_titulaire_nom}, demeurant \u00e0 {commissaire_titulaire_adresse}, en qualit\u00e9 de commissaire aux comptes titulaire ;"),
    t("- {commissaire_suppleant_nom}, demeurant \u00e0 {commissaire_suppleant_adresse}, en qualit\u00e9 de commissaire aux comptes suppl\u00e9ant,"),
    t("pour une p\u00e9riode de {commissaire_duree}, prenant fin \u00e0 l\u2019issue de l\u2019exercice clos le ..."),
    t(""),
    t("{/has_nomination_cac}"),

    // ===== G. SEPTIEME DECISION : RENOUVELLEMENT OU NON RENOUVELLEMENT MANDAT CAC =====
    t("{#has_renouvellement_cac}"),
    b("G. Septi\u00e8me d\u00e9cision : Renouvellement ou non renouvellement du mandat du commissaire aux comptes"),
    t(""),
    t("Le mandat de M {commissaire_titulaire_nom}, commissaire aux comptes \u00e9tant arriv\u00e9 \u00e0 expiration (ou arrivant \u00e0 expiration \u00e0 l\u2019issue de la pr\u00e9sente assembl\u00e9e), l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide :"),
    t(""),
    t("- de renouveler son mandat pour une dur\u00e9e de trois exercices prenant fin \u00e0 l\u2019issue de l\u2019exercice clos le ... ;"),
    t(""),
    t("ou"),
    t(""),
    t("- de ne pas renouveler son mandat."),
    t(""),
    t("{/has_renouvellement_cac}"),

    // ===== H. HUITIEME ET NEUVIEME DECISIONS : CHANGEMENT DE DENOMINATION SOCIALE =====
    t("{#has_changement_denomination}"),
    b("H. Huiti\u00e8me d\u00e9cision : Changement de d\u00e9nomination sociale"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide qu\u2019\u00e0 compter du {date_effet}, la d\u00e9nomination sociale sera \u00ab {nouvelle_denomination} \u00bb."),
    t(""),
    b("Neuvi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier l\u2019article n\u00b0 {article_denomination} des statuts comme suit :"),
    t("\u00ab La soci\u00e9t\u00e9 a pour d\u00e9nomination sociale \u00ab {nouvelle_denomination} \u00bb. Le reste de l\u2019article est sans changement."),
    t(""),
    t("{/has_changement_denomination}"),

    // ===== I. DIXIEME ET ONZIEME DECISIONS : PROROGATION DE LA DUREE =====
    t("{#has_prorogation_duree}"),
    b("I. Dixi\u00e8me d\u00e9cision : Prorogation de la dur\u00e9e de la soci\u00e9t\u00e9"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant constatant que la dur\u00e9e de la soci\u00e9t\u00e9 doit venir \u00e0 expiration le {date_expiration}, d\u00e9cide de proroger cette dur\u00e9e de {duree_prorogation} ann\u00e9es, soit jusqu\u2019au {nouvelle_date_expiration}."),
    t(""),
    b("Onzi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier l\u2019article des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9 comme suit :"),
    t("\u00ab La dur\u00e9e de la soci\u00e9t\u00e9 est fix\u00e9e \u00e0 ... ann\u00e9es \u00e0 compter de son immatriculation au RCCM, soit jusqu\u2019au {nouvelle_date_expiration} \u00bb. Le reste de l\u2019article est sans changement."),
    t(""),
    t("{/has_prorogation_duree}"),

    // ===== J. DOUZIEME ET TREIZIEME DECISIONS : MODIFICATION DE L'OBJET SOCIAL =====
    t("{#has_modification_objet}"),
    b("J. Douzi\u00e8me d\u00e9cision : Modification de l\u2019objet social"),
    t(""),
    t("L\u2019associ\u00e9 unique d\u00e9cide d\u2019\u00e9tendre (ou de restreindre), \u00e0 compter du {date_effet}, l\u2019objet social aux activit\u00e9s ci-apr\u00e8s :"),
    t(""),
    t("{nouvel_objet_social}"),
    t(""),
    b("Treizi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier l\u2019article des statuts relatif \u00e0 l\u2019objet social comme suit :"),
    t("\u00ab La soci\u00e9t\u00e9 a pour objet : {nouvel_objet_social} \u00bb. Le reste de l\u2019article est sans changement."),
    t(""),
    t("{/has_modification_objet}"),

    // ===== K. QUATORZIEME ET QUINZIEME DECISIONS : TRANSFERT DU SIEGE SOCIAL =====
    t("{#has_transfert_siege}"),
    b("K. Quatorzi\u00e8me d\u00e9cision : Transfert du si\u00e8ge social"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de transf\u00e9rer, \u00e0 compter du {date_effet}, le si\u00e8ge social de {ancien_siege} \u00e0 {nouveau_siege}."),
    t(""),
    b("Quinzi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier l\u2019article des statuts relatif au si\u00e8ge social comme suit :"),
    t("\u00ab Le si\u00e8ge social est fix\u00e9 \u00e0 {nouveau_siege} \u00bb. Le reste de l\u2019article est sans changement."),
    t(""),
    t("{/has_transfert_siege}"),

    // ===== L. QUINZIEME DECISION (BIS) : CONTINUATION MALGRE PERTE =====
    t("{#has_continuation_perte}"),
    b("L. Quinzi\u00e8me d\u00e9cision : Continuation de la soci\u00e9t\u00e9 malgr\u00e9 la perte de plus de la moiti\u00e9 du capital"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant constatant que les \u00e9tats financiers au {date_etats_financiers}, pr\u00e9c\u00e9demment approuv\u00e9s par lui, font appara\u00eetre des capitaux propres de {montant_capitaux_propres} FCFA, soit un montant inf\u00e9rieur \u00e0 la moiti\u00e9 du capital social qui est de {capital} FCFA, d\u00e9cide qu\u2019il n\u2019y a pas lieu, malgr\u00e9 cette perte, de prononcer la dissolution anticip\u00e9e de la soci\u00e9t\u00e9."),
    t(""),
    t("{/has_continuation_perte}"),

    // ===== M. SEIZIEME ET DIX SEPTIEME DECISIONS : AUGMENTATION DE CAPITAL PAR APPORTS EN NUMERAIRE =====
    t("{#has_augmentation_capital_numeraire}"),
    b("M. Seizi\u00e8me d\u00e9cision : Augmentation de capital par apports en num\u00e9raire"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide d\u2019augmenter de la somme de {montant_augmentation} FCFA, le capital social qui est actuellement de {capital} FCFA, divis\u00e9 en {nombre_parts} parts de FCFA {valeur_nominale} chacune, pour le porter \u00e0 FCFA {nouveau_capital} par la cr\u00e9ation de {nouvelles_parts} parts nouvelles, de FCFA {valeur_nominale} chacune souscrites et lib\u00e9r\u00e9es int\u00e9gralement par versements d\u2019esp\u00e8ces ou compensation avec une cr\u00e9ance certaine, liquide et exigible sur la soci\u00e9t\u00e9."),
    t(""),
    b("Dix septi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier les articles des statuts relatifs aux apports et au capital social."),
    t(""),
    t("{/has_augmentation_capital_numeraire}"),

    // ===== N. DIX HUITIEME ET DIX NEUVIEME DECISIONS : AUGMENTATION DE CAPITAL PAR APPORT EN NATURE =====
    t("{#has_augmentation_capital_nature}"),
    b("N. Dix huiti\u00e8me d\u00e9cision : Augmentation de capital par apport en nature"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant, apr\u00e8s avoir pris connaissance du rapport de M {commissaire_apports_nom}, commissaire aux apports d\u00e9sign\u00e9 en date du {date_designation_commissaire}, approuve l\u2019acte d\u2019apport et d\u00e9cide, en cons\u00e9quence, d\u2019augmenter de la somme de FCFA {montant_augmentation} le capital social qui est actuellement de {capital} FCFA, divis\u00e9 en {nombre_parts} parts de FCFA {valeur_nominale} chacune, pour le porter \u00e0 FCFA {nouveau_capital} par la cr\u00e9ation de {nouvelles_parts} parts nouvelles de FCFA {valeur_nominale} chacune, attribu\u00e9es \u00e0 l\u2019apporteur en r\u00e9mun\u00e9ration de son apport."),
    t(""),
    b("Dix neuvi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier les articles des statuts relatifs aux apports et au capital social."),
    t(""),
    t("{/has_augmentation_capital_nature}"),

    // ===== O. VINGTIEME ET VINGT ET UNIEME DECISIONS : AUGMENTATION CAPITAL PAR INCORPORATION DE RESERVES (CREATION DE PARTS) =====
    t("{#has_augmentation_capital_reserves}"),
    b("O. Vingti\u00e8me d\u00e9cision : Augmentation de capital par incorporation de r\u00e9serves, primes, avec cr\u00e9ation de nouvelles parts"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide d\u2019augmenter de la somme de {montant_augmentation} FCFA le capital social qui est actuellement de {capital} FCFA, divis\u00e9 en {nombre_parts} parts de FCFA {valeur_nominale} chacune, pour le porter \u00e0 FCFA {nouveau_capital}, par incorporation directe de pareille somme du poste \u00ab R\u00e9serves ... \u00bb, par la cr\u00e9ation de {nouvelles_parts} parts nouvelles de FCFA {valeur_nominale} chacune attribu\u00e9es gratuitement \u00e0 raison de ... parts nouvelles pour ... parts anciennes."),
    t(""),
    b("Vingt et uni\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier les articles des statuts relatifs au capital social."),
    t(""),
    t("{/has_augmentation_capital_reserves}"),

    // ===== P. VINGT DEUXIEME ET VINGT TROISIEME DECISIONS : AUGMENTATION CAPITAL PAR INCORPORATION DE RESERVES (MAJORATION VALEUR NOMINALE) =====
    t("{#has_augmentation_capital_majoration}"),
    b("P. Vingt deuxi\u00e8me d\u00e9cision : Augmentation de capital par incorporation de r\u00e9serves, primes, avec majoration de la valeur nominale de la part"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide d\u2019augmenter de la somme de {montant_augmentation} FCFA le capital social qui est actuellement de {capital} FCFA, divis\u00e9 en {nombre_parts} parts de FCFA {valeur_nominale} chacune, pour le porter \u00e0 FCFA {nouveau_capital}, par incorporation directe de pareille somme du poste \u00ab R\u00e9serves ... \u00bb, par majoration de la valeur nominale de chaque part sociale qui est port\u00e9e de {valeur_nominale} FCFA \u00e0 {nouvelle_valeur_nominale} FCFA."),
    t(""),
    b("Vingt troisi\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier les articles des statuts relatifs au capital social."),
    t(""),
    t("{/has_augmentation_capital_majoration}"),

    // ===== Q. VINGT QUATRIEME ET VINGT CINQUIEME DECISIONS : REDUCTION DE CAPITAL =====
    t("{#has_reduction_capital}"),
    b("Q. Vingt quatri\u00e8me d\u00e9cision : R\u00e9duction de capital"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant, apr\u00e8s avoir pris connaissance des rapports du commissaire aux comptes (\u00e9ventuellement), d\u00e9cide de proc\u00e9der \u00e0 la r\u00e9duction du capital de {montant_reduction} FCFA (nouveau capital)."),
    t(""),
    t("La r\u00e9duction du capital sera r\u00e9alis\u00e9e par voie de r\u00e9duction de la valeur nominale des parts sociales qui passe de {ancienne_valeur} FCFA \u00e0 {nouvelle_valeur} FCFA."),
    t(""),
    t("ou bien :"),
    t(""),
    t("La r\u00e9duction du capital sera r\u00e9alis\u00e9e par r\u00e9duction du nombre de parts sociales qui passe de {nombre_parts} \u00e0 ..."),
    t(""),
    b("Vingt cinqui\u00e8me d\u00e9cision : Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence de la r\u00e9solution pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier l\u2019article des statuts relatif au capital social."),
    t(""),
    t("{/has_reduction_capital}"),

    // ===== R. VINGT SIXIEME A VINGT NEUVIEME DECISIONS : TRANSFORMATION =====
    t("{#has_transformation}"),
    b("R. Vingt sixi\u00e8me d\u00e9cision : Transformation"),
    t(""),
    t("L\u2019associ\u00e9 unique apr\u00e8s avoir entendu le rapport du commissaire aux comptes :"),
    t(""),
    t("- prend acte de l\u2019attestation du commissaire aux comptes que : les capitaux propres de la soci\u00e9t\u00e9 sont au moins \u00e9gaux au capital social, la soci\u00e9t\u00e9 a fait approuver par les associ\u00e9s les bilans des deux premiers exercices ;"),
    t(""),
    t("- et d\u00e9cide la transformation en soci\u00e9t\u00e9 {nouvelle_forme_juridique} \u00e0 compter de ce jour (ou \u00e0 compter du ...)."),
    t(""),
    b("Vingt septi\u00e8me d\u00e9cision : Modification des statuts"),
    t(""),
    t("En cons\u00e9quence de la transformation ci-dessus d\u00e9cid\u00e9e, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier les statuts de la soci\u00e9t\u00e9 pour les adapter \u00e0 la nouvelle forme juridique."),
    t(""),
    b("Vingt huiti\u00e8me d\u00e9cision : D\u00e9signation des dirigeants"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de d\u00e9signer les dirigeants de la soci\u00e9t\u00e9 sous sa nouvelle forme."),
    t(""),
    b("Vingt neuvi\u00e8me d\u00e9cision : D\u00e9signation du commissaire aux comptes"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de d\u00e9signer un commissaire aux comptes conform\u00e9ment aux dispositions applicables \u00e0 la nouvelle forme juridique."),
    t(""),
    t("{/has_transformation}"),

    // ===== S. TRENTIEME A TRENTE DEUXIEME DECISIONS : DISSOLUTION ET LIQUIDATION =====
    t("{#has_dissolution}"),
    b("S. Trenti\u00e8me d\u00e9cision : Dissolution et liquidation"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant prononce la dissolution, par anticipation, de la soci\u00e9t\u00e9 {denomination} \u00e0 compter de ce jour (ou : \u00e0 compter du ...)."),
    t(""),
    b("Trente et uni\u00e8me d\u00e9cision : Modification de l\u2019article des statuts relatif \u00e0 la dur\u00e9e"),
    t(""),
    t("En cons\u00e9quence de la dissolution ci-dessus prononc\u00e9e, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de modifier l\u2019article des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9."),
    t(""),
    b("Trente deuxi\u00e8me d\u00e9cision : Nomination du liquidateur"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant nomme comme liquidateur M {liquidateur_nom} (nom et adresse) pour la dur\u00e9e de la liquidation."),
    t(""),
    t("Le si\u00e8ge de la liquidation est fix\u00e9 au si\u00e8ge social (ou : \u00e0 ...)."),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide qu\u2019en r\u00e9mun\u00e9ration de ses fonctions, le liquidateur aura droit \u00e0 ..."),
    t(""),
    t("{/has_dissolution}"),

    // ===== T. TRENTE TROISIEME ET TRENTE QUATRIEME DECISIONS : MISE EN HARMONIE DES STATUTS =====
    t("{#has_mise_harmonie}"),
    b("T. Trente troisi\u00e8me d\u00e9cision : Mise en harmonie des statuts"),
    t(""),
    t("L\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de mettre les statuts en harmonie avec les nouvelles dispositions de l\u2019Acte Uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE, notamment les articles 907 et suivants."),
    t(""),
    b("Trente quatri\u00e8me d\u00e9cision : Refonte compl\u00e8te des statuts"),
    t(""),
    t("En cons\u00e9quence de la d\u00e9cision pr\u00e9c\u00e9dente, l\u2019associ\u00e9 unique g\u00e9rant d\u00e9cide de proc\u00e9der \u00e0 une refonte compl\u00e8te des statuts de la soci\u00e9t\u00e9 afin de les mettre en conformit\u00e9 avec les dispositions de l\u2019Acte Uniforme r\u00e9vis\u00e9."),
    t(""),
    t("{/has_mise_harmonie}"),

    // ===== U. TRENTE CINQUIEME DECISION : POUVOIRS =====
    t("{#has_pouvoirs}"),
    b("U. Trente cinqui\u00e8me d\u00e9cision : Pouvoirs"),
    t(""),
    t("L\u2019associ\u00e9 unique d\u00e9l\u00e8gue tous pouvoirs au porteur d\u2019une copie ou d\u2019un extrait du proc\u00e8s-verbal constatant les d\u00e9lib\u00e9rations \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales ou autres."),
    t(""),
    t("{/has_pouvoirs}"),

    // ===== CLOTURE =====
    t("De tout ce que dessus, l\u2019associ\u00e9 unique g\u00e9rant a dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal qu\u2019il a sign\u00e9."),
    t(""),
    t(""),
    b("L\u2019Associ\u00e9 Unique"),
    t("{associe_civilite} {associe_prenom} {associe_nom}"),
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

  const outputDir = path.join(__dirname, "../templates/dec-associe-unique-gerant");
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
