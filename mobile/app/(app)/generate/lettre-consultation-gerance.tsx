import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { parseAmount } from "@/lib/utils/parseAmount";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// -- Types --

interface LettreConsultationGeranceState {
  denomination: string;
  siege_social: string;
  capital: string;
  nombre_parts_total: string;
  destinataire_civilite: string;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_adresse: string;
  article_statuts: string;
  resolutions: string;
  delai_reponse: string;
  date_limite_reponse: string;
  gerant_civilite: string;
  gerant_nom: string;
  gerant_prenom: string;
  pieces_jointes: string;
  lieu_envoi: string;
  date_envoi: string;
  currentStep: number;
  set: (data: Partial<LettreConsultationGeranceState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// -- Store --

const useStore = create<LettreConsultationGeranceState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: "",
  nombre_parts_total: "",
  destinataire_civilite: "Monsieur",
  destinataire_nom: "",
  destinataire_prenom: "",
  destinataire_adresse: "",
  article_statuts: "",
  resolutions: "",
  delai_reponse: "15",
  date_limite_reponse: "",
  gerant_civilite: "Monsieur",
  gerant_nom: "",
  gerant_prenom: "",
  pieces_jointes: "",
  lieu_envoi: "Brazzaville",
  date_envoi: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: "",
      nombre_parts_total: "",
      destinataire_civilite: "Monsieur",
      destinataire_nom: "",
      destinataire_prenom: "",
      destinataire_adresse: "",
      article_statuts: "",
      resolutions: "",
      delai_reponse: "15",
      date_limite_reponse: "",
      gerant_civilite: "Monsieur",
      gerant_nom: "",
      gerant_prenom: "",
      pieces_jointes: "",
      lieu_envoi: "Brazzaville",
      date_envoi: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Destinataire", "Consultation", "Aperçu"];

// -- Main Screen --

export default function LettreConsultationGeranceWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/lettre-consultation-gerance", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        nombre_parts_total: w.nombre_parts_total,
        destinataire_civilite: w.destinataire_civilite,
        destinataire_nom: w.destinataire_nom,
        destinataire_prenom: w.destinataire_prenom,
        destinataire_adresse: w.destinataire_adresse,
        article_statuts: w.article_statuts,
        resolutions: w.resolutions,
        delai_reponse: w.delai_reponse,
        date_limite_reponse: w.date_limite_reponse,
        gerant_civilite: w.gerant_civilite,
        gerant_nom: w.gerant_nom,
        gerant_prenom: w.gerant_prenom,
        pieces_jointes: w.pieces_jointes,
        lieu_envoi: w.lieu_envoi,
        date_envoi: w.date_envoi || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  // -- Apercu document temps reel --
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SARL au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "LETTRE DE CONSULTATION ÉCRITE", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `${v(w.lieu_envoi)}, le ${w.date_envoi || new Date().toLocaleDateString("fr-FR")}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `${v(w.destinataire_civilite)} ${v(w.destinataire_prenom)} ${v(w.destinataire_nom)}`, bold: true },
      { text: v(w.destinataire_adresse) },
      { text: "", spaceBefore: true },
      { text: `Objet : Consultation écrite des associés (art. ${v(w.article_statuts)} des statuts)`, bold: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `${v(w.destinataire_civilite)},` },
      { text: "", spaceBefore: true },
      { text: `Conformément à l'article ${v(w.article_statuts)} des statuts de la société ${v(w.denomination)}, je vous consulte par écrit sur les résolutions suivantes :` },
      { text: "", spaceBefore: true },
      { text: v(w.resolutions) },
      { text: "", spaceBefore: true },
      { text: `Vous disposez d'un délai de ${v(w.delai_reponse)} jours pour faire parvenir votre vote.`, spaceBefore: true },
      { text: `Date limite de réponse : ${v(w.date_limite_reponse)}` },
    ];
    if (w.pieces_jointes) {
      lines.push(
        { text: "", spaceBefore: true },
        { text: "Pièces jointes :", bold: true, spaceBefore: true },
        { text: w.pieces_jointes },
      );
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `${w.gerant_civilite} ${v(w.gerant_prenom)} ${v(w.gerant_nom)}`, center: true, spaceBefore: true },
      { text: "Le Gérant", center: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.nombre_parts_total,
      w.destinataire_civilite, w.destinataire_nom, w.destinataire_prenom, w.destinataire_adresse,
      w.article_statuts, w.resolutions, w.delai_reponse, w.date_limite_reponse,
      w.gerant_civilite, w.gerant_nom, w.gerant_prenom, w.pieces_jointes,
      w.lieu_envoi, w.date_envoi]);

  return (
    <WizardLayout
      title="Lettre consultation gérance (SARL)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SARL" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 1 000 000" />
            <Field colors={colors} label="Nombre total de parts sociales" value={w.nombre_parts_total} onChangeText={(v) => w.set({ nombre_parts_total: v })} placeholder="Ex: 1000" keyboardType="numeric" />
          </>
        )}

        {/* -- Etape 1 : Destinataire -- */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.destinataire_civilite} onChange={(v) => w.set({ destinataire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.destinataire_nom} onChangeText={(v) => w.set({ destinataire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.destinataire_prenom} onChangeText={(v) => w.set({ destinataire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse du destinataire" value={w.destinataire_adresse} onChangeText={(v) => w.set({ destinataire_adresse: v })} placeholder="Adresse complète" />
          </>
        )}

        {/* -- Etape 2 : Consultation -- */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Article des statuts (consultation écrite)" value={w.article_statuts} onChangeText={(v) => w.set({ article_statuts: v })} placeholder="Ex: 25" />
            <Field colors={colors} label="Résolutions soumises au vote" value={w.resolutions} onChangeText={(v) => w.set({ resolutions: v })} placeholder="Décrivez les résolutions..." multiline />
            <Field colors={colors} label="Délai de réponse (jours)" value={w.delai_reponse} onChangeText={(v) => w.set({ delai_reponse: v })} keyboardType="numeric" />
            <Field colors={colors} label="Date limite de réponse" value={w.date_limite_reponse} onChangeText={(v) => w.set({ date_limite_reponse: v })} placeholder="Ex: 10 avril 2026" />

            <SectionTitle title="Gérant" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.gerant_civilite} onChange={(v) => w.set({ gerant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant_nom} onChangeText={(v) => w.set({ gerant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.gerant_prenom} onChangeText={(v) => w.set({ gerant_prenom: v })} /></View>
            </View>

            <SectionTitle title="Envoi" colors={colors} />
            <Field colors={colors} label="Pièces jointes" value={w.pieces_jointes} onChangeText={(v) => w.set({ pieces_jointes: v })} placeholder="Listez les pièces jointes..." multiline />
            <Field colors={colors} label="Lieu d'envoi" value={w.lieu_envoi} onChangeText={(v) => w.set({ lieu_envoi: v })} />
            <Field colors={colors} label="Date d'envoi" value={w.date_envoi} onChangeText={(v) => w.set({ date_envoi: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* -- Etape 3 : Apercu + Telechargement -- */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  LETTRE DE CONSULTATION ÉCRITE
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SARL au capital de {w.capital} FCFA - Siège : {w.siege_social}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "right", marginBottom: 16 }}>
                  {w.lieu_envoi || "Brazzaville"}, le {w.date_envoi || new Date().toLocaleDateString("fr-FR")}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 4 }}>
                  {w.destinataire_civilite} {w.destinataire_prenom} {w.destinataire_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 12 }}>
                  {w.destinataire_adresse || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>
                  Objet : Consultation écrite (art. {w.article_statuts || "..."} des statuts)
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.resolutions || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Délai de réponse : {w.delai_reponse} jours - Date limite : {w.date_limite_reponse || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "right", marginTop: 16 }}>
                  {w.gerant_civilite} {w.gerant_prenom} {w.gerant_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "right" }}>
                  Le Gérant
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
