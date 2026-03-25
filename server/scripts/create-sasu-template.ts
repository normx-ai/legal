/**
 * Script pour créer le template DOCX des statuts SASU (SAS Unipersonnelle)
 * Basé sur le modèle officiel du Guide Pratique OHADA (pages 587-592)
 * Usage : npx tsx scripts/create-sasu-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">SASU au capital de {capital} {devise}</w:t></w:r></w:p>
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SASU \u2014 {denomination}</w:t></w:r>
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
    p("Société par Actions Simplifiée Unipersonnelle", false, 28, true),
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
    c("STATUTS - « SOCIÉTÉ PAR ACTIONS SIMPLIFIÉE UNIPERSONNELLE »"),
    p(""),

    // PRÉAMBULE
    t("Le soussigné :"),
    t("{associe_civilite} {associe_prenom} {associe_nom}, né(e) le {associe_date_naissance} à {associe_lieu_naissance}, de nationalité {associe_nationalite}, {associe_profession}, demeurant à {associe_adresse} ;"),
    p(""),
    t("A établi ainsi qu'il suit les statuts de la société par actions simplifiée unipersonnelle qui va exister conformément aux dispositions de l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé par le soussigné une société par actions simplifiée unipersonnelle (SASU) qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE, les présents statuts et tous textes ultérieurs complémentaires ou modificatifs."),
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
    t("Il peut être transféré en tout autre endroit par décision du président. Le président doit soumettre cette décision à la ratification de l'associé unique lors de la prochaine consultation."),
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
    t("{associe_civilite} {associe_prenom} {associe_nom} : FCFA {total_apports_numeraire}"),
    p(""),
    t("L'apport en numéraire de FCFA {total_apports_numeraire} ({total_apports_numeraire_lettres}) correspond à {nombre_actions_numeraire} actions de FCFA {valeur_nominale} chacune, souscrites et libérées ({mode_liberation}) ainsi qu'il résulte du certificat du dépositaire établi le {date_certificat_depot} par {nom_depositaire}."),
    p(""),
    t("Les sommes correspondantes ont été déposées, pour le compte de la société, à {lieu_depot}."),
    p(""),
    t("{#is_liberation_partielle}La libération du surplus interviendra en une ou plusieurs fois sur décision de l'associé unique, dans un délai maximum de trois ans à compter de l'immatriculation de la société.{/is_liberation_partielle}"),
    p(""),

    t("{#has_apports_nature}"),
    b("II - Apports en nature et/ou stipulation d'avantages particuliers"),
    t("{associe_civilite} {associe_prenom} {associe_nom}, en s'obligeant à toutes les garanties ordinaires et de droit, fait apport à la société de {description_apport_nature}."),
    p(""),
    t("En rémunération de cet apport, évalué à FCFA {montant_apport_nature}, {associe_civilite} {associe_prenom} {associe_nom} se voit attribuer {nombre_actions_nature} actions."),
    p(""),
    t("Cette évaluation a été faite au vu du rapport du commissaire aux apports, désigné par l'associé unique, en date du {date_rapport_commissaire}, déposé au lieu du siège le {date_depot_rapport}, et dont un exemplaire est annexé aux présents."),
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
    t("- {nombre_actions_numeraire} actions de numéraire de FCFA {valeur_nominale} chacune, attribuées à l'associé unique ;"),
    t("{#has_apports_nature}- {nombre_actions_nature} actions d'apport de FCFA {valeur_nominale} chacune, attribuées à l'associé unique ;{/has_apports_nature}"),
    t("soit au total {nombre_actions} actions, numérotées de 1 à {nombre_actions}, toutes détenues par l'associé unique."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Modification du capital"),
    t("Le capital social peut être augmenté, réduit ou amorti dans les conditions prévues par la loi."),
    p(""),
    t("Le capital social peut être augmenté, soit par émission d'actions nouvelles, soit par majoration du montant nominal des actions existantes."),
    p(""),
    t("Les actions nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices ou primes d'émission, soit par apport en nature."),
    p(""),
    t("L'augmentation du capital est décidée par l'associé unique."),
    p(""),
    t("Le capital social peut être réduit, soit par la diminution de la valeur nominale des actions, soit par la diminution du nombre des actions."),
    p(""),
    t("La réduction du capital est décidée par l'associé unique. Elle est réalisée dans le respect des droits des créanciers."),
    p(""),
    t("L'associé unique peut décider l'amortissement du capital par prélèvement sur les bénéfices ou sur les réserves, à l'exclusion de la réserve légale, dans les conditions prévues par la loi."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Forme des actions"),
    t("Les actions sont nominatives."),
    p(""),
    t("Le président est habilité à tenir les registres de titres nominatifs émis par la société. Les registres contiennent les mentions relatives aux opérations de transfert, de conversion, de nantissement et de séquestre des titres, et notamment :"),
    t("1°) La date de l'opération ;"),
    t("2°) Les nom, prénoms et domicile de l'ancien et du nouveau titulaire des titres, en cas de transfert ;"),
    t("3°) La valeur nominale et le nombre de titres transférés ou convertis ;"),
    t("4°) Le cas échéant, si la société a émis des actions de différentes catégories, la catégorie et les caractéristiques des actions transférées ou converties ;"),
    t("5°) Un numéro d'ordre affecté à l'opération."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Cession et transmission des actions"),
    t("Les actions ne sont négociables qu'après l'immatriculation de la société au registre du commerce et du crédit mobilier. En cas d'augmentation de capital, les actions sont négociables à compter de l'inscription de la mention modificative. Les actions de numéraire ne sont négociables qu'après avoir été entièrement libérées."),
    p(""),
    t("La cession doit être constatée par écrit. Elle n'est rendue opposable à la société qu'après l'accomplissement de l'une des formalités suivantes :"),
    t("1°) signification de la cession à la société par acte d'huissier ou notification par tout moyen permettant d'établir sa réception effective par le destinataire ;"),
    t("2°) acceptation de la cession par la société dans un acte authentique ;"),
    t("3°) dépôt d'un original de l'acte de cession au siège social contre remise par le président d'une attestation de dépôt."),
    p(""),
    t("En tant que société à associé unique, les cessions d'actions sont libres après l'immatriculation de la société."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Administration et direction de la société"),
    p(""),
    b("Président"),
    t("La société est représentée, dirigée et administrée par un président, personne physique ou morale."),
    p(""),
    t("Le premier président est désigné dans les présents statuts pour une durée de {president_duree_mandat} ans."),
    p(""),
    t("Est nommé premier président : {president_civilite} {president_prenom} {president_nom}, né(e) le {president_date_naissance} à {president_lieu_naissance}, de nationalité {president_nationalite}, demeurant à {president_adresse}."),
    p(""),
    t("En cours de vie sociale, le président est nommé par décision de l'associé unique."),
    t("Son mandat est renouvelable sans limitation."),
    p(""),

    b("Pouvoirs du président"),
    t("Le président est investi des pouvoirs les plus étendus pour agir en toutes circonstances au nom de la société et les exerce dans la limite de l'objet social et sous réserve de ceux expressément attribués à l'associé unique par la loi et les statuts."),
    p(""),
    t("Il représente la société à l'égard des tiers. La société est engagée même par les actes du président qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que le tiers savait que l'acte dépassait cet objet ou qu'il ne pouvait l'ignorer compte tenu des circonstances."),
    p(""),

    b("Rémunération du président"),
    t("Le président peut recevoir une rémunération dont le montant et les modalités de versement sont fixés par décision de l'associé unique."),
    p(""),

    b("Conventions réglementées"),
    t("Le président présente à l'associé unique un rapport sur les conventions conclues directement ou par personne interposée entre la société et son président, ou l'un de ses dirigeants, ou un associé disposant d'une fraction de droits de vote supérieure à 10 %."),
    t("L'associé unique approuve ou désapprouve lesdites conventions et consigne sa décision dans le registre prévu à cet effet."),
    p(""),

    b("Directeur Général et Directeur Général Adjoint"),
    t("Le président peut être assisté d'un ou plusieurs directeurs généraux et directeurs généraux adjoints, personnes physiques, nommés par décision de l'associé unique."),
    p(""),

    b("Révocation"),
    t("Le président peut être révoqué à tout moment par décision de l'associé unique. La révocation n'ouvre droit à aucune indemnité sauf stipulation contraire."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Décisions de l'associé unique"),
    t("L'associé unique exerce les pouvoirs dévolus aux assemblées générales ordinaires et extraordinaires dans les sociétés par actions simplifiées pluripersonnelles."),
    p(""),
    t("Ses décisions sont consignées dans un registre spécial tenu au siège social, coté et paraphé par le greffier du tribunal compétent."),
    p(""),
    t("L'associé unique ne peut déléguer ses pouvoirs. Toute clause statutaire contraire est réputée non écrite."),
    p(""),

    // ARTICLE 14
    b("Article 14 : Commissaires aux comptes"),
    t("{#has_cac}Le contrôle est exercé par un ou plusieurs commissaires aux comptes titulaires et exerçant leur mission conformément à la loi."),
    p(""),
    t("Un ou plusieurs commissaires aux comptes suppléants appelés à remplacer les titulaires en cas de refus, d'empêchement, de démission ou de décès, sont désignés en même temps que le ou les titulaires et pour la même durée."),
    p(""),
    t("Sont nommés comme premiers commissaires aux comptes, pour une durée de deux exercices sociaux :"),
    t("- en qualité de commissaire aux comptes titulaire, {cac_titulaire_civilite} {cac_titulaire_prenom} {cac_titulaire_nom}, demeurant à {cac_titulaire_adresse} ;"),
    t("- en qualité de commissaire aux comptes suppléant, {cac_suppleant_civilite} {cac_suppleant_prenom} {cac_suppleant_nom}, demeurant à {cac_suppleant_adresse}."),
    p(""),
    t("Leur mandat arrivera à expiration à l'issue de la décision de l'associé unique qui statue sur les comptes du deuxième exercice."),
    t("La durée du mandat des commissaires aux comptes désignés en cours de vie sociale est de six exercices.{/has_cac}"),
    p(""),
    t("{#no_cac}La société n'est pas tenue de désigner un commissaire aux comptes dès lors qu'elle ne dépasse pas, à la clôture d'un exercice, les seuils fixés par l'Acte Uniforme : total du bilan de 125.000.000 FCFA, chiffre d'affaires annuel de 250.000.000 FCFA, et effectif permanent de 50 personnes, et qu'elle n'est ni une société mère ni une filiale."),
    t("La nomination d'un commissaire aux comptes devient obligatoire dès que l'un de ces seuils est dépassé ou que la société devient société mère ou filiale.{/no_cac}"),
    p(""),

    // ARTICLE 15
    b("Article 15 : Comptes sociaux"),
    t("A la clôture de chaque exercice, le président établit et arrête les états financiers de synthèse."),
    p(""),
    t("Le président établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("Les comptes annuels et le rapport de gestion sont soumis à l'approbation de l'associé unique dans les six mois suivant la clôture de l'exercice."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Dissolution - Liquidation"),
    p(""),
    it("- Arrivée du terme"),
    t("Un an au moins avant la date d'expiration de la société, le président provoque une décision de l'associé unique à l'effet de décider si la société doit être prorogée."),
    p(""),
    it("- Dissolution anticipée"),
    t("La dissolution anticipée peut être prononcée par décision de l'associé unique."),
    p(""),
    it("- Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le président est tenu, dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, de consulter l'associé unique à l'effet de décider si la dissolution anticipée de la société a lieu."),
    p(""),
    t("Si la dissolution n'est pas prononcée, la société est tenue, au plus tard à la clôture du deuxième exercice suivant celui au cours duquel la constatation des pertes est intervenue, de réduire son capital, d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves si, dans ce délai, les capitaux propres n'ont pas été reconstitués à concurrence d'une valeur au moins égale à la moitié du capital social."),
    p(""),
    it("- Effets de la dissolution à l'égard des tiers"),
    t("La dissolution de la société ne produit ses effets à l'égard des tiers qu'à compter de sa publication au registre du commerce et du crédit mobilier."),
    p(""),
    t("La dissolution de la société entraîne sa mise en liquidation. Un liquidateur est nommé par l'associé unique."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Frais"),
    t("Les frais, droits et honoraires des présents statuts et de leurs suites sont à la charge de la société."),
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

  const outputDir = path.join(__dirname, "../templates/sasu");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template SASU créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
