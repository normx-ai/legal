/**
 * Script pour cr\u00e9er le template DOCX des statuts SNC OHADA
 * Mod\u00e8le 1 du Guide Pratique des Soci\u00e9t\u00e9s Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-snc-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">{denomination}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 en Nom Collectif au capital de {capital} {devise}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}, {ville}, {pays}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Paraphes : _____ / _____</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SNC \u2014 {denomination}</w:t></w:r>
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
    p("{denomination}", true, 36, true),
    p("", false, 24, true),
    p("Soci\u00e9t\u00e9 en Nom Collectif", false, 28, true),
    p("Au capital de {capital} {devise}", false, 24, true),
    p("", false, 24, true),
    p("Si\u00e8ge social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true),
    p("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", false, 24, true),
    p("", false, 24, true),
    p("STATUTS", true, 36, true),
    p("", false, 24, true),
    p("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", false, 24, true),
    p("", false, 24, true),
    p("\u00c9tablis le {date_signature}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),

    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("STATUTS - SOCI\u00c9T\u00c9 EN NOM COLLECTIF"),
    c("\u00ab SNC \u00bb"),
    p(""),

    // PR\u00c9AMBULE
    t("Entre les soussign\u00e9s :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom}, n\u00e9(e) le {date_naissance} \u00e0 {lieu_naissance}, de nationalit\u00e9 {nationalite}, {profession}, demeurant \u00e0 {adresse} ;"),
    t("{/associes}"),
    p(""),
    t("Il est \u00e9tabli ainsi qu\u2019il suit les statuts de la soci\u00e9t\u00e9 en nom collectif devant exister entre eux."),
    t("Tous les associ\u00e9s ont la qualit\u00e9 de commer\u00e7ant et r\u00e9pondent ind\u00e9finiment et solidairement des dettes sociales."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est form\u00e9 entre les soussign\u00e9s une soci\u00e9t\u00e9 en nom collectif qui sera r\u00e9gie par l\u2019Acte Uniforme de l\u2019OHADA relatif au droit des soci\u00e9t\u00e9s commerciales et du GIE, et par toutes autres dispositions l\u00e9gales et r\u00e9glementaires compl\u00e9mentaires ou modificatives et par les pr\u00e9sents statuts."),
    t("Tous les associ\u00e9s ont la qualit\u00e9 de commer\u00e7ant et r\u00e9pondent ind\u00e9finiment et solidairement des dettes sociales."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Objet"),
    t("La soci\u00e9t\u00e9 a pour objet, {objet_social}."),
    t("Et, g\u00e9n\u00e9ralement, toutes op\u00e9rations financi\u00e8res, commerciales, industrielles, mobili\u00e8res et immobili\u00e8res, pouvant se rattacher directement ou indirectement \u00e0 l\u2019objet ci-dessus ou \u00e0 tous objets similaires ou connexes."),
    p(""),

    // ARTICLE 3
    b("Article 3 : D\u00e9nomination"),
    t("La soci\u00e9t\u00e9 a pour d\u00e9nomination sociale \u00ab {denomination} \u00bb."),
    t("La d\u00e9nomination sociale doit figurer sur tous les actes et documents \u00e9manant de la soci\u00e9t\u00e9 et destin\u00e9s aux tiers. Elle doit \u00eatre pr\u00e9c\u00e9d\u00e9e ou suivie imm\u00e9diatement de la mention \u00ab Soci\u00e9t\u00e9 en Nom Collectif \u00bb ou du sigle \u00ab SNC \u00bb, du montant de son capital social, de l\u2019adresse de son si\u00e8ge social et de la mention de son immatriculation au registre du commerce et du cr\u00e9dit mobilier."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Si\u00e8ge social"),
    t("Le si\u00e8ge social est fix\u00e9 \u00e0 {siege_social}, {ville}, {pays}."),
    t("Il peut \u00eatre transf\u00e9r\u00e9 en tout autre lieu par d\u00e9cision unanime des associ\u00e9s."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Dur\u00e9e"),
    t("La dur\u00e9e de la soci\u00e9t\u00e9 est de {duree} ann\u00e9es, sauf dissolution anticip\u00e9e ou prorogation."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Apports"),
    t("Lors de la constitution, les soussign\u00e9s font apport \u00e0 la soci\u00e9t\u00e9, savoir :"),
    p(""),
    t("{#associes}"),
    t("{civilite} {prenom} {nom} : FCFA {apport}"),
    t("{/associes}"),
    p(""),
    b("Total des apports : FCFA {total_apports}."),
    p(""),
    t("{#has_apports_nature}"),
    b("Apports en nature :"),
    t("Les apports en nature ont \u00e9t\u00e9 \u00e9valu\u00e9s \u00e0 l\u2019unanimit\u00e9 des associ\u00e9s conform\u00e9ment aux dispositions l\u00e9gales."),
    t("{/has_apports_nature}"),
    p(""),
    t("{#has_apports_industrie}"),
    b("Apports en industrie :"),
    t("Les apports en industrie ne concourent pas \u00e0 la formation du capital social mais donnent lieu \u00e0 l\u2019attribution de parts sociales. L\u2019apporteur en industrie s\u2019engage \u00e0 r\u00e9server l\u2019exclusivit\u00e9 de son activit\u00e9 \u00e0 la soci\u00e9t\u00e9."),
    t("{/has_apports_industrie}"),
    p(""),

    // ARTICLE 7
    b("Article 7 : Capital social"),
    t("Le capital social est fix\u00e9 \u00e0 la somme de {capital} {devise} ({capital_lettres} francs CFA), divis\u00e9 en {nombre_parts} parts de {valeur_nominale} {devise} chacune, attribu\u00e9es aux associ\u00e9s, savoir :"),
    p(""),
    t("{#associes}"),
    t("- \u00c0 {civilite} {prenom} {nom}, \u00e0 concurrence de {parts} parts, num\u00e9rot\u00e9es de {numero_debut} \u00e0 {numero_fin}, en r\u00e9mun\u00e9ration de son apport en {type_apport} ci-dessus ;"),
    t("{/associes}"),
    p(""),
    b("\u00c9gal au nombre de parts composant le capital social : {nombre_parts} parts."),
    p(""),

    // ARTICLE 8
    b("Article 8 : Modification du capital"),
    t("Le capital social peut \u00eatre augment\u00e9 ou r\u00e9duit par d\u00e9cision unanime des associ\u00e9s, dans les conditions pr\u00e9vues par l\u2019Acte Uniforme."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Repr\u00e9sentation des parts"),
    t("Les parts sociales ne peuvent \u00eatre repr\u00e9sent\u00e9es par des titres n\u00e9gociables. Les droits de chaque associ\u00e9 dans la soci\u00e9t\u00e9 r\u00e9sultent des statuts, des actes modificatifs ult\u00e9rieurs et des cessions de parts r\u00e9guli\u00e8rement notifi\u00e9es et publi\u00e9es."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Transmission des parts sociales"),
    t(""),
    b("1. Cession entre vifs"),
    t("Les parts sociales ne peuvent \u00eatre c\u00e9d\u00e9es qu\u2019avec le consentement unanime de tous les associ\u00e9s. Toute cession doit \u00eatre constat\u00e9e par \u00e9crit."),
    p(""),
    t("La cession n\u2019est opposable \u00e0 la soci\u00e9t\u00e9 qu\u2019apr\u00e8s signification \u00e0 la soci\u00e9t\u00e9 ou acceptation de la cession dans un acte authentique, ou d\u00e9p\u00f4t d\u2019un original de l\u2019acte de cession au si\u00e8ge social."),
    p(""),
    b("2. Transmission par d\u00e9c\u00e8s"),
    t("La soci\u00e9t\u00e9 prend fin par le d\u00e9c\u00e8s de l\u2019un des associ\u00e9s, \u00e0 moins que les statuts ne pr\u00e9voient la continuation de la soci\u00e9t\u00e9 soit avec les associ\u00e9s survivants, soit avec un ou plusieurs h\u00e9ritiers ou tout tiers d\u00e9sign\u00e9 par les statuts."),
    t("En cas de continuation avec les associ\u00e9s survivants, les h\u00e9ritiers auront droit \u00e0 la valeur des parts sociales de leur auteur \u00e9valu\u00e9es au jour du d\u00e9c\u00e8s."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Liquidation judiciaire d\u2019un associ\u00e9"),
    t("La soci\u00e9t\u00e9 prend fin par la liquidation judiciaire de l\u2019un des associ\u00e9s, \u00e0 moins que les autres associ\u00e9s ne d\u00e9cident la continuation de la soci\u00e9t\u00e9 entre eux."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Indivisibilit\u00e9 des parts"),
    t("Chaque part est indivisible \u00e0 l\u2019\u00e9gard de la soci\u00e9t\u00e9. Les copropri\u00e9taires indivis de parts sociales doivent se faire repr\u00e9senter par un mandataire unique choisi parmi eux ou en dehors d\u2019eux."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Droits et obligations des associ\u00e9s"),
    t(""),
    b("1. B\u00e9n\u00e9fices"),
    t("Chaque associ\u00e9 participe aux b\u00e9n\u00e9fices et contribue aux pertes proportionnellement au nombre de parts qu\u2019il poss\u00e8de, sauf stipulation contraire des statuts."),
    p(""),
    b("2. Approbation des comptes"),
    t("Les comptes de chaque exercice sont soumis \u00e0 l\u2019approbation de tous les associ\u00e9s dans les six mois de la cl\u00f4ture de l\u2019exercice."),
    p(""),
    b("3. Droit d\u2019information"),
    t("Chaque associ\u00e9 a le droit d\u2019obtenir communication des livres et documents sociaux et de poser des questions par \u00e9crit au g\u00e9rant."),
    p(""),
    b("4. Adh\u00e9sion aux statuts"),
    t("Chaque associ\u00e9 adh\u00e8re sans r\u00e9serve aux pr\u00e9sents statuts, et notamment aux clauses relatives \u00e0 la responsabilit\u00e9 solidaire et ind\u00e9finie."),
    p(""),
    b("5. Obligation au passif"),
    t("Les associ\u00e9s r\u00e9pondent ind\u00e9finiment et solidairement des dettes sociales. Les cr\u00e9anciers de la soci\u00e9t\u00e9 ne peuvent poursuivre le paiement des dettes sociales contre un associ\u00e9 qu\u2019apr\u00e8s mise en demeure adress\u00e9e \u00e0 la soci\u00e9t\u00e9 rest\u00e9e sans effet."),
    p(""),
    b("6. Non-concurrence"),
    t("Aucun associ\u00e9 ne peut, sans le consentement unanime des autres associ\u00e9s, exercer une activit\u00e9 concurrente de celle de la soci\u00e9t\u00e9, que ce soit pour son compte ou pour le compte d\u2019un tiers."),
    p(""),

    // ARTICLE 14
    b("Article 14 : G\u00e9rance"),
    t(""),
    b("1. Nomination"),
    t("La soci\u00e9t\u00e9 est g\u00e9r\u00e9e par un ou plusieurs g\u00e9rants, personnes physiques, choisis parmi les associ\u00e9s ou en dehors d\u2019eux. Est nomm\u00e9 g\u00e9rant de la soci\u00e9t\u00e9 :"),
    t("{gerant_civilite} {gerant_prenom} {gerant_nom}, n\u00e9(e) le {gerant_date_naissance} \u00e0 {gerant_lieu_naissance}, de nationalit\u00e9 {gerant_nationalite}, demeurant \u00e0 {gerant_adresse}, qui accepte."),
    p(""),
    b("2. Dur\u00e9e du mandat"),
    t("Le g\u00e9rant est nomm\u00e9 pour une dur\u00e9e de {gerant_duree_mandat}. Il est toujours r\u00e9\u00e9ligible."),
    p(""),
    b("3. R\u00e9vocation"),
    t("Le g\u00e9rant statutaire ne peut \u00eatre r\u00e9voqu\u00e9 qu\u2019\u00e0 l\u2019unanimit\u00e9 des autres associ\u00e9s, \u00e0 moins d\u2019une d\u00e9cision judiciaire pour cause l\u00e9gitime. La r\u00e9vocation d\u2019un g\u00e9rant statutaire associ\u00e9 entra\u00eene la dissolution de la soci\u00e9t\u00e9, \u00e0 moins que sa continuation ne soit pr\u00e9vue par les statuts ou d\u00e9cid\u00e9e \u00e0 l\u2019unanimit\u00e9 des autres associ\u00e9s."),
    t("Le g\u00e9rant non statutaire est r\u00e9vocable dans les conditions pr\u00e9vues par les statuts ou, \u00e0 d\u00e9faut, par d\u00e9cision unanime des associ\u00e9s."),
    p(""),
    b("4. D\u00e9mission"),
    t("Le g\u00e9rant peut d\u00e9missionner de son mandat en pr\u00e9venant chacun des associ\u00e9s au moins trois mois \u00e0 l\u2019avance par lettre recommand\u00e9e."),
    p(""),
    b("5. Pouvoirs"),
    t("Dans les rapports entre associ\u00e9s, le g\u00e9rant peut faire tous les actes de gestion dans l\u2019int\u00e9r\u00eat de la soci\u00e9t\u00e9. En cas de pluralit\u00e9 de g\u00e9rants, chacun d\u00e9tient s\u00e9par\u00e9ment le pouvoir de faire tout acte de gestion dans l\u2019int\u00e9r\u00eat de la soci\u00e9t\u00e9."),
    t("Dans les rapports avec les tiers, le g\u00e9rant engage la soci\u00e9t\u00e9 par les actes entrant dans l\u2019objet social. Les clauses statutaires limitant les pouvoirs du g\u00e9rant sont inopposables aux tiers."),
    p(""),
    b("6. R\u00e9mun\u00e9ration"),
    t("La r\u00e9mun\u00e9ration du g\u00e9rant est {gerant_remuneration}."),
    p(""),
    b("7. Responsabilit\u00e9"),
    t("Les g\u00e9rants sont responsables individuellement ou solidairement envers la soci\u00e9t\u00e9 ou envers les tiers, soit des infractions aux dispositions l\u00e9gislatives ou r\u00e9glementaires applicables, soit des violations des statuts, soit des fautes commises dans leur gestion."),
    p(""),

    // ARTICLE 15
    b("Article 15 : Exercice social"),
    t("L\u2019exercice social commence le {exercice_debut} et se termine le {exercice_fin} de chaque ann\u00e9e. Par exception, le premier exercice sera clos le {premier_exercice_fin}."),
    p(""),

    // ARTICLE 16
    b("Article 16 : D\u00e9cisions collectives"),
    t("Les d\u00e9cisions qui exc\u00e8dent les pouvoirs du g\u00e9rant sont prises \u00e0 l\u2019unanimit\u00e9 des associ\u00e9s, sauf disposition l\u00e9gale contraire."),
    t("La modification des statuts ne peut \u00eatre d\u00e9cid\u00e9e qu\u2019\u00e0 l\u2019unanimit\u00e9 des associ\u00e9s."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Assembl\u00e9es"),
    t("Les associ\u00e9s se r\u00e9unissent en assembl\u00e9e sur convocation du g\u00e9rant, ou de tout associ\u00e9. La convocation est faite par lettre recommand\u00e9e avec demande d\u2019avis de r\u00e9ception adress\u00e9e \u00e0 chacun des associ\u00e9s quinze jours au moins avant la r\u00e9union."),
    t("Les d\u00e9cisions peuvent \u00e9galement \u00eatre prises par consultation \u00e9crite."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Comptes sociaux"),
    t("A la cl\u00f4ture de chaque exercice, le g\u00e9rant \u00e9tablit et arr\u00eate les \u00e9tats financiers de synth\u00e8se. Il \u00e9tablit un rapport de gestion."),
    t("Une assembl\u00e9e g\u00e9n\u00e9rale appel\u00e9e \u00e0 statuer sur les comptes de l\u2019exercice \u00e9coul\u00e9 doit \u00eatre r\u00e9unie chaque ann\u00e9e dans les six mois de la cl\u00f4ture de l\u2019exercice."),
    p(""),

    // ARTICLE 19
    b("Article 19 : Affectation des r\u00e9sultats"),
    t("Apr\u00e8s approbation des comptes et constatation de l\u2019existence d\u2019un b\u00e9n\u00e9fice distribuable, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9termine la part attribu\u00e9e aux associ\u00e9s sous forme de dividende."),
    t("Il est pratiqu\u00e9 sur le b\u00e9n\u00e9fice de l\u2019exercice, diminu\u00e9 des pertes ant\u00e9rieures, une dotation \u00e9gale \u00e0 un dixi\u00e8me au moins affect\u00e9e \u00e0 la r\u00e9serve l\u00e9gale. Cette dotation cesse d\u2019\u00eatre obligatoire lorsque la r\u00e9serve atteint le cinqui\u00e8me du capital social."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Comptes courants"),
    t("Les associ\u00e9s peuvent laisser ou mettre \u00e0 disposition de la soci\u00e9t\u00e9 toutes sommes dont celle-ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur r\u00e9mun\u00e9ration, sont d\u00e9termin\u00e9es par d\u00e9cision unanime des associ\u00e9s."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Variation des capitaux propres"),
    t("Si du fait des pertes constat\u00e9es dans les \u00e9tats financiers de synth\u00e8se, les capitaux propres deviennent inf\u00e9rieurs \u00e0 la moiti\u00e9 du capital social, les associ\u00e9s doivent d\u00e9cider dans les quatre mois s\u2019il y a lieu \u00e0 dissolution anticip\u00e9e."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Commissaire aux comptes"),
    t("Les associ\u00e9s peuvent nommer un commissaire aux comptes. La d\u00e9signation d\u2019un commissaire aux comptes est obligatoire si le chiffre d\u2019affaires annuel exc\u00e8de les seuils fix\u00e9s par l\u2019Acte Uniforme."),
    p(""),

    // ARTICLE 23
    b("Article 23 : Dissolution"),
    t("La soci\u00e9t\u00e9 en nom collectif est dissoute pour les causes communes \u00e0 toutes les soci\u00e9t\u00e9s et en outre :"),
    t("- par le d\u00e9c\u00e8s de l\u2019un des associ\u00e9s, sous r\u00e9serve des dispositions de l\u2019article 10 ci-dessus ;"),
    t("- par la r\u00e9vocation du g\u00e9rant statutaire associ\u00e9, sauf d\u00e9cision unanime de continuation ;"),
    t("- par la liquidation judiciaire de l\u2019un des associ\u00e9s, sauf d\u00e9cision unanime de continuation ;"),
    t("- par l\u2019interdiction d\u2019exercer une activit\u00e9 commerciale, l\u2019incapacit\u00e9 ou le d\u00e9c\u00e8s d\u2019un associ\u00e9, sauf clause de continuation."),
    p(""),

    // ARTICLE 24
    b("Article 24 : Liquidation"),
    t("La dissolution de la soci\u00e9t\u00e9 entra\u00eene sa mise en liquidation. Le ou les g\u00e9rants en fonction lors de la dissolution exercent les fonctions de liquidateurs."),
    t("Le boni de liquidation est r\u00e9parti entre les associ\u00e9s au prorata du nombre de parts qu\u2019ils d\u00e9tiennent."),
    p(""),

    // ARTICLE 25
    b("Article 25 : Contestations"),
    t("Les contestations relatives aux affaires sociales survenant pendant la dur\u00e9e de la soci\u00e9t\u00e9 ou au cours de sa liquidation, entre les associ\u00e9s ou entre les associ\u00e9s et la soci\u00e9t\u00e9, sont soumises au tribunal charg\u00e9 des affaires commerciales."),
    p(""),

    // ARTICLE 26
    b("Article 26 : Frais"),
    t("Les frais, droits et honoraires des pr\u00e9sents statuts sont \u00e0 la charge de la soci\u00e9t\u00e9."),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait \u00e0 {lieu_signature}, le {date_signature} en {nombre_associes} originaux.", false, 24, true),
    p(""),
    p("Signature de chaque associ\u00e9 avec mention \u00ab Lu et approuv\u00e9 \u00bb", false, 24, true, true),
    p(""),
    t("{#associes}"),
    p("{civilite} {prenom} {nom}", false, 24, true),
    p(""),
    t("{/associes}"),
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

  const outputDir = path.join(__dirname, "../templates/snc");
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
