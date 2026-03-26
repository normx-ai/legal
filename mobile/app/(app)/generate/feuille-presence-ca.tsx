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

interface Administrateur {
  civilite: string;
  nom: string;
  prenom: string;
  qualite: string;
  present: boolean;
  represente_par: string;
}

interface FeuillePresenceCaState {
  denomination: string;
  siege_social: string;
  capital: string;
  date_reunion: string;
  heure_reunion: string;
  lieu_reunion: string;
  president_nom: string;
  secretaire_nom: string;
  administrateurs: Administrateur[];
  currentStep: number;
  set: (data: Partial<FeuillePresenceCaState>) => void;
  setAdministrateur: (i: number, data: Partial<Administrateur>) => void;
  addAdministrateur: () => void;
  removeAdministrateur: (i: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// -- Store --

const useStore = create<FeuillePresenceCaState>((set) => ({
  denomination: "",
  siege_social: "",
  capital: "",
  date_reunion: "",
  heure_reunion: "",
  lieu_reunion: "",
  president_nom: "",
  secretaire_nom: "",
  administrateurs: [{ civilite: "Monsieur", nom: "", prenom: "", qualite: "Administrateur", present: true, represente_par: "" }],
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  setAdministrateur: (i, data) =>
    set((s) => {
      const administrateurs = [...s.administrateurs];
      administrateurs[i] = { ...administrateurs[i], ...data };
      return { administrateurs };
    }),
  addAdministrateur: () =>
    set((s) => ({
      administrateurs: [...s.administrateurs, { civilite: "Monsieur", nom: "", prenom: "", qualite: "Administrateur", present: true, represente_par: "" }],
    })),
  removeAdministrateur: (i) =>
    set((s) => ({
      administrateurs: s.administrateurs.filter((_, idx) => idx !== i),
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      siege_social: "",
      capital: "",
      date_reunion: "",
      heure_reunion: "",
      lieu_reunion: "",
      president_nom: "",
      secretaire_nom: "",
      administrateurs: [{ civilite: "Monsieur", nom: "", prenom: "", qualite: "Administrateur", present: true, represente_par: "" }],
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Réunion", "Administrateurs", "Aperçu"];

// -- Main Screen --

export default function FeuillePresenceCaWizardScreen() {
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
      const { data } = await documentsApi.generate("/generate/feuille-presence-ca", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        date_reunion: w.date_reunion,
        heure_reunion: w.heure_reunion,
        lieu_reunion: w.lieu_reunion,
        president_nom: w.president_nom,
        secretaire_nom: w.secretaire_nom,
        administrateurs: w.administrateurs,
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

  // -- Apercu document temps reel --
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: `Capital : ${v(w.capital)} FCFA`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "FEUILLE DE PRÉSENCE", bold: true, center: true, size: "lg" as const },
      { text: "CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Réunion du ${v(w.date_reunion)} à ${v(w.heure_reunion)}`, spaceBefore: true },
      { text: `Lieu : ${v(w.lieu_reunion)}` },
      { text: `Président de séance : ${v(w.president_nom)}` },
      { text: `Secrétaire : ${v(w.secretaire_nom)}` },
      { text: "", spaceBefore: true },
      { text: "Administrateurs", bold: true, spaceBefore: true },
    ];
    w.administrateurs.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Administrateur ${i + 1} (à compléter)`;
      const status = a.present ? "Présent" : `Absent - représenté par ${a.represente_par || "..."}`;
      lines.push({ text: `- ${nom} (${a.qualite}) : ${status}` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.date_reunion, w.heure_reunion,
      w.lieu_reunion, w.president_nom, w.secretaire_nom, w.administrateurs]);

  return (
    <WizardLayout
      title="Feuille de présence CA (SA)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
          </>
        )}

        {/* -- Etape 1 : Reunion -- */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Date de la réunion" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder="Ex: 20 mars 2026" />
            <Field colors={colors} label="Heure de la réunion" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Lieu de la réunion" value={w.lieu_reunion} onChangeText={(v) => w.set({ lieu_reunion: v })} placeholder="Ex: Siège social, Brazzaville" />
            <Field colors={colors} label="Nom du président de séance" value={w.president_nom} onChangeText={(v) => w.set({ president_nom: v })} placeholder="Ex: Jean DUPONT" />
            <Field colors={colors} label="Nom du secrétaire" value={w.secretaire_nom} onChangeText={(v) => w.set({ secretaire_nom: v })} placeholder="Ex: Marie MARTIN" />
          </>
        )}

        {/* -- Etape 2 : Administrateurs -- */}
        {w.currentStep === 2 && (
          <>
            {w.administrateurs.map((a, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Administrateur {i + 1}</Text>
                  {w.administrateurs.length > 1 && (
                    <TouchableOpacity onPress={() => w.removeAdministrateur(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => w.setAdministrateur(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setAdministrateur(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => w.setAdministrateur(i, { prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Qualité" value={a.qualite} onChangeText={(v) => w.setAdministrateur(i, { qualite: v })} placeholder="Administrateur" />
                <View style={{ marginTop: 8 }}>
                  <ToggleRow colors={colors} label="Présent" value={a.present} onToggle={(v) => w.setAdministrateur(i, { present: v })} />
                </View>
                {!a.present && (
                  <View style={{ marginTop: 12 }}>
                    <Field colors={colors} label="Représenté par" value={a.represente_par} onChangeText={(v) => w.setAdministrateur(i, { represente_par: v })} placeholder="Nom du représentant" />
                  </View>
                )}
              </View>
            ))}
            {w.administrateurs.length < 50 && (
              <TouchableOpacity onPress={w.addAdministrateur}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un administrateur</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* -- Etape 3 : Apercu + Telechargement -- */}
        {w.currentStep === 3 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  FEUILLE DE PRÉSENCE
                </Text>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  CONSEIL D'ADMINISTRATION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  Capital : {w.capital} FCFA - Siège : {w.siege_social}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Réunion</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                  Date : {w.date_reunion || "..."} - Heure : {w.heure_reunion || "..."}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Lieu : {w.lieu_reunion || "..."} - Président : {w.president_nom || "..."}
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Administrateurs ({w.administrateurs.length})</Text>
                {w.administrateurs.map((a, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 4 }}>
                    {a.civilite} {a.prenom} {a.nom} ({a.qualite}) - {a.present ? "Présent" : `Absent (repr. par ${a.represente_par || "..."})`}
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
