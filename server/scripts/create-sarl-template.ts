/**
 * Script pour créer le template DOCX des statuts SARL OHADA
 * Basé sur le modèle officiel du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-sarl-template.ts
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

  // En-tête : infos légales de la société
  zip.file("word/header1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">{denomination}</w:t></w:r>
  </w:p>
  <w:p>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 \u00E0 Responsabilit\u00E9 Limit\u00E9e au capital de {capital} {devise}</w:t></w:r>
  </w:p>
  <w:p>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}, {ville}, {pays}</w:t></w:r>
  </w:p>
</w:hdr>`);

  // Pied de page : numéro de page + paraphes
  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr><w:spacing w:before="120"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>
  </w:p>
  <w:p>
    <w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Paraphes : _____ / _____</w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SARL \u2014 {denomination}</w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">Page </w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:instrText> PAGE </w:instrText></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>1</w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve"> / </w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:instrText> NUMPAGES </w:instrText></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>1</w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
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

// Raccourcis
const t = (text: string) => p(text);
const b = (text: string) => p(text, true);
const c = (text: string) => p(text, true, 28, true);
const it = (text: string) => p(text, false, 24, false, true);

function createTemplate() {
  const zip = createEmptyDocx();

  const body = [
    // PAGE DE GARDE
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("{denomination}", true, 36, true),
    p("", false, 24, true),
    p("Société à Responsabilité Limitée", false, 28, true),
    p("Au capital de {capital} {devise}", false, 24, true),
    p("", false, 24, true),
    p("Siège social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("", false, 24, true),
    p("STATUTS", true, 36, true),
    p("", false, 24, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("Établis le {date_signature}", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),

    // Saut de page
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("STATUTS - SOCIÉTÉ À RESPONSABILITÉ LIMITÉE"),
    c("« SARL »"),
    p(""),

    // PRÉAMBULE
    t("Entre les soussignés :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, {profession}, demeurant à {adresse} ;"),
    t("{/associes}"),
    p(""),
    t("Il est établi ainsi qu'il suit les statuts de la société à responsabilité limitée devant exister entre eux et tous autres propriétaires de parts qui pourraient entrer dans la société ultérieurement."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé entre les soussignés une société à responsabilité limitée qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE, et par toutes autres dispositions légales et réglementaires complémentaires ou modificatives et par les présents statuts."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Dénomination"),
    t("La société a pour dénomination sociale « {denomination} »."),
    t("{#has_sigle}Éventuellement : Son sigle est : {sigle}.{/has_sigle}"),
    t("La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie immédiatement en caractères lisibles de l'indication de la forme de la société, du montant de son capital social, de l'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du crédit mobilier."),
    p(""),

    // ARTICLE 3
    b("Article 3 : Objet"),
    t("La société a pour objet, {objet_social}."),
    t("Et, généralement, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, pouvant se rattacher directement ou indirectement à l'objet ci-dessus ou à tous objets similaires ou connexes."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Siège social"),
    t("Le siège social est fixé à {siege_social}, {ville}, {pays}."),
    t("Il peut être transféré dans les limites du territoire d'un même État partie par décision de la gérance qui modifie en conséquence les statuts, sous réserve de la ratification de cette décision par la plus prochaine assemblée générale ordinaire."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Durée"),
    t("La durée de la société est de {duree} années, sauf dissolution anticipée ou prorogation."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Exercice social"),
    t("L'exercice social commence le {exercice_debut} et se termine le {exercice_fin} de chaque année."),
    p(""),
    t("Par exception, le premier exercice sera clos le {premier_exercice_fin}."),
    p(""),

    // ARTICLE 7
    b("Article 7 : Apports"),
    t("Lors de la constitution, les soussignés font apport à la société, savoir :"),
    p(""),

    // I - Apports en numéraire
    t("{#associes}"),
    t("{civilite} {prenom} {nom} : FCFA {apport}"),
    t("{/associes}"),
    p(""),
    b("Total de l'apport en numéraire : FCFA {total_apports_numeraire}."),
    p(""),
    t("Les apports en numéraire de FCFA {total_apports_numeraire} correspondent à {nombre_parts} parts de FCFA {valeur_nominale} chacune, souscrites et libérées ({mode_liberation}) des parts sociales ainsi qu'il résulte du certificat du dépositaire établi le {date_certificat_depot} par {nom_depositaire}."),
    p(""),
    t("Les sommes correspondantes ont été déposées, pour le compte de la société, à {lieu_depot}."),
    p(""),
    t("{#is_liberation_partielle}La libération du surplus soit FCFA {montant_surplus} par part sociale, interviendra en une ou plusieurs fois dans un délai de deux (2) ans à compter de l'immatriculation de la société au registre de commerce et du crédit mobilier.{/is_liberation_partielle}"),
    p(""),

    // II - Apports en nature
    t("{#has_apports_nature}"),
    b("II - Apports en nature et/ou stipulation d'avantages particuliers"),
    p(""),
    t("{#associes_nature}"),
    t("{civilite} {prenom} {nom}, en s'obligeant à toutes les garanties ordinaires et de droit, fait apport à la société de {description_apport_nature}."),
    p(""),
    t("{/associes_nature}"),
    p(""),
    t("{#has_commissaire_apports}Il a été procédé à l'évaluation de chacun des apports en nature ci-dessus au vu du rapport annexé aux présents statuts, établi par {commissaire_apports_nom}, commissaire aux apports désigné à l'unanimité des futurs associés (ou : désigné par ordonnance de M. le président du tribunal chargé des affaires commerciales de {ville_tribunal}, en date du {date_ordonnance}, à la requête de {requerant_nom}).{/has_commissaire_apports}"),
    p(""),
    t("{#sans_commissaire_apports}Aucun des apports en nature n'ayant une valeur supérieure à 5 000 000 FCFA et la valeur totale desdits apports n'excédant pas la moitié du capital, les associés, à l'unanimité, ont décidé de ne pas recourir à un commissaire aux apports et ont procédé eux-mêmes à l'évaluation.{/sans_commissaire_apports}"),
    p(""),
    t("{#associes_nature}"),
    t("En rémunération de son apport, évalué à FCFA {montant_apport_nature}, {civilite} {prenom} {nom} se voit attribuer {parts_nature} parts sociales."),
    t("{/associes_nature}"),
    p(""),
    t("{/has_apports_nature}"),

    // III - Récapitulation des apports
    b("III - Récapitulation des apports"),
    t("- Apports en numéraire : FCFA {total_apports_numeraire}"),
    t("{#has_apports_nature}- Apports en nature : FCFA {total_apports_nature}{/has_apports_nature}"),
    b("Total des apports : FCFA {total_apports}"),
    p(""),

    // IV - Apports en industrie
    t("{#has_apports_industrie}"),
    b("IV - Apports en industrie"),
    t("Les apports en industrie réalisés par la mise à disposition effective de connaissances techniques ou professionnelles ou de services sont ainsi décrits :"),
    p(""),
    t("{#associes_industrie}"),
    t("{civilite} {prenom} {nom} : {description_apport_industrie}."),
    t("{/associes_industrie}"),
    p(""),
    t("L'apporteur s'engage à réserver l'exclusivité de cet apport à la société et s'interdit d'exercer directement ou indirectement toute activité concurrente relative à cet apport."),
    p(""),
    t("Ces apports ne sont pas pris en compte pour la formation du capital social mais donnent lieu à l'attribution de parts sociales ouvrant droit au vote et au partage de bénéfice et de l'actif net, à charge de contribuer aux pertes."),
    p(""),
    t("Les parts sociales représentatives d'apports en industrie sont attribuées à titre personnel. Elles ne peuvent être cédées et sont annulées en cas de décès de leur titulaire comme en cas de cessation des prestations dues par ledit titulaire."),
    p(""),
    t("{/has_apports_industrie}"),

    // ARTICLE 8
    b("Article 8 : Capital social"),
    t("Le capital social est fixé à la somme de {capital} {devise} ({capital_lettres} francs CFA), divisé en {nombre_parts} parts de {valeur_nominale} {devise} chacune, entièrement souscrites et libérées ({mode_liberation}), attribuées aux associés, savoir :"),
    p(""),
    t("{#associes}"),
    t("- À {civilite} {prenom} {nom}, à concurrence de {parts} parts, numérotées de {numero_debut} à {numero_fin}, en rémunération de son apport en {type_apport} ci-dessus ;"),
    t("{/associes}"),
    p(""),
    b("Égal au nombre de parts composant le capital social : {nombre_parts} parts."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Modifications du capital"),
    t("1. Le capital social peut être augmenté, par décision extraordinaire des associés, soit par émission de parts nouvelles, soit par majoration du nominal des parts existantes."),
    p(""),
    t("Les parts nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices, soit par apport en nature."),
    p(""),
    t("2. En cas d'augmentation de capital, les attributaires de parts nouvelles, s'ils n'ont déjà la qualité d'associés, devront être agréés dans les conditions fixées à l'article 12 ci-après."),
    p(""),
    t("3. En cas d'augmentation de capital par voie d'apports en numéraire, chacun des associés a, proportionnellement au nombre de parts qu'il possède, un droit de préférence à la souscription des parts nouvelles représentatives de l'augmentation de capital."),
    p(""),
    t("Le droit de souscription attaché aux parts anciennes peut être cédé sous réserve de l'agrément du cessionnaire dans les conditions prévues à l'article 12 ci-après."),
    p(""),
    t("Les associés pourront, lors de la décision afférente à l'augmentation du capital, renoncer, en tout ou en partie, à leur droit préférentiel de souscription."),
    p(""),
    t("La collectivité des associés peut également décider la suppression de ce droit."),
    p(""),
    t("4. Dans tous les cas, si l'opération fait apparaître des rompus, les associés feront leur affaire personnelle de toute acquisition ou cession de droits nécessaires."),
    p(""),
    t("5. Le capital social peut être réduit, soit par la diminution de la valeur nominale des parts, soit par la diminution du nombre de parts."),
    p(""),
    t("La réduction du capital est autorisée ou décidée par l'assemblée générale extraordinaire qui peut déléguer à la gérance les pouvoirs nécessaires pour la réaliser."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Libération des parts sociales"),
    t("Les parts sociales résultant d'apports numéraire émises à la suite d'une augmentation de capital peuvent être libérées, lors de leur souscription, de la moitié."),
    p(""),
    t("La libération du surplus intervient en une ou plusieurs fois sur décision du gérant dans un délai maximum de deux ans à compter soit de l'immatriculation de la société, soit du jour où l'augmentation de capital est devenue définitive."),
    p(""),
    t("Les associés qui le souhaitent peuvent procéder à des versements anticipés."),
    p(""),
    t("Les appels de fonds sont portés à la connaissance des souscripteurs quinze jours au moins avant la date fixée pour chaque versement, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, adressée à chaque associé."),
    p(""),
    t("A défaut par l'associé de se libérer aux époques fixées par le gérant, les sommes dues sont, de plein droit, productives d'intérêt au taux de l'intérêt légal, à compter de la date d'exigibilité."),
    p(""),
    t("En cas de non paiement des sommes restant à verser sur les parts sociales non libérées, aux époques fixées par le gérant, la société adresse à l'associé défaillant une mise en demeure par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception."),
    p(""),
    t("Un (1) mois après cette mise en demeure restée sans effet, la société poursuit de sa propre initiative la vente de ces parts sociales. A compter du même délai, les parts sociales pour lesquelles les versements exigibles n'ont pas été effectués cessent de donner droit à l'admission aux votes dans les assemblées d'associés et elles sont déduites pour le calcul du quorum et des majorités."),
    p(""),
    t("A l'expiration de ce même délai d'un (1) mois, le droit au dividende attaché à ces parts sociales sont suspendus jusqu'au paiement des sommes dues."),
    p(""),
    t("Avant de procéder à la vente des parts sociales, la société publie dans un journal habilité à recevoir les annonces légales, trente (30) jours après la mise en demeure, les numéros des parts sociales mises en vente. Elle avise le débiteur et, le cas échéant, ses codébiteurs de la mise en vente par lettre au porteur contre récépissé ou par lettre recommandée avec accusé de réception contenant l'indication de la date et du numéro du journal dans lequel la publication a été effectuée. Il ne peut être procédé à la mise en vente des parts sociales moins de quinze (15) jours après l'envoi de la lettre au porteur contre récépissé ou de la lettre recommandée avec accusé de réception."),
    p(""),
    t("L'associé défaillant reste débiteur ou profite de la différence. Les frais engagés par la société pour parvenir à la vente sont à la charge de l'associé défaillant."),
    p(""),
    t("L'associé défaillant, les cessionnaires successifs et les souscripteurs sont tenus solidairement du montant non libéré de la part sociale."),
    p(""),
    t("La société peut agir contre eux soit avant ou après la vente soit en même temps pour obtenir tant la somme due que le remboursement des frais exposés."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Droits des parts"),
    t("1. Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société et dans tout l'actif social."),
    p(""),
    t("2. La fraction de bénéfice, de l'actif net allouée aux parts sociales résultant de l'apport en industrie ne peut excéder 25% du montant global du bénéfice, de l'actif net."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Cession de parts entre vifs"),
    t("Les parts sociales représentatives d'apports en industrie sont attribuées à titre personnel. Elles ne peuvent être ni cédées ni transmises et sont annulées en cas de décès de leur titulaire comme en cas de cessation des prestations dues par ledit titulaire."),
    p(""),
    b("1. Forme"),
    t("Toute cession de parts sociales doit être constatée par écrit. Elle n'est opposable à la société qu'après accomplissement des formalités suivantes :"),
    t("- signification de la cession à la société par exploit d'huissier ou notification par tout moyen permettant d'établir sa réception effective par le destinataire ;"),
    t("- acceptation de la cession par la société dans un acte authentique ;"),
    t("- dépôt d'un original de l'acte de cession au siège social contre remise par le gérant d'une attestation de ce dépôt."),
    p(""),
    t("La cession n'est opposable aux tiers qu'après l'accomplissement de l'une des formalités ci-dessus et modification des statuts et publicité au registre du commerce et du crédit mobilier."),
    p(""),
    b("2. Cessions entre associés"),
    t("{#cession_associes_libre}Les parts sociales sont librement cessibles entre associés.{/cession_associes_libre}"),
    t("{#cession_associes_agrement}Les parts ne peuvent être cédées entre associés qu'avec le consentement de la majorité des associés représentant au moins {seuil_cession_associes} des parts sociales. La procédure prévue pour les cessions à des tiers s'applique à l'exception du délai de trois mois qui est réduit à un mois.{/cession_associes_agrement}"),
    p(""),
    b("3. Cessions aux conjoints, ascendants ou descendants"),
    t("{#cession_famille_libre}Les parts sociales sont librement cessibles entre conjoints, ascendants ou descendants.{/cession_famille_libre}"),
    t("{#cession_famille_agrement}Les parts ne peuvent être cédées entre conjoints, ascendants et descendants que dans les conditions et suivant la procédure prévues pour les cessions à des tiers à l'exception du délai de trois mois qui est réduit à un mois.{/cession_famille_agrement}"),
    p(""),
    b("4. Cessions à des tiers"),
    t("Les parts ne peuvent être cédées à des tiers qu'avec le consentement de la majorité des associés représentant au moins les trois quarts des parts sociales."),
    p(""),
    t("Le projet de cession est notifié par l'associé cédant à la société et à chacun des associés par acte extrajudiciaire. Si la société n'a pas fait connaître sa décision dans le délai de trois mois à compter de la dernière des notifications, le consentement à la cession est réputé acquis."),
    p(""),
    t("Si la société refuse de consentir à la cession, les associés sont tenus, dans les trois mois de la notification du refus, d'acquérir les parts à un prix qui, à défaut d'accord entre les parties, est fixé par un expert nommé par le président de la juridiction compétente à la demande de la partie la plus diligente. Le délai de trois mois stipulé peut être prolongé une seule fois par ordonnance du président de la juridiction compétente, sans que cette prolongation puisse excéder cent vingt jours."),
    p(""),
    t("La société peut également, avec le consentement du cédant, décider, dans le même délai, de réduire son capital du montant de la valeur nominale desdites parts et de racheter ces parts au prix déterminé dans les conditions prévues ci-dessus. Si, à l'expiration du délai imparti, la société n'a pas racheté ou fait racheter les parts, l'associé peut réaliser la cession initialement prévue."),
    p(""),
    it("Éventuellement : Les dispositions qui précèdent sont applicables à tous les cas de cessions, y compris en cas d'apport au titre d'une fusion ou d'une scission ou encore à titre d'attribution en nature à la liquidation d'une autre société."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Transmission de parts par décès ou liquidation de communauté"),
    t("{#transmission_deces_libre}Les parts sont librement transmissibles par voie de succession ou en cas de liquidation de communauté de biens entre époux.{/transmission_deces_libre}"),
    t("{#transmission_deces_agrement}En cas de décès d'un associé, les héritiers ou ayants droit ne deviennent associés qu'après avoir été agréés dans les conditions et suivant la procédure prévue pour les cessions à des tiers (art. 12, ci-dessus).{/transmission_deces_agrement}"),
    p(""),

    // ARTICLE 14
    b("Article 14 : Nantissement des parts sociales"),
    t("Le nantissement des parts est constaté par acte notarié ou sous seing-privé enregistré et signifié à la société et publié au registre du commerce et du crédit mobilier. Si la société a donné son consentement à un projet de nantissement de parts dans les conditions prévues pour les cessions de parts à des tiers, ce consentement emportera agrément du cessionnaire en cas de réalisation forcée des parts nanties, à moins que la société ne préfère, après la cession, racheter sans délai les parts, en vue de réduire son capital."),
    p(""),

    // ARTICLE 15
    b("Article 15 : Comptes courants"),
    t("Les associés peuvent laisser ou mettre à disposition de la société toutes sommes dont celle-ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur rémunération, sont déterminées soit par décision collective des associés, soit par accord entre la gérance et l'intéressé. Dans le cas où l'avance est faite par un gérant, ces conditions sont fixées par décision collective des associés. Ces accords sont soumis à la procédure de contrôle des conventions passées entre la société et l'un de ses gérants ou associés en ce qui concerne la rémunération des sommes mises à disposition."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Gérance"),
    t("1. La société est gérée par une ou plusieurs personnes physiques, choisies parmi les associés ou en dehors d'eux. Elles sont nommées pour une durée de {gerant_duree_mandat}. La nomination des gérants au cours de la vie sociale est décidée à la majorité de plus de la moitié des parts ({#majorite_superieure_nomination}ou à une majorité supérieure, à savoir {seuil_majorite_nomination}{/majorite_superieure_nomination})."),
    p(""),
    t("Est nommé gérant de la société : {gerant_civilite} {gerant_prenom} {gerant_nom}, né(e) le {gerant_date_naissance} à {gerant_lieu_naissance}, de nationalité {gerant_nationalite}, demeurant à {gerant_adresse}, qui accepte."),
    p(""),
    t("Le gérant est nommé pour une durée de {gerant_duree_mandat}. Il est toujours rééligible."),
    p(""),
    t("Au cours de la vie sociale, le gérant est nommé par décision des associés représentant plus de la moitié du capital ({#majorite_superieure_vie_sociale}ou à une majorité supérieure, à savoir {seuil_majorite_vie_sociale}{/majorite_superieure_vie_sociale})."),
    p(""),
    t("Le gérant peut démissionner de son mandat, mais seulement en prévenant chacun des associés au moins {gerant_preavis_mois} mois à l'avance, par lettre recommandée avec demande d'avis de réception ou lettre au porteur contre récépissé."),
    p(""),
    t("Le gérant est révocable par décision des associés représentant plus de la moitié des parts sociales."),
    p(""),
    t("2. La rémunération du gérant est {gerant_remuneration}."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Pouvoirs du gérant"),
    t("Dans les rapports entre associés, le gérant peut faire tous les actes de gestion dans l'intérêt de la société."),
    p(""),
    t("{#limitation_pouvoirs}Cependant, il ne peut, sans y être autorisé par une décision collective ordinaire des associés : {limitations_pouvoirs_liste}.{/limitation_pouvoirs}"),
    p(""),
    t("Dans les rapports avec les tiers, le gérant est investi des pouvoirs les plus étendus pour agir en toute circonstance, au nom de la société, sous réserve des pouvoirs expressément attribués aux associés par la loi."),
    p(""),
    t("La société est engagée, même par les actes du gérant qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que le tiers savait que l'acte dépassait cet objet ou qu'il ne pouvait l'ignorer compte tenu des circonstances, étant exclu que la seule publication des statuts suffise à constituer cette preuve."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Responsabilité des gérants"),
    t("Les gérants sont responsables, individuellement ou solidairement, selon le cas, envers la société ou envers les tiers, soit des infractions aux dispositions législatives ou réglementaires applicables aux sociétés à responsabilité limitée, soit des violations des statuts, soit des fautes commises dans leur gestion."),
    p(""),
    t("Si plusieurs gérants ont coopéré aux mêmes faits, le tribunal chargé des affaires commerciales détermine la part contributive de chacun dans la réparation du dommage."),
    p(""),
    t("Aucune décision de l'assemblée ne peut avoir pour effet d'éteindre une action en responsabilité contre les gérants pour faute commise dans l'accomplissement de leur mandat."),
    p(""),

    // ARTICLE 19
    b("Article 19 : Décisions collectives"),
    t("1. La volonté des associés s'exprime par des décisions collectives qui obligent tous les associés, qu'ils y aient, ou non pris part."),
    p(""),
    t("2. Les décisions collectives sont prises, au choix de la gérance, soit en assemblée, soit par consultation écrite, sauf dans les cas où la loi impose la tenue d'une assemblée."),
    p(""),
    t("3. L'assemblée est convoquée par le ou les gérants individuellement ou collectivement ou, à défaut par le commissaire aux comptes, s'il en existe un, ou, encore par mandataire désigné en justice à la demande de tout associé."),
    p(""),
    t("Pendant la liquidation, les assemblées sont convoquées par le ou les liquidateurs."),
    p(""),
    t("Les assemblées sont réunies au lieu indiqué dans la convocation. La convocation est faite par lettre recommandée avec demande d'avis de réception ou par lettre au porteur contre récépissé, par télécopie ou par courrier électronique adressée à chacun des associés, quinze jours au moins avant la date de la réunion. Celle-ci indique l'ordre du jour."),
    p(""),
    t("Les convocations par télécopie et courrier électronique ne sont valables que si l'associé a préalablement donné son accord écrit et communiqué son numéro de télécopie ou son adresse électronique, selon le cas."),
    p(""),
    t("L'assemblée est présidée par le gérant ou par l'un des gérants. Si aucun des gérants n'est associé, elle est présidée par l'associé présent ou acceptant qui possède ou représente le plus grand nombre de parts. Si deux associés qui possèdent ou représentent le même nombre de parts sont acceptants, la présidence de l'assemblée est assurée par le plus âgé."),
    p(""),
    t("La délibération est constatée par un procès-verbal qui indique la date et le lieu de la réunion, les noms et prénoms des associés présents du nombre de parts sociales détenues par chacun, les documents et rapports soumis à l'assemblée, un résumé des débats, le texte des résolutions mises aux voix et le résultat des votes. Les procès-verbaux sont signés par chacun des associés présents."),
    p(""),
    t("4. En cas de consultation écrite, le texte des résolutions proposées ainsi que les documents nécessaires à l'information des associés sont adressés à chacun d'eux par lettre recommandée avec demande d'avis de réception ou par lettre au porteur contre récépissé. Les associés disposent d'un délai minimal de quinze jours, à compter de la date de réception des projets de résolution pour émettre leur vote par écrit."),
    p(""),
    t("La réponse est faite par lettre recommandée avec demande d'avis de réception ou par lettre contre récépissé. Tout associé n'ayant pas répondu dans le délai ci-dessus est considéré comme s'étant abstenu."),
    p(""),
    t("La consultation est mentionnée dans un procès-verbal, auquel est annexée la réponse de chaque associé."),
    p(""),
    t("5. Chaque associé a le droit de participer aux décisions et dispose d'un nombre de voix égal à celui des parts sociales qu'il possède."),
    p(""),
    t("6. Un associé peut se faire représenter par son conjoint à moins que la société ne comprenne que les deux époux. Sauf si les associés sont au nombre de deux, un associé peut se faire représenter par un autre associé."),
    p(""),
    t("7. Le vote par correspondance est autorisé par lettre au porteur contre récépissé, par lettre recommandée avec demande d'avis de réception ou par courrier électronique. Dans ce cas, les associés doivent informer le gérant de leur absence au moins trois (3) jours avant la tenue de l'assemblée. Les votes par correspondance doivent être réceptionnés par la société vingt quatre (24) heures avant la tenue de l'assemblée."),
    p(""),
    t("8. Les associés peuvent participer à l'assemblée par visioconférence ou d'autres moyens de télécommunication permettant leur identification. Le gérant organise les modalités d'utilisation des moyens de télécommunication au sein de la société."),
    p(""),
    t("Tout associé peut se faire représenter par la personne de son choix."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Décisions collectives ordinaires"),
    t("Sont qualifiées d'ordinaires, les décisions des associés ayant but de statuer sur les états financiers de synthèse, d'autoriser la gérance à effectuer les opérations subordonnées dans les statuts à l'accord préalable des associés, de nommer et de remplacer les gérants et, le cas échéant, le commissaire aux comptes, d'approuver les conventions intervenues entre la société et les gérants et associés et plus généralement de statuer sur toutes les questions qui n'entraînent pas modification des statuts."),
    p(""),
    t("Ces décisions sont valablement adoptées par un ou plusieurs associés représentant plus de la moitié des parts sociales. Si cette majorité n'est pas obtenue, les associés sont, selon le cas, convoqués ou consultés une seconde fois, et les décisions sont prises à la majorité des votes émis, quel que soit le nombre de votants."),
    p(""),
    t("Sont réputés présents pour le calcul du quorum et de la majorité les associés qui ont votés par correspondance ou qui ont participé à l'assemblée à distance par visioconférence ou par d'autres moyens de télécommunication permettant leur identification."),
    p(""),
    t("Toutefois, la révocation des gérants doit toujours être décidée à la majorité absolue."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Décisions collectives extraordinaires"),
    t("Sont qualifiées d'extraordinaires, les décisions des associés ayant pour objet de statuer sur la modification des statuts, sous réserve des exceptions prévues par la loi."),
    p(""),
    t("Les modifications des statuts sont adoptées par les associés représentant au moins les trois quarts des parts sociales."),
    p(""),
    t("Toutefois, l'unanimité est requise dans les cas suivants :"),
    t("- augmentation des engagements des associés ;"),
    t("- transformation de la société en société en nom collectif ;"),
    t("- transfert du siège social dans un État autre qu'un État partie."),
    p(""),
    t("La décision d'augmenter le capital par incorporation de bénéfices ou de réserves est prise par les associés représentant au moins la moitié des parts sociales."),
    p(""),
    t("Sont réputés présents pour le calcul du quorum et de la majorité les associés qui ont votés par correspondance ou qui ont participé à l'assemblée à distance par visioconférence ou par d'autres moyens de télécommunication permettant leur identification."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Droit de communication des associés"),
    t("Lors de toute consultation des associés, chacun d'eux a le droit d'obtenir communication des documents et informations nécessaires pour lui permettre de se prononcer en connaissance de cause et de porter un jugement sur la gestion de la société."),
    p(""),
    t("La nature de ces documents et les conditions de leur envoi ou mise à disposition sont déterminées par la loi."),
    p(""),

    // ARTICLE 23
    b("Article 23 : Comptes sociaux"),
    t("A la clôture de chaque exercice, le gérant établit et arrête les états financiers de synthèse conformément aux dispositions de l'Acte Uniforme portant organisation et harmonisation des comptabilités."),
    p(""),
    t("Le gérant établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et, en particulier, les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("Ces documents ainsi que les textes des résolutions proposées et, le cas échéant, les rapports du commissaire aux comptes sont communiqués aux associés dans les conditions et délais prévus par les dispositions légales et réglementaires."),
    p(""),
    t("A compter de cette communication, tout associé a la possibilité de poser par écrit des questions auxquelles le gérant sera tenu de répondre au cours de l'assemblée."),
    p(""),
    t("Une assemblée générale appelée à statuer sur les comptes de l'exercice écoulé doit être réunie chaque année dans les six mois de la clôture de l'exercice ou, en cas de prolongation, dans le délai fixé par décision de justice."),
    p(""),

    // ARTICLE 24
    b("Article 24 : Affectation des résultats"),
    t("Après approbation des comptes et constatations de l'existence d'un bénéfice distribuable, l'assemblée générale détermine la part attribuée aux associés sous forme de dividende."),
    p(""),
    t("Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures, une dotation égale à un dixième au moins affecté à la formation d'un fonds de réserve dit « réserve légale ». Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital social."),
    p(""),
    t("Les sommes dont la mise en distribution est décidée sont réparties entre les associés titulaires de parts proportionnellement au nombre de leurs parts."),
    p(""),
    t("L'assemblée générale a la faculté de constituer tous postes de réserves."),
    p(""),
    t("Elle peut procéder à la distribution de tout ou partie des réserves à la condition qu'il ne s'agisse pas de réserves déclarées indisponibles par la loi ou par les statuts. Dans ce cas, elle indique expressément les postes de réserve sur lesquels les prélèvements sont effectués."),
    p(""),

    // ARTICLE 25
    b("Article 25 : Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le gérant ou, le cas échéant, le commissaire aux comptes doit dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, consulter les associés sur l'opportunité de prononcer la dissolution anticipée de la société."),
    p(""),
    t("Si la dissolution est écartée, la société est tenue, dans les deux ans qui suivent la date de clôture de l'exercice déficitaire, de reconstituer ses capitaux propres jusqu'à ce que ceux-ci soient à la hauteur de la moitié au moins du capital social."),
    p(""),
    t("A défaut, elle doit réduire son capital d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves, à la condition que cette réduction du capital n'ait pas pour effet de réduire le capital à un montant inférieur à celui du capital minimum légal."),
    p(""),
    t("A défaut par le gérant ou le commissaire aux comptes de provoquer cette décision, ou si les associés n'ont pu délibérer valablement, tout intéressé peut demander à la juridiction compétente de prononcer la dissolution de la société. Il en est de même si la reconstitution des capitaux propres n'est pas intervenue dans les délais prescrits."),
    p(""),

    // ARTICLE 26
    b("Article 26 : Contrôle des comptes"),
    t("La société est tenue de désigner au moins un commissaire aux comptes si elle remplit, à la clôture de l'exercice social, deux (2) des conditions suivantes :"),
    t("1°) total du bilan supérieur à cent vingt cinq millions (125.000.000) de francs CFA ;"),
    t("2°) chiffre d'affaires annuel supérieur à deux cents cinquante millions (250.000.000) de francs CFA ;"),
    t("3°) effectif permanent supérieur à 50 personnes."),
    p(""),
    t("La société n'est plus tenue de désigner un commissaire aux comptes dès lors qu'elle n'a pas rempli deux (2) des conditions fixées ci-dessus pendant les deux (2) exercices précédant l'expiration du mandat du commissaire aux comptes."),
    p(""),
    t("Les associés peuvent nommer même si les critères ci-dessus ne sont pas atteints un ou plusieurs commissaires aux comptes."),
    p(""),
    t("Le commissaire aux comptes est nommé pour 3 exercices par un ou plusieurs associés représentant plus de la 1/2 du capital."),
    p(""),
    t("Ils exercent leurs fonctions et sont rémunérés conformément à la loi."),
    p(""),

    // ARTICLE 27
    b("Article 27 : Liquidation"),
    t("La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés."),
    p(""),
    t("La dissolution de la société entraîne sa mise en liquidation. Le ou les gérants en fonction lors de la dissolution exercent les fonctions de liquidateurs, à moins qu'une décision collective des associés ne désigne un ou plusieurs autres liquidateurs, choisis parmi les associés ou les tiers. Les pouvoirs du liquidateur, ou de chacun d'eux s'ils sont plusieurs, sont déterminés par la collectivité des associés."),
    p(""),
    t("Le boni de liquidation est réparti entre les associés au prorata du nombre de parts qu'ils détiennent."),
    p(""),
    t("Si toutes les parts sociales sont réunies en une seule main, l'expiration de la société ou sa dissolution pour quelque cause que ce soit, entraîne la transmission universelle du patrimoine social à l'associé unique, sans qu'il y ait lieu à liquidation, sous réserve du droit d'opposition des créanciers."),
    p(""),

    // ARTICLE 28
    b("Article 28 : Contestations"),
    t("{#contestation_droit_commun}Les contestations relatives aux affaires sociales survenant pendant la durée de la société ou au cours de sa liquidation, entre les associés ou entre les associés et la société, sont soumises au tribunal chargé des affaires commerciales.{/contestation_droit_commun}"),
    t("{#contestation_arbitrage}Les contestations relatives aux affaires, survenant pendant la durée de la société ou au cours de sa liquidation, entre les associés ou entre les associés et la société, sont soumises à l'arbitrage conformément aux dispositions de l'Acte Uniforme de l'OHADA s'y rapportant.{/contestation_arbitrage}"),
    p(""),

    // ARTICLE 29
    b("Article 29 : Engagements pour le compte de la société"),
    t("1. Un état des actes accomplis pour le compte de la société en formation, avec l'indication, pour chacun d'eux, de l'engagement qui en résulterait pour la société, a été présenté aux associés avant la signature des présents statuts. Ledit état est ci-après annexé."),
    p(""),
    t("2. En outre, les soussignés donnent mandat à {mandataire_civilite} {mandataire_prenom} {mandataire_nom}, demeurant à {mandataire_adresse}, à l'effet de prendre les engagements suivants au nom et pour le compte de la société : {engagements_mandataire}."),
    p(""),

    // ARTICLE 30
    b("Article 30 : Frais"),
    t("Les frais, droits et honoraires des présents statuts sont à la charge de la société."),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait à {lieu_signature}, le {date_signature} en {nombre_associes} originaux.", false, 24, true),
    p(""),
    p("Signature de chaque associé avec mention « Lu et approuvé »", false, 24, true, true),
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

  const outputDir = path.join(__dirname, "../templates/sarl");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
