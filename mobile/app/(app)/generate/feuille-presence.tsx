import React, { useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme/ThemeContext";
import { Field, Choice, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { AssocieCard } from "@/components/wizard/AssocieCard";
import { AddButton } from "@/components/wizard/AddButton";
import { DownloadStep } from "@/components/wizard/DownloadStep";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { parseAmount } from "@/lib/utils/parseAmount";
import { type AssocieRow, emptyAssocie } from "@/types/legal";
import { create } from "zustand";

type AssocieListKey = "associes_presents" | "associes_representes" | "associes_absents";

interface FeuillePresenceState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  type_ag: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  total_parts_capital: number;
  associes_presents: AssocieRow[];
  associes_representes: AssocieRow[];
  associes_absents: AssocieRow[];
  president_seance_nom: string;
  secretaire_nom: string;
  currentStep: number;
  set: (data: Partial<FeuillePresenceState>) => void;
  setList: (key: AssocieListKey, list: AssocieRow[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  type_ag: "ordinaire",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  total_parts_capital: 0,
  associes_presents: [emptyAssocie()],
  associes_representes: [] as AssocieRow[],
  associes_absents: [] as AssocieRow[],
  president_seance_nom: "",
  secretaire_nom: "",
  currentStep: 0,
};

const useStore = create<FeuillePresenceState>((set) => ({
  ...initialState,
  set: (data) => set((s) => ({ ...s, ...data })),
  setList: (key, list) => set((s) => ({ ...s, [key]: list })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Assemblée", "Présents", "Représentés/Absents", "Bureau", "Aperçu"];

export default function FeuillePresenceWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate, download } = useDocumentGeneration("/generate/feuille-presence", w.nextStep);

  const updateList = (key: AssocieListKey) => (i: number, patch: Partial<AssocieRow>) => {
    const list = [...w[key]];
    list[i] = { ...list[i], ...patch };
    w.setList(key, list);
  };
  const addRow = (key: AssocieListKey) => () => w.setList(key, [...w[key], emptyAssocie()]);
  const removeRow = (key: AssocieListKey) => (i: number) => w.setList(key, w[key].filter((_, idx) => idx !== i));

  const handleGenerate = () => generate({
    denomination: w.denomination,
    forme_juridique: w.forme_juridique,
    siege_social: w.siege_social,
    capital: parseAmount(w.capital),
    type_ag: w.type_ag,
    date_ag: w.date_ag,
    heure_ag: w.heure_ag,
    lieu_ag: w.lieu_ag,
    total_parts_capital: w.total_parts_capital,
    associes_presents: w.associes_presents,
    associes_representes: w.associes_representes,
    associes_absents: w.associes_absents,
    president_seance_nom: w.president_seance_nom,
    secretaire_nom: w.secretaire_nom,
  });

  const isLastDataStep = w.currentStep === 4;
  const isDownloadStep = w.currentStep === 5;
  const typeAgLabel = w.type_ag === "extraordinaire" ? "Extraordinaire" : "Ordinaire";

  const totalPresentes = w.associes_presents.reduce((s, a) => s + (a.parts || 0), 0);
  const totalRepresentees = w.associes_representes.reduce((s, a) => s + (a.parts || 0), 0);

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl", spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "FEUILLE DE PRÉSENCE", bold: true, center: true, size: "lg" },
      { text: `Assemblée Générale ${typeAgLabel} du ${v(w.date_ag)}`, center: true, size: "md" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Présents : ${w.associes_presents.length} associé(s) — ${totalPresentes} parts`, spaceBefore: true },
      { text: `Représentés : ${w.associes_representes.length} associé(s) — ${totalRepresentees} parts` },
      { text: `Absents : ${w.associes_absents.length} associé(s)` },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines;
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.date_ag, typeAgLabel, w.associes_presents, w.associes_representes, w.associes_absents,
      totalPresentes, totalRepresentees]);

  return (
    <WizardLayout
      title="Feuille de présence AG (SARL)"
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
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} />
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" keyboardType="numeric" />
          <Field colors={colors} label="Total parts au capital" value={w.total_parts_capital ? String(w.total_parts_capital) : ""} onChangeText={(v) => w.set({ total_parts_capital: parseInt(v) || 0 })} keyboardType="numeric" />
        </>
      )}

      {w.currentStep === 1 && (
        <>
          <Choice colors={colors} label="Type d'assemblée" options={[
            { value: "ordinaire", label: "Ordinaire (AGO)" },
            { value: "extraordinaire", label: "Extraordinaire (AGE)" },
          ]} value={w.type_ag} onChange={(v) => w.set({ type_ag: v })} />
          <Field colors={colors} label="Date" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
          <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
          <Field colors={colors} label="Lieu" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social" />
        </>
      )}

      {w.currentStep === 2 && (
        <>
          <SectionTitle title="Associés présents" colors={colors} />
          {w.associes_presents.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateList("associes_presents")} onRemove={removeRow("associes_presents")} canRemove={w.associes_presents.length > 1} colors={colors} />
          ))}
          <AddButton label="+ Ajouter un associé" onPress={addRow("associes_presents")} colors={colors} />
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <SectionTitle title="Associés représentés" colors={colors} />
          {w.associes_representes.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateList("associes_representes")} onRemove={removeRow("associes_representes")} canRemove withMandataire colors={colors} />
          ))}
          <AddButton label="+ Ajouter un représenté" onPress={addRow("associes_representes")} colors={colors} />
          <SectionTitle title="Associés absents" colors={colors} />
          {w.associes_absents.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateList("associes_absents")} onRemove={removeRow("associes_absents")} canRemove colors={colors} />
          ))}
          <AddButton label="+ Ajouter un absent" onPress={addRow("associes_absents")} colors={colors} />
        </>
      )}

      {w.currentStep === 4 && (
        <>
          <Field colors={colors} label="Président de séance" value={w.president_seance_nom} onChangeText={(v) => w.set({ president_seance_nom: v })} />
          <Field colors={colors} label="Secrétaire (optionnel)" value={w.secretaire_nom} onChangeText={(v) => w.set({ secretaire_nom: v })} />
        </>
      )}

      {w.currentStep === 5 && (
        <DownloadStep
          colors={colors}
          generatedUrl={generatedUrl}
          onDownload={download}
          onReset={() => { w.reset(); router.replace("/(app)"); }}
          title="FEUILLE DE PRÉSENCE"
          subtitle={`${w.denomination} — AG ${typeAgLabel} du ${w.date_ag}`}
        />
      )}
    </WizardLayout>
  );
}
