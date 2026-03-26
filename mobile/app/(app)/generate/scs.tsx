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

interface Associe {
  civilite: string; nom: string; prenom: string; date_naissance: string; lieu_naissance: string;
  nationalite: string; profession: string; adresse: string; apport: number;
}

interface ScsState {
  denomination: string; objet_social: string; siege_social: string; ville: string; pays: string;
  duree: number; capital: number; valeur_nominale: number;
  commandites: Associe[];
  commanditaires: Associe[];
  gerant_civilite: string; gerant_nom: string; gerant_prenom: string; gerant_date_naissance: string;
  gerant_lieu_naissance: string; gerant_nationalite: string; gerant_adresse: string; gerant_duree_mandat: string;
  lieu_signature: string; date_signature: string; currentStep: number;
  set: (data: Partial<ScsState>) => void;
  nextStep: () => void; prevStep: () => void; reset: () => void;
  addCommandite: () => void; removeCommandite: (i: number) => void; updateCommandite: (i: number, data: Partial<Associe>) => void;
  addCommanditaire: () => void; removeCommanditaire: (i: number) => void; updateCommanditaire: (i: number, data: Partial<Associe>) => void;
}

const emptyAssoc = (): Associe => ({ civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "", nationalite: "congolaise", profession: "", adresse: "", apport: 0 });

const useStore = create<ScsState>((set) => ({
  denomination: "", objet_social: "", siege_social: "", ville: "Brazzaville", pays: "R\u00e9publique du Congo",
  duree: 99, capital: 0, valeur_nominale: 10000,
  commandites: [emptyAssoc()], commanditaires: [emptyAssoc()],
  gerant_civilite: "Monsieur", gerant_nom: "", gerant_prenom: "", gerant_date_naissance: "",
  gerant_lieu_naissance: "", gerant_nationalite: "congolaise", gerant_adresse: "", gerant_duree_mandat: "dur\u00e9e de la soci\u00e9t\u00e9",
  lieu_signature: "Brazzaville", date_signature: "", currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ denomination: "", objet_social: "", siege_social: "", ville: "Brazzaville", pays: "R\u00e9publique du Congo", duree: 99, capital: 0, valeur_nominale: 10000, commandites: [emptyAssoc()], commanditaires: [emptyAssoc()], gerant_civilite: "Monsieur", gerant_nom: "", gerant_prenom: "", gerant_date_naissance: "", gerant_lieu_naissance: "", gerant_nationalite: "congolaise", gerant_adresse: "", gerant_duree_mandat: "dur\u00e9e de la soci\u00e9t\u00e9", lieu_signature: "Brazzaville", date_signature: "", currentStep: 0 }),
  addCommandite: () => set((s) => ({ commandites: [...s.commandites, emptyAssoc()] })),
  removeCommandite: (i) => set((s) => ({ commandites: s.commandites.filter((_, idx) => idx !== i) })),
  updateCommandite: (i, data) => set((s) => ({ commandites: s.commandites.map((a, idx) => idx === i ? { ...a, ...data } : a) })),
  addCommanditaire: () => set((s) => ({ commanditaires: [...s.commanditaires, emptyAssoc()] })),
  removeCommanditaire: (i) => set((s) => ({ commanditaires: s.commanditaires.filter((_, idx) => idx !== i) })),
  updateCommanditaire: (i, data) => set((s) => ({ commanditaires: s.commanditaires.map((a, idx) => idx === i ? { ...a, ...data } : a) })),
}));

const STEPS = ["Soci\u00e9t\u00e9", "Commandit\u00e9s", "Commanditaires", "Capital", "G\u00e9rance", "Aper\u00e7u"];

