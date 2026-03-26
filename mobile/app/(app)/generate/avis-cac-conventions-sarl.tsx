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

// -- Types --

interface AvisCacConventionsSarlState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  commissaire_nom: string;
  commissaire_adresse: string;
  date_convention: string;
  parties_convention: string;
  convention_description: string;
  has_conventions_anterieures: boolean;
  conventions_anterieures: string;
  exercice: string;
  signataire_nom: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<AvisCacConventionsSarlState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// -- Store --

const useStore = create<AvisCacConventionsSarlState>((set) => ({
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  commissaire_nom: "",
  commissaire_adresse: "",
  date_convention: "",
  parties_convention: "entre la société et moi-même",
  convention_description: "",
  has_conventions_anterieures: false,
  conventions_anterieures: "",
  exercice: "",
  signataire_nom: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      forme_juridique: "SARL",
      siege_social: "",
      capital: "",
      commissaire_nom: "",
      commissaire_adresse: "",
      date_convention: "",
      parties_convention: "entre la société et moi-même",
      convention_description: "",
      has_conventions_anterieures: false,
      conventions_anterieures: "",
      exercice: "",
      signataire_nom: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Commissaire", "Convention", "Aperçu"];

// -- Main Screen --

export default function AvisCacConventionsSarlWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/avis-cac-conventions-sarl", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        commissaire_nom: w.commissaire_nom,
        commissaire_adresse: w.commissaire_adresse,
        date_convention: w.date_convention,
        parties_convention: w.parties_convention,
        convention_description: w.convention_description,
        has_conventions_anterieures: w.has_conventions_anterieures,
        conventions_anterieures: w.has_conventions_anterieures ? w.conventions_anterieures : undefined,
        exercice: w.exercice,
        signataire_nom: w.signataire_nom,
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

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  // -- Apercu document temps reel --
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "RAPPORT SPÉCIAL DU COMMISSAIRE AUX COMPTES", bold: true, center: true, size: "lg" as const },
      { text: "SUR LES CONVENTIONS RÉGLEMENTÉES", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Commissaire aux comptes : ${v(w.commissaire_nom)}`, spaceBefore: true },
      { text: `Adresse : ${v(w.commissaire_adresse)}` },
      { text: "", spaceBefore: true },
      { text: `Exercice clos le : ${v(w.exercice)}`, spaceBefore: true },
      { text: `Date de la convention : ${v(w.date_convention)}` },
      { text: `Parties : ${v(w.parties_convention)}` },
      { text: "", spaceBefore: true },
      { text: "Convention autorisée au cours de l'exercice", bold: true, spaceBefore: true },
      { text: v(w.convention_description) },
    ];
    if (w.has_conventions_anterieures) {
      lines.push(
        { text: "", spaceBefore: true },
        { text: "Conventions antérieures", bold: true, spaceBefore: true },
        { text: v(w.conventions_anterieures) },
      );
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital, w.commissaire_nom, w.commissaire_adresse,
      w.date_convention, w.parties_convention, w.convention_description,
      w.has_conventions_anterieures, w.conventions_anterieures, w.exercice,
      w.signataire_nom, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Avis CAC conventions (SARL)"
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

        {/* -- Etape 0 : Societe -- */}
        {w.currentStep === 0 && (
          <>
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SARL" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SARL", label: "SARL" },
              { value: "SARLU", label: "SARLU" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
          </>
        )}

        {/* -- Etape 1 : Commissaire -- */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Nom du commissaire aux comptes" value={w.commissaire_nom} onChangeText={(v) => w.set({ commissaire_nom: v })} placeholder="Ex: Cabinet AUDIT CONSEIL" />
            <Field colors={colors} label="Adresse du commissaire" value={w.commissaire_adresse} onChangeText={(v) => w.set({ commissaire_adresse: v })} placeholder="Ex: 45 Rue des Experts, Brazzaville" />
          </>
        )}

        {/* -- Etape 2 : Convention -- */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Date de la convention" value={w.date_convention} onChangeText={(v) => w.set({ date_convention: v })} placeholder="Ex: 15 mars 2025" />
            <Choice colors={colors} label="Parties à la convention" options={[
              { value: "entre la société et moi-même", label: "Entre la société et moi-même" },
              { value: "entre la société et M..., associé", label: "Entre la société et M..., associé" },
            ]} value={w.parties_convention} onChange={(v) => w.set({ parties_convention: v })} />
            <Field colors={colors} label="Description de la convention" value={w.convention_description} onChangeText={(v) => w.set({ convention_description: v })} placeholder="Décrivez la convention réglementée..." multiline />

            <View style={{ marginTop: 8 }}>
              <ToggleRow colors={colors} label="Conventions antérieures" value={w.has_conventions_anterieures} onToggle={(v) => w.set({ has_conventions_anterieures: v })} />
            </View>
            {w.has_conventions_anterieures && (
              <View style={{ marginTop: 12 }}>
                <Field colors={colors} label="Conventions antérieures (détails)" value={w.conventions_anterieures} onChangeText={(v) => w.set({ conventions_anterieures: v })} placeholder="Décrivez les conventions antérieures..." multiline />
              </View>
            )}

            <Field colors={colors} label="Exercice (date de clôture)" value={w.exercice} onChangeText={(v) => w.set({ exercice: v })} placeholder="Ex: 31 décembre 2025" />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Nom du signataire" value={w.signataire_nom} onChangeText={(v) => w.set({ signataire_nom: v })} placeholder="Ex: Jean DUPONT" />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* -- Etape 3 : Apercu + Telechargement -- */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  RAPPORT SPÉCIAL DU COMMISSAIRE AUX COMPTES
                </Text>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  SUR LES CONVENTIONS RÉGLEMENTÉES
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA - Siège : {w.siege_social}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Commissaire aux comptes</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.commissaire_nom} - {w.commissaire_adresse}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Convention</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                  Date : {w.date_convention || "..."} - Parties : {w.parties_convention}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.convention_description || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
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
