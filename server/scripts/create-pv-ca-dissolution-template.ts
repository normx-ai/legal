/**
 * Script pour creer le template DOCX du PV reunion CA convoquant l'AGE et arretant le rapport pour la dissolution-liquidation
 * Usage : npx tsx scripts/create-pv-ca-dissolution-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV CA dissolution \u2014 {denomination}</w:t></w:r>
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
    c("PROC\u00c8S-VERBAL DE LA R\u00c9UNION DU CONSEIL D\u2019ADMINISTRATION"),
    c("CONVOQUANT L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE EXTRAORDINAIRE"),
    c("ET ARR\u00caTANT LE RAPPORT POUR LA DISSOLUTION-LIQUIDATION"),
    c("DU {date_ca}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_ca_lettres}, le {date_ca},"),
    t(""),
    t("\u00c0 {heure_ca_lettres} heures, les membres du conseil d\u2019administration de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm}, se sont r\u00e9unis au {lieu_ca}, sur convocation du pr\u00e9sident du conseil d\u2019administration en date du {date_convocation_ca}."),
    t(""),

    // ===== ADMINISTRATEURS PRESENTS =====
    b("Administrateurs pr\u00e9sents"),
    t(""),
    t("{administrateurs_presents}"),
    t(""),

    // ===== ADMINISTRATEURS ABSENTS =====
    t("{#has_administrateurs_absents}"),
    b("Administrateurs absents ou excus\u00e9s"),
    t(""),
    t("{administrateurs_absents}"),
    t(""),
    t("{/has_administrateurs_absents}"),

    // ===== ADMINISTRATEURS PAR VISIOCONFERENCE =====
    t("{#has_administrateurs_visio}"),
    b("Administrateurs participant par visioconf\u00e9rence ou t\u00e9l\u00e9communication"),
    t(""),
    t("{administrateurs_visio}"),
    t(""),
    t("{/has_administrateurs_visio}"),

    // ===== QUORUM =====
    t("Le quorum \u00e9tant atteint, le conseil peut valablement d\u00e9lib\u00e9rer."),
    t(""),
    t("La s\u00e9ance est pr\u00e9sid\u00e9e par {pca_civilite} {pca_nom}, pr\u00e9sident du conseil d\u2019administration."),
    t(""),

    // ===== ORDRE DU JOUR =====
    b("Ordre du jour"),
    t(""),
    t("1. Convocation de l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire pour statuer sur la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 et sa mise en liquidation ;"),
    t("2. Arr\u00eat du rapport du conseil d\u2019administration \u00e0 pr\u00e9senter aux actionnaires ;"),
    t("3. Communication aux actionnaires."),
    t(""),

    // ===== PREMIERE RESOLUTION : CONVOCATION AGE =====
    b("Premi\u00e8re r\u00e9solution : Convocation de l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire"),
    t(""),
    t("Le pr\u00e9sident expose au conseil d\u2019administration les motifs pour lesquels il y a lieu de soumettre aux actionnaires la question de la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 et de sa mise en liquidation."),
    t(""),
    t("{motifs_dissolution}"),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9, le conseil d\u2019administration d\u00e9cide de convoquer les actionnaires en assembl\u00e9e g\u00e9n\u00e9rale extraordinaire le {date_age} \u00e0 {heure_age} heures, au {lieu_age}, avec l\u2019ordre du jour suivant :"),
    t(""),
    t("- dissolution anticip\u00e9e de la soci\u00e9t\u00e9 ;"),
    t("- nomination du liquidateur ;"),
    t("- pouvoirs pour l\u2019accomplissement des formalit\u00e9s."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== DEUXIEME RESOLUTION : ARRET DU RAPPORT =====
    b("Deuxi\u00e8me r\u00e9solution : Arr\u00eat du rapport du conseil d\u2019administration"),
    t(""),
    t("Le conseil d\u2019administration, apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9, arr\u00eate le rapport qui sera pr\u00e9sent\u00e9 aux actionnaires r\u00e9unis en assembl\u00e9e g\u00e9n\u00e9rale extraordinaire, rapport dont lecture a \u00e9t\u00e9 donn\u00e9e au conseil."),
    t(""),
    t("Ce rapport expose les motifs de la dissolution propos\u00e9e, propose la nomination d\u2019un liquidateur et la modification de l\u2019article des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== TROISIEME RESOLUTION : COMMUNICATION AUX ACTIONNAIRES =====
    b("Troisi\u00e8me r\u00e9solution : Communication aux actionnaires"),
    t(""),
    t("Le conseil d\u2019administration d\u00e9cide que les documents suivants seront communiqu\u00e9s aux actionnaires dans les d\u00e9lais l\u00e9gaux :"),
    t(""),
    t("- la convocation \u00e0 l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire ;"),
    t("- le rapport du conseil d\u2019administration ;"),
    t("- le projet des r\u00e9solutions ;"),
    t("- les \u00e9tats financiers de synth\u00e8se du dernier exercice clos."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== CLOTURE =====
    t("Plus rien n\u2019\u00e9tant \u00e0 l\u2019ordre du jour, la s\u00e9ance est lev\u00e9e \u00e0 {heure_fin} heures."),
    t(""),
    t("De tout ce que dessus, il a \u00e9t\u00e9 dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal, sign\u00e9 par le pr\u00e9sident et le secr\u00e9taire de s\u00e9ance."),
    t(""),
    t(""),
    b("Le Pr\u00e9sident du Conseil d\u2019Administration"),
    t("{pca_civilite} {pca_nom}"),
    t(""),
    t(""),
    b("Le Secr\u00e9taire de s\u00e9ance"),
    t("{secretaire_civilite} {secretaire_nom}"),
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

  const outputDir = path.join(__dirname, "../templates/pv-ca-dissolution");
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
