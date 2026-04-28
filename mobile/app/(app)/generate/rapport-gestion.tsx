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

interface RapportGestionState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  exercice_clos_le: string;
  date_ago: string;
  description_activites: string;
  part_marche: string;
  position_concurrence: string;
  conjoncture_economique: string;
  moyens_techniques: string;
  moyens_humains: string;
  progres_realises: string;
  difficultes_rencontrees: string;
  chiffre_affaires: number;
  resultat_exploitation: number;
  resultat_net: number;
  analyse_financiere: string;
  evolution_tresorerie: string;
  travaux_ca: string;
  activites_rd: string;
  perspectives_avenir: string;
  plan_financement: string;
  evenements_posterieurs: string;
  changement_methode: string;
  nb_actionnaires_salaries: number;
  resolutions_proposees: string;
  date_signature: string;
  lieu_signature: string;
  signataire: string;
  currentStep: number;
  set: (data: Partial<RapportGestionState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  exercice_clos_le: "",
  date_ago: "",
  description_activites: "",
  part_marche: "",
  position_concurrence: "",
  conjoncture_economique: "",
  moyens_techniques: "",
  moyens_humains: "",
  progres_realises: "",
  difficultes_rencontrees: "",
  chiffre_affaires: 0,
  resultat_exploitation: 0,
  resultat_net: 0,
  analyse_financiere: "",
  evolution_tresorerie: "",
  travaux_ca: "",
  activites_rd: "",
  perspectives_avenir: "",
  plan_financement: "",
  evenements_posterieurs: "",
  changement_methode: "",
  nb_actionnaires_salaries: 0,
  resolutions_proposees: "",
  date_signature: "",
  lieu_signature: "Brazzaville",
  signataire: "Le Gérant",
  currentStep: 0,
};

