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

interface PvCaDissolutionState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  // Réunion
  date_reunion: string;
  date_reunion_lettres: string;
  heure_reunion: string;
  heure_reunion_lettres: string;
  lieu_reunion: string;
  mode_convocation: string;
  date_convocation: string;
  president_ca: string;
  secretaire_seance: string;
  // Administrateurs
  administrateurs_presents: string;
  administrateurs_absents: string;
  nombre_administrateurs: number;
  quorum_atteint: boolean;
  // Ordre du jour
  motif_dissolution: string;
  date_age_proposee: string;
  observations: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PvCaDissolutionState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<PvCaDissolutionState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  date_reunion: "",
  date_reunion_lettres: "",
  heure_reunion: "",
  heure_reunion_lettres: "",
  lieu_reunion: "",
  mode_convocation: "lettre recommandée",
  date_convocation: "",
  president_ca: "",
  secretaire_seance: "",
  administrateurs_presents: "",
  administrateurs_absents: "",
  nombre_administrateurs: 0,
  quorum_atteint: true,
  motif_dissolution: "",
  date_age_proposee: "",
  observations: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<PvCaDissolutionState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Société", "Réunion", "Administrateurs", "Aperçu"];

// ── Main Screen ──

export default function PvCaDissolutionWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/pv-ca-dissolution", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        date_reunion: w.date_reunion,
        date_reunion_lettres: w.date_reunion_lettres,
        heure_reunion: w.heure_reunion,
        heure_reunion_lettres: w.heure_reunion_lettres,
        lieu_reunion: w.lieu_reunion,
        mode_convocation: w.mode_convocation,
        date_convocation: w.date_convocation,
        president_ca: w.president_ca,
        secretaire_seance: w.secretaire_seance,
        administrateurs_presents: w.administrateurs_presents,
        administrateurs_absents: w.administrateurs_absents,
        nombre_administrateurs: w.nombre_administrateurs,
        quorum_atteint: w.quorum_atteint,
        motif_dissolution: w.motif_dissolution,
        date_age_proposee: w.date_age_proposee,
        observations: w.observations,
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
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PV DU CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "CONVOCATION AGE - DISSOLUTION", bold: true, center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Le conseil d'administration s'est réuni le ${v(w.date_reunion)} à ${v(w.heure_reunion)} au ${v(w.lieu_reunion)}.`, spaceBefore: true },
      { text: `Président : ${v(w.president_ca)}`, spaceBefore: true },
      { text: `Motif de dissolution : ${v(w.motif_dissolution)}`, spaceBefore: true },
      { text: `Date AGE proposée : ${v(w.date_age_proposee)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.date_reunion,
      w.heure_reunion, w.lieu_reunion, w.president_ca, w.motif_dissolution,
      w.date_age_proposee, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="PV CA convoquant AGE dissolution"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA HOLDING SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Numéro RC" value={w.rc_numero} onChangeText={(v) => w.set({ rc_numero: v })} placeholder="Ex: RCCM BZV-..." />
          </>
        )}

        {/* ── Étape 1 : Réunion ── */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Date de la réunion" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder="Ex: 10 mars 2026" />
            <Field colors={colors} label="Date en lettres" value={w.date_reunion_lettres} onChangeText={(v) => w.set({ date_reunion_lettres: v })} placeholder="Ex: dix mars deux mille vingt-six" />
            <Field colors={colors} label="Heure" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 15h00" />
            <Field colors={colors} label="Heure en lettres" value={w.heure_reunion_lettres} onChangeText={(v) => w.set({ heure_reunion_lettres: v })} placeholder="Ex: quinze heures" />
            <Field colors={colors} label="Lieu de la réunion" value={w.lieu_reunion} onChangeText={(v) => w.set({ lieu_reunion: v })} placeholder="Ex: siège social" />
            <Choice colors={colors} label="Mode de convocation" options={[
              { value: "lettre recommandée", label: "Lettre recommandée" },
              { value: "acte extrajudiciaire", label: "Acte extrajudiciaire" },
              { value: "email", label: "Email" },
            ]} value={w.mode_convocation} onChange={(v) => w.set({ mode_convocation: v })} />
            <Field colors={colors} label="Date de convocation" value={w.date_convocation} onChangeText={(v) => w.set({ date_convocation: v })} placeholder="Ex: 1er mars 2026" />
            <Field colors={colors} label="Motif de la dissolution" value={w.motif_dissolution} onChangeText={(v) => w.set({ motif_dissolution: v })} placeholder="Expliquer les motifs..." multiline />
            <Field colors={colors} label="Date AGE proposée" value={w.date_age_proposee} onChangeText={(v) => w.set({ date_age_proposee: v })} placeholder="Ex: 30 mars 2026" />
            <Field colors={colors} label="Observations" value={w.observations} onChangeText={(v) => w.set({ observations: v })} placeholder="Observations éventuelles..." multiline />
          </>
        )}

        {/* ── Étape 2 : Administrateurs ── */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Président du CA" value={w.president_ca} onChangeText={(v) => w.set({ president_ca: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Secrétaire de séance" value={w.secretaire_seance} onChangeText={(v) => w.set({ secretaire_seance: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Administrateurs présents" value={w.administrateurs_presents} onChangeText={(v) => w.set({ administrateurs_presents: v })} placeholder="Noms séparés par des virgules" multiline />
            <Field colors={colors} label="Administrateurs absents" value={w.administrateurs_absents} onChangeText={(v) => w.set({ administrateurs_absents: v })} placeholder="Noms séparés par des virgules (si applicable)" multiline />
            <Field colors={colors} label="Nombre total d'administrateurs" value={w.nombre_administrateurs ? String(w.nombre_administrateurs) : ""} onChangeText={(v) => w.set({ nombre_administrateurs: parseInt(v) || 0 })} keyboardType="numeric" />
            <ToggleRow colors={colors} label="Quorum atteint" value={w.quorum_atteint} onToggle={(v) => w.set({ quorum_atteint: v })} />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 3 : Aperçu + Téléchargement ── */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PV DU CA - CONVOCATION AGE DISSOLUTION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Le CA s'est réuni le {w.date_reunion} à {w.heure_reunion} au {w.lieu_reunion}, sous la présidence de {w.president_ca}.
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Motif : {w.motif_dissolution}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Date AGE proposée : {w.date_age_proposee}
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
