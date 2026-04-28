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

interface ProjetFusionState {
  // Société absorbée
  absorbee_denomination: string;
  absorbee_siege: string;
  absorbee_capital: string;
  absorbee_forme: string;
  absorbee_rc: string;
  absorbee_date_creation: string;
  absorbee_duree: string;
  absorbee_objet: string;
  absorbee_president: string;
  absorbee_nombre_actions: number;
  absorbee_valeur_nominale: number;
  // Société absorbante
  absorbante_denomination: string;
  absorbante_siege: string;
  absorbante_capital: string;
  absorbante_forme: string;
  absorbante_rc: string;
  absorbante_date_creation: string;
  absorbante_duree: string;
  absorbante_objet: string;
  absorbante_president: string;
  absorbante_nombre_actions: number;
  absorbante_valeur_nominale: number;
  // Fusion
  date_effet_fusion: string;
  date_projet: string;
  motif_fusion: string;
  parite_echange: string;
  prime_fusion: number;
  soulte: number;
  augmentation_capital_absorbante: number;
  nombre_actions_nouvelles: number;
  conditions_suspensives: string;
  date_age_absorbee: string;
  date_age_absorbante: string;
  commissaire_fusion_nom: string;
  commissaire_fusion_adresse: string;
  // Actif / Passif
  actif_immobilise: number;
  actif_circulant: number;
  tresorerie_actif: number;
  capitaux_propres: number;
  dettes_financieres: number;
  dettes_circulantes: number;
  tresorerie_passif: number;
  actif_net_apporte: number;
  // Signature
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<ProjetFusionState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<ProjetFusionState, "set" | "nextStep" | "prevStep" | "reset"> = {
  absorbee_denomination: "",
  absorbee_siege: "",
  absorbee_capital: "",
  absorbee_forme: "SA",
  absorbee_rc: "",
  absorbee_date_creation: "",
  absorbee_duree: "",
  absorbee_objet: "",
  absorbee_president: "",
  absorbee_nombre_actions: 0,
  absorbee_valeur_nominale: 0,
  absorbante_denomination: "",
  absorbante_siege: "",
  absorbante_capital: "",
  absorbante_forme: "SA",
  absorbante_rc: "",
  absorbante_date_creation: "",
  absorbante_duree: "",
  absorbante_objet: "",
  absorbante_president: "",
  absorbante_nombre_actions: 0,
  absorbante_valeur_nominale: 0,
  date_effet_fusion: "",
  date_projet: "",
  motif_fusion: "",
  parite_echange: "",
  prime_fusion: 0,
  soulte: 0,
  augmentation_capital_absorbante: 0,
  nombre_actions_nouvelles: 0,
  conditions_suspensives: "",
  date_age_absorbee: "",
  date_age_absorbante: "",
  commissaire_fusion_nom: "",
  commissaire_fusion_adresse: "",
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

const useStore = create<ProjetFusionState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Société absorbée", "Société absorbante", "Fusion", "Actif/Passif", "Aperçu"];

// ── Main Screen ──

export default function ProjetFusionWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/projet-fusion", w.nextStep);
  const handleGenerate = () => generate({
        absorbee_denomination: w.absorbee_denomination,
        absorbee_siege: w.absorbee_siege,
        absorbee_capital: w.absorbee_capital,
        absorbee_forme: w.absorbee_forme,
        absorbee_rc: w.absorbee_rc,
        absorbee_date_creation: w.absorbee_date_creation,
        absorbee_duree: w.absorbee_duree,
        absorbee_objet: w.absorbee_objet,
        absorbee_president: w.absorbee_president,
        absorbee_nombre_actions: w.absorbee_nombre_actions,
        absorbee_valeur_nominale: w.absorbee_valeur_nominale,
        absorbante_denomination: w.absorbante_denomination,
        absorbante_siege: w.absorbante_siege,
        absorbante_capital: w.absorbante_capital,
        absorbante_forme: w.absorbante_forme,
        absorbante_rc: w.absorbante_rc,
        absorbante_date_creation: w.absorbante_date_creation,
        absorbante_duree: w.absorbante_duree,
        absorbante_objet: w.absorbante_objet,
        absorbante_president: w.absorbante_president,
        absorbante_nombre_actions: w.absorbante_nombre_actions,
        absorbante_valeur_nominale: w.absorbante_valeur_nominale,
        date_effet_fusion: w.date_effet_fusion,
        date_projet: w.date_projet,
        motif_fusion: w.motif_fusion,
        parite_echange: w.parite_echange,
        prime_fusion: w.prime_fusion,
        soulte: w.soulte,
        augmentation_capital_absorbante: w.augmentation_capital_absorbante,
        nombre_actions_nouvelles: w.nombre_actions_nouvelles,
        conditions_suspensives: w.conditions_suspensives,
        date_age_absorbee: w.date_age_absorbee,
        date_age_absorbante: w.date_age_absorbante,
        commissaire_fusion_nom: w.commissaire_fusion_nom,
        commissaire_fusion_adresse: w.commissaire_fusion_adresse,
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

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: "PROJET DE FUSION", bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "PAR ABSORPTION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "Société absorbée :", bold: true, spaceBefore: true },
      { text: `${v(w.absorbee_denomination)} - ${v(w.absorbee_forme)} au capital de ${v(w.absorbee_capital)} FCFA` },
      { text: `Siège : ${v(w.absorbee_siege)}` },
      { text: "", spaceBefore: true },
      { text: "Société absorbante :", bold: true, spaceBefore: true },
      { text: `${v(w.absorbante_denomination)} - ${v(w.absorbante_forme)} au capital de ${v(w.absorbante_capital)} FCFA` },
      { text: `Siège : ${v(w.absorbante_siege)}` },
      { text: "", spaceBefore: true },
      { text: `Date d'effet : ${v(w.date_effet_fusion)}`, spaceBefore: true },
      { text: `Parité d'échange : ${v(w.parite_echange)}` },
      { text: `Actif net apporté : ${w.actif_net_apporte || "..."} FCFA` },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.absorbee_denomination, w.absorbee_forme, w.absorbee_capital, w.absorbee_siege,
      w.absorbante_denomination, w.absorbante_forme, w.absorbante_capital, w.absorbante_siege,
      w.date_effet_fusion, w.parite_echange, w.actif_net_apporte,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Projet de fusion SA"
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

        {/* ── Étape 0 : Société absorbée ── */}
        {w.currentStep === 0 && (
          <>
            <SectionTitle title="Société absorbée" colors={colors} />
            <Field colors={colors} label="Dénomination sociale" value={w.absorbee_denomination} onChangeText={(v) => w.set({ absorbee_denomination: v })} placeholder="Ex: BETA INDUSTRIES SA" />
            <Field colors={colors} label="Siège social" value={w.absorbee_siege} onChangeText={(v) => w.set({ absorbee_siege: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.absorbee_capital} onChangeText={(v) => w.set({ absorbee_capital: v })} placeholder="Ex: 50 000 000" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
            ]} value={w.absorbee_forme} onChange={(v) => w.set({ absorbee_forme: v })} />
            <Field colors={colors} label="Numéro RC" value={w.absorbee_rc} onChangeText={(v) => w.set({ absorbee_rc: v })} placeholder="Ex: RCCM BZV-..." />
            <Field colors={colors} label="Date de création" value={w.absorbee_date_creation} onChangeText={(v) => w.set({ absorbee_date_creation: v })} placeholder="Ex: 1er janvier 2010" />
            <Field colors={colors} label="Durée de la société" value={w.absorbee_duree} onChangeText={(v) => w.set({ absorbee_duree: v })} placeholder="Ex: 99 ans" />
            <Field colors={colors} label="Objet social" value={w.absorbee_objet} onChangeText={(v) => w.set({ absorbee_objet: v })} placeholder="Objet social..." multiline />
            <Field colors={colors} label="Président / DG" value={w.absorbee_president} onChangeText={(v) => w.set({ absorbee_president: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Nombre d'actions" value={w.absorbee_nombre_actions ? String(w.absorbee_nombre_actions) : ""} onChangeText={(v) => w.set({ absorbee_nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale (FCFA)" value={w.absorbee_valeur_nominale ? String(w.absorbee_valeur_nominale) : ""} onChangeText={(v) => w.set({ absorbee_valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* ── Étape 1 : Société absorbante ── */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Société absorbante" colors={colors} />
            <Field colors={colors} label="Dénomination sociale" value={w.absorbante_denomination} onChangeText={(v) => w.set({ absorbante_denomination: v })} placeholder="Ex: ALPHA HOLDING SA" />
            <Field colors={colors} label="Siège social" value={w.absorbante_siege} onChangeText={(v) => w.set({ absorbante_siege: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.absorbante_capital} onChangeText={(v) => w.set({ absorbante_capital: v })} placeholder="Ex: 100 000 000" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
            ]} value={w.absorbante_forme} onChange={(v) => w.set({ absorbante_forme: v })} />
            <Field colors={colors} label="Numéro RC" value={w.absorbante_rc} onChangeText={(v) => w.set({ absorbante_rc: v })} placeholder="Ex: RCCM BZV-..." />
            <Field colors={colors} label="Date de création" value={w.absorbante_date_creation} onChangeText={(v) => w.set({ absorbante_date_creation: v })} placeholder="Ex: 1er janvier 2005" />
            <Field colors={colors} label="Durée de la société" value={w.absorbante_duree} onChangeText={(v) => w.set({ absorbante_duree: v })} placeholder="Ex: 99 ans" />
            <Field colors={colors} label="Objet social" value={w.absorbante_objet} onChangeText={(v) => w.set({ absorbante_objet: v })} placeholder="Objet social..." multiline />
            <Field colors={colors} label="Président / DG" value={w.absorbante_president} onChangeText={(v) => w.set({ absorbante_president: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Nombre d'actions" value={w.absorbante_nombre_actions ? String(w.absorbante_nombre_actions) : ""} onChangeText={(v) => w.set({ absorbante_nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale (FCFA)" value={w.absorbante_valeur_nominale ? String(w.absorbante_valeur_nominale) : ""} onChangeText={(v) => w.set({ absorbante_valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* ── Étape 2 : Fusion ── */}
        {w.currentStep === 2 && (
          <>
            <SectionTitle title="Modalités de la fusion" colors={colors} />
            <Field colors={colors} label="Date du projet" value={w.date_projet} onChangeText={(v) => w.set({ date_projet: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Date d'effet de la fusion" value={w.date_effet_fusion} onChangeText={(v) => w.set({ date_effet_fusion: v })} placeholder="Ex: 1er juillet 2026" />
            <Field colors={colors} label="Motif de la fusion" value={w.motif_fusion} onChangeText={(v) => w.set({ motif_fusion: v })} placeholder="Expliquer les motifs..." multiline />
            <Field colors={colors} label="Parité d'échange" value={w.parite_echange} onChangeText={(v) => w.set({ parite_echange: v })} placeholder="Ex: 2 actions absorbante pour 3 actions absorbée" />
            <Field colors={colors} label="Prime de fusion (FCFA)" value={w.prime_fusion ? String(w.prime_fusion) : ""} onChangeText={(v) => w.set({ prime_fusion: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Soulte (FCFA)" value={w.soulte ? String(w.soulte) : ""} onChangeText={(v) => w.set({ soulte: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Augmentation de capital absorbante (FCFA)" value={w.augmentation_capital_absorbante ? String(w.augmentation_capital_absorbante) : ""} onChangeText={(v) => w.set({ augmentation_capital_absorbante: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Nombre d'actions nouvelles" value={w.nombre_actions_nouvelles ? String(w.nombre_actions_nouvelles) : ""} onChangeText={(v) => w.set({ nombre_actions_nouvelles: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Conditions et calendrier" colors={colors} />
            <Field colors={colors} label="Conditions suspensives" value={w.conditions_suspensives} onChangeText={(v) => w.set({ conditions_suspensives: v })} placeholder="Conditions suspensives..." multiline />
            <Field colors={colors} label="Date AGE société absorbée" value={w.date_age_absorbee} onChangeText={(v) => w.set({ date_age_absorbee: v })} placeholder="Ex: 15 juin 2026" />
            <Field colors={colors} label="Date AGE société absorbante" value={w.date_age_absorbante} onChangeText={(v) => w.set({ date_age_absorbante: v })} placeholder="Ex: 15 juin 2026" />

            <SectionTitle title="Commissaire à la fusion" colors={colors} />
            <Field colors={colors} label="Nom du commissaire" value={w.commissaire_fusion_nom} onChangeText={(v) => w.set({ commissaire_fusion_nom: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Adresse du commissaire" value={w.commissaire_fusion_adresse} onChangeText={(v) => w.set({ commissaire_fusion_adresse: v })} placeholder="Adresse complète" />
          </>
        )}

        {/* ── Étape 3 : Actif / Passif ── */}
        {w.currentStep === 3 && (
          <>
            <SectionTitle title="Actif apporté (société absorbée)" colors={colors} />
            <Field colors={colors} label="Actif immobilisé (FCFA)" value={w.actif_immobilise ? String(w.actif_immobilise) : ""} onChangeText={(v) => w.set({ actif_immobilise: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actif circulant (FCFA)" value={w.actif_circulant ? String(w.actif_circulant) : ""} onChangeText={(v) => w.set({ actif_circulant: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Trésorerie actif (FCFA)" value={w.tresorerie_actif ? String(w.tresorerie_actif) : ""} onChangeText={(v) => w.set({ tresorerie_actif: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Passif pris en charge" colors={colors} />
            <Field colors={colors} label="Capitaux propres (FCFA)" value={w.capitaux_propres ? String(w.capitaux_propres) : ""} onChangeText={(v) => w.set({ capitaux_propres: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Dettes financières (FCFA)" value={w.dettes_financieres ? String(w.dettes_financieres) : ""} onChangeText={(v) => w.set({ dettes_financieres: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Dettes circulantes (FCFA)" value={w.dettes_circulantes ? String(w.dettes_circulantes) : ""} onChangeText={(v) => w.set({ dettes_circulantes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Trésorerie passif (FCFA)" value={w.tresorerie_passif ? String(w.tresorerie_passif) : ""} onChangeText={(v) => w.set({ tresorerie_passif: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Actif net apporté" colors={colors} />
            <Field colors={colors} label="Actif net apporté (FCFA)" value={w.actif_net_apporte ? String(w.actif_net_apporte) : ""} onChangeText={(v) => w.set({ actif_net_apporte: parseInt(v) || 0 })} keyboardType="numeric" />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 4 : Aperçu + Téléchargement ── */}
        {w.currentStep === 4 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PROJET DE FUSION PAR ABSORPTION
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 8, marginBottom: 6 }}>Société absorbée</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>{w.absorbee_denomination} - {w.absorbee_forme}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Capital : {w.absorbee_capital} FCFA</Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Société absorbante</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>{w.absorbante_denomination} - {w.absorbante_forme}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Capital : {w.absorbante_capital} FCFA</Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Modalités</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Date d'effet : {w.date_effet_fusion}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Parité : {w.parite_echange}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>Actif net apporté : {w.actif_net_apporte} FCFA</Text>

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
