/**
 * Script pour creer le template DOCX du rapport du CA presente aux actionnaires en AGE pour la dissolution-liquidation
 * Usage : npx tsx scripts/create-rapport-ca-dissolution-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Rapport CA dissolution \u2014 {denomination}</w:t></w:r>
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
    c("RAPPORT DU CONSEIL D\u2019ADMINISTRATION"),
    c("PR\u00c9SENT\u00c9 AUX ACTIONNAIRES R\u00c9UNIS EN ASSEMBL\u00c9E G\u00c9N\u00c9RALE EXTRAORDINAIRE"),
    c("POUR LA DISSOLUTION-LIQUIDATION"),
    t(""),

    // ===== INTRODUCTION =====
    t("Mesdames, Messieurs les actionnaires,"),
    t(""),
    t("Nous vous avons convoqu\u00e9s en assembl\u00e9e g\u00e9n\u00e9rale extraordinaire, conform\u00e9ment aux dispositions l\u00e9gales et statutaires, \u00e0 l\u2019effet de vous soumettre la proposition de dissolution anticip\u00e9e de la soci\u00e9t\u00e9 {denomination} et de sa mise en liquidation."),
    t(""),

    // ===== MOTIFS =====
    b("I. Motifs de la dissolution"),
    t(""),
    t("{motifs_dissolution}"),
    t(""),

    // ===== PROPOSITION DISSOLUTION =====
    b("II. Proposition de dissolution"),
    t(""),
    t("Compte tenu des \u00e9l\u00e9ments expos\u00e9s ci-dessus, votre conseil d\u2019administration vous propose de prononcer la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 {denomination}, \u00e0 compter du jour de la pr\u00e9sente assembl\u00e9e g\u00e9n\u00e9rale extraordinaire."),
    t(""),
    t("Cette dissolution entra\u00eenera la mise en liquidation de la soci\u00e9t\u00e9 conform\u00e9ment aux dispositions des articles 203 et suivants de l\u2019Acte Uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE."),
    t(""),

    // ===== NOMINATION LIQUIDATEUR =====
    b("III. Nomination du liquidateur"),
    t(""),
    t("Votre conseil d\u2019administration vous propose de nommer en qualit\u00e9 de liquidateur {liquidateur_civilite} {liquidateur_nom}, demeurant \u00e0 {liquidateur_adresse}."),
    t(""),
    t("Le liquidateur aura les pouvoirs les plus \u00e9tendus pour proc\u00e9der \u00e0 la r\u00e9alisation de l\u2019actif et au r\u00e8glement du passif de la soci\u00e9t\u00e9."),
    t(""),
    t("Le si\u00e8ge de la liquidation sera fix\u00e9 \u00e0 {siege_liquidation}."),
    t(""),
    t("La r\u00e9mun\u00e9ration du liquidateur sera de {remuneration_liquidateur}."),
    t(""),

    // ===== MODIFICATION ARTICLE DUREE =====
    b("IV. Modification de l\u2019article des statuts relatif \u00e0 la dur\u00e9e"),
    t(""),
    t("En cons\u00e9quence de la dissolution, il vous est propos\u00e9 de modifier l\u2019article {article_duree} des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9, pour y mentionner que la soci\u00e9t\u00e9 est dissoute \u00e0 compter du {date_dissolution} et qu\u2019elle subsiste pour les besoins de sa liquidation."),
    t(""),

    // ===== CONCLUSION =====
    b("V. Conclusion"),
    t(""),
    t("Nous vous prions de bien vouloir adopter les r\u00e9solutions qui vous sont soumises."),
    t(""),
    t("Nous restons \u00e0 votre disposition pour r\u00e9pondre \u00e0 toutes les questions que vous pourriez avoir."),
    t(""),
    t(""),
    b("Le Conseil d\u2019Administration"),
    t(""),
    t("Le Pr\u00e9sident du Conseil d\u2019Administration"),
    t("{pca_civilite} {pca_nom}"),
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

  const outputDir = path.join(__dirname, "../templates/rapport-ca-dissolution");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "rapport.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
