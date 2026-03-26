/**
 * Script pour cr\u00e9er le template DOCX de la D\u00e9claration de R\u00e9gularit\u00e9 et de Conformit\u00e9 (DRC) OHADA
 * Bas\u00e9 sur le mod\u00e8le officiel du Guide Pratique des Soci\u00e9t\u00e9s Commerciales et du GIE - OHADA (art. 73, pages 608-609)
 * Usage : npx tsx scripts/create-drc-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">D\u00E9claration de R\u00E9gularit\u00E9 et de Conformit\u00E9 \u2014 {denomination}</w:t></w:r>
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

// Raccourcis
const t = (text: string) => p(text);
const b = (text: string) => p(text, true);
const c = (text: string) => p(text, true, 28, true);
const it = (text: string) => p(text, false, 24, false, true);

function createTemplate() {
  const zip = createEmptyDocx();

  const body = [
    // ===== TITRE =====
    c("D\u00c9CLARATION DE R\u00c9GULARIT\u00c9 ET DE CONFORMIT\u00c9"),
    it("(Article 73 de l\u2019Acte Uniforme OHADA relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE)"),
    t(""),

    // ===== Identification de la soci\u00e9t\u00e9 =====
    t("Concernant la soci\u00e9t\u00e9 : {denomination}, {forme_juridique}, au capital de {capital} {devise}, si\u00e8ge social : {siege_social}."),
    t(""),

    // ===== Les soussign\u00e9s =====
    b("Les soussign\u00e9s :"),
    t(""),
    t("{#signataires}"),
    t("- {civilite} {prenom} {nom}, demeurant \u00e0 {adresse} ;"),
    t("{/signataires}"),
    t(""),
    t("agissant en qualit\u00e9 de {qualite_signataires} de la soci\u00e9t\u00e9,"),
    t(""),
    t("d\u00e9clarent, conform\u00e9ment aux dispositions de l\u2019article 73 de l\u2019Acte Uniforme de l\u2019OHADA relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE, qu\u2019ils ont effectu\u00e9 les op\u00e9rations suivantes en vue de constituer r\u00e9guli\u00e8rement ladite soci\u00e9t\u00e9 :"),
    t(""),

    // ===== SECTION : Capital social =====
    b("Capital social"),
    t(""),
    t("Le capital social d\u2019un montant de {capital} {devise} ({capital_lettres}) divis\u00e9 en {nombre_titres} {type_titres} de valeur nominale {valeur_nominale} {devise} chacune, est int\u00e9gralement souscrit. Il est enti\u00e8rement lib\u00e9r\u00e9{#liberation_fractionnee} \u00e0 concurrence de {quotite_liberee}{/liberation_fractionnee}."),
    t(""),

    // ===== SECTION : D\u00e9p\u00f4t des fonds =====
    b("D\u00e9p\u00f4t des fonds"),
    t(""),
    t("Les fonds provenant de la souscription des {type_titres} en num\u00e9raire ont \u00e9t\u00e9 d\u00e9pos\u00e9s, dans les huit jours de leur r\u00e9ception \u00e0 la banque {nom_banque} ({adresse_banque}) \u00e0 un compte ouvert au nom de la soci\u00e9t\u00e9 en formation, ainsi que l\u2019atteste le certificat du d\u00e9positaire, auquel est annex\u00e9e la liste des souscripteurs."),
    t(""),

    // ===== SECTION : Statuts =====
    b("Statuts"),
    t(""),
    t("Les statuts ont \u00e9t\u00e9 \u00e9tablis conform\u00e9ment aux dispositions de l\u2019Acte Uniforme de l\u2019OHADA en date du {date_statuts} et sign\u00e9s par tous les souscripteurs, en personne ou par mandataire sp\u00e9cialement habilit\u00e9s \u00e0 cet effet."),
    t(""),
    t("Ils contiennent toutes les \u00e9nonciations exig\u00e9es par la loi, notamment celles relatives \u00e0 la forme sociale, au montant du capital, \u00e0 la dur\u00e9e, \u00e0 la d\u00e9nomination sociale, au si\u00e8ge social, aux {type_titres}, aux premiers organes d\u2019administration de direction et de contr\u00f4le."),
    t(""),

    // ===== SECTION : Premiers organes d'administration, de direction et de contr\u00f4le =====
    b("Premiers organes d\u2019administration, de direction et de contr\u00f4le"),
    t(""),
    t("Les premiers administrateurs, et les premiers commissaires aux comptes ont \u00e9t\u00e9 r\u00e9guli\u00e8rement d\u00e9sign\u00e9s dans les statuts."),
    t(""),

    // Pr\u00e9sident du Conseil d'Administration
    t("{#has_president_ca}"),
    t("Le premier conseil d\u2019administration a d\u00e9sign\u00e9 son pr\u00e9sident en la personne de {president_ca_civilite} {president_ca_prenom} {president_ca_nom}."),
    t("{/has_president_ca}"),
    t(""),

    // Directeur G\u00e9n\u00e9ral
    t("{#has_dg}"),
    t("{dg_civilite} {dg_prenom} {dg_nom} a \u00e9t\u00e9 d\u00e9sign\u00e9 en qualit\u00e9 de Directeur G\u00e9n\u00e9ral."),
    t("{/has_dg}"),
    t(""),

    // Administrateur G\u00e9n\u00e9ral
    t("{#has_ag}"),
    t("{ag_civilite} {ag_prenom} {ag_nom} a \u00e9t\u00e9 d\u00e9sign\u00e9 en qualit\u00e9 d\u2019Administrateur G\u00e9n\u00e9ral."),
    t("{/has_ag}"),
    t(""),

    // Pr\u00e9sident SAS
    t("{#has_president_sas}"),
    t("{president_sas_civilite} {president_sas_prenom} {president_sas_nom} a \u00e9t\u00e9 d\u00e9sign\u00e9 en qualit\u00e9 de Pr\u00e9sident."),
    t("{/has_president_sas}"),
    t(""),

    // G\u00e9rant
    t("{#has_gerant}"),
    t("{gerant_civilite} {gerant_prenom} {gerant_nom} a \u00e9t\u00e9 d\u00e9sign\u00e9 en qualit\u00e9 de G\u00e9rant."),
    t("{/has_gerant}"),
    t(""),

    // Commissaire aux Comptes titulaire
    t("{#has_cac}"),
    t("{cac_civilite} {cac_prenom} {cac_nom} a \u00e9t\u00e9 d\u00e9sign\u00e9 en qualit\u00e9 de Commissaire aux Comptes titulaire pour une dur\u00e9e de {duree_mandat_cac} exercices."),
    t("{/has_cac}"),
    t(""),

    // Commissaire aux Comptes suppl\u00e9ant
    t("{#has_cac_suppleant}"),
    t("{cac_suppleant_civilite} {cac_suppleant_prenom} {cac_suppleant_nom} a \u00e9t\u00e9 d\u00e9sign\u00e9 en qualit\u00e9 de Commissaire aux Comptes suppl\u00e9ant."),
    t("{/has_cac_suppleant}"),
    t(""),

    // ===== SECTION : Actes accomplis avant la signature des statuts =====
    b("Actes accomplis pour le compte de la soci\u00e9t\u00e9 avant la signature des statuts"),
    t(""),

    t("{#has_actes_anterieurs}"),
    t("Les actes et engagements pris par les fondateurs pour le compte de la soci\u00e9t\u00e9 en formation, ont \u00e9t\u00e9 port\u00e9s \u00e0 la connaissance des actionnaires avant la signature des statuts."),
    t(""),
    t("L\u2019\u00e9tat desdits actes, indiquant pour chacun d\u2019eux l\u2019engagement qui en r\u00e9sultera pour la soci\u00e9t\u00e9, a \u00e9t\u00e9 annex\u00e9 aux statuts."),
    t("{/has_actes_anterieurs}"),

    t("{#sans_actes_anterieurs}"),
    t("Aucun acte n\u2019a \u00e9t\u00e9 accompli pour le compte de la soci\u00e9t\u00e9 avant la signature des statuts."),
    t("{/sans_actes_anterieurs}"),
    t(""),

    // ===== AFFIRMATION FINALE =====
    b("Affirmation finale"),
    t(""),
    t("Comme cons\u00e9quence des d\u00e9clarations ci-dessus, les soussign\u00e9s affirment sous leur responsabilit\u00e9 que la constitution de la soci\u00e9t\u00e9 a \u00e9t\u00e9 r\u00e9alis\u00e9e conform\u00e9ment aux dispositions l\u00e9gales et r\u00e9glementaires."),
    t(""),
    t("Fait \u00e0 {lieu_signature}, le {date_signature} en {nombre_exemplaires} exemplaires."),
    t(""),
    t(""),

    // ===== Signataires =====
    b("Les signataires :"),
    t(""),
    t("{#signataires}"),
    t("{civilite} {prenom} {nom}"),
    t(""),
    t(""),
    t("{/signataires}"),
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

  const outputDir = path.join(__dirname, "../templates/drc");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "declaration.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
