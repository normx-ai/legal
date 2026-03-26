/**
 * Script pour créer le template DOCX du Pacte d'Actionnaires ou d'Associés — OHADA
 * Usage : npx tsx scripts/create-pacte-actionnaires-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Pacte d&apos;actionnaires \u2014 {denomination}</w:t></w:r>
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
    c("PACTE D\u2019ACTIONNAIRES OU D\u2019ASSOCI\u00c9S"),
    t(""),

    // ===== ENTRE LES SOUSSIGNÉS =====
    b("ENTRE LES SOUSSIGN\u00c9S :"),
    t(""),
    t("{liste_signataires}"),
    t(""),
    t("Ci-apr\u00e8s d\u00e9nomm\u00e9s individuellement une \u00ab Partie \u00bb et collectivement les \u00ab Parties \u00bb."),
    t(""),

    // ===== EXPOSÉ =====
    b("EXPOS\u00c9 PR\u00c9ALABLE"),
    t(""),

    b("1. Pr\u00e9sentation de la Soci\u00e9t\u00e9"),
    t("La soci\u00e9t\u00e9 {denomination}, {forme_sociale} au capital de {capital} FCFA, divis\u00e9 en {nb_actions_total} {type_titres} de {valeur_nominale} FCFA chacune, dont le si\u00e8ge social est situ\u00e9 \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le num\u00e9ro {numero_rccm} (ci-apr\u00e8s la \u00ab Soci\u00e9t\u00e9 \u00bb)."),
    t(""),

    b("2. Objet social"),
    t("La Soci\u00e9t\u00e9 a pour objet : {objet_social}."),
    t(""),

    b("3. R\u00e9partition du capital"),
    t("{repartition_capital}"),
    t(""),

    t("Les Parties ont souhait\u00e9 organiser leurs relations au sein de la Soci\u00e9t\u00e9 par le pr\u00e9sent pacte, compl\u00e9mentaire aux statuts."),
    t(""),

    // ===== TITRE I : RELATIONS ENTRE PARTIES =====
    b("TITRE I \u2013 RELATIONS ENTRE LES PARTIES"),
    t(""),

    b("Article 1 \u2013 Objet du Pacte"),
    t("Le pr\u00e9sent pacte a pour objet de d\u00e9finir les droits et obligations des Parties entre elles, en compl\u00e9ment des statuts de la Soci\u00e9t\u00e9, en ce qui concerne notamment la gouvernance, la conduite des affaires sociales, l\u2019acc\u00e8s au capital et la transmission des titres."),
    t(""),

    b("Article 2 \u2013 Clause de non-concurrence"),
    t("Chaque Partie s\u2019engage, pendant toute la dur\u00e9e du pr\u00e9sent pacte, \u00e0 ne pas exercer, directement ou indirectement, une activit\u00e9 concurrente de celle de la Soci\u00e9t\u00e9 dans {perimetre_non_concurrence}."),
    t(""),

    b("Article 3 \u2013 Clause de confidentialit\u00e9"),
    t("Les Parties s\u2019engagent \u00e0 garder strictement confidentielles toutes les informations relatives \u00e0 la Soci\u00e9t\u00e9 et au pr\u00e9sent pacte, sauf accord \u00e9crit pr\u00e9alable des autres Parties ou obligation l\u00e9gale."),
    t(""),

    // ===== TITRE II : GOUVERNANCE =====
    b("TITRE II \u2013 ORGANES DE DIRECTION ET DE CONTR\u00d4LE"),
    t(""),

    b("Article 4 \u2013 Composition des organes de direction"),
    t("{clause_composition_organes}"),
    t(""),

    b("Article 5 \u2013 D\u00e9cisions strat\u00e9giques"),
    t("Les d\u00e9cisions suivantes n\u00e9cessiteront l\u2019accord unanime (ou la majorit\u00e9 qualifi\u00e9e) des Parties :"),
    t("{liste_decisions_strategiques}"),
    t(""),

    b("Article 6 \u2013 Droit d\u2019information"),
    t("Chaque Partie aura le droit de recevoir p\u00e9riodiquement les informations financi\u00e8res et op\u00e9rationnelles de la Soci\u00e9t\u00e9, notamment les \u00e9tats financiers trimestriels, le budget pr\u00e9visionnel et le rapport de gestion."),
    t(""),

    // ===== TITRE III : CONDUITE DES AFFAIRES =====
    b("TITRE III \u2013 CONDUITE DES AFFAIRES SOCIALES"),
    t(""),

    b("Article 7 \u2013 Business plan"),
    t("Les Parties s\u2019engagent \u00e0 approuver conjointement un business plan pour la Soci\u00e9t\u00e9, qui sera revu et mis \u00e0 jour annuellement."),
    t(""),

    b("Article 8 \u2013 Politique de distribution"),
    t("{clause_politique_distribution}"),
    t(""),

    // ===== TITRE IV : ACCÈS AU CAPITAL =====
    b("TITRE IV \u2013 ACC\u00c8S AU CAPITAL"),
    t(""),

    b("Article 9 \u2013 Augmentation de capital"),
    t("Toute augmentation de capital devra \u00eatre approuv\u00e9e conform\u00e9ment aux dispositions statutaires et au pr\u00e9sent pacte. Les Parties b\u00e9n\u00e9ficieront d\u2019un droit pr\u00e9f\u00e9rentiel de souscription proportionnel \u00e0 leur participation."),
    t(""),

    b("Article 10 \u2013 Clause anti-dilution"),
    t("{clause_anti_dilution}"),
    t(""),

    // ===== TITRE V : TRANSMISSION DES TITRES =====
    b("TITRE V \u2013 TRANSMISSION DES TITRES"),
    t(""),

    b("Article 11 \u2013 Droit de pr\u00e9emption"),
    t("En cas de projet de cession de tout ou partie de ses titres par une Partie, les autres Parties b\u00e9n\u00e9ficieront d\u2019un droit de pr\u00e9emption leur permettant d\u2019acqu\u00e9rir lesdits titres par priorit\u00e9, dans les conditions et selon les modalit\u00e9s ci-apr\u00e8s d\u00e9finies."),
    t(""),
    t("{modalites_preemption}"),
    t(""),

    b("Article 12 \u2013 Clause de sortie conjointe (Tag-along)"),
    t("En cas de cession par un actionnaire majoritaire de tout ou partie de ses titres \u00e0 un tiers, les actionnaires minoritaires auront le droit de c\u00e9der leurs titres au m\u00eame prix et aux m\u00eames conditions."),
    t(""),

    b("Article 13 \u2013 Clause d\u2019entra\u00eenement (Drag-along)"),
    t("{clause_drag_along}"),
    t(""),

    b("Article 14 \u2013 Clause d\u2019inali\u00e9nabilit\u00e9"),
    t("Les Parties s\u2019engagent \u00e0 ne pas c\u00e9der, nantir ou transf\u00e9rer de quelque mani\u00e8re que ce soit leurs titres pendant une dur\u00e9e de {duree_inalienabilite} \u00e0 compter de la signature du pr\u00e9sent pacte, sauf accord unanime des Parties."),
    t(""),

    // ===== TITRE VI : DISPOSITIONS DIVERSES =====
    b("TITRE VI \u2013 DISPOSITIONS DIVERSES"),
    t(""),

    b("Article 15 \u2013 Dur\u00e9e du Pacte"),
    t("Le pr\u00e9sent pacte est conclu pour une dur\u00e9e de {duree_pacte} \u00e0 compter de sa signature. Il sera renouvelable par tacite reconduction pour des p\u00e9riodes successives de {duree_renouvellement}, sauf d\u00e9nonciation par l\u2019une des Parties moyennant un pr\u00e9avis de {preavis_denonciation}."),
    t(""),

    b("Article 16 \u2013 Clause d\u2019arbitrage"),
    t("Tout diff\u00e9rend entre les Parties relatif \u00e0 l\u2019interpr\u00e9tation, l\u2019ex\u00e9cution ou la r\u00e9siliation du pr\u00e9sent pacte sera soumis \u00e0 l\u2019arbitrage conform\u00e9ment au R\u00e8glement d\u2019arbitrage de la Cour Commune de Justice et d\u2019Arbitrage (CCJA) de l\u2019OHADA."),
    t(""),
    t("Le tribunal arbitral sera compos\u00e9 de {nb_arbitres} arbitre(s). Le si\u00e8ge de l\u2019arbitrage sera {siege_arbitrage}. La proc\u00e9dure sera conduite en langue fran\u00e7aise."),
    t(""),

    b("Article 17 \u2013 Loi applicable"),
    t("Le pr\u00e9sent pacte est soumis au droit OHADA et, subsidiairement, au droit de {pays_applicable}."),
    t(""),

    b("Article 18 \u2013 \u00c9lection de domicile"),
    t("Pour l\u2019ex\u00e9cution des pr\u00e9sentes et de leurs suites, les Parties \u00e9lisent domicile en leurs adresses respectives indiqu\u00e9es en t\u00eate des pr\u00e9sentes."),
    t(""),

    // ===== SIGNATURES =====
    t(""),
    t("Fait en {nombre_exemplaires} exemplaires originaux \u00e0 {lieu_signature}, le {date_signature}."),
    t(""),
    t(""),

    b("Les Parties :"),
    t(""),
    t("{signatures_parties}"),
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

  const outputDir = path.join(__dirname, "../templates/pacte-actionnaires");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "pacte.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
