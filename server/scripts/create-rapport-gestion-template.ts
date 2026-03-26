/**
 * Script pour créer le template DOCX du Rapport de Gestion — SARL OHADA
 * Basé sur le modèle officiel du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-rapport-gestion-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Rapport de gestion \u2014 {denomination}</w:t></w:r>
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
    c("RAPPORT DE GESTION"),
    c("Exercice clos le {exercice_clos_le}"),
    it("(Articles 138 et suivants de l\u2019Acte Uniforme OHADA relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE)"),
    t(""),

    // ===== INTRODUCTION =====
    t("Chers associ\u00e9s,"),
    t(""),
    t("Conform\u00e9ment aux dispositions l\u00e9gales et statutaires, nous vous avons r\u00e9unis en Assembl\u00e9e G\u00e9n\u00e9rale Ordinaire, le {date_ago}, afin de vous rendre compte de l\u2019activit\u00e9 de la soci\u00e9t\u00e9 {denomination} au cours de l\u2019exercice clos le {exercice_clos_le} et de soumettre \u00e0 votre approbation les comptes dudit exercice."),
    t(""),

    // ===== I. ACTIVITE DE LA SOCIETE =====
    b("I. ACTIVIT\u00c9 DE LA SOCI\u00c9T\u00c9"),
    t(""),

    b("1.1 Description des activit\u00e9s"),
    t("{description_activites}"),
    t(""),

    t("{#has_part_marche}"),
    b("1.2 Part de march\u00e9"),
    t("{part_marche}"),
    t(""),
    t("{/has_part_marche}"),

    t("{#has_position_concurrence}"),
    b("1.3 Position concurrentielle"),
    t("{position_concurrence}"),
    t(""),
    t("{/has_position_concurrence}"),

    t("{#has_conjoncture}"),
    b("1.4 Conjoncture \u00e9conomique"),
    t("{conjoncture_economique}"),
    t(""),
    t("{/has_conjoncture}"),

    // ===== II. MOYENS MIS EN OEUVRE =====
    b("II. MOYENS MIS EN \u0152UVRE"),
    t(""),

    t("{#has_moyens_techniques}"),
    b("2.1 Moyens techniques"),
    t("{moyens_techniques}"),
    t(""),
    t("{/has_moyens_techniques}"),

    t("{#has_moyens_humains}"),
    b("2.2 Moyens humains"),
    t("{moyens_humains}"),
    t(""),
    t("{/has_moyens_humains}"),

    // ===== III. RESULTATS =====
    t("{#has_progres}"),
    b("III. PROGR\u00c8S R\u00c9ALIS\u00c9S"),
    t("{progres_realises}"),
    t(""),
    t("{/has_progres}"),

    t("{#has_difficultes}"),
    b("IV. DIFFICULT\u00c9S RENCONTR\u00c9ES"),
    t("{difficultes_rencontrees}"),
    t(""),
    t("{/has_difficultes}"),

    // ===== V. SITUATION FINANCIERE =====
    b("V. SITUATION FINANCI\u00c8RE"),
    t(""),
    t("Les principaux indicateurs financiers de l\u2019exercice sont les suivants :"),
    t(""),
    t("- Chiffre d\u2019affaires : {chiffre_affaires} {devise}"),
    t("- R\u00e9sultat d\u2019exploitation : {resultat_exploitation} {devise}"),
    t("{#is_benefice}"),
    t("- R\u00e9sultat net (b\u00e9n\u00e9fice) : {resultat_net} {devise} ({resultat_net_lettres} francs CFA)"),
    t("{/is_benefice}"),
    t("{#is_perte}"),
    t("- R\u00e9sultat net (perte) : {resultat_net} {devise} ({resultat_net_lettres} francs CFA)"),
    t("{/is_perte}"),
    t(""),

    t("{#has_analyse_financiere}"),
    b("5.1 Analyse financi\u00e8re"),
    t("{analyse_financiere}"),
    t(""),
    t("{/has_analyse_financiere}"),

    t("{#has_evolution_tresorerie}"),
    b("5.2 \u00c9volution de la tr\u00e9sorerie"),
    t("{evolution_tresorerie}"),
    t(""),
    t("{/has_evolution_tresorerie}"),

    // ===== SECTIONS OPTIONNELLES =====
    t("{#has_travaux_ca}"),
    b("VI. TRAVAUX DU CONSEIL D\u2019ADMINISTRATION"),
    t("{travaux_ca}"),
    t(""),
    t("{/has_travaux_ca}"),

    t("{#has_activites_rd}"),
    b("ACTIVIT\u00c9S DE RECHERCHE ET D\u00c9VELOPPEMENT"),
    t("{activites_rd}"),
    t(""),
    t("{/has_activites_rd}"),

    // ===== PERSPECTIVES =====
    b("PERSPECTIVES D\u2019AVENIR"),
    t("{perspectives_avenir}"),
    t(""),

    t("{#has_plan_financement}"),
    b("Plan de financement"),
    t("{plan_financement}"),
    t(""),
    t("{/has_plan_financement}"),

    // ===== EVENEMENTS POSTERIEURS =====
    t("{#has_evenements_posterieurs}"),
    b("\u00c9V\u00c9NEMENTS POST\u00c9RIEURS \u00c0 LA CL\u00d4TURE"),
    t("{evenements_posterieurs}"),
    t(""),
    t("{/has_evenements_posterieurs}"),

    // ===== CHANGEMENT METHODE =====
    t("{#has_changement_methode}"),
    b("CHANGEMENTS DE M\u00c9THODES COMPTABLES"),
    t("{changement_methode}"),
    t(""),
    t("{/has_changement_methode}"),

    // ===== ACTIONNAIRES SALARIES =====
    t("{#has_actionnaires_salaries}"),
    b("\u00c9TAT DE LA PARTICIPATION DES SALARI\u00c9S AU CAPITAL"),
    t("Nombre d\u2019actionnaires salari\u00e9s : {nb_actionnaires_salaries}"),
    t(""),
    t("{/has_actionnaires_salaries}"),

    // ===== RESOLUTIONS PROPOSEES =====
    b("R\u00c9SOLUTIONS PROPOS\u00c9ES \u00c0 L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE"),
    t(""),
    t("Au vu de ce qui pr\u00e9c\u00e8de, nous vous demandons de bien vouloir adopter les r\u00e9solutions suivantes :"),
    t(""),
    t("{resolutions_proposees}"),
    t(""),

    // ===== SIGNATURE =====
    t("Fait \u00e0 {lieu_signature}, le {date_signature}."),
    t(""),
    t(""),
    b("{signataire}"),
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

  const outputDir = path.join(__dirname, "../templates/rapport-gestion");
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
