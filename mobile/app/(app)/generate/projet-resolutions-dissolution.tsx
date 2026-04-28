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

interface ProjetResolutionsDissolutionState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  // Liquidateur
  liquidateur_civilite: string;
  liquidateur_nom: string;
  liquidateur_prenom: string;
  liquidateur_adresse: string;
  liquidateur_nationalite: string;
  duree_mandat_liquidateur: string;
  pouvoirs_liquidateur: string;
  remuneration_liquidateur: string;
  // Résolutions
  decisions_selectionnees: string[];
  // Détails
  motif_dissolution: string;
  date_effet_dissolution: string;
  siege_liquidation: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<ProjetResolutionsDissolutionState>) => void;
  toggleDecision: (d: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<ProjetResolutionsDissolutionState, "set" | "toggleDecision" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  liquidateur_civilite: "Monsieur",
  liquidateur_nom: "",
  liquidateur_prenom: "",
  liquidateur_adresse: "",
  liquidateur_nationalite: "congolaise",
  duree_mandat_liquidateur: "",
  pouvoirs_liquidateur: "",
  remuneration_liquidateur: "",
  decisions_selectionnees: [],
  motif_dissolution: "",
  date_effet_dissolution: "",
  siege_liquidation: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<ProjetResolutionsDissolutionState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  toggleDecision: (d) =>
    set((s) => ({
      decisions_selectionnees: s.decisions_selectionnees.includes(d)
        ? s.decisions_selectionnees.filter((x) => x !== d)
        : [...s.decisions_selectionnees, d],
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Société", "Liquidateur", "Résolutions", "Aperçu"];

const RESOLUTIONS_LIST: { key: string; label: string }[] = [
  { key: "constat_motif", label: "Constatation du motif de dissolution" },
  { key: "dissolution_anticipee", label: "Dissolution anticipée" },
  { key: "nomination_liquidateur", label: "Nomination du liquidateur" },
  { key: "pouvoirs_liquidateur", label: "Définition des pouvoirs du liquidateur" },
  { key: "remuneration_liquidateur", label: "Rémunération du liquidateur" },
  { key: "siege_liquidation", label: "Fixation du siège de la liquidation" },
  { key: "cessation_fonctions", label: "Cessation des fonctions des organes" },
  { key: "publicite", label: "Formalités de publicité" },
  { key: "pouvoirs_formalites", label: "Pouvoirs pour les formalités" },
];

// ── Main Screen ──

export default function ProjetResolutionsDissolutionWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/projet-resolutions-dissolution", w.nextStep);

  const has = (d: string) => w.decisions_selectionnees.includes(d);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        liquidateur_civilite: w.liquidateur_civilite,
        liquidateur_nom: w.liquidateur_nom,
        liquidateur_prenom: w.liquidateur_prenom,
        liquidateur_adresse: w.liquidateur_adresse,
        liquidateur_nationalite: w.liquidateur_nationalite,
        duree_mandat_liquidateur: w.duree_mandat_liquidateur,
        pouvoirs_liquidateur: w.pouvoirs_liquidateur,
        remuneration_liquidateur: w.remuneration_liquidateur,
        decisions_selectionnees: w.decisions_selectionnees,
        motif_dissolution: w.motif_dissolution,
        date_effet_dissolution: w.date_effet_dissolution,
        siege_liquidation: has("siege_liquidation") ? w.siege_liquidation : undefined,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROJET DE RÉSOLUTIONS", bold: true, center: true, size: "lg" as const },
      { text: "DISSOLUTION", bold: true, center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Liquidateur proposé : ${v(w.liquidateur_civilite)} ${v(w.liquidateur_prenom)} ${v(w.liquidateur_nom)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Résolutions proposées :", bold: true, spaceBefore: true },
    ];
    w.decisions_selectionnees.forEach((d) => {
      const found = RESOLUTIONS_LIST.find((x) => x.key === d);
      if (found) lines.push({ text: `- ${found.label}` });
    });
    if (w.decisions_selectionnees.length === 0) {
      lines.push({ text: "(aucune résolution sélectionnée)", italic: true });
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    );
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.liquidateur_civilite,
      w.liquidateur_nom, w.liquidateur_prenom, w.decisions_selectionnees,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Projet résolutions dissolution"
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
              { value: "SARL", label: "SARL" },
              { value: "SAS", label: "SAS" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Numéro RC" value={w.rc_numero} onChangeText={(v) => w.set({ rc_numero: v })} placeholder="Ex: RCCM BZV-..." />
            <Field colors={colors} label="Motif de la dissolution" value={w.motif_dissolution} onChangeText={(v) => w.set({ motif_dissolution: v })} placeholder="Expliquer les motifs..." multiline />
            <Field colors={colors} label="Date d'effet de la dissolution" value={w.date_effet_dissolution} onChangeText={(v) => w.set({ date_effet_dissolution: v })} placeholder="Ex: 31 mars 2026" />
          </>
        )}

        {/* ── Étape 1 : Liquidateur ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.liquidateur_civilite} onChange={(v) => w.set({ liquidateur_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.liquidateur_nom} onChangeText={(v) => w.set({ liquidateur_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.liquidateur_prenom} onChangeText={(v) => w.set({ liquidateur_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.liquidateur_adresse} onChangeText={(v) => w.set({ liquidateur_adresse: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Nationalité" value={w.liquidateur_nationalite} onChangeText={(v) => w.set({ liquidateur_nationalite: v })} />
            <Field colors={colors} label="Durée du mandat" value={w.duree_mandat_liquidateur} onChangeText={(v) => w.set({ duree_mandat_liquidateur: v })} placeholder="Ex: jusqu'à clôture de la liquidation" />
            <Field colors={colors} label="Pouvoirs du liquidateur" value={w.pouvoirs_liquidateur} onChangeText={(v) => w.set({ pouvoirs_liquidateur: v })} placeholder="Décrire les pouvoirs..." multiline />
            <Field colors={colors} label="Rémunération du liquidateur" value={w.remuneration_liquidateur} onChangeText={(v) => w.set({ remuneration_liquidateur: v })} placeholder="Ex: gratuit, ou montant..." />
          </>
        )}

        {/* ── Étape 2 : Résolutions ── */}
        {w.currentStep === 2 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Sélectionnez les résolutions à inclure dans le projet.
            </Text>
            {RESOLUTIONS_LIST.map((d) => (
              <ToggleRow key={d.key} colors={colors} label={d.label} value={w.decisions_selectionnees.includes(d.key)} onToggle={() => w.toggleDecision(d.key)} />
            ))}

            {has("siege_liquidation") && (
              <>
                <SectionTitle title="Siège de la liquidation" colors={colors} />
                <Field colors={colors} label="Adresse du siège de liquidation" value={w.siege_liquidation} onChangeText={(v) => w.set({ siege_liquidation: v })} placeholder="Adresse..." />
              </>
            )}

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
                  PROJET DE RÉSOLUTIONS - DISSOLUTION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Liquidateur proposé : {w.liquidateur_civilite} {w.liquidateur_prenom} {w.liquidateur_nom}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Résolutions</Text>
                {w.decisions_selectionnees.map((d) => {
                  const found = RESOLUTIONS_LIST.find((x) => x.key === d);
                  return found ? (
                    <Text key={d} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>- {found.label}</Text>
                  ) : null;
                })}

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
