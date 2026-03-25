/**
 * Script pour créer le template DOCX des statuts STE PART (Société en Participation)
 * Basé sur le modèle officiel du Guide Pratique OHADA
 * 13 articles — Pas d'immatriculation, pas de personnalité morale,
 * gérant seul connu des tiers, grande souplesse contractuelle.
 * Usage : npx tsx scripts/create-ste-part-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Soci\u00E9t\u00E9 en Participation</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Domicile : {domicile}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Paraphes : _____ / _____</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:tab/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Statuts STE PART \u2014 {denomination}</w:t></w:r>
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
    p("Société en Participation", false, 28, true),
    p("", false, 24, true),
    p("Domicile : {domicile}", false, 24, true),
    p("", false, 24, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("STATUTS", true, 36, true),
    p("━━━━━━━━━━━━━━━━━━━━━━━━━━━━", false, 24, true),
    p("", false, 24, true),
    p("Établis le {date_signature}", false, 24, true),
    p("", false, 24, true), p("", false, 24, true), p("", false, 24, true), p("", false, 24, true),
    `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,

    // TITRE
    c("STATUTS — « SOCIÉTÉ EN PARTICIPATION »"),
    p(""),

    // PRÉAMBULE
    t("Entre les soussignés :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom}, né(e) le {date_naissance} à {lieu_naissance}, de nationalité {nationalite}, {profession}, demeurant à {adresse} ;"),
    t("{/associes}"),
    p(""),
    t("Il est établi ainsi qu'il suit les statuts de la société en participation qui va exister entre eux."),
    p(""),

    // ARTICLE 1
    b("Article premier : Forme"),
    t("Il est formé entre les propriétaires des parts ci-après créées une société en participation régie par les dispositions de l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE."),
    p(""),

    // ARTICLE 2
    b("Article 2 : Objet"),
    t("La société a pour objet : {objet_social}."),
    p(""),

    // ARTICLE 3
    b("Article 3 : Domicile"),
    t("Dans les rapports entre eux, les associés fixent le domicile de la société au siège de son exploitation : {domicile}."),
    p(""),

    // ARTICLE 4
    b("Article 4 : Durée"),
    t("La société prendra effet à compter du {date_effet}. Sa durée sera de {duree} ans, sauf dissolution anticipée ou prorogation."),
    t("{#duree_indeterminee}La société est conclue pour une durée indéterminée. Chaque associé pourra y mettre fin à tout moment sous réserve de notifier son intention à ses coassociés par lettre recommandée avec demande d'avis de réception adressée {delai_preavis} mois à l'avance, pourvu que cette notification soit faite de bonne foi et non à contretemps.{/duree_indeterminee}"),
    p(""),

    // ARTICLE 5
    b("Article 5 : Apports"),
    t("Les soussignés font apport à la société, savoir :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom} : apport en {type_apport} de {apport} {devise} ;"),
    t("{/associes}"),
    t("Total des apports : {total_apports} {devise}."),
    p(""),
    t("Ces apports sont mis à la disposition du gérant dans les conditions suivantes : {conditions_mise_disposition}."),
    p(""),
    t("Les associés conviennent que le total des apports est divisé en {nombre_parts} parts de {valeur_part} {devise} chacune, réparties entre eux, savoir :"),
    t("{#associes}"),
    t("- {civilite} {prenom} {nom} : {parts} parts ;"),
    t("{/associes}"),
    t("Total des parts : {nombre_parts} parts."),
    p(""),

    // ARTICLE 6
    b("Article 6 : Cession des parts"),
    t("Toute cession de parts doit être constatée par un écrit. Les parts sociales ne peuvent être cédées, y compris au profit des conjoints, ascendants, descendants, qu'avec l'agrément de tous les associés."),
    p(""),
    t("L'associé qui désire céder tout ou partie de ses parts sociales en informe la gérance par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, en indiquant les nom, prénoms, profession, domicile et nationalité du cessionnaire proposé, ainsi que le nombre de parts à céder."),
    p(""),
    t("Dans les huit jours qui suivent, la gérance informe les coassociés du cédant, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception."),
    p(""),
    t("Chacun des associés, autres que le cédant, doit, dans les quinze jours qui suivent l'envoi de cette lettre, faire connaître par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, s'il accepte la cession proposée."),
    p(""),
    t("Les décisions ne sont pas motivées et la gérance notifie dans les huit jours le résultat de la consultation à l'associé vendeur."),
    p(""),
    t("Si la cession est agréée, elle doit être régularisée dans le mois de la notification de l'agrément."),
    p(""),
    t("Si la cession n'est pas agréée, l'associé cédant demeure propriétaire des parts sociales qu'il se proposait de céder."),
    p(""),
    t("En cas de décès d'un associé, la société continue entre les associés survivants et les héritiers et ayants droit de l'associé décédé et éventuellement son conjoint survivant, sous réserve de l'agrément par l'unanimité des associés de l'ensemble desdits héritiers, ayants droit et conjoint."),
    t("{deces_details}"),
    p(""),

    // ARTICLE 7
    b("Article 7 : Décès d'un associé (suite)"),
    t("Le ou les attributaires des parts ont seuls droit à la totalité des dividendes afférents aux périodes courues depuis la clôture du dernier exercice précédant le décès de l'associé en cause."),
    p(""),
    t("Dans le cas d'agrément des héritiers, ayants droit et conjoint et si un ou plusieurs d'entre eux sont mineurs non émancipés, ces derniers ne répondent des dettes sociales qu'à concurrence des forces de la succession de leur auteur. La société doit être transformée, dans le délai d'un an à compter du décès, en société en commandite dont le mineur devient commanditaire. A défaut, la société est dissoute."),
    p(""),

    // ARTICLE 8
    b("Article 8 : Gérance"),
    t("La société sera gérée par {gerant_civilite} {gerant_prenom} {gerant_nom}, soussigné, qui seul sera connu des tiers."),
    p(""),
    t("Il devra consacrer tout son temps et toute son activité à l'exploitation, et s'interdit, pendant la durée de la société et jusqu'à sa liquidation, de s'intéresser directement, y compris comme associé ou par personne interposée, à une activité susceptible de faire concurrence ou de nuire aux intérêts communs des associés."),
    p(""),
    t("En rémunération de ses fonctions, le gérant percevra une somme mensuelle brute de {remuneration_gerant} {devise} imputée sur les frais généraux."),
    p(""),
    t("Dans les rapports entre associés, le gérant disposera des pouvoirs les plus étendus pour agir conformément à l'objet et à l'intérêt social. Il ne pourra cependant, sans le consentement unanime des associés :"),
    t("- consentir une sûreté quelconque sur les biens de la société,"),
    t("- contracter un emprunt, ouverture de crédit ou découvert,"),
    t("{#limitations_supplementaires}- {limitations_supplementaires}{/limitations_supplementaires}"),
    p(""),

    // ARTICLE 9
    b("Article 9 : Comptabilité, reddition des comptes"),
    t("Le gérant, responsable de la comptabilité, devra tenir une comptabilité autonome, distincte de la sienne propre, pour toutes les opérations relevant de la participation."),
    p(""),
    t("Le rapport de gestion, l'inventaire et les comptes annuels établis par la gérance, sont soumis à l'approbation des associés réunis en assemblée, dans le délai de six mois à compter de la clôture de l'exercice. Les documents visés ci-dessus ainsi que le texte des résolutions proposées sont adressés aux associés quinze jours au moins avant la réunion de l'assemblée."),
    p(""),
    t("Les associés non-gérants ont, par ailleurs, deux fois par an, le droit d'obtenir communication et de prendre eux-mêmes, au siège social, connaissance des livres de commerce et de comptabilité, des contrats, factures, correspondances, procès-verbal et, plus généralement, de tous documents établis par la société ou reçus par elle."),
    p(""),
    t("Ils ont le droit d'en prendre copie à leurs frais."),
    p(""),
    t("Ils doivent avertir les gérants de leur intention d'exercer leur droit de communication au moins quinze jours à l'avance, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, par télex ou télécopie."),
    p(""),
    t("Dans l'exercice de ces droits, l'associé peut se faire assister d'un expert comptable ou d'un commissaire aux comptes à ses frais."),
    p(""),

    // ARTICLE 10
    b("Article 10 : Décisions collectives"),
    t("Les comptes annuels sont approuvés par un ou plusieurs associés représentant plus de la moitié des parts. Toutes autres décisions collectives sont prises à l'unanimité."),
    p(""),
    t("Ces décisions collectives sont prises, indifféremment, en assemblée, par voie de consultation écrite ou sont constatées dans un acte. Les assemblées sont convoquées, par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception, quinze jours au moins à l'avance. Elles se réunissent au siège social ou en tout autre endroit de la ville où se trouve fixé le siège social. Elle est présidée par l'associé représentant par lui-même ou comme mandataire le plus grand nombre de parts sociales."),
    p(""),
    t("Il est établi une feuille de présence indiquant leurs représentants ou mandataires ainsi que le nombre de parts possédées par chaque associé."),
    p(""),
    t("La feuille de présence, émargée par les membres de l'assemblée en entrant en séance, est certifiée exacte par le président."),
    p(""),
    t("L'assemblée ne peut délibérer que sur les questions portées à l'ordre du jour."),
    p(""),
    t("Les délibérations sont constatées par un procès-verbal mentionnant le lieu et la date de réunion, les nom et prénoms des associés présents, les documents et rapports soumis à discussion, un résumé des débats, le texte des résolutions mises aux voix et le résultat des votes. Le procès-verbal est signé par chacun des associés présents."),
    p(""),
    t("En cas de consultation écrite, le texte des résolutions proposées est adressé par la gérance à chaque associé par lettre au porteur contre récépissé ou par lettre recommandée avec demande d'avis de réception."),
    p(""),
    t("Les associés doivent, selon les mêmes formes et dans un délai de 15 jours à compter de la réception de la lettre de la société, adresser au gérant leur acceptation ou leur refus."),
    p(""),
    t("Pour chaque résolution, le vote est exprimé par « oui » ou par « non ». Tout associé qui n'aura pas adressé sa réponse dans le délai ci-dessus, sera considéré comme ayant approuvé les résolutions proposées. Pendant ledit délai, les associés peuvent exiger de la gérance les explications complémentaires qu'ils jugent utiles."),
    p(""),
    t("Un procès-verbal de chaque consultation écrite, mentionnant l'utilisation de cette procédure, est établi et signé par le gérant. A ce procès-verbal, est annexée la réponse de chaque associé."),
    p(""),

    // ARTICLE 11
    b("Article 11 : Répartition des résultats"),
    t("Le bénéfice distribuable est constitué par le bénéfice de l'exercice, diminué des pertes antérieures et des sommes portées en réserve en application de la loi et des statuts, et augmenté du report bénéficiaire."),
    p(""),
    t("Ce bénéfice est réparti entre tous les associés proportionnellement au nombre de parts appartenant à chacun d'eux."),
    p(""),
    t("Les associés peuvent décider d'affecter tout ou partie de ces bénéfices à un ou plusieurs postes de réserves."),
    p(""),
    t("Chaque associé est, à l'égard des autres, responsable indéfiniment de sa quote-part dans les pertes."),
    p(""),

    // ARTICLE 12
    b("Article 12 : Dissolution - Liquidation"),
    t("La société est dissoute par l'arrivée du terme ou par décision unanime des associés."),
    p(""),
    t("La liquidation sera faite par le gérant (ou : le liquidateur sera désigné à l'unanimité des associés) ou, à défaut par un liquidateur désigné par décision de justice à la requête de la partie la plus diligente."),
    p(""),
    t("A la clôture de la liquidation chaque participant reprendra son entière liberté sans être tenu à aucune interdiction de concurrence."),
    p(""),
    t("Le liquidateur établira et soumettra aux participants les comptes de la liquidation dans les six mois de la dissolution de la société. Il aura les pouvoirs les plus étendus à l'effet de réaliser, même à l'amiable, tout l'actif de la société et d'éteindre son passif."),
    p(""),
    t("Toutefois, la cession de l'actif est soumise au consentement unanime de tous les associés lorsque le cessionnaire a eu dans la société la qualité d'associé ou de gérant. Elle est interdite au liquidateur ainsi qu'à ses employés, conjoint, ascendants et descendants."),
    p(""),
    t("Le produit net de la liquidation, après règlement du passif, est réparti entre les associés au prorata de leurs parts dans le capital social."),
    p(""),

    // ARTICLE 13
    b("Article 13 : Contestations"),
    t("{#mode_tribunaux}"),
    t("Toutes contestations qui pourraient s'élever entre les associés, relativement à la présente société, seront jugées conformément à la loi et soumises à la juridiction des tribunaux compétents."),
    t("{/mode_tribunaux}"),
    t("{#mode_arbitrage}"),
    t("Toutes contestations qui pourraient s'élever au cours de l'existence de la société ou après sa dissolution pendant le cours des opérations de liquidation seront soumises à la procédure d'arbitrage, auprès de la CCJA à Abidjan en Côte d'Ivoire."),
    t("{/mode_arbitrage}"),
    p(""),
    p(""),

    // SIGNATURE
    p("Fait à {lieu_signature}, le {date_signature} en {nombre_exemplaires} originaux.", false, 24, true),
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

  const outputDir = path.join(__dirname, "../templates/ste-part");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "statuts.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template STE PART créé : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
