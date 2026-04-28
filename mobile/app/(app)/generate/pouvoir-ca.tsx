import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──

interface PouvoirCaState {
  denomination: string;
  siege_social: string;
  capital: number;
  mandant_civilite: string;
  mandant_nom: string;
  mandant_prenom: string;
  mandant_adresse: string;
  mandataire_civilite: string;
  mandataire_nom: string;
  mandataire_prenom: string;
  date_reunion: string;
  heure_reunion: string;
  lieu_reunion: string;
  ordre_du_jour: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PouvoirCaState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const usePouvoirCaStore = create<PouvoirCaState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: 0,
  mandant_civilite: "Monsieur",
  mandant_nom: "",
  mandant_prenom: "",
  mandant_adresse: "",
  mandataire_civilite: "Monsieur",
  mandataire_nom: "",
  mandataire_prenom: "",
  date_reunion: "",
  heure_reunion: "",
  lieu_reunion: "",
  ordre_du_jour: "",
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
      mandant_civilite: "Monsieur",
      mandant_nom: "",
      mandant_prenom: "",
      mandant_adresse: "",
      mandataire_civilite: "Monsieur",
      mandataire_nom: "",
      mandataire_prenom: "",
      date_reunion: "",
      heure_reunion: "",
      lieu_reunion: "",
      ordre_du_jour: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Mandant", "Mandataire", "Réunion", "Aperçu"];

// ── Main Screen ──

export default function PouvoirCaWizardScreen() {
  const { colors } = useTheme();
  const w = usePouvoirCaStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/pouvoir-ca", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        mandant_civilite: w.mandant_civilite,
        mandant_nom: w.mandant_nom,
        mandant_prenom: w.mandant_prenom,
        mandant_adresse: w.mandant_adresse,
        mandataire_civilite: w.mandataire_civilite,
        mandataire_nom: w.mandataire_nom,
        mandataire_prenom: w.mandataire_prenom,
        date_reunion: w.date_reunion,
        heure_reunion: w.heure_reunion,
        lieu_reunion: w.lieu_reunion,
        ordre_du_jour: w.ordre_du_jour,
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

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "POUVOIR AU CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Je soussigné(e), ${v(w.mandant_civilite)} ${v(w.mandant_prenom)} ${v(w.mandant_nom)}, demeurant à ${v(w.mandant_adresse)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `donne pouvoir à ${v(w.mandataire_civilite)} ${v(w.mandataire_prenom)} ${v(w.mandataire_nom)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `pour me représenter à la réunion du Conseil d'Administration de la société ${v(w.denomination)}, qui se tiendra le ${v(w.date_reunion)} à ${v(w.heure_reunion)}, à ${v(w.lieu_reunion)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Ordre du jour :", bold: true, spaceBefore: true },
      { text: v(w.ordre_du_jour) },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.mandant_civilite, w.mandant_nom, w.mandant_prenom,
      w.mandant_adresse, w.mandataire_civilite, w.mandataire_nom, w.mandataire_prenom,
      w.date_reunion, w.heure_reunion, w.lieu_reunion, w.ordre_du_jour,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Pouvoir au Conseil d'Administration"
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

        {/* ── Étape 1 : Mandant ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.mandant_civilite} onChange={(v) => w.set({ mandant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.mandant_nom} onChangeText={(v) => w.set({ mandant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.mandant_prenom} onChangeText={(v) => w.set({ mandant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.mandant_adresse} onChangeText={(v) => w.set({ mandant_adresse: v })} placeholder="Adresse complète du mandant" />
          </>
        )}

        {/* ── Étape 2 : Mandataire ── */}
        {w.currentStep === 2 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.mandataire_civilite} onChange={(v) => w.set({ mandataire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.mandataire_nom} onChangeText={(v) => w.set({ mandataire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.mandataire_prenom} onChangeText={(v) => w.set({ mandataire_prenom: v })} /></View>
            </View>
          </>
        )}

        {/* ── Étape 3 : Réunion ── */}
        {w.currentStep === 3 && (() => {
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
              <Field colors={colors} label="Date de la réunion" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder="Ex: 20 mars 2026" />
              <Field colors={colors} label="Heure de la réunion" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 10h00" />
              <Field colors={colors} label="Lieu de la réunion" value={w.lieu_reunion} onChangeText={(v) => w.set({ lieu_reunion: v })} placeholder="Ex: Siège social de la société" />
              <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} placeholder="Points à l'ordre du jour..." multiline />

              <SectionTitle title="Signature" colors={colors} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="Récapitulatif" colors={colors} />
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                <Row label="Siège social" value={w.siege_social} />
                <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              </Section>
              <Section title="Mandant">
                <Row label="Identité" value={`${w.mandant_civilite} ${w.mandant_prenom} ${w.mandant_nom}`} />
                <Row label="Adresse" value={w.mandant_adresse || "—"} />
              </Section>
              <Section title="Mandataire">
                <Row label="Identité" value={`${w.mandataire_civilite} ${w.mandataire_prenom} ${w.mandataire_nom}`} />
              </Section>
            </>
          );
        })()}

        {/* ── Étape 4 : Aperçu + Téléchargement ── */}
        {w.currentStep === 4 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  POUVOIR AU CONSEIL D'ADMINISTRATION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SA au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Je soussigné(e), {w.mandant_civilite} {w.mandant_prenom} {w.mandant_nom}, demeurant à {w.mandant_adresse}, donne pouvoir à {w.mandataire_civilite} {w.mandataire_prenom} {w.mandataire_nom}, pour me représenter à la réunion du Conseil d'Administration du {w.date_reunion} à {w.heure_reunion}, à {w.lieu_reunion}.
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
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
