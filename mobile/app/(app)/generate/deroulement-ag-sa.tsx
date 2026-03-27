import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──

interface DeroulementAgSaState {
  denomination: string;
  siege_social: string;
  capital: string;
  type_ag: string;
  president_nom: string;
  president_qualite: string;
  scrutateur1_nom: string;
  scrutateur2_nom: string;
  secretaire_nom: string;
  nombre_actions_presentes: string;
  pourcentage_capital: string;
  heure_reunion: string;
  documents: string;
  ordre_du_jour: string;
  questions_diverses: string;
  heure_levee: string;
  date_reunion: string;
  currentStep: number;
  set: (data: Partial<DeroulementAgSaState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<DeroulementAgSaState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  type_ag: "ordinaire",
  president_nom: "",
  president_qualite: "pr\u00e9sident du CA",
  scrutateur1_nom: "",
  scrutateur2_nom: "",
  secretaire_nom: "",
  nombre_actions_presentes: "",
  pourcentage_capital: "",
  heure_reunion: "",
  documents: "",
  ordre_du_jour: "",
  questions_diverses: "",
  heure_levee: "",
  date_reunion: "",
  currentStep: 0,
};

const useStore = create<DeroulementAgSaState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Soci\u00e9t\u00e9", "Bureau", "Assembl\u00e9e", "Ordre du jour", "Aper\u00e7u"];

// ── Main Screen ──

export default function DeroulementAgSaWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/deroulement-ag-sa", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        type_ag: w.type_ag,
        president_nom: w.president_nom,
        president_qualite: w.president_qualite,
        scrutateur1_nom: w.scrutateur1_nom,
        scrutateur2_nom: w.scrutateur2_nom,
        secretaire_nom: w.secretaire_nom,
        nombre_actions_presentes: w.nombre_actions_presentes,
        pourcentage_capital: w.pourcentage_capital,
        heure_reunion: w.heure_reunion,
        documents: w.documents,
        ordre_du_jour: w.ordre_du_jour,
        questions_diverses: w.questions_diverses,
        heure_levee: w.heure_levee,
        date_reunion: w.date_reunion || new Date().toLocaleDateString("fr-FR"),
      });
      addDocument(data.document);
      setGeneratedUrl(data.docx_url);
      w.nextStep();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } };
      const errors = e.response?.data?.errors;
      if (errors && Array.isArray(errors)) { setError(errors.map((x) => x.message).join("\n")); }
      else { setError(e.response?.data?.error || "Erreur lors de la g\u00e9n\u00e9ration"); }
    } finally { setIsGenerating(false); }
  }, [w, addDocument]);

  const handleDownload = useCallback(() => {
    if (generatedUrl && Platform.OS === "web") {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
      window.open(`${baseUrl.replace(/\/api$/, "")}${generatedUrl}`, "_blank");
    }
  }, [generatedUrl]);

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "D\u00c9ROULEMENT DE L'ASSEMBL\u00c9E G\u00c9N\u00c9RALE", bold: true, center: true, size: "lg" as const },
      { text: "M\u00c9MO DU PR\u00c9SIDENT (SA)", bold: true, center: true },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "", spaceBefore: true },
      { text: `Type : AG ${w.type_ag}`, bold: true, spaceBefore: true },
      { text: `Pr\u00e9sident : ${v(w.president_nom)} (${w.president_qualite})` },
      { text: `Bureau : Scrutateurs : ${v(w.scrutateur1_nom)}, ${v(w.scrutateur2_nom)} | Secr\u00e9taire : ${v(w.secretaire_nom)}` },
      { text: `Ouverture : ${v(w.heure_reunion)} h`, spaceBefore: true },
      { text: `Actions pr\u00e9sentes : ${v(w.nombre_actions_presentes)} (${v(w.pourcentage_capital)}%)` },
      { text: "", spaceBefore: true },
      { text: `Cl\u00f4ture : ${v(w.heure_levee)} h` },
      { text: `Date : ${w.date_reunion || new Date().toLocaleDateString("fr-FR")}`, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.capital, w.type_ag, w.president_nom, w.president_qualite,
      w.scrutateur1_nom, w.scrutateur2_nom, w.secretaire_nom,
      w.heure_reunion, w.nombre_actions_presentes, w.pourcentage_capital,
      w.heure_levee, w.date_reunion]);

  return (
    <WizardLayout
      title="D\u00e9roulement AG SA (M\u00e9mo)"
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

        {/* -- Etape 0 : Societe -- */}
        {w.currentStep === 0 && (
          <>
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA HOLDING SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Choice colors={colors} label="Type d'assembl\u00e9e" options={[{ value: "ordinaire", label: "AG Ordinaire" }, { value: "extraordinaire", label: "AG Extraordinaire" }]} value={w.type_ag} onChange={(v) => w.set({ type_ag: v })} />
          </>
        )}

        {/* -- Etape 1 : Bureau -- */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Pr\u00e9sident de s\u00e9ance" colors={colors} />
            <Field colors={colors} label="Nom du pr\u00e9sident" value={w.president_nom} onChangeText={(v) => w.set({ president_nom: v })} />
            <Choice colors={colors} label="Qualit\u00e9" options={[
              { value: "pr\u00e9sident du CA", label: "Pr\u00e9sident du CA" },
              { value: "PDG", label: "PDG" },
              { value: "administrateur g\u00e9n\u00e9ral", label: "Administrateur g\u00e9n\u00e9ral" },
            ]} value={w.president_qualite} onChange={(v) => w.set({ president_qualite: v })} />

            <SectionTitle title="Scrutateurs" colors={colors} />
            <Field colors={colors} label="Scrutateur 1" value={w.scrutateur1_nom} onChangeText={(v) => w.set({ scrutateur1_nom: v })} placeholder="Nom du premier scrutateur" />
            <Field colors={colors} label="Scrutateur 2" value={w.scrutateur2_nom} onChangeText={(v) => w.set({ scrutateur2_nom: v })} placeholder="Nom du second scrutateur" />

            <SectionTitle title="Secr\u00e9taire" colors={colors} />
            <Field colors={colors} label="Secr\u00e9taire de s\u00e9ance" value={w.secretaire_nom} onChangeText={(v) => w.set({ secretaire_nom: v })} placeholder="Nom du secr\u00e9taire" />
          </>
        )}

        {/* -- Etape 2 : Assemblee -- */}
        {w.currentStep === 2 && (
          <>
            <SectionTitle title="S\u00e9ance" colors={colors} />
            <Field colors={colors} label="Heure d'ouverture" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 10" />
            <Field colors={colors} label="Nombre d'actions pr\u00e9sentes" value={w.nombre_actions_presentes} onChangeText={(v) => w.set({ nombre_actions_presentes: v })} placeholder="Ex: 5 000" />
            <Field colors={colors} label="Pourcentage du capital (%)" value={w.pourcentage_capital} onChangeText={(v) => w.set({ pourcentage_capital: v })} placeholder="Ex: 75" />
            <Field colors={colors} label="Heure de lev\u00e9e de s\u00e9ance" value={w.heure_levee} onChangeText={(v) => w.set({ heure_levee: v })} placeholder="Ex: 13" />
            <Field colors={colors} label="Date de la r\u00e9union" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

            <SectionTitle title="Documents" colors={colors} />
            <Field colors={colors} label="Documents d\u00e9pos\u00e9s sur le bureau" value={w.documents} onChangeText={(v) => w.set({ documents: v })} multiline placeholder="- Rapport du CA\n- \u00c9tats financiers\n- Rapport du CAC\n..." />
          </>
        )}

        {/* -- Etape 3 : Ordre du jour -- */}
        {w.currentStep === 3 && (
          <>
            <SectionTitle title="R\u00e9solutions \u00e0 voter" colors={colors} />
            <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} multiline placeholder="1\u00e8re r\u00e9solution : Approbation des comptes\n2\u00e8me r\u00e9solution : Affectation du r\u00e9sultat\n..." />

            <SectionTitle title="Questions diverses" colors={colors} />
            <Field colors={colors} label="Questions diverses" value={w.questions_diverses} onChangeText={(v) => w.set({ questions_diverses: v })} multiline placeholder="- Point divers 1\n- Point divers 2\n..." />
          </>
        )}

        {/* -- Etape 4 : Apercu + Telechargement -- */}
        {w.currentStep === 4 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                D\u00c9ROULEMENT DE L'ASSEMBL\u00c9E G\u00c9N\u00c9RALE
              </Text>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                M\u00c9MO DU PR\u00c9SIDENT (SA)
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                SA au capital de {w.capital} FCFA
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Type d'AG</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>AG {w.type_ag}</Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Bureau</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                Pr\u00e9sident : {w.president_nom} ({w.president_qualite})
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                Scrutateurs : {w.scrutateur1_nom}, {w.scrutateur2_nom}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Secr\u00e9taire : {w.secretaire_nom}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>S\u00e9ance</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                Ouverture : {w.heure_reunion}h - Cl\u00f4ture : {w.heure_levee}h
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Actions pr\u00e9sentes : {w.nombre_actions_presentes} ({w.pourcentage_capital}%)
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                Date : {w.date_reunion || new Date().toLocaleDateString("fr-FR")}
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
        )}

    </WizardLayout>
  );
}
