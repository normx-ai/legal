/**
 * Script pour creer le template DOCX du PV des deliberations de l'AGO - SA & SAS
 * Usage : npx tsx scripts/create-pv-ago-sa-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">{forme_juridique} au capital de {capital} {devise}</w:t></w:r></w:p>
  <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Si\u00E8ge social : {siege_social}</w:t></w:r></w:p>
</w:hdr>`);

  zip.file("word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>
  <w:p><w:pPr><w:tabs><w:tab w:val="center" w:pos="4536"/><w:tab w:val="right" w:pos="9072"/></w:tabs></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV AGO SA/SAS \u2014 {denomination}</w:t></w:r>
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
    // ===== TITRE =====
    c("PROC\u00c8S-VERBAL DES D\u00c9LIB\u00c9RATIONS"),
    c("DE L\u2019ASSEMBL\u00c9E G\u00c9N\u00c9RALE ORDINAIRE"),
    c("SA & SAS"),
    c("DU {date_ag}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_ag_lettres}, le {date_ag},"),
    t(""),
    t("\u00c0 {heure_ag_lettres} heures, les actionnaires de la soci\u00e9t\u00e9 {denomination}, {forme_juridique} au capital de {capital} {devise}, dont le si\u00e8ge social est \u00e0 {siege_social}, immatricul\u00e9e au RCCM sous le n\u00b0 {rccm}, se sont r\u00e9unis en assembl\u00e9e g\u00e9n\u00e9rale ordinaire au {lieu_ag}, sur convocation du {organe_convocation} en date du {date_convocation}."),
    t(""),

    // ===== BUREAU =====
    b("Composition du bureau"),
    t(""),
    t("L\u2019assembl\u00e9e d\u00e9signe :"),
    t("- {president_bureau_civilite} {president_bureau_nom}, en qualit\u00e9 de pr\u00e9sident de s\u00e9ance ;"),
    t("- {scrutateur1_civilite} {scrutateur1_nom}, en qualit\u00e9 de premier scrutateur ;"),
    t("- {scrutateur2_civilite} {scrutateur2_nom}, en qualit\u00e9 de deuxi\u00e8me scrutateur ;"),
    t("- {secretaire_civilite} {secretaire_nom}, en qualit\u00e9 de secr\u00e9taire."),
    t(""),

    // ===== FEUILLE DE PRESENCE =====
    b("Feuille de pr\u00e9sence"),
    t(""),
    t("Il a \u00e9t\u00e9 \u00e9tabli une feuille de pr\u00e9sence qui a \u00e9t\u00e9 \u00e9marg\u00e9e par chaque actionnaire pr\u00e9sent ou repr\u00e9sent\u00e9."),
    t(""),
    t("Il r\u00e9sulte de cette feuille de pr\u00e9sence que {nombre_actionnaires_presents} actionnaires sont pr\u00e9sents ou repr\u00e9sent\u00e9s, poss\u00e9dant ensemble {nombre_actions_presentes} actions sur les {nombre_total_actions} composant le capital social, soit {pourcentage_quorum} % du capital."),
    t(""),
    t("L\u2019assembl\u00e9e, r\u00e9unissant plus du quart des actions ayant le droit de vote sur premi\u00e8re convocation (ou, sur deuxi\u00e8me convocation, aucun quorum n\u2019\u00e9tant requis), peut valablement d\u00e9lib\u00e9rer."),
    t(""),

    // ===== DOCUMENTS =====
    b("Documents mis \u00e0 disposition"),
    t(""),
    t("Le pr\u00e9sident rappelle que les documents suivants ont \u00e9t\u00e9 tenus \u00e0 la disposition des actionnaires au si\u00e8ge social, dans les d\u00e9lais l\u00e9gaux :"),
    t("- le rapport de gestion du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) ;"),
    t("- les \u00e9tats financiers de synth\u00e8se de l\u2019exercice clos le {exercice_clos_le} ;"),
    t("- le rapport g\u00e9n\u00e9ral du commissaire aux comptes ;"),
    t("- le rapport sp\u00e9cial du commissaire aux comptes sur les conventions r\u00e9glement\u00e9es ;"),
    t("- le texte des r\u00e9solutions propos\u00e9es."),
    t(""),
    t("Le pr\u00e9sident d\u00e9clare la discussion ouverte."),
    t(""),

    // ===== ORDRE DU JOUR =====
    b("Ordre du jour"),
    t(""),
    t("{ordre_du_jour}"),
    t(""),

    // ===== A. APPROBATION DES COMPTES =====
    t("{#has_approbation_comptes}"),
    b("A. Premi\u00e8re r\u00e9solution : Approbation des comptes de l\u2019exercice clos le {exercice_clos_le}"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale, apr\u00e8s avoir entendu la lecture du rapport de gestion du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral / du pr\u00e9sident) et du rapport du commissaire aux comptes, approuve les \u00e9tats financiers de synth\u00e8se de l\u2019exercice clos le {exercice_clos_le} tels qu\u2019ils lui ont \u00e9t\u00e9 pr\u00e9sent\u00e9s et qui font appara\u00eetre un r\u00e9sultat {resultat_type} de {resultat_montant} {devise}."),
    t(""),
    t("Elle approuve \u00e9galement les op\u00e9rations traduites dans ces comptes ou r\u00e9sum\u00e9es dans ces rapports."),
    t(""),
    t("En cons\u00e9quence, elle donne quitus aux administrateurs (ou \u00e0 l\u2019administrateur g\u00e9n\u00e9ral / au pr\u00e9sident) de leur gestion pour ledit exercice."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_approbation} voix pour, {votes_contre_approbation} voix contre et {abstentions_approbation} abstentions."),
    t(""),
    t("{/has_approbation_comptes}"),

    // ===== B. AFFECTATION DES RESULTATS =====
    t("{#has_affectation_resultats}"),
    b("B. Deuxi\u00e8me r\u00e9solution : Affectation des r\u00e9sultats"),
    t(""),
    t("{#is_beneficiaire}"),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide d\u2019affecter le r\u00e9sultat net b\u00e9n\u00e9ficiaire de {resultat_montant} {devise} de l\u2019exercice clos le {exercice_clos_le} de la mani\u00e8re suivante :"),
    t(""),
    t("{affectation_details}"),
    t("{/is_beneficiaire}"),
    t("{#is_deficitaire}"),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide d\u2019affecter le r\u00e9sultat net d\u00e9ficitaire de {resultat_montant} {devise} au report \u00e0 nouveau d\u00e9biteur."),
    t("{/is_deficitaire}"),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_affectation} voix pour, {votes_contre_affectation} voix contre et {abstentions_affectation} abstentions."),
    t(""),
    t("{/has_affectation_resultats}"),

    // ===== C. RATIFICATION NOMINATION ADMINISTRATEUR =====
    t("{#has_ratification_administrateur}"),
    b("C. Troisi\u00e8me r\u00e9solution : Ratification de la nomination d\u2019un administrateur"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale ratifie la nomination de {administrateur_ratifie_civilite} {administrateur_ratifie_nom}, coopt\u00e9(e) par le conseil d\u2019administration en sa s\u00e9ance du {date_cooptation}, en remplacement de {administrateur_remplace_nom}, pour la dur\u00e9e restant \u00e0 courir du mandat de ce dernier, soit jusqu\u2019\u00e0 l\u2019assembl\u00e9e g\u00e9n\u00e9rale qui statuera sur les comptes de l\u2019exercice clos le {fin_mandat_administrateur}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_ratification} voix pour, {votes_contre_ratification} voix contre et {abstentions_ratification} abstentions."),
    t(""),
    t("{/has_ratification_administrateur}"),

    // ===== D. NOMINATION ADMINISTRATEURS =====
    t("{#has_nomination_administrateurs}"),
    b("D. Quatri\u00e8me r\u00e9solution : Nomination d\u2019administrateurs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de nommer en qualit\u00e9 d\u2019administrateurs, pour une dur\u00e9e de {duree_mandat_administrateurs} :"),
    t(""),
    t("{liste_administrateurs_nommes}"),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_nomination_admin} voix pour, {votes_contre_nomination_admin} voix contre et {abstentions_nomination_admin} abstentions."),
    t(""),
    t("{/has_nomination_administrateurs}"),

    // ===== E. RENOUVELLEMENT MANDATS ADMINISTRATEURS =====
    t("{#has_renouvellement_administrateurs}"),
    b("E. Cinqui\u00e8me r\u00e9solution : Renouvellement des mandats d\u2019administrateurs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de renouveler les mandats d\u2019administrateurs de :"),
    t(""),
    t("{liste_administrateurs_renouveles}"),
    t(""),
    t("pour une dur\u00e9e de {duree_renouvellement_administrateurs}, soit jusqu\u2019\u00e0 l\u2019assembl\u00e9e g\u00e9n\u00e9rale qui statuera sur les comptes de l\u2019exercice clos le {fin_mandat_renouvellement}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_renouvellement_admin} voix pour, {votes_contre_renouvellement_admin} voix contre et {abstentions_renouvellement_admin} abstentions."),
    t(""),
    t("{/has_renouvellement_administrateurs}"),

    // ===== F. REVOCATION ADMINISTRATEUR =====
    t("{#has_revocation_administrateur}"),
    b("F. Sixi\u00e8me r\u00e9solution : R\u00e9vocation d\u2019un administrateur"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de r\u00e9voquer {administrateur_revoque_civilite} {administrateur_revoque_nom} de ses fonctions d\u2019administrateur, avec effet imm\u00e9diat."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_revocation} voix pour, {votes_contre_revocation} voix contre et {abstentions_revocation} abstentions."),
    t(""),
    t("{/has_revocation_administrateur}"),

    // ===== G. NOMINATION CAC =====
    t("{#has_nomination_cac}"),
    b("G. Septi\u00e8me r\u00e9solution : Nomination du commissaire aux comptes"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de nommer :"),
    t("- {commissaire_titulaire_nom}, demeurant \u00e0 {commissaire_titulaire_adresse}, en qualit\u00e9 de commissaire aux comptes titulaire ;"),
    t("- {commissaire_suppleant_nom}, demeurant \u00e0 {commissaire_suppleant_adresse}, en qualit\u00e9 de commissaire aux comptes suppl\u00e9ant,"),
    t("pour une dur\u00e9e de {commissaire_duree}, prenant fin \u00e0 l\u2019issue de l\u2019assembl\u00e9e g\u00e9n\u00e9rale qui statuera sur les comptes de l\u2019exercice clos le {commissaire_fin_mandat}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_cac} voix pour, {votes_contre_cac} voix contre et {abstentions_cac} abstentions."),
    t(""),
    t("{/has_nomination_cac}"),

    // ===== H. INDEMNITE DE FONCTION =====
    t("{#has_indemnite_fonction}"),
    b("H. Huiti\u00e8me r\u00e9solution : Indemnit\u00e9 de fonction des administrateurs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de fixer le montant global des indemnit\u00e9s de fonction allou\u00e9es aux administrateurs pour l\u2019exercice en cours \u00e0 la somme de {montant_indemnite} {devise}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_indemnite} voix pour, {votes_contre_indemnite} voix contre et {abstentions_indemnite} abstentions."),
    t(""),
    t("{/has_indemnite_fonction}"),

    // ===== I. RENOUVELLEMENT CAC =====
    t("{#has_renouvellement_cac}"),
    b("I. Neuvi\u00e8me r\u00e9solution : Renouvellement du mandat du commissaire aux comptes"),
    t(""),
    t("Le mandat de {commissaire_titulaire_nom}, commissaire aux comptes titulaire, arrivant \u00e0 expiration \u00e0 l\u2019issue de la pr\u00e9sente assembl\u00e9e, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de renouveler son mandat pour une dur\u00e9e de {commissaire_duree}, soit jusqu\u2019\u00e0 l\u2019issue de l\u2019assembl\u00e9e g\u00e9n\u00e9rale qui statuera sur les comptes de l\u2019exercice clos le {commissaire_fin_mandat}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_renouvellement_cac} voix pour, {votes_contre_renouvellement_cac} voix contre et {abstentions_renouvellement_cac} abstentions."),
    t(""),
    t("{/has_renouvellement_cac}"),

    // ===== J. NON-RENOUVELLEMENT CAC =====
    t("{#has_non_renouvellement_cac}"),
    b("J. Dixi\u00e8me r\u00e9solution : Non-renouvellement du mandat du commissaire aux comptes"),
    t(""),
    t("Le mandat de {commissaire_titulaire_nom}, commissaire aux comptes titulaire, arrivant \u00e0 expiration \u00e0 l\u2019issue de la pr\u00e9sente assembl\u00e9e, l\u2019assembl\u00e9e g\u00e9n\u00e9rale d\u00e9cide de ne pas renouveler son mandat."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_non_renouvellement_cac} voix pour, {votes_contre_non_renouvellement_cac} voix contre et {abstentions_non_renouvellement_cac} abstentions."),
    t(""),
    t("{/has_non_renouvellement_cac}"),

    // ===== K. RATIFICATION TRANSFERT SIEGE =====
    t("{#has_ratification_transfert_siege}"),
    b("K. Onzi\u00e8me r\u00e9solution : Ratification du transfert du si\u00e8ge social"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale ratifie la d\u00e9cision du conseil d\u2019administration (ou de l\u2019administrateur g\u00e9n\u00e9ral) de transf\u00e9rer le si\u00e8ge social de {ancien_siege} \u00e0 {nouveau_siege}, \u00e0 compter du {date_transfert}."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 {votes_pour_transfert} voix pour, {votes_contre_transfert} voix contre et {abstentions_transfert} abstentions."),
    t(""),
    t("{/has_ratification_transfert_siege}"),

    // ===== L. POUVOIRS =====
    t("{#has_pouvoirs}"),
    b("L. Derni\u00e8re r\u00e9solution : Pouvoirs"),
    t(""),
    t("L\u2019assembl\u00e9e g\u00e9n\u00e9rale donne tous pouvoirs au porteur d\u2019une copie ou d\u2019un extrait du pr\u00e9sent proc\u00e8s-verbal \u00e0 l\u2019effet d\u2019accomplir toutes formalit\u00e9s l\u00e9gales ou autres."),
    t(""),
    it("Cette r\u00e9solution est adopt\u00e9e \u00e0 l\u2019unanimit\u00e9."),
    t(""),
    t("{/has_pouvoirs}"),

    // ===== CLOTURE =====
    t("Plus rien n\u2019\u00e9tant \u00e0 l\u2019ordre du jour, la s\u00e9ance est lev\u00e9e \u00e0 {heure_fin} heures."),
    t(""),
    t("De tout ce que dessus, il a \u00e9t\u00e9 dress\u00e9 le pr\u00e9sent proc\u00e8s-verbal, sign\u00e9 par les membres du bureau."),
    t(""),
    t(""),
    b("Le Pr\u00e9sident de s\u00e9ance"),
    t("{president_bureau_civilite} {president_bureau_nom}"),
    t(""),
    t(""),
    b("Les Scrutateurs"),
    t("{scrutateur1_civilite} {scrutateur1_nom}"),
    t("{scrutateur2_civilite} {scrutateur2_nom}"),
    t(""),
    t(""),
    b("Le Secr\u00e9taire"),
    t("{secretaire_civilite} {secretaire_nom}"),
    t(""),
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

  const outputDir = path.join(__dirname, "../templates/pv-ago-sa");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "pv.docx");
  const buffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Template cr\u00e9\u00e9 : ${outputPath}`);
  console.log(`Taille : ${(buffer.length / 1024).toFixed(1)} Ko`);
}

createTemplate();
