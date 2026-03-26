/**
 * Script pour créer le template DOCX de la Mise en Demeure de l'Actionnaire/Associé Défaillant — OHADA
 * Usage : npx tsx scripts/create-mise-en-demeure-defaillant-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Mise en demeure \u2014 {denomination}</w:t></w:r>
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
    // ===== EN-TÊTE =====
    t("{lieu_expedition}, le {date_lettre}"),
    t(""),

    // ===== TITRE =====
    c("MISE EN DEMEURE"),
    c("DE L\u2019ACTIONNAIRE OU DE L\u2019ASSOCI\u00c9 D\u00c9FAILLANT"),
    t(""),

    // ===== EXPÉDITEUR =====
    b("{denomination}"),
    t("{siege_social}"),
    t("RCCM : {numero_rccm}"),
    t(""),

    // ===== DESTINATAIRE =====
    t("Lettre recommand\u00e9e avec accus\u00e9 de r\u00e9ception"),
    t(""),
    t("\u00c0 l\u2019attention de : {defaillant_civilite} {defaillant_prenom} {defaillant_nom}"),
    t("{defaillant_adresse}"),
    t(""),

    // ===== OBJET =====
    b("Objet : Mise en demeure de lib\u00e9rer le capital souscrit"),
    t(""),

    // ===== CORPS =====
    t("{defaillant_civilite} {defaillant_prenom} {defaillant_nom},"),
    t(""),
    t("Par lettre recommand\u00e9e en date du {date_appel_initial}, nous vous avons demand\u00e9 de proc\u00e9der au versement de la somme de {montant_appele} FCFA, correspondant \u00e0 l\u2019appel de la {fraction_appelee} du capital restant \u00e0 lib\u00e9rer sur vos {nb_actions} actions de la soci\u00e9t\u00e9 {denomination}."),
    t(""),
    t("Or, \u00e0 ce jour, nous constatons que ce versement n\u2019a pas \u00e9t\u00e9 effectu\u00e9 dans le d\u00e9lai imparti, fix\u00e9 au {date_limite_initiale}."),
    t(""),
    b("En cons\u00e9quence, nous vous mettons en demeure, par la pr\u00e9sente, de proc\u00e9der au versement de la somme de {montant_du} FCFA dans un d\u00e9lai d\u2019un (1) mois \u00e0 compter de la r\u00e9ception de la pr\u00e9sente lettre."),
    t(""),
    t("Ce versement devra \u00eatre effectu\u00e9 par {mode_versement} au compte de la soci\u00e9t\u00e9 ouvert aupr\u00e8s de {banque_depositaire}."),
    t(""),
    t("\u00c0 d\u00e9faut de r\u00e9gularisation dans le d\u00e9lai susvis\u00e9, la soci\u00e9t\u00e9 sera fond\u00e9e, conform\u00e9ment aux articles 775 et 776 de l\u2019Acte uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du groupement d\u2019int\u00e9r\u00eat \u00e9conomique (AUSCGIE), \u00e0 :"),
    t(""),
    t("- poursuivre l\u2019ex\u00e9cution forc\u00e9e de votre obligation de lib\u00e9ration ;"),
    t("- proc\u00e9der \u00e0 la vente forc\u00e9e de vos actions non lib\u00e9r\u00e9es ;"),
    t("- r\u00e9clamer des dommages et int\u00e9r\u00eats pour le pr\u00e9judice subi."),
    t(""),
    t("Par ailleurs, nous vous informons que, conform\u00e9ment \u00e0 la loi, les int\u00e9r\u00eats de retard au taux l\u00e9gal courent de plein droit \u00e0 compter de la date d\u2019exigibilit\u00e9 du versement."),
    t(""),
    t("Nous vous invitons \u00e0 r\u00e9gulariser votre situation dans les meilleurs d\u00e9lais."),
    t(""),
    t("Veuillez agr\u00e9er, {defaillant_civilite} {defaillant_prenom} {defaillant_nom}, l\u2019expression de nos salutations distingu\u00e9es."),
    t(""),
    t(""),

    // ===== SIGNATURE =====
    b("Pour la soci\u00e9t\u00e9 {denomination}"),
    t("{signataire_qualite}"),
    t(""),
    t("{signataire_prenom} {signataire_nom}"),
    t(""),
    it("(Signature)"),
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

  const outputDir = path.join(__dirname, "../templates/mise-en-demeure-defaillant");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "lettre.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
