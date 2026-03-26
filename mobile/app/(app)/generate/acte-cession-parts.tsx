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

interface ActeCessionPartsState {
  denomination: string;
  siege_social: string;
  capital: string;
  rccm: string;
  valeur_nominale: string;
  cedant_civilite: string;
  cedant_nom: string;
  cedant_prenom: string;
  cedant_adresse: string;
  cedant_parts: number;
  cessionnaire_civilite: string;
  cessionnaire_nom: string;
  cessionnaire_prenom: string;
  cessionnaire_adresse: string;
  nombre_parts_cedees: number;
  numero_parts_de: string;
  numero_parts_a: string;
  prix_cession: number;
  has_agrement: boolean;
  date_agrement: string;
  nombre_originaux: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<ActeCessionPartsState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<ActeCessionPartsState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: "",
  rccm: "",
  valeur_nominale: "",
  cedant_civilite: "Monsieur",
  cedant_nom: "",
  cedant_prenom: "",
  cedant_adresse: "",
  cedant_parts: 0,
  cessionnaire_civilite: "Monsieur",
  cessionnaire_nom: "",
  cessionnaire_prenom: "",
  cessionnaire_adresse: "",
  nombre_parts_cedees: 0,
  numero_parts_de: "",
  numero_parts_a: "",
  prix_cession: 0,
  has_agrement: false,
  date_agrement: "",
  nombre_originaux: "",
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
      capital: "",
      rccm: "",
      valeur_nominale: "",
      cedant_civilite: "Monsieur",
      cedant_nom: "",
      cedant_prenom: "",
      cedant_adresse: "",
      cedant_parts: 0,
      cessionnaire_civilite: "Monsieur",
      cessionnaire_nom: "",
      cessionnaire_prenom: "",
      cessionnaire_adresse: "",
      nombre_parts_cedees: 0,
      numero_parts_de: "",
      numero_parts_a: "",
      prix_cession: 0,
      has_agrement: false,
      date_agrement: "",
      nombre_originaux: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Cédant", "Cessionnaire", "Cession", "Aperçu"];

// ── Main Screen ──

export default function ActeCessionPartsWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/acte-cession-parts", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        rccm: w.rccm,
        valeur_nominale: w.valeur_nominale,
        cedant_civilite: w.cedant_civilite,
        cedant_nom: w.cedant_nom,
        cedant_prenom: w.cedant_prenom,
        cedant_adresse: w.cedant_adresse,
        cedant_parts: w.cedant_parts,
        cessionnaire_civilite: w.cessionnaire_civilite,
        cessionnaire_nom: w.cessionnaire_nom,
        cessionnaire_prenom: w.cessionnaire_prenom,
        cessionnaire_adresse: w.cessionnaire_adresse,
        nombre_parts_cedees: w.nombre_parts_cedees,
        numero_parts_de: w.numero_parts_de,
        numero_parts_a: w.numero_parts_a,
        prix_cession: w.prix_cession,
        has_agrement: w.has_agrement,
        date_agrement: w.has_agrement ? w.date_agrement : undefined,
        nombre_originaux: w.nombre_originaux,
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

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SARL au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: `RCCM : ${v(w.rccm)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "ACTE DE CESSION DE PARTS SOCIALES", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "ENTRE LES SOUSSIGNÉS :", bold: true, spaceBefore: true },
      { text: `Le Cédant : ${w.cedant_civilite} ${v(w.cedant_prenom)} ${v(w.cedant_nom)}, demeurant à ${v(w.cedant_adresse)}, propriétaire de ${w.cedant_parts || "..."} parts sociales.`, spaceBefore: true },
      { text: `Le Cessionnaire : ${w.cessionnaire_civilite} ${v(w.cessionnaire_prenom)} ${v(w.cessionnaire_nom)}, demeurant à ${v(w.cessionnaire_adresse)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "IL A ÉTÉ CONVENU CE QUI SUIT :", bold: true, spaceBefore: true },
      { text: `Cession de ${w.nombre_parts_cedees || "..."} parts sociales (n° ${v(w.numero_parts_de)} à ${v(w.numero_parts_a)}) au prix de ${w.prix_cession ? w.prix_cession.toLocaleString("fr-FR") : "..."} FCFA.`, spaceBefore: true },
    ];
    if (w.has_agrement) {
      lines.push({ text: `Agrément obtenu le ${v(w.date_agrement)}.`, spaceBefore: true });
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    if (w.nombre_originaux) lines.push({ text: `En ${w.nombre_originaux} exemplaires originaux.`, center: true });
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.rccm, w.valeur_nominale,
      w.cedant_civilite, w.cedant_nom, w.cedant_prenom, w.cedant_adresse, w.cedant_parts,
      w.cessionnaire_civilite, w.cessionnaire_nom, w.cessionnaire_prenom, w.cessionnaire_adresse,
      w.nombre_parts_cedees, w.numero_parts_de, w.numero_parts_a, w.prix_cession,
      w.has_agrement, w.date_agrement, w.nombre_originaux, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Acte de cession de parts (SARL)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SARL" />
            <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
            <Field colors={colors} label="RCCM" value={w.rccm} onChangeText={(v) => w.set({ rccm: v })} placeholder="Ex: CG-BZV-01-2026-A12-00001" />
            <Field colors={colors} label="Valeur nominale d'une part (FCFA)" value={w.valeur_nominale} onChangeText={(v) => w.set({ valeur_nominale: v })} placeholder="Ex: 10 000" />
          </>
        )}

        {/* ── Étape 1 : Cédant ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.cedant_civilite} onChange={(v) => w.set({ cedant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cedant_nom} onChangeText={(v) => w.set({ cedant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cedant_prenom} onChangeText={(v) => w.set({ cedant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.cedant_adresse} onChangeText={(v) => w.set({ cedant_adresse: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Nombre de parts détenues" value={w.cedant_parts ? String(w.cedant_parts) : ""} onChangeText={(v) => w.set({ cedant_parts: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* ── Étape 2 : Cessionnaire ── */}
        {w.currentStep === 2 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.cessionnaire_civilite} onChange={(v) => w.set({ cessionnaire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cessionnaire_nom} onChangeText={(v) => w.set({ cessionnaire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cessionnaire_prenom} onChangeText={(v) => w.set({ cessionnaire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.cessionnaire_adresse} onChangeText={(v) => w.set({ cessionnaire_adresse: v })} placeholder="Adresse complète" />
          </>
        )}

        {/* ── Étape 3 : Cession ── */}
        {w.currentStep === 3 && (
          <>
            <Field colors={colors} label="Nombre de parts cédées" value={w.nombre_parts_cedees ? String(w.nombre_parts_cedees) : ""} onChangeText={(v) => w.set({ nombre_parts_cedees: parseInt(v) || 0 })} keyboardType="numeric" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Numéro de part (de)" value={w.numero_parts_de} onChangeText={(v) => w.set({ numero_parts_de: v })} placeholder="Ex: 1" /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Numéro de part (à)" value={w.numero_parts_a} onChangeText={(v) => w.set({ numero_parts_a: v })} placeholder="Ex: 50" /></View>
            </View>
            <Field colors={colors} label="Prix de cession (FCFA)" value={w.prix_cession ? String(w.prix_cession) : ""} onChangeText={(v) => w.set({ prix_cession: parseInt(v) || 0 })} keyboardType="numeric" />

            <View style={{ marginTop: 8 }}>
              <ToggleRow colors={colors} label="Agrément préalable requis" value={w.has_agrement} onToggle={(v) => w.set({ has_agrement: v })} />
            </View>
            {w.has_agrement && (
              <View style={{ marginTop: 12 }}>
                <Field colors={colors} label="Date de l'agrément" value={w.date_agrement} onChangeText={(v) => w.set({ date_agrement: v })} placeholder="Ex: 15 mars 2026" />
              </View>
            )}

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Nombre d'originaux" value={w.nombre_originaux} onChangeText={(v) => w.set({ nombre_originaux: v })} placeholder="Ex: 6" />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 4 : Aperçu + Téléchargement ── */}
        {w.currentStep === 4 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                ACTE DE CESSION DE PARTS SOCIALES
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                SARL au capital de {w.capital} FCFA - RCCM : {w.rccm}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Cédant</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.cedant_civilite} {w.cedant_prenom} {w.cedant_nom}, demeurant à {w.cedant_adresse}, propriétaire de {w.cedant_parts} parts sociales.
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Cessionnaire</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.cessionnaire_civilite} {w.cessionnaire_prenom} {w.cessionnaire_nom}, demeurant à {w.cessionnaire_adresse}.
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Cession</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.nombre_parts_cedees} parts sociales (n° {w.numero_parts_de} à {w.numero_parts_a}) au prix de {w.prix_cession.toLocaleString("fr-FR")} FCFA.
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
