/**
 * Script pour cr\u00e9er le template DOCX du D\u00e9roulement AG SARL \u2014 M\u00e9mo du Pr\u00e9sident
 * Mod\u00e8le 18bis du Guide Pratique des Soci\u00e9t\u00e9s Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-deroulement-ag-sarl-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">SARL au capital de {capital} FCFA</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">D\u00e9roulement AG SARL \u2014 M\u00e9mo du Pr\u00e9sident \u2014 Mod\u00E8le 18bis</w:t></w:r>
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
    c("D\u00c9ROULEMENT DE L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE"),
    c("M\u00c9MO DU PR\u00c9SIDENT"),
    t(""),

    it("Le d\u00e9roulement d\u2019une assembl\u00e9e g\u00e9n\u00e9rale ob\u00e9it \u00e0 un rituel auquel doit se conformer, dans la pratique, le pr\u00e9sident de s\u00e9ance qui a la charge de conduire les d\u00e9bats."),
    it("Ce m\u00e9mo formalise les propos que tient le pr\u00e9sident, en g\u00e9n\u00e9ral, dans les diff\u00e9rentes phases de la r\u00e9union."),
    t(""),

    b("Mot introductif (\u00e9ventuellement) et ouverture de la s\u00e9ance"),
    t("Mesdames, Messieurs les associ\u00e9s"),
    t("Je d\u00e9clare la s\u00e9ance ouverte."),
    t("Il est {heure_reunion} heures"),
    t("Je pr\u00e9side l\u2019assembl\u00e9e g\u00e9n\u00e9rale en ma qualit\u00e9 de {president_qualite} conform\u00e9ment \u00e0 l\u2019article 341 de l\u2019AUSCGIE."),
    t(""),

    b("Mise en place du bureau (\u00a71388)"),
    t("L\u2019Acte Uniforme ne pr\u00e9voit ni scrutateur, ni secr\u00e9taire de s\u00e9ance."),
    t(""),

    b("Rappel de l\u2019objet de la r\u00e9union et de l\u2019ordre du jour (\u00a71381)"),
    t("D\u2019apr\u00e8s la feuille de pr\u00e9sence, {nombre_parts_presentes} parts sociales sont pr\u00e9sentes ou repr\u00e9sent\u00e9es, soit {pourcentage_capital}% du capital r\u00e9unissant ainsi le quorum ({quorum_type})."),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale peut valablement d\u00e9lib\u00e9rer."),
    t(""),

    b("D\u00e9p\u00f4t documents l\u00e9gaux et respect des dispositions l\u00e9gales (\u00a71384)"),
    t("Je d\u00e9pose sur le Bureau les documents l\u00e9gaux suivants vis\u00e9s par la loi :"),
    t("{documents_deposes}"),
    t(""),
    t("Je rappelle que les documents suivants ont \u00e9t\u00e9 tenus \u00e0 la disposition des associ\u00e9s pendant les 15 jours pr\u00e9vus par la loi :"),
    t("{documents_15_jours}"),
    t(""),

    b("Pr\u00e9sentation des rapports (\u00a71973)"),
    t("\u2022 lecture rapport de la G\u00e9rance"),
    t("Je vous donne lecture du rapport de la g\u00e9rance."),
    t(""),
    t("\u2022 prise de connaissance des rapports du commissaire aux comptes (s\u2019il en existe \u00a71464)"),
    t("Je vous remercie de votre attention et vous propose de prendre connaissance du (ou des) rapport(s) du commissaire aux comptes."),
    t(""),

    b("Fin de la lecture du rapport du commissaire aux comptes s\u2019il en existe (\u00a71464) et ouverture des d\u00e9bats"),
    t("La discussion est ouverte."),
    t(""),

    b("Vote des r\u00e9solutions (\u00a71400)"),
    t("Personne ne demandant plus la parole, je mets aux voix les r\u00e9solutions suivantes inscrites \u00e0 l\u2019ordre du jour :"),
    t("{ordre_du_jour}"),
    t(""),

    b("Questions diverses (\u00a71400)"),
    t("Je vous soumets les questions diverses suivantes :"),
    t("{questions_diverses}"),
    t(""),

    b("Cl\u00f4ture de la s\u00e9ance (\u00a71400)"),
    t("L\u2019ordre du jour \u00e9tant \u00e9puis\u00e9 \u00e0 {heure_levee} heures, je l\u00e8ve la s\u00e9ance."),
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

  const outputDir = path.join(__dirname, "../templates/deroulement-ag-sarl");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "deroulement-ag-sarl.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
