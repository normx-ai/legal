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

interface ActeCessionActionsState {
  denomination: string;
  siege_social: string;
  capital: string;
  rccm: string;
  cedant_civilite: string;
  cedant_nom: string;
  cedant_prenom: string;
  cedant_adresse: string;
  cedant_representant: string;
  cessionnaire_civilite: string;
  cessionnaire_nom: string;
  cessionnaire_prenom: string;
  cessionnaire_adresse: string;
  cessionnaire_representant: string;
  nombre_actions_cedees: number;
  prix_par_action: number;
  has_agrement: boolean;
  date_agrement: string;
  organe_agrement: string;
  article_agrement: string;
  nombre_originaux: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<ActeCessionActionsState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<ActeCessionActionsState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  rccm: "",
  cedant_civilite: "Monsieur",
  cedant_nom: "",
  cedant_prenom: "",
  cedant_adresse: "",
  cedant_representant: "",
  cessionnaire_civilite: "Monsieur",
  cessionnaire_nom: "",
  cessionnaire_prenom: "",
  cessionnaire_adresse: "",
  cessionnaire_representant: "",
  nombre_actions_cedees: 0,
  prix_par_action: 0,
  has_agrement: false,
  date_agrement: "",
  organe_agrement: "conseil d'administration",
  article_agrement: "",
  nombre_originaux: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<ActeCessionActionsState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Soci\u00e9t\u00e9", "C\u00e9dant", "Cessionnaire", "Cession", "Aper\u00e7u"];

// ── Main Screen ──

export default function ActeCessionActionsWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/acte-cession-actions", w.nextStep);

