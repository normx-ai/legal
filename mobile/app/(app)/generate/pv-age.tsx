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
  adresse: string;
  parts: number;
  mandataire_nom?: string;
}

interface ResolutionRow {
  titre: string;
  texte: string;
  adoptee: boolean;
}

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
  president_seance: { civilite: string; nom: string; prenom: string };
  ordre_du_jour: string;
  resolutions: ResolutionRow[];
  heure_levee_seance: string;
  date_signature: string;
  lieu_signature: string;
  currentStep: number;
  set: (data: Partial<PvAgeState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const emptyAssocie = (): AssocieRow => ({ civilite: "Monsieur", nom: "", prenom: "", adresse: "", parts: 0 });
const emptyResolution = (): ResolutionRow => ({ titre: "", texte: "", adoptee: true });

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
  president_seance: { civilite: "Monsieur", nom: "", prenom: "" },
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
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Assemblée", "Présents", "Représentés/Absents", "Bureau & ODJ", "Résolutions", "Clôture", "Aperçu"];

export default function PvAgeWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateAssocies = (key: "associes_presents" | "associes_representes" | "associes_absents") =>
    (i: number, patch: Partial<AssocieRow>) => {
      const list = [...w[key]];
      list[i] = { ...list[i], ...patch };
      w.set({ [key]: list } as Partial<PvAgeState>);
    };

  const addAssocie = (key: "associes_presents" | "associes_representes" | "associes_absents") => () => {
    w.set({ [key]: [...w[key], emptyAssocie()] } as Partial<PvAgeState>);
  };

  const removeAssocie = (key: "associes_presents" | "associes_representes" | "associes_absents") => (i: number) => {
    w.set({ [key]: w[key].filter((_, idx) => idx !== i) } as Partial<PvAgeState>);
  };

  const updateResolution = (i: number, patch: Partial<ResolutionRow>) => {
    const list = [...w.resolutions];
    list[i] = { ...list[i], ...patch };
    w.set({ resolutions: list });
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/pv-age", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
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
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} />
        </>
      )}

      {w.currentStep === 1 && (
        <>
          <Field colors={colors} label="Date" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
          <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
          <Field colors={colors} label="Lieu" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social" />
        </>
      )}

      {(w.currentStep === 2 || w.currentStep === 3) && (
        <>
          {w.currentStep === 2 && (
            <>
              <SectionTitle title="Associés présents" colors={colors} />
              {w.associes_presents.map((a, i) => (
                <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_presents")} onRemove={removeAssocie("associes_presents")} canRemove={w.associes_presents.length > 1} colors={colors} />
              ))}
              <TouchableOpacity onPress={addAssocie("associes_presents")} style={addBtn(colors)}><Text style={{ color: colors.primary }}>+ Ajouter un associé</Text></TouchableOpacity>
            </>
          )}
          {w.currentStep === 3 && (
            <>
              <SectionTitle title="Associés représentés" colors={colors} />
              {w.associes_representes.map((a, i) => (
                <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_representes")} onRemove={removeAssocie("associes_representes")} canRemove withMandataire colors={colors} />
              ))}
              <TouchableOpacity onPress={addAssocie("associes_representes")} style={addBtn(colors)}><Text style={{ color: colors.primary }}>+ Ajouter un représenté</Text></TouchableOpacity>
              <SectionTitle title="Associés absents" colors={colors} />
              {w.associes_absents.map((a, i) => (
                <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_absents")} onRemove={removeAssocie("associes_absents")} canRemove colors={colors} />
              ))}
              <TouchableOpacity onPress={addAssocie("associes_absents")} style={addBtn(colors)}><Text style={{ color: colors.primary }}>+ Ajouter un absent</Text></TouchableOpacity>
            </>
          )}
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
                  <TouchableOpacity onPress={() => w.set({ resolutions: w.resolutions.filter((_, idx) => idx !== i) })}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
              <Field colors={colors} label="Titre" value={r.titre} onChangeText={(v) => updateResolution(i, { titre: v })} />
              <Field colors={colors} label="Texte" value={r.texte} onChangeText={(v) => updateResolution(i, { texte: v })} multiline />
              <Choice colors={colors} label="Statut" options={[{ value: "true", label: "Adoptée" }, { value: "false", label: "Rejetée" }]} value={r.adoptee ? "true" : "false"} onChange={(v) => updateResolution(i, { adoptee: v === "true" })} />
            </View>
          ))}
          <TouchableOpacity onPress={() => w.set({ resolutions: [...w.resolutions, emptyResolution()] })} style={addBtn(colors)}>
            <Text style={{ color: colors.primary }}>+ Ajouter une résolution</Text>
          </TouchableOpacity>
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
        <DownloadStep colors={colors} generatedUrl={generatedUrl} onDownload={handleDownload} onReset={() => { w.reset(); router.replace("/(app)"); }} title={w.denomination} />
      )}
    </WizardLayout>
  );
}

function AssocieCard({ a, i, onChange, onRemove, canRemove, withMandataire, colors }: {
  a: AssocieRow;
  i: number;
  onChange: (i: number, patch: Partial<AssocieRow>) => void;
  onRemove: (i: number) => void;
  canRemove: boolean;
  withMandataire?: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontSize: 13 }}>Associé {i + 1}</Text>
        {canRemove && (
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
      <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => onChange(i, { adresse: v })} />
      <Field colors={colors} label="Nombre de parts" value={a.parts ? String(a.parts) : ""} onChangeText={(v) => onChange(i, { parts: parseInt(v) || 0 })} keyboardType="numeric" />
      {withMandataire && (
        <Field colors={colors} label="Mandataire" value={a.mandataire_nom || ""} onChangeText={(v) => onChange(i, { mandataire_nom: v })} />
      )}
    </View>
  );
}

function DownloadStep({ colors, generatedUrl, onDownload, onReset, title }: {
  colors: ReturnType<typeof useTheme>["colors"];
  generatedUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
  title: string;
}) {
  return (
    <>
      <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>PROCÈS-VERBAL</Text>
        <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, textAlign: "center" }}>{title}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
      </View>
      <View style={{ alignItems: "center", paddingBottom: 24 }}>
        {generatedUrl ? (
          <TouchableOpacity onPress={onDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
            <Ionicons name="download-outline" size={22} color="#ffffff" />
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>Télécharger le DOCX</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: colors.success + "15", padding: 16, width: "100%", alignItems: "center" }}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, marginTop: 8 }}>Document généré</Text>
          </View>
        )}
        <TouchableOpacity onPress={onReset} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function addBtn(colors: ReturnType<typeof useTheme>["colors"]) {
  return { paddingVertical: 10, alignItems: "center" as const, borderWidth: 1, borderStyle: "dashed" as const, borderColor: colors.primary, borderRadius: 6 };
}
