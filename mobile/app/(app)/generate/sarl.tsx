import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useWizardStore } from "@/lib/store/wizard";
import { useDocumentsStore } from "@/lib/store/documents";
import { documentsApi } from "@/lib/api/documents";
import { useTranslation } from "react-i18next";

const STEPS = ["Société", "Associés", "Capital", "Gérance", "Clauses", "Récapitulatif", "Aperçu"];

function formatMontant(v: number | string): string {
  const n = typeof v === 'string' ? parseInt(v.replace(/\s/g, '')) : v;
  if (!n || isNaN(n)) return '';
  return n.toLocaleString('fr-FR');
}

function parseMontant(v: string): number {
  return parseInt(v.replace(/\s/g, '').replace(/\./g, '')) || 0;
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: "default" | "numeric" | "email-address"; colors: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 14, color: colors.text, marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted}
        multiline={multiline} keyboardType={keyboardType as undefined}
        style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, padding: 13,
          fontFamily: fonts.regular, color: colors.text, fontSize: 15,
          minHeight: multiline ? 80 : undefined, textAlignVertical: multiline ? "top" : undefined }} />
    </View>
  );
}

function Choice({ label, options, value, onChange, colors }: {
  label: string; options: { value: string; label: string }[]; value: string;
  onChange: (v: string) => void; colors: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 14, color: colors.text, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {options.map((o) => (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)}
            style={{ flex: 1, padding: 12, backgroundColor: value === o.value ? colors.primary : colors.input,
              alignItems: "center", borderWidth: 1, borderColor: value === o.value ? colors.primary : colors.border }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: value === o.value ? "#fff" : colors.text }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: Record<string, string> }) {
  return (
    <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 12, marginTop: 8 }}>{title}</Text>
  );
}

