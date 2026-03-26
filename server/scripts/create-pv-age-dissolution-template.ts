/**
 * Script pour creer le template DOCX du PV de l'AGE reunie pour la dissolution/liquidation
 * Usage : npx tsx scripts/create-pv-age-dissolution-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV AGE dissolution \u2014 {denomination}</w:t></w:r>
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
    c("PROC\u00c8S-VERBAL DE L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE EXTRAORDINAIRE"),
    c("R\u00c9UNIE POUR LA DISSOLUTION ET LA LIQUIDATION"),
    c("DU {date_age}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_age_lettres}, le {date_age},"),
    t(""),
    t("\u00c0 {heure_age_lettres} heures, les actionnaires de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm}, se sont r\u00e9unis en assembl\u00e9e g\u00e9n\u00e9rale extraordinaire au {lieu_age}, sur convocation du {organe_convocation} en date du {date_convocation}."),
    t(""),

    // ===== BUREAU =====
    b("Composition du bureau"),
    t(""),
    t("L\u2019assembl\u00e9e d\u00e9signe :"),
    t("- {president_bureau_civilite} {president_bureau_nom}, en qualit\u00e9 de pr\u00e9sident de s\u00e9ance ;"),
    t("- {scrutateur1_civilite} {scrutateur1_nom}, en qualit\u00e9 de premier scrutateur ;"),
    t("- {scrutateur2_civilite} {scrutateur2_nom}, en qualit\u00e9 de deuxi\u00e8me scrutateur ;"),
    t("- {secretaire_civilite} {secretaire_nom}, en qualit\u00e9 de secr\u00e9taire."),
    t(""),

    // ===== QUORUM =====
    b("Feuille de pr\u00e9sence - Quorum"),
    t(""),
    t("Il a \u00e9t\u00e9 \u00e9tabli une feuille de pr\u00e9sence qui a \u00e9t\u00e9 \u00e9marg\u00e9e par chaque actionnaire pr\u00e9sent ou repr\u00e9sent\u00e9."),
    t(""),
    t("Il r\u00e9sulte de cette feuille de pr\u00e9sence que {nombre_actionnaires_presents} actionnaires sont pr\u00e9sents ou repr\u00e9sent\u00e9s, poss\u00e9dant ensemble {nombre_actions_presentes} actions sur les {nombre_total_actions} composant le capital social, soit {pourcentage_quorum} % du capital."),
    t(""),
    t("L\u2019assembl\u00e9e, r\u00e9unissant plus de la moiti\u00e9 des actions ayant le droit de vote sur premi\u00e8re convocation (ou plus du quart sur deuxi\u00e8me convocation), peut valablement d\u00e9lib\u00e9rer."),
    t(""),

    // ===== EXPOSE =====
    b("Expos\u00e9 du pr\u00e9sident"),
    t(""),
    t("Le pr\u00e9sident rappelle que la pr\u00e9sente assembl\u00e9e est convoqu\u00e9e \u00e0 l\u2019effet de d\u00e9lib\u00e9rer sur l\u2019ordre du jour suivant :"),
    t(""),
    t("1. Dissolution anticip\u00e9e de la soci\u00e9t\u00e9 et modification de l\u2019article des statuts relatif \u00e0 la dur\u00e9e ;"),
    t("2. Nomination du liquidateur ;"),
    t("3. Pouvoirs pour l\u2019accomplissement des formalit\u00e9s."),
    t(""),
    t("Le pr\u00e9sident donne ensuite lecture du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) et d\u00e9clare la discussion ouverte."),
    t(""),

    // ===== PREMIERE RESOLUTION : DISSOLUTION =====
    b("Premi\u00e8re r\u00e9solution : Dissolution anticip\u00e9e et modification des statuts"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire, apr\u00e8s avoir entendu la lecture du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) :"),
    t(""),
    t("- d\u00e9cide la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 {denomination} \u00e0 compter de ce jour ;"),
    t("- d\u00e9cide que la soci\u00e9t\u00e9 subsistera pour les besoins de sa liquidation ;"),
    t("- d\u00e9cide en cons\u00e9quence de modifier l\u2019article {article_duree} des statuts relatif \u00e0 la dur\u00e9e de la soci\u00e9t\u00e9."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s, soit {votes_pour_1} voix pour, {votes_contre_1} voix contre et {abstentions_1} abstentions."),
    t(""),

    // ===== DEUXIEME RESOLUTION : NOMINATION LIQUIDATEUR =====
    b("Deuxi\u00e8me r\u00e9solution : Nomination du liquidateur"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire nomme en qualit\u00e9 de liquidateur {liquidateur_civilite} {liquidateur_prenom} {liquidateur_nom}, demeurant \u00e0 {liquidateur_adresse}."),
    t(""),
    t("Le liquidateur aura les pouvoirs les plus \u00e9tendus conform\u00e9ment \u00e0 la loi pour repr\u00e9senter la soci\u00e9t\u00e9, r\u00e9aliser l\u2019actif, payer les cr\u00e9anciers et r\u00e9partir le solde disponible."),
    t(""),
    t("Le si\u00e8ge de la liquidation est fix\u00e9 \u00e0 {siege_liquidation}."),
    t(""),
    t("En r\u00e9mun\u00e9ration de ses fonctions, le liquidateur percevra {remuneration_liquidateur}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s, soit {votes_pour_2} voix pour, {votes_contre_2} voix contre et {abstentions_2} abstentions."),
    t(""),

    // ===== TROISIEME RESOLUTION : POUVOIRS =====
    b("Troisi\u00e8me r\u00e9solution : Pouvoirs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire donne tous pouvoirs au liquidateur et au porteur d\u2019une copie ou d\u2019un extrait du pr\u00e9sent proc\u00e8s-verbal \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales ou autres."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== CLOTURE =====
    t("Plus rien n\u2019\u00e9tant \u00e0 l\u2019ordre du jour, la s\u00e9ance est lev\u00e9e \u00e0 {heure_fin} heures."),
    t(""),
    t("De tout ce que dessus, il a \u00e9t\u00e9 dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal, sign\u00e9 par les membres du bureau."),
    t(""),
    t(""),
    b("Le Pr\u00e9sident de s\u00e9ance"),
    t("{president_bureau_civilite} {president_bureau_nom}"),
    t(""),
    t(""),
    b("Les Scrutateurs"),
    t("{scrutateur1_civilite} {scrutateur1_nom}"),
    t("{scrutateur2_civilite} {scrutateur2_nom}"),
    t(""),
    t(""),
    b("Le Secr\u00e9taire"),
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

  const outputDir = path.join(__dirname, "../templates/pv-age-dissolution");
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
