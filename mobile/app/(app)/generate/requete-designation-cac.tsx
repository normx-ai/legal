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

interface RequeteDesignationCacState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  requerant_civilite: string;
  requerant_nom: string;
  requerant_prenom: string;
  requerant_adresse: string;
  requerant_qualite: string;
  nature_apport: string;
  description_apport: string;
  valeur_estimee: string;
  apporteur_civilite: string;
  apporteur_nom: string;
  apporteur_prenom: string;
  tribunal_competent: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<RequeteDesignationCacState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<RequeteDesignationCacState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  requerant_civilite: "Monsieur",
  requerant_nom: "",
  requerant_prenom: "",
  requerant_adresse: "",
  requerant_qualite: "Gérant",
  nature_apport: "en nature",
  description_apport: "",
  valeur_estimee: "",
  apporteur_civilite: "Monsieur",
  apporteur_nom: "",
  apporteur_prenom: "",
  tribunal_competent: "Tribunal de Commerce de Brazzaville",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      forme_juridique: "SA",
      siege_social: "",
      capital: "",
      rccm: "",
      requerant_civilite: "Monsieur",
      requerant_nom: "",
      requerant_prenom: "",
      requerant_adresse: "",
      requerant_qualite: "Gérant",
      nature_apport: "en nature",
      description_apport: "",
      valeur_estimee: "",
      apporteur_civilite: "Monsieur",
      apporteur_nom: "",
      apporteur_prenom: "",
      tribunal_competent: "Tribunal de Commerce de Brazzaville",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Requérant", "Apport", "Aperçu"];

// ── Main Screen ──

export default function RequeteDesignationCacWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/requete-designation-cac", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        rccm: w.rccm,
        requerant_civilite: w.requerant_civilite,
        requerant_nom: w.requerant_nom,
        requerant_prenom: w.requerant_prenom,
        requerant_adresse: w.requerant_adresse,
        requerant_qualite: w.requerant_qualite,
        nature_apport: w.nature_apport,
        description_apport: w.description_apport,
        valeur_estimee: w.valeur_estimee,
        apporteur_civilite: w.apporteur_civilite,
        apporteur_nom: w.apporteur_nom,
        apporteur_prenom: w.apporteur_prenom,
        tribunal_competent: w.tribunal_competent,
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

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.tribunal_competent), bold: true, center: true, size: "lg" as const, spaceBefore: true },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "REQUÊTE AUX FINS DE DÉSIGNATION", bold: true, center: true, size: "lg" as const },
      { text: "D'UN COMMISSAIRE AUX APPORTS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Requérant : ${w.requerant_civilite} ${v(w.requerant_prenom)} ${v(w.requerant_nom)}, ${v(w.requerant_qualite)} de la société ${v(w.denomination)}, ${v(w.forme_juridique)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "OBJET DE LA REQUÊTE :", bold: true, spaceBefore: true },
      { text: `Désignation d'un commissaire aux apports pour évaluer un apport ${v(w.nature_apport)} réalisé par ${w.apporteur_civilite} ${v(w.apporteur_prenom)} ${v(w.apporteur_nom)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Description de l'apport : ${v(w.description_apport)}`, spaceBefore: true },
      { text: `Valeur estimée : ${v(w.valeur_estimee)} FCFA`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.tribunal_competent,
      w.requerant_civilite, w.requerant_nom, w.requerant_prenom, w.requerant_qualite,
      w.nature_apport, w.description_apport, w.valeur_estimee,
      w.apporteur_civilite, w.apporteur_nom, w.apporteur_prenom,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Requête désignation commissaire apports"
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
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
              { value: "SARL", label: "SARL" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Field colors={colors} label="RCCM" value={w.rccm} onChangeText={(v) => w.set({ rccm: v })} placeholder="Ex: CG-BZV-01-2026-A12-00001" />
            <Field colors={colors} label="Tribunal compétent" value={w.tribunal_competent} onChangeText={(v) => w.set({ tribunal_competent: v })} placeholder="Ex: Tribunal de Commerce de Brazzaville" />
          </>
        )}

        {/* ── Étape 1 : Requérant ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.requerant_civilite} onChange={(v) => w.set({ requerant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.requerant_nom} onChangeText={(v) => w.set({ requerant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.requerant_prenom} onChangeText={(v) => w.set({ requerant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.requerant_adresse} onChangeText={(v) => w.set({ requerant_adresse: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Qualité" value={w.requerant_qualite} onChangeText={(v) => w.set({ requerant_qualite: v })} placeholder="Ex: Gérant, Directeur Général" />
          </>
        )}

        {/* ── Étape 2 : Apport ── */}
        {w.currentStep === 2 && (
          <>
            <Choice colors={colors} label="Nature de l'apport" options={[
              { value: "en nature", label: "En nature" },
              { value: "en industrie", label: "En industrie" },
            ]} value={w.nature_apport} onChange={(v) => w.set({ nature_apport: v })} />
            <Field colors={colors} label="Description de l'apport" value={w.description_apport} onChangeText={(v) => w.set({ description_apport: v })} placeholder="Décrivez l'apport en détail" multiline />
            <Field colors={colors} label="Valeur estimée (FCFA)" value={w.valeur_estimee} onChangeText={(v) => w.set({ valeur_estimee: v })} placeholder="Ex: 5 000 000" />

            <SectionTitle title="Apporteur" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.apporteur_civilite} onChange={(v) => w.set({ apporteur_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.apporteur_nom} onChangeText={(v) => w.set({ apporteur_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.apporteur_prenom} onChangeText={(v) => w.set({ apporteur_prenom: v })} /></View>
            </View>

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 3 : Aperçu + Téléchargement ── */}
        {w.currentStep === 3 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                REQUÊTE - DÉSIGNATION COMMISSAIRE AUX APPORTS
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                {w.forme_juridique} au capital de {w.capital} FCFA - Devant le {w.tribunal_competent}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Requérant : {w.requerant_civilite} {w.requerant_prenom} {w.requerant_nom}, {w.requerant_qualite}. Apport {w.nature_apport} par {w.apporteur_civilite} {w.apporteur_prenom} {w.apporteur_nom}. Valeur estimée : {w.valeur_estimee} FCFA.
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.description_apport}
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
        )}

    </WizardLayout>
  );
}
