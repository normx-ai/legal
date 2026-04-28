import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// ── Types ──

interface LettreNotificationRepresentantState {
  denomination_administrateur: string;
  forme_administrateur: string;
  capital_administrateur: number;
  siege_administrateur: string;
  denomination_societe: string;
  representant_civilite: string;
  representant_nom: string;
  representant_prenom: string;
  representant_adresse: string;
  is_designation: boolean;
  is_revocation: boolean;
  date_seance: string;
  ancien_representant_nom: string;
  nouveau_representant_nom: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<LettreNotificationRepresentantState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<LettreNotificationRepresentantState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination_administrateur: "",
  forme_administrateur: "SA",
  capital_administrateur: 0,
  siege_administrateur: "",
  denomination_societe: "",
  representant_civilite: "Monsieur",
  representant_nom: "",
  representant_prenom: "",
  representant_adresse: "",
  is_designation: true,
  is_revocation: false,
  date_seance: "",
  ancien_representant_nom: "",
  nouveau_representant_nom: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<LettreNotificationRepresentantState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Soci\u00e9t\u00e9 administrateur", "Soci\u00e9t\u00e9", "Repr\u00e9sentant", "Aper\u00e7u"];

// ── Main Screen ──

export default function LettreNotificationRepresentantWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/lettre-notification-representant", w.nextStep);
  const handleGenerate = () => generate({
        denomination_administrateur: w.denomination_administrateur,
        forme_administrateur: w.forme_administrateur,
        capital_administrateur: w.capital_administrateur,
        siege_administrateur: w.siege_administrateur,
        denomination_societe: w.denomination_societe,
        representant_civilite: w.representant_civilite,
        representant_nom: w.representant_nom,
        representant_prenom: w.representant_prenom,
        representant_adresse: w.representant_adresse,
        is_designation: w.is_designation,
        is_revocation: w.is_revocation,
        date_seance: w.date_seance,
        ancien_representant_nom: w.ancien_representant_nom,
        nouveau_representant_nom: w.nouveau_representant_nom,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination_administrateur), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${w.forme_administrateur} au capital de ${w.capital_administrateur.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "LETTRE DE NOTIFICATION DU REPR\u00c9SENTANT PERMANENT", bold: true, center: true, size: "lg" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: "", spaceBefore: true },
      { text: `Soci\u00e9t\u00e9 administr\u00e9e : ${v(w.denomination_societe)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Type : ${w.is_designation ? "D\u00e9signation" : ""}${w.is_revocation ? " R\u00e9vocation/Remplacement" : ""}`, bold: true },
      { text: `Repr\u00e9sentant : ${v(w.representant_civilite)} ${v(w.representant_prenom)} ${v(w.representant_nom)}` },
      { text: `Date de s\u00e9ance : ${v(w.date_seance)}` },
      { text: "", spaceBefore: true },
      { text: `Fait \u00e0 ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination_administrateur, w.capital_administrateur, w.forme_administrateur,
      w.denomination_societe, w.is_designation, w.is_revocation,
      w.representant_civilite, w.representant_nom, w.representant_prenom,
      w.date_seance, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Lettre notification repr\u00e9sentant permanent"
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

        {/* \u2500\u2500 \u00c9tape 0 : Soci\u00e9t\u00e9 administrateur \u2500\u2500 */}
        {w.currentStep === 0 && (
          <>
            <SectionTitle title="Soci\u00e9t\u00e9 administrateur (personne morale)" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.denomination_administrateur} onChangeText={(v) => w.set({ denomination_administrateur: v })} placeholder="Ex: HOLDING ABC SA" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
              { value: "SARL", label: "SARL" },
            ]} value={w.forme_administrateur} onChange={(v) => w.set({ forme_administrateur: v })} />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital_administrateur ? String(w.capital_administrateur) : ""} onChangeText={(v) => w.set({ capital_administrateur: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_administrateur} onChangeText={(v) => w.set({ siege_administrateur: v })} placeholder="Adresse compl\u00e8te" />

            <SectionTitle title="Soci\u00e9t\u00e9 administr\u00e9e" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination de la soci\u00e9t\u00e9 administr\u00e9e" value={w.denomination_societe} onChangeText={(v) => w.set({ denomination_societe: v })} placeholder="Ex: OMEGA INDUSTRIES SA" />
          </>
        )}

        {/* \u2500\u2500 \u00c9tape 1 : Soci\u00e9t\u00e9 \u2500\u2500 */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Type de notification" colors={colors} />
            <ToggleRow colors={colors} label="D\u00e9signation d'un repr\u00e9sentant" value={w.is_designation} onToggle={(v) => w.set({ is_designation: v })} />
            <ToggleRow colors={colors} label="R\u00e9vocation / Remplacement" value={w.is_revocation} onToggle={(v) => w.set({ is_revocation: v })} />
            <Field colors={colors} label="Date de la s\u00e9ance du CA" value={w.date_seance} onChangeText={(v) => w.set({ date_seance: v })} placeholder="Ex: 15 mars 2026" />

            {w.is_revocation && (
              <>
                <SectionTitle title="Ancien repr\u00e9sentant (r\u00e9voqu\u00e9)" colors={colors} />
                <Field colors={colors} label="Nom de l'ancien repr\u00e9sentant" value={w.ancien_representant_nom} onChangeText={(v) => w.set({ ancien_representant_nom: v })} placeholder="Nom complet" />
                <Field colors={colors} label="Nom du nouveau repr\u00e9sentant" value={w.nouveau_representant_nom} onChangeText={(v) => w.set({ nouveau_representant_nom: v })} placeholder="Nom complet" />
              </>
            )}
          </>
        )}

        {/* \u2500\u2500 \u00c9tape 2 : Repr\u00e9sentant + R\u00e9capitulatif \u2500\u2500 */}
        {w.currentStep === 2 && (() => {
          const Row = ({ label, value }: { label: string; value: string }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 }}>{label}</Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, flex: 1, textAlign: "right" }}>{value}</Text>
            </View>
          );
          const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
            <View style={{ backgroundColor: colors.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 10 }}>{title}</Text>
              {children}
            </View>
          );

          return (
            <>
              <SectionTitle title="Repr\u00e9sentant permanent d\u00e9sign\u00e9" colors={colors} />
              <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.representant_civilite} onChange={(v) => w.set({ representant_civilite: v })} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.representant_nom} onChangeText={(v) => w.set({ representant_nom: v })} /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={w.representant_prenom} onChangeText={(v) => w.set({ representant_prenom: v })} /></View>
              </View>
              <Field colors={colors} label="Adresse" value={w.representant_adresse} onChangeText={(v) => w.set({ representant_adresse: v })} placeholder="Adresse compl\u00e8te" />

              <SectionTitle title="Signature" colors={colors} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="R\u00e9capitulatif" colors={colors} />
              <Section title="Soci\u00e9t\u00e9 administrateur">
                <Row label="D\u00e9nomination" value={w.denomination_administrateur} />
                <Row label="Forme" value={w.forme_administrateur} />
                <Row label="Capital" value={`${w.capital_administrateur.toLocaleString("fr-FR")} FCFA`} />
              </Section>
              <Section title="Soci\u00e9t\u00e9 administr\u00e9e">
                <Row label="D\u00e9nomination" value={w.denomination_societe} />
              </Section>
              <Section title="Repr\u00e9sentant">
                <Row label="Identit\u00e9" value={`${w.representant_civilite} ${w.representant_prenom} ${w.representant_nom}`} />
                <Row label="Type" value={w.is_designation ? "D\u00e9signation" : "R\u00e9vocation"} />
              </Section>
            </>
          );
        })()}

        {/* \u2500\u2500 \u00c9tape 3 : Aper\u00e7u + T\u00e9l\u00e9chargement \u2500\u2500 */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  LETTRE DE NOTIFICATION DU REPR\u00c9SENTANT PERMANENT
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination_administrateur}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Soci\u00e9t\u00e9 administr\u00e9e : {w.denomination_societe}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Repr\u00e9sentant : {w.representant_civilite} {w.representant_prenom} {w.representant_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
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
          );
        })()}

    </WizardLayout>
  );
}
