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

interface Associe {
  civilite: string;
  nom: string;
  prenom: string;
  nombre_parts: number;
}

interface Resolution {
  texte: string;
  adoptee: boolean;
}

interface PvConsultationEcriteState {
  denomination: string;
  siege_social: string;
  capital: string;
  nombre_parts_total: number;
  gerant_civilite: string;
  gerant_nom: string;
  gerant_prenom: string;
  date_consultation: string;
  date_consultation_lettres: string;
  article_statuts: string;
  mode_envoi: string;
  associes: Associe[];
  resolutions: Resolution[];
  currentStep: number;
  set: (data: Partial<PvConsultationEcriteState>) => void;
  setAssocie: (i: number, data: Partial<Associe>) => void;
  addAssocie: () => void;
  removeAssocie: (i: number) => void;
  setResolution: (i: number, data: Partial<Resolution>) => void;
  addResolution: () => void;
  removeResolution: (i: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<PvConsultationEcriteState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: "",
  nombre_parts_total: 0,
  gerant_civilite: "Monsieur",
  gerant_nom: "",
  gerant_prenom: "",
  date_consultation: "",
  date_consultation_lettres: "",
  article_statuts: "",
  mode_envoi: "par lettre recommandée avec demande d'avis de réception",
  associes: [{ civilite: "Monsieur", nom: "", prenom: "", nombre_parts: 0 }],
  resolutions: [{ texte: "", adoptee: true }],
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  setAssocie: (i, data) =>
    set((s) => {
      const associes = [...s.associes];
      associes[i] = { ...associes[i], ...data };
      return { associes };
    }),
  addAssocie: () =>
    set((s) => ({
      associes: [...s.associes, { civilite: "Monsieur", nom: "", prenom: "", nombre_parts: 0 }],
    })),
  removeAssocie: (i) =>
    set((s) => ({
      associes: s.associes.filter((_, idx) => idx !== i),
    })),
  setResolution: (i, data) =>
    set((s) => {
      const resolutions = [...s.resolutions];
      resolutions[i] = { ...resolutions[i], ...data };
      return { resolutions };
    }),
  addResolution: () =>
    set((s) => ({
      resolutions: [...s.resolutions, { texte: "", adoptee: true }],
    })),
  removeResolution: (i) =>
    set((s) => ({
      resolutions: s.resolutions.filter((_, idx) => idx !== i),
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: "",
      nombre_parts_total: 0,
      gerant_civilite: "Monsieur",
      gerant_nom: "",
      gerant_prenom: "",
      date_consultation: "",
      date_consultation_lettres: "",
      article_statuts: "",
      mode_envoi: "par lettre recommandée avec demande d'avis de réception",
      associes: [{ civilite: "Monsieur", nom: "", prenom: "", nombre_parts: 0 }],
      resolutions: [{ texte: "", adoptee: true }],
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Gérant", "Associés", "Résolutions", "Aperçu"];

// ── Main Screen ──

export default function PvConsultationEcriteWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/pv-consultation-ecrite", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        nombre_parts_total: w.nombre_parts_total,
        gerant_civilite: w.gerant_civilite,
        gerant_nom: w.gerant_nom,
        gerant_prenom: w.gerant_prenom,
        date_consultation: w.date_consultation,
        date_consultation_lettres: w.date_consultation_lettres,
        article_statuts: w.article_statuts,
        mode_envoi: w.mode_envoi,
        associes: w.associes,
        resolutions: w.resolutions,
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

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SARL au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL DE CONSULTATION ÉCRITE DES ASSOCIÉS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `${v(w.gerant_civilite)} ${v(w.gerant_prenom)} ${v(w.gerant_nom)}, gérant de la société ${v(w.denomination)}, a consulté les associés par voie écrite ${v(w.mode_envoi)}, en date du ${v(w.date_consultation)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Associés consultés :", bold: true, spaceBefore: true },
    ];
    w.associes.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Associé ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom} — ${a.nombre_parts} parts` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Résolutions :", bold: true, spaceBefore: true },
    );
    w.resolutions.forEach((r, i) => {
      lines.push({ text: `${i + 1}. ${r.texte || "(à compléter)"} — ${r.adoptee ? "Adoptée" : "Rejetée"}` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.gerant_civilite, w.gerant_nom, w.gerant_prenom,
      w.date_consultation, w.mode_envoi, w.associes, w.resolutions]);

  return (
    <WizardLayout
      title="PV de consultation écrite (SARL)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SARL" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
            <Field colors={colors} label="Nombre total de parts sociales" value={w.nombre_parts_total ? String(w.nombre_parts_total) : ""} onChangeText={(v) => w.set({ nombre_parts_total: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {/* ── Étape 1 : Gérant ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité du gérant" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.gerant_civilite} onChange={(v) => w.set({ gerant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant_nom} onChangeText={(v) => w.set({ gerant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.gerant_prenom} onChangeText={(v) => w.set({ gerant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Date de la consultation" value={w.date_consultation} onChangeText={(v) => w.set({ date_consultation: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Date de la consultation (en lettres)" value={w.date_consultation_lettres} onChangeText={(v) => w.set({ date_consultation_lettres: v })} placeholder="Ex: quinze mars deux mille vingt-six" />
            <Field colors={colors} label="Article des statuts autorisant la consultation" value={w.article_statuts} onChangeText={(v) => w.set({ article_statuts: v })} placeholder="Ex: article 25" />
            <Choice colors={colors} label="Mode d'envoi" options={[
              { value: "par lettre recommandée avec demande d'avis de réception", label: "Lettre recommandée avec AR" },
              { value: "par lettre au porteur contre récépissé", label: "Lettre au porteur contre récépissé" },
            ]} value={w.mode_envoi} onChange={(v) => w.set({ mode_envoi: v })} />
          </>
        )}

        {/* ── Étape 2 : Associés ── */}
        {w.currentStep === 2 && (
          <>
            {w.associes.map((a, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Associé {i + 1}</Text>
                  {w.associes.length > 1 && (
                    <TouchableOpacity onPress={() => w.removeAssocie(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => w.setAssocie(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setAssocie(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => w.setAssocie(i, { prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Nombre de parts" value={a.nombre_parts ? String(a.nombre_parts) : ""} onChangeText={(v) => w.setAssocie(i, { nombre_parts: parseInt(v) || 0 })} keyboardType="numeric" />
              </View>
            ))}
            {w.associes.length < 50 && (
              <TouchableOpacity onPress={w.addAssocie}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un associé</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Étape 3 : Résolutions ── */}
        {w.currentStep === 3 && (
          <>
            {w.resolutions.map((r, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Résolution {i + 1}</Text>
                  {w.resolutions.length > 1 && (
                    <TouchableOpacity onPress={() => w.removeResolution(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Field colors={colors} label="Texte de la résolution" value={r.texte} onChangeText={(v) => w.setResolution(i, { texte: v })} placeholder="Décrivez la résolution..." multiline />
                <ToggleRow colors={colors} label="Adoptée" value={r.adoptee} onToggle={(v) => w.setResolution(i, { adoptee: v })} />
              </View>
            ))}
            {w.resolutions.length < 50 && (
              <TouchableOpacity onPress={w.addResolution}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter une résolution</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Étape 4 : Aperçu + Téléchargement ── */}
        {w.currentStep === 4 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PROCÈS-VERBAL DE CONSULTATION ÉCRITE
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SARL au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.gerant_civilite} {w.gerant_prenom} {w.gerant_nom}, gérant de la société {w.denomination}, a consulté les associés par voie écrite {w.mode_envoi}, conformément aux dispositions de l'{w.article_statuts} des statuts, en date du {w.date_consultation}.
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Associés consultés</Text>
                {w.associes.map((a, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>
                    - {a.civilite} {a.prenom} {a.nom} ({a.nombre_parts} parts)
                  </Text>
                ))}

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Résolutions</Text>
                {w.resolutions.map((r, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                    {i + 1}. {r.texte || "(à compléter)"} — {r.adoptee ? "Adoptée" : "Rejetée"}
                  </Text>
                ))}

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
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
