import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

interface PouvoirAgState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  mandant_civilite: string;
  mandant_nom: string;
  mandant_prenom: string;
  mandant_adresse: string;
  mandant_parts: number;
  mandataire_civilite: string;
  mandataire_nom: string;
  mandataire_prenom: string;
  mandataire_adresse: string;
  type_ag: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  ordre_du_jour: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PouvoirAgState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  mandant_civilite: "Monsieur",
  mandant_nom: "",
  mandant_prenom: "",
  mandant_adresse: "",
  mandant_parts: 0,
  mandataire_civilite: "Monsieur",
  mandataire_nom: "",
  mandataire_prenom: "",
  mandataire_adresse: "",
  type_ag: "ordinaire",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  ordre_du_jour: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<PouvoirAgState>((set) => ({
  ...initialState,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Mandant", "Mandataire", "Assemblée", "Aperçu"];

export default function PouvoirAgWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/pouvoir-ag", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        mandant_civilite: w.mandant_civilite,
        mandant_nom: w.mandant_nom,
        mandant_prenom: w.mandant_prenom,
        mandant_adresse: w.mandant_adresse,
        mandant_parts: w.mandant_parts,
        mandataire_civilite: w.mandataire_civilite,
        mandataire_nom: w.mandataire_nom,
        mandataire_prenom: w.mandataire_prenom,
        mandataire_adresse: w.mandataire_adresse,
        type_ag: w.type_ag,
        date_ag: w.date_ag,
        heure_ag: w.heure_ag,
        lieu_ag: w.lieu_ag,
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
  const typeAgLabel = w.type_ag === "extraordinaire" ? "Assemblée Générale Extraordinaire" : "Assemblée Générale Ordinaire";

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl", spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "POUVOIR", bold: true, center: true, size: "lg" },
      { text: `Pour l'${typeAgLabel} du ${v(w.date_ag)}`, center: true, size: "md" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Je soussigné(e), ${w.mandant_civilite} ${v(w.mandant_prenom)} ${v(w.mandant_nom)}, demeurant à ${v(w.mandant_adresse)}, associé(e) détenant ${w.mandant_parts || "..."} parts sociales,`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Donne pouvoir à ${w.mandataire_civilite} ${v(w.mandataire_prenom)} ${v(w.mandataire_nom)}, demeurant à ${v(w.mandataire_adresse)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `de me représenter à l'${typeAgLabel} qui se tiendra le ${v(w.date_ag)} à ${v(w.heure_ag)}, à ${v(w.lieu_ag)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines;
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.mandant_civilite, w.mandant_nom, w.mandant_prenom, w.mandant_adresse, w.mandant_parts,
      w.mandataire_civilite, w.mandataire_nom, w.mandataire_prenom, w.mandataire_adresse,
      w.type_ag, w.date_ag, w.heure_ag, w.lieu_ag, w.lieu_signature, w.date_signature, typeAgLabel]);

  return (
    <WizardLayout
      title="Pouvoir pour AG (SARL)"
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
      {w.currentStep === 0 && (
        <>
          <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA SARL" />
          <Choice colors={colors} label="Forme juridique" options={[
            { value: "SARL", label: "SARL" },
            { value: "SARLU", label: "SARLU" },
            { value: "SAS", label: "SAS" },
            { value: "SNC", label: "SNC" },
          ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
        </>
      )}

      {w.currentStep === 1 && (
        <>
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.mandant_civilite} onChange={(v) => w.set({ mandant_civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.mandant_nom} onChangeText={(v) => w.set({ mandant_nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.mandant_prenom} onChangeText={(v) => w.set({ mandant_prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.mandant_adresse} onChangeText={(v) => w.set({ mandant_adresse: v })} placeholder="Adresse complète" />
          <Field colors={colors} label="Nombre de parts détenues" value={w.mandant_parts ? String(w.mandant_parts) : ""} onChangeText={(v) => w.set({ mandant_parts: parseInt(v) || 0 })} keyboardType="numeric" />
        </>
      )}

      {w.currentStep === 2 && (
        <>
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.mandataire_civilite} onChange={(v) => w.set({ mandataire_civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.mandataire_nom} onChangeText={(v) => w.set({ mandataire_nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.mandataire_prenom} onChangeText={(v) => w.set({ mandataire_prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.mandataire_adresse} onChangeText={(v) => w.set({ mandataire_adresse: v })} placeholder="Adresse complète" />
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <Choice colors={colors} label="Type d'assemblée" options={[
            { value: "ordinaire", label: "Ordinaire (AGO)" },
            { value: "extraordinaire", label: "Extraordinaire (AGE)" },
          ]} value={w.type_ag} onChange={(v) => w.set({ type_ag: v })} />
          <Field colors={colors} label="Date de l'assemblée" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
          <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
          <Field colors={colors} label="Lieu de l'assemblée" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social" />
          <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} placeholder="Résumé de l'ordre du jour" multiline />

          <SectionTitle title="Signature" colors={colors} />
          <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
        </>
      )}

      {w.currentStep === 4 && (
        <>
          <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>POUVOIR</Text>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>{w.denomination}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>{typeAgLabel} du {w.date_ag} - {w.lieu_ag}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
              Je soussigné(e), {w.mandant_civilite} {w.mandant_prenom} {w.mandant_nom}, associé(e) détenant {w.mandant_parts} parts, donne pouvoir à {w.mandataire_civilite} {w.mandataire_prenom} {w.mandataire_nom} de me représenter à l'{typeAgLabel}.
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
