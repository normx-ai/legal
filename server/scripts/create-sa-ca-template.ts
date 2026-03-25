/**
 * Script pour créer le template DOCX des statuts SA avec Conseil d'Administration
 * Basé sur le modèle officiel du Guide Pratique OHADA (pages 523-543)
 * Usage : npx tsx scripts/create-sa-ca-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 Anonyme avec Conseil d\u2019Administration au capital de {capital} {devise}</w:t></w:r></w:p>
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SA CA \u2014 {denomination}</w:t></w:r>
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
    p("Société Anonyme avec Conseil d\u2019Administration", false, 28, true),
    p("Au capital de {capital} {devise}", false, 24, true),
    p("", false, 24, true),
    p("Siège social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true),
    p("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", false, 24, true),
    p("STATUTS", true, 36, true),
    p("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", false, 24, true),
    p("", false, 24, true),
    p("Établis le {date_signature}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("STATUTS \u2014 \u00AB SOCI\u00C9T\u00C9 ANONYME AVEC CONSEIL D\u2019ADMINISTRATION \u00BB"),
    p(""),

    // PR\u00C9AMBULE
    t("Entre les soussignés :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, {profession}, demeurant à {adresse} ;"),
    t("{/associes}"),
    p(""),
    t("Il est établi ainsi qu\u2019il suit les statuts de la société anonyme avec conseil d\u2019administration qui va exister entre eux et tous autres propriétaires d\u2019actions qui pourraient entrer dans la société ultérieurement."),
    p(""),

    // ===== ARTICLE 1 =====
    b("Article premier : Forme"),
    t("Il est formé entre les soussignés une société anonyme avec conseil d\u2019administration qui sera régie par l\u2019Acte Uniforme de l\u2019OHADA relatif au droit des sociétés commerciales et du GIE, et tous textes ultérieurs complémentaires ou modificatifs."),
    p(""),

    // ===== ARTICLE 2 =====
    b("Article 2 : Dénomination"),
    t("La société a pour dénomination \u00AB {denomination} \u00BB."),
    t("{#has_sigle}Éventuellement : Son sigle est : \u00AB {sigle} \u00BB.{/has_sigle}"),
    t("La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie, immédiatement en caractères lisibles, de l\u2019indication de la forme de la société, du montant de son capital social, de l\u2019adresse de son siège social et de la mention de son immatriculation au registre du commerce et du crédit mobilier."),
    p(""),

    // ===== ARTICLE 3 =====
    b("Article 3 : Objet"),
    t("La société a pour objet, {objet_social}."),
    t("Et, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, pouvant se rattacher directement ou indirectement à l\u2019objet ci-dessus ou à tous objets similaires ou connexes, de nature à favoriser son extension ou son développement."),
    p(""),

    // ===== ARTICLE 4 =====
    b("Article 4 : Siège social"),
    t("Le siège social est fixé à {siege_social}, {ville}, {pays}."),
    t("Il peut être transféré dans les limites du territoire d\u2019un même État partie par décision du conseil d\u2019administration qui modifie les statuts en conséquence, sous réserve de la ratification de cette décision par la prochaine assemblée générale ordinaire."),
    p(""),

    // ===== ARTICLE 5 =====
    b("Article 5 : Durée"),
    t("La société a une durée de {duree} ans (99 ans maximum), sauf dissolution anticipée ou prorogation."),
    p(""),

    // ===== ARTICLE 6 =====
    b("Article 6 : Exercice social"),
    t("L\u2019exercice social commence le {exercice_debut} et se termine le {exercice_fin} de chaque année."),
    t("Par exception, le premier exercice social sera clos le {premier_exercice_fin}."),
    p(""),

    // ===== ARTICLE 7 =====
    b("Article 7 : Apports"),
    t("Lors de la constitution de la société, il a été apporté :"),
    p(""),
    b("I - Apports en numéraire"),
    t("{#associes}"),
    t("{civilite} {prenom} {nom} : FCFA {apport}"),
    t("{/associes}"),
    b("Total de l\u2019apport en numéraire : FCFA {total_apports_numeraire}"),
    p(""),
    t("Les apports en numéraire de FCFA {total_apports_numeraire} ({total_apports_numeraire_lettres}) correspondent à {nombre_actions_numeraire} actions de FCFA {valeur_nominale} chacune, souscrites et libérées ({mode_liberation}) ainsi qu\u2019il résulte du certificat du dépositaire établi le {date_certificat_depot} par {nom_depositaire}."),
    p(""),
    t("Les sommes correspondantes ont été déposées, pour le compte de la société, à {lieu_depot}."),
    p(""),
    t("{#is_liberation_partielle}La libération du surplus, soit FCFA {montant_surplus} par action interviendra dans les conditions prévues à l\u2019article 11 ci-après.{/is_liberation_partielle}"),
    p(""),

    t("{#has_apports_nature}"),
    b("II - Apports en nature et/ou stipulation d\u2019avantages particuliers"),
    t("{#associes_nature}"),
    t("{civilite} {prenom} {nom}, en s\u2019obligeant à toutes les garanties ordinaires et de droit, fait apport à la société de {description_apport_nature}."),
    p(""),
    t("En rémunération de cet apport, évalué à FCFA {montant_apport_nature}, {civilite} {prenom} {nom} se voit attribuer {actions_nature} actions."),
    p(""),
    t("{/associes_nature}"),
    t("Cette évaluation a été faite au vu du rapport de {commissaire_apports_nom}, commissaire aux apports, désigné à l\u2019unanimité des futurs associés, en date du {date_rapport_commissaire}, déposé au lieu du futur siège le {date_depot_rapport}, et dont un exemplaire est annexé aux présents."),
    p(""),
    t("{/has_apports_nature}"),

    b("III - Récapitulation des apports"),
    t("1. Apports en numéraire pour un montant total de FCFA {total_apports_numeraire}"),
    t("{#has_apports_nature}2. Apports en nature pour un montant total de FCFA {total_apports_nature}{/has_apports_nature}"),
    b("Soit, au total : FCFA {total_apports} ({total_apports_lettres})"),
    t("correspondant au montant du capital."),
    p(""),

    // ===== ARTICLE 8 =====
    b("Article 8 : Capital social"),
    t("Le capital social est fixé à la somme de FCFA {capital} ({capital_lettres}), divisé en :"),
    t("- {nombre_actions_numeraire} actions de numéraire de FCFA {valeur_nominale} chacune, ainsi ventilées :"),
    t("{#associes}"),
    t("* {civilite} {prenom} {nom} : à concurrence de {actions} actions numérotées de {numero_debut} à {numero_fin} ;"),
    t("{/associes}"),
    p(""),
    t("{#has_apports_nature}- {nombre_actions_nature} actions d\u2019apport de FCFA {valeur_nominale} chacune, ainsi ventilées :"),
    t("{#associes_nature}"),
    t("* {civilite} {prenom} {nom} : à concurrence de {actions_nature} actions numérotées de {numero_debut_nature} à {numero_fin_nature} ;"),
    t("{/associes_nature}"),
    t("{/has_apports_nature}"),
    p(""),

    // ===== ARTICLE 9 =====
    b("Article 9 : Modification du capital"),
    t("Le capital social peut être augmenté, réduit ou amorti dans les conditions prévues par la loi."),
    p(""),
    t("Le capital social peut être augmenté, soit par émission d\u2019actions nouvelles, soit par majoration du montant nominal des actions existantes."),
    p(""),
    t("Les actions nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices ou primes d\u2019émission, soit par apport en nature."),
    p(""),
    t("L\u2019assemblée générale extraordinaire est seule compétente pour décider, sur le rapport du conseil d\u2019administration, une augmentation du capital."),
    p(""),
    t("Les actionnaires ont, proportionnellement au montant de leurs actions, un droit de préférence à la souscription des actions de numéraire émises pour réaliser une augmentation de capital, droit auquel ils peuvent renoncer à titre individuel. Ils disposent, en outre, d\u2019un droit de souscription à titre réductible si l\u2019assemblée générale l\u2019a décidé expressément."),
    p(""),
    t("Le droit à l\u2019attribution d\u2019actions nouvelles, à la suite de l\u2019incorporation au capital de réserves, bénéfices ou primes d\u2019émission, appartient au nu-propriétaire, sous réserve des droits de l\u2019usufruitier."),
    p(""),
    t("Ces droits sont négociables ou cessibles comme les actions auxquelles ils sont attachés."),
    p(""),
    t("Le capital social peut être réduit, soit par la diminution de la valeur nominale des actions, soit par la diminution du nombre des actions."),
    p(""),
    t("La réduction du capital est autorisée ou décidée par l\u2019assemblée générale extraordinaire, qui peut déléguer au conseil d\u2019administration tous les pouvoirs pour la réaliser."),
    p(""),
    t("Mais en aucun cas la réduction du capital ne peut porter atteinte à l\u2019égalité des actionnaires sauf consentement exprès de ceux-ci. Elle est décidée dans le respect des droits des créanciers."),
    p(""),
    t("L\u2019assemblée générale ordinaire peut décider l\u2019amortissement du capital par prélèvement sur les bénéfices ou sur les réserves, à l\u2019exclusion de la réserve légale et sauf autorisation de l\u2019assemblée générale extraordinaire, des réserves statutaires, dans les conditions prévues par la loi."),
    p(""),

    // ===== ARTICLE 10 =====
    b("Article 10 : Comptes courants"),
    t("Les actionnaires peuvent mettre ou laisser à la disposition de la société, toutes sommes, produisant ou non intérêts, dont celle-ci peut avoir besoin."),
    p(""),
    t("Les modalités de ces prêts sont arrêtées par le conseil d\u2019administration et l\u2019intéressé."),
    p(""),
    t("Lorsque le prêt est consenti par un administrateur ou le directeur général, il constitue une convention réglementée soumise aux dispositions de l\u2019article 20 ci-après."),
    p(""),

    // ===== ARTICLE 11 =====
    b("Article 11 : Libération des actions"),
    t("Les actions de numéraire émises à la suite d\u2019une augmentation de capital résultant pour partie d\u2019une incorporation de réserves, bénéfices ou primes d\u2019émission et pour partie d\u2019un versement en espèces, doivent être intégralement libérées lors de leur souscription. Toutes autres actions de numéraire peuvent être libérées, lors de leur souscription, du quart au moins de leur valeur nominale."),
    p(""),
    t("La libération du surplus intervient en une ou plusieurs fois sur décision du conseil d\u2019administration dans un délai maximum de trois ans à compter soit de l\u2019immatriculation de la société, soit du jour où l\u2019augmentation de capital est devenue définitive."),
    p(""),
    t("Les actionnaires qui le souhaitent peuvent procéder à des versements anticipés."),
    p(""),
    t("Les appels de fonds sont portés à la connaissance des souscripteurs {jours_appel_fonds} jours au moins avant la date fixée pour chaque versement, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d\u2019avis de réception, adressée à chaque actionnaire."),
    p(""),
    t("À défaut par l\u2019actionnaire de se libérer aux époques fixées par le conseil d\u2019administration, les sommes dues sont, de plein droit, productives d\u2019intérêt au taux de l\u2019intérêt légal, à compter de la date d\u2019exigibilité, sans préjudice des autres recours et sanctions prévus par la loi."),
    p(""),

    // ===== ARTICLE 12 =====
    b("Article 12 : Forme des actions"),
    t("Les actions sont nominatives."),
    p(""),
    t("Le président du conseil d\u2019administration est habilité à tenir les registres de titres nominatifs émis par la société. Les registres contiennent les mentions relatives aux opérations de transfert, de conversion, de nantissement et de séquestre des titres, et notamment :"),
    t("1\u00B0) La date de l\u2019opération ;"),
    t("2\u00B0) Les nom, prénoms et domicile de l\u2019ancien et du nouveau titulaire des titres, en cas de transfert ;"),
    t("3\u00B0) La valeur nominale et le nombre de titres transférés ou convertis ;"),
    t("4\u00B0) Le cas échéant, si la société a émis des actions de différentes catégories, la catégorie et les caractéristiques des actions transférées ou converties ;"),
    t("5\u00B0) Un numéro d\u2019ordre affecté à l\u2019opération."),
    p(""),
    t("Toutes les écritures contenues dans les registres doivent être signées par le président du conseil d\u2019administration."),
    p(""),
    t("Les titres nominatifs sont représentés par des certificats indiquant les nom, prénoms et domicile du titulaire, le nombre d\u2019actions, la valeur nominale, le numéro des actions possédées par le titulaire et la date de jouissance."),
    p(""),

    // ===== ARTICLE 13 =====
    b("Article 13 : Cession et transmission des actions"),
    t("Les actions ne sont négociables qu\u2019après l\u2019immatriculation de la société au registre du commerce et du crédit mobilier. En cas d\u2019augmentation de capital, les actions sont négociables à compter de l\u2019inscription de la mention modificative. Les actions de numéraire ne sont négociables qu\u2019après avoir été entièrement libérées. Elles demeurent négociables après la dissolution de la société et jusqu\u2019à la clôture de la liquidation."),
    p(""),
    t("La cession doit être constatée par écrit. Elle n\u2019est rendue opposable à la société qu\u2019après l\u2019accomplissement de l\u2019une des formalités suivantes :"),
    t("1\u00B0) signification de la cession à la société par acte d\u2019huissier ou notification par tout moyen permettant d\u2019établir sa réception effective par le destinataire ;"),
    t("2\u00B0) acceptation de la cession par la société dans un acte authentique ;"),
    t("3\u00B0) dépôt d\u2019un original de l\u2019acte de cession au siège social contre remise par le président du conseil d\u2019administration d\u2019une attestation de dépôt."),
    p(""),
    t("La cession n\u2019est opposable aux tiers qu\u2019après accomplissement de l\u2019une des formalités ci-dessus et publicité au registre du commerce et du crédit mobilier."),
    p(""),
    t("Les frais de transfert des actions sont à la charge des cessionnaires, sauf convention contraire entre cédants et cessionnaires."),
    p(""),
    t("Les cessions entre actionnaires, ou au profit des héritiers, des conjoints, des ascendants et descendants ou encore la liquidation de la communauté des biens entre époux sont libres."),
    p(""),

    // Cession à des tiers — variantes conditionnelles
    t("Cession à des tiers :"),
    p(""),
    t("{#clause_agrement}"),
    b("Clause d\u2019agrément"),
    t("Toute transmission d\u2019actions à un tiers étranger, soit à titre onéreux, soit à titre gratuit, sauf :"),
    t("- la transmission au profit des héritiers en cas de succession ou aux époux en cas de liquidation de la communauté des biens ;"),
    t("- la cession à un conjoint, ascendant, descendant, est soumise à l\u2019agrément de l\u2019assemblée générale ordinaire des actionnaires dans les conditions ci-après ;"),
    t("- le cédant joint à sa demande d\u2019agrément adressée à la société par lettre au porteur contre récépissé ou par lettre recommandée avec demande d\u2019avis de réception, ou par télécopie, les nom, prénoms, qualité et adresse du cessionnaire proposé, le nombre d\u2019actions dont la transmission est envisagée et le prix offert ;"),
    t("- L\u2019agrément résulte soit d\u2019une notification, soit du défaut de réponse dans le délai de trois (3) mois à compter de la demande ;"),
    t("- Si la société n\u2019agrée pas le cessionnaire proposé, le conseil d\u2019administration est tenu dans le délai de trois (3) mois à compter de la notification de refus, de faire acquérir les actions soit par un ou plusieurs actionnaire(s), soit par un tiers, soit par la société ;"),
    t("- À défaut d\u2019accord entre les parties, le prix de cession est déterminé à dire d\u2019expert désigné, soit par les parties, soit à défaut d\u2019accord entre elles, par la juridiction compétente à la demande de la partie la plus diligente ;"),
    t("- Si à l\u2019expiration du délai de trois (3) mois à compter du refus d\u2019agrément, l\u2019achat n\u2019est pas réalisé, l\u2019agrément est considéré comme donné ;"),
    t("- Le cédant peut, à tout moment, renoncer à la cession de ses actions ;"),
    t("- Toute cession d\u2019actions réalisée en violation de la clause d\u2019agrément est nulle."),
    t("{/clause_agrement}"),
    p(""),

    t("{#clause_preemption}"),
    b("Clause de préemption"),
    t("L\u2019actionnaire qui entend céder tout ou partie de ses actions est tenu de le notifier à tous les actionnaires, qui peuvent faire connaître au cédant qu\u2019ils exercent un droit de préemption aux prix et conditions qui lui ont été notifiés."),
    p(""),
    t("La notification doit être effectuée par lettre au porteur contre récépissé ou par lettre recommandée avec demande d\u2019avis de réception, ou par télécopie les nom, prénoms, qualité et adresse du cessionnaire proposé, le nombre d\u2019actions dont la transmission est envisagée et le prix offert."),
    p(""),
    t("À l\u2019expiration du délai de {delai_preemption} mois à compter de la réception de la notification, si les droits de préemption n\u2019ont pas été exercés en totalité sur les actions concernées, le cédant pourra réaliser librement la cession."),
    p(""),
    t("Toute cession d\u2019actions réalisée en violation du droit de préemption est nulle."),
    t("{/clause_preemption}"),
    p(""),

    t("{#clause_inalienabilite}"),
    b("Clause d\u2019inaliénabilité"),
    t("Pendant une durée de {duree_inalienabilite} années (cette durée ne peut dépasser 10 ans) à compter de {date_debut_inalienabilite}, les actionnaires ne pourront céder les actions ainsi que les droits de souscription et d\u2019attribution en cas d\u2019augmentation de capital."),
    t("{/clause_inalienabilite}"),
    p(""),

    // ===== ARTICLE 14 =====
    b("Article 14 : Droits et obligations attachés aux actions"),
    t("À chaque action est attaché un droit de vote proportionnel à la quotité du capital qu\u2019elle représente et chaque action donne droit à une voix au moins. En outre, elle donne droit au vote et à la représentation dans les assemblées générales, dans les conditions légales et statutaires."),
    p(""),
    t("Un droit de vote double de celui conféré aux autres actions, eu égard à la quotité du capital qu\u2019elles représentent, peut être conféré par l\u2019assemblée générale extraordinaire aux actions nominatives entièrement libérées pour lesquelles il est justifié d\u2019une inscription nominative depuis au moins deux (2) ans au nom d\u2019un même actionnaire."),
    p(""),
    t("À chaque action est attaché un droit au dividende proportionnel à la quotité du capital qu\u2019elle représente."),
    p(""),
    t("L\u2019assemblée générale extraordinaire peut décider la création d\u2019actions de préférence jouissant d\u2019avantages particuliers par rapport à toutes les autres actions."),
    p(""),
    t("Les actionnaires ne supportent les pertes qu\u2019à concurrence de leurs apports. Les droits et obligations attachés à l\u2019action suivent le titre dans quelle que main qu\u2019il passe. La propriété d\u2019une action emporte de plein droit adhésion aux statuts et aux décisions de l\u2019assemblée générale."),
    p(""),

    // ===== ARTICLE 15 =====
    b("Article 15 : Conseil d\u2019administration"),
    p(""),
    b("Composition"),
    t("La société est administrée par un conseil d\u2019administration composé de trois (3) membres au moins et de douze (12) membres au plus."),
    p(""),
    t("Les administrateurs sont nommés par l\u2019assemblée générale ordinaire pour une durée de {duree_mandat_admin} ans."),
    p(""),
    t("Les premiers administrateurs sont désignés dans les statuts pour une durée de six (6) ans au plus, et en cours de vie sociale pour une durée de six (6) ans au plus. Leur mandat est renouvelable."),
    p(""),
    t("Sont nommés premiers administrateurs :"),
    t("{#administrateurs}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, demeurant à {adresse} ;"),
    t("{/administrateurs}"),
    p(""),

    b("Cooptation et vacances"),
    t("En cas de vacance par décès ou par démission d\u2019un ou plusieurs sièges d\u2019administrateur, le conseil d\u2019administration peut, entre deux assemblées générales, procéder à des nominations à titre provisoire. Les nominations ainsi faites par le conseil d\u2019administration sont soumises à ratification de la prochaine assemblée générale ordinaire."),
    p(""),
    t("L\u2019administrateur nommé en remplacement d\u2019un autre ne demeure en fonction que pendant la durée restant à courir du mandat de son prédécesseur."),
    p(""),

    b("Cumul de mandats et qualité de salarié"),
    t("Une même personne physique ne peut appartenir simultanément à plus de cinq (5) conseils d\u2019administration de sociétés anonymes ayant leur siège social sur le territoire d\u2019un même État partie."),
    p(""),
    t("Un salarié de la société peut être nommé administrateur. Toutefois, son contrat de travail doit correspondre à un emploi effectif. Le nombre des administrateurs liés à la société par un contrat de travail ne peut dépasser le tiers des membres du conseil."),
    p(""),

    // ===== ARTICLE 16 =====
    b("Article 16 : Présidence et délibérations du conseil d\u2019administration"),
    p(""),
    b("Présidence"),
    t("Le conseil d\u2019administration élit parmi ses membres personnes physiques un président. Il détermine la durée de son mandat qui ne peut excéder celle de son mandat d\u2019administrateur. Le président est rééligible."),
    p(""),
    t("Une même personne physique ne peut exercer simultanément plus de trois (3) mandats de président de conseil d\u2019administration de sociétés anonymes ayant leur siège social sur le territoire d\u2019un même État partie."),
    p(""),

    b("Convocation et lieu de réunion"),
    t("Le conseil d\u2019administration est convoqué par le président, par lettre au porteur contre récépissé ou lettre recommandée avec demande d\u2019avis de réception, télécopie ou courrier électronique, {jours_convocation_ca} jours au moins avant la date de la réunion. Toutefois, ce délai peut être réduit ou la convocation verbale en cas d\u2019urgence."),
    p(""),
    t("Le conseil d\u2019administration se réunit au siège social ou en tout autre lieu indiqué dans la convocation, sur le territoire de l\u2019État partie du siège social."),
    p(""),

    b("Quorum et majorité"),
    t("Le conseil d\u2019administration ne délibère valablement que si la moitié au moins de ses membres sont présents ou représentés."),
    p(""),
    t("Les décisions sont prises à la majorité des membres présents ou représentés. {#voix_preponderante}En cas de partage des voix, la voix du président de séance est prépondérante.{/voix_preponderante}"),
    p(""),

    b("Représentation"),
    t("{#representation_ca_libre}Un administrateur peut se faire représenter par un mandataire de son choix.{/representation_ca_libre}{#representation_ca_administrateur}Un administrateur ne peut se faire représenter que par un autre administrateur.{/representation_ca_administrateur} Chaque administrateur ne peut disposer, au cours d\u2019une même séance, que d\u2019une seule procuration."),
    p(""),

    b("Visioconférence et procès-verbaux"),
    t("Les administrateurs peuvent participer aux réunions du conseil d\u2019administration par visioconférence ou par tout autre moyen de télécommunication permettant leur identification et garantissant leur participation effective, sauf pour l\u2019adoption des décisions relatives à l\u2019établissement des comptes annuels et du rapport de gestion."),
    p(""),
    t("Les délibérations du conseil d\u2019administration sont constatées par des procès-verbaux établis sur un registre spécial tenu au siège social, côté et paraphé par le juge de la juridiction compétente. Les procès-verbaux sont signés par le président de séance et par au moins un administrateur."),
    p(""),

    // ===== ARTICLE 17 =====
    b("Article 17 : Pouvoirs du conseil d\u2019administration"),
    t("Le conseil d\u2019administration détermine les orientations de l\u2019activité de la société et veille à leur mise en \u0153uvre. Sous réserve des pouvoirs expressément attribués aux assemblées d\u2019actionnaires et dans la limite de l\u2019objet social, il se saisit de toute question intéressant la bonne marche de la société et règle par ses délibérations les affaires qui la concernent."),
    p(""),
    t("Le conseil d\u2019administration procède aux contrôles et vérifications qu\u2019il juge opportuns. Il peut confier à un ou plusieurs de ses membres ou à des tiers, actionnaires ou non, tous mandats spéciaux pour un ou plusieurs objets déterminés."),
    p(""),
    t("Il peut décider la création de comités chargés d\u2019étudier les questions que lui-même ou son président soumet, pour avis, à leur examen."),
    p(""),

    // ===== ARTICLE 18 =====
    b("Article 18 : Direction générale"),
    p(""),

    t("{#variante_pca_dg}"),
    b("Variante : Président du conseil d\u2019administration et directeur général séparés"),
    p(""),
    b("Président du conseil d\u2019administration"),
    t("Le président du conseil d\u2019administration préside les réunions du conseil d\u2019administration. Il veille au bon fonctionnement des organes de la société et s\u2019assure que les administrateurs sont en mesure de remplir leur mission. Il organise et dirige les travaux du conseil d\u2019administration dont il rend compte à l\u2019assemblée générale."),
    p(""),
    t("Le président du conseil d\u2019administration représente le conseil d\u2019administration. Il est le garant du bon fonctionnement du conseil."),
    p(""),

    b("Directeur général"),
    t("La direction générale de la société est assumée, sous sa responsabilité, par une personne physique nommée par le conseil d\u2019administration, qui fixe sa rémunération et la durée de son mandat. Le directeur général est révocable à tout moment par le conseil d\u2019administration."),
    p(""),
    t("Le directeur général est investi des pouvoirs les plus étendus pour agir en toute circonstance au nom de la société. Il exerce ses pouvoirs dans la limite de l\u2019objet social et sous réserve de ceux que la loi attribue expressément aux assemblées d\u2019actionnaires et au conseil d\u2019administration."),
    p(""),
    t("Il représente la société dans ses rapports avec les tiers. La société est engagée même par les actes du directeur général qui ne relèvent pas de l\u2019objet social, à moins qu\u2019elle ne prouve que le tiers savait que l\u2019acte dépassait cet objet ou qu\u2019il ne pouvait l\u2019ignorer compte tenu des circonstances."),
    p(""),
    t("Le directeur général peut être lié à la société par un contrat de travail à condition que celui-ci corresponde à un emploi effectif."),
    p(""),
    t("Son mandat est renouvelable."),
    p(""),
    t("En cas d\u2019empêchement temporaire du directeur général, le conseil d\u2019administration peut déléguer un administrateur dans les fonctions de directeur général pour une durée limitée."),
    p(""),
    t("Le directeur général est révocable à tout moment par le conseil d\u2019administration. Si la révocation est décidée sans juste motif, elle peut donner lieu à dommages et intérêts."),
    t("{/variante_pca_dg}"),
    p(""),

    t("{#variante_pdg}"),
    b("Variante : Président-directeur général"),
    p(""),
    t("Le président du conseil d\u2019administration assume, sous sa responsabilité, la direction générale de la société. Il prend le titre de président-directeur général."),
    p(""),
    t("Le président-directeur général est investi des pouvoirs les plus étendus pour agir en toute circonstance au nom de la société. Il exerce ses pouvoirs dans la limite de l\u2019objet social et sous réserve de ceux que la loi attribue expressément aux assemblées d\u2019actionnaires et au conseil d\u2019administration."),
    p(""),
    t("Il représente la société dans ses rapports avec les tiers. La société est engagée même par les actes du président-directeur général qui ne relèvent pas de l\u2019objet social, à moins qu\u2019elle ne prouve que le tiers savait que l\u2019acte dépassait cet objet ou qu\u2019il ne pouvait l\u2019ignorer compte tenu des circonstances."),
    p(""),
    t("Le président-directeur général peut être lié à la société par un contrat de travail à condition que celui-ci corresponde à un emploi effectif."),
    p(""),
    t("Son mandat de directeur général a la même durée que son mandat de président du conseil d\u2019administration. Il est renouvelable."),
    p(""),
    t("En cas d\u2019empêchement temporaire du président-directeur général, le conseil d\u2019administration peut déléguer un administrateur dans les fonctions de directeur général pour une durée limitée."),
    p(""),
    t("Le président-directeur général est révocable à tout moment par le conseil d\u2019administration de ses fonctions de directeur général et de président. Si la révocation est décidée sans juste motif, elle peut donner lieu à dommages et intérêts."),
    t("{/variante_pdg}"),
    p(""),

    // ===== ARTICLE 19 =====
    b("Article 19 : Rémunération des dirigeants"),
    p(""),
    b("Indemnités des administrateurs"),
    t("L\u2019assemblée générale ordinaire peut allouer aux administrateurs, en rémunération de leur activité, une somme fixe annuelle à titre d\u2019indemnité de fonction. Le montant de cette indemnité est porté aux charges d\u2019exploitation."),
    p(""),
    t("La répartition de la rémunération entre les administrateurs est déterminée par le conseil d\u2019administration."),
    p(""),

    b("Rémunérations exceptionnelles"),
    t("Le conseil d\u2019administration peut allouer à certains de ses membres des rémunérations exceptionnelles pour des missions ou mandats qui leur sont confiés."),
    p(""),

    b("Rémunération du directeur général"),
    t("La rémunération du directeur général est fixée par le conseil d\u2019administration."),
    p(""),

    b("Avantages en nature"),
    t("L\u2019assemblée générale peut également autoriser le remboursement des frais de voyage, déplacements et dépenses engagés dans l\u2019intérêt de la société par les administrateurs et le directeur général, ainsi que leur allouer des avantages en nature."),
    p(""),

    // ===== ARTICLE 20 =====
    b("Article 20 : Conventions réglementées"),
    p(""),
    b("Conventions soumises à autorisation"),
    t("Toute convention intervenant entre la société et l\u2019un de ses administrateurs, son directeur général ou son directeur général adjoint, doit être soumise à l\u2019autorisation préalable du conseil d\u2019administration."),
    p(""),
    t("Il en est de même des conventions auxquelles un administrateur, le directeur général ou le directeur général adjoint est indirectement intéressé ou dans lesquelles il traite avec la société par personne interposée."),
    p(""),
    t("Sont également soumises à autorisation préalable du conseil d\u2019administration les conventions intervenant entre la société et une entreprise ou une personne morale, si l\u2019un des administrateurs, le directeur général ou le directeur général adjoint de la société est propriétaire, associé indéfiniment responsable, gérant, administrateur, directeur général, directeur général adjoint ou administrateur général de l\u2019entreprise ou de la personne morale contractante."),
    p(""),

    b("Rapport au commissaire aux comptes"),
    t("L\u2019administrateur, le directeur général ou le directeur général adjoint intéressé est tenu d\u2019informer le conseil d\u2019administration dès qu\u2019il a connaissance d\u2019une convention à laquelle les dispositions ci-dessus sont applicables. Le président du conseil d\u2019administration avise le commissaire aux comptes de toutes les conventions autorisées dans le délai d\u2019un mois à compter de leur conclusion."),
    p(""),
    t("Le commissaire aux comptes présente, sur ces conventions, un rapport spécial à l\u2019assemblée générale qui statue sur ce rapport."),
    p(""),

    b("Conventions interdites"),
    t("À peine de nullité du contrat, il est interdit aux administrateurs, au directeur général et au directeur général adjoint, ainsi qu\u2019à leurs conjoints, ascendants, descendants et aux personnes interposées, de contracter, sous quelque forme que ce soit, des emprunts auprès de la société, de se faire consentir par elle un découvert en compte courant ou autrement, ainsi que de faire cautionner ou avaliser par elle leurs engagements envers les tiers."),
    p(""),

    // ===== ARTICLE 21 =====
    b("Article 21 : Assemblée générale"),
    p(""),
    b("Convocation"),
    t("Les assemblées générales sont convoquées par le conseil d\u2019administration, ou à défaut par le commissaire aux comptes ou par toute personne habilitée à cet effet."),
    p(""),
    t("La convocation est faite quinze (15) jours au moins avant la date de l\u2019assemblée, soit par avis inséré dans un journal d\u2019annonces légales, soit par lettre au porteur contre récépissé ou lettre recommandée avec demande d\u2019avis de réception, télécopie ou courrier électronique. Les convocations par télécopie et courrier électronique ne sont valables que si l\u2019actionnaire a préalablement donné son accord écrit et communiqué son numéro de télécopie ou son adresse électronique, selon le cas."),
    p(""),

    b("Lieu de réunion"),
    t("Les assemblées générales sont réunies au siège social ou en tout autre endroit du territoire de l\u2019État partie où se situe le siège social."),
    p(""),

    b("Participation et représentation"),
    t("Tout actionnaire a le droit de participer aux assemblées sur justification de son identité, et de l\u2019inscription préalable des actions au nom de l\u2019actionnaire le jour de l\u2019assemblée générale dans les registres de titres nominatifs tenus par la société, ou de la production d\u2019un certificat de dépôt des actions au porteur délivré par l\u2019établissement bancaire ou financier dépositaire de ces actions."),
    p(""),
    t("{#representation_ag_libre}Un actionnaire peut se faire représenter par un mandataire de son choix, qu\u2019il soit actionnaire ou un tiers.{/representation_ag_libre}"),
    t("{#representation_ag_actionnaire}Un actionnaire ne peut se faire représenter que par un actionnaire.{/representation_ag_actionnaire}"),
    p(""),

    b("Feuille de présence et bureau"),
    t("Lors de chaque assemblée générale, il est tenu une feuille de présence émargée par les actionnaires présents et par les mandataires au moment de l\u2019entrée en séance."),
    t("Les procurations sont annexées à la feuille de présence à la fin de l\u2019assemblée."),
    t("La feuille de présence est certifiée sincère et véritable, sous leur responsabilité, par les scrutateurs."),
    p(""),
    t("Le bureau de l\u2019assemblée comprend un président et deux scrutateurs qui sont les deux actionnaires représentant le plus grand nombre d\u2019actions par eux-mêmes ou comme mandataires, sous réserve de leur acceptation."),
    t("Un secrétaire qui peut ou non être actionnaire est nommé pour établir le procès-verbal des débats."),
    t("Le procès-verbal de l\u2019assemblée est signé des membres du bureau et archivé au siège de la société avec la feuille de présence et ses annexes."),
    p(""),

    b("Assemblée Générale Ordinaire"),
    t("L\u2019Assemblée Générale Ordinaire prend toutes les décisions autres que celles qui sont expressément réservées aux Assemblées Générales Extraordinaires et aux assemblées spéciales."),
    p(""),
    t("L\u2019Assemblée Générale Ordinaire est réunie au moins une fois par an, dans les six mois de la clôture de l\u2019exercice, sous réserve de la prorogation de ce délai par décision de justice."),
    p(""),
    t("L\u2019Assemblée Générale Ordinaire ne délibère valablement, sur première convocation, que si les actionnaires présents ou représentés possèdent au moins le quart des actions ayant le droit de vote. Sur deuxième convocation, aucun quorum n\u2019est requis."),
    p(""),
    t("L\u2019Assemblée Générale Ordinaire statue à la majorité des voix exprimées. Dans le cas où il est procédé à un scrutin, il n\u2019est pas tenu compte des bulletins blancs dont disposent les actionnaires présents ou représentés."),
    p(""),

    b("Assemblée Générale Extraordinaire"),
    t("L\u2019Assemblée Générale Extraordinaire est seule habilitée à modifier les statuts dans toutes leurs dispositions. Tout actionnaire peut participer aux assemblées générales extraordinaires sans qu\u2019une limitation de voix puisse lui être opposée."),
    p(""),
    t("L\u2019Assemblée Générale Extraordinaire ne délibère valablement que si les actionnaires présents ou représentés possèdent au moins la moitié des actions, sur première convocation, et le quart des actions, sur deuxième et troisième convocations."),
    p(""),
    t("L\u2019Assemblée Générale Extraordinaire statue à la majorité des deux tiers des voix exprimées. Lorsqu\u2019il est procédé à un scrutin, il n\u2019est pas tenu compte des bulletins blancs. Cependant, la décision de transfert du siège social sur le territoire d\u2019un autre État est prise à l\u2019unanimité des membres présents ou représentés."),
    p(""),

    b("Assemblée spéciale"),
    t("L\u2019assemblée spéciale réunit les titulaires d\u2019actions d\u2019une catégorie déterminée. Elle approuve ou désapprouve les décisions des assemblées générales lorsque ces décisions modifient les droits de ses membres."),
    p(""),
    t("L\u2019assemblée spéciale ne délibère valablement que si les actionnaires présents ou représentés possèdent au moins la moitié des actions, sur première convocation, et le quart des actions, sur deuxième et troisième convocations."),
    t("L\u2019assemblée spéciale statue à la majorité des deux tiers des voix exprimées. Il n\u2019est pas tenu compte des bulletins blancs."),
    p(""),

    // ===== ARTICLE 22 =====
    b("Article 22 : Commissaires aux comptes"),
    t("Le contrôle est exercé par un ou plusieurs commissaires aux comptes titulaires et exerçant leur mission conformément à la loi."),
    p(""),
    t("Un ou plusieurs commissaires aux comptes suppléants appelés à remplacer les titulaires en cas de refus, d\u2019empêchement, de démission ou de décès, sont désignés en même temps que le ou les titulaires et pour la même durée."),
    p(""),
    t("Sont nommés comme premiers commissaires aux comptes, pour une durée de deux exercices sociaux :"),
    t("- en qualité de commissaire aux comptes titulaire, {cac_titulaire_civilite} {cac_titulaire_prenom} {cac_titulaire_nom}, demeurant à {cac_titulaire_adresse} ;"),
    t("- en qualité de commissaire aux comptes suppléant, {cac_suppleant_civilite} {cac_suppleant_prenom} {cac_suppleant_nom}, demeurant à {cac_suppleant_adresse}."),
    p(""),
    t("Leur mandat arrivera à expiration à l\u2019issue de l\u2019assemblée générale qui statue sur les comptes du deuxième exercice."),
    t("La durée du mandat des commissaires aux comptes désignés en cours de vie sociale est de six exercices."),
    p(""),

    // ===== ARTICLE 23 =====
    b("Article 23 : Comptes sociaux"),
    t("À la clôture de chaque exercice, le conseil d\u2019administration établit et arrête les états financiers de synthèse conformément aux dispositions de l\u2019Acte Uniforme relatif au droit comptable et à l\u2019information financière."),
    p(""),
    t("Le conseil d\u2019administration établit un rapport de gestion dans lequel il expose la situation de la société durant l\u2019exercice écoulé, son évolution prévisible et les perspectives de continuation de l\u2019activité, l\u2019évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("Les comptes annuels et le rapport de gestion sont communiqués au commissaire aux comptes et présentés à l\u2019assemblée générale ordinaire annuelle dans les conditions prévues par les dispositions de l\u2019Acte Uniforme relatif au droit des sociétés et du GIE."),
    p(""),

    // ===== ARTICLE 24 =====
    b("Article 24 : Affectation des résultats"),
    t("Il est pratiqué sur le bénéfice de l\u2019exercice diminué, le cas échéant, des pertes antérieures :"),
    t("- une dotation à la réserve légale égale à un dixième au moins. Cette dotation cesse d\u2019être obligatoire lorsque la réserve atteint le cinquième du montant du capital ;"),
    t("- les dotations nécessaires aux réserves statutaires."),
    p(""),
    t("L\u2019assemblée peut également décider la distribution de tout ou partie des réserves à l\u2019exception de celles déclarées indisponibles par la loi ou par les statuts. Dans ce cas, elle indique expressément les postes de réserve sur lesquels les prélèvements sont effectués."),
    p(""),
    t("La mise en paiement des dividendes doit avoir lieu dans un délai maximum de neuf mois après la clôture de l\u2019exercice. Ce délai peut être prorogé par le président de la juridiction compétente."),
    p(""),

    // ===== ARTICLE 25 =====
    b("Article 25 : Dissolution - Liquidation"),
    p(""),
    it("- Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le conseil d\u2019administration est tenu, dans les quatre mois qui suivent l\u2019approbation des comptes ayant fait apparaître cette perte, de convoquer l\u2019assemblée générale extraordinaire à l\u2019effet de décider si la dissolution anticipée de la société a lieu."),
    p(""),
    t("Si la dissolution n\u2019est pas prononcée, la société est tenue, au plus tard à la clôture du deuxième exercice suivant celui au cours duquel la constatation des pertes est intervenue, de réduire son capital, d\u2019un montant au moins égal à celui des pertes qui n\u2019ont pu être imputées sur les réserves si, dans ce délai, les capitaux propres n\u2019ont pas été reconstitués à concurrence d\u2019une valeur au moins égale à la moitié du capital social."),
    p(""),
    t("La décision de l\u2019assemblée générale extraordinaire est déposée au greffe du tribunal chargé des affaires commerciales du lieu du siège social et inscrite au registre du commerce et du crédit mobilier."),
    t("Elle est publiée dans un journal d\u2019annonces légales."),
    p(""),
    it("- Dissolution non motivée par des pertes"),
    t("La société peut être dissoute par l\u2019arrivée du terme ou par la volonté des actionnaires réunis en assemblée générale extraordinaire."),
    p(""),
    it("- Effets de la dissolution"),
    t("La dissolution de la société entraîne sa mise en liquidation. Un ou plusieurs liquidateurs sont nommés parmi les actionnaires ou en dehors d\u2019eux."),
    p(""),
    t("Le liquidateur représente la société qu\u2019il engage pour tous les actes de la liquidation."),
    p(""),
    t("Il est investi des pouvoirs les plus étendus pour réaliser l\u2019actif, même à l\u2019amiable. Il est habilité à payer les créanciers et à répartir entre les associés le solde disponible. Il ne peut continuer les affaires en cours ou en engager de nouvelles, pour les besoins de la liquidation, que s\u2019il y a été autorisé par l\u2019organe qui l\u2019a désigné."),
    p(""),

    // ===== ARTICLE 26 =====
    b("Article 26 : Contestation"),
    t("Toutes contestations relatives aux affaires de la société qui peuvent survenir en cours de vie sociale ou lors de la liquidation, soit entre actionnaires, soit entre un ou des actionnaires et la société, sont soumises au tribunal chargé des affaires commerciales compétent."),
    p(""),

    // ===== ARTICLE 27 =====
    b("Article 27 : Frais"),
    t("Les frais, droits et honoraires des présents statuts sont à la charge de la société."),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait à {lieu_signature}, le {date_signature} en {nombre_associes} originaux.", false, 24, true),
    p(""),
    p("Signatures", false, 24, true, true),
    p("(noms et signatures)", false, 24, true, true),
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

  const outputDir = path.join(__dirname, "../templates/sa-ca");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template SA CA créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
