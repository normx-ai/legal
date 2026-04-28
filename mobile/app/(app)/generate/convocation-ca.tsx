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

// -- Types --

interface ConvocationCaState {
  denomination: string;
  siege_social: string;
  capital: number;
  destinataire_civilite: string;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_adresse: string;
  destinataire_qualite: string;
  date_reunion: string;
  heure_reunion: string;
  lieu_reunion: string;
  ordre_du_jour: string;
  president_nom: string;
  date_envoi: string;
  lieu_envoi: string;
  currentStep: number;
  set: (data: Partial<ConvocationCaState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// -- Store --

const useConvocationCaStore = create<ConvocationCaState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: 0,
  destinataire_civilite: "Monsieur",
  destinataire_nom: "",
  destinataire_prenom: "",
  destinataire_adresse: "",
  destinataire_qualite: "administrateur",
  date_reunion: "",
  heure_reunion: "",
  lieu_reunion: "",
  ordre_du_jour: "",
  president_nom: "",
  date_envoi: "",
  lieu_envoi: "Brazzaville",
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
      destinataire_qualite: "administrateur",
      date_reunion: "",
      heure_reunion: "",
      lieu_reunion: "",
      ordre_du_jour: "",
      president_nom: "",
      date_envoi: "",
      lieu_envoi: "Brazzaville",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Destinataire", "Réunion", "Aperçu"];

// -- Main Screen --

export default function ConvocationCaWizardScreen() {
  const { colors } = useTheme();
  const w = useConvocationCaStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/convocation-ca", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        destinataire_civilite: w.destinataire_civilite,
        destinataire_nom: w.destinataire_nom,
        destinataire_prenom: w.destinataire_prenom,
        destinataire_adresse: w.destinataire_adresse,
        destinataire_qualite: w.destinataire_qualite,
        date_reunion: w.date_reunion,
        heure_reunion: w.heure_reunion,
        lieu_reunion: w.lieu_reunion,
        ordre_du_jour: w.ordre_du_jour,
        president_nom: w.president_nom,
        date_envoi: w.date_envoi || new Date().toLocaleDateString("fr-FR"),
        lieu_envoi: w.lieu_envoi,
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

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  // -- Aperçu document temps réel --
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "CONVOCATION À LA RÉUNION DU CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `M ${v(w.destinataire_civilite)} ${v(w.destinataire_prenom)} ${v(w.destinataire_nom)}`, spaceBefore: true },
      { text: `Administrateur` },
      { text: `${v(w.destinataire_adresse)}` },
      { text: "", spaceBefore: true },
      { text: `Réunion du CA le ${v(w.date_reunion)} à ${v(w.heure_reunion)} à ${v(w.lieu_reunion)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Ordre du jour :", bold: true, spaceBefore: true },
      { text: v(w.ordre_du_jour) },
      { text: "", spaceBefore: true },
      { text: "Le Président du Conseil d'Administration", spaceBefore: true },
      { text: v(w.president_nom) },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.destinataire_civilite, w.destinataire_nom,
      w.destinataire_prenom, w.destinataire_adresse, w.date_reunion, w.heure_reunion,
      w.lieu_reunion, w.ordre_du_jour, w.president_nom]);

  return (
    <WizardLayout
      title="Convocation membres du CA"
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

        {/* -- Étape 0 : Société -- */}
        {w.currentStep === 0 && (
          <>
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital ? String(w.capital) : ""} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* -- Étape 1 : Destinataire -- */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.destinataire_civilite} onChange={(v) => w.set({ destinataire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.destinataire_nom} onChangeText={(v) => w.set({ destinataire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.destinataire_prenom} onChangeText={(v) => w.set({ destinataire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.destinataire_adresse} onChangeText={(v) => w.set({ destinataire_adresse: v })} placeholder="Adresse complète de l'administrateur" />
          </>
        )}

        {/* -- Étape 2 : Réunion -- */}
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
              <Field colors={colors} label="Date de la réunion" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder="Ex: 20 mars 2026" />
              <Field colors={colors} label="Heure de la réunion" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 10h00" />
              <Field colors={colors} label="Lieu de la réunion" value={w.lieu_reunion} onChangeText={(v) => w.set({ lieu_reunion: v })} placeholder="Ex: Siège social de la société" />
              <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} placeholder="Points à l'ordre du jour..." multiline />

              <SectionTitle title="Président du CA" colors={colors} />
              <Field colors={colors} label="Nom du président" value={w.president_nom} onChangeText={(v) => w.set({ president_nom: v })} placeholder="Nom complet du PCA" />

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
            </>
          );
        })()}

        {/* -- Étape 3 : Aperçu + Téléchargement -- */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  CONVOCATION À LA RÉUNION DU CONSEIL D'ADMINISTRATION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SA au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  M {w.destinataire_civilite} {w.destinataire_prenom} {w.destinataire_nom}, Administrateur
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Réunion du CA le {w.date_reunion} à {w.heure_reunion} à {w.lieu_reunion}.
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                  Le Président du Conseil d'Administration — {w.president_nom}
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
