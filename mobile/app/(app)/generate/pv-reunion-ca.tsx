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

interface Administrateur {
  civilite: string;
  prenom: string;
  nom: string;
}

interface AdministrateurRepresente {
  civilite: string;
  prenom: string;
  nom: string;
  represente_par: string;
}

interface PvReunionCaState {
  denomination: string;
  siege_social: string;
  capital: string;
  date_reunion: string;
  date_reunion_lettres: string;
  heure_reunion: string;
  heure_reunion_lettres: string;
  lieu_reunion: string;
  president_civilite: string;
  president_nom: string;
  president_prenom: string;
  secretaire_nom: string;
  administrateurs_presents: Administrateur[];
  administrateurs_representes: AdministrateurRepresente[];
  administrateurs_absents: Administrateur[];
  commissaire_present: boolean;
  commissaire_nom: string;
  decisions_selectionnees: string[];
  // Conditional fields
  exercice_clos_le: string;
  projet_repartition: string;
  convention_details: string;
  ancien_siege: string;
  nouveau_siege: string;
  date_convocation_ag: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PvReunionCaState>) => void;
  setAdminPresent: (i: number, data: Partial<Administrateur>) => void;
  addAdminPresent: () => void;
  removeAdminPresent: (i: number) => void;
  setAdminRepresente: (i: number, data: Partial<AdministrateurRepresente>) => void;
  addAdminRepresente: () => void;
  removeAdminRepresente: (i: number) => void;
  setAdminAbsent: (i: number, data: Partial<Administrateur>) => void;
  addAdminAbsent: () => void;
  removeAdminAbsent: (i: number) => void;
  toggleDecision: (d: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<PvReunionCaState, "set" | "setAdminPresent" | "addAdminPresent" | "removeAdminPresent" | "setAdminRepresente" | "addAdminRepresente" | "removeAdminRepresente" | "setAdminAbsent" | "addAdminAbsent" | "removeAdminAbsent" | "toggleDecision" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  date_reunion: "",
  date_reunion_lettres: "",
  heure_reunion: "",
  heure_reunion_lettres: "",
  lieu_reunion: "",
  president_civilite: "Monsieur",
  president_nom: "",
  president_prenom: "",
  secretaire_nom: "",
  administrateurs_presents: [{ civilite: "Monsieur", prenom: "", nom: "" }],
  administrateurs_representes: [],
  administrateurs_absents: [],
  commissaire_present: false,
  commissaire_nom: "",
  decisions_selectionnees: [],
  exercice_clos_le: "",
  projet_repartition: "",
  convention_details: "",
  ancien_siege: "",
  nouveau_siege: "",
  date_convocation_ag: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<PvReunionCaState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  setAdminPresent: (i, data) =>
    set((s) => {
      const administrateurs_presents = [...s.administrateurs_presents];
      administrateurs_presents[i] = { ...administrateurs_presents[i], ...data };
      return { administrateurs_presents };
    }),
  addAdminPresent: () =>
    set((s) => ({
      administrateurs_presents: [...s.administrateurs_presents, { civilite: "Monsieur", prenom: "", nom: "" }],
    })),
  removeAdminPresent: (i) =>
    set((s) => ({
      administrateurs_presents: s.administrateurs_presents.filter((_, idx) => idx !== i),
    })),
  setAdminRepresente: (i, data) =>
    set((s) => {
      const administrateurs_representes = [...s.administrateurs_representes];
      administrateurs_representes[i] = { ...administrateurs_representes[i], ...data };
      return { administrateurs_representes };
    }),
  addAdminRepresente: () =>
    set((s) => ({
      administrateurs_representes: [...s.administrateurs_representes, { civilite: "Monsieur", prenom: "", nom: "", represente_par: "" }],
    })),
  removeAdminRepresente: (i) =>
    set((s) => ({
      administrateurs_representes: s.administrateurs_representes.filter((_, idx) => idx !== i),
    })),
  setAdminAbsent: (i, data) =>
    set((s) => {
      const administrateurs_absents = [...s.administrateurs_absents];
      administrateurs_absents[i] = { ...administrateurs_absents[i], ...data };
      return { administrateurs_absents };
    }),
  addAdminAbsent: () =>
    set((s) => ({
      administrateurs_absents: [...s.administrateurs_absents, { civilite: "Monsieur", prenom: "", nom: "" }],
    })),
  removeAdminAbsent: (i) =>
    set((s) => ({
      administrateurs_absents: s.administrateurs_absents.filter((_, idx) => idx !== i),
    })),
  toggleDecision: (d) =>
    set((s) => ({
      decisions_selectionnees: s.decisions_selectionnees.includes(d)
        ? s.decisions_selectionnees.filter((x) => x !== d)
        : [...s.decisions_selectionnees, d],
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL, administrateurs_presents: [{ civilite: "Monsieur", prenom: "", nom: "" }], administrateurs_representes: [], administrateurs_absents: [], decisions_selectionnees: [] }),
}));