const useStore = create<RapportGestionState>((set) => ({
  ...initialState,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Activité", "Moyens & Bilan", "Chiffres", "Perspectives", "Résolutions & Signature", "Aperçu"];

export default function RapportGestionWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/rapport-gestion", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        exercice_clos_le: w.exercice_clos_le,
        date_ago: w.date_ago,
        description_activites: w.description_activites,
        part_marche: w.part_marche,
        position_concurrence: w.position_concurrence,
        conjoncture_economique: w.conjoncture_economique,
        moyens_techniques: w.moyens_techniques,
        moyens_humains: w.moyens_humains,
        progres_realises: w.progres_realises,
        difficultes_rencontrees: w.difficultes_rencontrees,
        chiffre_affaires: w.chiffre_affaires,
        resultat_exploitation: w.resultat_exploitation,
        resultat_net: w.resultat_net,
        analyse_financiere: w.analyse_financiere,
        evolution_tresorerie: w.evolution_tresorerie,
        travaux_ca: w.travaux_ca,
        activites_rd: w.activites_rd,
        perspectives_avenir: w.perspectives_avenir,
        plan_financement: w.plan_financement,
        evenements_posterieurs: w.evenements_posterieurs,
        changement_methode: w.changement_methode,
        nb_actionnaires_salaries: w.nb_actionnaires_salaries,
        resolutions_proposees: w.resolutions_proposees,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        lieu_signature: w.lieu_signature,
        signataire: w.signataire,
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

  const isLastDataStep = w.currentStep === 5;
  const isDownloadStep = w.currentStep === 6;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl", spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "RAPPORT DE GESTION", bold: true, center: true, size: "lg" },
      { text: `Exercice clos le ${v(w.exercice_clos_le)}`, center: true, size: "md" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "Mesdames, Messieurs les associés,", spaceBefore: true },
      { text: `Conformément à l'article 138 et suivants de l'Acte Uniforme OHADA, nous avons l'honneur de vous présenter le rapport sur l'activité de notre société durant l'exercice clos le ${v(w.exercice_clos_le)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "I. ACTIVITÉ DE LA SOCIÉTÉ", bold: true, spaceBefore: true },
      { text: w.description_activites || "..." },
      { text: "", spaceBefore: true },
      { text: "II. RÉSULTATS FINANCIERS", bold: true, spaceBefore: true },
      { text: `Chiffre d'affaires : ${w.chiffre_affaires.toLocaleString("fr-FR")} FCFA` },
      { text: `Résultat d'exploitation : ${w.resultat_exploitation.toLocaleString("fr-FR")} FCFA` },
      { text: `Résultat net : ${w.resultat_net.toLocaleString("fr-FR")} FCFA (${w.resultat_net >= 0 ? "bénéfice" : "perte"})` },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: w.signataire, center: true },
    ];
    return lines;
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital, w.exercice_clos_le,
      w.description_activites, w.chiffre_affaires, w.resultat_exploitation, w.resultat_net,
      w.lieu_signature, w.date_signature, w.signataire]);

  return (
    <WizardLayout
      title="Rapport de gestion"
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
            { value: "SAS", label: "SAS" },
            { value: "SA", label: "SA" },
          ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} />
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} />
          <Field colors={colors} label="Exercice clos le" value={w.exercice_clos_le} onChangeText={(v) => w.set({ exercice_clos_le: v })} placeholder="Ex: 31 décembre 2025" />
          <Field colors={colors} label="Date AGO d'approbation" value={w.date_ago} onChangeText={(v) => w.set({ date_ago: v })} placeholder="Ex: 30 juin 2026" />
        </>
      )}

      {w.currentStep === 1 && (
        <>
          <Field colors={colors} label="Description des activités" value={w.description_activites} onChangeText={(v) => w.set({ description_activites: v })} multiline placeholder="Activités principales menées durant l'exercice" />
          <Field colors={colors} label="Part de marché (optionnel)" value={w.part_marche} onChangeText={(v) => w.set({ part_marche: v })} multiline />
          <Field colors={colors} label="Position concurrentielle (optionnel)" value={w.position_concurrence} onChangeText={(v) => w.set({ position_concurrence: v })} multiline />
          <Field colors={colors} label="Conjoncture économique (optionnel)" value={w.conjoncture_economique} onChangeText={(v) => w.set({ conjoncture_economique: v })} multiline />
        </>
      )}

      {w.currentStep === 2 && (
        <>
          <SectionTitle title="Moyens" colors={colors} />
          <Field colors={colors} label="Moyens techniques" value={w.moyens_techniques} onChangeText={(v) => w.set({ moyens_techniques: v })} multiline />
          <Field colors={colors} label="Moyens humains" value={w.moyens_humains} onChangeText={(v) => w.set({ moyens_humains: v })} multiline />
          <SectionTitle title="Bilan de l'exercice" colors={colors} />
          <Field colors={colors} label="Progrès réalisés" value={w.progres_realises} onChangeText={(v) => w.set({ progres_realises: v })} multiline />
          <Field colors={colors} label="Difficultés rencontrées" value={w.difficultes_rencontrees} onChangeText={(v) => w.set({ difficultes_rencontrees: v })} multiline />
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <Field colors={colors} label="Chiffre d'affaires (FCFA)" value={w.chiffre_affaires ? String(w.chiffre_affaires) : ""} onChangeText={(v) => w.set({ chiffre_affaires: parseInt(v) || 0 })} keyboardType="numeric" />
          <Field colors={colors} label="Résultat d'exploitation (FCFA)" value={w.resultat_exploitation ? String(w.resultat_exploitation) : ""} onChangeText={(v) => w.set({ resultat_exploitation: parseInt(v) || 0 })} keyboardType="numeric" />
          <Field colors={colors} label="Résultat net (FCFA)" value={w.resultat_net ? String(w.resultat_net) : ""} onChangeText={(v) => w.set({ resultat_net: parseInt(v) || 0 })} keyboardType="numeric" />
          <Field colors={colors} label="Analyse financière" value={w.analyse_financiere} onChangeText={(v) => w.set({ analyse_financiere: v })} multiline />
          <Field colors={colors} label="Évolution de la trésorerie" value={w.evolution_tresorerie} onChangeText={(v) => w.set({ evolution_tresorerie: v })} multiline />
        </>
      )}

      {w.currentStep === 4 && (
        <>
          <Field colors={colors} label="Travaux du Conseil d'Administration" value={w.travaux_ca} onChangeText={(v) => w.set({ travaux_ca: v })} multiline placeholder="Optionnel - SA uniquement" />
          <Field colors={colors} label="Activités de R&D" value={w.activites_rd} onChangeText={(v) => w.set({ activites_rd: v })} multiline placeholder="Optionnel" />
          <Field colors={colors} label="Perspectives d'avenir" value={w.perspectives_avenir} onChangeText={(v) => w.set({ perspectives_avenir: v })} multiline />
          <Field colors={colors} label="Plan de financement" value={w.plan_financement} onChangeText={(v) => w.set({ plan_financement: v })} multiline placeholder="Optionnel" />
          <Field colors={colors} label="Événements postérieurs à la clôture" value={w.evenements_posterieurs} onChangeText={(v) => w.set({ evenements_posterieurs: v })} multiline placeholder="Optionnel" />
          <Field colors={colors} label="Changement de méthode comptable" value={w.changement_methode} onChangeText={(v) => w.set({ changement_methode: v })} multiline placeholder="Optionnel" />
        </>
      )}

      {w.currentStep === 5 && (
        <>
          <Field colors={colors} label="Résolutions proposées à l'AGO" value={w.resolutions_proposees} onChangeText={(v) => w.set({ resolutions_proposees: v })} multiline placeholder="Liste des résolutions soumises au vote" />
          <SectionTitle title="Signature" colors={colors} />
          <Field colors={colors} label="Signataire" value={w.signataire} onChangeText={(v) => w.set({ signataire: v })} placeholder="Ex: Le Gérant" />
          <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
        </>
      )}

      {w.currentStep === 6 && (
        <>
          <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>RAPPORT DE GESTION</Text>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, textAlign: "center" }}>{w.denomination}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
          </View>
          <View style={{ alignItems: "center", paddingBottom: 24 }}>
            {generatedUrl ? (
              <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
                <Ionicons name="download-outline" size={22} color="#ffffff" />
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>Télécharger le DOCX</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: colors.success + "15", padding: 16, width: "100%", alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, marginTop: 8 }}>Document généré</Text>
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
