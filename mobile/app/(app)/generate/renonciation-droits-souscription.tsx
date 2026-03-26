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

interface RenonciationDroitsState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  actionnaire_civilite: string;
  actionnaire_nom: string;
  actionnaire_prenom: string;
  actionnaire_adresse: string;
  actionnaire_nationalite: string;
  nombre_actions: number;
  nombre_droits_renonces: number;
  beneficiaire_civilite: string;
  beneficiaire_nom: string;
  beneficiaire_prenom: string;
  date_ag_augmentation: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<RenonciationDroitsState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<RenonciationDroitsState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  actionnaire_civilite: "Monsieur",
  actionnaire_nom: "",
  actionnaire_prenom: "",
  actionnaire_adresse: "",
  actionnaire_nationalite: "Congolaise",
  nombre_actions: 0,
  nombre_droits_renonces: 0,
  beneficiaire_civilite: "Monsieur",
  beneficiaire_nom: "",
  beneficiaire_prenom: "",
  date_ag_augmentation: "",
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
      actionnaire_civilite: "Monsieur",
      actionnaire_nom: "",
      actionnaire_prenom: "",
      actionnaire_adresse: "",
      actionnaire_nationalite: "Congolaise",
      nombre_actions: 0,
      nombre_droits_renonces: 0,
      beneficiaire_civilite: "Monsieur",
      beneficiaire_nom: "",
      beneficiaire_prenom: "",
      date_ag_augmentation: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Actionnaire", "Aperçu"];

// ── Main Screen ──

export default function RenonciationDroitsSouscriptionWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/renonciation-droits-souscription", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        rccm: w.rccm,
        actionnaire_civilite: w.actionnaire_civilite,
        actionnaire_nom: w.actionnaire_nom,
        actionnaire_prenom: w.actionnaire_prenom,
        actionnaire_adresse: w.actionnaire_adresse,
        actionnaire_nationalite: w.actionnaire_nationalite,
        nombre_actions: w.nombre_actions,
        nombre_droits_renonces: w.nombre_droits_renonces,
        beneficiaire_civilite: w.beneficiaire_civilite,
        beneficiaire_nom: w.beneficiaire_nom,
        beneficiaire_prenom: w.beneficiaire_prenom,
        date_ag_augmentation: w.date_ag_augmentation,
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

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "RENONCIATION AU DROIT PRÉFÉRENTIEL DE SOUSCRIPTION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Je soussigné(e), ${w.actionnaire_civilite} ${v(w.actionnaire_prenom)} ${v(w.actionnaire_nom)}, de nationalité ${v(w.actionnaire_nationalite)}, demeurant à ${v(w.actionnaire_adresse)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Actionnaire détenant ${w.nombre_actions || "..."} actions de la société ${v(w.denomination)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Déclare renoncer à ${w.nombre_droits_renonces || "..."} droits préférentiels de souscription${w.beneficiaire_nom ? ` au profit de ${w.beneficiaire_civilite} ${v(w.beneficiaire_prenom)} ${v(w.beneficiaire_nom)}` : ""}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Augmentation de capital décidée par l'AG du ${v(w.date_ag_augmentation)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.actionnaire_civilite, w.actionnaire_nom, w.actionnaire_prenom,
      w.actionnaire_adresse, w.actionnaire_nationalite,
      w.nombre_actions, w.nombre_droits_renonces,
      w.beneficiaire_civilite, w.beneficiaire_nom, w.beneficiaire_prenom,
      w.date_ag_augmentation, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Renonciation droits souscription"
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
          </>
        )}

        {/* ── Étape 1 : Actionnaire ── */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Actionnaire renonçant" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.actionnaire_civilite} onChange={(v) => w.set({ actionnaire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.actionnaire_nom} onChangeText={(v) => w.set({ actionnaire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.actionnaire_prenom} onChangeText={(v) => w.set({ actionnaire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.actionnaire_adresse} onChangeText={(v) => w.set({ actionnaire_adresse: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Nationalité" value={w.actionnaire_nationalite} onChangeText={(v) => w.set({ actionnaire_nationalite: v })} />
            <Field colors={colors} label="Nombre d'actions détenues" value={w.nombre_actions ? String(w.nombre_actions) : ""} onChangeText={(v) => w.set({ nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Nombre de droits auxquels il renonce" value={w.nombre_droits_renonces ? String(w.nombre_droits_renonces) : ""} onChangeText={(v) => w.set({ nombre_droits_renonces: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Bénéficiaire (optionnel)" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.beneficiaire_civilite} onChange={(v) => w.set({ beneficiaire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.beneficiaire_nom} onChangeText={(v) => w.set({ beneficiaire_nom: v })} placeholder="Optionnel" /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.beneficiaire_prenom} onChangeText={(v) => w.set({ beneficiaire_prenom: v })} placeholder="Optionnel" /></View>
            </View>

            <SectionTitle title="Augmentation de capital" colors={colors} />
            <Field colors={colors} label="Date de l'AG ayant décidé l'augmentation" value={w.date_ag_augmentation} onChangeText={(v) => w.set({ date_ag_augmentation: v })} placeholder="Ex: 15 mars 2026" />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 2 : Aperçu + Téléchargement ── */}
        {w.currentStep === 2 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                RENONCIATION AU DROIT PRÉFÉRENTIEL DE SOUSCRIPTION
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                {w.forme_juridique} au capital de {w.capital} FCFA
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.actionnaire_civilite} {w.actionnaire_prenom} {w.actionnaire_nom}, détenant {w.nombre_actions} actions, renonce à {w.nombre_droits_renonces} droits préférentiels de souscription{w.beneficiaire_nom ? ` au profit de ${w.beneficiaire_civilite} ${w.beneficiaire_prenom} ${w.beneficiaire_nom}` : ""}.
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Augmentation de capital décidée par l'AG du {w.date_ag_augmentation}.
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