const STEPS = ["Société", "Réunion", "Administrateurs", "Résolutions", "Détails", "Aperçu"];

const DECISIONS_LIST: { key: string; label: string }[] = [
  { key: "arrete_comptes", label: "Arrêté des comptes" },
  { key: "nomination_president", label: "Nomination du président" },
  { key: "demission_president", label: "Démission du président" },
  { key: "revocation_president", label: "Révocation du président" },
  { key: "nomination_dg", label: "Nomination du directeur général" },
  { key: "autorisation_conventions", label: "Autorisation des conventions" },
  { key: "cooptation", label: "Cooptation d'un administrateur" },
  { key: "transfert_siege", label: "Transfert du siège social" },
  { key: "rapport_ag", label: "Rapport à l'AG" },
  { key: "convocation_ag", label: "Convocation de l'AG" },
];

// ── Main Screen ──

export default function PvReunionCaWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const has = (d: string) => w.decisions_selectionnees.includes(d);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/pv-reunion-ca", {
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: w.capital,
        date_reunion: w.date_reunion,
        date_reunion_lettres: w.date_reunion_lettres,
        heure_reunion: w.heure_reunion,
        heure_reunion_lettres: w.heure_reunion_lettres,
        lieu_reunion: w.lieu_reunion,
        president_civilite: w.president_civilite,
        president_nom: w.president_nom,
        president_prenom: w.president_prenom,
        secretaire_nom: w.secretaire_nom,
        administrateurs_presents: w.administrateurs_presents,
        administrateurs_representes: w.administrateurs_representes,
        administrateurs_absents: w.administrateurs_absents,
        commissaire_present: w.commissaire_present,
        commissaire_nom: w.commissaire_present ? w.commissaire_nom : undefined,
        decisions_selectionnees: w.decisions_selectionnees,
        exercice_clos_le: has("arrete_comptes") ? w.exercice_clos_le : undefined,
        projet_repartition: has("arrete_comptes") ? w.projet_repartition : undefined,
        convention_details: has("autorisation_conventions") ? w.convention_details : undefined,
        ancien_siege: has("transfert_siege") ? w.ancien_siege : undefined,
        nouveau_siege: has("transfert_siege") ? w.nouveau_siege : undefined,
        date_convocation_ag: has("convocation_ag") ? w.date_convocation_ag : undefined,
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

  const isLastDataStep = w.currentStep === 4;
  const isDownloadStep = w.currentStep === 5;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `SA au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL DE RÉUNION DU CONSEIL D'ADMINISTRATION", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Le ${v(w.date_reunion)}, à ${v(w.heure_reunion)}, le Conseil d'Administration de la société ${v(w.denomination)} s'est réuni à ${v(w.lieu_reunion)}, sous la présidence de ${v(w.president_civilite)} ${v(w.president_prenom)} ${v(w.president_nom)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Administrateurs présents :", bold: true, spaceBefore: true },
    ];
    w.administrateurs_presents.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Administrateur ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}` });
    });
    if (w.administrateurs_representes.length > 0) {
      lines.push({ text: "Administrateurs représentés :", bold: true, spaceBefore: true });
      w.administrateurs_representes.forEach((a) => {
        const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : "(à compléter)";
        lines.push({ text: `- ${nom} (représenté par ${a.represente_par || "..."})` });
      });
    }
    if (w.administrateurs_absents.length > 0) {
      lines.push({ text: "Administrateurs absents :", bold: true, spaceBefore: true });
      w.administrateurs_absents.forEach((a) => {
        const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : "(à compléter)";
        lines.push({ text: `- ${nom}` });
      });
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Résolutions :", bold: true, spaceBefore: true },
    );
    w.decisions_selectionnees.forEach((d) => {
      const found = DECISIONS_LIST.find((x) => x.key === d);
      if (found) lines.push({ text: `- ${found.label}` });
    });
    if (w.decisions_selectionnees.length === 0) {
      lines.push({ text: "(aucune résolution sélectionnée)", italic: true });
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.date_reunion, w.heure_reunion, w.lieu_reunion,
      w.president_civilite, w.president_nom, w.president_prenom,
      w.administrateurs_presents, w.administrateurs_representes, w.administrateurs_absents,
      w.decisions_selectionnees, w.lieu_signature, w.date_signature]);

  // Helper to render an admin card
  const renderAdminCard = (
    label: string,
    list: Administrateur[],
    setFn: (i: number, data: Partial<Administrateur>) => void,
    removeFn: (i: number) => void,
    addFn: () => void,
    addLabel: string,
    minCount: number,
  ) => (
    <>
      <SectionTitle title={label} colors={colors} />
      {list.map((a, i) => (
        <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>{label.replace(/s$/, "")} {i + 1}</Text>
            {list.length > minCount && (
              <TouchableOpacity onPress={() => removeFn(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
            )}
          </View>
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => setFn(i, { civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => setFn(i, { prenom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => setFn(i, { nom: v })} /></View>
          </View>
        </View>
      ))}
      {list.length < 50 && (
        <TouchableOpacity onPress={addFn}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>{addLabel}</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <WizardLayout
      title="PV réunion du Conseil d'Administration (SA)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA INDUSTRIES SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
          </>
        )}

        {/* ── Étape 1 : Réunion ── */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Date de la réunion" value={w.date_reunion} onChangeText={(v) => w.set({ date_reunion: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Date de la réunion (en lettres)" value={w.date_reunion_lettres} onChangeText={(v) => w.set({ date_reunion_lettres: v })} placeholder="Ex: quinze mars deux mille vingt-six" />
            <Field colors={colors} label="Heure de la réunion" value={w.heure_reunion} onChangeText={(v) => w.set({ heure_reunion: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Heure de la réunion (en lettres)" value={w.heure_reunion_lettres} onChangeText={(v) => w.set({ heure_reunion_lettres: v })} placeholder="Ex: dix heures" />
            <Field colors={colors} label="Lieu de la réunion" value={w.lieu_reunion} onChangeText={(v) => w.set({ lieu_reunion: v })} placeholder="Ex: au siège social" />

            <SectionTitle title="Président de séance" colors={colors} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_civilite} onChange={(v) => w.set({ president_civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_nom} onChangeText={(v) => w.set({ president_nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president_prenom} onChangeText={(v) => w.set({ president_prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Nom du secrétaire de séance" value={w.secretaire_nom} onChangeText={(v) => w.set({ secretaire_nom: v })} />
          </>
        )}

        {/* ── Étape 2 : Administrateurs ── */}
        {w.currentStep === 2 && (
          <>
            {renderAdminCard(
              "Administrateurs présents",
              w.administrateurs_presents,
              w.setAdminPresent,
              w.removeAdminPresent,
              w.addAdminPresent,
              "Ajouter un administrateur présent",
              1,
            )}

            <SectionTitle title="Administrateurs représentés" colors={colors} />
            {w.administrateurs_representes.map((a, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Administrateur représenté {i + 1}</Text>
                  <TouchableOpacity onPress={() => w.removeAdminRepresente(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => w.setAdminRepresente(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => w.setAdminRepresente(i, { prenom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setAdminRepresente(i, { nom: v })} /></View>
                </View>
                <Field colors={colors} label="Représenté par" value={a.represente_par} onChangeText={(v) => w.setAdminRepresente(i, { represente_par: v })} placeholder="Nom du représentant" />
              </View>
            ))}
            {w.administrateurs_representes.length < 50 && (
              <TouchableOpacity onPress={w.addAdminRepresente}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un administrateur représenté</Text>
              </TouchableOpacity>
            )}

            {renderAdminCard(
              "Administrateurs absents",
              w.administrateurs_absents,
              w.setAdminAbsent,
              w.removeAdminAbsent,
              w.addAdminAbsent,
              "Ajouter un administrateur absent",
              0,
            )}

            <SectionTitle title="Commissaire aux comptes" colors={colors} />
            <ToggleRow colors={colors} label="Commissaire aux comptes présent" value={w.commissaire_present} onToggle={(v) => w.set({ commissaire_present: v })} />
            {w.commissaire_present && (
              <View style={{ paddingLeft: 12, marginTop: 8 }}>
                <Field colors={colors} label="Nom du commissaire" value={w.commissaire_nom} onChangeText={(v) => w.set({ commissaire_nom: v })} />
              </View>
            )}
          </>
        )}

        {/* ── Étape 3 : Résolutions ── */}
        {w.currentStep === 3 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Sélectionnez les résolutions soumises au Conseil d'Administration.
            </Text>
            {DECISIONS_LIST.map((d) => (
              <ToggleRow key={d.key} colors={colors} label={d.label} value={w.decisions_selectionnees.includes(d.key)} onToggle={() => w.toggleDecision(d.key)} />
            ))}
          </>
        )}

        {/* ── Étape 4 : Détails ── */}
        {w.currentStep === 4 && (
          <>
            {has("arrete_comptes") && (
              <>
                <SectionTitle title="Arrêté des comptes" colors={colors} />
                <Field colors={colors} label="Exercice clos le" value={w.exercice_clos_le} onChangeText={(v) => w.set({ exercice_clos_le: v })} placeholder="Ex: 31 décembre 2025" />
                <Field colors={colors} label="Projet de répartition" value={w.projet_repartition} onChangeText={(v) => w.set({ projet_repartition: v })} placeholder="Décrire le projet de répartition..." multiline />
              </>
            )}

            {has("autorisation_conventions") && (
              <>
                <SectionTitle title="Autorisation des conventions" colors={colors} />
                <Field colors={colors} label="Détails des conventions" value={w.convention_details} onChangeText={(v) => w.set({ convention_details: v })} placeholder="Décrire les conventions à autoriser..." multiline />
              </>
            )}

            {has("transfert_siege") && (
              <>
                <SectionTitle title="Transfert du siège social" colors={colors} />
                <Field colors={colors} label="Ancien siège" value={w.ancien_siege} onChangeText={(v) => w.set({ ancien_siege: v })} />
                <Field colors={colors} label="Nouveau siège" value={w.nouveau_siege} onChangeText={(v) => w.set({ nouveau_siege: v })} />
              </>
            )}

            {has("convocation_ag") && (
              <>
                <SectionTitle title="Convocation de l'AG" colors={colors} />
                <Field colors={colors} label="Date de convocation de l'AG" value={w.date_convocation_ag} onChangeText={(v) => w.set({ date_convocation_ag: v })} placeholder="Ex: 30 avril 2026" />
              </>
            )}

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 5 : Aperçu + Téléchargement ── */}
        {w.currentStep === 5 && (() => {
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PROCÈS-VERBAL DE RÉUNION DU CONSEIL D'ADMINISTRATION
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  SA au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Le {w.date_reunion}, à {w.heure_reunion}, le Conseil d'Administration de la société {w.denomination} s'est réuni à {w.lieu_reunion}, sous la présidence de {w.president_civilite} {w.president_prenom} {w.president_nom}.
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Présents</Text>
                {w.administrateurs_presents.map((a, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>- {a.civilite} {a.prenom} {a.nom}</Text>
                ))}

                {w.administrateurs_representes.length > 0 && (
                  <>
                    <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Représentés</Text>
                    {w.administrateurs_representes.map((a, i) => (
                      <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>- {a.civilite} {a.prenom} {a.nom} (par {a.represente_par})</Text>
                    ))}
                  </>
                )}

                {w.administrateurs_absents.length > 0 && (
                  <>
                    <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Absents</Text>
                    {w.administrateurs_absents.map((a, i) => (
                      <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>- {a.civilite} {a.prenom} {a.nom}</Text>
                    ))}
                  </>
                )}

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Résolutions</Text>
                {w.decisions_selectionnees.map((d) => {
                  const found = DECISIONS_LIST.find((x) => x.key === d);
                  return found ? (
                    <Text key={d} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151" }}>- {found.label}</Text>
                  ) : null;
                })}

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
