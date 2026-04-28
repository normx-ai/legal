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

// ── Types ──

interface LettreAppelFondsState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  dirigeant_civilite: string;
  dirigeant_nom: string;
  dirigeant_prenom: string;
  dirigeant_qualite: string;
  destinataire_civilite: string;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_adresse: string;
  nombre_titres: number;
  montant_appele: string;
  montant_deja_libere: string;
  montant_restant: string;
  date_limite: string;
  banque_depot: string;
  reference_ag: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<LettreAppelFondsState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useStore = create<LettreAppelFondsState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  dirigeant_civilite: "Monsieur",
  dirigeant_nom: "",
  dirigeant_prenom: "",
  dirigeant_qualite: "Directeur Général",
  destinataire_civilite: "Monsieur",
  destinataire_nom: "",
  destinataire_prenom: "",
  destinataire_adresse: "",
  nombre_titres: 0,
  montant_appele: "",
  montant_deja_libere: "",
  montant_restant: "",
  date_limite: "",
  banque_depot: "",
  reference_ag: "",
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
      dirigeant_civilite: "Monsieur",
      dirigeant_nom: "",
      dirigeant_prenom: "",
      dirigeant_qualite: "Directeur Général",
      destinataire_civilite: "Monsieur",
      destinataire_nom: "",
      destinataire_prenom: "",
      destinataire_adresse: "",
      nombre_titres: 0,
      montant_appele: "",
      montant_deja_libere: "",
      montant_restant: "",
      date_limite: "",
      banque_depot: "",
      reference_ag: "",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Destinataire", "Appel", "Aperçu"];

// ── Main Screen ──

export default function LettreAppelFondsWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/lettre-appel-fonds", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        rccm: w.rccm,
        dirigeant_civilite: w.dirigeant_civilite,
        dirigeant_nom: w.dirigeant_nom,
        dirigeant_prenom: w.dirigeant_prenom,
        dirigeant_qualite: w.dirigeant_qualite,
        destinataire_civilite: w.destinataire_civilite,
        destinataire_nom: w.destinataire_nom,
        destinataire_prenom: w.destinataire_prenom,
        destinataire_adresse: w.destinataire_adresse,
        nombre_titres: w.nombre_titres,
        montant_appele: w.montant_appele,
        montant_deja_libere: w.montant_deja_libere,
        montant_restant: w.montant_restant,
        date_limite: w.date_limite,
        banque_depot: w.banque_depot,
        reference_ag: w.reference_ag,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "LETTRE D'APPEL DE FONDS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `À l'attention de ${w.destinataire_civilite} ${v(w.destinataire_prenom)} ${v(w.destinataire_nom)}`, spaceBefore: true },
      { text: v(w.destinataire_adresse) },
      { text: "", spaceBefore: true },
      { text: `Objet : Appel de fonds - Libération du capital`, bold: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: `${w.destinataire_civilite} ${v(w.destinataire_prenom)} ${v(w.destinataire_nom)},`, spaceBefore: true },
      { text: `Vous êtes titulaire de ${w.nombre_titres || "..."} titres. Le montant appelé est de ${v(w.montant_appele)} FCFA, dont ${v(w.montant_deja_libere)} FCFA déjà libérés. Il reste ${v(w.montant_restant)} FCFA à verser avant le ${v(w.date_limite)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `${w.dirigeant_civilite} ${v(w.dirigeant_prenom)} ${v(w.dirigeant_nom)}, ${v(w.dirigeant_qualite)}`, center: true, spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true },
    ];
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital,
      w.dirigeant_civilite, w.dirigeant_nom, w.dirigeant_prenom, w.dirigeant_qualite,
      w.destinataire_civilite, w.destinataire_nom, w.destinataire_prenom, w.destinataire_adresse,
      w.nombre_titres, w.montant_appele, w.montant_deja_libere, w.montant_restant,
      w.date_limite, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Lettre appel de fonds"
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

            <SectionTitle title="Dirigeant signataire" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.dirigeant_civilite} onChange={(v) => w.set({ dirigeant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.dirigeant_nom} onChangeText={(v) => w.set({ dirigeant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.dirigeant_prenom} onChangeText={(v) => w.set({ dirigeant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Qualité" value={w.dirigeant_qualite} onChangeText={(v) => w.set({ dirigeant_qualite: v })} placeholder="Ex: Directeur Général" />
          </>
        )}

        {/* ── Étape 1 : Destinataire ── */}
        {w.currentStep === 1 && (
          <>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.destinataire_civilite} onChange={(v) => w.set({ destinataire_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.destinataire_nom} onChangeText={(v) => w.set({ destinataire_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.destinataire_prenom} onChangeText={(v) => w.set({ destinataire_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.destinataire_adresse} onChangeText={(v) => w.set({ destinataire_adresse: v })} placeholder="Adresse complète" />
          </>
        )}

        {/* ── Étape 2 : Appel ── */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Nombre de titres détenus" value={w.nombre_titres ? String(w.nombre_titres) : ""} onChangeText={(v) => w.set({ nombre_titres: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Montant total appelé (FCFA)" value={w.montant_appele} onChangeText={(v) => w.set({ montant_appele: v })} placeholder="Ex: 5 000 000" />
            <Field colors={colors} label="Montant déjà libéré (FCFA)" value={w.montant_deja_libere} onChangeText={(v) => w.set({ montant_deja_libere: v })} placeholder="Ex: 2 500 000" />
            <Field colors={colors} label="Montant restant dû (FCFA)" value={w.montant_restant} onChangeText={(v) => w.set({ montant_restant: v })} placeholder="Ex: 2 500 000" />
            <Field colors={colors} label="Date limite de versement" value={w.date_limite} onChangeText={(v) => w.set({ date_limite: v })} placeholder="Ex: 30 avril 2026" />
            <Field colors={colors} label="Banque de dépôt" value={w.banque_depot} onChangeText={(v) => w.set({ banque_depot: v })} placeholder="Ex: Banque Commerciale du Congo" />
            <Field colors={colors} label="Référence de la décision (AG)" value={w.reference_ag} onChangeText={(v) => w.set({ reference_ag: v })} placeholder="Ex: AGE du 15 mars 2026" />

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
                LETTRE D'APPEL DE FONDS
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                {w.denomination}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                À l'attention de {w.destinataire_civilite} {w.destinataire_prenom} {w.destinataire_nom}, {w.destinataire_adresse}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                Vous êtes titulaire de {w.nombre_titres} titres. Montant appelé : {w.montant_appele} FCFA. Déjà libéré : {w.montant_deja_libere} FCFA. Restant : {w.montant_restant} FCFA. Date limite : {w.date_limite}.
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
