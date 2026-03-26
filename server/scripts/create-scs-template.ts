/**
 * Script pour cr\u00e9er le template DOCX des statuts SCS OHADA
 * Mod\u00e8le 2 du Guide Pratique des Soci\u00e9t\u00e9s Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-scs-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 en Commandite Simple au capital de {capital} {devise}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}, {ville}, {pays}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Paraphes : _____ / _____</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SCS \u2014 {denomination}</w:t></w:r>
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
    // PAGE DE GARDE
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),
    p("{denomination}", true, 36, true), p("", false, 24, true),
    p("Soci\u00e9t\u00e9 en Commandite Simple", false, 28, true),
    p("Au capital de {capital} {devise}", false, 24, true), p("", false, 24, true),
    p("Si\u00e8ge social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true),
    p("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", false, 24, true), p("", false, 24, true),
    p("STATUTS", true, 36, true), p("", false, 24, true),
    p("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", false, 24, true), p("", false, 24, true),
    p("\u00c9tablis le {date_signature}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),

    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    c("STATUTS - SOCI\u00c9T\u00c9 EN COMMANDITE SIMPLE"),
    c("\u00ab SCS \u00bb"),
    p(""),

    // PR\u00c9AMBULE
    t("Entre les soussign\u00e9s :"),
    t(""),
    b("Commandit\u00e9(s) :"),
    t("{#commandites}"),
    t("- {civilite} {prenom} {nom}, n\u00e9(e) le {date_naissance} \u00e0 {lieu_naissance}, de nationalit\u00e9 {nationalite}, {profession}, demeurant \u00e0 {adresse} ;"),
    t("{/commandites}"),
    t(""),
    b("Commanditaire(s) :"),
    t("{#commanditaires}"),
    t("- {civilite} {prenom} {nom}, n\u00e9(e) le {date_naissance} \u00e0 {lieu_naissance}, de nationalit\u00e9 {nationalite}, {profession}, demeurant \u00e0 {adresse} ;"),
    t("{/commanditaires}"),
    p(""),
    t("Il est \u00e9tabli ainsi qu\u2019il suit les statuts de la soci\u00e9t\u00e9 en commandite simple devant exister entre eux."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est form\u00e9 entre les soussign\u00e9s une soci\u00e9t\u00e9 en commandite simple qui sera r\u00e9gie par l\u2019Acte Uniforme de l\u2019OHADA relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE, et par les pr\u00e9sents statuts."),
    t("Les associ\u00e9s commandit\u00e9s ont la qualit\u00e9 de commer\u00e7ant et r\u00e9pondent ind\u00e9finiment et solidairement des dettes sociales. Les associ\u00e9s commanditaires ne sont responsables des dettes sociales qu\u2019\u00e0 concurrence de leurs apports."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Objet"),
    t("La soci\u00e9t\u00e9 a pour objet, {objet_social}."),
    t("Et, g\u00e9n\u00e9ralement, toutes op\u00e9rations pouvant se rattacher directement ou indirectement \u00e0 l\u2019objet ci-dessus."),
    p(""),

    // ARTICLE 3
    b("Article 3 : D\u00e9nomination"),
    t("La soci\u00e9t\u00e9 a pour d\u00e9nomination sociale \u00ab {denomination} \u00bb."),
    t("La d\u00e9nomination sociale ne peut comporter le nom d\u2019un commanditaire. Le commanditaire qui tol\u00e8re l\u2019insertion de son nom dans la d\u00e9nomination sociale devient solidairement responsable des engagements de la soci\u00e9t\u00e9."),
    t("La d\u00e9nomination sociale doit \u00eatre pr\u00e9c\u00e9d\u00e9e ou suivie de la mention \u00ab Soci\u00e9t\u00e9 en Commandite Simple \u00bb ou \u00ab SCS \u00bb."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Si\u00e8ge social"),
    t("Le si\u00e8ge social est fix\u00e9 \u00e0 {siege_social}, {ville}, {pays}."),
    t("Il peut \u00eatre transf\u00e9r\u00e9 en tout autre lieu par d\u00e9cision unanime des associ\u00e9s."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Dur\u00e9e"),
    t("La dur\u00e9e de la soci\u00e9t\u00e9 est de {duree} ann\u00e9es."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Apports"),
    t("Lors de la constitution, les soussign\u00e9s font apport \u00e0 la soci\u00e9t\u00e9 :"),
    p(""),
    b("Apports des commandit\u00e9s :"),
    t("{#commandites}"),
    t("{civilite} {prenom} {nom} : FCFA {apport}"),
    t("{/commandites}"),
    b("Total apports commandit\u00e9s : FCFA {total_apports_commandites}"),
    p(""),
    b("Apports des commanditaires :"),
    t("{#commanditaires}"),
    t("{civilite} {prenom} {nom} : FCFA {apport}"),
    t("{/commanditaires}"),
    b("Total apports commanditaires : FCFA {total_apports_commanditaires}"),
    p(""),
    b("Total des apports : FCFA {total_apports}"),
    p(""),

    // ARTICLE 7
    b("Article 7 : Capital social"),
    t("Le capital social est fix\u00e9 \u00e0 {capital} {devise} ({capital_lettres} francs CFA), divis\u00e9 en {nombre_parts} parts de {valeur_nominale} {devise} chacune, r\u00e9parties comme suit :"),
    p(""),
    b("Parts des commandit\u00e9s :"),
    t("{#commandites}"),
    t("- \u00c0 {civilite} {prenom} {nom} : {parts} parts, num\u00e9rot\u00e9es de {numero_debut} \u00e0 {numero_fin} ;"),
    t("{/commandites}"),
    p(""),
    b("Parts des commanditaires :"),
    t("{#commanditaires}"),
    t("- \u00c0 {civilite} {prenom} {nom} : {parts} parts, num\u00e9rot\u00e9es de {numero_debut} \u00e0 {numero_fin} ;"),
    t("{/commanditaires}"),
    p(""),

    // ARTICLE 8
    b("Article 8 : Modification du capital"),
    t("Le capital social peut \u00eatre augment\u00e9 ou r\u00e9duit par d\u00e9cision unanime des associ\u00e9s."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Parts sociales"),
    t("Les parts sociales ne peuvent \u00eatre repr\u00e9sent\u00e9es par des titres n\u00e9gociables."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Cession des parts"),
    t("Les parts des commandit\u00e9s ne peuvent \u00eatre c\u00e9d\u00e9es qu\u2019avec le consentement unanime de tous les associ\u00e9s."),
    t("Les parts des commanditaires peuvent \u00eatre c\u00e9d\u00e9es avec le consentement de tous les commandit\u00e9s et de la majorit\u00e9 en nombre et en capital des commanditaires."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Transmission par d\u00e9c\u00e8s"),
    t("La soci\u00e9t\u00e9 prend fin par le d\u00e9c\u00e8s d\u2019un commandit\u00e9, \u00e0 moins que les statuts ne pr\u00e9voient la continuation avec les associ\u00e9s survivants ou les h\u00e9ritiers. Le d\u00e9c\u00e8s d\u2019un commanditaire n\u2019entra\u00eene pas la dissolution de la soci\u00e9t\u00e9."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Droits des commandit\u00e9s"),
    t("Les commandit\u00e9s ont la qualit\u00e9 de commer\u00e7ant. Ils r\u00e9pondent ind\u00e9finiment et solidairement des dettes sociales. Un cr\u00e9ancier de la soci\u00e9t\u00e9 ne peut poursuivre le paiement des dettes sociales contre un commandit\u00e9 qu\u2019apr\u00e8s mise en demeure adress\u00e9e \u00e0 la soci\u00e9t\u00e9 rest\u00e9e sans effet."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Droits des commanditaires"),
    t("Les commanditaires ne sont tenus qu\u2019\u00e0 concurrence de leurs apports. Ils ne peuvent faire aucun acte de gestion vis-\u00e0-vis des tiers, m\u00eame en vertu d\u2019une procuration. En cas de contravention \u00e0 cette interdiction, le commanditaire est tenu solidairement avec les commandit\u00e9s des dettes et engagements de la soci\u00e9t\u00e9 qui r\u00e9sultent des actes prohib\u00e9s. Toutefois, le commanditaire peut donner des avis et des conseils, effectuer des actes de contr\u00f4le et de surveillance et autoriser certaines op\u00e9rations."),
    p(""),

    // ARTICLE 14
    b("Article 14 : G\u00e9rance"),
    t("La soci\u00e9t\u00e9 est g\u00e9r\u00e9e par un ou plusieurs g\u00e9rants choisis parmi les associ\u00e9s commandit\u00e9s ou en dehors des associ\u00e9s. Le commanditaire ne peut \u00eatre g\u00e9rant."),
    t(""),
    t("Est nomm\u00e9 g\u00e9rant : {gerant_civilite} {gerant_prenom} {gerant_nom}, n\u00e9(e) le {gerant_date_naissance} \u00e0 {gerant_lieu_naissance}, de nationalit\u00e9 {gerant_nationalite}, demeurant \u00e0 {gerant_adresse}, qui accepte."),
    p(""),
    t("Le g\u00e9rant est nomm\u00e9 pour une dur\u00e9e de {gerant_duree_mandat}. Il est toujours r\u00e9\u00e9ligible."),
    p(""),
    t("Le g\u00e9rant statutaire commandit\u00e9 ne peut \u00eatre r\u00e9voqu\u00e9 qu\u2019\u00e0 l\u2019unanimit\u00e9 des autres associ\u00e9s. Le g\u00e9rant non statutaire est r\u00e9vocable dans les conditions pr\u00e9vues par les statuts ou par d\u00e9cision unanime des associ\u00e9s."),
    p(""),
    t("Dans les rapports avec les tiers, le g\u00e9rant engage la soci\u00e9t\u00e9 par les actes entrant dans l\u2019objet social."),
    p(""),
    t("La r\u00e9mun\u00e9ration du g\u00e9rant est {gerant_remuneration}."),
    p(""),

    // ARTICLE 15
    b("Article 15 : Exercice social"),
    t("L\u2019exercice social commence le {exercice_debut} et se termine le {exercice_fin} de chaque ann\u00e9e. Par exception, le premier exercice sera clos le {premier_exercice_fin}."),
    p(""),

    // ARTICLE 16
    b("Article 16 : D\u00e9cisions collectives"),
    t("Les d\u00e9cisions qui exc\u00e8dent les pouvoirs du g\u00e9rant sont prises \u00e0 l\u2019unanimit\u00e9 des associ\u00e9s, y compris les commanditaires."),
    t("La modification des statuts ne peut \u00eatre d\u00e9cid\u00e9e qu\u2019\u00e0 l\u2019unanimit\u00e9 des associ\u00e9s."),
    t("Les commanditaires disposent du droit de vote pour la nomination et la r\u00e9vocation du g\u00e9rant non commandit\u00e9 et pour l\u2019approbation des comptes."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Comptes sociaux"),
    t("A la cl\u00f4ture de chaque exercice, le g\u00e9rant \u00e9tablit et arr\u00eate les \u00e9tats financiers de synth\u00e8se et un rapport de gestion. Les comptes doivent \u00eatre approuv\u00e9s dans les six mois de la cl\u00f4ture de l\u2019exercice."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Affectation des r\u00e9sultats"),
    t("Apr\u00e8s approbation des comptes, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9termine la r\u00e9partition des b\u00e9n\u00e9fices entre les associ\u00e9s."),
    t("Il est pratiqu\u00e9 une dotation \u00e0 la r\u00e9serve l\u00e9gale d\u2019un dixi\u00e8me au moins, qui cesse d\u2019\u00eatre obligatoire lorsqu\u2019elle atteint le cinqui\u00e8me du capital."),
    p(""),

    // ARTICLE 19
    b("Article 19 : Droit d\u2019information des commanditaires"),
    t("Les commanditaires ont le droit d\u2019obtenir communication des livres et documents sociaux et de poser des questions par \u00e9crit au g\u00e9rant sur la gestion sociale."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Commissaire aux comptes"),
    t("Les associ\u00e9s peuvent nommer un commissaire aux comptes. Cette d\u00e9signation est obligatoire si les seuils fix\u00e9s par l\u2019Acte Uniforme sont atteints."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Dissolution"),
    t("La soci\u00e9t\u00e9 en commandite simple est dissoute pour les causes communes \u00e0 toutes les soci\u00e9t\u00e9s et en outre :"),
    t("- par le d\u00e9c\u00e8s d\u2019un commandit\u00e9, sauf clause de continuation ;"),
    t("- par la r\u00e9vocation du g\u00e9rant statutaire commandit\u00e9, sauf d\u00e9cision unanime de continuation ;"),
    t("- lorsqu\u2019il ne reste plus qu\u2019un seul commandit\u00e9 ou un seul commanditaire sans r\u00e9gularisation dans un d\u00e9lai d\u2019un an."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Liquidation"),
    t("La dissolution entra\u00eene la mise en liquidation. Le boni de liquidation est r\u00e9parti entre les associ\u00e9s au prorata de leurs parts."),
    p(""),

    // ARTICLE 23
    b("Article 23 : Contestations"),
    t("Les contestations relatives aux affaires sociales sont soumises au tribunal charg\u00e9 des affaires commerciales."),
    p(""),

    // ARTICLE 24
    b("Article 24 : Frais"),
    t("Les frais, droits et honoraires des pr\u00e9sents statuts sont \u00e0 la charge de la soci\u00e9t\u00e9."),
    p(""), p(""),

    // SIGNATURE
    p("Fait \u00e0 {lieu_signature}, le {date_signature}.", false, 24, true),
    p(""), p("Signature de chaque associ\u00e9 avec mention \u00ab Lu et approuv\u00e9 \u00bb", false, 24, true, true), p(""),
    b("Commandit\u00e9(s) :"),
    t("{#commandites}"),
    p("{civilite} {prenom} {nom}", false, 24, true), p(""),
    t("{/commandites}"),
    b("Commanditaire(s) :"),
    t("{#commanditaires}"),
    p("{civilite} {prenom} {nom}", false, 24, true), p(""),
    t("{/commanditaires}"),
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

  const outputDir = path.join(__dirname, "../templates/scs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
