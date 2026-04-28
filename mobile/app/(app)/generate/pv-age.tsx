import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts } from "@/lib/theme/fonts";
import { Field, Choice, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { AssocieCard } from "@/components/wizard/AssocieCard";
import { AddButton } from "@/components/wizard/AddButton";
import { DownloadStep } from "@/components/wizard/DownloadStep";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { parseAmount } from "@/lib/utils/parseAmount";
import { type AssocieRow, type ResolutionRow, type PresidentSeance, emptyAssocie, emptyResolution, emptyPresident } from "@/types/legal";
import { create } from "zustand";

type AssocieListKey = "associes_presents" | "associes_representes" | "associes_absents";

interface PvAgeState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  associes_presents: AssocieRow[];
  associes_representes: AssocieRow[];
  associes_absents: AssocieRow[];
  president_seance: PresidentSeance;
  ordre_du_jour: string;
  resolutions: ResolutionRow[];
  heure_levee_seance: string;
  date_signature: string;
  lieu_signature: string;
  currentStep: number;
  set: (data: Partial<PvAgeState>) => void;
  setList: (key: AssocieListKey, list: AssocieRow[]) => void;
  setResolutions: (list: ResolutionRow[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  associes_presents: [emptyAssocie()],
  associes_representes: [] as AssocieRow[],
  associes_absents: [] as AssocieRow[],
  president_seance: emptyPresident(),
  ordre_du_jour: "",
  resolutions: [emptyResolution()],
  heure_levee_seance: "",
  date_signature: "",
  lieu_signature: "Brazzaville",
  currentStep: 0,
};

const useStore = create<PvAgeState>((set) => ({
  ...initialState,
  set: (data) => set((s) => ({ ...s, ...data })),
  setList: (key, list) => set((s) => ({ ...s, [key]: list })),
  setResolutions: (list) => set({ resolutions: list }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Assemblée", "Présents", "Représentés/Absents", "Bureau & ODJ", "Résolutions", "Clôture", "Aperçu"];

export default function PvAgeWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate, download } = useDocumentGeneration("/generate/pv-age", w.nextStep);

  const updateAssocies = (key: AssocieListKey) => (i: number, patch: Partial<AssocieRow>) => {
    const list = [...w[key]];
    list[i] = { ...list[i], ...patch };
    w.setList(key, list);
  };
  const addAssocie = (key: AssocieListKey) => () => w.setList(key, [...w[key], emptyAssocie()]);
  const removeAssocie = (key: AssocieListKey) => (i: number) => w.setList(key, w[key].filter((_, idx) => idx !== i));

  const updateResolution = (i: number, patch: Partial<ResolutionRow>) => {
    const list = [...w.resolutions];
    list[i] = { ...list[i], ...patch };
    w.setResolutions(list);
  };

  const handleGenerate = () => generate({
    denomination: w.denomination,
    forme_juridique: w.forme_juridique,
    siege_social: w.siege_social,
    capital: parseAmount(w.capital),
    date_ag: w.date_ag,
    heure_ag: w.heure_ag,
    lieu_ag: w.lieu_ag,
    associes_presents: w.associes_presents,
    associes_representes: w.associes_representes,
    associes_absents: w.associes_absents,
    president_seance: w.president_seance,
    ordre_du_jour: w.ordre_du_jour,
    resolutions: w.resolutions,
    heure_levee_seance: w.heure_levee_seance,
    date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
    lieu_signature: w.lieu_signature,
  });

  const isLastDataStep = w.currentStep === 6;
  const isDownloadStep = w.currentStep === 7;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl", spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "lg" },
      { text: "Assemblée Générale Extraordinaire", center: true, size: "md" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Le ${v(w.date_ag)} à ${v(w.heure_ag)}, les associés de la société ${v(w.denomination)} se sont réunis en assemblée générale extraordinaire à ${v(w.lieu_ag)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Ordre du jour :", bold: true, spaceBefore: true },
      { text: w.ordre_du_jour || "..." },
      { text: "", spaceBefore: true },
      { text: `Résolutions : ${w.resolutions.length}`, italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines;
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.date_ag, w.heure_ag, w.lieu_ag, w.ordre_du_jour, w.resolutions]);

  return (
    <WizardLayout
      title="PV AGE (SARL)"
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
          <Field colors={colors} label="Date" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
          <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
          <Field colors={colors} label="Lieu" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social" />
        </>
      )}

      {w.currentStep === 2 && (
        <>
          <SectionTitle title="Associés présents" colors={colors} />
          {w.associes_presents.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_presents")} onRemove={removeAssocie("associes_presents")} canRemove={w.associes_presents.length > 1} colors={colors} />
          ))}
          <AddButton label="+ Ajouter un associé" onPress={addAssocie("associes_presents")} colors={colors} />
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <SectionTitle title="Associés représentés" colors={colors} />
          {w.associes_representes.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_representes")} onRemove={removeAssocie("associes_representes")} canRemove withMandataire colors={colors} />
          ))}
          <AddButton label="+ Ajouter un représenté" onPress={addAssocie("associes_representes")} colors={colors} />
          <SectionTitle title="Associés absents" colors={colors} />
          {w.associes_absents.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_absents")} onRemove={removeAssocie("associes_absents")} canRemove colors={colors} />
          ))}
          <AddButton label="+ Ajouter un absent" onPress={addAssocie("associes_absents")} colors={colors} />
        </>
      )}

      {w.currentStep === 4 && (
        <>
          <SectionTitle title="Président de séance" colors={colors} />
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_seance.civilite} onChange={(v) => w.set({ president_seance: { ...w.president_seance, civilite: v } })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_seance.nom} onChangeText={(v) => w.set({ president_seance: { ...w.president_seance, nom: v } })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president_seance.prenom} onChangeText={(v) => w.set({ president_seance: { ...w.president_seance, prenom: v } })} /></View>
          </View>
          <SectionTitle title="Ordre du jour" colors={colors} />
          <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} multiline placeholder="Liste des points à délibérer" />
        </>
      )}

      {w.currentStep === 5 && (
        <>
          <SectionTitle title="Résolutions" colors={colors} />
          {w.resolutions.map((r, i) => (
            <View key={i} style={{ borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 13 }}>Résolution {i + 1}</Text>
                {w.resolutions.length > 1 && (
                  <TouchableOpacity onPress={() => w.setResolutions(w.resolutions.filter((_, idx) => idx !== i))}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
              <Field colors={colors} label="Titre" value={r.titre} onChangeText={(v) => updateResolution(i, { titre: v })} />
              <Field colors={colors} label="Texte" value={r.texte} onChangeText={(v) => updateResolution(i, { texte: v })} multiline />
              <Choice colors={colors} label="Statut" options={[{ value: "true", label: "Adoptée" }, { value: "false", label: "Rejetée" }]} value={r.adoptee ? "true" : "false"} onChange={(v) => updateResolution(i, { adoptee: v === "true" })} />
            </View>
          ))}
          <AddButton label="+ Ajouter une résolution" onPress={() => w.setResolutions([...w.resolutions, emptyResolution()])} colors={colors} />
        </>
      )}

      {w.currentStep === 6 && (
        <>
          <Field colors={colors} label="Heure de levée de séance" value={w.heure_levee_seance} onChangeText={(v) => w.set({ heure_levee_seance: v })} placeholder="Ex: 12h00" />
          <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
        </>
      )}

      {w.currentStep === 7 && (
        <DownloadStep
          colors={colors}
          generatedUrl={generatedUrl}
          onDownload={download}
          onReset={() => { w.reset(); router.replace("/(app)"); }}
          title="PROCÈS-VERBAL"
          subtitle={w.denomination}
        />
      )}
    </WizardLayout>
  );
}
