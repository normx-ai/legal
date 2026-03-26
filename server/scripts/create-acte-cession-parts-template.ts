/**
 * Script pour créer le template DOCX de l'Acte de Cession de Parts Sociales — SARL OHADA
 * Usage : npx tsx scripts/create-acte-cession-parts-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Acte de cession de parts \u2014 {denomination}</w:t></w:r>
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
    c("ACTE DE CESSION DE PARTS SOCIALES"),
    c("(SARL)"),
    t(""),

    // ===== ENTRE LES SOUSSIGNÉS =====
    b("ENTRE LES SOUSSIGN\u00c9S :"),
    t(""),

    // ===== CÉDANT =====
    b("LE C\u00c9DANT :"),
    t("{cedant_civilite} {cedant_prenom} {cedant_nom}, n\u00e9(e) le {cedant_date_naissance} \u00e0 {cedant_lieu_naissance}, de nationalit\u00e9 {cedant_nationalite}, demeurant \u00e0 {cedant_adresse},"),
    t("Associ\u00e9(e) de la soci\u00e9t\u00e9 {denomination}, titulaire de {cedant_nb_parts} parts sociales,"),
    t(""),
    t("Ci-apr\u00e8s d\u00e9nomm\u00e9(e) \u00ab le C\u00e9dant \u00bb,"),
    t(""),
    t("D\u2019UNE PART,"),
    t(""),

    // ===== CESSIONNAIRE =====
    b("LE CESSIONNAIRE :"),
    t("{cessionnaire_civilite} {cessionnaire_prenom} {cessionnaire_nom}, n\u00e9(e) le {cessionnaire_date_naissance} \u00e0 {cessionnaire_lieu_naissance}, de nationalit\u00e9 {cessionnaire_nationalite}, demeurant \u00e0 {cessionnaire_adresse},"),
    t(""),
    t("Ci-apr\u00e8s d\u00e9nomm\u00e9(e) \u00ab le Cessionnaire \u00bb,"),
    t(""),
    t("D\u2019AUTRE PART,"),
    t(""),

    // ===== RAPPEL SOCIÉTÉ =====
    b("IL A \u00c9T\u00c9 PR\u00c9ALABLEMENT RAPPEL\u00c9 :"),
    t(""),
    t("La soci\u00e9t\u00e9 {denomination}, soci\u00e9t\u00e9 \u00e0 responsabilit\u00e9 limit\u00e9e au capital de {capital} FCFA, divis\u00e9 en {nombre_parts_total} parts sociales de {valeur_nominale} FCFA chacune, a \u00e9t\u00e9 constitu\u00e9e suivant acte {acte_constitution} en date du {date_constitution}."),
    t(""),
    t("Elle est immatricul\u00e9e au Registre du Commerce et du Cr\u00e9dit Mobilier sous le num\u00e9ro {numero_rccm}, et son si\u00e8ge social est fix\u00e9 \u00e0 {siege_social}."),
    t(""),

    // ===== CESSION =====
    b("IL A \u00c9T\u00c9 CONVENU CE QUI SUIT :"),
    t(""),

    b("Article 1 \u2013 Cession"),
    t("Par les pr\u00e9sentes, le C\u00e9dant c\u00e8de au Cessionnaire, qui accepte, {nb_parts_cedees} parts sociales de la soci\u00e9t\u00e9 {denomination}, num\u00e9rot\u00e9es de {numero_debut_parts} \u00e0 {numero_fin_parts}, d\u2019une valeur nominale de {valeur_nominale} FCFA chacune."),
    t(""),

    b("Article 2 \u2013 Prix de cession"),
    t("La pr\u00e9sente cession est consentie et accept\u00e9e moyennant le prix de {prix_cession} FCFA ({prix_cession_lettres}), que le C\u00e9dant reconna\u00eet avoir re\u00e7u du Cessionnaire avant la signature des pr\u00e9sentes, ce dont il lui donne quittance."),
    t(""),

    b("Article 3 \u2013 Agr\u00e9ment"),
    t("Le Cessionnaire d\u00e9clare avoir \u00e9t\u00e9 d\u00fbment agr\u00e9\u00e9 en qualit\u00e9 de nouvel associ\u00e9 par d\u00e9cision de l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire des associ\u00e9s en date du {date_agrement}, conform\u00e9ment aux dispositions statutaires et aux articles 318 et suivants de l\u2019Acte uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du groupement d\u2019int\u00e9r\u00eat \u00e9conomique (AUSCGIE)."),
    t(""),

    b("Article 4 \u2013 Modification du capital"),
    t("\u00c0 la suite de la pr\u00e9sente cession, la r\u00e9partition du capital social de la soci\u00e9t\u00e9 {denomination} est modifi\u00e9e comme suit :"),
    t("{nouvelle_repartition_capital}"),
    t(""),

    b("Article 5 \u2013 Enregistrement"),
    t("Les parties s\u2019engagent \u00e0 faire enregistrer le pr\u00e9sent acte aupr\u00e8s des services fiscaux comp\u00e9tents dans les d\u00e9lais l\u00e9gaux et \u00e0 acquitter les droits d\u2019enregistrement y aff\u00e9rents."),
    t(""),

    b("Article 6 \u2013 Publicit\u00e9"),
    t("Conform\u00e9ment \u00e0 l\u2019article 317 de l\u2019AUSCGIE, la cession ne sera opposable aux tiers qu\u2019apr\u00e8s d\u00e9p\u00f4t de deux originaux de l\u2019acte de cession au si\u00e8ge social et inscription modificative au Registre du Commerce et du Cr\u00e9dit Mobilier."),
    t(""),

    b("Article 7 \u2013 Frais"),
    t("Tous les frais, droits et honoraires r\u00e9sultant des pr\u00e9sentes seront \u00e0 la charge du {partie_frais}."),
    t(""),

    // ===== SIGNATURES =====
    t("Fait en {nombre_exemplaires} exemplaires originaux \u00e0 {lieu_signature}, le {date_signature}."),
    t(""),
    t(""),

    b("Le C\u00e9dant :"),
    t("{cedant_prenom} {cedant_nom}"),
    t(""),
    it("(Signature pr\u00e9c\u00e9d\u00e9e de la mention \u00ab BON POUR CESSION \u00bb)"),
    t(""),
    t(""),

    b("Le Cessionnaire :"),
    t("{cessionnaire_prenom} {cessionnaire_nom}"),
    t(""),
    it("(Signature pr\u00e9c\u00e9d\u00e9e de la mention \u00ab BON POUR ACCEPTATION \u00bb)"),
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

  const outputDir = path.join(__dirname, "../templates/acte-cession-parts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "acte.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
