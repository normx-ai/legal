/**
 * Script pour créer le template DOCX de l'Acte de Cession d'Actions — SA OHADA
 * Modèle 40 du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-acte-cession-actions-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">SA au capital de {capital} FCFA</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Acte de cession d\u2019actions \u2014 {denomination}</w:t></w:r>
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
    c("ACTE DE CESSION D\u2019ACTIONS"),
    c("(SA)"),
    t(""),

    // ===== ENTRE LES SOUSSIGNÉS =====
    t("Entre les soussign\u00e9s :"),
    t(""),
    t("M {cedant_civilite} {cedant_prenom} {cedant_nom}, domicili\u00e9(e) \u00e0 {cedant_adresse}, repr\u00e9sent\u00e9(e) par {cedant_representant} (\u00e9ventuellement) ;"),
    t(""),
    t("D\u2019une part,"),
    t(""),
    t("Et M {cessionnaire_civilite} {cessionnaire_prenom} {cessionnaire_nom}, domicili\u00e9(e) \u00e0 {cessionnaire_adresse}, repr\u00e9sent\u00e9(e) par {cessionnaire_representant} (\u00e9ventuellement) ;"),
    t(""),
    t("D\u2019autre part,"),
    t(""),

    // ===== EXPOSÉ =====
    b("Il a \u00e9t\u00e9 expos\u00e9 et convenu ce qui suit :"),
    t(""),
    b("Cession d\u2019actions"),
    t("Par les pr\u00e9sentes, M {cedant_nom}, ci-apr\u00e8s d\u00e9nomm\u00e9(e) \u00ab le C\u00c9DANT \u00bb, et soussign\u00e9(e) de premi\u00e8re part, c\u00e8de et transporte, sous les garanties ordinaires de fait et de droit en la mati\u00e8re, \u00e0 M {cessionnaire_nom}, ci-apr\u00e8s d\u00e9nomm\u00e9(e) \u00ab le CESSIONNAIRE \u00bb, et soussign\u00e9(e) de seconde part, qui accepte la pleine propri\u00e9t\u00e9 de {nombre_actions_cedees} actions lui appartenant de la soci\u00e9t\u00e9 {denomination}."),
    t(""),
    t("Ladite soci\u00e9t\u00e9 est immatricul\u00e9e sous le num\u00e9ro {rccm} du registre du commerce et du cr\u00e9dit mobilier de ... (ville et pays)."),
    t(""),

    // ===== PROPRIÉTÉ =====
    b("Propri\u00e9t\u00e9 et jouissance"),
    t("Le cessionnaire sera propri\u00e9taire des actions c\u00e9d\u00e9es et en aura la jouissance \u00e0 compter de ce jour. En cons\u00e9quence, il aura seul droit \u00e0 tous les dividendes qui seront mis en distribution sur ces actions apr\u00e8s cette date."),
    t(""),

    // ===== CONDITIONS =====
    b("Conditions g\u00e9n\u00e9rales"),
    t("Le cessionnaire sera subrog\u00e9 dans tous les droits et obligations attach\u00e9s aux actions c\u00e9d\u00e9es."),
    t(""),
    t("Il reconna\u00eet avoir re\u00e7u, avant ce jour : - un exemplaire des statuts \u00e0 jour ; - un extrait des inscriptions au RCCM."),
    t(""),
    t("Il d\u00e9clare parfaitement conna\u00eetre la situation juridique actuelle de la soci\u00e9t\u00e9 et \u00eatre en possession de tous \u00e9l\u00e9ments et documents lui permettant de s\u2019engager en toute connaissance de cause."),
    t(""),

    // ===== AGRÉMENT (conditionnel) =====
    `{#has_agrement}`,
    b("Agr\u00e9ment des actionnaires ou des associ\u00e9s (\u00e9ventuellement)"),
    t("Conform\u00e9ment aux dispositions de l\u2019article n\u00b0 {article_agrement} des statuts, le cessionnaire a \u00e9t\u00e9 d\u00fbment agr\u00e9\u00e9 en qualit\u00e9 de nouvel actionnaire associ\u00e9s par d\u00e9cision du {organe_agrement} en date du {date_agrement}."),
    t(""),
    `{/has_agrement}`,

    // ===== PRIX =====
    b("Prix et modalit\u00e9s de paiement"),
    t("La pr\u00e9sente cession a \u00e9t\u00e9 consentie et accept\u00e9e moyennant le prix principal forfaitaire et irr\u00e9ductible de {prix_par_action} FCFA par action c\u00e9d\u00e9e, soit, moyennant le prix principal total de {prix_total} FCFA pour {nombre_actions_cedees} actions c\u00e9d\u00e9es, laquelle somme a \u00e9t\u00e9 pay\u00e9e comptant \u00e0 M {cedant_nom}, qui le reconna\u00eet et en consent bonne et valable quittance."),
    t(""),

    // ===== PUBLICITÉ =====
    b("Formalit\u00e9s de publicit\u00e9 et enregistrement"),
    t("Mention des pr\u00e9sentes sera consentie partout o\u00f9 besoin sera. Pour remplir toutes formalit\u00e9s n\u00e9cessaires, tous pouvoirs sont donn\u00e9s au porteur de l\u2019un des originaux des pr\u00e9sentes ;"),
    t(""),
    t("Pour la liquidation des droits d\u2019enregistrement, les soussign\u00e9s observent que les actions c\u00e9d\u00e9es sont repr\u00e9sentatives d\u2019apports en num\u00e9raire effectu\u00e9s lors de la constitution de la soci\u00e9t\u00e9."),
    t(""),

    // ===== FRAIS =====
    b("Frais"),
    t("Tous les frais des pr\u00e9sentes et ceux qui en seront la suite ou la cons\u00e9quence seront \u00e0 la charge du cessionnaire qui s\u2019oblige \u00e0 les payer."),
    t(""),

    // ===== SIGNATURE =====
    t("Fait et pass\u00e9 \u00e0 {lieu_signature}, le {date_signature}"),
    t("En {nombre_originaux} originaux"),
    t(""),
    t(""),
    t("Bon pour cession d\u2019actions          Bon pour acceptation"),
    t("Le c\u00e9dant                           Le cessionnaire"),
    t(""),
  ];

  // Wrap conditional blocks properly
  const bodyStr = body.map(item => {
    if (typeof item === 'string' && (item.startsWith('{#') || item.startsWith('{/'))) {
      return `<w:p><w:r><w:t>${item}</w:t></w:r></w:p>`;
    }
    return item;
  });

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
    ${bodyStr.join("\n    ")}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
      <w:footerReference w:type="default" r:id="rId2" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1800" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="400" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file("word/document.xml", documentXml);

  const outputDir = path.join(__dirname, "../templates/acte-cession-actions");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "acte-cession-actions.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