  const prixTotal = w.nombre_actions_cedees * w.prix_par_action;
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        rccm: w.rccm,
        cedant_civilite: w.cedant_civilite,
        cedant_nom: w.cedant_nom,
        cedant_prenom: w.cedant_prenom,
        cedant_adresse: w.cedant_adresse,
        cedant_representant: w.cedant_representant,
        cessionnaire_civilite: w.cessionnaire_civilite,
        cessionnaire_nom: w.cessionnaire_nom,
        cessionnaire_prenom: w.cessionnaire_prenom,
        cessionnaire_adresse: w.cessionnaire_adresse,
        cessionnaire_representant: w.cessionnaire_representant,
        nombre_actions_cedees: w.nombre_actions_cedees,
        prix_par_action: w.prix_par_action,
        has_agrement: w.has_agrement,
        date_agrement: w.has_agrement ? w.date_agrement : undefined,
        organe_agrement: w.has_agrement ? w.organe_agrement : undefined,
        article_agrement: w.has_agrement ? w.article_agrement : undefined,
        nombre_originaux: w.nombre_originaux,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Si\u00e8ge social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: `RCCM : ${v(w.rccm)}`, center: true, size: "sm" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "ACTE DE CESSION D\u2019ACTIONS", bold: true, center: true, size: "lg" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "", spaceBefore: true },
      { text: "Entre les soussign\u00e9s :", bold: true, spaceBefore: true },
      { text: `Le C\u00e9dant : ${w.cedant_civilite} ${v(w.cedant_prenom)} ${v(w.cedant_nom)}, domicili\u00e9(e) \u00e0 ${v(w.cedant_adresse)}.`, spaceBefore: true },
      { text: `Le Cessionnaire : ${w.cessionnaire_civilite} ${v(w.cessionnaire_prenom)} ${v(w.cessionnaire_nom)}, domicili\u00e9(e) \u00e0 ${v(w.cessionnaire_adresse)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Cession d\u2019actions :", bold: true, spaceBefore: true },
      { text: `${w.nombre_actions_cedees || "..."} actions au prix de ${w.prix_par_action ? w.prix_par_action.toLocaleString("fr-FR") : "..."} FCFA par action, soit ${prixTotal ? prixTotal.toLocaleString("fr-FR") : "..."} FCFA au total.`, spaceBefore: true },
    ];
    if (w.has_agrement) {
      lines.push({ text: `Agr\u00e9ment obtenu le ${v(w.date_agrement)} par le ${w.organe_agrement}.`, spaceBefore: true });
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait \u00e0 ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    if (w.nombre_originaux) lines.push({ text: `En ${w.nombre_originaux} originaux.`, center: true });
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.rccm,
      w.cedant_civilite, w.cedant_nom, w.cedant_prenom, w.cedant_adresse,
      w.cessionnaire_civilite, w.cessionnaire_nom, w.cessionnaire_prenom, w.cessionnaire_adresse,
      w.nombre_actions_cedees, w.prix_par_action, prixTotal,
      w.has_agrement, w.date_agrement, w.organe_agrement, w.nombre_originaux, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Acte de cession d'actions (SA)"
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
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA INDUSTRIES SA" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Field colors={colors} label="RCCM" value={w.rccm} onChangeText={(v) => w.set({ rccm: v })} placeholder="Ex: CG-BZV-01-2026-A12-00001" />
          </>
        )}

        {/* -- Etape 1 : Cedant -- */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.cedant_civilite} onChange={(v) => w.set({ cedant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cedant_nom} onChangeText={(v) => w.set({ cedant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={w.cedant_prenom} onChangeText={(v) => w.set({ cedant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.cedant_adresse} onChangeText={(v) => w.set({ cedant_adresse: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Repr\u00e9sent\u00e9(e) par (optionnel)" value={w.cedant_representant} onChangeText={(v) => w.set({ cedant_representant: v })} placeholder="Nom du repr\u00e9sentant" />
          </>
        )}

        {/* -- Etape 2 : Cessionnaire -- */}
        {w.currentStep === 2 && (
          <>
            <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.cessionnaire_civilite} onChange={(v) => w.set({ cessionnaire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cessionnaire_nom} onChangeText={(v) => w.set({ cessionnaire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={w.cessionnaire_prenom} onChangeText={(v) => w.set({ cessionnaire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.cessionnaire_adresse} onChangeText={(v) => w.set({ cessionnaire_adresse: v })} placeholder="Adresse compl\u00e8te" />
            <Field colors={colors} label="Repr\u00e9sent\u00e9(e) par (optionnel)" value={w.cessionnaire_representant} onChangeText={(v) => w.set({ cessionnaire_representant: v })} placeholder="Nom du repr\u00e9sentant" />
          </>
        )}

        {/* -- Etape 3 : Cession -- */}
        {w.currentStep === 3 && (
          <>
            <Field colors={colors} label="Nombre d'actions c\u00e9d\u00e9es" value={w.nombre_actions_cedees ? String(w.nombre_actions_cedees) : ""} onChangeText={(v) => w.set({ nombre_actions_cedees: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Prix par action (FCFA)" value={w.prix_par_action ? String(w.prix_par_action) : ""} onChangeText={(v) => w.set({ prix_par_action: parseInt(v) || 0 })} keyboardType="numeric" />
            {prixTotal > 0 && (
              <View style={{ backgroundColor: colors.primary + "10", padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: colors.primary }}>
                  Prix total : {prixTotal.toLocaleString("fr-FR")} FCFA
                </Text>
              </View>
            )}

            <View style={{ marginTop: 8 }}>
              <ToggleRow colors={colors} label="Agr\u00e9ment pr\u00e9alable requis" value={w.has_agrement} onToggle={(v) => w.set({ has_agrement: v })} />
            </View>
            {w.has_agrement && (
              <View style={{ marginTop: 12 }}>
                <Choice colors={colors} label="Organe d'agr\u00e9ment" options={[{ value: "conseil d'administration", label: "Conseil d'administration" }, { value: "assembl\u00e9e g\u00e9n\u00e9rale", label: "Assembl\u00e9e g\u00e9n\u00e9rale" }]} value={w.organe_agrement} onChange={(v) => w.set({ organe_agrement: v })} />
                <Field colors={colors} label="Date de l'agr\u00e9ment" value={w.date_agrement} onChangeText={(v) => w.set({ date_agrement: v })} placeholder="Ex: 15 mars 2026" />
                <Field colors={colors} label="Article des statuts" value={w.article_agrement} onChangeText={(v) => w.set({ article_agrement: v })} placeholder="Ex: 12" />
              </View>
            )}

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Nombre d'originaux" value={w.nombre_originaux} onChangeText={(v) => w.set({ nombre_originaux: v })} placeholder="Ex: 6" />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* -- Etape 4 : Apercu + Telechargement -- */}
        {w.currentStep === 4 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                ACTE DE CESSION D'ACTIONS
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                SA au capital de {w.capital} FCFA - RCCM : {w.rccm}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>C\u00e9dant</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.cedant_civilite} {w.cedant_prenom} {w.cedant_nom}, domicili\u00e9(e) \u00e0 {w.cedant_adresse}.
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Cessionnaire</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.cessionnaire_civilite} {w.cessionnaire_prenom} {w.cessionnaire_nom}, domicili\u00e9(e) \u00e0 {w.cessionnaire_adresse}.
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Cession</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                {w.nombre_actions_cedees} actions au prix de {w.prix_par_action.toLocaleString("fr-FR")} FCFA/action, soit {prixTotal.toLocaleString("fr-FR")} FCFA.
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>{"\u00B7\u00B7\u00B7"} Document complet dans le fichier DOCX {"\u00B7\u00B7\u00B7"}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                Fait \u00e0 {w.lieu_signature || "Brazzaville"}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}
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
