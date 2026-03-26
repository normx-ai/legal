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

interface Actionnaire {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
  nombre_actions: number;
  nombre_voix: number;
  mandataire_nom: string;
}

interface FeuillePresenceState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  type_ag: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  ordre_du_jour: string;
  actionnaires: Actionnaire[];
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<FeuillePresenceState>) => void;
  setActionnaire: (i: number, data: Partial<Actionnaire>) => void;
  addActionnaire: () => void;
  removeActionnaire: (i: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const defaultActionnaire: Actionnaire = { civilite: "Monsieur", nom: "", prenom: "", adresse: "", nombre_actions: 0, nombre_voix: 0, mandataire_nom: "" };

const useStore = create<FeuillePresenceState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  type_ag: "AGO",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  ordre_du_jour: "",
  actionnaires: [{ ...defaultActionnaire }],
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  setActionnaire: (i, data) =>
    set((s) => {
      const actionnaires = [...s.actionnaires];
      actionnaires[i] = { ...actionnaires[i], ...data };
      return { actionnaires };
    }),
  addActionnaire: () =>
    set((s) => ({
      actionnaires: [...s.actionnaires, { ...defaultActionnaire }],
    })),
  removeActionnaire: (i) =>
    set((s) => ({
      actionnaires: s.actionnaires.filter((_, idx) => idx !== i),
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      forme_juridique: "SA",
      siege_social: "",
      capital: "",
      rccm: "",
      type_ag: "AGO",
      date_ag: "",
      heure_ag: "",
      lieu_ag: "",
      ordre_du_jour: "",
      actionnaires: [{ ...defaultActionnaire }],
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Assemblée", "Actionnaires", "Aperçu"];

// ── Main Screen ──

export default function FeuillePresenceAgSaWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/feuille-presence-ag-sa", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        rccm: w.rccm,
        type_ag: w.type_ag,
        date_ag: w.date_ag,
        heure_ag: w.heure_ag,
        lieu_ag: w.lieu_ag,
        ordre_du_jour: w.ordre_du_jour,
        actionnaires: w.actionnaires,
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
    const totalActions = w.actionnaires.reduce((sum, a) => sum + a.nombre_actions, 0);
    const totalVoix = w.actionnaires.reduce((sum, a) => sum + a.nombre_voix, 0);
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "FEUILLE DE PRÉSENCE", bold: true, center: true, size: "lg" as const },
      { text: `${v(w.type_ag)} du ${v(w.date_ag)}`, center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Lieu : ${v(w.lieu_ag)} - Heure : ${v(w.heure_ag)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Actionnaires présents ou représentés :", bold: true, spaceBefore: true },
    ];
    w.actionnaires.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Actionnaire ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom} : ${a.nombre_actions} actions, ${a.nombre_voix} voix${a.mandataire_nom ? ` (représenté par ${a.mandataire_nom})` : ""}` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: `Total : ${totalActions} actions, ${totalVoix} voix`, bold: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital, w.rccm,
      w.type_ag, w.date_ag, w.heure_ag, w.lieu_ag, w.actionnaires,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Feuille de présence AG (SA)"
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
            <Choice colors={colors} label="Type d'assemblée" options={[
              { value: "AGO", label: "AGO" },
              { value: "AGE", label: "AGE" },
              { value: "AGM", label: "AGM (mixte)" },
            ]} value={w.type_ag} onChange={(v) => w.set({ type_ag: v })} />
            <Field colors={colors} label="Date de l'assemblée" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 25 mars 2026" />
            <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Lieu de l'assemblée" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} placeholder="Ex: Siège social" />
            <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} placeholder="Résumé de l'ordre du jour" multiline />
          </>
        )}

        {/* ── Étape 2 : Actionnaires ── */}
        {w.currentStep === 2 && (
          <>
            {w.actionnaires.map((a, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Actionnaire {i + 1}</Text>
                  {w.actionnaires.length > 1 && (
                    <TouchableOpacity onPress={() => w.removeActionnaire(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => w.setActionnaire(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setActionnaire(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => w.setActionnaire(i, { prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => w.setActionnaire(i, { adresse: v })} placeholder="Adresse complète" />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nombre d'actions" value={a.nombre_actions ? String(a.nombre_actions) : ""} onChangeText={(v) => w.setActionnaire(i, { nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nombre de voix" value={a.nombre_voix ? String(a.nombre_voix) : ""} onChangeText={(v) => w.setActionnaire(i, { nombre_voix: parseInt(v) || 0 })} keyboardType="numeric" /></View>
                </View>
                <Field colors={colors} label="Mandataire (si représenté)" value={a.mandataire_nom} onChangeText={(v) => w.setActionnaire(i, { mandataire_nom: v })} placeholder="Nom du mandataire (optionnel)" />
              </View>
            ))}
            {w.actionnaires.length < 50 && (
              <TouchableOpacity onPress={w.addActionnaire}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un actionnaire</Text>
              </TouchableOpacity>
            )}

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
                FEUILLE DE PRÉSENCE
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                {w.type_ag} du {w.date_ag} - {w.lieu_ag}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Actionnaires ({w.actionnaires.length})</Text>
              {w.actionnaires.map((a, i) => (
                <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", paddingVertical: 2 }}>
                  {a.civilite} {a.prenom} {a.nom} - {a.nombre_actions} actions, {a.nombre_voix} voix{a.mandataire_nom ? ` (rep. ${a.mandataire_nom})` : ""}
                </Text>
              ))}
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
