import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { parseAmount } from "@/lib/utils/parseAmount";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// ── Types ──

interface RapportCaDissolutionState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  // Rapport
  date_rapport: string;
  date_ca: string;
  president_ca: string;
  motif_dissolution: string;
  situation_financiere: string;
  actif_total: number;
  passif_total: number;
  capitaux_propres: number;
  perte_montant: number;
  exercice_reference: string;
  recommandations: string;
  proposition_liquidateur: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<RapportCaDissolutionState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<RapportCaDissolutionState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  date_rapport: "",
  date_ca: "",
  president_ca: "",
  motif_dissolution: "",
  situation_financiere: "",
  actif_total: 0,
  passif_total: 0,
  capitaux_propres: 0,
  perte_montant: 0,
  exercice_reference: "",
  recommandations: "",
  proposition_liquidateur: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<RapportCaDissolutionState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Société", "Rapport", "Aperçu"];

// ── Main Screen ──

export default function RapportCaDissolutionWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/rapport-ca-dissolution", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        date_rapport: w.date_rapport,
        date_ca: w.date_ca,
        president_ca: w.president_ca,
        motif_dissolution: w.motif_dissolution,
        situation_financiere: w.situation_financiere,
        actif_total: w.actif_total,
        passif_total: w.passif_total,
        capitaux_propres: w.capitaux_propres,
        perte_montant: w.perte_montant,
        exercice_reference: w.exercice_reference,
        recommandations: w.recommandations,
        proposition_liquidateur: w.proposition_liquidateur,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 1;
  const isDownloadStep = w.currentStep === 2;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "RAPPORT DU CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "SUR LA DISSOLUTION", bold: true, center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Président du CA : ${v(w.president_ca)}`, spaceBefore: true },
      { text: `Motif : ${v(w.motif_dissolution)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Situation financière :", bold: true, spaceBefore: true },
      { text: `Actif total : ${w.actif_total || "..."} FCFA` },
      { text: `Passif total : ${w.passif_total || "..."} FCFA` },
      { text: `Capitaux propres : ${w.capitaux_propres || "..."} FCFA` },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.president_ca,
      w.motif_dissolution, w.actif_total, w.passif_total, w.capitaux_propres,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Rapport CA dissolution"
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

        {/* ── Étape 1 : Rapport ── */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Informations du rapport" colors={colors} />
            <Field colors={colors} label="Date du rapport" value={w.date_rapport} onChangeText={(v) => w.set({ date_rapport: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Date du conseil d'administration" value={w.date_ca} onChangeText={(v) => w.set({ date_ca: v })} placeholder="Ex: 10 mars 2026" />
            <Field colors={colors} label="Président du CA" value={w.president_ca} onChangeText={(v) => w.set({ president_ca: v })} placeholder="Nom complet" />

            <SectionTitle title="Motifs et situation" colors={colors} />
            <Field colors={colors} label="Motif de la dissolution" value={w.motif_dissolution} onChangeText={(v) => w.set({ motif_dissolution: v })} placeholder="Expliquer les motifs..." multiline />
            <Field colors={colors} label="Situation financière (description)" value={w.situation_financiere} onChangeText={(v) => w.set({ situation_financiere: v })} placeholder="Décrire la situation financière..." multiline />
            <Field colors={colors} label="Exercice de référence" value={w.exercice_reference} onChangeText={(v) => w.set({ exercice_reference: v })} placeholder="Ex: 31 décembre 2025" />

            <SectionTitle title="Chiffres clés" colors={colors} />
            <Field colors={colors} label="Actif total (FCFA)" value={w.actif_total ? String(w.actif_total) : ""} onChangeText={(v) => w.set({ actif_total: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Passif total (FCFA)" value={w.passif_total ? String(w.passif_total) : ""} onChangeText={(v) => w.set({ passif_total: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Capitaux propres (FCFA)" value={w.capitaux_propres ? String(w.capitaux_propres) : ""} onChangeText={(v) => w.set({ capitaux_propres: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Montant des pertes (FCFA)" value={w.perte_montant ? String(w.perte_montant) : ""} onChangeText={(v) => w.set({ perte_montant: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Recommandations" colors={colors} />
            <Field colors={colors} label="Recommandations du CA" value={w.recommandations} onChangeText={(v) => w.set({ recommandations: v })} placeholder="Recommandations..." multiline />
            <Field colors={colors} label="Proposition de liquidateur" value={w.proposition_liquidateur} onChangeText={(v) => w.set({ proposition_liquidateur: v })} placeholder="Nom du liquidateur proposé" />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 2 : Aperçu + Téléchargement ── */}
        {w.currentStep === 2 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  RAPPORT DU CA SUR LA DISSOLUTION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Président du CA : {w.president_ca}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Motif : {w.motif_dissolution}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Chiffres clés</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Actif : {w.actif_total} FCFA</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Passif : {w.passif_total} FCFA</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Capitaux propres : {w.capitaux_propres} FCFA</Text>

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
