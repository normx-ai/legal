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

interface BulletinConstitutionState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  souscripteur_civilite: string;
  souscripteur_nom: string;
  souscripteur_prenom: string;
  souscripteur_adresse: string;
  souscripteur_nationalite: string;
  nombre_titres_souscrits: number;
  valeur_nominale: string;
  montant_verse: string;
  mode_liberation: string;
  banque_depot: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<BulletinConstitutionState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<BulletinConstitutionState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  souscripteur_civilite: "Monsieur",
  souscripteur_nom: "",
  souscripteur_prenom: "",
  souscripteur_adresse: "",
  souscripteur_nationalite: "Congolaise",
  nombre_titres_souscrits: 0,
  valeur_nominale: "",
  montant_verse: "",
  mode_liberation: "intégrale",
  banque_depot: "",
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
      souscripteur_civilite: "Monsieur",
      souscripteur_nom: "",
      souscripteur_prenom: "",
      souscripteur_adresse: "",
      souscripteur_nationalite: "Congolaise",
      nombre_titres_souscrits: 0,
      valeur_nominale: "",
      montant_verse: "",
      mode_liberation: "intégrale",
      banque_depot: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Souscripteur", "Souscription", "Aperçu"];

// ── Main Screen ──

export default function BulletinSouscriptionConstitutionWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/bulletin-souscription-constitution", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        rccm: w.rccm,
        souscripteur_civilite: w.souscripteur_civilite,
        souscripteur_nom: w.souscripteur_nom,
        souscripteur_prenom: w.souscripteur_prenom,
        souscripteur_adresse: w.souscripteur_adresse,
        souscripteur_nationalite: w.souscripteur_nationalite,
        nombre_titres_souscrits: w.nombre_titres_souscrits,
        valeur_nominale: w.valeur_nominale,
        montant_verse: w.montant_verse,
        mode_liberation: w.mode_liberation,
        banque_depot: w.banque_depot,
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
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "BULLETIN DE SOUSCRIPTION", bold: true, center: true, size: "lg" as const },
      { text: "(Constitution)", center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Je soussigné(e), ${w.souscripteur_civilite} ${v(w.souscripteur_prenom)} ${v(w.souscripteur_nom)}, de nationalité ${v(w.souscripteur_nationalite)}, demeurant à ${v(w.souscripteur_adresse)},`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `Déclare souscrire ${w.nombre_titres_souscrits || "..."} titres de ${v(w.valeur_nominale)} FCFA chacun, soit un montant total de ${w.montant_verse || "..."} FCFA.`, spaceBefore: true },
      { text: `Mode de libération : ${v(w.mode_liberation)}`, spaceBefore: true },
      { text: `Banque de dépôt : ${v(w.banque_depot)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.souscripteur_civilite, w.souscripteur_nom, w.souscripteur_prenom,
      w.souscripteur_adresse, w.souscripteur_nationalite,
      w.nombre_titres_souscrits, w.valeur_nominale, w.montant_verse,
      w.mode_liberation, w.banque_depot, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Bulletin de souscription (constitution)"
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
              { value: "SAS", label: "SAS" },
              { value: "SARL", label: "SARL" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Field colors={colors} label="RCCM" value={w.rccm} onChangeText={(v) => w.set({ rccm: v })} placeholder="Ex: CG-BZV-01-2026-A12-00001" />
          </>
        )}

        {/* ── Étape 1 : Souscripteur ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.souscripteur_civilite} onChange={(v) => w.set({ souscripteur_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.souscripteur_nom} onChangeText={(v) => w.set({ souscripteur_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.souscripteur_prenom} onChangeText={(v) => w.set({ souscripteur_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.souscripteur_adresse} onChangeText={(v) => w.set({ souscripteur_adresse: v })} placeholder="Adresse complète" />
            <Field colors={colors} label="Nationalité" value={w.souscripteur_nationalite} onChangeText={(v) => w.set({ souscripteur_nationalite: v })} />
          </>
        )}

        {/* ── Étape 2 : Souscription ── */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Nombre de titres souscrits" value={w.nombre_titres_souscrits ? String(w.nombre_titres_souscrits) : ""} onChangeText={(v) => w.set({ nombre_titres_souscrits: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale d'un titre (FCFA)" value={w.valeur_nominale} onChangeText={(v) => w.set({ valeur_nominale: v })} placeholder="Ex: 10 000" />
            <Field colors={colors} label="Montant total versé (FCFA)" value={w.montant_verse} onChangeText={(v) => w.set({ montant_verse: v })} placeholder="Ex: 1 000 000" />
            <Choice colors={colors} label="Mode de libération" options={[
              { value: "intégrale", label: "Intégrale" },
              { value: "partielle", label: "Partielle" },
            ]} value={w.mode_liberation} onChange={(v) => w.set({ mode_liberation: v })} />
            <Field colors={colors} label="Banque de dépôt des fonds" value={w.banque_depot} onChangeText={(v) => w.set({ banque_depot: v })} placeholder="Ex: Banque Commerciale du Congo" />

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
                BULLETIN DE SOUSCRIPTION
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 4 }}>
                (Constitution)
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                {w.forme_juridique} au capital de {w.capital} FCFA
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Je soussigné(e), {w.souscripteur_civilite} {w.souscripteur_prenom} {w.souscripteur_nom}, de nationalité {w.souscripteur_nationalite}, demeurant à {w.souscripteur_adresse}, déclare souscrire {w.nombre_titres_souscrits} titres de {w.valeur_nominale} FCFA chacun.
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Montant versé : {w.montant_verse} FCFA - Libération : {w.mode_liberation} - Banque : {w.banque_depot}
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
