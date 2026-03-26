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

interface ProjetFusionSocieteNouvelleState {
  denomination_a: string; forme_a: string; capital_a: string; siege_a: string; rccm_a: string; objet_a: string; representant_a: string;
  denomination_b: string; forme_b: string; capital_b: string; siege_b: string; rccm_b: string; objet_b: string; representant_b: string;
  denomination_c: string; forme_c: string; capital_c: string; siege_c: string; objet_c: string; nombre_actions_c: number; valeur_nominale_c: number;
  fraction_a_pourcent: string; fraction_b_pourcent: string;
  motif_fusion: string; rapport_echange: string; date_effet_fusion: string;
  actif_a_immobilisations: number; actif_a_stocks: number; actif_a_creances: number; actif_a_tresorerie: number; passif_a_dettes: number; actif_net_a: number;
  actif_b_immobilisations: number; actif_b_stocks: number; actif_b_creances: number; actif_b_tresorerie: number; passif_b_dettes: number; actif_net_b: number;
  lieu_signature: string; date_signature: string;
  currentStep: number;
  set: (data: Partial<ProjetFusionSocieteNouvelleState>) => void;
  nextStep: () => void; prevStep: () => void; reset: () => void;
}

const INITIAL: Omit<ProjetFusionSocieteNouvelleState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination_a: "", forme_a: "SA", capital_a: "", siege_a: "", rccm_a: "", objet_a: "", representant_a: "",
  denomination_b: "", forme_b: "SA", capital_b: "", siege_b: "", rccm_b: "", objet_b: "", representant_b: "",
  denomination_c: "", forme_c: "SA", capital_c: "", siege_c: "", objet_c: "", nombre_actions_c: 0, valeur_nominale_c: 0,
  fraction_a_pourcent: "", fraction_b_pourcent: "",
  motif_fusion: "", rapport_echange: "", date_effet_fusion: "",
  actif_a_immobilisations: 0, actif_a_stocks: 0, actif_a_creances: 0, actif_a_tresorerie: 0, passif_a_dettes: 0, actif_net_a: 0,
  actif_b_immobilisations: 0, actif_b_stocks: 0, actif_b_creances: 0, actif_b_tresorerie: 0, passif_b_dettes: 0, actif_net_b: 0,
  lieu_signature: "Brazzaville", date_signature: "", currentStep: 0,
};

const useStore = create<ProjetFusionSocieteNouvelleState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Soci\u00e9t\u00e9 A", "Soci\u00e9t\u00e9 B", "Soci\u00e9t\u00e9 C", "Fusion", "Actif/Passif A", "Actif/Passif B", "Aper\u00e7u"];

export default function ProjetFusionSocieteNouvelleWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/projet-fusion-societe-nouvelle", {
        denomination_a: w.denomination_a, forme_a: w.forme_a, capital_a: parseInt(w.capital_a) || 0, siege_a: w.siege_a, rccm_a: w.rccm_a, objet_a: w.objet_a, representant_a: w.representant_a,
        denomination_b: w.denomination_b, forme_b: w.forme_b, capital_b: parseInt(w.capital_b) || 0, siege_b: w.siege_b, rccm_b: w.rccm_b, objet_b: w.objet_b, representant_b: w.representant_b,
        denomination_c: w.denomination_c, forme_c: w.forme_c, capital_c: parseInt(w.capital_c) || 0, siege_c: w.siege_c, objet_c: w.objet_c, nombre_actions_c: w.nombre_actions_c, valeur_nominale_c: w.valeur_nominale_c,
        fraction_a_pourcent: w.fraction_a_pourcent, fraction_b_pourcent: w.fraction_b_pourcent,
        motifs_fusion: w.motif_fusion, rapport_echange: w.rapport_echange, date_effet_fusion: w.date_effet_fusion,
        actif_a_immobilisations: w.actif_a_immobilisations, actif_a_stocks: w.actif_a_stocks, actif_a_creances: w.actif_a_creances, actif_a_tresorerie: w.actif_a_tresorerie,
        total_actif_a: w.actif_a_immobilisations + w.actif_a_stocks + w.actif_a_creances + w.actif_a_tresorerie,
        passif_a_dettes: w.passif_a_dettes, total_passif_a: w.passif_a_dettes, actif_net_a: w.actif_net_a,
        actif_b_immobilisations: w.actif_b_immobilisations, actif_b_stocks: w.actif_b_stocks, actif_b_creances: w.actif_b_creances, actif_b_tresorerie: w.actif_b_tresorerie,
        total_actif_b: w.actif_b_immobilisations + w.actif_b_stocks + w.actif_b_creances + w.actif_b_tresorerie,
        passif_b_dettes: w.passif_b_dettes, total_passif_b: w.passif_b_dettes, actif_net_b: w.actif_net_b,
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
      else { setError(e.response?.data?.error || "Erreur lors de la g\u00e9n\u00e9ration"); }
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

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    return [
      { text: "PROJET DE FUSION", bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "PAR CONSTITUTION DE SOCI\u00c9T\u00c9 NOUVELLE", bold: true, center: true, size: "lg" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: `Soci\u00e9t\u00e9 A : ${v(w.denomination_a)}`, spaceBefore: true },
      { text: `Soci\u00e9t\u00e9 B : ${v(w.denomination_b)}` },
      { text: `Soci\u00e9t\u00e9 nouvelle C : ${v(w.denomination_c)}`, bold: true },
      { text: `Fractions : A=${v(w.fraction_a_pourcent)}% / B=${v(w.fraction_b_pourcent)}%` },
      { text: `Date d'effet : ${v(w.date_effet_fusion)}`, spaceBefore: true },
      { text: `Fait \u00e0 ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
  }, [w.denomination_a, w.denomination_b, w.denomination_c, w.fraction_a_pourcent, w.fraction_b_pourcent, w.date_effet_fusion, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout title="Projet de fusion - Soci\u00e9t\u00e9 nouvelle" steps={STEPS} currentStep={w.currentStep}
      onBack={() => { if (w.currentStep === 0) router.back(); else w.prevStep(); }}
      onPrev={w.prevStep} onNext={isLastDataStep ? handleGenerate : w.nextStep}
      isLastDataStep={isLastDataStep} isDownloadStep={isDownloadStep} isGenerating={isGenerating} error={error} previewLines={previewLines}>

        {w.currentStep === 0 && (
          <>
            <SectionTitle title="Soci\u00e9t\u00e9 A" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination" value={w.denomination_a} onChangeText={(v) => w.set({ denomination_a: v })} placeholder="Ex: ALPHA SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_a} onChangeText={(v) => w.set({ siege_a: v })} />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital_a} onChangeText={(v) => w.set({ capital_a: v })} />
            <Field colors={colors} label="Num\u00e9ro RCCM" value={w.rccm_a} onChangeText={(v) => w.set({ rccm_a: v })} />
            <Field colors={colors} label="Objet social" value={w.objet_a} onChangeText={(v) => w.set({ objet_a: v })} multiline />
            <Field colors={colors} label="Repr\u00e9sentant" value={w.representant_a} onChangeText={(v) => w.set({ representant_a: v })} />
          </>
        )}

        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Soci\u00e9t\u00e9 B" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination" value={w.denomination_b} onChangeText={(v) => w.set({ denomination_b: v })} placeholder="Ex: BETA SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_b} onChangeText={(v) => w.set({ siege_b: v })} />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital_b} onChangeText={(v) => w.set({ capital_b: v })} />
            <Field colors={colors} label="Num\u00e9ro RCCM" value={w.rccm_b} onChangeText={(v) => w.set({ rccm_b: v })} />
            <Field colors={colors} label="Objet social" value={w.objet_b} onChangeText={(v) => w.set({ objet_b: v })} multiline />
            <Field colors={colors} label="Repr\u00e9sentant" value={w.representant_b} onChangeText={(v) => w.set({ representant_b: v })} />
          </>
        )}

        {w.currentStep === 2 && (
          <>
            <SectionTitle title="Soci\u00e9t\u00e9 nouvelle C" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination" value={w.denomination_c} onChangeText={(v) => w.set({ denomination_c: v })} placeholder="Ex: GAMMA HOLDING SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_c} onChangeText={(v) => w.set({ siege_c: v })} />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital_c} onChangeText={(v) => w.set({ capital_c: v })} />
            <Field colors={colors} label="Objet social" value={w.objet_c} onChangeText={(v) => w.set({ objet_c: v })} multiline />
            <Field colors={colors} label="Nombre d'actions" value={w.nombre_actions_c ? String(w.nombre_actions_c) : ""} onChangeText={(v) => w.set({ nombre_actions_c: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale (FCFA)" value={w.valeur_nominale_c ? String(w.valeur_nominale_c) : ""} onChangeText={(v) => w.set({ valeur_nominale_c: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {w.currentStep === 3 && (
          <>
            <SectionTitle title="Modalit\u00e9s de la fusion" colors={colors} />
            <Field colors={colors} label="Motif de la fusion" value={w.motif_fusion} onChangeText={(v) => w.set({ motif_fusion: v })} multiline />
            <Field colors={colors} label="Date d'effet" value={w.date_effet_fusion} onChangeText={(v) => w.set({ date_effet_fusion: v })} placeholder="Ex: 1er juillet 2026" />
            <Field colors={colors} label="Rapport d'\u00e9change" value={w.rapport_echange} onChangeText={(v) => w.set({ rapport_echange: v })} />
            <Field colors={colors} label="Fraction A (%)" value={w.fraction_a_pourcent} onChangeText={(v) => w.set({ fraction_a_pourcent: v })} placeholder="Ex: 60" />
            <Field colors={colors} label="Fraction B (%)" value={w.fraction_b_pourcent} onChangeText={(v) => w.set({ fraction_b_pourcent: v })} placeholder="Ex: 40" />
            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {w.currentStep === 4 && (
          <>
            <SectionTitle title="Actif/Passif de la soci\u00e9t\u00e9 A" colors={colors} />
            <Field colors={colors} label="Immobilisations (FCFA)" value={w.actif_a_immobilisations ? String(w.actif_a_immobilisations) : ""} onChangeText={(v) => w.set({ actif_a_immobilisations: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Stocks (FCFA)" value={w.actif_a_stocks ? String(w.actif_a_stocks) : ""} onChangeText={(v) => w.set({ actif_a_stocks: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Cr\u00e9ances (FCFA)" value={w.actif_a_creances ? String(w.actif_a_creances) : ""} onChangeText={(v) => w.set({ actif_a_creances: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Tr\u00e9sorerie (FCFA)" value={w.actif_a_tresorerie ? String(w.actif_a_tresorerie) : ""} onChangeText={(v) => w.set({ actif_a_tresorerie: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Passif / Dettes (FCFA)" value={w.passif_a_dettes ? String(w.passif_a_dettes) : ""} onChangeText={(v) => w.set({ passif_a_dettes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actif net A (FCFA)" value={w.actif_net_a ? String(w.actif_net_a) : ""} onChangeText={(v) => w.set({ actif_net_a: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {w.currentStep === 5 && (
          <>
            <SectionTitle title="Actif/Passif de la soci\u00e9t\u00e9 B" colors={colors} />
            <Field colors={colors} label="Immobilisations (FCFA)" value={w.actif_b_immobilisations ? String(w.actif_b_immobilisations) : ""} onChangeText={(v) => w.set({ actif_b_immobilisations: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Stocks (FCFA)" value={w.actif_b_stocks ? String(w.actif_b_stocks) : ""} onChangeText={(v) => w.set({ actif_b_stocks: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Cr\u00e9ances (FCFA)" value={w.actif_b_creances ? String(w.actif_b_creances) : ""} onChangeText={(v) => w.set({ actif_b_creances: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Tr\u00e9sorerie (FCFA)" value={w.actif_b_tresorerie ? String(w.actif_b_tresorerie) : ""} onChangeText={(v) => w.set({ actif_b_tresorerie: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Passif / Dettes (FCFA)" value={w.passif_b_dettes ? String(w.passif_b_dettes) : ""} onChangeText={(v) => w.set({ passif_b_dettes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actif net B (FCFA)" value={w.actif_net_b ? String(w.actif_net_b) : ""} onChangeText={(v) => w.set({ actif_net_b: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {w.currentStep === 6 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>PROJET DE FUSION PAR CONSTITUTION DE SOCI\u00c9T\u00c9 NOUVELLE</Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 8 }}>A : {w.denomination_a}</Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 4 }}>B : {w.denomination_b}</Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 4 }}>C (nouvelle) : {w.denomination_c}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                Fait \u00e0 {w.lieu_signature || "Brazzaville"}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}
              </Text>
            </View>
            <View style={{ alignItems: "center", paddingBottom: 24 }}>
              {generatedUrl ? (
                <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
                  <Ionicons name="download-outline" size={22} color="#ffffff" />
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>T\u00e9l\u00e9charger le DOCX</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: colors.success + "15", padding: 16, width: "100%", alignItems: "center" }}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 8 }}>Document g\u00e9n\u00e9r\u00e9</Text>
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
