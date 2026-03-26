/**
 * Script pour creer le template DOCX du PV de l'AGE - SA & SAS
 * Usage : npx tsx scripts/create-pv-age-sa-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV AGE SA/SAS \u2014 {denomination}</w:t></w:r>
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
    c("DU {date_ag}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_ag_lettres}, le {date_ag},"),
    t(""),
    t("\u00c0 {heure_ag_lettres} heures, les actionnaires de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm}, se sont r\u00e9unis en assembl\u00e9e g\u00e9n\u00e9rale extraordinaire au {lieu_ag}, sur convocation du {organe_convocation} en date du {date_convocation}."),
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

    // ===== FEUILLE DE PRESENCE =====
    b("Feuille de pr\u00e9sence"),
    t(""),
    t("Il a \u00e9t\u00e9 \u00e9tabli une feuille de pr\u00e9sence qui a \u00e9t\u00e9 \u00e9marg\u00e9e par chaque actionnaire pr\u00e9sent ou repr\u00e9sent\u00e9."),
    t(""),
    t("Il r\u00e9sulte de cette feuille de pr\u00e9sence que {nombre_actionnaires_presents} actionnaires sont pr\u00e9sents ou repr\u00e9sent\u00e9s, poss\u00e9dant ensemble {nombre_actions_presentes} actions sur les {nombre_total_actions} composant le capital social, soit {pourcentage_quorum} % du capital."),
    t(""),
    t("L\u2019assembl\u00e9e, r\u00e9unissant plus de la moiti\u00e9 des actions ayant le droit de vote sur premi\u00e8re convocation (ou plus du quart sur deuxi\u00e8me convocation), peut valablement d\u00e9lib\u00e9rer."),
    t(""),

    // ===== DOCUMENTS =====
    b("Documents mis \u00e0 disposition"),
    t(""),
    t("Le pr\u00e9sident rappelle que les documents suivants ont \u00e9t\u00e9 tenus \u00e0 la disposition des actionnaires :"),
    t("- le rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) ;"),
    t("- le rapport du commissaire aux comptes (\u00e9ventuellement) ;"),
    t("- le texte des r\u00e9solutions propos\u00e9es."),
    t(""),
    t("Le pr\u00e9sident d\u00e9clare la discussion ouverte."),
    t(""),

    // ===== A. AUGMENTATION DE CAPITAL =====
    t("{#has_augmentation_capital}"),
    b("Premi\u00e8re r\u00e9solution : Augmentation du capital social"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale, apr\u00e8s avoir entendu la lecture du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) et, le cas \u00e9ch\u00e9ant, du rapport du commissaire aux comptes (ou du commissaire aux apports), d\u00e9cide d\u2019augmenter le capital social de {montant_augmentation} {devise}, pour le porter de {capital} {devise} \u00e0 {nouveau_capital} {devise}, par {modalite_augmentation}."),
    t(""),
    b("Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de modifier les articles des statuts relatifs aux apports et au capital social."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s."),
    t(""),
    t("{/has_augmentation_capital}"),

    // ===== B. REDUCTION DE CAPITAL =====
    t("{#has_reduction_capital}"),
    b("Deuxi\u00e8me r\u00e9solution : R\u00e9duction du capital social"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale, apr\u00e8s avoir entendu la lecture du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) et du rapport du commissaire aux comptes, d\u00e9cide de r\u00e9duire le capital social de {montant_reduction} {devise}, pour le ramener de {capital} {devise} \u00e0 {nouveau_capital} {devise}, par {modalite_reduction}."),
    t(""),
    b("Modification corr\u00e9lative des statuts"),
    t(""),
    t("En cons\u00e9quence, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de modifier l\u2019article des statuts relatif au capital social."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s."),
    t(""),
    t("{/has_reduction_capital}"),

    // ===== C. TRANSFORMATION =====
    t("{#has_transformation}"),
    b("Troisi\u00e8me r\u00e9solution : Transformation de la soci\u00e9t\u00e9"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale, apr\u00e8s avoir entendu la lecture du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) et du rapport du commissaire aux comptes attestant que les capitaux propres sont au moins \u00e9gaux au capital social, d\u00e9cide la transformation de la soci\u00e9t\u00e9 en {nouvelle_forme_juridique} \u00e0 compter de ce jour."),
    t(""),
    b("Modification des statuts"),
    t(""),
    t("En cons\u00e9quence de la transformation ci-dessus d\u00e9cid\u00e9e, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de modifier l\u2019int\u00e9gralit\u00e9 des statuts de la soci\u00e9t\u00e9 pour les adapter \u00e0 la nouvelle forme juridique."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s."),
    t(""),
    t("{/has_transformation}"),

    // ===== D. DISSOLUTION =====
    t("{#has_dissolution}"),
    b("Quatri\u00e8me r\u00e9solution : Dissolution anticip\u00e9e de la soci\u00e9t\u00e9"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide la dissolution anticip\u00e9e de la soci\u00e9t\u00e9 {denomination} \u00e0 compter de ce jour et sa mise en liquidation."),
    t(""),
    b("Nomination du liquidateur"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale nomme en qualit\u00e9 de liquidateur {liquidateur_civilite} {liquidateur_nom}, demeurant \u00e0 {liquidateur_adresse}."),
    t(""),
    t("Le si\u00e8ge de la liquidation est fix\u00e9 \u00e0 {siege_liquidation}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s."),
    t(""),
    t("{/has_dissolution}"),

    // ===== E. MODIFICATION STATUTS =====
    t("{#has_modification_statuts}"),
    b("Cinqui\u00e8me r\u00e9solution : Modification des statuts"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de modifier les statuts comme suit :"),
    t(""),
    t("{details_modification_statuts}"),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s."),
    t(""),
    t("{/has_modification_statuts}"),

    // ===== F. FUSION =====
    t("{#has_fusion}"),
    b("Sixi\u00e8me r\u00e9solution : Fusion"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale, apr\u00e8s avoir pris connaissance du projet de fusion \u00e9tabli entre la soci\u00e9t\u00e9 {denomination} et la soci\u00e9t\u00e9 {societe_fusionnee}, du rapport du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) et du rapport du commissaire \u00e0 la fusion :"),
    t(""),
    t("- approuve le projet de fusion tel qu\u2019il lui a \u00e9t\u00e9 pr\u00e9sent\u00e9 ;"),
    t("- constate que la fusion entra\u00eene la transmission universelle du patrimoine de la soci\u00e9t\u00e9 absorb\u00e9e \u00e0 la soci\u00e9t\u00e9 absorbante ;"),
    t("- constate que la fusion entra\u00eene la dissolution sans liquidation de la soci\u00e9t\u00e9 absorb\u00e9e."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 la majorit\u00e9 des deux tiers des voix des actionnaires pr\u00e9sents ou repr\u00e9sent\u00e9s."),
    t(""),
    t("{/has_fusion}"),

    // ===== POUVOIRS =====
    t("{#has_pouvoirs}"),
    b("Derni\u00e8re r\u00e9solution : Pouvoirs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale donne tous pouvoirs au porteur d\u2019une copie ou d\u2019un extrait du pr\u00e9sent proc\u00e8s-verbal \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales ou autres."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),
    t("{/has_pouvoirs}"),

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

  const outputDir = path.join(__dirname, "../templates/pv-age-sa");
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
