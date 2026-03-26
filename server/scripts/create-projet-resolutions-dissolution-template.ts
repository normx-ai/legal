/**
 * Script pour creer le template DOCX du projet des resolutions relatives a la dissolution et la liquidation
 * Usage : npx tsx scripts/create-projet-resolutions-dissolution-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Projet r\u00e9solutions dissolution \u2014 {denomination}</w:t></w:r>
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
    c("PROJET DES R\u00c9SOLUTIONS"),
    c("RELATIVES \u00c0 LA DISSOLUTION ET LA LIQUIDATION"),
    c("DE LA SOCI\u00c9T\u00c9 {denomination}"),
    t(""),
    t("Assembl\u00e9e g\u00e9n\u00e9rale extraordinaire du {date_age}"),
    t(""),

    // ===== PREMIERE RESOLUTION : DISSOLUTION =====
    b("Premi\u00e8re r\u00e9solution : Dissolution anticip\u00e9e de la soci\u00e9t\u00e9 et modification de l\u2019article des statuts relatif \u00e0 la dur\u00e9e"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire, apr\u00e8s avoir entendu la lecture du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) :"),
    t(""),
    t("- d\u00e9cide la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm}, \u00e0 compter de ce jour ;"),
    t(""),
    t("- d\u00e9cide que la soci\u00e9t\u00e9 subsistera pour les besoins de sa liquidation jusqu\u2019\u00e0 la cl\u00f4ture de celle-ci ;"),
    t(""),
    t("- d\u00e9cide en cons\u00e9quence de modifier l\u2019article {article_duree} des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9 qui sera d\u00e9sormais r\u00e9dig\u00e9 comme suit :"),
    t("\u00ab La soci\u00e9t\u00e9 est dissoute \u00e0 compter du {date_dissolution}. Elle subsiste pour les besoins de sa liquidation. \u00bb"),
    t(""),

    // ===== DEUXIEME RESOLUTION : NOMINATION LIQUIDATEUR =====
    b("Deuxi\u00e8me r\u00e9solution : Nomination du liquidateur"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire nomme en qualit\u00e9 de liquidateur :"),
    t(""),
    t("{liquidateur_civilite} {liquidateur_prenom} {liquidateur_nom}, n\u00e9(e) le {liquidateur_date_naissance} \u00e0 {liquidateur_lieu_naissance}, de nationalit\u00e9 {liquidateur_nationalite}, demeurant \u00e0 {liquidateur_adresse}."),
    t(""),
    t("Le liquidateur aura, conform\u00e9ment \u00e0 la loi, les pouvoirs les plus \u00e9tendus pour :"),
    t("- repr\u00e9senter la soci\u00e9t\u00e9 ;"),
    t("- r\u00e9aliser l\u2019actif, m\u00eame \u00e0 l\u2019amiable ;"),
    t("- payer les cr\u00e9anciers sociaux ;"),
    t("- r\u00e9partir le solde disponible ;"),
    t("- continuer les affaires en cours ;"),
    t("- engager de nouvelles op\u00e9rations pour les besoins de la liquidation."),
    t(""),
    t("Le si\u00e8ge de la liquidation est fix\u00e9 \u00e0 {siege_liquidation}."),
    t(""),
    t("La correspondance et les actes \u00e9manant de la soci\u00e9t\u00e9 devront porter la mention \u00ab soci\u00e9t\u00e9 en liquidation \u00bb suivie du nom du liquidateur."),
    t(""),
    t("En r\u00e9mun\u00e9ration de ses fonctions, le liquidateur percevra {remuneration_liquidateur}."),
    t(""),

    // ===== TROISIEME RESOLUTION : POUVOIRS =====
    b("Troisi\u00e8me r\u00e9solution : Pouvoirs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire donne tous pouvoirs au liquidateur et au porteur d\u2019une copie ou d\u2019un extrait du pr\u00e9sent proc\u00e8s-verbal \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales, notamment :"),
    t(""),
    t("- le d\u00e9p\u00f4t au greffe du tribunal comp\u00e9tent ;"),
    t("- la publication dans un journal d\u2019annonces l\u00e9gales ;"),
    t("- la modification de l\u2019inscription au RCCM ;"),
    t("- et toutes autres formalit\u00e9s n\u00e9cessaires."),
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

  const outputDir = path.join(__dirname, "../templates/projet-resolutions-dissolution");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "projet.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
