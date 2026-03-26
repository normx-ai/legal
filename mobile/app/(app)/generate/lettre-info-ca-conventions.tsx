import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──

interface LettreInfoCaConventionsState {
  denomination: string;
  siege_social: string;
  capital: number;
  personnes_concernees: string;
  nature_objet_convention: string;
  modalites_convention: string;
  duree_convention: string;
  signataire_nom: string;
  signataire_qualite: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<LettreInfoCaConventionsState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useLettreInfoCaConventionsStore = create<LettreInfoCaConventionsState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: 0,
  personnes_concernees: "",
  nature_objet_convention: "",
  modalites_convention: "",
  duree_convention: "",
  signataire_nom: "",
  signataire_qualite: "Le Conseil d'administration",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: 0,
      personnes_concernees: "",
      nature_objet_convention: "",
      modalites_convention: "",
      duree_convention: "",
      signataire_nom: "",
      signataire_qualite: "Le Conseil d'administration",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Convention", "Aperçu"];

// ── Main Screen ──

export default function LettreInfoCaConventionsWizardScreen() {
  const { colors } = useTheme();
  const w = useLettreInfoCaConventionsStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/lettre-info-ca-conventions", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        personnes_concernees: w.personnes_concernees,
        nature_objet_convention: w.nature_objet_convention,
        modalites_convention: w.modalites_convention,
        duree_convention: w.duree_convention,
        signataire_nom: w.signataire_nom,
        signataire_qualite: w.signataire_qualite,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
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

  const isLastDataStep = w.currentStep === 1;
  const isDownloadStep = w.currentStep === 2;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "LETTRE D'INFORMATION AU CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "CONVENTIONS RÉGLEMENTÉES", bold: true, center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `En application des dispositions de l'Acte uniforme relatif au droit des sociétés commerciales et du groupement d'intérêt économique, nous portons à votre connaissance les conventions réglementées suivantes :`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Personnes concernées :", bold: true, spaceBefore: true },
      { text: v(w.personnes_concernees) },
      { text: "", spaceBefore: true },
      { text: "Nature et objet de la convention :", bold: true, spaceBefore: true },
      { text: v(w.nature_objet_convention) },
      { text: "", spaceBefore: true },
      { text: `Modalités : ${v(w.modalites_convention)}`, spaceBefore: true },
      { text: `Durée : ${v(w.duree_convention)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: v(w.signataire_qualite), center: true, spaceBefore: true },
      { text: v(w.signataire_nom), center: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.personnes_concernees, w.nature_objet_convention,
      w.modalites_convention, w.duree_convention, w.signataire_nom, w.signataire_qualite,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Lettre info CA - Conventions"
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

        {/* ── Étape 1 : Convention ── */}
        {w.currentStep === 1 && (() => {
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
              <Field colors={colors} label="Personnes concernées" value={w.personnes_concernees} onChangeText={(v) => w.set({ personnes_concernees: v })} placeholder="Noms et qualités des personnes concernées..." multiline />
              <Field colors={colors} label="Nature et objet de la convention" value={w.nature_objet_convention} onChangeText={(v) => w.set({ nature_objet_convention: v })} placeholder="Description de la convention..." multiline />
              <Field colors={colors} label="Modalités de la convention" value={w.modalites_convention} onChangeText={(v) => w.set({ modalites_convention: v })} placeholder="Conditions financières, modalités d'exécution..." />
              <Field colors={colors} label="Durée de la convention" value={w.duree_convention} onChangeText={(v) => w.set({ duree_convention: v })} placeholder="Ex: 1 an renouvelable" />
              <Field colors={colors} label="Nom du signataire" value={w.signataire_nom} onChangeText={(v) => w.set({ signataire_nom: v })} placeholder="Nom complet du signataire" />
              <Choice colors={colors} label="Qualité du signataire" options={[
                { value: "Le Conseil d'administration", label: "Le Conseil d'administration" },
                { value: "L'administrateur général", label: "L'administrateur général" },
              ]} value={w.signataire_qualite} onChange={(v) => w.set({ signataire_qualite: v })} />

              <SectionTitle title="Signature" colors={colors} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="Récapitulatif" colors={colors} />
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                <Row label="Siège social" value={w.siege_social} />
                <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              </Section>
              <Section title="Convention">
                <Row label="Personnes" value={w.personnes_concernees.substring(0, 50) + (w.personnes_concernees.length > 50 ? "..." : "") || "—"} />
                <Row label="Modalités" value={w.modalites_convention || "—"} />
                <Row label="Durée" value={w.duree_convention || "—"} />
                <Row label="Signataire" value={`${w.signataire_qualite} - ${w.signataire_nom}`} />
              </Section>
            </>
          );
        })()}

        {/* ── Étape 2 : Aperçu + Téléchargement ── */}
        {w.currentStep === 2 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  LETTRE D'INFORMATION AU CONSEIL D'ADMINISTRATION
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  Conventions réglementées
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SA au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Personnes concernées :</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.personnes_concernees || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Nature et objet :</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.nature_objet_convention || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                  Modalités : {w.modalites_convention || "..."}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Durée : {w.duree_convention || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                  {w.signataire_qualite}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 4 }}>
                  {w.signataire_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 4 }}>
                  Fait à {w.lieu_signature || "Brazzaville"}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}
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
