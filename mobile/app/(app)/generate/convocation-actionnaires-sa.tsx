import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// ── Types ──

interface ConvocationActionnairesSaState {
  denomination: string;
  siege_social: string;
  capital: number;
  destinataire_civilite: string;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_adresse: string;
  type_ag: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  ordre_du_jour: string;
  signataire_fonction: string;
  signataire_nom: string;
  lieu_envoi: string;
  date_envoi: string;
  currentStep: number;
  set: (data: Partial<ConvocationActionnairesSaState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useConvocationActionnairesSaStore = create<ConvocationActionnairesSaState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: 0,
  destinataire_civilite: "Monsieur",
  destinataire_nom: "",
  destinataire_prenom: "",
  destinataire_adresse: "",
  type_ag: "ordinaire",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  ordre_du_jour: "",
  signataire_fonction: "Le Conseil d'administration",
  signataire_nom: "",
  lieu_envoi: "Brazzaville",
  date_envoi: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: 0,
      destinataire_civilite: "Monsieur",
      destinataire_nom: "",
      destinataire_prenom: "",
      destinataire_adresse: "",
      type_ag: "ordinaire",
      date_ag: "",
      heure_ag: "",
      lieu_ag: "",
      ordre_du_jour: "",
      signataire_fonction: "Le Conseil d'administration",
      signataire_nom: "",
      lieu_envoi: "Brazzaville",
      date_envoi: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Destinataire", "Assemblée", "Aperçu"];

// ── Main Screen ──

export default function ConvocationActionnairesSaWizardScreen() {
  const { colors } = useTheme();
  const w = useConvocationActionnairesSaStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/convocation-actionnaires-sa", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        destinataire_civilite: w.destinataire_civilite,
        destinataire_nom: w.destinataire_nom,
        destinataire_prenom: w.destinataire_prenom,
        destinataire_adresse: w.destinataire_adresse,
        type_ag: w.type_ag,
        date_ag: w.date_ag,
        heure_ag: w.heure_ag,
        lieu_ag: w.lieu_ag,
        ordre_du_jour: w.ordre_du_jour,
        signataire_fonction: w.signataire_fonction,
        signataire_nom: w.signataire_nom,
        lieu_envoi: w.lieu_envoi,
        date_envoi: w.date_envoi || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const typeAgLabel = w.type_ag === "ordinaire" ? "Ordinaire" : w.type_ag === "extraordinaire" ? "Extraordinaire" : "Mixte";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "CONVOCATION", bold: true, center: true, size: "lg" as const },
      { text: `Assemblée Générale ${typeAgLabel}`, bold: true, center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `${v(w.destinataire_civilite)} ${v(w.destinataire_prenom)} ${v(w.destinataire_nom)}`, bold: true, spaceBefore: true },
      { text: v(w.destinataire_adresse) },
      { text: "", spaceBefore: true },
      { text: `${v(w.destinataire_civilite)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Nous avons l'honneur de vous convoquer à l'Assemblée Générale ${typeAgLabel} de la société ${v(w.denomination)}, qui se tiendra :`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Date : ${v(w.date_ag)}` },
      { text: `Heure : ${v(w.heure_ag)}` },
      { text: `Lieu : ${v(w.lieu_ag)}` },
      { text: "", spaceBefore: true },
      { text: "Ordre du jour :", bold: true, spaceBefore: true },
      { text: v(w.ordre_du_jour) },
      { text: "", spaceBefore: true },
      { text: v(w.signataire_fonction), center: true, spaceBefore: true },
      { text: v(w.signataire_nom), center: true },
      { text: `Fait à ${v(w.lieu_envoi)}, le ${w.date_envoi || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.destinataire_civilite, w.destinataire_nom,
      w.destinataire_prenom, w.destinataire_adresse, w.type_ag, w.date_ag, w.heure_ag,
      w.lieu_ag, w.ordre_du_jour, w.signataire_fonction, w.signataire_nom,
      w.lieu_envoi, w.date_envoi]);

  return (
    <WizardLayout
      title="Convocation actionnaires AG (SA)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital ? String(w.capital) : ""} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* ── Étape 1 : Destinataire ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.destinataire_civilite} onChange={(v) => w.set({ destinataire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.destinataire_nom} onChangeText={(v) => w.set({ destinataire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.destinataire_prenom} onChangeText={(v) => w.set({ destinataire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.destinataire_adresse} onChangeText={(v) => w.set({ destinataire_adresse: v })} placeholder="Adresse complète du destinataire" />
          </>
        )}

