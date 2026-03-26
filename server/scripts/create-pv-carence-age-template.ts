/**
 * Script pour créer le template DOCX du PV de Carence AGE — OHADA
 * Usage : npx tsx scripts/create-pv-carence-age-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">{forme_sociale} au capital de {capital} FCFA</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV carence AGE \u2014 {denomination}</w:t></w:r>
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
    c("PROC\u00c8S-VERBAL"),
    c("CONSTATANT LE D\u00c9FAUT DE QUORUM"),
    c("DE L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE EXTRAORDINAIRE"),
    c("DU {date_age}"),
    t(""),

    // ===== BUREAU =====
    b("COMPOSITION DU BUREAU"),
    t(""),
    t("Pr\u00e9sident de s\u00e9ance : {president_seance}"),
    t("Scrutateur 1 : {scrutateur_1}"),
    t("Scrutateur 2 : {scrutateur_2}"),
    t("Secr\u00e9taire : {secretaire}"),
    t(""),

    // ===== CONVOCATION =====
    b("CONVOCATION"),
    t(""),
    t("Les actionnaires de la soci\u00e9t\u00e9 {denomination} ont \u00e9t\u00e9 r\u00e9guli\u00e8rement convoqu\u00e9s en assembl\u00e9e g\u00e9n\u00e9rale extraordinaire par {mode_convocation} en date du {date_convocation}, pour se r\u00e9unir le {date_age} \u00e0 {heure_age}, au si\u00e8ge social sis {siege_social}."),
    t(""),

    // ===== ORDRE DU JOUR =====
    b("ORDRE DU JOUR"),
    t(""),
    t("{ordre_du_jour}"),
    t(""),

    // ===== FEUILLE DE PRÉSENCE =====
    b("FEUILLE DE PR\u00c9SENCE"),
    t(""),
    t("Il r\u00e9sulte de la feuille de pr\u00e9sence que :"),
    t(""),
    t("- Nombre total d\u2019actions composant le capital : {nb_actions_total}"),
    t("- Nombre d\u2019actions pr\u00e9sentes ou repr\u00e9sent\u00e9es : {nb_actions_presentes}"),
    t("- Nombre de voix pr\u00e9sentes ou repr\u00e9sent\u00e9es : {nb_voix_presentes}"),
    t(""),

    // ===== CONSTAT DE CARENCE =====
    b("CONSTAT DE D\u00c9FAUT DE QUORUM"),
    t(""),
    t("Le pr\u00e9sident de s\u00e9ance constate que les actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s ne d\u00e9tiennent que {nb_actions_presentes} actions sur les {nb_actions_total} actions composant le capital social, soit {pourcentage_present} % du capital."),
    t(""),
    t("Conform\u00e9ment \u00e0 l\u2019article 551 de l\u2019Acte uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du groupement d\u2019int\u00e9r\u00eat \u00e9conomique (AUSCGIE), l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire ne peut valablement d\u00e9lib\u00e9rer sur premi\u00e8re convocation que si les actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s poss\u00e8dent au moins la moiti\u00e9 (1/2) des actions ayant le droit de vote."),
    t(""),
    t("Ce quorum n\u2019\u00e9tant pas atteint, le pr\u00e9sident d\u00e9clare que l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire ne peut valablement d\u00e9lib\u00e9rer."),
    t(""),

    // ===== NOUVELLE CONVOCATION =====
    b("NOUVELLE CONVOCATION"),
    t(""),
    t("En cons\u00e9quence, conform\u00e9ment aux dispositions de l\u2019AUSCGIE, une nouvelle assembl\u00e9e g\u00e9n\u00e9rale extraordinaire sera convoqu\u00e9e avec le m\u00eame ordre du jour. Sur deuxi\u00e8me convocation, l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire ne d\u00e9lib\u00e9rera valablement que si les actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s poss\u00e8dent au moins le quart (1/4) des actions ayant le droit de vote."),
    t(""),
    t("La date de la nouvelle assembl\u00e9e est fix\u00e9e au {date_nouvelle_ag} \u00e0 {heure_nouvelle_ag}, au si\u00e8ge social."),
    t(""),
    t(""),

    // ===== SIGNATURES =====
    t("De tout ce qui pr\u00e9c\u00e8de, il a \u00e9t\u00e9 dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal."),
    t(""),
    t(""),

    b("Le Pr\u00e9sident de s\u00e9ance :"),
    t("{president_seance}"),
    t(""),
    t(""),

    b("Les Scrutateurs :"),
    t("{scrutateur_1}"),
    t(""),
    t("{scrutateur_2}"),
    t(""),
    t(""),

    b("Le Secr\u00e9taire :"),
    t("{secretaire}"),
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

  const outputDir = path.join(__dirname, "../templates/pv-carence-age");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "pv.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
