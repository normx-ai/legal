/**
 * Script pour créer le template DOCX des statuts SARL Unipersonnelle OHADA
 * Basé sur le modèle officiel du Guide Pratique (pages 516-522)
 * Usage : npx tsx scripts/create-sarlu-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">SARL Unipersonnelle au capital de {capital} {devise}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}, {ville}, {pays}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Paraphe : _____</w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts SARLU \u2014 {denomination}</w:t></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
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
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("{denomination}", true, 36, true),
    p("", false, 24, true),
    p("Société à Responsabilité Limitée Unipersonnelle", false, 28, true),
    p("Au capital de {capital} {devise}", false, 24, true),
    p("", false, 24, true),
    p("Siège social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("STATUTS", true, 36, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("", false, 24, true),
    p("Établis le {date_signature}", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    p("", false, 24, true),
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("STATUTS - « SARL UNIPERSONNELLE »"),
    p(""),

    // PRÉAMBULE
    t("Le soussigné :"),
    t("- {associe_civilite} {associe_prenom} {associe_nom}, né(e) le {associe_date_naissance} à {associe_lieu_naissance}, de nationalité {associe_nationalite}, {associe_profession}, demeurant à {associe_adresse} ;"),
    p(""),
    t("a établi ainsi qu'il suit les statuts de la société à responsabilité limitée qu'il constitue :"),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé par le soussigné une société à responsabilité limitée qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE, et par toutes autres dispositions légales et réglementaires complémentaires ou modificatives et par les présents statuts."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Objet"),
    t("La société a pour objet, {objet_social}."),
    t("Et, généralement, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, pouvant se rattacher directement ou indirectement à l'objet ci-dessus ou à tous objets similaires ou connexes."),
    p(""),

    // ARTICLE 3
    b("Article 3 : Dénomination"),
    t("La société a pour dénomination sociale « {denomination} »."),
    t("{#has_sigle}Éventuellement : Son sigle est : {sigle}.{/has_sigle}"),
    t("La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie immédiatement en caractères lisibles de l'indication de la forme de la société, du montant de son capital social, de l'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du crédit mobilier."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Siège social"),
    t("Le siège social est fixé à {siege_social}, {ville}, {pays}."),
    t("Il peut être transféré dans les limites du territoire d'un même État partie par décision de la gérance qui modifie en conséquence les statuts, sous réserve de la ratification de cette décision par l'associé unique."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Durée"),
    t("La durée de la société est de {duree} années, sauf dissolution anticipée ou prorogation."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Exercice social"),
    t("L'exercice social commence le {exercice_debut} et se termine le {exercice_fin} de chaque année."),
    t("Par exception, le premier exercice social sera clos le {premier_exercice_fin}."),
    p(""),

    // ARTICLE 7
    b("Article 7 : Apports"),
    t("Lors de la constitution, le soussigné fait apport à la société, savoir :"),
    p(""),

    b("I - Apports en numéraire"),
    t("{associe_civilite} {associe_prenom} {associe_nom}, associé unique, apporte en numéraire FCFA {apport_numeraire}, correspondant à {nombre_parts_numeraire} parts de FCFA {valeur_nominale} chacune, souscrites et libérées ({mode_liberation}) des parts sociales ainsi qu'il résulte du certificat du dépositaire établi le {date_certificat_depot} par {nom_depositaire}."),
    p(""),
    t("Les sommes correspondantes ont été déposées, pour le compte de la société, à {lieu_depot}."),
    p(""),
    t("{#is_liberation_partielle}La libération du surplus soit FCFA {montant_surplus} par part sociale, interviendra en une ou plusieurs fois dans un délai de deux (2) ans à compter de l'immatriculation de la société au registre de commerce et du crédit mobilier.{/is_liberation_partielle}"),
    p(""),

    t("{#has_apports_nature}"),
    b("II - Apports en nature"),
    t("{associe_civilite} {associe_prenom} {associe_nom}, en s'obligeant à toutes les garanties ordinaires et de droit, fait apport à la société de {description_apport_nature}."),
    p(""),
    t("{#has_commissaire_apports}Il a été procédé à l'évaluation de chacun des apports en nature ci-dessus au vu du rapport annexé aux présents statuts, établi par {commissaire_apports_nom}, commissaire aux apports désigné par {associe_civilite} {associe_prenom} {associe_nom}, associé unique (ou : désigné par ordonnance de M. le président du tribunal chargé des affaires commerciales de {ville}, en date du {date_ordonnance}, à la requête de {associe_civilite} {associe_prenom} {associe_nom}, associé unique).{/has_commissaire_apports}"),
    p(""),
    t("{#sans_commissaire_apports}Aucun des apports en nature n'ayant une valeur supérieure à 5 000 000 FCFA et la valeur totale desdits apports n'excédant pas la moitié du capital, l'associé unique, a décidé de ne pas recourir à un commissaire aux apports et a procédé lui-même à l'évaluation.{/sans_commissaire_apports}"),
    p(""),
    t("En rémunération de son apport, évalué à FCFA {montant_apport_nature}, {associe_civilite} {associe_prenom} {associe_nom} se voit attribuer {parts_nature} parts sociales."),
    p(""),
    t("{/has_apports_nature}"),

    b("III - Récapitulation des apports"),
    t("- Apports en numéraire : FCFA {total_apports_numeraire}"),
    t("{#has_apports_nature}- Apports en nature : FCFA {total_apports_nature}{/has_apports_nature}"),
    b("Total des apports : FCFA {total_apports}"),
    p(""),

    // ARTICLE 8
    b("Article 8 : Capital social"),
    t("Le capital social est fixé à la somme de FCFA {capital} ({capital_lettres} francs CFA), divisé en {nombre_parts} parts de FCFA {valeur_nominale} chacune, entièrement souscrites et libérées, attribuées à l'associé unique, comme suit :"),
    p(""),
    t("{#has_parts_nature}- {parts_nature} parts numérotées de {numero_debut_nature} à {numero_fin_nature}, en rémunération de son apport en nature ci-dessus{/has_parts_nature}"),
    t("- {nombre_parts_numeraire} parts numérotées de {numero_debut_numeraire} à {numero_fin_numeraire}, en rémunération de son apport en numéraire ci-dessus"),
    p(""),
    b("Égal au nombre de parts composant le capital social : {nombre_parts} parts."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Modifications du capital"),
    t("Le capital social peut être augmenté, par décision extraordinaire de l'associé unique, soit par émission de parts nouvelles, soit par majoration du nominal des parts existantes."),
    p(""),
    t("Les parts nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices, soit par apport en nature."),
    p(""),
    t("Le capital social peut être réduit, soit par la diminution de la valeur nominale des parts, soit par diminution du nombre de parts."),
    p(""),
    t("La réduction du capital est autorisée ou décidée par l'associé unique qui peut déléguer à la gérance les pouvoirs nécessaires pour la réaliser."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Droits des parts"),
    t("Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société et dans tout l'actif social."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Nantissement des parts sociales"),
    t("Le nantissement des parts est constaté par acte notarié ou sous seing-privé enregistré et signifié à la société ou accepté par elle dans un acte authentique."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Comptes courants"),
    t("L'associé unique peut laisser ou mettre à disposition de la société toutes sommes dont celle-ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur rémunération, sont déterminées soit par décision de l'associé unique, soit par accords entre la gérance et l'intéressé. Dans le cas où l'avance est faite par l'associé unique gérant, ces conditions sont fixées par décision de ce dernier."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Gérance"),
    t("1. La société est gérée par une ou plusieurs personnes physiques. L'associé unique peut être le gérant de la société. Le gérant est nommé pour une durée de {gerant_duree_mandat}. La nomination du gérant au cours de la vie sociale est décidée par l'associé unique."),
    p(""),
    t("Est nommé gérant de la société : {gerant_civilite} {gerant_prenom} {gerant_nom}, né(e) le {gerant_date_naissance} à {gerant_lieu_naissance}, de nationalité {gerant_nationalite}, demeurant à {gerant_adresse}, qui accepte."),
    p(""),
    t("Le gérant est nommé pour une durée de {gerant_duree_mandat}. Il est toujours rééligible."),
    p(""),
    t("Au cours de la vie sociale, le gérant est nommé par décision de l'associé unique."),
    p(""),
    t("Le gérant peut démissionner de son mandat, mais seulement en prévenant l'associé unique au moins {gerant_preavis_mois} mois à l'avance, par lettre recommandée avec demande d'avis de réception ou lettre au porteur contre récépissé."),
    p(""),
    t("Le gérant est révocable par décision de l'associé unique."),
    p(""),
    t("2. La rémunération du gérant est {gerant_remuneration}."),
    p(""),

    // ARTICLE 14
    b("Article 14 : Pouvoirs du gérant"),
    t("Le gérant peut faire tous les actes de gestion dans l'intérêt de la société."),
    p(""),
    t("{#limitation_pouvoirs}Cependant, il ne peut, sans y être autorisé par l'associé unique : {limitations_pouvoirs_liste}.{/limitation_pouvoirs}"),
    p(""),
    t("Dans les rapports avec les tiers, le gérant est investi des pouvoirs les plus étendus pour agir en toute circonstance, au nom de la société, sous réserve des pouvoirs expressément attribués à l'associé unique par la loi."),
    p(""),
    t("La société est engagée, même par les actes du gérant qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que le tiers savait que l'acte dépassait cet objet ou qu'il ne pouvait l'ignorer compte tenu des circonstances, étant exclu que la seule publication des statuts suffise à constituer cette preuve."),
    p(""),

    // ARTICLE 15
    b("Article 15 : Responsabilité du gérant"),
    t("Le gérant est responsable, envers la société ou envers les tiers, soit des infractions aux dispositions législatives ou réglementaires applicables aux sociétés à responsabilité limitée, soit des violations des statuts, soit des fautes commises dans sa gestion."),
    p(""),
    t("Si plusieurs gérants ont coopéré aux mêmes faits, le tribunal chargé des affaires commerciales détermine la part contributive de chacun dans la réparation du dommage."),
    p(""),
    t("Aucune décision de l'associé unique ne peut avoir pour effet d'éteindre une action en responsabilité contre les gérants pour faute commise dans l'accomplissement de leur mandat."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Décisions de l'associé unique"),
    t("L'associé unique exerce les pouvoirs dévolus par l'Acte Uniforme relatif au droit des sociétés commerciales et du GIE."),
    p(""),
    t("L'associé unique ne peut déléguer ses pouvoirs. Ses décisions sont consignées dans un procès-verbal versé dans les archives de la société."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Comptes sociaux"),
    t("A la clôture de chaque exercice, le gérant établit et arrête les états financiers de synthèse conformément aux dispositions de l'Acte Uniforme portant organisation et harmonisation des comptabilités."),
    p(""),
    t("Le gérant établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et, en particulier, les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement."),
    p(""),
    t("Ces documents ainsi que les textes des résolutions proposées et, le cas échéant, les rapports du commissaire aux comptes sont communiqués à l'associé unique dans les conditions et délais prévus par les dispositions légales et réglementaires."),
    p(""),
    t("A compter de cette communication, l'associé unique a la possibilité de poser par écrit des questions auxquelles le gérant sera tenu de répondre."),
    p(""),
    t("L'associé unique est tenu de statuer sur les comptes de l'exercice écoulé dans les six mois de la clôture de l'exercice ou, en cas de prolongation, dans le délai fixé par décision de justice."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Affectation des résultats"),
    t("Après approbation des comptes et constatations de l'existence d'un bénéfice distribuable, l'associé unique détermine la part attribuée sous forme de dividende."),
    p(""),
    t("Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures, une dotation égale à un dixième au moins affecté à la formation d'un fonds de réserve dit « réserve légale ». Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital social."),
    p(""),
    t("L'associé unique a la faculté de constituer tous postes de réserves."),
    p(""),
    t("Il peut procéder à la distribution de tout ou partie des réserves à la condition qu'il ne s'agisse pas de réserves déclarées indisponibles par la loi ou par les statuts. Dans ce cas, il indique expressément les postes de réserve sur lesquels les prélèvements sont effectués."),
    p(""),

    // ARTICLE 19
    b("Article 19 : Variation des capitaux propres"),
    t("Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le gérant ou, le cas échéant, le commissaire aux comptes doit dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, consulter l'associé unique sur l'opportunité de prononcer la dissolution anticipée de la société."),
    p(""),
    t("Si la dissolution est écartée, la société est tenue, dans les deux ans qui suivent la date de clôture de l'exercice déficitaire, de reconstituer ses capitaux propres jusqu'à ce que ceux-ci soient à la hauteur de la moitié au moins du capital social."),
    p(""),
    t("A défaut, elle doit réduire son capital d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves, à la condition que cette réduction du capital n'ait pas pour effet de réduire le capital à un montant inférieur à celui du capital minimum légal."),
    p(""),
    t("A défaut par le gérant ou le commissaire aux comptes de provoquer cette décision, ou si l'associé unique n'a pu prendre de décision valablement, tout intéressé peut demander à la juridiction compétente de prononcer la dissolution de la société. Il en est de même si la reconstitution des capitaux propres n'est pas intervenue dans les délais prescrits."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Contrôle des comptes"),
    t("La société est tenue de désigner au moins un commissaire aux comptes si elle remplit, à la clôture de l'exercice social, deux (2) des conditions suivantes :"),
    t("1°) total du bilan supérieur à cent vingt cinq millions (125.000.000) de francs CFA ;"),
    t("2°) chiffre d'affaires annuel supérieur à deux cents cinquante millions (250.000.000) de francs CFA ;"),
    t("3°) effectif permanent supérieur à 50 personnes."),
    p(""),
    t("La société n'est plus tenue de désigner un commissaire aux comptes dès lors qu'elle n'a pas rempli deux (2) des conditions fixées ci-dessus pendant les deux (2) exercices précédant l'expiration du mandat du commissaire aux comptes."),
    p(""),
    t("L'associé unique peut nommer même si les critères ci-dessus ne sont pas atteints un ou plusieurs commissaires aux comptes."),
    p(""),
    t("Le commissaire aux comptes est nommé pour 3 exercices."),
    p(""),
    t("Ils exercent leurs fonctions et sont rémunérés conformément à la loi."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Dissolution"),
    t("La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés."),
    p(""),
    t("La dissolution de la société n'entraîne pas sa mise en liquidation."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Engagements pour le compte de la société"),
    t("1. Un état des actes accomplis par l'associé unique pour le compte de la société en formation, avec l'indication, de l'engagement qui en résulterait pour la société, est annexé aux présents statuts."),
    p(""),
    t("2. En outre, le soussigné se réserve le droit de prendre les engagements suivants au nom et pour le compte de la société : {engagements_mandataire}."),
    p(""),

    // ARTICLE 23
    b("Article 23 : Frais"),
    t("Les frais, droits et honoraires des présents statuts sont à la charge de la société."),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait à {lieu_signature}, le {date_signature}.", false, 24, true),
    p("", false, 24, true),
    p("Signature de l'associé unique avec mention « Lu et approuvé »", false, 24, true, true),
    p("", false, 24, true),
    p("{associe_civilite} {associe_prenom} {associe_nom}", false, 24, true),
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

  const outputDir = path.join(__dirname, "../templates/sarlu");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template SARLU créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
