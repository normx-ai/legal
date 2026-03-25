/**
 * Script pour créer le template DOCX de la convention constitutive GIE
 * (Groupement d'Intérêt Économique) — Modèle OHADA
 * 22 articles — personnalité morale après immatriculation RCCM,
 * responsabilité solidaire et indéfinie des membres, capital facultatif.
 * Usage : npx tsx scripts/create-gie-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Groupement d\u2019Int\u00E9r\u00EAt \u00C9conomique</w:t></w:r></w:p>
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Convention GIE \u2014 {denomination}</w:t></w:r>
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
    p("Groupement d'Intérêt Économique", false, 28, true),
    p("", false, 24, true),
    p("Siège social : {siege_social}, {ville}, {pays}", false, 24, true),
    p("", false, 24, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("CONVENTION CONSTITUTIVE", true, 36, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("", false, 24, true),
    p("Établie le {date_signature}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("CONVENTION CONSTITUTIVE — « GROUPEMENT D'INTÉRÊT ÉCONOMIQUE »"),
    p(""),

    // PRÉAMBULE
    t("Entre les soussignés :"),
    t("{#membres}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, {profession}, demeurant à {adresse} ;"),
    t("{/membres}"),
    p(""),
    t("Il est établi ainsi qu'il suit la convention constitutive du groupement d'intérêt économique qui va exister entre eux."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme du groupement"),
    t("Les soussignés décident de créer un groupement d'intérêt économique (GIE) régi par les dispositions de l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du groupement d'intérêt économique."),
    t("Conformément audit Acte Uniforme, ce groupement jouit de la personnalité morale et de la pleine capacité à compter de son immatriculation au registre du commerce et du crédit mobilier."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Dénomination"),
    t("Le GIE a pour dénomination « {denomination} »."),
    t("{#has_sigle}Son sigle est : « {sigle} ».{/has_sigle}"),
    t("Les actes et documents émanant du GIE et destinés aux tiers, notamment les lettres, factures, annonces et publications diverses doivent indiquer lisiblement la dénomination du groupement suivie des mots « groupement d'intérêt économique » ou du sigle « GIE »."),
    p(""),

    // ARTICLE 3
    b("Article 3 : Objet"),
    t("Constitué dans le but de mettre en oeuvre tous les moyens propres à faciliter ou à développer l'activité économique de ses membres, à améliorer ou à accroître les résultats de cette activité, le groupement a pour objet :"),
    t("{objet_social}"),
    t("Et généralement, toutes opérations mobilières ou immobilières se rattachant à cet objet ou susceptibles d'aider à sa réalisation."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Siège du GIE"),
    t("Le siège du groupement d'intérêt économique est fixé à {siege_social}, {ville}, {pays}."),
    t("Il pourra être transféré :"),
    t("- en tout autre endroit de la même ville sur simple décision de son conseil d'administration, lequel pourra ainsi modifier le contrat dans ce sens ;"),
    t("- partout ailleurs, par décision de l'assemblée générale extraordinaire aux conditions propres à ce type d'assemblée."),
    p(""),

    // ARTICLE 5
    b("Article 5 : Exercice"),
    t("L'exercice commence le {exercice_debut} et finit le {exercice_fin} de chaque année. Exceptionnellement, le premier exercice comprendra le temps à courir depuis l'immatriculation du GIE et au registre du commerce et du crédit mobilier jusqu'au {premier_exercice_fin}."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Durée"),
    t("Le GIE est constitué pour une durée de {duree} années à compter de son immatriculation au registre du commerce et du crédit mobilier, sauf cas de dissolution anticipée ou de prorogation."),
    p(""),

    // ARTICLE 7
    b("Article 7 : Capital"),
    t("{#has_capital}"),
    t("Le GIE a un capital de {capital} {devise} divisé en {nombre_parts} parts de {valeur_nominale} {devise} chacune."),
    t("Le capital est représentatif d'apports en numéraire pour {total_apports_numeraire} {devise}{#has_apports_nature} et d'apports en nature pour {total_apports_nature} {devise}{/has_apports_nature}, soit :"),
    p(""),
    t("{#membres}"),
    t("- {civilite} {prenom} {nom} : apport de {apport} {devise} — {parts} parts ;"),
    t("{/membres}"),
    p(""),
    t("Total : {capital} {devise} — {nombre_parts} parts."),
    t("{/has_capital}"),
    t("{#sans_capital}"),
    t("Le GIE est constitué sans capital conformément à l'article 869 de l'Acte Uniforme. Le financement du groupement est assuré par les cotisations des membres fixées par l'assemblée générale."),
    t("{/sans_capital}"),
    p(""),
    t("Les parts ainsi créées ne peuvent être représentées par des titres négociables."),
    t("La cession des parts doit respecter les conditions ci-après :"),
    t("- nécessité d'un écrit ;"),
    t("- signification au GIE et à ses autres membres ;"),
    t("- autorisation à prévoir : cession entre membres du GIE et cession à un tiers."),
    p(""),
    t("Le capital peut être augmenté ou réduit par décision de l'assemblée générale extraordinaire."),
    p(""),

    // ARTICLE 8
    b("Article 8 : Droits des membres"),
    t("Les membres du GIE ont le droit :"),
    t("- de profiter des résultats positifs du GIE, ainsi que du boni de liquidation ;"),
    t("- de bénéficier des services du GIE ;"),
    t("- de participer aux prises de décision ;"),
    t("- d'être informés de la vie du groupement."),
    p(""),

    // ARTICLE 9
    b("Article 9 : Obligations des membres"),
    t("Les membres du GIE sont tenus :"),
    t("- de s'acquitter de leurs engagements ;"),
    t("- de participer aux résultats négatifs et au mali de liquidation ;"),
    t("- des dettes du groupement sur leur patrimoine propre. Les nouveaux membres sont {responsabilite_nouveaux_membres} des dettes antérieures à leur entrée dans le groupement."),
    t("Solidairement du paiement des dettes du GIE sauf convention contraire signée avec le tiers cocontractant."),
    t("Par ailleurs, les créanciers ne peuvent poursuivre un membre du GIE pour le paiement des dettes du GIE qu'après avoir vainement mis en demeure le groupement par acte extrajudiciaire."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Nouveaux membres"),
    t("Le GIE peut accepter de nouveaux membres aux conditions ci-après :"),
    t("- leur activité économique doit être compatible avec le GIE ;"),
    t("- l'admission d'un nouveau membre doit résulter d'une décision prise à {majorite_admission} ;"),
    t("{#droit_entree}- un droit d'entrée de {montant_droit_entree} {devise} est exigé.{/droit_entree}{#sans_droit_entree}- aucun droit d'entrée n'est exigé.{/sans_droit_entree}"),
    p(""),

    // ARTICLE 11
    b("Article 11 : Démission d'un membre du GIE"),
    t("Tout membre peut se retirer du groupement sous réserve qu'il ait exécuté ses obligations."),
    t("Le retrait doit être notifié au GIE et aux autres membres par écrit adressé dans un délai de {delai_preavis_retrait} avant la date effective du retrait."),
    t("Le membre qui se retire reste solidaire des dettes nées antérieurement à son retrait."),
    t("Il n'a droit qu'au remboursement de la valeur nominale de sa part ainsi qu'au solde de son compte courant augmenté ou diminué de sa quote-part sur les résultats concernant la période courue jusqu'au jour de son retrait."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Exclusion d'un membre"),
    t("Tout membre du GIE qui aura fait ou qui se sera abstenu de faire : {motifs_exclusion}, pourra se voir exclu du groupement."),
    t("La décision d'exclusion est prise aux conditions ci-après : {conditions_exclusion}."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Administration du GIE"),
    t("{#mode_ca}"),
    t("Le GIE est administré par un conseil d'administration de {nombre_administrateurs} membres au moins, pouvant ou non être membres du GIE."),
    t("Le conseil d'administration est dirigé par un président personne physique."),
    t("Les administrateurs sont désignés par l'assemblée générale ordinaire pour une durée de {duree_mandat_admin} ans."),
    t("Leur rémunération est déterminée comme suit : {remuneration_admin}."),
    t("Le conseil d'administration a pour attributions : {attributions_admin}."),
    t("Ses pouvoirs : {pouvoirs_admin}."),
    t("Il est révocable aux conditions suivantes : {conditions_revocation}."),
    t("{/mode_ca}"),
    t("{#mode_admin_unique}"),
    t("Le GIE est administré par un administrateur unique, {admin_civilite} {admin_prenom} {admin_nom}, personne physique."),
    t("L'administrateur est désigné par l'assemblée générale ordinaire pour une durée de {duree_mandat_admin} ans."),
    t("Sa rémunération est déterminée comme suit : {remuneration_admin}."),
    t("L'administrateur unique a pour attributions : {attributions_admin}."),
    t("Ses pouvoirs : {pouvoirs_admin}."),
    t("Il est révocable aux conditions suivantes : {conditions_revocation}."),
    t("{/mode_admin_unique}"),
    p(""),

    // ARTICLE 14
    b("Article 14 : Assemblées générales"),
    t("Les membres du groupement se réunissent en assemblée générale."),
    t("L'assemblée générale ordinaire est généralement celle qui prend toutes décisions autres que celles relatives à la modification du contrat du groupement."),
    t("L'assemblée est convoquée par {convocateur_ag} qui arrête l'ordre du jour de la convocation."),
    t("L'assemblée est convoquée dans les délais ci-après :"),
    t("- pour l'assemblée générale ordinaire chargée de statuer sur les comptes : {delai_convocation_ago_comptes} ;"),
    t("- pour les autres assemblées générales ordinaires : {delai_convocation_ago} ;"),
    t("- pour les assemblées générales extraordinaires : {delai_convocation_age}."),
    t("L'assemblée générale ordinaire devant délibérer sur les comptes de l'exercice doit être réunie dans les 6 mois de la clôture."),
    t("Peuvent accéder à l'assemblée tout membre du GIE soit personnellement, soit par mandataires (conjoint, autres membres du GIE et éventuellement un tiers au groupement)."),
    t("Les personnes morales membres du groupement doivent désigner un représentant permanent personne physique."),
    p(""),
    b("Quorum et majorité :"),
    t("L'assemblée générale ordinaire délibère valablement si {quorum_ago} membres sont présents ou représentés."),
    t("Les décisions sont prises à la majorité de {majorite_ago}."),
    t("L'assemblée générale extraordinaire délibère valablement si {quorum_age} membres sont présents ou représentés."),
    t("Les décisions sont prises à la majorité de {majorite_age}."),
    p(""),

    // ARTICLE 15
    b("Article 15 : Comptes du groupement"),
    t("Il est mis en place une comptabilité régulière des opérations du groupement destinée à l'information externe comme à son propre usage, conformément aux dispositions de l'acte uniforme relatif au droit comptable."),
    t("Le conseil d'administration ou l'administrateur du groupement établit et arrête les états financiers de synthèse. Il établit un rapport sur les opérations de l'exercice et le soumet ainsi que l'inventaire et les comptes annuels à l'approbation de l'assemblée générale dans le délai fixé ci-dessus, après les avoir communiqués au contrôleur de gestion, au contrôleur des comptes, au commissaire aux comptes (selon le cas)."),
    t("Les comptes annuels, les rapports sur les opérations de l'exercice et les résolutions proposées sont adressées aux membres du groupement en même temps que leurs convocations."),
    p(""),

    // ARTICLE 16
    b("Article 16 : Approbation des résultats"),
    t("Le GIE ne donne pas par lui-même à réalisation et à partage des bénéfices. En conséquence, les bénéfices ou pertes deviennent la propriété des membres ou sont mises à leur charge dès leur constatation."),
    t("La répartition se fera au prorata de la part de chaque membre dans le capital."),
    t("{#sans_capital}Si le GIE n'a pas de capital, la répartition se fait selon la clé suivante : {cle_repartition}.{/sans_capital}"),
    t("L'assemblée générale peut décider que {pourcentage_report}% du bénéfice revenant à chaque membre pourra être porté sans intérêt au compte courant de ce dernier."),
    t("Lorsque ce montant aura atteint la somme de {plafond_report} {devise} ou le pourcentage de {pourcentage_plafond}% du capital, il cesse d'être obligatoire. Cette somme ainsi portée au compte courant est indisponible jusqu'à {date_disponibilite_report}."),
    p(""),

    // ARTICLE 17
    b("Article 17 : Contrôle de la gestion"),
    t("Le contrôle de la gestion est exercé par un contrôleur (ou plusieurs) choisis parmi les membres ou en dehors d'eux."),
    t("Il est nommé pour {duree_mandat_controleur} exercices par l'assemblée générale ({type_ag_controleur}) des membres du GIE."),
    t("Il a pour mission : {mission_controleur}."),
    t("Il établit un rapport sur l'accomplissement de sa mission."),
    t("Le contrôleur de la gestion est rémunéré comme suit : {remuneration_controleur}."),
    p(""),

    // ARTICLE 18
    b("Article 18 : Contrôle des états financiers"),
    t("{#gie_emet_obligations}"),
    t("Si le GIE émet des obligations, le contrôle des états financiers doit être effectué par un commissaire aux comptes, choisi sur la liste officielle des commissaires aux comptes, désigné pour une durée de six (6) exercices."),
    t("{/gie_emet_obligations}"),
    t("{#gie_sans_obligations}"),
    t("Le contrôle des états financiers est exercé par un commissaire aux comptes (si les membres du GIE le souhaitent) ou par toute autre personne désignée par l'assemblée générale."),
    t("{/gie_sans_obligations}"),
    p(""),

    // ARTICLE 19
    b("Article 19 : Transformation"),
    t("Le GIE pourra se transformer en société en nom collectif par décision prise à l'unanimité des membres."),
    t("Il ne peut se transformer en une autre société sans perte de sa personnalité morale."),
    p(""),

    // ARTICLE 20
    b("Article 20 : Dissolution - Liquidation"),
    t("Le GIE est dissout :"),
    t("1. par l'arrivée du terme ;"),
    t("2. par la réalisation ou l'extinction de son objet ;"),
    t("3. par la décision de ses membres aux conditions de quorum et de majorité suivantes : {conditions_dissolution} ;"),
    t("4. par décision judiciaire, pour justes motifs ;"),
    t("5. par décès d'une personne physique ou dissolution d'une personne morale membre du GIE (si les membres du GIE souhaitent le contraire, supprimer le 5° et préciser que le décès d'un membre n'entraîne pas la dissolution) ;"),
    t("6. si l'un des membres est frappé d'incapacité, de faillite personnelle ou d'interdiction de diriger, gérer, administrer ou contrôler une entreprise qu'elle qu'en soit la forme ou l'objet (à moins que la continuation ne soit prévue par le contrat ou que les autres membres ne le décident à l'unanimité, à préciser)."),
    p(""),

    // ARTICLE 21
    b("Article 21 : Liquidation"),
    t("La dissolution du GIE entraîne sa liquidation. La personnalité du GIE subsiste pour les besoins de sa liquidation."),
    t("L'assemblée générale qui prononce la dissolution (ou autorité judiciaire) désigne un liquidateur."),
    t("Les fonctions d'administrateur (conseil d'administration ou administrateur unique) cessent avec la nomination du liquidateur."),
    t("Les organes de contrôle (de gestion et des états financiers) continuent leur mission."),
    t("La liquidation doit se dérouler selon les modalités prévues aux articles 1917 et suivants de l'Acte Uniforme."),
    t("Après paiement des dettes, l'excédent d'actif est réparti entre les membres dans les conditions prévues dans le présent contrat."),
    p(""),

    // ARTICLE 22
    b("Article 22 : Publications"),
    t("Tous pouvoirs sont donnés à {mandataire_civilite} {mandataire_prenom} {mandataire_nom} à l'effet de procéder à toutes les formalités légales nécessaires."),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait à {lieu_signature}, le {date_signature} en {nombre_exemplaires} exemplaires.", false, 24, true),
    p(""),
    p("Signatures", false, 24, true, true),
    p("(noms et signatures)", false, 24, true, true),
    p(""),
    t("{#membres}"),
    p("{civilite} {prenom} {nom}", false, 24, true),
    p(""),
    t("{/membres}"),
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

  const outputDir = path.join(__dirname, "../templates/gie");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template GIE créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
