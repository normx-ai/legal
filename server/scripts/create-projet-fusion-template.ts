/**
 * Script pour creer le template DOCX du projet de fusion entre deux SA par voie d'absorption
 * Usage : npx tsx scripts/create-projet-fusion-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">Projet de fusion {denomination_a} / {denomination_b}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Fusion par voie d&apos;absorption</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Projet de fusion par absorption</w:t></w:r>
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
    c("PROJET DE FUSION"),
    c("ENTRE DEUX SOCI\u00c9T\u00c9S ANONYMES"),
    c("PAR VOIE D\u2019ABSORPTION"),
    t(""),

    // ===== ENTRE =====
    b("ENTRE LES SOUSSIGN\u00c9S :"),
    t(""),

    // ===== SOCIETE A (ABSORBEE) =====
    b("Soci\u00e9t\u00e9 A (Soci\u00e9t\u00e9 absorb\u00e9e) :"),
    t(""),
    t("{denomination_a}, {forme_juridique_a} au capital de {capital_a} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social_a}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm_a},"),
    t("repr\u00e9sent\u00e9e par {representant_a_civilite} {representant_a_prenom} {representant_a_nom}, agissant en qualit\u00e9 de {representant_a_qualite}, d\u00fbment habilit\u00e9(e) aux fins des pr\u00e9sentes par d\u00e9lib\u00e9ration du conseil d\u2019administration en date du {date_deliberation_a},"),
    t(""),
    t("ci-apr\u00e8s d\u00e9nomm\u00e9e \u00ab la Soci\u00e9t\u00e9 Absorb\u00e9e \u00bb,"),
    t(""),
    t("D\u2019UNE PART,"),
    t(""),

    // ===== SOCIETE B (ABSORBANTE) =====
    b("Soci\u00e9t\u00e9 B (Soci\u00e9t\u00e9 absorbante) :"),
    t(""),
    t("{denomination_b}, {forme_juridique_b} au capital de {capital_b} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social_b}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm_b},"),
    t("repr\u00e9sent\u00e9e par {representant_b_civilite} {representant_b_prenom} {representant_b_nom}, agissant en qualit\u00e9 de {representant_b_qualite}, d\u00fbment habilit\u00e9(e) aux fins des pr\u00e9sentes par d\u00e9lib\u00e9ration du conseil d\u2019administration en date du {date_deliberation_b},"),
    t(""),
    t("ci-apr\u00e8s d\u00e9nomm\u00e9e \u00ab la Soci\u00e9t\u00e9 Absorbante \u00bb,"),
    t(""),
    t("D\u2019AUTRE PART,"),
    t(""),

    // ===== EXPOSE =====
    c("EXPOS\u00c9"),
    t(""),

    // ===== MOTIFS =====
    b("I. Motifs de la fusion"),
    t(""),
    t("{motifs_fusion}"),
    t(""),

    // ===== COMPTES DE REFERENCE =====
    b("II. Comptes de r\u00e9f\u00e9rence"),
    t(""),
    t("La fusion est \u00e9tablie sur la base des comptes arr\u00eat\u00e9s au {date_comptes_reference}."),
    t(""),
    t("Les \u00e9tats financiers de synth\u00e8se de la Soci\u00e9t\u00e9 Absorb\u00e9e et de la Soci\u00e9t\u00e9 Absorbante arr\u00eat\u00e9s \u00e0 cette date ont \u00e9t\u00e9 approuv\u00e9s par leurs assembl\u00e9es g\u00e9n\u00e9rales respectives."),
    t(""),

    // ===== ACTIF DE LA SOCIETE ABSORBEE =====
    b("III. Actif de la Soci\u00e9t\u00e9 Absorb\u00e9e"),
    t(""),
    t("L\u2019actif de la Soci\u00e9t\u00e9 Absorb\u00e9e, tel qu\u2019il r\u00e9sulte du bilan arr\u00eat\u00e9 au {date_comptes_reference}, s\u2019\u00e9l\u00e8ve \u00e0 {actif_total_a} {devise}, d\u00e9compos\u00e9 comme suit :"),
    t(""),
    t("Actif immobilis\u00e9 :"),
    t("- Immobilisations incorporelles : {immobilisations_incorporelles_a} {devise}"),
    t("- Immobilisations corporelles : {immobilisations_corporelles_a} {devise}"),
    t("- Immobilisations financi\u00e8res : {immobilisations_financieres_a} {devise}"),
    t(""),
    t("Actif circulant :"),
    t("- Stocks : {stocks_a} {devise}"),
    t("- Cr\u00e9ances clients : {creances_clients_a} {devise}"),
    t("- Autres cr\u00e9ances : {autres_creances_a} {devise}"),
    t("- Tr\u00e9sorerie-actif : {tresorerie_actif_a} {devise}"),
    t(""),
    b("Total actif : {actif_total_a} {devise}"),
    t(""),

    // ===== PASSIF DE LA SOCIETE ABSORBEE =====
    b("IV. Passif de la Soci\u00e9t\u00e9 Absorb\u00e9e"),
    t(""),
    t("Le passif de la Soci\u00e9t\u00e9 Absorb\u00e9e, tel qu\u2019il r\u00e9sulte du bilan arr\u00eat\u00e9 au {date_comptes_reference}, s\u2019\u00e9l\u00e8ve \u00e0 {passif_total_a} {devise}, d\u00e9compos\u00e9 comme suit :"),
    t(""),
    t("Capitaux propres :"),
    t("- Capital social : {capital_a} {devise}"),
    t("- R\u00e9serves : {reserves_a} {devise}"),
    t("- Report \u00e0 nouveau : {report_nouveau_a} {devise}"),
    t("- R\u00e9sultat de l\u2019exercice : {resultat_a} {devise}"),
    t(""),
    t("Dettes :"),
    t("- Dettes financi\u00e8res : {dettes_financieres_a} {devise}"),
    t("- Dettes fournisseurs : {dettes_fournisseurs_a} {devise}"),
    t("- Autres dettes : {autres_dettes_a} {devise}"),
    t("- Tr\u00e9sorerie-passif : {tresorerie_passif_a} {devise}"),
    t(""),
    b("Total passif : {passif_total_a} {devise}"),
    t(""),

    // ===== ACTIF NET =====
    b("V. Actif net apport\u00e9"),
    t(""),
    t("L\u2019actif net de la Soci\u00e9t\u00e9 Absorb\u00e9e, tel qu\u2019il r\u00e9sulte de la diff\u00e9rence entre l\u2019actif total et le passif exigible (hors capitaux propres), s\u2019\u00e9l\u00e8ve \u00e0 :"),
    t(""),
    t("Actif total : {actif_total_a} {devise}"),
    t("Passif exigible : {passif_exigible_a} {devise}"),
    b("Actif net : {actif_net_a} {devise}"),
    t(""),

    // ===== RAPPORT D'ECHANGE =====
    b("VI. Rapport d\u2019\u00e9change"),
    t(""),
    t("La valeur de l\u2019action de la Soci\u00e9t\u00e9 Absorb\u00e9e a \u00e9t\u00e9 \u00e9valu\u00e9e \u00e0 {valeur_action_a} {devise}."),
    t("La valeur de l\u2019action de la Soci\u00e9t\u00e9 Absorbante a \u00e9t\u00e9 \u00e9valu\u00e9e \u00e0 {valeur_action_b} {devise}."),
    t(""),
    t("Le rapport d\u2019\u00e9change est donc fix\u00e9 \u00e0 {rapport_echange} actions de la Soci\u00e9t\u00e9 Absorbante pour {rapport_echange_contre} action(s) de la Soci\u00e9t\u00e9 Absorb\u00e9e."),
    t(""),
    t("En cons\u00e9quence, la Soci\u00e9t\u00e9 Absorbante \u00e9mettra {nouvelles_actions_b} actions nouvelles de {valeur_nominale_b} {devise} chacune, portant son capital de {capital_b} {devise} \u00e0 {nouveau_capital_b} {devise}."),
    t(""),
    t("{#has_soulte}"),
    t("Une soulte de {montant_soulte} {devise} par action de la Soci\u00e9t\u00e9 Absorb\u00e9e sera vers\u00e9e en esp\u00e8ces aux actionnaires de la Soci\u00e9t\u00e9 Absorb\u00e9e."),
    t(""),
    t("{/has_soulte}"),

    // ===== CHARGES ET CONDITIONS =====
    c("CHARGES ET CONDITIONS"),
    t(""),

    b("Article 1 : Transmission universelle du patrimoine"),
    t(""),
    t("La Soci\u00e9t\u00e9 Absorbante recueillera la totalit\u00e9 de l\u2019actif de la Soci\u00e9t\u00e9 Absorb\u00e9e et prendra \u00e0 sa charge la totalit\u00e9 de son passif."),
    t(""),

    b("Article 2 : Date d\u2019effet de la fusion"),
    t(""),
    t("La fusion prendra effet \u00e0 compter du {date_effet_fusion}."),
    t(""),
    t("Du point de vue comptable, les op\u00e9rations de la Soci\u00e9t\u00e9 Absorb\u00e9e seront consid\u00e9r\u00e9es comme accomplies pour le compte de la Soci\u00e9t\u00e9 Absorbante \u00e0 compter du {date_effet_comptable}."),
    t(""),

    b("Article 3 : Date de jouissance des actions nouvelles"),
    t(""),
    t("Les actions nouvelles de la Soci\u00e9t\u00e9 Absorbante, \u00e9mises en r\u00e9mun\u00e9ration des apports de la Soci\u00e9t\u00e9 Absorb\u00e9e, porteront jouissance \u00e0 compter du {date_jouissance_actions}."),
    t(""),

    // ===== EFFETS DE LA FUSION =====
    c("EFFETS DE LA FUSION"),
    t(""),

    b("Article 4 : Transfert de propri\u00e9t\u00e9"),
    t(""),
    t("La fusion entra\u00eenera la transmission universelle du patrimoine de la Soci\u00e9t\u00e9 Absorb\u00e9e \u00e0 la Soci\u00e9t\u00e9 Absorbante, dans l\u2019\u00e9tat o\u00f9 il se trouvera \u00e0 la date de r\u00e9alisation d\u00e9finitive de la fusion, sans aucune restriction ni r\u00e9serve."),
    t(""),
    t("La Soci\u00e9t\u00e9 Absorbante sera substitu\u00e9e purement et simplement dans tous les droits, obligations, engagements et charges de la Soci\u00e9t\u00e9 Absorb\u00e9e."),
    t(""),

    b("Article 5 : Dissolution sans liquidation"),
    t(""),
    t("La fusion entra\u00eenera la dissolution sans liquidation de la Soci\u00e9t\u00e9 Absorb\u00e9e, conform\u00e9ment aux dispositions de l\u2019article 189 de l\u2019Acte Uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE."),
    t(""),
    t("Les mandats des administrateurs, du pr\u00e9sident-directeur g\u00e9n\u00e9ral et des commissaires aux comptes de la Soci\u00e9t\u00e9 Absorb\u00e9e prendront fin de plein droit \u00e0 la date de r\u00e9alisation d\u00e9finitive de la fusion."),
    t(""),

    b("Article 6 : R\u00e9mun\u00e9ration des apports"),
    t(""),
    t("En r\u00e9mun\u00e9ration des apports de la Soci\u00e9t\u00e9 Absorb\u00e9e, la Soci\u00e9t\u00e9 Absorbante proc\u00e9dera \u00e0 une augmentation de son capital social de {montant_augmentation_b} {devise}, par l\u2019\u00e9mission de {nouvelles_actions_b} actions nouvelles de {valeur_nominale_b} {devise} chacune, qui seront attribu\u00e9es aux actionnaires de la Soci\u00e9t\u00e9 Absorb\u00e9e dans la proportion du rapport d\u2019\u00e9change ci-dessus d\u00e9fini."),
    t(""),
    t("{#has_prime_fusion}"),
    t("La diff\u00e9rence entre la valeur de l\u2019actif net apport\u00e9 et le montant de l\u2019augmentation de capital, soit {prime_fusion} {devise}, constituera la prime de fusion, inscrite au passif du bilan de la Soci\u00e9t\u00e9 Absorbante."),
    t(""),
    t("{/has_prime_fusion}"),

    b("Article 7 : Conditions suspensives"),
    t(""),
    t("La r\u00e9alisation d\u00e9finitive de la fusion est soumise aux conditions suspensives suivantes :"),
    t("- approbation du projet de fusion par l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire de la Soci\u00e9t\u00e9 Absorb\u00e9e ;"),
    t("- approbation du projet de fusion par l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire de la Soci\u00e9t\u00e9 Absorbante ;"),
    t("- absence d\u2019opposition des cr\u00e9anciers ou, en cas d\u2019opposition, constitution de garanties suffisantes ou remboursement des cr\u00e9ances concern\u00e9es."),
    t(""),

    b("Article 8 : D\u00e9p\u00f4t et publicit\u00e9"),
    t(""),
    t("Le pr\u00e9sent projet de fusion sera d\u00e9pos\u00e9 au greffe du tribunal de commerce et publi\u00e9 dans un journal d\u2019annonces l\u00e9gales, conform\u00e9ment aux dispositions des articles 194 et suivants de l\u2019Acte Uniforme relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE."),
    t(""),

    // ===== SIGNATURE =====
    t(""),
    t("Fait \u00e0 {lieu_signature}, le {date_signature}, en {nombre_exemplaires} exemplaires originaux."),
    t(""),
    t(""),
    b("Pour la Soci\u00e9t\u00e9 Absorb\u00e9e"),
    b("{denomination_a}"),
    t("{representant_a_civilite} {representant_a_prenom} {representant_a_nom}"),
    t("{representant_a_qualite}"),
    t(""),
    t(""),
    b("Pour la Soci\u00e9t\u00e9 Absorbante"),
    b("{denomination_b}"),
    t("{representant_b_civilite} {representant_b_prenom} {representant_b_nom}"),
    t("{representant_b_qualite}"),
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

  const outputDir = path.join(__dirname, "../templates/projet-fusion");
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
