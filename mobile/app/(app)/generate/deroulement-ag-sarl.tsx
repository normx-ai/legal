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

interface DeroulementAgSarlState {
  denomination: string;
  siege_social: string;
  capital: string;
  type_ag: string;
  president_nom: string;
  president_civilite: string;
  president_qualite: string;
  heure_reunion: string;
  nombre_parts_presentes: string;
  pourcentage_capital: string;
  quorum_type: string;
  documents_deposes: string;
  documents_15_jours: string;
  ordre_du_jour: string;
  questions_diverses: string;
  heure_levee: string;
  date_reunion: string;
  currentStep: number;
  set: (data: Partial<DeroulementAgSarlState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<DeroulementAgSarlState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  type_ag: "ordinaire",
  president_nom: "",
  president_civilite: "Monsieur",
  president_qualite: "G\u00e9rant",
  heure_reunion: "",
  nombre_parts_presentes: "",
  pourcentage_capital: "",
  quorum_type: "50% + 1 pour AGO",
  documents_deposes: "",
  documents_15_jours: "",
  ordre_du_jour: "",
  questions_diverses: "",
  heure_levee: "",
  date_reunion: "",
  currentStep: 0,
};

const useStore = create<DeroulementAgSarlState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Soci\u00e9t\u00e9", "Assembl\u00e9e", "Documents", "Ordre du jour", "Aper\u00e7u"];

// ── Main Screen ──

export default function DeroulementAgSarlWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/deroulement-ag-sarl", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        type_ag: w.type_ag,
        president_nom: w.president_nom,
        president_civilite: w.president_civilite,
        president_qualite: w.president_qualite,
        heure_reunion: w.heure_reunion,
        nombre_parts_presentes: w.nombre_parts_presentes,
        pourcentage_capital: w.pourcentage_capital,
        quorum_type: w.quorum_type,
        documents_deposes: w.documents_deposes,
        documents_15_jours: w.documents_15_jours,
        ordre_du_jour: w.ordre_du_jour,
        questions_diverses: w.questions_diverses,
        heure_levee: w.heure_levee,
        date_reunion: w.date_reunion || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SARL au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "D\u00c9ROULEMENT DE L'ASSEMBL\u00c9E G\u00c9N\u00c9RALE", bold: true, center: true, size: "lg" as const },
      { text: "M\u00c9MO DU PR\u00c9SIDENT", bold: true, center: true },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "", spaceBefore: true },
      { text: `Type : AG ${w.type_ag}`, bold: true, spaceBefore: true },
      { text: `Pr\u00e9sident : ${w.president_civilite} ${v(w.president_nom)} (${w.president_qualite})` },
      { text: `Ouverture : ${v(w.heure_reunion)} h`, spaceBefore: true },
      { text: `Parts pr\u00e9sentes : ${v(w.nombre_parts_presentes)} (${v(w.pourcentage_capital)}%)` },
      { text: `Quorum : ${w.quorum_type}` },
      { text: "", spaceBefore: true },
      { text: `Cl\u00f4ture : ${v(w.heure_levee)} h` },
      { text: `Date : ${w.date_reunion || new Date().toLocaleDateString("fr-FR")}`, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.capital, w.type_ag, w.president_civilite, w.president_nom,
      w.president_qualite, w.heure_reunion, w.nombre_parts_presentes, w.pourcentage_capital,
      w.quorum_type, w.heure_levee, w.date_reunion]);

  return (
    <WizardLayout
      title="D\u00e9roulement AG SARL (M\u00e9mo)"
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
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SARL" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
            <Choice colors={colors} label="Type d'assembl\u00e9e" options={[{ value: "ordinaire", label: "AG Ordinaire" }, { value: "extraordinaire", label: "AG Extraordinaire" }]} value={w.type_ag} onChange={(v) => w.set({ type_ag: v, quorum_type: v === "ordinaire" ? "50% + 1 pour AGO" : "3/4 pour AGE" })} />
          </>
        )}

        {/* -- Etape 1 : Assemblee -- */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Pr\u00e9sident de s\u00e9ance" colors={colors} />
            <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_civilite} onChange={(v) => w.set({ president_civilite: v })} />
            <Field colors={colors} label="Nom du pr\u00e9sident" value={w.president_nom} onChangeText={(v) => w.set({ president_nom: v })} />
            <Choice colors={colors} label="Qualit\u00e9" options={[{ value: "G\u00e9rant", label: "G\u00e9rant" }, { value: "associ\u00e9 poss\u00e9dant le plus grand nombre de parts", label: "Associ\u00e9 majoritaire" }]} value={w.president_qualite} onChange={(v) => w.set({ president_qualite: v })} />

            <SectionTitle title="S\u00e9ance" colors={colors} />
            <Field colors={colors} label="Heure d'ouverture" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 10" />
            <Field colors={colors} label="Nombre de parts pr\u00e9sentes" value={w.nombre_parts_presentes} onChangeText={(v) => w.set({ nombre_parts_presentes: v })} placeholder="Ex: 500" />
            <Field colors={colors} label="Pourcentage du capital (%)" value={w.pourcentage_capital} onChangeText={(v) => w.set({ pourcentage_capital: v })} placeholder="Ex: 75" />
            <Field colors={colors} label="Heure de lev\u00e9e de s\u00e9ance" value={w.heure_levee} onChangeText={(v) => w.set({ heure_levee: v })} placeholder="Ex: 13" />
            <Field colors={colors} label="Date de la r\u00e9union" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* -- Etape 2 : Documents -- */}
        {w.currentStep === 2 && (
          <>
            <SectionTitle title="Documents d\u00e9pos\u00e9s sur le bureau" colors={colors} />
            <Field colors={colors} label="Documents d\u00e9pos\u00e9s" value={w.documents_deposes} onChangeText={(v) => w.set({ documents_deposes: v })} multiline placeholder="- Rapport de gestion\n- \u00c9tats financiers\n- ..." />

            <SectionTitle title="Documents mis \u00e0 disposition (15 jours)" colors={colors} />
            <Field colors={colors} label="Documents tenus \u00e0 disposition" value={w.documents_15_jours} onChangeText={(v) => w.set({ documents_15_jours: v })} multiline placeholder="- Rapport de gestion\n- Inventaire\n- ..." />
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
                M\u00c9MO DU PR\u00c9SIDENT
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                SARL au capital de {w.capital} FCFA
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Type d'AG</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>AG {w.type_ag}</Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Pr\u00e9sident</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.president_civilite} {w.president_nom} ({w.president_qualite})
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>S\u00e9ance</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                Ouverture : {w.heure_reunion}h - Cl\u00f4ture : {w.heure_levee}h
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Parts pr\u00e9sentes : {w.nombre_parts_presentes} ({w.pourcentage_capital}%)
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
