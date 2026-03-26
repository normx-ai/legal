/**
 * Script pour créer le template DOCX du PV d'Assemblée Générale Ordinaire (AGO) — SARL OHADA
 * Basé sur le modèle officiel du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-pv-ago-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV AGO \u2014 {denomination}</w:t></w:r>
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
    c("PROC\u00c8S-VERBAL DE L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE ORDINAIRE"),
    it("(Articles 333 et suivants de l\u2019Acte Uniforme OHADA relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE)"),
    t(""),

    // ===== EN-T\u00caTE =====
    t("L\u2019an deux mille vingt-six, le {date_ag}, \u00e0 {heure_ag},"),
    t("les associ\u00e9s de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est sis \u00e0 {siege_social}, se sont r\u00e9unis en Assembl\u00e9e G\u00e9n\u00e9rale Ordinaire au {lieu_ag}, sur convocation du g\u00e9rant, conform\u00e9ment aux dispositions l\u00e9gales et statutaires."),
    t(""),

    // ===== ASSOCIES PRESENTS =====
    b("Associ\u00e9s pr\u00e9sents :"),
    t("{#has_associes_presents}"),
    t("{#associes_presents}"),
    t("- {civilite} {prenom} {nom}, demeurant \u00e0 {adresse}, titulaire de {parts} parts sociales ;"),
    t("{/associes_presents}"),
    t("{/has_associes_presents}"),
    t(""),

    // ===== ASSOCIES REPRESENTES =====
    t("{#has_associes_representes}"),
    b("Associ\u00e9s repr\u00e9sent\u00e9s :"),
    t("{#associes_representes}"),
    t("- {civilite} {prenom} {nom}, demeurant \u00e0 {adresse}, titulaire de {parts} parts sociales, repr\u00e9sent\u00e9(e) par {mandataire_nom} ;"),
    t("{/associes_representes}"),
    t("{/has_associes_representes}"),
    t(""),

    // ===== ASSOCIES ABSENTS =====
    t("{#has_associes_absents}"),
    b("Associ\u00e9s absents :"),
    t("{#associes_absents}"),
    t("- {civilite} {prenom} {nom}, demeurant \u00e0 {adresse}, titulaire de {parts} parts sociales ;"),
    t("{/associes_absents}"),
    t("{/has_associes_absents}"),
    t(""),

    // ===== QUORUM =====
    b("Quorum"),
    t("Sont pr\u00e9sents ou repr\u00e9sent\u00e9s les associ\u00e9s d\u00e9tenant {total_parts_presentes} parts sociales sur les {total_parts} parts composant le capital social, soit {pourcentage_presents} % du capital."),
    t("Le quorum requis par l\u2019article 349 de l\u2019Acte Uniforme OHADA \u00e9tant atteint, l\u2019assembl\u00e9e peut valablement d\u00e9lib\u00e9rer."),
    t(""),

    // ===== BUREAU =====
    b("Bureau de l\u2019Assembl\u00e9e"),
    t("{president_civilite} {president_prenom} {president_nom} pr\u00e9side la s\u00e9ance en qualit\u00e9 de pr\u00e9sident de l\u2019assembl\u00e9e."),
    t(""),

    // ===== ORDRE DU JOUR =====
    b("Ordre du jour :"),
    t("{ordre_du_jour}"),
    t(""),

    // ===== RESOLUTION 1 : Approbation des comptes =====
    b("PREMI\u00c8RE R\u00c9SOLUTION"),
    b("Approbation des comptes de l\u2019exercice clos le {exercice_clos_le}"),
    t(""),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale, apr\u00e8s avoir entendu la lecture du rapport de gestion du G\u00e9rant sur l\u2019activit\u00e9 de la soci\u00e9t\u00e9 au cours de l\u2019exercice clos le {exercice_clos_le}, et le cas \u00e9ch\u00e9ant le rapport du Commissaire aux Comptes,"),
    t("approuve les comptes annuels de l\u2019exercice, tels qu\u2019ils lui ont \u00e9t\u00e9 pr\u00e9sent\u00e9s, faisant appara\u00eetre un r\u00e9sultat {resultat_type} de {resultat_exercice} {devise} ({resultat_lettres} francs CFA)."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== RESOLUTION 2 : Affectation du r\u00e9sultat =====
    b("DEUXI\u00c8ME R\u00c9SOLUTION"),
    b("Affectation du r\u00e9sultat de l\u2019exercice"),
    t(""),
    t("{#is_beneficiaire}"),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale d\u00e9cide d\u2019affecter le b\u00e9n\u00e9fice de l\u2019exercice d\u2019un montant de {resultat_exercice} {devise} de la mani\u00e8re suivante :"),
    t("{affectation_resultat}"),
    t("{/is_beneficiaire}"),
    t("{#is_deficitaire}"),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale constate que l\u2019exercice se solde par un d\u00e9ficit de {resultat_exercice} {devise} et d\u00e9cide de l\u2019affecter comme suit :"),
    t("{affectation_resultat}"),
    t("{/is_deficitaire}"),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== RESOLUTION 3 : Conventions r\u00e9glement\u00e9es =====
    b("TROISI\u00c8ME R\u00c9SOLUTION"),
    b("Conventions vis\u00e9es aux articles 350 et suivants de l\u2019Acte Uniforme OHADA"),
    t(""),
    t("{#has_conventions}"),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale, apr\u00e8s avoir pris connaissance du rapport sp\u00e9cial du G\u00e9rant sur les conventions vis\u00e9es aux articles 350 et suivants de l\u2019Acte Uniforme OHADA, approuve lesdites conventions."),
    t("{convention_details}"),
    t("{/has_conventions}"),
    t("{#sans_conventions}"),
    t("Le G\u00e9rant d\u00e9clare qu\u2019aucune convention vis\u00e9e aux articles 350 et suivants de l\u2019Acte Uniforme OHADA n\u2019a \u00e9t\u00e9 conclue au cours de l\u2019exercice \u00e9coul\u00e9."),
    t("{/sans_conventions}"),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== RESOLUTION 4 : Quitus au g\u00e9rant =====
    b("QUATRI\u00c8ME R\u00c9SOLUTION"),
    b("Quitus au G\u00e9rant"),
    t(""),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale donne quitus au G\u00e9rant, {gerant_civilite} {gerant_prenom} {gerant_nom}, de sa gestion au titre de l\u2019exercice clos le {exercice_clos_le}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== RESOLUTION 5 : Renouvellement g\u00e9rant (conditionnelle) =====
    t("{#has_renouvellement_gerant}"),
    b("CINQUI\u00c8ME R\u00c9SOLUTION"),
    b("Renouvellement du mandat du G\u00e9rant"),
    t(""),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale d\u00e9cide de renouveler le mandat de G\u00e9rant de {gerant_civilite} {gerant_prenom} {gerant_nom} pour une dur\u00e9e de {duree_renouvellement}, conform\u00e9ment aux dispositions statutaires."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),
    t("{/has_renouvellement_gerant}"),

    // ===== RESOLUTION 6 : R\u00e9mun\u00e9ration g\u00e9rant (conditionnelle) =====
    t("{#has_remuneration_gerant}"),
    b("R\u00c9SOLUTION COMPL\u00c9MENTAIRE"),
    b("R\u00e9mun\u00e9ration du G\u00e9rant"),
    t(""),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale fixe la r\u00e9mun\u00e9ration du G\u00e9rant \u00e0 {remuneration_montant} pour l\u2019exercice en cours."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),
    t("{/has_remuneration_gerant}"),

    // ===== RESOLUTION 7 : Nomination CAC (conditionnelle) =====
    t("{#has_cac}"),
    b("R\u00c9SOLUTION COMPL\u00c9MENTAIRE"),
    b("Nomination du Commissaire aux Comptes"),
    t(""),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale d\u00e9cide de nommer {cac_nom} en qualit\u00e9 de Commissaire aux Comptes titulaire pour une dur\u00e9e de {cac_duree}, conform\u00e9ment aux dispositions de l\u2019article 376 de l\u2019Acte Uniforme OHADA."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),
    t("{/has_cac}"),

    // ===== R\u00e9solutions suppl\u00e9mentaires =====
    t("{#has_resolutions_supplementaires}"),
    b("R\u00c9SOLUTIONS SUPPL\u00c9MENTAIRES"),
    t("{resolutions_supplementaires}"),
    t(""),
    t("{/has_resolutions_supplementaires}"),

    // ===== RESOLUTION FINALE : Pouvoirs =====
    b("DERNI\u00c8RE R\u00c9SOLUTION"),
    b("Pouvoirs"),
    t(""),
    t("L\u2019Assembl\u00e9e G\u00e9n\u00e9rale donne tous pouvoirs au porteur d\u2019une copie ou d\u2019un extrait du pr\u00e9sent proc\u00e8s-verbal pour effectuer toutes formalit\u00e9s de d\u00e9p\u00f4t et de publicit\u00e9 l\u00e9gales."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),

    // ===== CL\u00d4TURE =====
    b("Cl\u00f4ture"),
    t("Plus rien n\u2019\u00e9tant \u00e0 l\u2019ordre du jour, la s\u00e9ance est lev\u00e9e \u00e0 {heure_levee_seance}."),
    t(""),
    t("De tout ce qui pr\u00e9c\u00e8de, il a \u00e9t\u00e9 dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal qui a \u00e9t\u00e9 sign\u00e9 par le Pr\u00e9sident de s\u00e9ance."),
    t(""),
    t("Fait \u00e0 {lieu_signature}, le {date_signature}."),
    t(""),
    t(""),
    b("Le Pr\u00e9sident de s\u00e9ance,"),
    t("{president_civilite} {president_prenom} {president_nom}"),
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

  const outputDir = path.join(__dirname, "../templates/pv-ago");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "pv-ago.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
