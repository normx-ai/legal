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

// -- Types --

interface CertificatActionsNominativesState {
  denomination: string;
  siege_social: string;
  capital: number;
  titulaire_civilite: string;
  titulaire_nom: string;
  titulaire_prenom: string;
  titulaire_adresse: string;
  nombre_actions: number;
  nombre_actions_lettres: string;
  valeur_nominale_action: number;
  numero_certificat: string;
  actions: { numero_de: string; numero_a: string; nombre: number }[];
  date_certificat: string;
  signataire_fonction: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<CertificatActionsNominativesState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// -- Store --

const useCertificatActionsNominativesStore = create<CertificatActionsNominativesState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: 0,
  titulaire_civilite: "Monsieur",
  titulaire_nom: "",
  titulaire_prenom: "",
  titulaire_adresse: "",
  nombre_actions: 0,
  nombre_actions_lettres: "",
  valeur_nominale_action: 0,
  numero_certificat: "001",
  actions: [{ numero_de: "1", numero_a: "", nombre: 0 }],
  date_certificat: "",
  signataire_fonction: "Le PCA",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: 0,
      titulaire_civilite: "Monsieur",
      titulaire_nom: "",
      titulaire_prenom: "",
      titulaire_adresse: "",
      nombre_actions: 0,
      nombre_actions_lettres: "",
      valeur_nominale_action: 0,
      numero_certificat: "001",
      actions: [{ numero_de: "1", numero_a: "", nombre: 0 }],
      date_certificat: "",
      signataire_fonction: "Le PCA",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Titulaire", "Actions", "Aperçu"];

// -- Main Screen --

export default function CertificatActionsNominativesWizardScreen() {
  const { colors } = useTheme();
  const w = useCertificatActionsNominativesStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/certificat-actions-nominatives", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        titulaire_civilite: w.titulaire_civilite,
        titulaire_nom: w.titulaire_nom,
        titulaire_prenom: w.titulaire_prenom,
        titulaire_adresse: w.titulaire_adresse,
        nombre_actions: w.nombre_actions,
        nombre_actions_lettres: w.nombre_actions_lettres,
        valeur_nominale_action: w.valeur_nominale_action,
        numero_certificat: w.numero_certificat,
        actions: w.actions,
        date_certificat: w.date_certificat || new Date().toLocaleDateString("fr-FR"),
        signataire_fonction: w.signataire_fonction,
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

  // -- Aperçu document temps réel --
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: `Certificat d'Actions nominatives N° ${v(w.numero_certificat)}`, bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `M ${v(w.titulaire_civilite)} ${v(w.titulaire_prenom)} ${v(w.titulaire_nom)}`, spaceBefore: true },
      { text: `Adresse : ${v(w.titulaire_adresse)}` },
      { text: "", spaceBefore: true },
      { text: `est propriétaire de ${v(w.nombre_actions_lettres)} (${w.nombre_actions}) actions nominatives de FCFA ${w.valeur_nominale_action.toLocaleString("fr-FR")}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Total : ${w.nombre_actions} actions`, bold: true },
      { text: "", spaceBefore: true },
      { text: `${v(w.signataire_fonction)}`, spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.titulaire_civilite, w.titulaire_nom, w.titulaire_prenom,
      w.titulaire_adresse, w.nombre_actions, w.nombre_actions_lettres, w.valeur_nominale_action,
      w.numero_certificat, w.signataire_fonction, w.lieu_signature, w.date_signature]);

  const addAction = () => {
    w.set({ actions: [...w.actions, { numero_de: "", numero_a: "", nombre: 0 }] });
  };

  const updateAction = (index: number, field: string, value: string | number) => {
    const newActions = [...w.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    w.set({ actions: newActions });
  };

  const removeAction = (index: number) => {
    if (w.actions.length > 1) {
      w.set({ actions: w.actions.filter((_, i) => i !== index) });
    }
  };

  return (
    <WizardLayout
      title="Certificat d'actions nominatives"
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
          </>
        )}

        {/* -- Étape 1 : Titulaire -- */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.titulaire_civilite} onChange={(v) => w.set({ titulaire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.titulaire_nom} onChangeText={(v) => w.set({ titulaire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.titulaire_prenom} onChangeText={(v) => w.set({ titulaire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.titulaire_adresse} onChangeText={(v) => w.set({ titulaire_adresse: v })} placeholder="Adresse complète du titulaire" />
          </>
        )}

        {/* -- Étape 2 : Actions -- */}
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
              <Field colors={colors} label="Numéro du certificat" value={w.numero_certificat} onChangeText={(v) => w.set({ numero_certificat: v })} placeholder="001" />
              <Field colors={colors} label="Nombre total d'actions" value={w.nombre_actions ? String(w.nombre_actions) : ""} onChangeText={(v) => w.set({ nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
              <Field colors={colors} label="Nombre d'actions (en lettres)" value={w.nombre_actions_lettres} onChangeText={(v) => w.set({ nombre_actions_lettres: v })} placeholder="Ex: cent" />
              <Field colors={colors} label="Valeur nominale de l'action (FCFA)" value={w.valeur_nominale_action ? String(w.valeur_nominale_action) : ""} onChangeText={(v) => w.set({ valeur_nominale_action: parseInt(v) || 0 })} keyboardType="numeric" />
              <Field colors={colors} label="Date du certificat" value={w.date_certificat} onChangeText={(v) => w.set({ date_certificat: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="Détail des actions" colors={colors} />
              {w.actions.map((action, index) => (
                <View key={index} style={{ backgroundColor: colors.card, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary }}>Tranche {index + 1}</Text>
                    {w.actions.length > 1 && (
                      <TouchableOpacity onPress={() => removeAction(index)}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}><Field colors={colors} label="Du n°" value={action.numero_de} onChangeText={(v) => updateAction(index, "numero_de", v)} /></View>
                    <View style={{ flex: 1 }}><Field colors={colors} label="Au n°" value={action.numero_a} onChangeText={(v) => updateAction(index, "numero_a", v)} /></View>
                    <View style={{ flex: 1 }}><Field colors={colors} label="Nombre" value={action.nombre ? String(action.nombre) : ""} onChangeText={(v) => updateAction(index, "nombre", parseInt(v) || 0)} keyboardType="numeric" /></View>
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={addAction} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.primary }}>Ajouter une tranche</Text>
              </TouchableOpacity>

              <SectionTitle title="Signature" colors={colors} />
              <Choice colors={colors} label="Fonction du signataire" options={[{ value: "Le PCA", label: "PCA" }, { value: "Le PDG", label: "PDG" }, { value: "L'Administrateur général", label: "AG" }, { value: "Le Président", label: "Président" }]} value={w.signataire_fonction} onChange={(v) => w.set({ signataire_fonction: v })} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />

              <SectionTitle title="Récapitulatif" colors={colors} />
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                <Row label="Siège social" value={w.siege_social} />
                <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              </Section>
              <Section title="Titulaire">
                <Row label="Identité" value={`${w.titulaire_civilite} ${w.titulaire_prenom} ${w.titulaire_nom}`} />
                <Row label="Adresse" value={w.titulaire_adresse || "—"} />
              </Section>
              <Section title="Actions">
                <Row label="Nombre" value={String(w.nombre_actions)} />
                <Row label="Valeur nominale" value={`${w.valeur_nominale_action.toLocaleString("fr-FR")} FCFA`} />
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
                  CERTIFICAT D'ACTIONS NOMINATIVES N° {w.numero_certificat}
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SA au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  M {w.titulaire_civilite} {w.titulaire_prenom} {w.titulaire_nom} est propriétaire de {w.nombre_actions_lettres} ({w.nombre_actions}) actions nominatives de FCFA {w.valeur_nominale_action.toLocaleString("fr-FR")}.
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
