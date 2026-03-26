/**
 * Script pour cr\u00e9er le template DOCX du Projet de fusion par constitution de soci\u00e9t\u00e9 nouvelle \u2014 SA OHADA
 * Mod\u00e8le 43 du Guide Pratique des Soci\u00e9t\u00e9s Commerciales et du GIE - OHADA
 * Les soci\u00e9t\u00e9s A et B sont absorb\u00e9es par une nouvelle soci\u00e9t\u00e9 C
 * Usage : npx tsx scripts/create-projet-fusion-societe-nouvelle-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">Projet de fusion par constitution de soci\u00E9t\u00E9 nouvelle</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">{denomination_a} / {denomination_b} \u2192 {denomination_c}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Projet de fusion soci\u00E9t\u00E9 nouvelle \u2014 Mod\u00E8le 43</w:t></w:r>
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
    c("PROJET DE FUSION"),
    c("PAR CONSTITUTION DE SOCI\u00c9T\u00c9 NOUVELLE"),
    t(""),

    b("ENTRE LES SOUSSIGN\u00c9S :"),
    t(""),

    b("1\u00b0) Soci\u00e9t\u00e9 A :"),
    t("{denomination_a}, {forme_a} au capital de {capital_a} FCFA, dont le si\u00e8ge social est \u00e0 {siege_a}, immatricul\u00e9e au RCCM sous le num\u00e9ro {rccm_a}, repr\u00e9sent\u00e9e par {representant_a}, en qualit\u00e9 de {qualite_a}."),
    t(""),

    b("2\u00b0) Soci\u00e9t\u00e9 B :"),
    t("{denomination_b}, {forme_b} au capital de {capital_b} FCFA, dont le si\u00e8ge social est \u00e0 {siege_b}, immatricul\u00e9e au RCCM sous le num\u00e9ro {rccm_b}, repr\u00e9sent\u00e9e par {representant_b}, en qualit\u00e9 de {qualite_b}."),
    t(""),

    b("IL A \u00c9T\u00c9 EXPOS\u00c9 CE QUI SUIT :"),
    t(""),

    // I - Motifs
    b("I - MOTIFS ET BUTS DE LA FUSION"),
    t("{motifs_fusion}"),
    t(""),
    t("En cons\u00e9quence, les soci\u00e9t\u00e9s A et B ont d\u00e9cid\u00e9 de proc\u00e9der \u00e0 la fusion par constitution d\u2019une soci\u00e9t\u00e9 nouvelle d\u00e9nomm\u00e9e {denomination_c}, qui recueillera la totalit\u00e9 de l\u2019actif et du passif des deux soci\u00e9t\u00e9s."),
    t(""),

    // II - Soci\u00e9t\u00e9 nouvelle
    b("II - CONSTITUTION DE LA SOCI\u00c9T\u00c9 NOUVELLE C"),
    t("La soci\u00e9t\u00e9 nouvelle aura les caract\u00e9ristiques suivantes :"),
    t("- D\u00e9nomination : {denomination_c}"),
    t("- Forme juridique : {forme_c}"),
    t("- Capital social : {capital_c} FCFA"),
    t("- Si\u00e8ge social : {siege_c}"),
    t("- Objet social : {objet_c}"),
    t("- Nombre d\u2019actions : {nombre_actions_c} de {valeur_nominale_c} FCFA chacune"),
    t(""),

    // III - Actif/Passif A
    b("III - ACTIF TRANSMIS ET PASSIF PRIS EN CHARGE"),
    t(""),
    b("A) Apport de la soci\u00e9t\u00e9 A :"),
    t("Actif :"),
    t("- Immobilisations : {actif_a_immobilisations} FCFA"),
    t("- Stocks : {actif_a_stocks} FCFA"),
    t("- Cr\u00e9ances : {actif_a_creances} FCFA"),
    t("- Tr\u00e9sorerie : {actif_a_tresorerie} FCFA"),
    b("Total actif A : {total_actif_a} FCFA"),
    t("Passif pris en charge : {passif_a_dettes} FCFA"),
    b("Actif net A : {actif_net_a} FCFA"),
    t(""),

    // Actif/Passif B
    b("B) Apport de la soci\u00e9t\u00e9 B :"),
    t("Actif :"),
    t("- Immobilisations : {actif_b_immobilisations} FCFA"),
    t("- Stocks : {actif_b_stocks} FCFA"),
    t("- Cr\u00e9ances : {actif_b_creances} FCFA"),
    t("- Tr\u00e9sorerie : {actif_b_tresorerie} FCFA"),
    b("Total actif B : {total_actif_b} FCFA"),
    t("Passif pris en charge : {passif_b_dettes} FCFA"),
    b("Actif net B : {actif_net_b} FCFA"),
    t(""),

    // IV - Fraction attribu\u00e9e
    b("IV - FRACTION DE LA SOCI\u00c9T\u00c9 C ATTRIBU\u00c9E AUX SOCI\u00c9T\u00c9S A ET B"),
    t("- Soci\u00e9t\u00e9 A : {fraction_a_pourcent} % du capital de la soci\u00e9t\u00e9 C"),
    t("- Soci\u00e9t\u00e9 B : {fraction_b_pourcent} % du capital de la soci\u00e9t\u00e9 C"),
    t(""),

    // V - Rapport d'\u00e9change
    b("V - RAPPORT D\u2019\u00c9CHANGE ET R\u00c9MUN\u00c9RATION"),
    t("M\u00e9thode d\u2019\u00e9valuation retenue : {methode_evaluation}"),
    t("Rapport d\u2019\u00e9change : {rapport_echange}"),
    t(""),

    // VI - Constitution et dissolution
    b("VI - CONSTITUTION DE LA SOCI\u00c9T\u00c9 NOUVELLE ET DISSOLUTION"),
    t(""),
    b("A) Date d\u2019effet :"),
    t("La fusion prendra effet le {date_effet_fusion}."),
    t(""),
    b("B) Constitution de la soci\u00e9t\u00e9 nouvelle et r\u00e9mun\u00e9ration de A et B :"),
    t("La soci\u00e9t\u00e9 {denomination_c} sera constitu\u00e9e avec un capital de {capital_c} FCFA, divis\u00e9 en {nombre_actions_c} actions de {valeur_nominale_c} FCFA chacune, attribu\u00e9es aux actionnaires des soci\u00e9t\u00e9s A et B en raison du rapport d\u2019\u00e9change ci-dessus d\u00e9termin\u00e9."),
    t(""),
    b("C) Dissolution des soci\u00e9t\u00e9s A et B :"),
    t("La soci\u00e9t\u00e9 {denomination_a} et la soci\u00e9t\u00e9 {denomination_b} seront dissoutes de plein droit \u00e0 la date d\u2019effet de la fusion, sans qu\u2019il y ait lieu \u00e0 liquidation."),
    t(""),

    // VII - D\u00e9clarations
    b("VII - D\u00c9CLARATIONS"),
    t(""),
    b("A) Soci\u00e9t\u00e9 A :"),
    t("Chiffre d\u2019affaires des trois derniers exercices :"),
    t("- N-2 : {ca_a_n_moins_2} FCFA"),
    t("- N-1 : {ca_a_n_moins_1} FCFA"),
    t("- N : {ca_a_n} FCFA"),
    t(""),
    b("B) Soci\u00e9t\u00e9 B :"),
    t("Chiffre d\u2019affaires des trois derniers exercices :"),
    t("- N-2 : {ca_b_n_moins_2} FCFA"),
    t("- N-1 : {ca_b_n_moins_1} FCFA"),
    t("- N : {ca_b_n} FCFA"),
    t(""),

    // VIII - R\u00e9alisation
    b("VIII - R\u00c9ALISATION D\u00c9FINITIVE"),
    t("La fusion sera r\u00e9alis\u00e9e d\u00e9finitivement le {date_realisation} sous r\u00e9serve de l\u2019approbation par les assembl\u00e9es g\u00e9n\u00e9rales extraordinaires des deux soci\u00e9t\u00e9s."),
    t("En cas de non-r\u00e9alisation avant le {date_limite_realisation}, le pr\u00e9sent projet deviendra caduc."),
    t(""),

    // Signature
    t(""),
    t("Fait \u00e0 {lieu_signature}, le {date_signature}, en {nombre_exemplaires} exemplaires."),
    t(""),
    t(""),
    t("Pour la soci\u00e9t\u00e9 A"),
    t("{representant_a}"),
    t("{qualite_a}"),
    t(""),
    t(""),
    t("Pour la soci\u00e9t\u00e9 B"),
    t("{representant_b}"),
    t("{qualite_b}"),
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

  const outputDir = path.join(__dirname, "../templates/projet-fusion-societe-nouvelle");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "projet-fusion-societe-nouvelle.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
