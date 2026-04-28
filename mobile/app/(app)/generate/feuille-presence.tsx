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

interface AssocieRow {
  civilite: string;
  nom: string;
  prenom: string;
  parts: number;
  mandataire_nom?: string;
}

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
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const emptyAssocie = (): AssocieRow => ({ civilite: "Monsieur", nom: "", prenom: "", parts: 0 });

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
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Assemblée", "Présents", "Représentés/Absents", "Bureau", "Aperçu"];

function AssocieFields({ list, onChange, onAdd, onRemove, withMandataire, colors }: {
  list: AssocieRow[];
  onChange: (i: number, patch: Partial<AssocieRow>) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  withMandataire?: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <>
      {list.map((a, i) => (
        <View key={i} style={{ borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: colors.text }}>Associé {i + 1}</Text>
            {list.length > 1 && (
              <TouchableOpacity onPress={() => onRemove(i)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => onChange(i, { civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => onChange(i, { nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => onChange(i, { prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Nombre de parts" value={a.parts ? String(a.parts) : ""} onChangeText={(v) => onChange(i, { parts: parseInt(v) || 0 })} keyboardType="numeric" />
          {withMandataire && (
            <Field colors={colors} label="Représenté par" value={a.mandataire_nom || ""} onChangeText={(v) => onChange(i, { mandataire_nom: v })} placeholder="Nom du mandataire" />
          )}
        </View>
      ))}
      <TouchableOpacity onPress={onAdd} style={{ paddingVertical: 10, alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary, borderRadius: 6 }}>
        <Text style={{ fontFamily: fonts.medium, color: colors.primary }}>+ Ajouter un associé</Text>
      </TouchableOpacity>
    </>
  );
}

export default function FeuillePresenceWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateList = (key: "associes_presents" | "associes_representes" | "associes_absents") =>
    (i: number, patch: Partial<AssocieRow>) => {
      const list = [...w[key]];
      list[i] = { ...list[i], ...patch };
      w.set({ [key]: list } as Partial<FeuillePresenceState>);
    };

  const addRow = (key: "associes_presents" | "associes_representes" | "associes_absents") => () => {
    w.set({ [key]: [...w[key], emptyAssocie()] } as Partial<FeuillePresenceState>);
  };

  const removeRow = (key: "associes_presents" | "associes_representes" | "associes_absents") => (i: number) => {
    w.set({ [key]: w[key].filter((_, idx) => idx !== i) } as Partial<FeuillePresenceState>);
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/feuille-presence", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
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
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
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
          <AssocieFields list={w.associes_presents} onChange={updateList("associes_presents")} onAdd={addRow("associes_presents")} onRemove={removeRow("associes_presents")} colors={colors} />
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <SectionTitle title="Associés représentés" colors={colors} />
          <AssocieFields list={w.associes_representes} onChange={updateList("associes_representes")} onAdd={addRow("associes_representes")} onRemove={removeRow("associes_representes")} withMandataire colors={colors} />
          <SectionTitle title="Associés absents" colors={colors} />
          <AssocieFields list={w.associes_absents} onChange={updateList("associes_absents")} onAdd={addRow("associes_absents")} onRemove={removeRow("associes_absents")} colors={colors} />
        </>
      )}

      {w.currentStep === 4 && (
        <>
          <Field colors={colors} label="Président de séance" value={w.president_seance_nom} onChangeText={(v) => w.set({ president_seance_nom: v })} />
          <Field colors={colors} label="Secrétaire (optionnel)" value={w.secretaire_nom} onChangeText={(v) => w.set({ secretaire_nom: v })} />
        </>
      )}

      {w.currentStep === 5 && (
        <>
          <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>FEUILLE DE PRÉSENCE</Text>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>{w.denomination}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>AG {typeAgLabel} du {w.date_ag}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center" }}>··· Document complet dans le fichier DOCX ···</Text>
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
