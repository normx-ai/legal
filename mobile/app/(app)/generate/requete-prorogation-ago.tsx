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

// -- Types --

interface RequeteProrogationAgoState {
  denomination: string;
  siege_social: string;
  capital: number;
  forme_juridique: string;
  rc_numero: string;
  requerant_civilite: string;
  requerant_nom: string;
  requerant_prenom: string;
  requerant_qualite: string;
  tribunal: string;
  date_cloture_exercice: string;
  delai_legal: string;
  date_limite_legale: string;
  duree_prorogation_demandee: string;
  motif_prorogation: string;
  date_signature: string;
  lieu_signature: string;
  currentStep: number;
  set: (data: Partial<RequeteProrogationAgoState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// -- Store --

const useRequeteProrogationAgoStore = create<RequeteProrogationAgoState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: 0,
  forme_juridique: "SA",
  rc_numero: "",
  requerant_civilite: "Monsieur",
  requerant_nom: "",
  requerant_prenom: "",
  requerant_qualite: "",
  tribunal: "",
  date_cloture_exercice: "",
  delai_legal: "six mois",
  date_limite_legale: "",
  duree_prorogation_demandee: "",
  motif_prorogation: "",
  date_signature: "",
  lieu_signature: "Brazzaville",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: 0,
      forme_juridique: "SA",
      rc_numero: "",
      requerant_civilite: "Monsieur",
      requerant_nom: "",
      requerant_prenom: "",
      requerant_qualite: "",
      tribunal: "",
      date_cloture_exercice: "",
      delai_legal: "six mois",
      date_limite_legale: "",
      duree_prorogation_demandee: "",
      motif_prorogation: "",
      date_signature: "",
      lieu_signature: "Brazzaville",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Requérant", "Prorogation", "Aperçu"];

// -- Main Screen --

export default function RequeteProrogationAgoWizardScreen() {
  const { colors } = useTheme();
  const w = useRequeteProrogationAgoStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/requete-prorogation-ago", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        requerant_civilite: w.requerant_civilite,
        requerant_nom: w.requerant_nom,
        requerant_prenom: w.requerant_prenom,
        requerant_qualite: w.requerant_qualite,
        tribunal: w.tribunal,
        date_cloture_exercice: w.date_cloture_exercice,
        delai_legal: w.delai_legal,
        date_limite_legale: w.date_limite_legale,
        duree_prorogation_demandee: w.duree_prorogation_demandee,
        motif_prorogation: w.motif_prorogation,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        lieu_signature: w.lieu_signature,
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

  // -- Aperçu document temps réel --
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "REQUÊTE POUR PROROGATION DU DÉLAI DE L'AGO ANNUELLE", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Monsieur le Président du Tribunal de Commerce de ${v(w.tribunal)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Le requérant : ${v(w.requerant_civilite)} ${v(w.requerant_prenom)} ${v(w.requerant_nom)}, ${v(w.requerant_qualite)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Exercice clos le ${v(w.date_cloture_exercice)}`, spaceBefore: true },
      { text: `Délai légal : ${v(w.delai_legal)}, soit au plus tard le ${v(w.date_limite_legale)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Prorogation demandée : ${v(w.duree_prorogation_demandee)}`, bold: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.tribunal,
      w.requerant_civilite, w.requerant_nom, w.requerant_prenom, w.requerant_qualite,
      w.date_cloture_exercice, w.delai_legal, w.date_limite_legale,
      w.duree_prorogation_demandee, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Requête prorogation délai AGO"
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

        {/* -- Étape 0 : Société -- */}
        {w.currentStep === 0 && (
          <>
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital ? String(w.capital) : ""} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Choice colors={colors} label="Forme juridique" options={[{ value: "SA", label: "SA" }, { value: "SARL", label: "SARL" }, { value: "SAS", label: "SAS" }]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Numéro RCCM" value={w.rc_numero} onChangeText={(v) => w.set({ rc_numero: v })} placeholder="Ex: CG-BZV-01-2020-A12-00345" />
          </>
        )}

        {/* -- Étape 1 : Requérant -- */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.requerant_civilite} onChange={(v) => w.set({ requerant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.requerant_nom} onChangeText={(v) => w.set({ requerant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.requerant_prenom} onChangeText={(v) => w.set({ requerant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Qualité du requérant" value={w.requerant_qualite} onChangeText={(v) => w.set({ requerant_qualite: v })} placeholder="Ex: Gérant, PDG, PCA..." />
            <Field colors={colors} label="Tribunal de Commerce" value={w.tribunal} onChangeText={(v) => w.set({ tribunal: v })} placeholder="Ex: Brazzaville" />
          </>
        )}

        {/* -- Étape 2 : Prorogation -- */}
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
              <Field colors={colors} label="Date de clôture de l'exercice" value={w.date_cloture_exercice} onChangeText={(v) => w.set({ date_cloture_exercice: v })} placeholder="Ex: 31 décembre 2025" />
              <Field colors={colors} label="Délai légal" value={w.delai_legal} onChangeText={(v) => w.set({ delai_legal: v })} placeholder="Ex: six mois" />
              <Field colors={colors} label="Date limite légale" value={w.date_limite_legale} onChangeText={(v) => w.set({ date_limite_legale: v })} placeholder="Ex: 30 juin 2026" />
              <Field colors={colors} label="Durée de prorogation demandée" value={w.duree_prorogation_demandee} onChangeText={(v) => w.set({ duree_prorogation_demandee: v })} placeholder="Ex: trois mois" />
              <Field colors={colors} label="Motif de prorogation" value={w.motif_prorogation} onChangeText={(v) => w.set({ motif_prorogation: v })} placeholder="Exposez les raisons justifiant la prorogation..." multiline />

              <SectionTitle title="Signature" colors={colors} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="Récapitulatif" colors={colors} />
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                <Row label="Forme juridique" value={w.forme_juridique} />
                <Row label="Siège social" value={w.siege_social} />
                <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
                <Row label="RCCM" value={w.rc_numero} />
              </Section>
              <Section title="Requérant">
                <Row label="Identité" value={`${w.requerant_civilite} ${w.requerant_prenom} ${w.requerant_nom}`} />
                <Row label="Qualité" value={w.requerant_qualite} />
              </Section>
              <Section title="Prorogation">
                <Row label="Clôture exercice" value={w.date_cloture_exercice} />
                <Row label="Date limite légale" value={w.date_limite_legale} />
                <Row label="Durée demandée" value={w.duree_prorogation_demandee} />
              </Section>
            </>
          );
        })()}

        {/* -- Étape 3 : Aperçu + Téléchargement -- */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  REQUÊTE POUR PROROGATION DU DÉLAI DE L'AGO ANNUELLE
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Monsieur le Président du Tribunal de Commerce de {w.tribunal}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {w.requerant_civilite} {w.requerant_prenom} {w.requerant_nom}, {w.requerant_qualite}, demande une prorogation de {w.duree_prorogation_demandee} pour la tenue de l'AGO annuelle.
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
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