        {/* ── Étape 2 : Assemblée ── */}
        {w.currentStep === 2 && (() => {
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
              <Choice colors={colors} label="Type d'assemblée" options={[
                { value: "ordinaire", label: "Ordinaire" },
                { value: "extraordinaire", label: "Extraordinaire" },
                { value: "mixte", label: "Mixte" },
              ]} value={w.type_ag} onChange={(v) => w.set({ type_ag: v })} />
              <Field colors={colors} label="Date de l'AG" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 20 mars 2026" />
              <Field colors={colors} label="Heure de l'AG" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
              <Field colors={colors} label="Lieu de l'AG" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social de la société" />
              <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} placeholder="Points à l'ordre du jour..." multiline />
              <Choice colors={colors} label="Fonction du signataire" options={[
                { value: "Le Conseil d'administration", label: "Le Conseil d'administration" },
                { value: "L'administrateur général", label: "L'administrateur général" },
              ]} value={w.signataire_fonction} onChange={(v) => w.set({ signataire_fonction: v })} />
              <Field colors={colors} label="Nom du signataire" value={w.signataire_nom} onChangeText={(v) => w.set({ signataire_nom: v })} placeholder="Nom complet du signataire" />

              <SectionTitle title="Envoi" colors={colors} />
              <Field colors={colors} label="Lieu d'envoi" value={w.lieu_envoi} onChangeText={(v) => w.set({ lieu_envoi: v })} />
              <Field colors={colors} label="Date d'envoi" value={w.date_envoi} onChangeText={(v) => w.set({ date_envoi: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="Récapitulatif" colors={colors} />
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                <Row label="Siège social" value={w.siege_social} />
                <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              </Section>
              <Section title="Destinataire">
                <Row label="Identité" value={`${w.destinataire_civilite} ${w.destinataire_prenom} ${w.destinataire_nom}`} />
                <Row label="Adresse" value={w.destinataire_adresse || "—"} />
              </Section>
              <Section title="Assemblée">
                <Row label="Type" value={w.type_ag === "ordinaire" ? "Ordinaire" : w.type_ag === "extraordinaire" ? "Extraordinaire" : "Mixte"} />
                <Row label="Date" value={w.date_ag || "—"} />
                <Row label="Heure" value={w.heure_ag || "—"} />
                <Row label="Lieu" value={w.lieu_ag || "—"} />
                <Row label="Signataire" value={`${w.signataire_fonction} - ${w.signataire_nom}`} />
              </Section>
            </>
          );
        })()}

        {/* ── Étape 3 : Aperçu + Téléchargement ── */}
        {w.currentStep === 3 && (() => {
          const typeAgLabel = w.type_ag === "ordinaire" ? "Ordinaire" : w.type_ag === "extraordinaire" ? "Extraordinaire" : "Mixte";
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  CONVOCATION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SA au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>
                  {w.destinataire_civilite} {w.destinataire_prenom} {w.destinataire_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 12 }}>
                  {w.destinataire_adresse}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Nous avons l'honneur de vous convoquer à l'Assemblée Générale {typeAgLabel} de la société {w.denomination}, le {w.date_ag} à {w.heure_ag}, à {w.lieu_ag}.
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Ordre du jour :</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.ordre_du_jour || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                  {w.signataire_fonction}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 4 }}>
                  {w.signataire_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 4 }}>
                  Fait à {w.lieu_envoi || "Brazzaville"}, le {w.date_envoi || new Date().toLocaleDateString("fr-FR")}
                </Text>
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
