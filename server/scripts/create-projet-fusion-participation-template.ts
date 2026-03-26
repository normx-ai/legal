/**
 * Script pour cr\u00e9er le template DOCX du Projet de fusion avec participation \u2014 SA OHADA
 * Mod\u00e8le 44 du Guide Pratique des Soci\u00e9t\u00e9s Commerciales et du GIE - OHADA
 * Fusion-renonciation : l'absorbante d\u00e9tient des actions de l'absorb\u00e9e
 * Usage : npx tsx scripts/create-projet-fusion-participation-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">Projet de fusion avec participation</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">{societe_absorbee_denomination} / {societe_absorbante_denomination}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Projet de fusion avec participation \u2014 Mod\u00E8le 44</w:t></w:r>
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
    c("PROJET DE FUSION PAR ABSORPTION"),
    c("AVEC PARTICIPATION DE L\u2019ABSORBANTE DANS L\u2019ABSORB\u00c9E"),
    c("(Fusion-renonciation)"),
    t(""),

    b("ENTRE LES SOUSSIGN\u00c9S :"),
    t(""),

    // Soci\u00e9t\u00e9 absorb\u00e9e
    b("1\u00b0) Soci\u00e9t\u00e9 A (absorb\u00e9e) :"),
    t("{societe_absorbee_denomination}, {societe_absorbee_forme} au capital de {societe_absorbee_capital} FCFA, dont le si\u00e8ge social est \u00e0 {societe_absorbee_siege}, immatricul\u00e9e au RCCM sous le num\u00e9ro {societe_absorbee_rccm}, repr\u00e9sent\u00e9e par {societe_absorbee_representant}, en qualit\u00e9 de {societe_absorbee_qualite}, habilit\u00e9 aux fins des pr\u00e9sentes par d\u00e9lib\u00e9ration du conseil d\u2019administration en date du {societe_absorbee_date_ca}."),
    t(""),
    t("Ci-apr\u00e8s d\u00e9nomm\u00e9e \u00ab La soci\u00e9t\u00e9 A \u00bb ou \u00ab la soci\u00e9t\u00e9 absorb\u00e9e \u00bb,"),
    t(""),

    // Soci\u00e9t\u00e9 absorbante
    b("2\u00b0) Soci\u00e9t\u00e9 B (absorbante) :"),
    t("{societe_absorbante_denomination}, {societe_absorbante_forme} au capital de {societe_absorbante_capital} FCFA, dont le si\u00e8ge social est \u00e0 {societe_absorbante_siege}, immatricul\u00e9e au RCCM sous le num\u00e9ro {societe_absorbante_rccm}, repr\u00e9sent\u00e9e par {societe_absorbante_representant}, en qualit\u00e9 de {societe_absorbante_qualite}, habilit\u00e9 aux fins des pr\u00e9sentes par d\u00e9lib\u00e9ration du conseil d\u2019administration en date du {societe_absorbante_date_ca}."),
    t(""),
    t("Ci-apr\u00e8s d\u00e9nomm\u00e9e \u00ab La soci\u00e9t\u00e9 B \u00bb ou \u00ab la soci\u00e9t\u00e9 absorbante \u00bb,"),
    t(""),

    // LIEN DE CAPITAL
    b("3\u00b0) LIEN DE CAPITAL :"),
    t("La soci\u00e9t\u00e9 B d\u00e9tient en portefeuille {actions_detenues_par_b} actions de la soci\u00e9t\u00e9 A, repr\u00e9sentant {pourcentage_participation} % du capital de la soci\u00e9t\u00e9 A."),
    t(""),

    b("IL A \u00c9T\u00c9 EXPOS\u00c9 CE QUI SUIT :"),
    t(""),

    // I - Motifs
    b("I - MOTIFS ET BUTS DE LA FUSION"),
    t("{motifs_fusion}"),
    t(""),

    // II - Comptes
    b("II - COMPTES DE R\u00c9F\u00c9RENCE"),
    t("Les comptes ayant servi de base \u00e0 l\u2019\u00e9tablissement du pr\u00e9sent projet de fusion sont les comptes de l\u2019exercice clos le {comptes_reference_a_date} pour la soci\u00e9t\u00e9 A, approuv\u00e9s par l\u2019assembl\u00e9e g\u00e9n\u00e9rale du {comptes_reference_a_approbation}, et les comptes de l\u2019exercice clos le {comptes_reference_b_date} pour la soci\u00e9t\u00e9 B, approuv\u00e9s par l\u2019assembl\u00e9e g\u00e9n\u00e9rale du {comptes_reference_b_approbation}."),
    t(""),

    // III - Actif/Passif
    b("III - ACTIF TRANSMIS ET PASSIF PRIS EN CHARGE"),
    t(""),
    b("A) Actif transmis par la soci\u00e9t\u00e9 A :"),
    t("- Immobilisations incorporelles : {actif_immobilisations_incorporelles} FCFA"),
    t("- Immobilisations corporelles : {actif_immobilisations_corporelles} FCFA"),
    t("- Immobilisations financi\u00e8res : {actif_immobilisations_financieres} FCFA"),
    t("- Stocks : {actif_stocks} FCFA"),
    t("- Cr\u00e9ances : {actif_creances} FCFA"),
    t("- Tr\u00e9sorerie : {actif_tresorerie} FCFA"),
    b("Total de l\u2019actif transmis : {total_actif} FCFA"),
    t(""),
    b("B) Passif pris en charge par la soci\u00e9t\u00e9 B :"),
    t("- Dettes financi\u00e8res : {passif_dettes_financieres} FCFA"),
    t("- Dettes commerciales : {passif_dettes_commerciales} FCFA"),
    t("- Dettes fiscales : {passif_dettes_fiscales} FCFA"),
    t("- Dettes sociales : {passif_dettes_sociales} FCFA"),
    t("- Autres dettes : {passif_autres} FCFA"),
    t("- Banques : {passif_banques} FCFA"),
    b("Total du passif pris en charge : {total_passif} FCFA"),
    t(""),
    b("Actif net apport\u00e9 : {actif_net} FCFA"),
    t(""),

    // IV - Rapport d'\u00e9change et renonciation
    b("IV - RAPPORT D\u2019\u00c9CHANGE ET RENONCIATION"),
    t("M\u00e9thode d\u2019\u00e9valuation retenue : {methode_evaluation}"),
    t("Rapport d\u2019\u00e9change : {rapport_echange}"),
    t("{rapport_echange_detail}"),
    t(""),
    b("Renonciation :"),
    t("La soci\u00e9t\u00e9 B, d\u00e9tenant {actions_detenues_par_b} actions de la soci\u00e9t\u00e9 A repr\u00e9sentant {pourcentage_participation} % du capital, renoncerait \u00e0 ses droits dans ladite augmentation de capital, de telle sorte que les actions nouvelles seront exclusivement attribu\u00e9es aux actionnaires de la soci\u00e9t\u00e9 A autres que la soci\u00e9t\u00e9 B."),
    t(""),

    // V - Augmentation de capital
    b("V - AUGMENTATION DE CAPITAL DE LA SOCI\u00c9T\u00c9 B"),
    t("La soci\u00e9t\u00e9 B augmentera son capital de {augmentation_capital_b} FCFA pour le porter \u00e0 {montant_augmentation_b} FCFA par \u00e9mission de {nombre_actions_nouvelles_b} actions nouvelles de {nouvelles_actions_b_valeur} FCFA chacune."),
    t(""),
    t("Les actions nouvelles seront exclusivement attribu\u00e9es aux actionnaires de la soci\u00e9t\u00e9 A autres que la soci\u00e9t\u00e9 B, en raison du rapport d\u2019\u00e9change ci-dessus d\u00e9termin\u00e9."),
    t(""),
    t("Prime de fusion : {prime_fusion} FCFA"),
    t(""),

    // VI - R\u00e9alisation
    b("VI - R\u00c9ALISATION D\u00c9FINITIVE"),
    t("La fusion sera r\u00e9alis\u00e9e d\u00e9finitivement le {date_realisation} sous r\u00e9serve de l\u2019approbation par les assembl\u00e9es g\u00e9n\u00e9rales extraordinaires des deux soci\u00e9t\u00e9s."),
    t(""),
    t("La fusion prendra effet le {date_effet_fusion}."),
    t(""),
    t("En cas de non-r\u00e9alisation avant le {date_limite_realisation}, le pr\u00e9sent projet deviendra caduc."),
    t(""),

    // VII - D\u00e9clarations
    b("VII - D\u00c9CLARATIONS"),
    t(""),
    t("Chiffre d\u2019affaires des trois derniers exercices de la soci\u00e9t\u00e9 A :"),
    t("- N-2 : {ca_n_moins_2} FCFA (r\u00e9sultat : {resultat_n_moins_2} FCFA)"),
    t("- N-1 : {ca_n_moins_1} FCFA (r\u00e9sultat : {resultat_n_moins_1} FCFA)"),
    t("- N : {ca_n} FCFA (r\u00e9sultat : {resultat_n} FCFA)"),
    t(""),

    // Signature
    t(""),
    t("Fait \u00e0 {lieu_signature}, le {date_signature}, en {nombre_exemplaires} exemplaires."),
    t(""),
    t(""),
    t("Pour la soci\u00e9t\u00e9 A"),
    t("{societe_absorbee_representant}"),
    t("{societe_absorbee_qualite}"),
    t(""),
    t(""),
    t("Pour la soci\u00e9t\u00e9 B"),
    t("{societe_absorbante_representant}"),
    t("{societe_absorbante_qualite}"),
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

  const outputDir = path.join(__dirname, "../templates/projet-fusion-participation");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "projet-fusion-participation.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
