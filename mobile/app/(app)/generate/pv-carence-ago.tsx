import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──

interface PvCarenceAgoState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  convocation_date: string;
  convocation_mode: string;
  ordre_du_jour: string;
  total_actions: number;
  actions_presentes: number;
  quorum_requis: string;
  president_civilite: string;
  president_nom: string;
  president_prenom: string;
  president_qualite: string;
  scrutateur_civilite: string;
  scrutateur_nom: string;
  scrutateur_prenom: string;
  secretaire_civilite: string;
  secretaire_nom: string;
  secretaire_prenom: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PvCarenceAgoState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<PvCarenceAgoState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  convocation_date: "",
  convocation_mode: "lettre recommandée",
  ordre_du_jour: "",
  total_actions: 0,
  actions_presentes: 0,
  quorum_requis: "le quart",
  president_civilite: "Monsieur",
  president_nom: "",
  president_prenom: "",
  president_qualite: "Président du Conseil d'Administration",
  scrutateur_civilite: "Monsieur",
  scrutateur_nom: "",
  scrutateur_prenom: "",
  secretaire_civilite: "Monsieur",
  secretaire_nom: "",
  secretaire_prenom: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      forme_juridique: "SA",
      siege_social: "",
      capital: "",
      rccm: "",
      date_ag: "",
      heure_ag: "",
      lieu_ag: "",
      convocation_date: "",
      convocation_mode: "lettre recommandée",
      ordre_du_jour: "",
      total_actions: 0,
      actions_presentes: 0,
      quorum_requis: "le quart",
      president_civilite: "Monsieur",
      president_nom: "",
      president_prenom: "",
      president_qualite: "Président du Conseil d'Administration",
      scrutateur_civilite: "Monsieur",
      scrutateur_nom: "",
      scrutateur_prenom: "",
      secretaire_civilite: "Monsieur",
      secretaire_nom: "",
      secretaire_prenom: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Assemblée", "Bureau", "Aperçu"];

// ── Main Screen ──

export default function PvCarenceAgoWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/pv-carence-ago", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        rccm: w.rccm,
        date_ag: w.date_ag,
        heure_ag: w.heure_ag,
        lieu_ag: w.lieu_ag,
        convocation_date: w.convocation_date,
        convocation_mode: w.convocation_mode,
        ordre_du_jour: w.ordre_du_jour,
        total_actions: w.total_actions,
        actions_presentes: w.actions_presentes,
        quorum_requis: w.quorum_requis,
        president_civilite: w.president_civilite,
        president_nom: w.president_nom,
        president_prenom: w.president_prenom,
        president_qualite: w.president_qualite,
        scrutateur_civilite: w.scrutateur_civilite,
        scrutateur_nom: w.scrutateur_nom,
        scrutateur_prenom: w.scrutateur_prenom,
        secretaire_civilite: w.secretaire_civilite,
        secretaire_nom: w.secretaire_nom,
        secretaire_prenom: w.secretaire_prenom,
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

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL DE CARENCE", bold: true, center: true, size: "lg" as const },
      { text: "Assemblée Générale Ordinaire", center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `L'an deux mille vingt-six, le ${v(w.date_ag)}, à ${v(w.heure_ag)}, les actionnaires de la société ${v(w.denomination)} ont été convoqués en Assemblée Générale Ordinaire au ${v(w.lieu_ag)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Convocation effectuée le ${v(w.convocation_date)} par ${v(w.convocation_mode)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Actions présentes ou représentées : ${w.actions_presentes || "..."} sur ${w.total_actions || "..."} (quorum requis : ${v(w.quorum_requis)}).`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Le quorum n'étant pas atteint, l'assemblée ne peut valablement délibérer.", bold: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.date_ag, w.heure_ag, w.lieu_ag, w.convocation_date, w.convocation_mode,
      w.total_actions, w.actions_presentes, w.quorum_requis,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="PV de carence AGO (SA)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SA" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SA CA", label: "SA avec CA" },
              { value: "SA AG", label: "SA avec AG" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Field colors={colors} label="RCCM" value={w.rccm} onChangeText={(v) => w.set({ rccm: v })} placeholder="Ex: CG-BZV-01-2026-A12-00001" />
          </>
        )}

        {/* ── Étape 1 : Assemblée ── */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Date de l'assemblée" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
            <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Lieu de l'assemblée" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social" />
            <Field colors={colors} label="Date de convocation" value={w.convocation_date} onChangeText={(v) => w.set({ convocation_date: v })} placeholder="Ex: 10 mars 2026" />
            <Choice colors={colors} label="Mode de convocation" options={[
              { value: "lettre recommandée", label: "Lettre recommandée" },
              { value: "avis dans un journal d'annonces légales", label: "Journal d'annonces légales" },
              { value: "courrier électronique", label: "Courrier électronique" },
            ]} value={w.convocation_mode} onChange={(v) => w.set({ convocation_mode: v })} />
            <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} placeholder="Résumé de l'ordre du jour" multiline />
            <Field colors={colors} label="Total actions composant le capital" value={w.total_actions ? String(w.total_actions) : ""} onChangeText={(v) => w.set({ total_actions: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actions présentes ou représentées" value={w.actions_presentes ? String(w.actions_presentes) : ""} onChangeText={(v) => w.set({ actions_presentes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Quorum requis" value={w.quorum_requis} onChangeText={(v) => w.set({ quorum_requis: v })} placeholder="Ex: le quart" />
          </>
        )}

        {/* ── Étape 2 : Bureau ── */}
        {w.currentStep === 2 && (
          <>
            <SectionTitle title="Président de séance" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_civilite} onChange={(v) => w.set({ president_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_nom} onChangeText={(v) => w.set({ president_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president_prenom} onChangeText={(v) => w.set({ president_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Qualité" value={w.president_qualite} onChangeText={(v) => w.set({ president_qualite: v })} placeholder="Ex: Président du CA" />

            <SectionTitle title="Scrutateur" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.scrutateur_civilite} onChange={(v) => w.set({ scrutateur_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.scrutateur_nom} onChangeText={(v) => w.set({ scrutateur_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.scrutateur_prenom} onChangeText={(v) => w.set({ scrutateur_prenom: v })} /></View>
            </View>

            <SectionTitle title="Secrétaire" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.secretaire_civilite} onChange={(v) => w.set({ secretaire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.secretaire_nom} onChangeText={(v) => w.set({ secretaire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.secretaire_prenom} onChangeText={(v) => w.set({ secretaire_prenom: v })} /></View>
            </View>

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 3 : Aperçu + Téléchargement ── */}
        {w.currentStep === 3 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                PROCÈS-VERBAL DE CARENCE - AGO
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                {w.forme_juridique} au capital de {w.capital} FCFA
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                AGO convoquée le {w.date_ag} à {w.heure_ag} au {w.lieu_ag}. Actions présentes : {w.actions_presentes} / {w.total_actions}. Quorum requis : {w.quorum_requis}. Le quorum n'étant pas atteint, l'assemblée ne peut délibérer.
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Bureau : Président {w.president_civilite} {w.president_prenom} {w.president_nom}, Scrutateur {w.scrutateur_civilite} {w.scrutateur_prenom} {w.scrutateur_nom}, Secrétaire {w.secretaire_civilite} {w.secretaire_prenom} {w.secretaire_nom}.
              </Text>
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
        )}

    </WizardLayout>
  );
}