export default function ScsWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true); setError("");
    try {
      const { data } = await documentsApi.generate("/generate/scs", {
        denomination: w.denomination, objet_social: w.objet_social, siege_social: w.siege_social,
        ville: w.ville, pays: w.pays, duree: w.duree, capital: w.capital, valeur_nominale: w.valeur_nominale,
        commandites: w.commandites, commanditaires: w.commanditaires,
        gerant: { civilite: w.gerant_civilite, nom: w.gerant_nom, prenom: w.gerant_prenom, date_naissance: w.gerant_date_naissance, lieu_naissance: w.gerant_lieu_naissance, nationalite: w.gerant_nationalite, adresse: w.gerant_adresse, duree_mandat: w.gerant_duree_mandat },
        lieu_signature: w.lieu_signature, date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
      addDocument(data.document); setGeneratedUrl(data.docx_url); w.nextStep();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } };
      const errors = e.response?.data?.errors;
      if (errors && Array.isArray(errors)) { setError(errors.map((x) => x.message).join("\n")); }
      else { setError(e.response?.data?.error || "Erreur lors de la g\u00e9n\u00e9ration"); }
    } finally { setIsGenerating(false); }
  }, [w, addDocument]);

  const handleDownload = useCallback(() => {
    if (generatedUrl && Platform.OS === "web") {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
      window.open(`${baseUrl.replace(/\/api$/, "")}${generatedUrl}`, "_blank");
    }
  }, [generatedUrl]);

  const isLastDataStep = w.currentStep === 4;
  const isDownloadStep = w.currentStep === 5;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    return [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "Soci\u00e9t\u00e9 en Commandite Simple", center: true, size: "md" as const },
      { text: `Capital : ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "sm" as const },
      { text: "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501", center: true },
      { text: `Commandit\u00e9s : ${w.commandites.length} | Commanditaires : ${w.commanditaires.length}`, spaceBefore: true },
      { text: `G\u00e9rant : ${v(w.gerant_prenom)} ${v(w.gerant_nom)}` },
      { text: `Fait \u00e0 ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    ];
  }, [w.denomination, w.capital, w.commandites.length, w.commanditaires.length, w.gerant_nom, w.gerant_prenom, w.lieu_signature, w.date_signature]);

  const renderAssocieForm = (list: Associe[], type: string, update: (i: number, d: Partial<Associe>) => void, remove: (i: number) => void, add: () => void, minCount: number) => (
    <>
      {list.map((a, i) => (
        <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.primary }}>{type} {i + 1}</Text>
            {list.length > minCount && (
              <TouchableOpacity onPress={() => remove(i)}><Ionicons name="trash-outline" size={20} color={colors.danger || "#ef4444"} /></TouchableOpacity>
            )}
          </View>
          <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={a.civilite} onChange={(v) => update(i, { civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => update(i, { nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={a.prenom} onChangeText={(v) => update(i, { prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Date de naissance" value={a.date_naissance} onChangeText={(v) => update(i, { date_naissance: v })} placeholder="Ex: 01/01/1980" />
          <Field colors={colors} label="Lieu de naissance" value={a.lieu_naissance} onChangeText={(v) => update(i, { lieu_naissance: v })} />
          <Field colors={colors} label="Nationalit\u00e9" value={a.nationalite} onChangeText={(v) => update(i, { nationalite: v })} />
          <Field colors={colors} label="Profession" value={a.profession} onChangeText={(v) => update(i, { profession: v })} />
          <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => update(i, { adresse: v })} />
          <Field colors={colors} label="Apport (FCFA)" value={a.apport ? String(a.apport) : ""} onChangeText={(v) => update(i, { apport: parseInt(v) || 0 })} keyboardType="numeric" />
        </View>
      ))}
      <TouchableOpacity onPress={add} style={{ backgroundColor: colors.primary + "15", padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
        <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>+ Ajouter un {type.toLowerCase()}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <WizardLayout title="Statuts SCS" steps={STEPS} currentStep={w.currentStep}
      onBack={() => { if (w.currentStep === 0) router.back(); else w.prevStep(); }}
      onPrev={w.prevStep} onNext={isLastDataStep ? handleGenerate : w.nextStep}
      isLastDataStep={isLastDataStep} isDownloadStep={isDownloadStep} isGenerating={isGenerating} error={error} previewLines={previewLines}>

        {w.currentStep === 0 && (
          <>
            <SectionTitle title="Informations g\u00e9n\u00e9rales" colors={colors} />
            <Field colors={colors} label="D\u00e9nomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: DUPONT ET CIE SCS" />
            <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.set({ objet_social: v })} multiline />
            <Field colors={colors} label="Si\u00e8ge social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} />
            <Field colors={colors} label="Ville" value={w.ville} onChangeText={(v) => w.set({ ville: v })} />
            <Field colors={colors} label="Pays" value={w.pays} onChangeText={(v) => w.set({ pays: v })} />
            <Field colors={colors} label="Dur\u00e9e (ann\u00e9es)" value={w.duree ? String(w.duree) : ""} onChangeText={(v) => w.set({ duree: parseInt(v) || 0 })} keyboardType="numeric" />
          </>
        )}

        {w.currentStep === 1 && (
          <>
            <SectionTitle title={`Commandit\u00e9s - responsabilit\u00e9 illimit\u00e9e (${w.commandites.length})`} colors={colors} />
            {renderAssocieForm(w.commandites, "Commandit\u00e9", w.updateCommandite, w.removeCommandite, w.addCommandite, 1)}
          </>
        )}

        {w.currentStep === 2 && (
          <>
            <SectionTitle title={`Commanditaires - responsabilit\u00e9 limit\u00e9e (${w.commanditaires.length})`} colors={colors} />
            {renderAssocieForm(w.commanditaires, "Commanditaire", w.updateCommanditaire, w.removeCommanditaire, w.addCommanditaire, 1)}
          </>
        )}

        {w.currentStep === 3 && (
          <>
            <SectionTitle title="Capital social" colors={colors} />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital ? String(w.capital) : ""} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale d'une part (FCFA)" value={w.valeur_nominale ? String(w.valeur_nominale) : ""} onChangeText={(v) => w.set({ valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
            {w.capital > 0 && w.valeur_nominale > 0 && (
              <View style={{ backgroundColor: colors.card, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text }}>Nombre de parts : {Math.floor(w.capital / w.valeur_nominale)}</Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginTop: 4 }}>Total commandit\u00e9s : {w.commandites.reduce((s, a) => s + a.apport, 0).toLocaleString("fr-FR")} FCFA</Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginTop: 4 }}>Total commanditaires : {w.commanditaires.reduce((s, a) => s + a.apport, 0).toLocaleString("fr-FR")} FCFA</Text>
              </View>
            )}
          </>
        )}

        {w.currentStep === 4 && (
          <>
            <SectionTitle title="G\u00e9rance (choisi parmi les commandit\u00e9s)" colors={colors} />
            <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "M" }, { value: "Madame", label: "Mme" }]} value={w.gerant_civilite} onChange={(v) => w.set({ gerant_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant_nom} onChangeText={(v) => w.set({ gerant_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={w.gerant_prenom} onChangeText={(v) => w.set({ gerant_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Date de naissance" value={w.gerant_date_naissance} onChangeText={(v) => w.set({ gerant_date_naissance: v })} />
            <Field colors={colors} label="Lieu de naissance" value={w.gerant_lieu_naissance} onChangeText={(v) => w.set({ gerant_lieu_naissance: v })} />
            <Field colors={colors} label="Nationalit\u00e9" value={w.gerant_nationalite} onChangeText={(v) => w.set({ gerant_nationalite: v })} />
            <Field colors={colors} label="Adresse" value={w.gerant_adresse} onChangeText={(v) => w.set({ gerant_adresse: v })} />
            <Field colors={colors} label="Dur\u00e9e du mandat" value={w.gerant_duree_mandat} onChangeText={(v) => w.set({ gerant_duree_mandat: v })} />
            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {w.currentStep === 5 && (
          <>
            <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>STATUTS SCS</Text>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>{w.denomination}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center" }}>Soci\u00e9t\u00e9 en Commandite Simple au capital de {w.capital.toLocaleString("fr-FR")} FCFA</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 8 }}>Commandit\u00e9s : {w.commandites.length} | Commanditaires : {w.commanditaires.length}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>... Document complet dans le fichier DOCX ...</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                Fait \u00e0 {w.lieu_signature || "Brazzaville"}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}
              </Text>
            </View>
            <View style={{ alignItems: "center", paddingBottom: 24 }}>
              {generatedUrl ? (
                <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
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
