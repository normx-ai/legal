import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// ── Types ──

interface ProjetFusionAbsorbeeAbsorbanteState {
  absorbee_denomination: string;
  absorbee_siege: string;
  absorbee_capital: string;
  absorbee_forme: string;
  absorbee_rc: string;
  absorbee_objet: string;
  absorbee_president: string;
  absorbee_nombre_actions: number;
  absorbee_valeur_nominale: number;
  absorbante_denomination: string;
  absorbante_siege: string;
  absorbante_capital: string;
  absorbante_forme: string;
  absorbante_rc: string;
  absorbante_objet: string;
  absorbante_president: string;
  absorbante_nombre_actions: number;
  absorbante_valeur_nominale: number;
  actions_detenues_par_a: number;
  pourcentage_participation: string;
  montant_reduction_capital_b: number;
  date_effet_fusion: string;
  date_projet: string;
  motif_fusion: string;
  parite_echange: string;
  prime_fusion: number;
  augmentation_capital_absorbante: number;
  nombre_actions_nouvelles: number;
  actif_immobilise: number;
  actif_circulant: number;
  tresorerie_actif: number;
  capitaux_propres: number;
  dettes_financieres: number;
  dettes_circulantes: number;
  tresorerie_passif: number;
  actif_net_apporte: number;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<ProjetFusionAbsorbeeAbsorbanteState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<ProjetFusionAbsorbeeAbsorbanteState, "set" | "nextStep" | "prevStep" | "reset"> = {
  absorbee_denomination: "",
  absorbee_siege: "",
  absorbee_capital: "",
  absorbee_forme: "SA",
  absorbee_rc: "",
  absorbee_objet: "",
  absorbee_president: "",
  absorbee_nombre_actions: 0,
  absorbee_valeur_nominale: 0,
  absorbante_denomination: "",
  absorbante_siege: "",
  absorbante_capital: "",
  absorbante_forme: "SA",
  absorbante_rc: "",
  absorbante_objet: "",
  absorbante_president: "",
  absorbante_nombre_actions: 0,
  absorbante_valeur_nominale: 0,
  actions_detenues_par_a: 0,
  pourcentage_participation: "",
  montant_reduction_capital_b: 0,
  date_effet_fusion: "",
  date_projet: "",
  motif_fusion: "",
  parite_echange: "",
  prime_fusion: 0,
  augmentation_capital_absorbante: 0,
  nombre_actions_nouvelles: 0,
  actif_immobilise: 0,
  actif_circulant: 0,
  tresorerie_actif: 0,
  capitaux_propres: 0,
  dettes_financieres: 0,
  dettes_circulantes: 0,
  tresorerie_passif: 0,
  actif_net_apporte: 0,
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<ProjetFusionAbsorbeeAbsorbanteState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Soci\u00e9t\u00e9 absorb\u00e9e", "Soci\u00e9t\u00e9 absorbante", "Participation", "Fusion", "Actif/Passif", "Aper\u00e7u"];

// ── Main Screen ──

export default function ProjetFusionAbsorbeeAbsorbanteWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/projet-fusion-absorbee-absorbante", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.absorbee_denomination,
        siege_social: w.absorbee_siege,
        capital: parseInt(w.absorbee_capital) || 0,
        societe_absorbee_denomination: w.absorbee_denomination,
        societe_absorbee_siege: w.absorbee_siege,
        societe_absorbee_capital: parseInt(w.absorbee_capital) || 0,
        societe_absorbee_forme: w.absorbee_forme,
        societe_absorbee_rccm: w.absorbee_rc,
        societe_absorbee_objet: w.absorbee_objet,
        societe_absorbee_representant: w.absorbee_president,
        societe_absorbee_nombre_actions: w.absorbee_nombre_actions,
        societe_absorbee_valeur_nominale: w.absorbee_valeur_nominale,
        societe_absorbante_denomination: w.absorbante_denomination,
        societe_absorbante_siege: w.absorbante_siege,
        societe_absorbante_capital: parseInt(w.absorbante_capital) || 0,
        societe_absorbante_forme: w.absorbante_forme,
        societe_absorbante_rccm: w.absorbante_rc,
        societe_absorbante_objet: w.absorbante_objet,
        societe_absorbante_representant: w.absorbante_president,
        societe_absorbante_nombre_actions: w.absorbante_nombre_actions,
        societe_absorbante_valeur_nominale: w.absorbante_valeur_nominale,
        actions_detenues_par_a: w.actions_detenues_par_a,
        pourcentage_participation: w.pourcentage_participation,
        montant_reduction_capital_b: w.montant_reduction_capital_b,
        date_effet_fusion: w.date_effet_fusion,
        motifs_fusion: w.motif_fusion,
        rapport_echange: w.parite_echange,
        prime_fusion: w.prime_fusion,
        augmentation_capital_b: w.augmentation_capital_absorbante,
        nombre_actions_nouvelles_b: w.nombre_actions_nouvelles,
        actif_immobilise: w.actif_immobilise,
        actif_circulant: w.actif_circulant,
        tresorerie_actif: w.tresorerie_actif,
        capitaux_propres: w.capitaux_propres,
        dettes_financieres: w.dettes_financieres,
        dettes_circulantes: w.dettes_circulantes,
        tresorerie_passif: w.tresorerie_passif,
        actif_net_apporte: w.actif_net_apporte,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 4;
  const isDownloadStep = w.currentStep === 5;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: "PROJET DE FUSION (ABSORB\u00c9E DANS ABSORBANTE)", bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "(Mod\u00e8le 45)", center: true, size: "md" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "", spaceBefore: true },
      { text: "Soci\u00e9t\u00e9 absorb\u00e9e (A) :", bold: true, spaceBefore: true },
      { text: `${v(w.absorbee_denomination)} - Capital : ${v(w.absorbee_capital)} FCFA` },
      { text: "", spaceBefore: true },
      { text: "Soci\u00e9t\u00e9 absorbante (B) :", bold: true, spaceBefore: true },
      { text: `${v(w.absorbante_denomination)} - Capital : ${v(w.absorbante_capital)} FCFA` },
      { text: "", spaceBefore: true },
      { text: `Participation : A d\u00e9tient ${w.actions_detenues_par_a || "..."} actions de B (${v(w.pourcentage_participation)}%)`, bold: true },
      { text: `R\u00e9duction capital B : ${w.montant_reduction_capital_b ? w.montant_reduction_capital_b.toLocaleString("fr-FR") : "..."} FCFA` },
      { text: `Date d'effet : ${v(w.date_effet_fusion)}` },
      { text: `Actif net apport\u00e9 : ${w.actif_net_apporte || "..."} FCFA` },
      { text: "", spaceBefore: true },
      { text: `Fait \u00e0 ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.absorbee_denomination, w.absorbee_capital, w.absorbante_denomination, w.absorbante_capital,
      w.actions_detenues_par_a, w.pourcentage_participation, w.montant_reduction_capital_b,
      w.date_effet_fusion, w.actif_net_apporte, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Projet de fusion (absorb\u00e9e dans absorbante)"
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

        {/* -- Etape 0 : Societe absorbee -- */}
        {w.currentStep === 0 && (
          <>
            <SectionTitle title="Soci\u00e9t\u00e9 absorb\u00e9e (A)" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.absorbee_denomination} onChangeText={(v) => w.set({ absorbee_denomination: v })} placeholder="Ex: BETA INDUSTRIES SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.absorbee_siege} onChangeText={(v) => w.set({ absorbee_siege: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.absorbee_capital} onChangeText={(v) => w.set({ absorbee_capital: v })} placeholder="Ex: 50 000 000" />
            <Field colors={colors} label="Num\u00e9ro RC" value={w.absorbee_rc} onChangeText={(v) => w.set({ absorbee_rc: v })} placeholder="Ex: RCCM BZV-..." />
            <Field colors={colors} label="Objet social" value={w.absorbee_objet} onChangeText={(v) => w.set({ absorbee_objet: v })} multiline />
            <Field colors={colors} label="Pr\u00e9sident / DG" value={w.absorbee_president} onChangeText={(v) => w.set({ absorbee_president: v })} />
            <Field colors={colors} label="Nombre d'actions" value={w.absorbee_nombre_actions ? String(w.absorbee_nombre_actions) : ""} onChangeText={(v) => w.set({ absorbee_nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale (FCFA)" value={w.absorbee_valeur_nominale ? String(w.absorbee_valeur_nominale) : ""} onChangeText={(v) => w.set({ absorbee_valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* -- Etape 1 : Societe absorbante -- */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Soci\u00e9t\u00e9 absorbante (B)" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.absorbante_denomination} onChangeText={(v) => w.set({ absorbante_denomination: v })} placeholder="Ex: ALPHA HOLDING SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.absorbante_siege} onChangeText={(v) => w.set({ absorbante_siege: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.absorbante_capital} onChangeText={(v) => w.set({ absorbante_capital: v })} placeholder="Ex: 100 000 000" />
            <Field colors={colors} label="Num\u00e9ro RC" value={w.absorbante_rc} onChangeText={(v) => w.set({ absorbante_rc: v })} placeholder="Ex: RCCM BZV-..." />
            <Field colors={colors} label="Objet social" value={w.absorbante_objet} onChangeText={(v) => w.set({ absorbante_objet: v })} multiline />
            <Field colors={colors} label="Pr\u00e9sident / DG" value={w.absorbante_president} onChangeText={(v) => w.set({ absorbante_president: v })} />
            <Field colors={colors} label="Nombre d'actions" value={w.absorbante_nombre_actions ? String(w.absorbante_nombre_actions) : ""} onChangeText={(v) => w.set({ absorbante_nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale (FCFA)" value={w.absorbante_valeur_nominale ? String(w.absorbante_valeur_nominale) : ""} onChangeText={(v) => w.set({ absorbante_valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* -- Etape 2 : Participation -- */}
        {w.currentStep === 2 && (
          <>
            <SectionTitle title="Participation de A dans B" colors={colors} />
            <Field colors={colors} label="Nombre d'actions de B d\u00e9tenues par A" value={w.actions_detenues_par_a ? String(w.actions_detenues_par_a) : ""} onChangeText={(v) => w.set({ actions_detenues_par_a: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Pourcentage de participation (%)" value={w.pourcentage_participation} onChangeText={(v) => w.set({ pourcentage_participation: v })} placeholder="Ex: 15" />
            <Field colors={colors} label="Montant r\u00e9duction capital B (FCFA)" value={w.montant_reduction_capital_b ? String(w.montant_reduction_capital_b) : ""} onChangeText={(v) => w.set({ montant_reduction_capital_b: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* -- Etape 3 : Fusion -- */}
        {w.currentStep === 3 && (
          <>
            <SectionTitle title="Modalit\u00e9s de la fusion" colors={colors} />
            <Field colors={colors} label="Date d'effet de la fusion" value={w.date_effet_fusion} onChangeText={(v) => w.set({ date_effet_fusion: v })} placeholder="Ex: 1er juillet 2026" />
            <Field colors={colors} label="Motif de la fusion" value={w.motif_fusion} onChangeText={(v) => w.set({ motif_fusion: v })} multiline />
            <Field colors={colors} label="Parit\u00e9 d'\u00e9change" value={w.parite_echange} onChangeText={(v) => w.set({ parite_echange: v })} placeholder="Ex: 2 actions B pour 3 actions A" />
            <Field colors={colors} label="Prime de fusion (FCFA)" value={w.prime_fusion ? String(w.prime_fusion) : ""} onChangeText={(v) => w.set({ prime_fusion: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Augmentation de capital B (FCFA)" value={w.augmentation_capital_absorbante ? String(w.augmentation_capital_absorbante) : ""} onChangeText={(v) => w.set({ augmentation_capital_absorbante: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Nombre d'actions nouvelles" value={w.nombre_actions_nouvelles ? String(w.nombre_actions_nouvelles) : ""} onChangeText={(v) => w.set({ nombre_actions_nouvelles: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* -- Etape 4 : Actif / Passif -- */}
        {w.currentStep === 4 && (
          <>
            <SectionTitle title="Actif apport\u00e9 (soci\u00e9t\u00e9 absorb\u00e9e)" colors={colors} />
            <Field colors={colors} label="Actif immobilis\u00e9 (FCFA)" value={w.actif_immobilise ? String(w.actif_immobilise) : ""} onChangeText={(v) => w.set({ actif_immobilise: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actif circulant (FCFA)" value={w.actif_circulant ? String(w.actif_circulant) : ""} onChangeText={(v) => w.set({ actif_circulant: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Tr\u00e9sorerie actif (FCFA)" value={w.tresorerie_actif ? String(w.tresorerie_actif) : ""} onChangeText={(v) => w.set({ tresorerie_actif: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Passif pris en charge" colors={colors} />
            <Field colors={colors} label="Capitaux propres (FCFA)" value={w.capitaux_propres ? String(w.capitaux_propres) : ""} onChangeText={(v) => w.set({ capitaux_propres: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Dettes financi\u00e8res (FCFA)" value={w.dettes_financieres ? String(w.dettes_financieres) : ""} onChangeText={(v) => w.set({ dettes_financieres: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Dettes circulantes (FCFA)" value={w.dettes_circulantes ? String(w.dettes_circulantes) : ""} onChangeText={(v) => w.set({ dettes_circulantes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Tr\u00e9sorerie passif (FCFA)" value={w.tresorerie_passif ? String(w.tresorerie_passif) : ""} onChangeText={(v) => w.set({ tresorerie_passif: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Actif net apport\u00e9" colors={colors} />
            <Field colors={colors} label="Actif net apport\u00e9 (FCFA)" value={w.actif_net_apporte ? String(w.actif_net_apporte) : ""} onChangeText={(v) => w.set({ actif_net_apporte: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* -- Etape 5 : Apercu + Telechargement -- */}
        {w.currentStep === 5 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PROJET DE FUSION (ABSORB\u00c9E DANS ABSORBANTE)
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 8, marginBottom: 6 }}>Soci\u00e9t\u00e9 absorb\u00e9e (A)</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>{w.absorbee_denomination} - Capital : {w.absorbee_capital} FCFA</Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Soci\u00e9t\u00e9 absorbante (B)</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>{w.absorbante_denomination} - Capital : {w.absorbante_capital} FCFA</Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Participation</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>A d\u00e9tient {w.actions_detenues_par_a} actions de B ({w.pourcentage_participation}%)</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>R\u00e9duction capital B : {w.montant_reduction_capital_b.toLocaleString("fr-FR")} FCFA</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                  Fait \u00e0 {w.lieu_signature || "Brazzaville"}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}
                </Text>
              </View>
              <View style={{ alignItems: "center", paddingBottom: 24 }}>
                {generatedUrl ? (
                  <TouchableOpacity onPress={handleDownload}
                    style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
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
          );
        })()}

    </WizardLayout>
  );
}
