/**
 * Script pour créer le template DOCX des statuts SA Unipersonnelle
 * Basé sur le modèle officiel du Guide Pratique OHADA (pages 559-566)
 * Usage : npx tsx scripts/create-sa-uni-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">SA Unipersonnelle au capital de {capital} {devise}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}, {ville}, {pays}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Paraphe : _____</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SA UNI \u2014 {denomination}</w:t></w:r>
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
    p("Société Anonyme Unipersonnelle", false, 28, true),
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
    c("STATUTS - « SOCIÉTÉ ANONYME UNIPERSONNELLE »"),
    p(""),

    // PRÉAMBULE
    t("Le soussigné :"),
    t("{associe_civilite} {associe_prenom} {associe_nom}, né(e) le {associe_date_naissance} à {associe_lieu_naissance}, de nationalité {associe_nationalite}, {associe_profession}, demeurant à {associe_adresse} ;"),
    p(""),
    t("A établi ainsi qu'il suit les statuts de la société anonyme unipersonnelle qui va exister sous la forme d'une société anonyme avec un actionnaire unique conformément aux dispositions de l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé par le soussigné une société anonyme unipersonnelle qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE, et tous textes ultérieurs complémentaires ou modificatifs."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Dénomination"),
    t("La société a pour dénomination « {denomination} »."),
    t("{#has_sigle}Son sigle est : « {sigle} ».{/has_sigle}"),
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
    t("Il peut être transféré en tout autre endroit par décision de l'actionnaire unique."),
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
    t("{associe_civilite} {associe_prenom} {associe_nom} : FCFA {total_apports_numeraire}"),
    p(""),
    t("L'apport en numéraire de FCFA {total_apports_numeraire} ({total_apports_numeraire_lettres}) correspond à {nombre_actions_numeraire} actions de FCFA {valeur_nominale} chacune, souscrites et libérées ({mode_liberation}) ainsi qu'il résulte du certificat du dépositaire établi le {date_certificat_depot} par {nom_depositaire}."),
    p(""),
    t("Les sommes correspondantes ont été déposées, pour le compte de la société, à {lieu_depot}."),
    p(""),
    t("{#is_liberation_partielle}La libération du surplus interviendra dans les conditions prévues à l'article 11 ci-après, sur décision de l'actionnaire unique, dans un délai maximum de trois ans.{/is_liberation_partielle}"),
    p(""),

    t("{#has_apports_nature}"),
    b("II - Apports en nature et/ou stipulation d'avantages particuliers"),
    t("{associe_civilite} {associe_prenom} {associe_nom}, en s'obligeant à toutes les garanties ordinaires et de droit, fait apport à la société de {description_apport_nature}."),
    p(""),
    t("En rémunération de cet apport, évalué à FCFA {montant_apport_nature}, {associe_civilite} {associe_prenom} {associe_nom} se voit attribuer {nombre_actions_nature} actions."),
    p(""),
    t("Cette évaluation a été faite au vu du rapport du commissaire aux apports, désigné par l'actionnaire unique, en date du {date_rapport_commissaire}, déposé au lieu du siège le {date_depot_rapport}, et dont un exemplaire est annexé aux présents."),
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
    t("- {nombre_actions_numeraire} actions de numéraire de FCFA {valeur_nominale} chacune, attribuées à l'actionnaire unique ;"),
    t("{#has_apports_nature}- {nombre_actions_nature} actions d'apport de FCFA {valeur_nominale} chacune, attribuées à l'actionnaire unique ;{/has_apports_nature}"),
    t("soit au total {nombre_actions} actions, numérotées de 1 à {nombre_actions}, toutes détenues par l'actionnaire unique."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Modification du capital"),
    t("Le capital social peut être augmenté, réduit ou amorti dans les conditions prévues par la loi."),
    p(""),
    t("Le capital social peut être augmenté, soit par émission d'actions nouvelles, soit par majoration du montant nominal des actions existantes."),
    p(""),
    t("Les actions nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices ou primes d'émission, soit par apport en nature."),
    p(""),
    t("L'augmentation du capital est décidée par l'actionnaire unique, sur le rapport de l'administrateur général."),
    p(""),
    t("Le capital social peut être réduit, soit par la diminution de la valeur nominale des actions, soit par la diminution du nombre des actions."),
    p(""),
    t("La réduction du capital est décidée par l'actionnaire unique. Elle est réalisée dans le respect des droits des créanciers."),
    p(""),
    t("L'actionnaire unique peut décider l'amortissement du capital par prélèvement sur les bénéfices ou sur les réserves, à l'exclusion de la réserve légale, dans les conditions prévues par la loi."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Comptes courants"),
    t("L'actionnaire unique peut mettre ou laisser à la disposition de la société, toutes sommes, produisant ou non intérêts, dont celle-ci peut avoir besoin."),
    p(""),
    t("Les modalités de ces prêts sont arrêtées par accord entre l'administrateur général et l'actionnaire unique."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Libération des actions"),
    t("Les actions de numéraire émises à la suite d'une augmentation de capital résultant pour partie d'une incorporation de réserves, bénéfices ou primes d'émission et pour partie d'un versement en espèces, doivent être intégralement libérées lors de leur souscription. Toutes autres actions de numéraire peuvent être libérées, lors de leur souscription, du quart."),
    p(""),
    t("La libération du surplus intervient en une ou plusieurs fois sur décision de l'administrateur général ou de l'actionnaire unique dans un délai maximum de trois ans à compter soit de l'immatriculation de la société, soit du jour où l'augmentation de capital est devenue définitive."),
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
    t("Toutes les écritures contenues dans les registres doivent être signées par l'actionnaire unique."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Cession et transmission des actions"),
    t("Les actions ne sont négociables qu'après l'immatriculation de la société au registre du commerce et du crédit mobilier. En cas d'augmentation de capital, les actions sont négociables à compter de l'inscription de la mention modificative. Les actions de numéraire ne sont négociables qu'après avoir été entièrement libérées."),
    p(""),
    t("La cession doit être constatée par écrit. Elle n'est rendue opposable à la société qu'après l'accomplissement de l'une des formalités suivantes :"),
    t("1°) signification de la cession à la société par acte d'huissier ou notification par tout moyen permettant d'établir sa réception effective par le destinataire ;"),
    t("2°) acceptation de la cession par la société dans un acte authentique ;"),
    t("3°) dépôt d'un original de l'acte de cession au siège social contre remise par l'administrateur général d'une attestation de dépôt."),
    p(""),
    t("En tant que société à actionnaire unique, les cessions d'actions sont libres après l'immatriculation de la société."),
    p(""),

    // ARTICLE 14
    b("Article 14 : Droits et obligations attachés aux actions"),
    t("A chaque action est attaché un droit de vote proportionnel à la quotité du capital qu'elle représente et chaque action donne droit à une voix au moins."),
    p(""),
    t("A chaque action est attaché un droit au dividende proportionnel à la quotité du capital qu'elle représente."),
    p(""),
    t("L'actionnaire unique ne supporte les pertes qu'à concurrence de ses apports. Les droits et obligations attachés à l'action suivent le titre dans quelle que main qu'il passe. La propriété d'une action emporte de plein droit adhésion aux statuts."),
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
    t("En cours de vie sociale, l'administrateur général est nommé par décision de l'actionnaire unique, pour un mandat ne pouvant excéder six (6) ans."),
    p(""),
    t("Il est choisi parmi les actionnaires ou en dehors d'eux."),
    t("Son mandat est renouvelable."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Responsabilité"),
    t("Il est interdit à l'administrateur général et à l'administrateur général adjoint, ainsi qu'à leurs conjoints, ascendants, descendants et aux personnes interposées, de contracter, sous quelque forme que ce soit, des emprunts auprès de la société, de se faire consentir par elle un découvert en compte courant ou autrement, ainsi que de faire cautionner ou avaliser par elle leurs engagements envers les tiers."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Attributions de l'administrateur général"),
    t("L'administrateur général est investi des pouvoirs les plus étendus pour agir en toutes circonstances au nom de la société et les exerce dans la limite de l'objet social et sous réserve de ceux expressément attribués à l'actionnaire unique par la loi et les statuts."),
    p(""),
    t("Il arrête les comptes de la société."),
    t("Il représente la société dans ses rapports avec les tiers."),
    p(""),
    t("Dans ses rapports avec les tiers, la société est engagée par les actes de l'administrateur général qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que les tiers savaient que l'acte dépassait cet objet ou qu'ils ne pouvaient l'ignorer compte tenu des circonstances, sans que la seule publication des statuts suffise à constituer cette preuve."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Conventions réglementées"),
    t("Dans le respect des dispositions légales relatives aux conventions réglementées, l'administrateur général présente à l'actionnaire unique un rapport sur les conventions qu'il a conclues avec la société, directement ou indirectement, ou par personne interposée."),
    p(""),
    t("L'actionnaire unique approuve ou désapprouve lesdites conventions et consigne sa décision dans le registre prévu à cet effet."),
    p(""),
    t("Il est interdit à l'administrateur général et à l'administrateur général adjoint, ainsi qu'à leurs conjoints, ascendants, descendants et aux personnes interposées, de contracter, sous quelque forme que ce soit, des emprunts auprès de la société, de se faire consentir par elle un découvert en compte courant ou autrement, ainsi que de faire cautionner ou avaliser par elle leurs engagements envers les tiers."),
    p(""),

    // ARTICLE 19
    b("Article 19 : Décisions de l'actionnaire unique"),
    t("L'actionnaire unique exerce les pouvoirs dévolus aux assemblées générales ordinaires et extraordinaires."),
    p(""),
    t("Ses décisions sont consignées dans un registre spécial tenu au siège social, coté et paraphé par le greffier du tribunal compétent."),
    p(""),
    t("L'actionnaire unique ne peut déléguer ses pouvoirs. Toute clause statutaire contraire est réputée non écrite."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Commissaires aux comptes"),
    t("Le contrôle est exercé par un ou plusieurs commissaires aux comptes titulaires et exerçant leur mission conformément à la loi."),
    p(""),
    t("Un ou plusieurs commissaires aux comptes suppléants appelés à remplacer les titulaires en cas de refus, d'empêchement, de démission ou de décès, sont désignés en même temps que le ou les titulaires et pour la même durée."),
    p(""),
    t("Sont nommés comme premiers commissaires aux comptes, pour une durée de deux exercices sociaux :"),
    t("- en qualité de commissaire aux comptes titulaire, {cac_titulaire_civilite} {cac_titulaire_prenom} {cac_titulaire_nom}, demeurant à {cac_titulaire_adresse} ;"),
    t("- en qualité de commissaire aux comptes suppléant, {cac_suppleant_civilite} {cac_suppleant_prenom} {cac_suppleant_nom}, demeurant à {cac_suppleant_adresse}."),
    p(""),
    t("Leur mandat arrivera à expiration à l'issue de la décision de l'actionnaire unique qui statue sur les comptes du deuxième exercice."),
    t("La durée du mandat des commissaires aux comptes désignés en cours de vie sociale est de six exercices."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Comptes sociaux"),
    t("A la clôture de chaque exercice, l'administrateur général établit et arrête les états financiers de synthèse."),
    p(""),
    t("L'administrateur général établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("Les comptes annuels et le rapport de gestion sont communiqués au commissaire aux comptes et à l'actionnaire unique dans les six mois suivant la clôture de l'exercice."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Affectation des résultats"),
    t("Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures :"),
    t("- une dotation à la réserve légale égale à un dixième au moins. Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital ;"),
    t("- les dotations nécessaires aux réserves statutaires."),
    p(""),
    t("L'actionnaire unique peut décider la distribution de tout ou partie des réserves à l'exception de celles déclarées indisponibles par la loi ou par les statuts."),
    p(""),
    t("La mise en paiement des dividendes doit avoir lieu dans un délai maximum de neuf mois après la clôture de l'exercice."),
    p(""),

    // ARTICLE 23
    b("Article 23 : Dissolution - Liquidation"),
    p(""),
    it("- Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, l'administrateur général est tenu, dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, de consulter l'actionnaire unique à l'effet de décider si la dissolution anticipée de la société a lieu."),
    p(""),
    t("Si la dissolution n'est pas prononcée, la société est tenue, au plus tard à la clôture du deuxième exercice suivant celui au cours duquel la constatation des pertes est intervenue, de réduire son capital, d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves si, dans ce délai, les capitaux propres n'ont pas été reconstitués à concurrence d'une valeur au moins égale à la moitié du capital social."),
    p(""),
    it("- Dissolution volontaire"),
    t("La société peut être dissoute par l'arrivée du terme ou par la volonté de l'actionnaire unique."),
    p(""),
    it("- Effets de la dissolution"),
    t("La dissolution de la société entraîne sa mise en liquidation. Un liquidateur est nommé par l'actionnaire unique."),
    p(""),
    t("Le liquidateur représente la société qu'il engage pour tous les actes de la liquidation. Il est investi des pouvoirs les plus étendus pour réaliser l'actif, même à l'amiable. Il est habilité à payer les créanciers et à répartir le solde disponible."),
    p(""),

    // ARTICLE 24
    b("Article 24 : Frais"),
    t("Les frais, droits et honoraires des présents statuts sont à la charge de la société."),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait à {lieu_signature}, le {date_signature} en un original.", false, 24, true),
    p(""),
    p("Signature", false, 24, true, true),
    p("(nom et signature)", false, 24, true, true),
    p(""),
    p("{associe_civilite} {associe_prenom} {associe_nom}", false, 24, true),
    p(""),
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

  const outputDir = path.join(__dirname, "../templates/sa-uni");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template SA UNI créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
