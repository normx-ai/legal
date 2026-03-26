/**
 * Script pour créer le template DOCX du PV de réunion du Conseil d'Administration — SA OHADA (Model 25)
 * Basé sur le modèle officiel du Guide Pratique des Sociétés Commerciales et du GIE - OHADA
 * Usage : npx tsx scripts/create-pv-reunion-ca-template.ts
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
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">PV r\u00e9union CA \u2014 {denomination}</w:t></w:r>
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
    c("PROC\u00c8S VERBAL DE LA R\u00c9UNION DU CONSEIL D\u2019ADMINISTRATION DU {date_reunion}"),
    t(""),

    // ===== PREAMBULE =====
    t("L\u2019an {date_reunion_lettres}, et le {date_reunion}, \u00e0 {heure_reunion_lettres} heures,"),
    t(""),
    t("Le conseil d\u2019administration s\u2019est r\u00e9uni \u00e0 {lieu_reunion}, sur convocation faite par son pr\u00e9sident."),
    t(""),

    // ===== ADMINISTRATEURS PRESENTS =====
    b("Administrateurs pr\u00e9sents"),
    t("{#administrateurs_presents}"),
    t("- {civilite} {prenom} {nom}"),
    t("{/administrateurs_presents}"),
    t(""),

    // ===== ADMINISTRATEURS REPRESENTES =====
    t("{#has_representes}"),
    b("Administrateurs absents repr\u00e9sent\u00e9s"),
    t("{#administrateurs_representes}"),
    t("- {civilite} {prenom} {nom} repr\u00e9sent\u00e9 par {represente_par}"),
    t("{/administrateurs_representes}"),
    t(""),
    t("{/has_representes}"),

    // ===== ADMINISTRATEURS ABSENTS =====
    t("{#has_absents}"),
    b("Administrateurs absents non repr\u00e9sent\u00e9s"),
    t("{#administrateurs_absents}"),
    t("- {civilite} {prenom} {nom}"),
    t("{/administrateurs_absents}"),
    t(""),
    t("{/has_absents}"),

    // ===== ADMINISTRATEURS VISIO =====
    t("{#has_visio}"),
    b("Administrateurs participant par visioconf\u00e9rence"),
    t("{#administrateurs_visio}"),
    t("- {civilite} {prenom} {nom}"),
    t("{/administrateurs_visio}"),
    t(""),
    t("{/has_visio}"),

    // ===== COMMISSAIRE =====
    t("{#commissaire_present}"),
    t("M {commissaire_nom}, commissaire aux comptes est pr\u00e9sent."),
    t("{/commissaire_present}"),
    t(""),

    // ===== CONSTITUTION DU BUREAU =====
    t("La r\u00e9union est pr\u00e9sid\u00e9e par {president_civilite} {president_prenom} {president_nom}."),
    t("{secretaire_nom} est d\u00e9sign\u00e9 secr\u00e9taire de s\u00e9ance."),
    t(""),
    t("Le pr\u00e9sident constate que :"),
    t("- tous les administrateurs et le commissaire aux comptes ont \u00e9t\u00e9 r\u00e9guli\u00e8rement convoqu\u00e9s ;"),
    t("- {nombre_presents} administrateurs sont pr\u00e9sents ou repr\u00e9sent\u00e9s, soit plus de la moiti\u00e9 des membres du conseil."),
    t(""),
    t("En cons\u00e9quence, le conseil peut valablement d\u00e9lib\u00e9rer."),
    t(""),
    t("Le Conseil d\u00e9lib\u00e8re ensuite sur les questions inscrites \u00e0 l\u2019ordre du jour :"),
    t(""),

    // ===== A. ARRETE DES COMPTES =====
    t("{#has_arrete_comptes}"),
    b("A. Arr\u00eat\u00e9 des comptes"),
    t(""),
    t("Le conseil d\u2019administration prend connaissance de l\u2019inventaire et des \u00e9tats financiers arr\u00eat\u00e9s au {exercice_clos_le}, et arr\u00eate d\u00e9finitivement les comptes annuels de cet exercice."),
    t(""),
    t("Il approuve le projet de r\u00e9partition des r\u00e9sultats suivants :"),
    t("{projet_repartition}"),
    t(""),
    t("Le pr\u00e9sident lui soumet ensuite le rapport de gestion \u00e0 pr\u00e9senter \u00e0 l\u2019assembl\u00e9e g\u00e9n\u00e9rale."),
    t(""),
    t("Le conseil approuve ce projet de rapport et donne mandat \u00e0 son pr\u00e9sident d\u2019en donner lecture \u00e0 l\u2019assembl\u00e9e g\u00e9n\u00e9rale ordinaire annuelle."),
    t(""),
    t("{/has_arrete_comptes}"),

    // ===== B. NOMINATION PRESIDENT DU CA OU PDG =====
    t("{#has_nomination_president}"),
    b("B. Nomination du pr\u00e9sident du conseil d\u2019administration ou du pr\u00e9sident-directeur g\u00e9n\u00e9ral"),
    t(""),
    t("Le conseil d\u2019administration nomme M {nouveau_president_nom} en qualit\u00e9 de pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) pour toute la dur\u00e9e de son mandat d\u2019administrateur, soit jusqu\u2019\u00e0 l\u2019issue de la r\u00e9union de l\u2019assembl\u00e9e g\u00e9n\u00e9rale ordinaire qui sera appel\u00e9e \u00e0 statuer sur les comptes de l\u2019exercice ..."),
    t(""),
    t("M... accepte ces fonctions et d\u00e9clare qu\u2019il n\u2019exerce pas simultan\u00e9ment plus de 3 mandats de pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) et qu\u2019il ne cumule pas ce mandat avec plus de 2 mandats d\u2019administrateur g\u00e9n\u00e9ral ou de directeur g\u00e9n\u00e9ral de soci\u00e9t\u00e9s anonymes ayant leur si\u00e8ge sur le territoire d\u2019un m\u00eame \u00c9tat partie."),
    t(""),
    t("M... en sa qualit\u00e9 de pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) est investi des pouvoirs que lui reconna\u00eet l\u2019Acte Uniforme."),
    t(""),
    t("En r\u00e9tribution de ses fonctions le pr\u00e9sident aura droit aux r\u00e9mun\u00e9rations suivantes : {remuneration_president}"),
    t(""),
    t("{/has_nomination_president}"),

    // ===== C. REMPLACEMENT DU PRESIDENT =====
    t("{#has_remplacement_president}"),
    b("C. Remplacement du pr\u00e9sident (ou pr\u00e9sident-directeur g\u00e9n\u00e9ral)"),
    t(""),
    t("M... est nomm\u00e9 pr\u00e9sident du conseil d\u2019administration ou pr\u00e9sident-directeur g\u00e9n\u00e9ral, en remplacement de M {ancien_president_nom} (d\u00e9missionnaire ou d\u00e9c\u00e9d\u00e9 ou r\u00e9voqu\u00e9) pour la dur\u00e9e de mandat d\u2019administrateur..."),
    t(""),
    t("{/has_remplacement_president}"),

    // ===== D. DEMISSION DU PRESIDENT ET SON REMPLACEMENT =====
    t("{#has_demission_president}"),
    b("D. D\u00e9mission du pr\u00e9sident et son remplacement"),
    t(""),
    t("M... le pr\u00e9sident expose que pour des raisons personnelles il ne d\u00e9sire plus exercer les fonctions de pr\u00e9sident du conseil d\u2019administration (ou de PDG) \u00e0 compter de ce jour."),
    t(""),
    t("Le conseil accepte cette d\u00e9mission et remercie le pr\u00e9sident..."),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9, le conseil proc\u00e8de au remplacement du pr\u00e9sident d\u00e9missionnaire et d\u00e9cide de nommer M... en qualit\u00e9 de pr\u00e9sident..."),
    t(""),
    t("{/has_demission_president}"),

    // ===== E. REVOCATION DU PRESIDENT =====
    t("{#has_revocation_president}"),
    b("E. R\u00e9vocation du pr\u00e9sident du conseil d\u2019administration ou du pr\u00e9sident-directeur g\u00e9n\u00e9ral"),
    t(""),
    t("Le conseil d\u2019administration d\u00e9cide de mettre fin \u00e0 compter de ce jour, aux fonctions de pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) de M..."),
    t(""),
    t("En remplacement de M..., le conseil d\u2019administration nomme M... en qualit\u00e9 de pr\u00e9sident..."),
    t(""),
    t("{/has_revocation_president}"),

    // ===== F. EMPECHEMENT TEMPORAIRE DU PRESIDENT =====
    t("{#has_empechement_president}"),
    b("F. Emp\u00eachement temporaire du pr\u00e9sident"),
    t(""),
    t("Le conseil d\u2019administration constate (ou prend acte de) l\u2019emp\u00eachement temporaire, de M......... pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) depuis le........."),
    t(""),
    t("En remplacement de M..., le conseil d\u2019administration d\u00e9l\u00e8gue \u00e0 M... administrateurs, les fonctions de pr\u00e9sident pour une dur\u00e9e de ........."),
    t(""),
    t("{/has_empechement_president}"),

    // ===== G. DECES OU CESSATION DES FONCTIONS DU PRESIDENT =====
    t("{#has_deces_president}"),
    b("G. D\u00e9c\u00e8s ou cessation des fonctions du pr\u00e9sident"),
    t(""),
    t("Le conseil d\u2019administration constate le d\u00e9c\u00e8s (ou prend acte de la cessation de fonctions), de M......... pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) depuis le.........."),
    t(""),
    t("En remplacement de M..., le conseil d\u2019administration d\u00e9l\u00e8gue \u00e0 (ou nomme) M... administrateur les fonctions (en qualit\u00e9) de pr\u00e9sident du conseil d\u2019administration (ou de pr\u00e9sident-directeur g\u00e9n\u00e9ral) jusqu\u2019\u00e0 la nomination de celui-ci"),
    t(""),
    t("{/has_deces_president}"),

    // ===== H. NOMINATION D'UN DIRECTEUR GENERAL =====
    t("{#has_nomination_dg}"),
    b("H. Nomination d\u2019un directeur g\u00e9n\u00e9ral"),
    t(""),
    t("Le conseil d\u2019administration nomme M {dg_nom} (administrateur ou non administrateur) en qualit\u00e9 de directeur g\u00e9n\u00e9ral de la soci\u00e9t\u00e9 pour une dur\u00e9e de {dg_duree}."),
    t(""),
    t("M... exercera ses fonctions jusqu\u2019au ... ;"),
    t(""),
    t("M..., en sa qualit\u00e9 de directeur g\u00e9n\u00e9ral, assure la direction g\u00e9n\u00e9rale de la soci\u00e9t\u00e9. Il la repr\u00e9sente dans ses rapports avec les tiers. Pour l\u2019exercice de ses fonctions, il est investi des pouvoirs les plus \u00e9tendus qu\u2019il exerce dans la limite de l\u2019objet social..."),
    t(""),
    t("Le directeur g\u00e9n\u00e9ral aura droit \u00e0 une r\u00e9mun\u00e9ration d\u00e9termin\u00e9e comme suit : {dg_remuneration}"),
    t(""),
    t("{/has_nomination_dg}"),

    // ===== I. DEMISSION DU DIRECTEUR GENERAL ET SON REMPLACEMENT =====
    t("{#has_demission_dg}"),
    b("I. D\u00e9mission du Directeur G\u00e9n\u00e9ral et son remplacement"),
    t(""),
    t("M... le pr\u00e9sident expose que M..., directeur g\u00e9n\u00e9ral a exprim\u00e9 le d\u00e9sir de ne plus exercer les fonctions de directeur g\u00e9n\u00e9ral \u00e0 compter de ce jour."),
    t(""),
    t("Le conseil accepte cette d\u00e9mission et remercie M..."),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9, le conseil proc\u00e8de au remplacement de M... et d\u00e9cide de nommer M... en qualit\u00e9 de directeur g\u00e9n\u00e9ral de la soci\u00e9t\u00e9 pour une dur\u00e9e de ..."),
    t(""),
    t("{/has_demission_dg}"),

    // ===== J. REVOCATION, EMPECHEMENT TEMPORAIRE OU DEFINITIF DU DG =====
    t("{#has_revocation_dg}"),
    b("J. R\u00e9vocation, emp\u00eachement temporaire ou d\u00e9finitif du directeur g\u00e9n\u00e9ral"),
    t(""),
    t("Le conseil d\u2019administration d\u00e9cide de mettre fin, \u00e0 compter de ce jour, au mandat de directeur g\u00e9n\u00e9ral de M..."),
    t(""),
    t("En remplacement de M... et sur proposition de son pr\u00e9sident, le conseil d\u2019administration nomme M... pour la dur\u00e9e restant \u00e0 courir du mandat de son pr\u00e9d\u00e9cesseur..."),
    t(""),
    t("{/has_revocation_dg}"),

    // ===== K. AUTORISATION DE CONVENTIONS =====
    t("{#has_autorisation_conventions}"),
    b("K. Autorisation de conventions"),
    t(""),
    t("Le pr\u00e9sident du conseil d\u2019administration (ou le pr\u00e9sident-directeur g\u00e9n\u00e9ral) pr\u00e9sente un projet de convention entre {convention_personne} et la soci\u00e9t\u00e9. Il rappelle que cette convention requiert l\u2019autorisation pr\u00e9alable du conseil d\u2019administration conform\u00e9ment aux dispositions l\u00e9gales."),
    t(""),
    t("Le pr\u00e9sident expose les \u00e9l\u00e9ments du projet de convention :"),
    t("{convention_details}"),
    t(""),
    t("Apr\u00e8s en avoir ensuite d\u00e9lib\u00e9r\u00e9, \u00e9tant pr\u00e9cis\u00e9 que M... (personne concern\u00e9e par la convention) n\u2019a pas pris part au vote, le conseil autorise la convention dont le projet lui a \u00e9t\u00e9 soumis \u00e0 l\u2019unanimit\u00e9 ou par {votes_pour} voix contre {votes_contre} voix et autorise M... \u00e0 conclure la convention et lui donne tous permis \u00e0 cet effet."),
    t(""),
    t("Le commissaire aux comptes sera inform\u00e9 de l\u2019autorisation accord\u00e9e dans le d\u00e9lai d\u2019un mois \u00e0 compter de la conclusion de la convention."),
    t(""),
    t("{/has_autorisation_conventions}"),

    // ===== L. COOPTATION D'ADMINISTRATEURS =====
    t("{#has_cooptation}"),
    b("L. Cooptation d\u2019administrateurs"),
    t(""),
    t("Le pr\u00e9sident expose qu\u2019un poste (ou plusieurs postes) d\u2019administrateur est vacant du fait du d\u00e9c\u00e8s ou de la d\u00e9mission de M..."),
    t(""),
    t("Il pr\u00e9cise que le nombre d\u2019administrateurs restant n\u2019est pas inf\u00e9rieur au minimum statutaire mais est \u00e9gal ou sup\u00e9rieur au minimum l\u00e9gal, il y a lieu de proc\u00e9der \u00e0 la nomination d\u2019un nouvel administrateur en remplacement de M..."),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9, le conseil nomme M {administrateur_coopte_nom} (\u00e0 l\u2019unanimit\u00e9 ou \u00e0 ... voix contre ... voix) en remplacement de M... \u00e0 titre provisoire."),
    t(""),
    t("Cette nomination sera soumise \u00e0 la ratification de la prochaine assembl\u00e9e g\u00e9n\u00e9rale ordinaire."),
    t(""),
    t("{/has_cooptation}"),

    // ===== M. MISE EN HARMONIE DES STATUTS =====
    t("{#has_mise_harmonie}"),
    b("M. Mise en harmonie des statuts"),
    t(""),
    t("{mise_harmonie_details}"),
    t(""),
    t("{/has_mise_harmonie}"),

    // ===== N. TRANSFERT DU SIEGE SOCIAL DANS LA MEME VILLE =====
    t("{#has_transfert_siege}"),
    b("N. Transfert du si\u00e8ge social dans la m\u00eame ville du si\u00e8ge"),
    t(""),
    t("Le conseil d\u2019administration d\u00e9cide de transf\u00e9rer le si\u00e8ge social qui \u00e9tait pr\u00e9c\u00e9demment fix\u00e9 \u00e0 {ancien_siege} \u00e0 {nouveau_siege} \u00e0 compter du ..."),
    t(""),
    t("En cons\u00e9quence, le conseil d\u2019administration d\u00e9cide de modifier l\u2019article n\u00b0... des statuts."),
    t(""),
    t("Article n\u00b0 ... Si\u00e8ge social"),
    t("\u00ab le si\u00e8ge social est fix\u00e9 \u00e0 {nouveau_siege} \u00bb"),
    t(""),
    t("Cette d\u00e9cision sera soumise \u00e0 la ratification de la prochaine assembl\u00e9e g\u00e9n\u00e9rale ordinaire."),
    t(""),
    t("{/has_transfert_siege}"),

    // ===== O. EXAMEN DU REGISTRE DES TITRES NOMINATIFS =====
    t("{#has_examen_registre}"),
    b("O. Examen du registre des titres nominatifs"),
    t(""),
    t("Le conseil d\u2019administration constate que le registre des titres nominatifs est tenu \u00e0 jour et il contient toutes les mentions l\u00e9gales. Le conseil donne mandat au Pr\u00e9sident de d\u00e9livrer au commissaire aux comptes une attestation de tenue r\u00e9guli\u00e8re et conforme \u00e0 la loi, du registre des titres nominatifs."),
    t(""),
    t("{/has_examen_registre}"),

    // ===== R. RAPPORT A L'ASSEMBLEE GENERALE ANNUELLE =====
    t("{#has_rapport_ag}"),
    b("R. Rapport \u00e0 l\u2019Assembl\u00e9e g\u00e9n\u00e9rale annuelle"),
    t(""),
    t("Le conseil arr\u00eate ensuite les termes du rapport qu\u2019il pr\u00e9sentera \u00e0 l\u2019assembl\u00e9e, ainsi que le texte des r\u00e9solutions qui seront propos\u00e9es au vote des actionnaires. Un exemplaire de ce rapport sera mis \u00e0 la disposition du commissaire aux comptes dans les plus courts d\u00e9lais."),
    t(""),
    t("{/has_rapport_ag}"),

    // ===== S. CONVOCATION AG =====
    t("{#has_convocation_ag}"),
    b("S. Convocation de l\u2019assembl\u00e9e g\u00e9n\u00e9rale ordinaire annuelle"),
    t(""),
    t("Le conseil d\u00e9cide de convoquer les actionnaires en assembl\u00e9e g\u00e9n\u00e9rale ordinaire annuelle le {date_convocation_ag}."),
    t(""),
    t("{/has_convocation_ag}"),

    // ===== T. COMMUNICATION DES DOCUMENTS AUX ACTIONNAIRES =====
    t("{#has_communication_documents}"),
    b("T. Communication des documents aux actionnaires"),
    t(""),
    t("Le conseil charge son pr\u00e9sident ou le pr\u00e9sident-directeur g\u00e9n\u00e9ral de prendre toutes mesures utiles en vue de permettre aux actionnaires d\u2019exercer leur droit de communication des documents et renseignements relatifs \u00e0 la prochaine assembl\u00e9e dans les conditions et d\u00e9lais pr\u00e9vus par les dispositions l\u00e9gales et r\u00e9glementaires."),
    t(""),
    t("{/has_communication_documents}"),

    // ===== U. TRANSFERT DU SIEGE SOCIAL EN TOUTE AUTRE VILLE =====
    t("{#has_transfert_siege_autre_ville}"),
    b("U. Transfert du si\u00e8ge social en toute autre ville"),
    t(""),
    t("Le conseil d\u2019administration propose le transfert du si\u00e8ge social de {ancien_siege} \u00e0 {nouveau_siege} \u00e0 compter du {date_effet} pour les raisons suivantes : {raisons_transfert}"),
    t(""),
    t("Le conseil d\u2019administration d\u00e9cide de convoquer l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire le {date_age} \u00e0 {heure_age} heures au {lieu_age} \u00e0 l\u2019effet de d\u00e9lib\u00e9rer sur l\u2019ordre du jour suivant : Transfert du si\u00e8ge social"),
    t(""),
    t("{/has_transfert_siege_autre_ville}"),

    // ===== V. AUGMENTATION DE CAPITAL EN NUMERAIRE =====
    t("{#has_augmentation_capital_numeraire}"),
    b("V. Augmentation de capital en num\u00e9raire ou par compensation avant AGE"),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9, le conseil d\u2019administration d\u00e9cide le principe d\u2019une augmentation de capital de {montant_augmentation} par \u00e9mission de {nombre_actions} actions nouvelles \u00e0 lib\u00e9rer en num\u00e9raire ou par compensation avec des cr\u00e9ances certaines, liquides, exigibles sur la soci\u00e9t\u00e9."),
    t(""),
    t("Ces actions \u00e9mises avec une prime d\u2019\u00e9mission de FCFA {prime_emission}..."),
    t(""),
    t("Le conseil d\u00e9cide de convoquer l\u2019assembl\u00e9e g\u00e9n\u00e9rale extraordinaire..."),
    t(""),
    t("{/has_augmentation_capital_numeraire}"),

    // ===== AE. REDUCTION DE CAPITAL MOTIVEE PAR DES PERTES =====
    t("{#has_reduction_capital_pertes}"),
    b("AE. R\u00e9duction de capital motiv\u00e9e par des pertes"),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9 le conseil d\u2019administration d\u00e9cide de proposer \u00e0 l\u2019AGE un projet de r\u00e9duction de capital pour le ramener de FCFA {ancien_capital} \u00e0 FCFA {nouveau_capital} pour absorber la perte de FCFA {montant_perte} inscrite au poste report \u00e0 nouveau."),
    t(""),
    t("Le conseil d\u2019administration d\u00e9cide de convoquer l\u2019AGE..."),
    t(""),
    t("{/has_reduction_capital_pertes}"),

    // ===== AF. REDUCTION DE CAPITAL PAR VOIE DE REMBOURSEMENT =====
    t("{#has_reduction_capital_remboursement}"),
    b("AF. R\u00e9duction de capital par voie de remboursement"),
    t(""),
    t("Apr\u00e8s en avoir d\u00e9lib\u00e9r\u00e9 le conseil d\u2019administration d\u00e9cide de proposer \u00e0 l\u2019AGE un projet de r\u00e9duction de capital pour le ramener de FCFA {ancien_capital} \u00e0 FCFA {nouveau_capital} par voie de remboursement \u00e0 chaque action d\u2019une somme de FCFA {montant_remboursement}."),
    t(""),
    t("{/has_reduction_capital_remboursement}"),

    // ===== CLOTURE =====
    t("Plus rien n\u2019\u00e9tant \u00e0 l\u2019ordre du jour, la s\u00e9ance est lev\u00e9e."),
    t(""),
    t("Le pr\u00e9sent proc\u00e8s-verbal, apr\u00e8s lecture, a \u00e9t\u00e9 sign\u00e9 par le pr\u00e9sident et un administrateur."),
    t(""),
    t(""),
    b("Le Pr\u00e9sident de s\u00e9ance"),
    t(""),
    t(""),
    b("Un Administrateur"),
    t(""),
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

  const outputDir = path.join(__dirname, "../templates/pv-reunion-ca");
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
