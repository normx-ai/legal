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

interface PvAgeDissolutionState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  // Assemblée
  date_assemblee: string;
  date_assemblee_lettres: string;
  heure_assemblee: string;
  heure_assemblee_lettres: string;
  lieu_assemblee: string;
  mode_convocation: string;
  date_convocation: string;
  // Bureau
  president_assemblee: string;
  scrutateur_1: string;
  scrutateur_2: string;
  secretaire_assemblee: string;
  nombre_actionnaires: number;
  nombre_actions_presentes: number;
  nombre_actions_total: number;
  quorum_atteint: boolean;
  // Résolutions
  decisions_selectionnees: string[];
  // Détails
  motif_dissolution: string;
  date_effet_dissolution: string;
  liquidateur_civilite: string;
  liquidateur_nom: string;
  liquidateur_prenom: string;
  liquidateur_adresse: string;
  duree_mandat_liquidateur: string;
  pouvoirs_liquidateur: string;
  remuneration_liquidateur: string;
  siege_liquidation: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PvAgeDissolutionState>) => void;
  toggleDecision: (d: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<PvAgeDissolutionState, "set" | "toggleDecision" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  date_assemblee: "",
  date_assemblee_lettres: "",
  heure_assemblee: "",
  heure_assemblee_lettres: "",
  lieu_assemblee: "",
  mode_convocation: "lettre recommandée",
  date_convocation: "",
  president_assemblee: "",
  scrutateur_1: "",
  scrutateur_2: "",
  secretaire_assemblee: "",
  nombre_actionnaires: 0,
  nombre_actions_presentes: 0,
  nombre_actions_total: 0,
  quorum_atteint: true,
  decisions_selectionnees: [],
  motif_dissolution: "",
  date_effet_dissolution: "",
  liquidateur_civilite: "Monsieur",
  liquidateur_nom: "",
  liquidateur_prenom: "",
  liquidateur_adresse: "",
  duree_mandat_liquidateur: "",
  pouvoirs_liquidateur: "",
  remuneration_liquidateur: "",
  siege_liquidation: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<PvAgeDissolutionState>((set) => ({
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

const STEPS = ["Société", "Assemblée", "Bureau", "Résolutions", "Aperçu"];

const RESOLUTIONS_LIST: { key: string; label: string }[] = [
  { key: "constat_motif", label: "Constatation du motif de dissolution" },
  { key: "dissolution_anticipee", label: "Dissolution anticipée de la société" },
  { key: "nomination_liquidateur", label: "Nomination du liquidateur" },
  { key: "pouvoirs_liquidateur", label: "Pouvoirs du liquidateur" },
  { key: "remuneration_liquidateur", label: "Rémunération du liquidateur" },
  { key: "siege_liquidation", label: "Siège de la liquidation" },
  { key: "cessation_fonctions", label: "Cessation des fonctions des organes" },
  { key: "publicite", label: "Formalités de publicité" },
  { key: "pouvoirs_formalites", label: "Pouvoirs pour les formalités" },
];

// ── Main Screen ──

export default function PvAgeDissolutionWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const has = (d: string) => w.decisions_selectionnees.includes(d);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/pv-age-dissolution", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        date_assemblee: w.date_assemblee,
        date_assemblee_lettres: w.date_assemblee_lettres,
        heure_assemblee: w.heure_assemblee,
        heure_assemblee_lettres: w.heure_assemblee_lettres,
        lieu_assemblee: w.lieu_assemblee,
        mode_convocation: w.mode_convocation,
        date_convocation: w.date_convocation,
        president_assemblee: w.president_assemblee,
        scrutateur_1: w.scrutateur_1,
        scrutateur_2: w.scrutateur_2,
        secretaire_assemblee: w.secretaire_assemblee,
        nombre_actionnaires: w.nombre_actionnaires,
        nombre_actions_presentes: w.nombre_actions_presentes,
        nombre_actions_total: w.nombre_actions_total,
        quorum_atteint: w.quorum_atteint,
        decisions_selectionnees: w.decisions_selectionnees,
        motif_dissolution: w.motif_dissolution,
        date_effet_dissolution: w.date_effet_dissolution,
        liquidateur_civilite: has("nomination_liquidateur") ? w.liquidateur_civilite : undefined,
        liquidateur_nom: has("nomination_liquidateur") ? w.liquidateur_nom : undefined,
        liquidateur_prenom: has("nomination_liquidateur") ? w.liquidateur_prenom : undefined,
        liquidateur_adresse: has("nomination_liquidateur") ? w.liquidateur_adresse : undefined,
        duree_mandat_liquidateur: has("nomination_liquidateur") ? w.duree_mandat_liquidateur : undefined,
        pouvoirs_liquidateur: has("pouvoirs_liquidateur") ? w.pouvoirs_liquidateur : undefined,
        remuneration_liquidateur: has("remuneration_liquidateur") ? w.remuneration_liquidateur : undefined,
        siege_liquidation: has("siege_liquidation") ? w.siege_liquidation : undefined,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
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

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL DE L'AGE DE DISSOLUTION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `L'assemblée générale extraordinaire s'est réunie le ${v(w.date_assemblee)} à ${v(w.heure_assemblee)} au ${v(w.lieu_assemblee)}.`, spaceBefore: true },
      { text: `Président de séance : ${v(w.president_assemblee)}`, spaceBefore: true },
      { text: `Motif : ${v(w.motif_dissolution)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Résolutions :", bold: true, spaceBefore: true },
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
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.date_assemblee,
      w.heure_assemblee, w.lieu_assemblee, w.president_assemblee, w.motif_dissolution,
      w.decisions_selectionnees, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="PV AGE dissolution"
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

        {/* ── Étape 1 : Assemblée ── */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Date de l'assemblée" value={w.date_assemblee} onChangeText={(v) => w.set({ date_assemblee: v })} placeholder="Ex: 30 mars 2026" />
            <Field colors={colors} label="Date en lettres" value={w.date_assemblee_lettres} onChangeText={(v) => w.set({ date_assemblee_lettres: v })} placeholder="Ex: trente mars deux mille vingt-six" />
            <Field colors={colors} label="Heure de l'assemblée" value={w.heure_assemblee} onChangeText={(v) => w.set({ heure_assemblee: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Heure en lettres" value={w.heure_assemblee_lettres} onChangeText={(v) => w.set({ heure_assemblee_lettres: v })} placeholder="Ex: dix heures" />
            <Field colors={colors} label="Lieu de l'assemblée" value={w.lieu_assemblee} onChangeText={(v) => w.set({ lieu_assemblee: v })} placeholder="Ex: siège social" />
            <Choice colors={colors} label="Mode de convocation" options={[
              { value: "lettre recommandée", label: "Lettre recommandée" },
              { value: "acte extrajudiciaire", label: "Acte extrajudiciaire" },
              { value: "email", label: "Email" },
            ]} value={w.mode_convocation} onChange={(v) => w.set({ mode_convocation: v })} />
            <Field colors={colors} label="Date de convocation" value={w.date_convocation} onChangeText={(v) => w.set({ date_convocation: v })} placeholder="Ex: 10 mars 2026" />
          </>
        )}

        {/* ── Étape 2 : Bureau ── */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Président de séance" value={w.president_assemblee} onChangeText={(v) => w.set({ president_assemblee: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Premier scrutateur" value={w.scrutateur_1} onChangeText={(v) => w.set({ scrutateur_1: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Deuxième scrutateur" value={w.scrutateur_2} onChangeText={(v) => w.set({ scrutateur_2: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Secrétaire de séance" value={w.secretaire_assemblee} onChangeText={(v) => w.set({ secretaire_assemblee: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Nombre d'actionnaires présents/représentés" value={w.nombre_actionnaires ? String(w.nombre_actionnaires) : ""} onChangeText={(v) => w.set({ nombre_actionnaires: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actions présentes/représentées" value={w.nombre_actions_presentes ? String(w.nombre_actions_presentes) : ""} onChangeText={(v) => w.set({ nombre_actions_presentes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Total des actions" value={w.nombre_actions_total ? String(w.nombre_actions_total) : ""} onChangeText={(v) => w.set({ nombre_actions_total: parseInt(v) || 0 })} keyboardType="numeric" />
            <ToggleRow colors={colors} label="Quorum atteint" value={w.quorum_atteint} onToggle={(v) => w.set({ quorum_atteint: v })} />
          </>
        )}

        {/* ── Étape 3 : Résolutions ── */}
        {w.currentStep === 3 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Sélectionnez les résolutions de l'AGE de dissolution.
            </Text>
            {RESOLUTIONS_LIST.map((d) => (
              <ToggleRow key={d.key} colors={colors} label={d.label} value={w.decisions_selectionnees.includes(d.key)} onToggle={() => w.toggleDecision(d.key)} />
            ))}

            {has("nomination_liquidateur") && (
              <>
                <SectionTitle title="Liquidateur" colors={colors} />
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.liquidateur_civilite} onChange={(v) => w.set({ liquidateur_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.liquidateur_nom} onChangeText={(v) => w.set({ liquidateur_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.liquidateur_prenom} onChangeText={(v) => w.set({ liquidateur_prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Adresse" value={w.liquidateur_adresse} onChangeText={(v) => w.set({ liquidateur_adresse: v })} placeholder="Adresse complète" />
                <Field colors={colors} label="Durée du mandat" value={w.duree_mandat_liquidateur} onChangeText={(v) => w.set({ duree_mandat_liquidateur: v })} placeholder="Ex: jusqu'à clôture" />
              </>
            )}

            {has("pouvoirs_liquidateur") && (
              <>
                <SectionTitle title="Pouvoirs du liquidateur" colors={colors} />
                <Field colors={colors} label="Description des pouvoirs" value={w.pouvoirs_liquidateur} onChangeText={(v) => w.set({ pouvoirs_liquidateur: v })} placeholder="Décrire les pouvoirs..." multiline />
              </>
            )}

            {has("remuneration_liquidateur") && (
              <>
                <SectionTitle title="Rémunération du liquidateur" colors={colors} />
                <Field colors={colors} label="Rémunération" value={w.remuneration_liquidateur} onChangeText={(v) => w.set({ remuneration_liquidateur: v })} placeholder="Ex: gratuit, ou montant..." />
              </>
            )}

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

        {/* ── Étape 4 : Aperçu + Téléchargement ── */}
        {w.currentStep === 4 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PV AGE DE DISSOLUTION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  L'AGE s'est réunie le {w.date_assemblee} à {w.heure_assemblee} au {w.lieu_assemblee}, sous la présidence de {w.president_assemblee}.
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Motif de dissolution : {w.motif_dissolution}
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
