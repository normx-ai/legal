/**
 * Script pour créer le template DOCX des statuts SA avec Administrateur Général
 * Basé sur le modèle officiel du Guide Pratique OHADA (pages 544-558)
 * Usage : npx tsx scripts/create-sa-ag-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 Anonyme avec Administrateur G\u00E9n\u00E9ral au capital de {capital} {devise}</w:t></w:r></w:p>
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SA AG \u2014 {denomination}</w:t></w:r>
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
    p("Société Anonyme avec Administrateur Général", false, 28, true),
    p("Au capital de {capital} {devise}", false, 24, true),
    p("", false, 24, true),
    p("Siège social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("STATUTS", true, 36, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("", false, 24, true),
    p("Établis le {date_signature}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("STATUTS - « SOCIÉTÉ ANONYME AVEC ADMINISTRATEUR GÉNÉRAL »"),
    p(""),

    // PRÉAMBULE
    t("Entre les soussignés :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, {profession}, demeurant à {adresse} ;"),
    t("{/associes}"),
    p(""),
    t("Il est établi ainsi qu'il suit les statuts de la société anonyme qui va exister entre eux et tous autres propriétaires d'actions qui pourraient entrer dans la société ultérieurement."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé entre les soussignés une société anonyme avec Administrateur Général qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE, et tous textes ultérieurs complémentaires ou modificatifs."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Dénomination"),
    t("La société a pour dénomination « {denomination} »."),
    t("{#has_sigle}Éventuellement : Son sigle est : « {sigle} ».{/has_sigle}"),
    t("La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie, immédiatement en caractères lisibles, de l'indication de la forme de la société, du montant de son capital social, de l'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du crédit mobilier."),
    p(""),

    // ARTICLE 3
    b("Article 3 : Objet"),
    t("La société a pour objet, {objet_social}."),
    t("Et, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, pouvant se rattacher directement ou indirectement à l'objet ci-dessus ou à tous objets similaires ou connexes, de nature à favoriser son extension ou son développement."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Siège social"),
    t("Le siège social est fixé à {siege_social}, {ville}, {pays}."),
    t("Il peut être transféré dans les limites du territoire d'un même État partie par décision de l'administrateur général qui modifie les statuts en conséquence, sous réserve de la ratification de cette décision par la prochaine assemblée générale ordinaire."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Durée"),
    t("La société a une durée de {duree} ans (99 ans maximum), sauf dissolution anticipée ou prorogation."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Exercice social"),
    t("L'exercice social commence le {exercice_debut} et se termine le {exercice_fin} de chaque année."),
    t("Par exception, le premier exercice social sera clos le {premier_exercice_fin}."),
    p(""),

    // ARTICLE 7
    b("Article 7 : Apports"),
    t("Lors de la constitution de la société, il a été apporté :"),
    p(""),
    b("I - Apports en numéraire"),
    t("{#associes}"),
    t("{civilite} {prenom} {nom} : FCFA {apport}"),
    t("{/associes}"),
    b("Total de l'apport en numéraire : FCFA {total_apports_numeraire}"),
    p(""),
    t("Les apports en numéraire de FCFA {total_apports_numeraire} ({total_apports_numeraire_lettres}) correspondent à {nombre_actions_numeraire} actions de FCFA {valeur_nominale} chacune, souscrites et libérées ({mode_liberation}) ainsi qu'il résulte du certificat du dépositaire établi le {date_certificat_depot} par {nom_depositaire}."),
    p(""),
    t("Les sommes correspondantes ont été déposées, pour le compte de la société, à {lieu_depot}."),
    p(""),
    t("{#is_liberation_partielle}La libération du surplus, soit FCFA {montant_surplus} par action interviendra dans les conditions prévues à l'article 11 ci-après.{/is_liberation_partielle}"),
    p(""),

    t("{#has_apports_nature}"),
    b("II - Apports en nature et/ou stipulation d'avantages particuliers"),
    t("{#associes_nature}"),
    t("{civilite} {prenom} {nom}, en s'obligeant à toutes les garanties ordinaires et de droit, fait apport à la société de {description_apport_nature}."),
    p(""),
    t("En rémunération de cet apport, évalué à FCFA {montant_apport_nature}, {civilite} {prenom} {nom} se voit attribuer {actions_nature} actions."),
    p(""),
    t("{/associes_nature}"),
    t("Cette évaluation a été faite au vu du rapport de {commissaire_apports_nom}, commissaire aux apports, désigné à l'unanimité des futurs associés, en date du {date_rapport_commissaire}, déposé au lieu du futur siège le {date_depot_rapport}, et dont un exemplaire est annexé aux présents."),
    p(""),
    t("{/has_apports_nature}"),

    b("III - Récapitulation des apports"),
    t("1. Apports en numéraire pour un montant total de FCFA {total_apports_numeraire}"),
    t("{#has_apports_nature}2. Apports en nature pour un montant total de FCFA {total_apports_nature}{/has_apports_nature}"),
    b("Soit, au total : FCFA {total_apports} ({total_apports_lettres})"),
    t("correspondant au montant du capital."),
    p(""),

    // ARTICLE 8
    b("Article 8 : Capital social"),
    t("Le capital social est fixé à la somme de FCFA {capital} ({capital_lettres}), divisé en :"),
    t("- {nombre_actions_numeraire} actions de numéraire de FCFA {valeur_nominale} chacune, ainsi ventilées :"),
    t("{#associes}"),
    t("* {civilite} {prenom} {nom} : à concurrence de {actions} actions numérotées de {numero_debut} à {numero_fin} ;"),
    t("{/associes}"),
    p(""),
    t("{#has_apports_nature}- {nombre_actions_nature} actions d'apport de FCFA {valeur_nominale} chacune, ainsi ventilées :"),
    t("{#associes_nature}"),
    t("* {civilite} {prenom} {nom} : à concurrence de {actions_nature} actions numérotées de {numero_debut_nature} à {numero_fin_nature} ;"),
    t("{/associes_nature}"),
    t("{/has_apports_nature}"),
    p(""),

    // ARTICLE 9
    b("Article 9 : Modification du capital"),
    t("Le capital social peut être augmenté, réduit ou amorti dans les conditions prévues par la loi."),
    p(""),
    t("Le capital social peut être augmenté, soit par émission d'actions nouvelles, soit par majoration du montant nominal des actions existantes."),
    p(""),
    t("Les actions nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices ou primes d'émission, soit par apport en nature."),
    p(""),
    t("L'assemblée générale extraordinaire est seule compétente pour décider, sur le rapport de l'administrateur général, une augmentation du capital."),
    p(""),
    t("Les actionnaires ont, proportionnellement au montant de leurs actions, un droit de préférence à la souscription des actions de numéraire émises pour réaliser une augmentation de capital, droit auquel ils peuvent renoncer à titre individuel. Ils disposent, en outre, d'un droit de souscription à titre réductible si l'assemblée générale l'a décidé expressément."),
    p(""),
    t("Le droit à l'attribution d'actions nouvelles, à la suite de l'incorporation au capital de réserves, bénéfices ou primes d'émission, appartient au nu-propriétaire, sous réserve des droits de l'usufruitier."),
    p(""),
    t("Ces droits sont négociables ou cessibles comme les actions auxquelles ils sont attachés."),
    p(""),
    t("Le capital social peut être réduit, soit par la diminution de la valeur nominale des actions, soit par la diminution du nombre des actions."),
    p(""),
    t("La réduction du capital est autorisée ou décidée par l'assemblée générale extraordinaire, qui peut déléguer à l'administrateur général tous les pouvoirs pour la réaliser."),
    p(""),
    t("Mais en aucun cas la réduction du capital ne peut porter atteinte à l'égalité des actionnaires sauf consentement exprès de ceux-ci. Elle est décidée dans le respect des droits des créanciers."),
    p(""),
    t("L'assemblée générale ordinaire peut décider l'amortissement du capital par prélèvement sur les bénéfices ou sur les réserves, à l'exclusion de la réserve légale et sauf autorisation de l'assemblée générale extraordinaire, des réserves statutaires, dans les conditions prévues par la loi."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Comptes courants"),
    t("Les actionnaires peuvent mettre ou laisser à la disposition de la société, toutes sommes, produisant ou non intérêts, dont celle-ci peut avoir besoin."),
    p(""),
    t("Les modalités de ces prêts sont arrêtées par accord entre l'administrateur général et l'intéressé."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Libération des actions"),
    t("Les actions de numéraire émises à la suite d'une augmentation de capital résultant pour partie d'une incorporation de réserves, bénéfices ou primes d'émission et pour partie d'un versement en espèces, doivent être intégralement libérées lors de leur souscription. Toutes autres actions de numéraire peuvent être libérées, lors de leur souscription, du quart."),
    p(""),
    t("La libération du surplus intervient en une ou plusieurs fois sur décision de l'administrateur général dans un délai maximum de trois ans à compter soit de l'immatriculation de la société, soit du jour où l'augmentation de capital est devenue définitive."),
    p(""),
    t("Les actionnaires qui le souhaitent peuvent procéder à des versements anticipés."),
    p(""),
    t("Les appels de fonds sont portés à la connaissance des souscripteurs {jours_appel_fonds} jours au moins avant la date fixée pour chaque versement, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, adressée à chaque actionnaire."),
    p(""),
    t("A défaut par l'actionnaire de se libérer aux époques fixées par l'administrateur général, les sommes dues sont, de plein droit, productives d'intérêt au taux de l'intérêt légal, à compter de la date d'exigibilité, sans préjudice des autres recours et sanctions prévus par la loi."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Forme des actions"),
    t("Les actions sont nominatives."),
    p(""),
    t("L'administrateur général est habilité à tenir les registres de titres nominatifs émis par la société. Les registres contiennent les mentions relatives aux opérations de transfert, de conversion, de nantissement et de séquestre des titres, et notamment :"),
    t("1°) La date de l'opération ;"),
    t("2°) Les nom, prénoms et domicile de l'ancien et du nouveau titulaire des titres, en cas de transfert ;"),
    t("3°) La valeur nominale et le nombre de titres transférés ou convertis ;"),
    t("4°) Le cas échéant, si la société a émis des actions de différentes catégories, la catégorie et les caractéristiques des actions transférées ou converties ;"),
    t("5°) Un numéro d'ordre affecté à l'opération."),
    p(""),
    t("Toutes les écritures contenues dans les registres doivent être signées par l'administrateur général."),
    p(""),
    t("Les titres nominatifs sont représentés par des certificats indiquant les nom, prénoms et domicile du titulaire, le nombre d'actions, la valeur nominale, le numéro des actions possédées par le titulaire et la date de jouissance."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Cession et transmission des actions"),
    t("Les actions ne sont négociables qu'après l'immatriculation de la société au registre du commerce et du crédit mobilier. En cas d'augmentation de capital, les actions sont négociables à compter de l'inscription de la mention modificative. Les actions de numéraire ne sont négociables qu'après avoir été entièrement libérées. Elles demeurent négociables après la dissolution de la société et jusqu'à la clôture de la liquidation."),
    p(""),
    t("La cession doit être constatée par écrit. Elle n'est rendue opposable à la société qu'après l'accomplissement de l'une des formalités suivantes :"),
    t("1°) signification de la cession à la société par acte d'huissier ou notification par tout moyen permettant d'établir sa réception effective par le destinataire ;"),
    t("2°) acceptation de la cession par la société dans un acte authentique ;"),
    t("3°) dépôt d'un original de l'acte de cession au siège social contre remise par l'administrateur général d'une attestation de dépôt."),
    p(""),
    t("La cession n'est opposable aux tiers qu'après accomplissement de l'une des formalités ci-dessus et publicité au registre du commerce et du crédit mobilier."),
    p(""),
    t("Les frais de transfert des actions sont à la charge des cessionnaires, sauf convention contraire entre cédants et cessionnaires."),
    p(""),
    t("Les cessions entre actionnaires, ou au profit des héritiers, des conjoints, des ascendants et descendants ou encore la liquidation de la communauté des biens entre époux sont libres."),
    p(""),

    // Cession à des tiers — variantes conditionnelles
    t("Cession à des tiers :"),
    p(""),
    t("{#clause_agrement}"),
    b("Clause d'agrément"),
    t("Toute transmission d'actions à un tiers étranger, soit à titre onéreux, soit à titre gratuit, sauf :"),
    t("- la transmission au profit des héritiers en cas de succession ou aux époux en cas liquidation de la communauté des biens ;"),
    t("- la cession à un conjoint, ascendant, descendant, est soumise à l'agrément de l'assemblée générale ordinaire des actionnaires dans les conditions ci-après ;"),
    t("- le cédant joint à sa demande d'agrément adressée à la société par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, ou par télécopie, les nom, prénoms, qualité et adresse du cessionnaire proposé, le nombre d'actions dont la transmission est envisagée et le prix offert ;"),
    t("- L'agrément résulte soit d'une notification, soit du défaut de réponse dans le délai de trois (3) mois à compter de la demande ;"),
    t("- Si la société n'agrée pas le cessionnaire proposé, l'administrateur général, est tenu dans le délai de trois (3) mois à compter de la notification de refus, de faire acquérir les actions soit par un ou plusieurs actionnaire(s), soit par un tiers, soit par la société ;"),
    t("- A défaut d'accord entre les parties, le prix de cession est déterminé à dire d'expert désigné, soit par les parties, soit à défaut d'accord entre elles, par la juridiction compétente à la demande de la partie la plus diligente ;"),
    t("- Si à l'expiration du délai de trois (3) mois à compter du refus d'agrément, l'achat n'est pas réalisé, l'agrément est considéré comme donné ;"),
    t("- Le cédant peut, à tout moment, renoncer à la cession de ses actions ;"),
    t("- Toute cession d'actions réalisée en violation de la clause d'agrément est nulle."),
    t("{/clause_agrement}"),
    p(""),

    t("{#clause_preemption}"),
    b("Clause de préemption"),
    t("L'actionnaire qui entend céder tout ou partie de ses actions est tenu de le notifier à tous les actionnaires, qui peuvent faire connaître au cédant qu'ils exercent un droit de préemption aux prix et conditions qui lui ont été notifiés."),
    p(""),
    t("La notification doit être effectuée par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, ou par télécopie les nom, prénoms, qualité et adresse du cessionnaire proposé, le nombre d'actions dont la transmission est envisagée et le prix offert."),
    p(""),
    t("A l'expiration du délai de {delai_preemption} mois à compter de la réception de la notification, si les droits de préemption n'ont pas été exercés en totalité sur les actions concernées, le cédant pourra réaliser librement la cession."),
    p(""),
    t("Toute cession d'actions réalisée en violation du droit de préemption est nulle."),
    t("{/clause_preemption}"),
    p(""),

    t("{#clause_inalienabilite}"),
    b("Clause d'inaliénabilité"),
    t("Pendant une durée de {duree_inalienabilite} années (cette durée ne peut dépasser 10 ans) à compter de {date_debut_inalienabilite}, les actionnaires ne pourront céder les actions ainsi que les droits de souscription et d'attribution en cas d'augmentation de capital."),
    t("{/clause_inalienabilite}"),
    p(""),

    // ARTICLE 14
    b("Article 14 : Droits et obligations attachés aux actions"),
    t("A chaque action est attaché un droit de vote proportionnel à la quotité du capital qu'elle représente et chaque action donne droit à une voix au moins. En outre, elle donne droit au vote et à la représentation dans les assemblées générales, dans les conditions légales et statutaires."),
    p(""),
    t("Un droit de vote double de celui conféré aux autres actions, eu égard à la quotité du capital qu'elles représentent, peut être conféré par l'assemblée générale extraordinaire aux actions nominatives entièrement libérées pour lesquelles il est justifié d'une inscription nominative depuis au moins deux (2) ans au nom d'un même actionnaire."),
    p(""),
    t("A chaque action est attaché un droit au dividende proportionnel à la quotité du capital qu'elle représente."),
    p(""),
    t("L'assemblée générale extraordinaire peut décider la création d'actions de préférence jouissant d'avantages particuliers par rapport à toutes les autres actions."),
    p(""),
    t("Les actionnaires ne supportent les pertes qu'à concurrence de leurs apports. Les droits et obligations attachés à l'action suivent le titre dans quelle que main qu'il passe. La propriété d'une action emporte de plein droit adhésion aux statuts et aux décisions de l'assemblée générale."),
    p(""),

    // ARTICLE 15
    b("Article 15 : Administration et direction de la société"),
    p(""),
    b("Nomination de l'administrateur général"),
    t("La société est administrée par un administrateur général qui en assume la direction générale."),
    p(""),
    t("Le premier administrateur général est désigné dans les statuts pour une durée de deux (2) ans (au plus)."),
    p(""),
    t("Est nommé premier administrateur général : {ag_civilite} {ag_prenom} {ag_nom}, né(e) le {ag_date_naissance} à {ag_lieu_naissance}, de nationalité {ag_nationalite}, demeurant à {ag_adresse}."),
    p(""),
    t("En cours de vie sociale, l'administrateur général est nommé par l'assemblée générale ordinaire, pour un mandat ne pouvant excéder six (6) ans."),
    p(""),
    t("Il est choisi parmi les actionnaires ou en dehors d'eux."),
    t("Son mandat est renouvelable."),
    p(""),
    b("Attributions de l'administrateur général"),
    t("Il est investi des pouvoirs les plus étendus pour agir en toutes circonstances au nom de la société et les exerce dans la limite de l'objet social et sous réserve de ceux expressément attribués aux assemblées d'actionnaires par la loi et les statuts."),
    p(""),
    t("Il arrête les comptes de la société."),
    t("L'administrateur général convoque et préside les réunions."),
    t("Il représente la société dans ses rapports avec les tiers."),
    p(""),
    t("Dans ses rapports avec les tiers, la société est engagée par les actes de l'administrateur général qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que les tiers savaient que l'acte dépassait cet objet ou qu'ils ne pouvaient l'ignorer compte tenu des circonstances, sans que la seule publication des statuts suffise à constituer cette preuve."),
    p(""),

    b("Rémunérations"),
    t("L'administrateur général peut être lié à la société par un contrat de travail à la condition que celui-ci corresponde à un emploi effectif."),
    t("Le contrat de travail est soumis à l'autorisation préalable de l'assemblée générale."),
    p(""),
    t("L'assemblée générale peut, en dehors de sa rémunération relevant de son contrat de travail, allouer à l'administrateur général :"),
    t("- une somme fixe annuelle à titre d'indemnité de fonction, en rémunération de ses activités ;"),
    t("- des rémunérations exceptionnelles pour des missions et mandats qui lui sont confiés ;"),
    t("- des avantages en nature."),
    p(""),
    t("Elle peut également autoriser le remboursement des frais de voyage, déplacements et dépenses engagés dans l'intérêt de la société."),
    p(""),

    b("Conventions, cautionnements, avals, garanties"),
    t("Dans le respect des dispositions légales relatives aux conventions réglementées, l'administrateur général présente, à l'assemblée générale ordinaire statuant sur les états financiers de synthèse de l'exercice écoulé, un rapport :"),
    t("- sur les conventions qu'il a conclues avec la société, directement ou indirectement, ou par personne interposée ;"),
    t("- sur les conventions passées avec une personne morale dont il est propriétaire, associé indéfiniment responsable ou d'une manière générale, dirigeant social."),
    p(""),
    t("Les cautionnements, avals, garanties autonomes ou contre-garanties autonomes et autres garanties donnés dans des sociétés autres que celles exploitant des établissements de crédit, de microfinance ou d'assurance caution dûment agréées par l'administrateur général ou par l'administrateur général adjoint ne sont opposables à la société que s'ils ont été autorisés préalablement par l'assemblée générale ordinaire, soit d'une manière générale, soit d'une manière spéciale."),
    p(""),
    t("Il est interdit à l'administrateur général et à l'administrateur général adjoint, ainsi qu'à leurs conjoints, ascendants, descendants et aux personnes interposées, de contracter, sous quelque forme que ce soit, des emprunts auprès de la société, de se faire consentir par elle un découvert en compte courant ou autrement, ainsi que de faire cautionner ou avaliser par elle leurs engagements envers les tiers."),
    p(""),

    b("Administrateur général adjoint"),
    t("Sur proposition de l'administrateur général, l'assemblée générale des actionnaires peut donner mandat à une ou plusieurs personnes d'assister l'administrateur général à titre d'administrateur général adjoint."),
    p(""),
    t("L'assemblée fixe à {duree_mandat_ag_adjoint} années la durée du mandat de l'administrateur général adjoint."),
    p(""),

    b("Révocation, empêchement temporaire, décès ou démission"),
    t("L'administrateur général peut être révoqué à tout moment par l'assemblée générale."),
    p(""),
    t("En cas d'empêchement temporaire de l'administrateur général, ses fonctions sont provisoirement exercées par l'administrateur général adjoint."),
    p(""),
    t("En cas de décès ou de démission de l'administrateur général, ses fonctions sont exercées par l'administrateur général adjoint jusqu'à la nomination, par la plus prochaine assemblée générale ordinaire, d'un nouvel administrateur général."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Assemblée générale"),
    t("Les assemblées générales sont convoquées par l'administrateur général, ou à défaut par le commissaire aux comptes ou par toute personne habilitée à cet effet."),
    p(""),
    t("La convocation est faite quinze jours au moins avant la date de l'assemblée, soit par avis inséré dans un journal d'annonces légales, soit par lettre au porteur contre récépissé ou lettre recommandée avec demande d'avis de réception, télécopie ou courrier électronique. Les convocations par télécopie et courrier électronique ne sont valables que si l'associé a préalablement donné son accord écrit et communiqué son numéro de télécopie ou son adresse électronique, selon le cas."),
    p(""),
    t("Les assemblées générales sont réunies au siège social ou en tout autre endroit du territoire de l'État partie où se situe le siège social."),
    p(""),
    t("Tout actionnaire a le droit de participer aux assemblées sur justification de son identité, et de l'inscription préalable des actions au nom de l'actionnaire le jour de l'assemblée générale dans les registres de titres nominatifs tenus par la société, ou de la production d'un certificat de dépôt des actions au porteur délivré par l'établissement bancaire ou financier dépositaire de ces actions."),
    p(""),
    t("{#representation_libre}Un actionnaire peut se faire représenter par un mandataire de son choix, qu'il soit actionnaire ou un tiers.{/representation_libre}"),
    t("{#representation_actionnaire}Un actionnaire ne peut se faire représenter que par un actionnaire.{/representation_actionnaire}"),
    p(""),
    t("Lors de chaque assemblée générale, il est tenu une feuille de présence émargée par les actionnaires présents et par les mandataires au moment de l'entrée en séance."),
    t("Les procurations sont annexées à la feuille de présence à la fin de l'assemblée."),
    t("La feuille de présence est certifiée sincère et véritable, sous leur responsabilité, par les scrutateurs."),
    p(""),
    t("Le bureau de l'assemblée comprend un président et deux scrutateurs qui sont les deux actionnaires représentant le plus grand nombre d'actions par eux-mêmes ou comme mandataires, sous réserve de leur acceptation."),
    t("Un secrétaire qui peut ou non être actionnaire est nommé pour établir le procès-verbal des débats."),
    t("Le procès-verbal de l'assemblée est signé des membres du bureau et archivé au siège de la société avec la feuille de présence et ses annexes."),
    p(""),

    b("Assemblée Générale Ordinaire"),
    t("L'Assemblée Générale Ordinaire prend toutes les décisions autres que celles qui sont expressément réservées aux Assemblées Générales extraordinaires et aux assemblées spéciales."),
    p(""),
    t("L'Assemblée Générale Ordinaire est réunie au moins une fois par an, dans les six mois de la clôture de l'exercice, sous réserve de la prorogation de ce délai par décision de justice."),
    p(""),
    t("L'Assemblée Générale Ordinaire ne délibère valablement, sur première convocation, que si les actionnaires présents ou représentés possèdent au moins le quart des actions ayant le droit de vote. Sur deuxième convocation, aucun quorum n'est requis."),
    p(""),
    t("L'Assemblée Générale Ordinaire statue à la majorité des voix exprimées. Dans le cas où il est procédé à un scrutin, il n'est pas tenu compte des bulletins blancs dont disposent les actionnaires présents ou représentés."),
    p(""),

    b("Assemblée Générale extraordinaire"),
    t("L'Assemblée Générale extraordinaire est seule habilitée à modifier les statuts dans toutes leurs dispositions. Tout actionnaire peut participer aux assemblées générales extraordinaires sans qu'une limitation de voix puisse lui être opposée."),
    p(""),
    t("L'Assemblée Générale extraordinaire ne délibère valablement que si les actionnaires présents ou représentés possèdent au moins la moitié des actions, sur première convocation, et le quart des actions, sur deuxième et troisième convocations."),
    p(""),
    t("L'Assemblée Générale Extraordinaire statue à la majorité des deux tiers des voix exprimées. Lorsqu'il est procédé à un scrutin, il n'est pas tenu compte des bulletins blancs. Cependant, la décision de transfert du siège social sur le territoire d'un autre État est prise à l'unanimité des membres présents ou représentés."),
    p(""),

    b("Assemblée spéciale"),
    t("L'assemblée spéciale réunit les titulaires d'actions d'une catégorie déterminée. Elle approuve ou désapprouve les décisions des assemblées générales lorsque ces décisions modifient les droits de ses membres."),
    p(""),
    t("L'assemblée spéciale ne délibère valablement que si les actionnaires présents ou représentés possèdent au moins la moitié des actions, sur première convocation, et le quart des actions, sur deuxième et troisième convocations."),
    t("L'assemblée spéciale statue à la majorité des deux tiers des voix exprimées. Il n'est pas tenu compte des bulletins blancs."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Commissaires aux comptes"),
    t("Le contrôle est exercé par un ou plusieurs commissaires aux comptes titulaires et exerçant leur mission conformément à la loi."),
    p(""),
    t("Un ou plusieurs commissaires aux comptes suppléants appelés à remplacer les titulaires en cas de refus, d'empêchement, de démission ou de décès, sont désignés en même temps que le ou les titulaires et pour la même durée."),
    p(""),
    t("Sont nommés comme premiers commissaires aux comptes, pour une durée de deux exercices sociaux :"),
    t("- en qualité de commissaire aux comptes titulaires, {cac_titulaire_civilite} {cac_titulaire_prenom} {cac_titulaire_nom}, demeurant à {cac_titulaire_adresse} ;"),
    t("- en qualité de commissaire aux comptes suppléants, {cac_suppleant_civilite} {cac_suppleant_prenom} {cac_suppleant_nom}, demeurant à {cac_suppleant_adresse}."),
    p(""),
    t("Leur mandat arrivera à expiration à l'issue de l'assemblée générale qui statue sur les comptes du deuxième exercice."),
    t("La durée du mandat des commissaires aux comptes désignés en cours de vie sociale est de six exercices."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Comptes sociaux"),
    t("A la clôture de chaque exercice, l'administrateur général établit et arrête les états financiers de synthèse."),
    p(""),
    t("L'administrateur général établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("Les comptes annuels et le rapport de gestion sont communiqués au commissaire aux comptes et présentés à l'assemblée générale ordinaire annuelle dans les conditions prévues par les dispositions de l'Acte Uniforme relatif au droit des sociétés et du GIE."),
    p(""),

    // ARTICLE 19
    b("Article 19 : Affectation des résultats"),
    t("Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures :"),
    t("- une dotation à la réserve légale égale à un dixième au moins. Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital ;"),
    t("- les dotations nécessaires aux réserves statutaires."),
    p(""),
    t("L'assemblée peut également décider la distribution de tout ou partie des réserves à l'exception de celles déclarées indisponibles par la loi ou par les statuts. Dans ce cas, elle indique expressément les postes de réserve sur lesquels les prélèvements sont effectués."),
    p(""),
    t("La mise en paiement des dividendes doit avoir lieu dans un délai maximum de neuf mois après la clôture de l'exercice. Ce délai peut être prorogé par le président de la juridiction compétente."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Dissolution - Liquidation"),
    p(""),
    it("- Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, l'administrateur général est tenu, dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, de convoquer l'assemblée générale extraordinaire à l'effet de décider si la dissolution anticipée de la société a lieu."),
    p(""),
    t("Si la dissolution n'est pas prononcée, la société est tenue, au plus tard à la clôture du deuxième exercice suivant celui au cours duquel la constatation des pertes est intervenue, de réduire son capital, d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves si, dans ce délai, les capitaux propres n'ont pas été reconstitués à concurrence d'une valeur au moins égale à la moitié du capital social."),
    p(""),
    t("La décision de l'assemblée générale extraordinaire est déposée au greffe du tribunal chargé des affaires commerciales du lieu du siège social et inscrite au registre du commerce et du crédit mobilier."),
    t("Elle est publiée dans un journal d'annonces légales."),
    p(""),
    it("- Dissolution non motivée par des pertes"),
    t("La société peut être dissoute par l'arrivée du terme ou par la volonté des actionnaires réunis en assemblée générale extraordinaire."),
    p(""),
    it("- Effets de la dissolution"),
    t("La dissolution de la société entraîne sa mise en liquidation. Un ou plusieurs liquidateurs sont nommés parmi les actionnaires ou en dehors d'eux."),
    p(""),
    t("Le liquidateur représente la société qu'il engage pour tous les actes de la liquidation."),
    p(""),
    t("Il est investi des pouvoirs les plus étendus pour réaliser l'actif, même à l'amiable. Il est habilité à payer les créanciers et à répartir entre les associés le solde disponible. Il ne peut continuer les affaires en cours ou en engager de nouvelles, pour les besoins de la liquidation, que s'il y a été autorisé par l'organe qui l'a désigné."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Contestation - Élection de domicile"),
    t("Toutes contestations relatives aux affaires de la société qui peuvent survenir en cours de vie sociale ou lors de la liquidation, soit entre actionnaires, soit entre un ou des actionnaires et la société, sont soumises au tribunal chargé des affaires commerciales compétent."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Frais"),
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

  const outputDir = path.join(__dirname, "../templates/sa-ag");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template SA AG créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
