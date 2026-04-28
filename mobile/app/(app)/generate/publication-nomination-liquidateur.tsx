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

interface PublicationNominationLiquidateurState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  // Liquidation
  date_dissolution: string;
  organe_decision: string;
  liquidateur_civilite: string;
  liquidateur_nom: string;
  liquidateur_prenom: string;
  liquidateur_adresse: string;
  liquidateur_nationalite: string;
  date_nomination: string;
  duree_mandat_liquidateur: string;
  siege_liquidation: string;
  tribunal_competent: string;
  greffe_depot: string;
  journal_annonces: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PublicationNominationLiquidateurState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<PublicationNominationLiquidateurState, "set" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  date_dissolution: "",
  organe_decision: "assemblée générale extraordinaire",
  liquidateur_civilite: "Monsieur",
  liquidateur_nom: "",
  liquidateur_prenom: "",
  liquidateur_adresse: "",
  liquidateur_nationalite: "congolaise",
  date_nomination: "",
  duree_mandat_liquidateur: "",
  siege_liquidation: "",
  tribunal_competent: "Tribunal de Commerce de Brazzaville",
  greffe_depot: "",
  journal_annonces: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<PublicationNominationLiquidateurState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Société", "Liquidation", "Aperçu"];

// ── Main Screen ──

export default function PublicationNominationLiquidateurWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/publication-nomination-liquidateur", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        date_dissolution: w.date_dissolution,
        organe_decision: w.organe_decision,
        liquidateur_civilite: w.liquidateur_civilite,
        liquidateur_nom: w.liquidateur_nom,
        liquidateur_prenom: w.liquidateur_prenom,
        liquidateur_adresse: w.liquidateur_adresse,
        liquidateur_nationalite: w.liquidateur_nationalite,
        date_nomination: w.date_nomination,
        duree_mandat_liquidateur: w.duree_mandat_liquidateur,
        siege_liquidation: w.siege_liquidation,
        tribunal_competent: w.tribunal_competent,
        greffe_depot: w.greffe_depot,
        journal_annonces: w.journal_annonces,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 1;
  const isDownloadStep = w.currentStep === 2;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: "AVIS DE PUBLICATION", bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "NOMINATION DU LIQUIDATEUR", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Société : ${v(w.denomination)}`, spaceBefore: true },
      { text: `Forme : ${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA` },
      { text: `Siège : ${v(w.siege_social)}` },
      { text: `RC : ${v(w.rc_numero)}` },
      { text: "", spaceBefore: true },
      { text: `Dissolution décidée le ${v(w.date_dissolution)} par ${v(w.organe_decision)}.`, spaceBefore: true },
      { text: `Liquidateur : ${v(w.liquidateur_civilite)} ${v(w.liquidateur_prenom)} ${v(w.liquidateur_nom)}`, spaceBefore: true },
      { text: `Siège de liquidation : ${v(w.siege_liquidation)}` },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.rc_numero,
      w.date_dissolution, w.organe_decision, w.liquidateur_civilite, w.liquidateur_nom,
      w.liquidateur_prenom, w.siege_liquidation, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Publication nomination liquidateur"
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
          </>
        )}

        {/* ── Étape 1 : Liquidation ── */}
        {w.currentStep === 1 && (
          <>
            <SectionTitle title="Dissolution" colors={colors} />
            <Field colors={colors} label="Date de dissolution" value={w.date_dissolution} onChangeText={(v) => w.set({ date_dissolution: v })} placeholder="Ex: 15 mars 2026" />
            <Choice colors={colors} label="Organe ayant décidé" options={[
              { value: "assemblée générale extraordinaire", label: "AGE" },
              { value: "assemblée générale", label: "AG" },
              { value: "décision de l'associé unique", label: "Associé unique" },
              { value: "décision de l'actionnaire unique", label: "Actionnaire unique" },
            ]} value={w.organe_decision} onChange={(v) => w.set({ organe_decision: v })} />

            <SectionTitle title="Liquidateur" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.liquidateur_civilite} onChange={(v) => w.set({ liquidateur_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.liquidateur_nom} onChangeText={(v) => w.set({ liquidateur_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.liquidateur_prenom} onChangeText={(v) => w.set({ liquidateur_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.liquidateur_adresse} onChangeText={(v) => w.set({ liquidateur_adresse: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Nationalité" value={w.liquidateur_nationalite} onChangeText={(v) => w.set({ liquidateur_nationalite: v })} />
            <Field colors={colors} label="Date de nomination" value={w.date_nomination} onChangeText={(v) => w.set({ date_nomination: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Durée du mandat" value={w.duree_mandat_liquidateur} onChangeText={(v) => w.set({ duree_mandat_liquidateur: v })} placeholder="Ex: jusqu'à clôture de la liquidation" />

            <SectionTitle title="Publicité" colors={colors} />
            <Field colors={colors} label="Siège de la liquidation" value={w.siege_liquidation} onChangeText={(v) => w.set({ siege_liquidation: v })} placeholder="Adresse du siège de liquidation" />
            <Field colors={colors} label="Tribunal compétent" value={w.tribunal_competent} onChangeText={(v) => w.set({ tribunal_competent: v })} />
            <Field colors={colors} label="Greffe de dépôt" value={w.greffe_depot} onChangeText={(v) => w.set({ greffe_depot: v })} placeholder="Ex: Greffe du Tribunal de Commerce de Brazzaville" />
            <Field colors={colors} label="Journal d'annonces légales" value={w.journal_annonces} onChangeText={(v) => w.set({ journal_annonces: v })} placeholder="Nom du journal" />

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 2 : Aperçu + Téléchargement ── */}
        {w.currentStep === 2 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PUBLICATION - NOMINATION LIQUIDATEUR
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Dissolution décidée le {w.date_dissolution} par {w.organe_decision}.
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Liquidateur : {w.liquidateur_civilite} {w.liquidateur_prenom} {w.liquidateur_nom}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Siège de liquidation : {w.siege_liquidation}
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
          );
        })()}

    </WizardLayout>
  );
}
