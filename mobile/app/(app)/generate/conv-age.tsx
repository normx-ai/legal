import React, { useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeContext";
import { Field, Choice, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { DownloadStep } from "@/components/wizard/DownloadStep";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { parseAmount } from "@/lib/utils/parseAmount";
import { create } from "zustand";

interface ConvAgeState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  destinataire_civilite: string;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_adresse: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  ordre_du_jour: string;
  gerant_civilite: string;
  gerant_nom: string;
  gerant_prenom: string;
  date_envoi: string;
  lieu_envoi: string;
  currentStep: number;
  set: (data: Partial<ConvAgeState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  destinataire_civilite: "Monsieur",
  destinataire_nom: "",
  destinataire_prenom: "",
  destinataire_adresse: "",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  ordre_du_jour: "",
  gerant_civilite: "Monsieur",
  gerant_nom: "",
  gerant_prenom: "",
  date_envoi: "",
  lieu_envoi: "Brazzaville",
  currentStep: 0,
};

const useStore = create<ConvAgeState>((set) => ({
  ...initialState,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Destinataire", "Assemblée", "Gérant & Envoi", "Aperçu"];

export default function ConvAgeWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate, download } = useDocumentGeneration("/generate/conv-age", w.nextStep);

  const handleGenerate = () => generate({
    denomination: w.denomination,
    forme_juridique: w.forme_juridique,
    siege_social: w.siege_social,
    capital: parseAmount(w.capital),
    destinataire_civilite: w.destinataire_civilite,
    destinataire_nom: w.destinataire_nom,
    destinataire_prenom: w.destinataire_prenom,
    destinataire_adresse: w.destinataire_adresse,
    date_ag: w.date_ag,
    heure_ag: w.heure_ag,
    lieu_ag: w.lieu_ag,
    ordre_du_jour: w.ordre_du_jour,
    gerant_civilite: w.gerant_civilite,
    gerant_nom: w.gerant_nom,
    gerant_prenom: w.gerant_prenom,
    date_envoi: w.date_envoi || new Date().toLocaleDateString("fr-FR"),
    lieu_envoi: w.lieu_envoi,
  });

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl", spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "CONVOCATION", bold: true, center: true, size: "lg" },
      { text: "Assemblée Générale Extraordinaire", center: true, size: "md" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `${w.destinataire_civilite} ${v(w.destinataire_prenom)} ${v(w.destinataire_nom)}`, spaceBefore: true },
      { text: v(w.destinataire_adresse) },
      { text: "", spaceBefore: true },
      { text: `Madame, Monsieur,`, spaceBefore: true },
      { text: `Vous êtes convoqué(e) à l'Assemblée Générale Extraordinaire qui se tiendra le ${v(w.date_ag)} à ${v(w.heure_ag)}, au siège social, ${v(w.lieu_ag)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Ordre du jour :", bold: true, spaceBefore: true },
      { text: w.ordre_du_jour || "(ordre du jour par défaut OHADA)" },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_envoi)}, le ${w.date_envoi || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: `Le Gérant : ${w.gerant_civilite} ${v(w.gerant_prenom)} ${v(w.gerant_nom)}`, center: true },
    ];
    return lines;
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.destinataire_civilite, w.destinataire_nom, w.destinataire_prenom, w.destinataire_adresse,
      w.date_ag, w.heure_ag, w.lieu_ag, w.ordre_du_jour,
      w.gerant_civilite, w.gerant_nom, w.gerant_prenom, w.date_envoi, w.lieu_envoi]);

  return (
    <WizardLayout
      title="Convocation AGE (SARL)"
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
          <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} />
          <Choice colors={colors} label="Forme juridique" options={[
            { value: "SARL", label: "SARL" },
            { value: "SARLU", label: "SARLU" },
            { value: "SNC", label: "SNC" },
          ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} />
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} keyboardType="numeric" />
        </>
      )}

      {w.currentStep === 1 && (
        <>
          <SectionTitle title="Destinataire de la convocation" colors={colors} />
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.destinataire_civilite} onChange={(v) => w.set({ destinataire_civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.destinataire_nom} onChangeText={(v) => w.set({ destinataire_nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.destinataire_prenom} onChangeText={(v) => w.set({ destinataire_prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.destinataire_adresse} onChangeText={(v) => w.set({ destinataire_adresse: v })} multiline />
        </>
      )}

      {w.currentStep === 2 && (
        <>
          <Field colors={colors} label="Date de l'AGE" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
          <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
          <Field colors={colors} label="Lieu" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} />
          <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} multiline placeholder="Laisser vide pour utiliser un ordre du jour OHADA standard" />
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <SectionTitle title="Gérant signataire" colors={colors} />
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.gerant_civilite} onChange={(v) => w.set({ gerant_civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant_nom} onChangeText={(v) => w.set({ gerant_nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.gerant_prenom} onChangeText={(v) => w.set({ gerant_prenom: v })} /></View>
          </View>
          <SectionTitle title="Envoi" colors={colors} />
          <Field colors={colors} label="Lieu d'envoi" value={w.lieu_envoi} onChangeText={(v) => w.set({ lieu_envoi: v })} />
          <Field colors={colors} label="Date d'envoi" value={w.date_envoi} onChangeText={(v) => w.set({ date_envoi: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
        </>
      )}

      {w.currentStep === 4 && (
        <DownloadStep
          colors={colors}
          generatedUrl={generatedUrl}
          onDownload={download}
          onReset={() => { w.reset(); router.replace("/(app)"); }}
          title="CONVOCATION AGE"
          subtitle={w.denomination}
        />
      )}
    </WizardLayout>
  );
}
