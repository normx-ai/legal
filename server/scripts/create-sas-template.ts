/**
 * Script pour créer le template DOCX des statuts SAS (Société par Actions Simplifiée)
 * Basé sur le modèle officiel du Guide Pratique OHADA (pages 567-585)
 * 23 articles — Président (personne physique ou morale), capital min 1.000.000 FCFA,
 * valeur nominale libre, grande liberté statutaire.
 * Usage : npx tsx scripts/create-sas-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 par Actions Simplifi\u00E9e au capital de {capital} {devise}</w:t></w:r></w:p>
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SAS \u2014 {denomination}</w:t></w:r>
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
    p("Société par Actions Simplifiée", false, 28, true),
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
    c("STATUTS - « SOCIÉTÉ PAR ACTIONS SIMPLIFIÉE »"),
    p(""),

    // PRÉAMBULE
    t("Entre les soussignés :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, {profession}, demeurant à {adresse} ;"),
    t("{/associes}"),
    p(""),
    t("Il est établi ainsi qu'il suit les statuts de la société par actions simplifiée qui va exister entre eux et tous autres propriétaires d'actions qui pourraient entrer dans la société ultérieurement."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé entre les soussignés une société par actions simplifiée qui sera régie par les dispositions de l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE, les règles de la société anonyme dans la mesure où elles sont compatibles avec les dispositions particulières prévues pour la SAS, les présents statuts, et tous textes ultérieurs complémentaires ou modificatifs."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Dénomination"),
    t("La société a pour dénomination « {denomination} »."),
    t("{#has_sigle}Son sigle est : « {sigle} ».{/has_sigle}"),
    t("La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie, immédiatement en caractères lisibles, de l'indication de la forme de la société « SAS » ou « Société par Actions Simplifiée », du montant de son capital social, de l'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du crédit mobilier."),
    p(""),

    // ARTICLE 3
    b("Article 3 : Objet"),
    t("La société a pour objet, {objet_social}."),
    t("Et, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, pouvant se rattacher directement ou indirectement à l'objet ci-dessus ou à tous objets similaires ou connexes, de nature à favoriser son extension ou son développement."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Siège social"),
    t("Le siège social est fixé à {siege_social}, {ville}, {pays}."),
    t("Il peut être transféré en tout autre lieu par décision du président, sous réserve de la ratification de cette décision par la prochaine assemblée générale ordinaire."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Durée"),
    t("La société a une durée de {duree} ans (99 ans maximum) à compter de son immatriculation au registre du commerce et du crédit mobilier, sauf dissolution anticipée ou prorogation."),
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

    t("{#has_apports_nature}"),
    b("II - Apports en nature"),
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

    t("{#has_apports_industrie}"),
    b("IV - Apports en industrie"),
    t("Les associés suivants ont souscrit des apports en industrie :"),
    t("{#associes_industrie}"),
    t("- {civilite} {prenom} {nom} s'engage à mettre à la disposition de la société : {description_apport_industrie}."),
    t("{/associes_industrie}"),
    p(""),
    t("Les apports en industrie ne concourent pas à la formation du capital social mais donnent lieu à l'attribution d'actions ouvrant droit au partage des bénéfices et de l'actif net, à charge de contribuer aux pertes. La part totale des apports en industrie ne peut excéder vingt-cinq pour cent (25 %) du capital social."),
    t("{/has_apports_industrie}"),
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
    t("L'assemblée générale extraordinaire est seule compétente pour décider, sur le rapport du président, une augmentation du capital."),
    p(""),
    t("Les actionnaires ont, proportionnellement au montant de leurs actions, un droit de préférence à la souscription des actions de numéraire émises pour réaliser une augmentation de capital, droit auquel ils peuvent renoncer à titre individuel."),
    p(""),
    t("Le capital social peut être réduit, soit par la diminution de la valeur nominale des actions, soit par la diminution du nombre des actions."),
    p(""),
    t("La réduction du capital est autorisée ou décidée par l'assemblée générale extraordinaire, qui peut déléguer au président tous les pouvoirs pour la réaliser. En aucun cas la réduction du capital ne peut porter atteinte à l'égalité des actionnaires sauf consentement exprès de ceux-ci."),
    p(""),
    t("L'assemblée générale ordinaire peut décider l'amortissement du capital par prélèvement sur les bénéfices ou sur les réserves, à l'exclusion de la réserve légale."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Comptes courants"),
    t("Les actionnaires peuvent mettre ou laisser à la disposition de la société, toutes sommes, produisant ou non intérêts, dont celle-ci peut avoir besoin."),
    p(""),
    t("Les modalités de ces prêts sont arrêtées par accord entre le président et l'intéressé."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Libération des actions"),
    t("Les actions souscrites lors de la constitution ou d'une augmentation de capital sont libérées dans les conditions fixées par les statuts ou, à défaut, par la décision collective des associés."),
    p(""),
    t("La libération du surplus intervient en une ou plusieurs fois sur décision du président dans le délai fixé par les statuts ou, à défaut, dans un délai maximum de trois ans."),
    p(""),
    t("Les actionnaires qui le souhaitent peuvent procéder à des versements anticipés."),
    p(""),
    t("Les appels de fonds sont portés à la connaissance des souscripteurs {jours_appel_fonds} jours au moins avant la date fixée pour chaque versement, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, adressée à chaque actionnaire."),
    p(""),
    t("A défaut par l'actionnaire de se libérer aux époques fixées par le président, les sommes dues sont, de plein droit, productives d'intérêt au taux de l'intérêt légal, à compter de la date d'exigibilité, sans préjudice des autres recours et sanctions prévus par la loi."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Forme des actions"),
    t("Les actions sont nominatives."),
    p(""),
    t("Le président est habilité à tenir les registres de titres nominatifs émis par la société. Les registres contiennent les mentions relatives aux opérations de transfert, de conversion, de nantissement et de séquestre des titres, et notamment :"),
    t("1) La date de l'opération ;"),
    t("2) Les nom, prénoms et domicile de l'ancien et du nouveau titulaire des titres, en cas de transfert ;"),
    t("3) La valeur nominale et le nombre de titres transférés ou convertis ;"),
    t("4) Le cas échéant, si la société a émis des actions de différentes catégories, la catégorie et les caractéristiques des actions transférées ou converties ;"),
    t("5) Un numéro d'ordre affecté à l'opération."),
    p(""),
    t("Toutes les écritures contenues dans les registres doivent être signées par le président."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Cession et transmission des actions"),
    t("Les actions ne sont négociables qu'après l'immatriculation de la société au registre du commerce et du crédit mobilier. En cas d'augmentation de capital, les actions sont négociables à compter de l'inscription de la mention modificative. Les actions de numéraire ne sont négociables qu'après avoir été entièrement libérées. Elles demeurent négociables après la dissolution de la société et jusqu'à la clôture de la liquidation."),
    p(""),
    t("La cession doit être constatée par écrit. Elle n'est rendue opposable à la société qu'après l'accomplissement de l'une des formalités suivantes :"),
    t("1) signification de la cession à la société par acte d'huissier ou notification par tout moyen permettant d'établir sa réception effective par le destinataire ;"),
    t("2) acceptation de la cession par la société dans un acte authentique ;"),
    t("3) dépôt d'un original de l'acte de cession au siège social contre remise par le président d'une attestation de dépôt."),
    p(""),
    t("La cession n'est opposable aux tiers qu'après accomplissement de l'une des formalités ci-dessus et publicité au registre du commerce et du crédit mobilier."),
    p(""),
    t("Les frais de transfert des actions sont à la charge des cessionnaires, sauf convention contraire entre cédants et cessionnaires."),
    p(""),
    t("Les cessions entre actionnaires, ou au profit des héritiers, des conjoints, des ascendants et descendants ou encore la liquidation de la communauté des biens entre époux sont libres."),
    p(""),

    // Cession à des tiers — 4 variantes conditionnelles
    t("Cession à des tiers :"),
    p(""),

    t("{#clause_agrement}"),
    b("Clause d'agrément"),
    t("Toute transmission d'actions à un tiers étranger, soit à titre onéreux, soit à titre gratuit, sauf :"),
    t("- la transmission au profit des héritiers en cas de succession ou aux époux en cas liquidation de la communauté des biens ;"),
    t("- la cession à un conjoint, ascendant, descendant, est soumise à l'agrément de l'assemblée générale ordinaire des actionnaires dans les conditions ci-après ;"),
    t("- le cédant joint à sa demande d'agrément adressée à la société par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, ou par télécopie, les nom, prénoms, qualité et adresse du cessionnaire proposé, le nombre d'actions dont la transmission est envisagée et le prix offert ;"),
    t("- L'agrément résulte soit d'une notification, soit du défaut de réponse dans le délai de trois (3) mois à compter de la demande ;"),
    t("- Si la société n'agrée pas le cessionnaire proposé, le président est tenu dans le délai de trois (3) mois à compter de la notification de refus, de faire acquérir les actions soit par un ou plusieurs actionnaire(s), soit par un tiers, soit par la société ;"),
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
    t("Pendant une durée de {duree_inalienabilite} années (cette durée ne peut dépasser 10 ans) à compter de l'immatriculation de la société, les actionnaires ne pourront céder les actions ainsi que les droits de souscription et d'attribution en cas d'augmentation de capital."),
    t("{/clause_inalienabilite}"),
    p(""),

    t("{#clause_exclusion}"),
    b("Clause d'exclusion"),
    t("Un associé peut être exclu de la société par décision collective des associés prise à la majorité des associés présents ou représentés, pour l'un des motifs suivants :"),
    t("- exercice d'une activité concurrente à celle de la société ;"),
    t("- malversation ou faute grave portant atteinte à l'intérêt social ;"),
    t("- changement de contrôle de l'associé personne morale."),
    p(""),
    t("La décision d'exclusion est communiquée à l'associé concerné {jours_notification_exclusion} jours au moins avant la tenue de l'assemblée générale appelée à statuer sur l'exclusion, par lettre recommandée avec demande d'avis de réception."),
    p(""),
    t("L'associé dont l'exclusion est proposée peut présenter ses observations. Le prix de rachat des actions de l'associé exclu est déterminé, à défaut d'accord amiable, à dire d'expert désigné par les parties ou, à défaut, par la juridiction compétente."),
    t("{/clause_exclusion}"),
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
    b("Nomination du président"),
    t("La société est dirigée par un président qui en assure la direction générale. Le président peut être une personne physique ou une personne morale. Lorsque le président est une personne morale, celle-ci désigne un représentant permanent, personne physique."),
    p(""),
    t("Le premier président est désigné dans les statuts pour une durée de {president_duree_mandat}."),
    p(""),
    t("{#president_personne_physique}Est nommé premier président : {president_civilite} {president_prenom} {president_nom}, né(e) le {president_date_naissance} à {president_lieu_naissance}, de nationalité {president_nationalite}, demeurant à {president_adresse}.{/president_personne_physique}"),
    t("{#president_personne_morale}Est nommée premier président : la société {president_denomination_pm}, {president_forme_pm}, au capital de {president_capital_pm} FCFA, dont le siège social est à {president_siege_pm}, immatriculée au RCCM sous le numéro {president_rccm_pm}, représentée par {president_representant_nom}, en qualité de {president_representant_qualite}.{/president_personne_morale}"),
    p(""),
    t("En cours de vie sociale, le président est nommé par décision collective des associés, pour un mandat dont la durée est fixée par la décision de nomination."),
    p(""),
    t("Son mandat est renouvelable."),
    p(""),

    b("Attributions du président"),
    t("Le président est investi des pouvoirs les plus étendus pour agir en toutes circonstances au nom de la société et les exerce dans la limite de l'objet social et sous réserve de ceux expressément attribués aux assemblées d'actionnaires par la loi et les statuts."),
    p(""),
    t("Il arrête les comptes de la société."),
    t("Le président convoque et préside les assemblées générales."),
    t("Il représente la société dans ses rapports avec les tiers."),
    p(""),
    t("Dans ses rapports avec les tiers, la société est engagée par les actes du président qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que les tiers savaient que l'acte dépassait cet objet ou qu'ils ne pouvaient l'ignorer compte tenu des circonstances."),
    p(""),

    b("Rémunérations"),
    t("L'assemblée générale peut allouer au président :"),
    t("- une somme fixe annuelle à titre d'indemnité de fonction ;"),
    t("- des rémunérations exceptionnelles pour des missions et mandats qui lui sont confiés ;"),
    t("- des avantages en nature."),
    p(""),
    t("Elle peut également autoriser le remboursement des frais de voyage, déplacements et dépenses engagés dans l'intérêt de la société."),
    p(""),

    b("Conventions réglementées"),
    t("Dans le respect des dispositions légales relatives aux conventions réglementées, le président présente à l'assemblée générale ordinaire un rapport sur les conventions conclues directement ou indirectement avec la société, ou par personne interposée."),
    p(""),
    t("Il est interdit au président, ainsi qu'à ses conjoints, ascendants, descendants et aux personnes interposées, de contracter des emprunts auprès de la société, de se faire consentir un découvert en compte courant ou autrement, ainsi que de faire cautionner ou avaliser par elle leurs engagements envers les tiers."),
    p(""),

    t("{#has_dg}"),
    b("Directeur général et directeurs généraux adjoints"),
    t("Sur proposition du président, l'assemblée générale des actionnaires peut nommer un directeur général et, le cas échéant, un ou plusieurs directeurs généraux adjoints, chargés d'assister le président dans ses fonctions."),
    p(""),
    t("Le directeur général dispose des mêmes pouvoirs que le président vis-à-vis des tiers."),
    p(""),
    t("Est nommé premier directeur général : {dg_civilite} {dg_prenom} {dg_nom}, demeurant à {dg_adresse}."),
    p(""),
    t("{/has_dg}"),

    b("Révocation"),
    t("Le président peut être révoqué à tout moment par décision collective des associés. La révocation n'ouvre droit à aucune indemnité sauf stipulation contraire."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Décisions collectives"),
    p(""),
    b("Mode de consultation"),
    t("Les décisions collectives des associés sont prises en assemblée générale ou, si les statuts le prévoient, par consultation écrite."),
    p(""),
    b("Convocation"),
    t("Les assemblées générales sont convoquées par le président, ou à défaut par le commissaire aux comptes s'il en existe un, ou par toute personne habilitée à cet effet."),
    p(""),
    t("La convocation est faite quinze (15) jours au moins avant la date de l'assemblée, soit par avis inséré dans un journal d'annonces légales, soit par lettre au porteur contre récépissé ou lettre recommandée avec demande d'avis de réception, télécopie ou courrier électronique."),
    p(""),
    t("Les assemblées générales sont réunies au siège social ou en tout autre endroit du territoire de l'État partie où se situe le siège social."),
    p(""),

    b("Quorum et majorité"),
    t("Assemblée Générale Ordinaire :"),
    t("- Sur première convocation : quorum de {quorum_ago_1} % des actions ayant le droit de vote ;"),
    t("- Sur deuxième convocation : quorum de {quorum_ago_2} % des actions ayant le droit de vote ;"),
    t("- Majorité : {majorite_ago} % des voix exprimées."),
    p(""),
    t("Assemblée Générale Extraordinaire :"),
    t("- Sur première convocation : quorum de {quorum_age_1} % des actions ayant le droit de vote ;"),
    t("- Sur deuxième convocation : quorum de {quorum_age_2} % des actions ayant le droit de vote ;"),
    t("- Majorité : {majorite_age} % des voix exprimées."),
    p(""),
    t("Consultation écrite :"),
    t("- Majorité : {majorite_ecrite} % des voix exprimées."),
    p(""),

    b("Assemblée Générale Extraordinaire"),
    t("L'Assemblée Générale Extraordinaire est seule habilitée à modifier les statuts dans toutes leurs dispositions. Tout actionnaire peut participer aux assemblées générales extraordinaires sans qu'une limitation de voix puisse lui être opposée."),
    p(""),

    b("Assemblée Générale Ordinaire"),
    t("L'Assemblée Générale Ordinaire prend toutes les décisions autres que celles qui sont expressément réservées aux Assemblées Générales Extraordinaires et aux assemblées spéciales."),
    p(""),
    t("L'Assemblée Générale Ordinaire est réunie au moins une fois par an, dans les six (6) mois de la clôture de l'exercice, sous réserve de la prorogation de ce délai par décision de justice."),
    p(""),

    b("Vote par correspondance et visioconférence"),
    t("Les statuts peuvent prévoir le vote par correspondance au moyen d'un formulaire dont les mentions sont fixées par la décision collective des associés. Les actionnaires peuvent également participer aux assemblées par visioconférence ou par tout moyen de télécommunication permettant leur identification."),
    p(""),

    b("Droit de communication"),
    t("Tout actionnaire a le droit d'obtenir communication des documents sociaux visés par la loi, dans les conditions et délais qu'elle prévoit."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Commissaires aux comptes"),
    t("{#has_cac}"),
    t("Le contrôle est exercé par un ou plusieurs commissaires aux comptes titulaires et exerçant leur mission conformément à la loi."),
    p(""),
    t("Un ou plusieurs commissaires aux comptes suppléants appelés à remplacer les titulaires en cas de refus, d'empêchement, de démission ou de décès, sont désignés en même temps que le ou les titulaires et pour la même durée."),
    p(""),
    t("Sont nommés comme premiers commissaires aux comptes, pour une durée de six exercices sociaux :"),
    t("- en qualité de commissaire aux comptes titulaire : {cac_titulaire_prenom} {cac_titulaire_nom}, demeurant à {cac_titulaire_adresse} ;"),
    t("- en qualité de commissaire aux comptes suppléant : {cac_suppleant_prenom} {cac_suppleant_nom}, demeurant à {cac_suppleant_adresse}."),
    p(""),
    t("{/has_cac}"),
    t("{#no_cac}"),
    t("La désignation d'un commissaire aux comptes n'est obligatoire que si la société remplit, à la clôture d'un exercice, deux des conditions suivantes :"),
    t("- total du bilan supérieur à cent vingt-cinq millions (125.000.000) de francs CFA ;"),
    t("- chiffre d'affaires annuel supérieur à deux cent cinquante millions (250.000.000) de francs CFA ;"),
    t("- effectif permanent supérieur à cinquante (50) personnes."),
    p(""),
    t("La nomination d'un commissaire aux comptes peut également être demandée en justice par un ou plusieurs associés détenant au moins le dixième du capital."),
    p(""),
    t("A défaut de CAC, le président devra faire contrôler les comptes par un expert-comptable à la clôture de chaque exercice."),
    t("{/no_cac}"),
    p(""),

    // ARTICLE 18
    b("Article 18 : Comptes sociaux"),
    t("A la clôture de chaque exercice, le président établit et arrête les états financiers de synthèse."),
    p(""),
    t("Le président établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("{#has_cac}Les comptes annuels et le rapport de gestion sont communiqués au commissaire aux comptes et présentés à l'assemblée générale ordinaire annuelle.{/has_cac}"),
    t("{#no_cac}Les comptes annuels et le rapport de gestion sont présentés à l'assemblée générale ordinaire annuelle.{/no_cac}"),
    p(""),

    // ARTICLE 19
    b("Article 19 : Affectation des résultats"),
    t("Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures :"),
    t("- une dotation à la réserve légale égale à un dixième au moins. Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital ;"),
    t("- les dotations nécessaires aux réserves statutaires."),
    p(""),
    t("L'assemblée peut également décider la distribution de tout ou partie des réserves à l'exception de celles déclarées indisponibles par la loi ou par les statuts. Dans ce cas, elle indique expressément les postes de réserve sur lesquels les prélèvements sont effectués."),
    p(""),
    t("La mise en paiement des dividendes doit avoir lieu dans un délai maximum de neuf (9) mois après la clôture de l'exercice. Ce délai peut être prorogé par le président de la juridiction compétente."),
    p(""),
    t("{#has_apports_industrie}La part des bénéfices et de l'actif net attribuée aux titulaires d'actions résultant d'apports en industrie ne peut excéder vingt-cinq pour cent (25 %) du total distribué.{/has_apports_industrie}"),
    p(""),

    // ARTICLE 20
    b("Article 20 : Dissolution - Liquidation"),
    p(""),
    it("- Arrivée du terme"),
    t("Un an au moins avant la date d'expiration de la société, le président doit provoquer la réunion d'une assemblée générale extraordinaire pour décider si la société doit être prorogée. A défaut, tout associé peut demander au président de la juridiction compétente, statuant à bref délai, la désignation d'un mandataire de justice chargé de provoquer cette réunion. La prorogation de la société est décidée à l'unanimité des associés."),
    p(""),
    it("- Dissolution anticipée"),
    t("La dissolution anticipée peut être décidée à l'unanimité des associés ou par décision de justice."),
    p(""),
    it("- Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le président est tenu, dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, de convoquer l'assemblée générale extraordinaire à l'effet de décider si la dissolution anticipée de la société a lieu."),
    p(""),
    t("Si la dissolution n'est pas prononcée, la société est tenue, au plus tard à la clôture du deuxième exercice suivant celui au cours duquel la constatation des pertes est intervenue, de réduire son capital, d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves."),
    p(""),
    it("- Effets de la dissolution"),
    t("La dissolution de la société entraîne sa mise en liquidation. Un ou plusieurs liquidateurs sont nommés parmi les associés ou en dehors d'eux."),
    p(""),
    t("Le liquidateur représente la société qu'il engage pour tous les actes de la liquidation. Il est investi des pouvoirs les plus étendus pour réaliser l'actif, même à l'amiable. Il est habilité à payer les créanciers et à répartir entre les associés le solde disponible. Il ne peut continuer les affaires en cours ou en engager de nouvelles, pour les besoins de la liquidation, que s'il y a été autorisé par l'organe qui l'a désigné."),
    p(""),
    t("Le liquidateur ne peut céder la totalité des actifs de la société à une seule personne que si l'assemblée générale l'a expressément autorisé."),
    p(""),
    it("- Transmission universelle du patrimoine"),
    t("Lorsque toutes les actions sont réunies en une seule main, la dissolution de la société peut entraîner la transmission universelle du patrimoine à l'associé unique, sans qu'il y ait lieu à liquidation."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Contestation"),
    t("{#contestation_droit_commun}Toutes contestations relatives aux affaires de la société qui peuvent survenir en cours de vie sociale ou lors de la liquidation, soit entre actionnaires, soit entre un ou des actionnaires et la société, sont soumises au tribunal chargé des affaires commerciales compétent.{/contestation_droit_commun}"),
    t("{#contestation_arbitrage}Toutes contestations relatives aux affaires de la société qui peuvent survenir en cours de vie sociale ou lors de la liquidation, soit entre actionnaires, soit entre un ou des actionnaires et la société, sont soumises à un tribunal arbitral statuant conformément au Traité de l'OHADA relatif au droit de l'arbitrage et au Règlement d'arbitrage de la Cour Commune de Justice et d'Arbitrage de l'OHADA.{/contestation_arbitrage}"),
    p(""),

    // ARTICLE 22
    b("Article 22 : Frais"),
    t("Les frais, droits et honoraires des présents statuts sont à la charge de la société."),
    p(""),

    // ARTICLE 23
    b("Article 23 : Engagements pris pour le compte de la société en formation"),
    t("Un état des actes accomplis pour le compte de la société en formation, avec l'indication, pour chacun d'eux, de l'engagement qui en résulterait pour la société, est annexé aux statuts."),
    p(""),
    t("La signature des statuts emportera reprise de ces engagements par la société, lorsque celle-ci aura été immatriculée au registre du commerce et du crédit mobilier."),
    p(""),
    t("En outre, {mandataire_civilite} {mandataire_prenom} {mandataire_nom}, demeurant à {mandataire_adresse}, est habilité(e) à prendre des engagements pour le compte de la société."),
    p(""),
    t("Ces engagements seront repris par la société dans les conditions prévues par la loi et mentionnés dans le rapport du président à l'assemblée générale ordinaire."),
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

  const outputDir = path.join(__dirname, "../templates/sas");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template SAS créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