export default function SarlWizardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const w = useWizardStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const isSarlu = w.associes.length === 1;
      const endpoint = isSarlu ? "/generate/sarlu" : "/generate/sarl";
      const { data } = await documentsApi.generate(endpoint, {
        denomination: w.denomination, sigle: w.sigle || undefined,
        objet_social: w.objet_social, siege_social: w.siege_social,
        ville: w.ville, pays: w.pays, duree: w.duree,
        exercice_debut: w.exercice_debut, exercice_fin: w.exercice_fin,
        premier_exercice_fin: w.premier_exercice_fin,
        capital: w.capital, valeur_nominale: w.valeur_nominale,
        mode_liberation: w.mode_liberation,
        lieu_depot: w.lieu_depot, nom_depositaire: w.nom_depositaire,
        date_certificat_depot: w.date_certificat_depot,
        associes: w.associes, gerant: {
          ...w.gerant, preavis_mois: w.gerant.preavis_mois,
          seuil_majorite_nomination: w.gerant.seuil_majorite_nomination,
          seuil_majorite_vie_sociale: w.gerant.seuil_majorite_vie_sociale,
          limitations_pouvoirs: w.gerant.limitations_pouvoirs,
        },
        cession_associes: w.clauses.cession_associes,
        seuil_cession_associes: w.clauses.seuil_cession_associes,
        cession_famille: w.clauses.cession_famille,
        transmission_deces: w.clauses.transmission_deces,
        mode_contestation: w.clauses.mode_contestation,
        mandataire: {
          civilite: w.clauses.mandataire_civilite, nom: w.clauses.mandataire_nom,
          prenom: w.clauses.mandataire_prenom, adresse: w.clauses.mandataire_adresse,
        },
        engagements_mandataire: w.clauses.engagements_mandataire,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        lieu_signature: w.lieu_signature,
      });
      addDocument(data.document);
      setGeneratedUrl(data.docx_url);
      w.nextStep();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } };
      const errors = e.response?.data?.errors;
      if (errors && Array.isArray(errors)) { setError(errors.map((x) => x.message).join("\n")); }
      else { setError(e.response?.data?.error || "Erreur lors de la génération"); }
    } finally { setIsGenerating(false); }
  }, [w, addDocument]);

  const handleDownload = useCallback(() => {
    if (generatedUrl && Platform.OS === "web") {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
      window.open(`${baseUrl.replace(/\/api$/, "")}${generatedUrl}`, "_blank");
    }
  }, [generatedUrl]);

  const isLastDataStep = w.currentStep === 5;
  const isDownloadStep = w.currentStep === 6;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const isSarlu = w.associes.length === 1;
    const nombreParts = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: isSarlu ? "Société à Responsabilité Limitée Unipersonnelle" : "Société à Responsabilité Limitée", center: true, size: "md" as const },
      { text: `Au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "sm" as const },
      { text: `Siège social : ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "STATUTS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "Entre les soussignés :", spaceBefore: true },
    ];
    w.associes.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Associé ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}${a.adresse ? ", demeurant à " + a.adresse : ""} ;` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Article premier : Forme", bold: true, spaceBefore: true },
      { text: `Il est formé entre les soussignés une ${isSarlu ? "société à responsabilité limitée unipersonnelle" : "société à responsabilité limitée"} régie par l'Acte Uniforme OHADA.` },
      { text: "", spaceBefore: true },
      { text: "Article 2 : Dénomination", bold: true, spaceBefore: true },
      { text: `La société a pour dénomination sociale « ${v(w.denomination)} ».${w.sigle ? ` Son sigle est : « ${w.sigle} ».` : ""}` },
      { text: "", spaceBefore: true },
      { text: "Article 3 : Objet", bold: true, spaceBefore: true },
      { text: v(w.objet_social) },
      { text: "", spaceBefore: true },
      { text: "Article 4 : Siège social", bold: true, spaceBefore: true },
      { text: `Le siège social est fixé à ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}.` },
      { text: "", spaceBefore: true },
      { text: "Article 8 : Capital social", bold: true, spaceBefore: true },
      { text: `Le capital social est fixé à ${w.capital.toLocaleString("fr-FR")} FCFA, divisé en ${nombreParts} parts de ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA chacune.` },
      { text: "", spaceBefore: true },
      { text: "Article 16 : Gérance", bold: true, spaceBefore: true },
      { text: `Est nommé gérant : ${v(w.gerant.prenom)} ${v(w.gerant.nom)}, demeurant à ${v(w.gerant.adresse)}.` },
      { text: "", spaceBefore: true },
      { text: "[ ... articles complets dans le document DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature || w.ville)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.sigle, w.objet_social, w.siege_social, w.ville, w.pays,
      w.capital, w.valeur_nominale, w.associes, w.gerant, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title={t("sarl.title")}
      steps={STEPS}
      currentStep={w.currentStep}
      onBack={() => { if (w.currentStep === 0) router.back(); else w.prevStep(); }}
      onPrev={w.prevStep}
      onNext={isLastDataStep ? handleGenerate : w.nextStep}
      isLastDataStep={isLastDataStep}
      isDownloadStep={isDownloadStep}
      isGenerating={isGenerating}
      error={error}
      previewLines={previewLines}
    >

        {/* ── Étape 0 : Société ── */}
        {w.currentStep === 0 && (
          <>
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.setSociete({ denomination: v })} placeholder="Ex: OMEGA SERVICES" />
            <Field colors={colors} label="Sigle (optionnel)" value={w.sigle} onChangeText={(v) => w.setSociete({ sigle: v })} placeholder="Ex: OS" />
            <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.setSociete({ objet_social: v })} placeholder="Décrivez l'activité principale..." multiline />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.setSociete({ siege_social: v })} placeholder="123 Avenue de la Paix" />
            <Field colors={colors} label="Ville" value={w.ville} onChangeText={(v) => w.setSociete({ ville: v })} />
            <Field colors={colors} label="Pays" value={w.pays} onChangeText={(v) => w.setSociete({ pays: v })} />
            <Field colors={colors} label="Durée de la société (années)" value={String(w.duree)} onChangeText={(v) => w.setSociete({ duree: parseInt(v) || 99 })} keyboardType="numeric" />
            <Field colors={colors} label="Date de clôture du 1er exercice" value={w.premier_exercice_fin} onChangeText={(v) => w.setSociete({ premier_exercice_fin: v })} placeholder="Ex: 31 décembre 2026" />
          </>
        )}

        {/* ── Étape 1 : Associés ── */}
        {w.currentStep === 1 && (
          <>
            {w.associes.map((a, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Associé {i + 1}</Text>
                  {w.associes.length > 1 && (
                    <TouchableOpacity onPress={() => w.removeAssocie(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => w.updateAssocie(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.updateAssocie(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => w.updateAssocie(i, { prenom: v })} /></View>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={a.date_naissance} onChangeText={(v) => w.updateAssocie(i, { date_naissance: v })} placeholder="01/01/1980" /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={a.lieu_naissance} onChangeText={(v) => w.updateAssocie(i, { lieu_naissance: v })} /></View>
                </View>
                <Field colors={colors} label="Nationalité" value={a.nationalite} onChangeText={(v) => w.updateAssocie(i, { nationalite: v })} />
                <Field colors={colors} label="Profession" value={a.profession} onChangeText={(v) => w.updateAssocie(i, { profession: v })} />
                <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => w.updateAssocie(i, { adresse: v })} />
                <Field colors={colors} label="Montant de l'apport (FCFA)" value={formatMontant(a.apport)} onChangeText={(v) => w.updateAssocie(i, { apport: parseMontant(v) })} keyboardType="numeric" placeholder="Ex: 1 000 000" />
                <Choice colors={colors} label="Type d'apport" options={[
                  { value: "numeraire", label: "Numéraire" },
                  { value: "nature", label: "Nature" },
                  { value: "industrie", label: "Industrie" },
                ]} value={a.type_apport} onChange={(v) => w.updateAssocie(i, { type_apport: v as "numeraire" | "nature" | "industrie" })} />
                {(a.type_apport === "nature" || a.type_apport === "industrie") && (
                  <Field colors={colors} label={a.type_apport === "nature" ? "Description de l'apport en nature" : "Description des services apportés"} value={a.description_apport} onChangeText={(v) => w.updateAssocie(i, { description_apport: v })} placeholder="Décrivez l'apport..." multiline />
                )}
              </View>
            ))}
            {w.associes.length < 50 && (
              <TouchableOpacity onPress={w.addAssocie}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un associé</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Étape 2 : Capital & Libération ── */}
        {w.currentStep === 2 && (() => {
          const nombreParts = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          const totalApports = w.associes.reduce((s, a) => s + a.apport, 0);
          return (
            <>
              <Field colors={colors} label="Capital social total (FCFA)" value={formatMontant(w.capital)} onChangeText={(v) => w.setCapital({ capital: parseMontant(v) })} keyboardType="numeric" placeholder="Ex: 5 000 000" />
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>Capital minimum SARL : 1 000 000 FCFA (Art. 311 AUSCGIE)</Text>
              <Field colors={colors} label="Valeur nominale d'une part (FCFA)" value={formatMontant(w.valeur_nominale)} onChangeText={(v) => w.setCapital({ valeur_nominale: parseMontant(v) })} keyboardType="numeric" placeholder="Ex: 5 000" />
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>Valeur nominale minimum : 5 000 FCFA (Art. 311-1 AUSCGIE)</Text>

              <Choice colors={colors} label="Mode de libération du capital" options={[
                { value: "intégralement", label: "Intégralement" },
                { value: "la moitié", label: "À la moitié (1/2)" },
              ]} value={w.mode_liberation} onChange={(v) => w.setCapital({ mode_liberation: v as "intégralement" | "la moitié" })} />

              <SectionTitle title="Dépôt des fonds" colors={colors} />
              <Field colors={colors} label="Dépositaire (banque ou notaire)" value={w.nom_depositaire} onChangeText={(v) => w.setCapital({ nom_depositaire: v })} placeholder="Ex: Banque Commerciale du Congo" />
              <Field colors={colors} label="Lieu de dépôt" value={w.lieu_depot} onChangeText={(v) => w.setCapital({ lieu_depot: v })} placeholder="Ex: Agence de Brazzaville" />
              <Field colors={colors} label="Date du certificat de dépôt" value={w.date_certificat_depot} onChangeText={(v) => w.setCapital({ date_certificat_depot: v })} placeholder="Ex: 20/03/2026" />

              <SectionTitle title="Répartition des parts" colors={colors} />
              <View style={{ backgroundColor: colors.card, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Nombre total de parts</Text>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{nombreParts.toLocaleString("fr-FR")}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Total apports</Text>
                  <Text style={{ fontFamily: fonts.semiBold, color: totalApports === w.capital ? colors.success : colors.danger }}>
                    {totalApports.toLocaleString("fr-FR")} FCFA
                  </Text>
                </View>
                {w.associes.map((a, i) => {
                  const parts = w.valeur_nominale > 0 ? Math.floor(a.apport / w.valeur_nominale) : 0;
                  const pct = w.capital > 0 ? ((a.apport / w.capital) * 100).toFixed(1) : "0";
                  return (
                    <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={{ fontFamily: fonts.regular, color: colors.text }}>{a.prenom} {a.nom}</Text>
                      <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>{parts} parts ({pct}%)</Text>
                    </View>
                  );
                })}
              </View>
            </>
          );
        })()}

        {/* ── Étape 3 : Gérance & Pouvoirs ── */}
        {w.currentStep === 3 && (
          <>
            <SectionTitle title="Identité du gérant" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.gerant.civilite} onChange={(v) => w.setGerant({ civilite: v })} />

            {w.associes.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Remplir depuis un associé :</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {w.associes.map((a, i) => (
                    <TouchableOpacity key={i} onPress={() => w.setGerant({
                      civilite: a.civilite, nom: a.nom, prenom: a.prenom,
                      date_naissance: a.date_naissance, lieu_naissance: a.lieu_naissance,
                      nationalite: a.nationalite, adresse: a.adresse,
                    })} style={{ backgroundColor: colors.input, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary }}>{a.prenom} {a.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant.nom} onChangeText={(v) => w.setGerant({ nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.gerant.prenom} onChangeText={(v) => w.setGerant({ prenom: v })} /></View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={w.gerant.date_naissance} onChangeText={(v) => w.setGerant({ date_naissance: v })} placeholder="01/01/1980" /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={w.gerant.lieu_naissance} onChangeText={(v) => w.setGerant({ lieu_naissance: v })} /></View>
            </View>
            <Field colors={colors} label="Nationalité" value={w.gerant.nationalite} onChangeText={(v) => w.setGerant({ nationalite: v })} />
            <Field colors={colors} label="Adresse" value={w.gerant.adresse} onChangeText={(v) => w.setGerant({ adresse: v })} />
            <Field colors={colors} label="Durée du mandat" value={w.gerant.duree_mandat} onChangeText={(v) => w.setGerant({ duree_mandat: v })} />
            <Field colors={colors} label="Rémunération" value={w.gerant.remuneration} onChangeText={(v) => w.setGerant({ remuneration: v })} />

            <SectionTitle title="Conditions de nomination" colors={colors} />
            <Field colors={colors} label="Préavis de démission (en mois)" value={w.gerant.preavis_mois} onChangeText={(v) => w.setGerant({ preavis_mois: v })} placeholder="trois" />
            <Field colors={colors} label="Majorité supérieure de nomination (optionnel)" value={w.gerant.seuil_majorite_nomination} onChangeText={(v) => w.setGerant({ seuil_majorite_nomination: v })} placeholder="Laisser vide = majorité de plus de la moitié" />

            <SectionTitle title="Limitation de pouvoirs (optionnel)" colors={colors} />
            <Field colors={colors} label="Actes nécessitant l'autorisation des associés" value={w.gerant.limitations_pouvoirs} onChangeText={(v) => w.setGerant({ limitations_pouvoirs: v })} placeholder="Ex: emprunts supérieurs à 5.000.000 FCFA, cession d'immeubles..." multiline />
          </>
        )}

        {/* ── Étape 4 : Clauses ── */}
        {w.currentStep === 4 && (
          <>
            <SectionTitle title="Cession de parts entre associés (Art. 12)" colors={colors} />
            <Choice colors={colors} label="Cessions entre associés" options={[
              { value: "libre", label: "Librement cessibles" },
              { value: "agrement", label: "Soumises à agrément" },
            ]} value={w.clauses.cession_associes} onChange={(v) => w.setClauses({ cession_associes: v as "libre" | "agrement" })} />

            <Choice colors={colors} label="Cessions aux conjoints, ascendants, descendants" options={[
              { value: "libre", label: "Librement cessibles" },
              { value: "agrement", label: "Soumises à agrément" },
            ]} value={w.clauses.cession_famille} onChange={(v) => w.setClauses({ cession_famille: v as "libre" | "agrement" })} />

            <SectionTitle title="Transmission par décès (Art. 13)" colors={colors} />
            <Choice colors={colors} label="En cas de décès d'un associé" options={[
              { value: "libre", label: "Libre transmission" },
              { value: "agrement", label: "Agrément requis" },
            ]} value={w.clauses.transmission_deces} onChange={(v) => w.setClauses({ transmission_deces: v as "libre" | "agrement" })} />

            <SectionTitle title="Règlement des contestations (Art. 28)" colors={colors} />
            <Choice colors={colors} label="Mode de règlement" options={[
              { value: "droit_commun", label: "Tribunal de commerce" },
              { value: "arbitrage", label: "Arbitrage OHADA" },
            ]} value={w.clauses.mode_contestation} onChange={(v) => w.setClauses({ mode_contestation: v as "droit_commun" | "arbitrage" })} />

            <SectionTitle title="Mandataire pour engagements (Art. 29)" colors={colors} />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Personne mandatée pour prendre des engagements au nom de la société en formation.
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.clauses.mandataire_nom} onChangeText={(v) => w.setClauses({ mandataire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.clauses.mandataire_prenom} onChangeText={(v) => w.setClauses({ mandataire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse du mandataire" value={w.clauses.mandataire_adresse} onChangeText={(v) => w.setClauses({ mandataire_adresse: v })} />
            <Field colors={colors} label="Engagements à prendre" value={w.clauses.engagements_mandataire} onChangeText={(v) => w.setClauses({ engagements_mandataire: v })} placeholder="Ex: bail commercial, ouverture de compte bancaire..." multiline />
          </>
        )}

        {/* ── Étape 5 : Récapitulatif ── */}
        {w.currentStep === 5 && (() => {
          const nombreParts = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          const Row = ({ label, value }: { label: string; value: string }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 }}>{label}</Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, flex: 1, textAlign: "right" }}>{value}</Text>
            </View>
          );
          const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
            <View style={{ backgroundColor: colors.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 10 }}>{title}</Text>
              {children}
            </View>
          );
          return (
            <>
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                {w.sigle ? <Row label="Sigle" value={w.sigle} /> : null}
                <Row label="Siège social" value={`${w.siege_social}, ${w.ville}`} />
                <Row label="Durée" value={`${w.duree} ans`} />
              </Section>
              <Section title="Capital">
                <Row label="Capital social" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
                <Row label="Parts" value={`${nombreParts} × ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA`} />
                <Row label="Libération" value={w.mode_liberation === "la moitié" ? "À la moitié" : "Intégrale"} />
                <Row label="Dépositaire" value={w.nom_depositaire || "—"} />
              </Section>
              <Section title={`Associés (${w.associes.length})`}>
                {w.associes.map((a, i) => <Row key={i} label={`${a.prenom} ${a.nom}`} value={`${a.apport.toLocaleString("fr-FR")} FCFA (${a.type_apport})`} />)}
              </Section>
              <Section title="Gérant">
                <Row label="Nom" value={`${w.gerant.prenom} ${w.gerant.nom}`} />
                <Row label="Mandat" value={w.gerant.duree_mandat} />
                {w.gerant.limitations_pouvoirs ? <Row label="Limitations" value={w.gerant.limitations_pouvoirs.substring(0, 40) + "..."} /> : null}
              </Section>
              <Section title="Clauses">
                <Row label="Cession entre associés" value={w.clauses.cession_associes === "libre" ? "Libre" : "Agrément requis"} />
                <Row label="Cession famille" value={w.clauses.cession_famille === "libre" ? "Libre" : "Agrément requis"} />
                <Row label="Transmission décès" value={w.clauses.transmission_deces === "libre" ? "Libre" : "Agrément requis"} />
                <Row label="Contestations" value={w.clauses.mode_contestation === "arbitrage" ? "Arbitrage OHADA" : "Tribunal de commerce"} />
              </Section>
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.setSignature(v, w.lieu_signature)} placeholder={new Date().toLocaleDateString("fr-FR")} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.setSignature(w.date_signature, v)} />
            </>
          );
        })()}

        {/* ── Étape 6 : Aperçu + Téléchargement ── */}
        {w.currentStep === 6 && (() => {
          const nombreParts = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  STATUTS — SARL
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 20 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>Entre les soussignés :</Text>
                {w.associes.map((a, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4, paddingLeft: 12 }}>
                    — {a.civilite} {a.prenom} {a.nom}, né(e) le {a.date_naissance} à {a.lieu_naissance}, de nationalité {a.nationalite}, {a.profession}, demeurant à {a.adresse} ;
                  </Text>
                ))}
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 16, marginBottom: 6 }}>Article 2 : Dénomination</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 12 }}>La société a pour dénomination sociale « {w.denomination} ».{w.sigle ? ` Son sigle est : ${w.sigle}.` : ""}</Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Article 4 : Siège social</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 12 }}>Le siège social est fixé à {w.siege_social}, {w.ville}, {w.pays}.</Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Article 8 : Capital social</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>Le capital social est fixé à la somme de {w.capital.toLocaleString("fr-FR")} FCFA, divisé en {nombreParts} parts de {w.valeur_nominale.toLocaleString("fr-FR")} FCFA chacune.</Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Article 16 : Gérance</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 12 }}>Est nommé gérant : {w.gerant.civilite} {w.gerant.prenom} {w.gerant.nom}, demeurant à {w.gerant.adresse}.</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· 30 articles complets dans le document DOCX ···</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>Fait à {w.lieu_signature || w.ville}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}</Text>
              </View>
              <View style={{ alignItems: "center", paddingBottom: 24 }}>
                {generatedUrl ? (
                  <TouchableOpacity onPress={handleDownload}
                    style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
                    <Ionicons name="download-outline" size={22} color="#ffffff" />
                    <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>Télécharger le DOCX</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ backgroundColor: colors.success + "15", padding: 16, width: "100%", alignItems: "center" }}>
                    <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 8 }}>Document généré</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => { w.reset(); router.replace("/(app)"); }} style={{ marginTop: 16, padding: 12 }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
                </TouchableOpacity>
              </View>
            </>
          );
        })()}

    </WizardLayout>
  );
}
