/**
 * Script pour creer le template DOCX des Decisions de l'actionnaire unique non AG SA / non president SAS
 * Usage : npx tsx scripts/create-dec-actionnaire-unique-non-ag-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">D\u00e9cisions actionnaire unique non AG \u2014 {denomination}</w:t></w:r>
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
    c("D\u00c9CISIONS DE L\u2019ACTIONNAIRE UNIQUE NON ADMINISTRATEUR G\u00c9N\u00c9RAL SA OU NON PR\u00c9SIDENT SAS"),
    c("EN DATE DU {date_decisions}"),
    t(""),

    // ===== VARIANTE PERSONNE PHYSIQUE =====
    t("{#is_personne_physique}"),
    t("L\u2019an {date_decisions_lettres}, et le {date_decisions} \u00e0 {heure_decisions_lettres} heures,"),
    t(""),
    t("{actionnaire_civilite} {actionnaire_prenom} {actionnaire_nom}, n\u00e9(e) le {actionnaire_date_naissance} \u00e0 {actionnaire_lieu_naissance}, de nationalit\u00e9 {actionnaire_nationalite}, demeurant \u00e0 {actionnaire_adresse},"),
    t(""),
    t("Actionnaire unique de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm},"),
    t("{/is_personne_physique}"),

    // ===== VARIANTE PERSONNE MORALE =====
    t("{#is_personne_morale}"),
    t("L\u2019an {date_decisions_lettres}, et le {date_decisions} \u00e0 {heure_decisions_lettres} heures,"),
    t(""),
    t("La soci\u00e9t\u00e9 {actionnaire_denomination}, {actionnaire_forme_juridique} au capital de {actionnaire_capital} {devise}, dont le si\u00e8ge social est \u00e0 {actionnaire_siege}, immatricul\u00e9e au RCCM sous le n\u00b0 {actionnaire_rccm}, repr\u00e9sent\u00e9e par {actionnaire_representant_civilite} {actionnaire_representant_prenom} {actionnaire_representant_nom}, agissant en qualit\u00e9 de {actionnaire_representant_qualite},"),
    t(""),
    t("Actionnaire unique de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm},"),
    t("{/is_personne_morale}"),
    t(""),

    // ===== RAPPORTS =====
    t("Apr\u00e8s avoir re\u00e7u communication et pris connaissance :"),
    t("- du rapport de gestion de l\u2019administrateur g\u00e9n\u00e9ral (ou du pr\u00e9sident) sur l\u2019activit\u00e9 de la soci\u00e9t\u00e9 et les comptes de l\u2019exercice clos le {exercice_clos_le} ;"),
    t("- du rapport g\u00e9n\u00e9ral du commissaire aux comptes sur les comptes dudit exercice ;"),
    t("- du rapport sp\u00e9cial du commissaire aux comptes sur les conventions vis\u00e9es aux articles 505 et 853-14 de l\u2019AUSCGIE ;"),
    t("- des \u00e9tats financiers de synth\u00e8se de l\u2019exercice,"),
    t(""),
    t("a pris les d\u00e9cisions suivantes :"),
    t(""),

    // ===== A. APPROBATION DES COMPTES =====
    t("{#has_approbation_comptes}"),
    b("A. Premi\u00e8re d\u00e9cision : Approbation des comptes"),
    t(""),
    t("L\u2019actionnaire unique approuve les \u00e9tats financiers de synth\u00e8se de l\u2019exercice clos le {exercice_clos_le}, tels qu\u2019ils lui ont \u00e9t\u00e9 pr\u00e9sent\u00e9s par l\u2019administrateur g\u00e9n\u00e9ral (ou le pr\u00e9sident), et qui font appara\u00eetre un r\u00e9sultat {resultat_type} de {resultat_montant} {devise}."),
    t(""),
    t("Il approuve \u00e9galement les op\u00e9rations traduites dans ces comptes ou r\u00e9sum\u00e9es dans les rapports."),
    t(""),
    t("En cons\u00e9quence, il donne quitus \u00e0 l\u2019administrateur g\u00e9n\u00e9ral (ou au pr\u00e9sident) de sa gestion pour ledit exercice."),
    t(""),
    t("Il donne \u00e9galement quitus au commissaire aux comptes de l\u2019ex\u00e9cution de sa mission pour ledit exercice."),
    t(""),
    t("{/has_approbation_comptes}"),

    // ===== B. AFFECTATION DES RESULTATS =====
    t("{#has_affectation_resultats}"),
    b("B. Deuxi\u00e8me d\u00e9cision : Affectation des r\u00e9sultats"),
    t(""),
    t("{#is_beneficiaire}"),
    t("L\u2019actionnaire unique d\u00e9cide d\u2019affecter le r\u00e9sultat net b\u00e9n\u00e9ficiaire de {resultat_montant} {devise} de l\u2019exercice clos le {exercice_clos_le} de la mani\u00e8re suivante :"),
    t(""),
    t("{affectation_details}"),
    t("{/is_beneficiaire}"),
    t("{#is_deficitaire}"),
    t("L\u2019actionnaire unique d\u00e9cide d\u2019affecter le r\u00e9sultat net d\u00e9ficitaire de {resultat_montant} {devise} au report \u00e0 nouveau d\u00e9biteur."),
    t("{/is_deficitaire}"),
    t(""),
    t("{/has_affectation_resultats}"),

    // ===== C. CONVENTIONS =====
    t("{#has_conventions}"),
    b("C. Troisi\u00e8me d\u00e9cision : Approbation des conventions vis\u00e9es aux articles 505 et 853-14 de l\u2019AUSCGIE"),
    t(""),
    t("L\u2019actionnaire unique, apr\u00e8s avoir pris connaissance du rapport sp\u00e9cial du commissaire aux comptes sur les conventions vis\u00e9es aux articles 505 et 853-14 de l\u2019Acte Uniforme, approuve lesdites conventions."),
    t(""),
    t("{convention_details}"),
    t(""),
    t("{/has_conventions}"),

    // ===== D. RENOUVELLEMENT MANDAT AG =====
    t("{#has_renouvellement_ag}"),
    b("D. Quatri\u00e8me d\u00e9cision : Renouvellement du mandat de l\u2019administrateur g\u00e9n\u00e9ral (ou du pr\u00e9sident)"),
    t(""),
    t("Le mandat de {ag_nom}, administrateur g\u00e9n\u00e9ral (ou pr\u00e9sident) de la soci\u00e9t\u00e9, arrivant \u00e0 expiration \u00e0 l\u2019issue de la pr\u00e9sente d\u00e9cision, l\u2019actionnaire unique d\u00e9cide de renouveler son mandat pour une dur\u00e9e de {duree_mandat_ag}."),
    t(""),
    t("{/has_renouvellement_ag}"),

    // ===== E. NOMINATION AG =====
    t("{#has_nomination_ag}"),
    b("E. Cinqui\u00e8me d\u00e9cision : Nomination d\u2019un administrateur g\u00e9n\u00e9ral (ou pr\u00e9sident)"),
    t(""),
    t("L\u2019actionnaire unique d\u00e9cide de nommer {nouveau_ag_civilite} {nouveau_ag_prenom} {nouveau_ag_nom}, demeurant \u00e0 {nouveau_ag_adresse}, en qualit\u00e9 d\u2019administrateur g\u00e9n\u00e9ral (ou de pr\u00e9sident) de la soci\u00e9t\u00e9, pour une dur\u00e9e de {duree_mandat_ag}."),
    t(""),
    t("{/has_nomination_ag}"),

    // ===== F. NOMINATION CAC =====
    t("{#has_nomination_cac}"),
    b("F. Sixi\u00e8me d\u00e9cision : Nomination de commissaire aux comptes"),
    t(""),
    t("L\u2019actionnaire unique d\u00e9cide de nommer :"),
    t("- {commissaire_titulaire_nom}, demeurant \u00e0 {commissaire_titulaire_adresse}, en qualit\u00e9 de commissaire aux comptes titulaire ;"),
    t("- {commissaire_suppleant_nom}, demeurant \u00e0 {commissaire_suppleant_adresse}, en qualit\u00e9 de commissaire aux comptes suppl\u00e9ant,"),
    t("pour une dur\u00e9e de {commissaire_duree}, prenant fin \u00e0 l\u2019issue de l\u2019exercice clos le {commissaire_fin_mandat}."),
    t(""),
    t("{/has_nomination_cac}"),

    // ===== G. RENOUVELLEMENT CAC =====
    t("{#has_renouvellement_cac}"),
    b("G. Septi\u00e8me d\u00e9cision : Renouvellement du mandat du commissaire aux comptes"),
    t(""),
    t("Le mandat de {commissaire_titulaire_nom}, commissaire aux comptes titulaire, arrivant \u00e0 expiration \u00e0 l\u2019issue de la pr\u00e9sente d\u00e9cision, l\u2019actionnaire unique d\u00e9cide de renouveler son mandat pour une dur\u00e9e de {commissaire_duree}."),
    t(""),
    t("{/has_renouvellement_cac}"),

    // ===== H. NON-RENOUVELLEMENT CAC =====
    t("{#has_non_renouvellement_cac}"),
    b("H. Huiti\u00e8me d\u00e9cision : Non-renouvellement du mandat du commissaire aux comptes"),
    t(""),
    t("Le mandat de {commissaire_titulaire_nom}, commissaire aux comptes titulaire, arrivant \u00e0 expiration, l\u2019actionnaire unique d\u00e9cide de ne pas renouveler son mandat."),
    t(""),
    t("{/has_non_renouvellement_cac}"),

    // ===== I. POUVOIRS =====
    t("{#has_pouvoirs}"),
    b("I. Derni\u00e8re d\u00e9cision : Pouvoirs"),
    t(""),
    t("L\u2019actionnaire unique d\u00e9l\u00e8gue tous pouvoirs au porteur d\u2019une copie ou d\u2019un extrait du proc\u00e8s-verbal constatant les d\u00e9lib\u00e9rations \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales ou autres."),
    t(""),
    t("{/has_pouvoirs}"),

    // ===== CLOTURE =====
    t("De tout ce que dessus, l\u2019actionnaire unique a dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal qu\u2019il a sign\u00e9."),
    t(""),
    t(""),
    b("L\u2019Actionnaire Unique"),
    t("{#is_personne_physique}"),
    t("{actionnaire_civilite} {actionnaire_prenom} {actionnaire_nom}"),
    t("{/is_personne_physique}"),
    t("{#is_personne_morale}"),
    t("{actionnaire_denomination}"),
    t("Repr\u00e9sent\u00e9e par {actionnaire_representant_civilite} {actionnaire_representant_prenom} {actionnaire_representant_nom}"),
    t("{/is_personne_morale}"),
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

  const outputDir = path.join(__dirname, "../templates/dec-actionnaire-unique-non-ag");
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
