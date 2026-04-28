import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Switch } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──
interface SasAssocie {
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  profession: string;
  adresse: string;
  apport: number;
  type_apport: string;
  description_apport: string;
}

interface SasPresident {
  type: "physique" | "morale";
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
  duree_mandat: string;
  // Personne morale
  denomination_pm: string;
  forme_pm: string;
  capital_pm: string;
  siege_pm: string;
  rccm_pm: string;
  representant_nom: string;
  representant_qualite: string;
}

interface SasDg {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface SasCac {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface SasState {
  denomination: string;
  sigle: string;
  objet_social: string;
  siege_social: string;
  ville: string;
  pays: string;
  duree: number;
  exercice_debut: string;
  exercice_fin: string;
  premier_exercice_fin: string;
  capital: number;
  valeur_nominale: number;
  mode_liberation: string;
  lieu_depot: string;
  nom_depositaire: string;
  date_certificat_depot: string;
  associes: SasAssocie[];
  president: SasPresident;
  has_dg: boolean;
  dg: SasDg;
  has_cac: boolean;
  cac_titulaire: SasCac;
  cac_suppleant: SasCac;
  // Clauses de cession (4 variantes, cumulables)
  clause_agrement: boolean;
  clause_preemption: boolean;
  clause_inalienabilite: boolean;
  clause_exclusion: boolean;
  delai_preemption: string;
  duree_inalienabilite: string;
  jours_notification_exclusion: string;
  // Contestation
  mode_contestation: string;
  // Quorum/majorité
  quorum_ago_1: string;
  quorum_ago_2: string;
  quorum_age_1: string;
  quorum_age_2: string;
  majorite_ago: string;
  majorite_age: string;
  majorite_ecrite: string;
  // Signature
  date_signature: string;
  lieu_signature: string;
  // Navigation
  currentStep: number;
  set: (data: Partial<SasState>) => void;
  setAssocie: (i: number, data: Partial<SasAssocie>) => void;
  addAssocie: () => void;
  removeAssocie: (i: number) => void;
  setPresident: (data: Partial<SasPresident>) => void;
  setDg: (data: Partial<SasDg>) => void;
  setCac: (type: "titulaire" | "suppleant", data: Partial<SasCac>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultAssocie: SasAssocie = {
  civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "",
  nationalite: "Congolaise", profession: "", adresse: "", apport: 0, type_apport: "numeraire", description_apport: "",
};

const defaultPresident: SasPresident = {
  type: "physique", civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "",
  nationalite: "Congolaise", adresse: "", duree_mandat: "quatre ans",
  denomination_pm: "", forme_pm: "", capital_pm: "", siege_pm: "", rccm_pm: "", representant_nom: "", representant_qualite: "",
};

const defaultDg: SasDg = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };
const defaultCac: SasCac = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };

const useSasStore = create<SasState>((set) => ({
  denomination: "", sigle: "", objet_social: "", siege_social: "",
  ville: "Brazzaville", pays: "République du Congo", duree: 99,
  exercice_debut: "1er janvier", exercice_fin: "31 décembre", premier_exercice_fin: "",
  capital: 1000000, valeur_nominale: 10000,
  mode_liberation: "intégralement", lieu_depot: "", nom_depositaire: "", date_certificat_depot: "",
  associes: [{ ...defaultAssocie }],
  president: { ...defaultPresident },
  has_dg: false, dg: { ...defaultDg },
  has_cac: false, cac_titulaire: { ...defaultCac }, cac_suppleant: { ...defaultCac },
  clause_agrement: true, clause_preemption: false, clause_inalienabilite: false, clause_exclusion: false,
  delai_preemption: "3", duree_inalienabilite: "5", jours_notification_exclusion: "30",
  mode_contestation: "droit_commun",
  quorum_ago_1: "25", quorum_ago_2: "0", quorum_age_1: "50", quorum_age_2: "25",
  majorite_ago: "50", majorite_age: "67", majorite_ecrite: "50",
  date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  set: (data) => set(data),
  setAssocie: (i, data) => set((s) => ({ associes: s.associes.map((a, j) => j === i ? { ...a, ...data } : a) })),
  addAssocie: () => set((s) => ({ associes: [...s.associes, { ...defaultAssocie }] })),
  removeAssocie: (i) => set((s) => ({ associes: s.associes.filter((_, j) => j !== i) })),
  setPresident: (data) => set((s) => ({ president: { ...s.president, ...data } })),
  setDg: (data) => set((s) => ({ dg: { ...s.dg, ...data } })),
  setCac: (type, data) => set((s) => type === "titulaire" ? { cac_titulaire: { ...s.cac_titulaire, ...data } } : { cac_suppleant: { ...s.cac_suppleant, ...data } }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  reset: () => set({
    denomination: "", sigle: "", objet_social: "", siege_social: "", ville: "Brazzaville", pays: "République du Congo", duree: 99,
    exercice_debut: "1er janvier", exercice_fin: "31 décembre", premier_exercice_fin: "",
    capital: 1000000, valeur_nominale: 10000, mode_liberation: "intégralement", lieu_depot: "", nom_depositaire: "", date_certificat_depot: "",
    associes: [{ ...defaultAssocie }], president: { ...defaultPresident },
    has_dg: false, dg: { ...defaultDg }, has_cac: false, cac_titulaire: { ...defaultCac }, cac_suppleant: { ...defaultCac },
    clause_agrement: true, clause_preemption: false, clause_inalienabilite: false, clause_exclusion: false,
    delai_preemption: "3", duree_inalienabilite: "5", jours_notification_exclusion: "30",
    mode_contestation: "droit_commun",
    quorum_ago_1: "25", quorum_ago_2: "0", quorum_age_1: "50", quorum_age_2: "25",
    majorite_ago: "50", majorite_age: "67", majorite_ecrite: "50",
    date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  }),
}));

const STEPS = ["Société", "Associés", "Capital", "Président", "Clauses", "Décisions", "Récapitulatif", "Aperçu"];

// ── UI Components ──
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: "default" | "numeric"; colors: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 14, color: colors.text, marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted}
        multiline={multiline} keyboardType={keyboardType}
        style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, padding: 13,
          fontFamily: fonts.regular, color: colors.text, fontSize: 15,
          minHeight: multiline ? 80 : undefined, textAlignVertical: multiline ? "top" : undefined }} />
    </View>
  );
}

function Choice({ label, options, value, onChange, colors }: {
  label: string; options: { value: string; label: string }[]; value: string;
  onChange: (v: string) => void; colors: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 14, color: colors.text, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)}
            style={{ flex: 1, minWidth: 80, padding: 12, backgroundColor: value === o.value ? colors.primary : colors.input,
              alignItems: "center", borderWidth: 1, borderColor: value === o.value ? colors.primary : colors.border }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: value === o.value ? "#fff" : colors.text }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ToggleRow({ label, value, onToggle, colors }: {
  label: string; value: boolean; onToggle: (v: boolean) => void; colors: Record<string, string>;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
      <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#e2e8f0", true: colors.primary }} />
    </View>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: Record<string, string> }) {
  return <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 12, marginTop: 8 }}>{title}</Text>;
}

// ── Main Screen ──
export default function SasWizardScreen() {
  const { colors } = useTheme();
  const w = useSasStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true); setError("");
    try {
      const { data } = await documentsApi.generate("/generate/sas", {
        denomination: w.denomination, sigle: w.sigle, objet_social: w.objet_social,
        siege_social: w.siege_social, ville: w.ville, pays: w.pays, duree: w.duree,
        exercice_debut: w.exercice_debut, exercice_fin: w.exercice_fin, premier_exercice_fin: w.premier_exercice_fin,
        capital: w.capital, valeur_nominale: w.valeur_nominale,
        mode_liberation: w.mode_liberation, lieu_depot: w.lieu_depot, nom_depositaire: w.nom_depositaire, date_certificat_depot: w.date_certificat_depot,
        associes: w.associes,
        president: w.president,
        has_dg: w.has_dg, dg: w.dg,
        has_cac: w.has_cac, cac_titulaire: w.cac_titulaire, cac_suppleant: w.cac_suppleant,
        clause_agrement: w.clause_agrement, clause_preemption: w.clause_preemption,
        clause_inalienabilite: w.clause_inalienabilite, clause_exclusion: w.clause_exclusion,
        delai_preemption: w.delai_preemption, duree_inalienabilite: w.duree_inalienabilite,
        jours_notification_exclusion: w.jours_notification_exclusion,
        mode_contestation: w.mode_contestation,
        quorum_ago_1: w.quorum_ago_1, quorum_ago_2: w.quorum_ago_2,
        quorum_age_1: w.quorum_age_1, quorum_age_2: w.quorum_age_2,
        majorite_ago: w.majorite_ago, majorite_age: w.majorite_age, majorite_ecrite: w.majorite_ecrite,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"), lieu_signature: w.lieu_signature,
      });
      addDocument(data.document);
      setGeneratedUrl(data.docx_url);
      w.nextStep();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } };
      const errs = e.response?.data?.errors;
      if (errs && Array.isArray(errs)) setError(errs.map((x) => x.message).join("\n"));
      else setError(e.response?.data?.error || "Erreur lors de la génération");
    } finally { setIsGenerating(false); }
  }, [w, addDocument]);

  const handleDownload = useCallback(() => {
    if (generatedUrl && Platform.OS === "web") {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
      window.open(`${baseUrl.replace(/\/api$/, "")}${generatedUrl}`, "_blank");
    }
  }, [generatedUrl]);

  const isLastDataStep = w.currentStep === 6;
  const isDownloadStep = w.currentStep === 7;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "Société par Actions Simplifiée", center: true, size: "md" as const },
      { text: `Au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "sm" as const },
      { text: `Siège social : ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "STATUTS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "Entre les soussignés :", spaceBefore: true },
    ];
    w.associes.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Associé ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}${a.adresse ? ", demeurant à " + a.adresse : ""} ;` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Article premier : Forme", bold: true, spaceBefore: true },
      { text: "Il est formé entre les soussignés une société par actions simplifiée régie par l'Acte Uniforme OHADA." },
      { text: "", spaceBefore: true },
      { text: "Article 2 : Dénomination", bold: true, spaceBefore: true },
      { text: `La société a pour dénomination sociale « ${v(w.denomination)} ».${w.sigle ? ` Son sigle est : « ${w.sigle} ».` : ""}` },
      { text: "", spaceBefore: true },
      { text: "Article 3 : Objet", bold: true, spaceBefore: true },
      { text: v(w.objet_social) },
      { text: "", spaceBefore: true },
      { text: "Article 4 : Siège social", bold: true, spaceBefore: true },
      { text: `Le siège social est fixé à ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}.` },
      { text: "", spaceBefore: true },
      { text: "Article 8 : Capital social", bold: true, spaceBefore: true },
      { text: `Le capital social est fixé à ${w.capital.toLocaleString("fr-FR")} FCFA, divisé en ${nbActions} actions de ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA chacune.` },
      { text: "", spaceBefore: true },
      { text: "Article 14 : Président", bold: true, spaceBefore: true },
      { text: w.president.type === "physique"
        ? `Est nommé président : ${v(w.president.prenom)} ${v(w.president.nom)}, pour une durée de ${v(w.president.duree_mandat)}.`
        : `Est nommée président : la société ${v(w.president.denomination_pm)}, ${v(w.president.forme_pm)}.` },
      { text: "", spaceBefore: true },
      { text: "[ ... articles complets dans le document DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.sigle, w.objet_social, w.siege_social, w.ville, w.pays,
      w.capital, w.valeur_nominale, w.associes, w.president, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Statuts SAS"
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

        {/* Étape 0 : Société */}
        {w.currentStep === 0 && (<>
          <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA TECH SAS" />
          <Field colors={colors} label="Sigle (optionnel)" value={w.sigle} onChangeText={(v) => w.set({ sigle: v })} />
          <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.set({ objet_social: v })} placeholder="Décrivez l'activité principale..." multiline />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
          <Field colors={colors} label="Ville" value={w.ville} onChangeText={(v) => w.set({ ville: v })} />
          <Field colors={colors} label="Pays" value={w.pays} onChangeText={(v) => w.set({ pays: v })} />
          <Field colors={colors} label="Durée (années, max 99)" value={String(w.duree)} onChangeText={(v) => w.set({ duree: parseInt(v) || 99 })} keyboardType="numeric" />
          <Field colors={colors} label="Clôture du 1er exercice" value={w.premier_exercice_fin} onChangeText={(v) => w.set({ premier_exercice_fin: v })} placeholder="Ex: 31 décembre 2026" />
        </>)}

        {/* Étape 1 : Associés */}
        {w.currentStep === 1 && (<>
          {w.associes.map((a, i) => (
            <View key={i} style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Associé {i + 1}</Text>
                {w.associes.length > 1 && <TouchableOpacity onPress={() => w.removeAssocie(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>}
              </View>
              <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={a.civilite} onChange={(v) => w.setAssocie(i, { civilite: v })} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setAssocie(i, { nom: v })} /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => w.setAssocie(i, { prenom: v })} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={a.date_naissance} onChangeText={(v) => w.setAssocie(i, { date_naissance: v })} placeholder="01/01/1980" /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={a.lieu_naissance} onChangeText={(v) => w.setAssocie(i, { lieu_naissance: v })} /></View>
              </View>
              <Field colors={colors} label="Nationalité" value={a.nationalite} onChangeText={(v) => w.setAssocie(i, { nationalite: v })} />
              <Field colors={colors} label="Profession" value={a.profession} onChangeText={(v) => w.setAssocie(i, { profession: v })} />
              <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => w.setAssocie(i, { adresse: v })} />
              <Choice colors={colors} label="Type d'apport" options={[
                { value: "numeraire", label: "Numéraire" },
                { value: "nature", label: "Nature" },
                { value: "industrie", label: "Industrie" },
              ]} value={a.type_apport} onChange={(v) => w.setAssocie(i, { type_apport: v })} />
              {a.type_apport !== "industrie" && (
                <Field colors={colors} label="Apport (FCFA)" value={a.apport ? String(a.apport) : ""} onChangeText={(v) => w.setAssocie(i, { apport: parseInt(v) || 0 })} keyboardType="numeric" />
              )}
              {(a.type_apport === "nature" || a.type_apport === "industrie") && (
                <Field colors={colors} label={a.type_apport === "nature" ? "Description de l'apport en nature" : "Description de l'apport en industrie"} value={a.description_apport} onChangeText={(v) => w.setAssocie(i, { description_apport: v })} multiline />
              )}
            </View>
          ))}
          <TouchableOpacity onPress={w.addAssocie} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un associé</Text>
          </TouchableOpacity>
        </>)}

        {/* Étape 2 : Capital */}
        {w.currentStep === 2 && (() => {
          const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          const totalApports = w.associes.filter((a) => a.type_apport !== "industrie").reduce((s, a) => s + a.apport, 0);
          return (<>
            <Field colors={colors} label="Capital social (FCFA)" value={String(w.capital)} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.warning, marginBottom: 12 }}>Capital minimum SAS : 1.000.000 FCFA</Text>
            <Field colors={colors} label="Valeur nominale d'une action (FCFA)" value={String(w.valeur_nominale)} onChangeText={(v) => w.set({ valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>Valeur nominale libre (pas de minimum imposé)</Text>
            <Choice colors={colors} label="Mode de libération" options={[
              { value: "intégralement", label: "Intégrale" },
              { value: "libre", label: "Libre (fixé statuts)" },
            ]} value={w.mode_liberation} onChange={(v) => w.set({ mode_liberation: v })} />
            <SectionTitle title="Dépôt des fonds" colors={colors} />
            <Field colors={colors} label="Dépositaire" value={w.nom_depositaire} onChangeText={(v) => w.set({ nom_depositaire: v })} placeholder="Banque ou notaire" />
            <Field colors={colors} label="Lieu de dépôt" value={w.lieu_depot} onChangeText={(v) => w.set({ lieu_depot: v })} />
            <Field colors={colors} label="Date certificat de dépôt" value={w.date_certificat_depot} onChangeText={(v) => w.set({ date_certificat_depot: v })} placeholder="20/03/2026" />
            <SectionTitle title="Répartition" colors={colors} />
            <View style={{ backgroundColor: "#ffffff", padding: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Nombre d'actions</Text>
                <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{nbActions.toLocaleString("fr-FR")}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Total apports</Text>
                <Text style={{ fontFamily: fonts.semiBold, color: totalApports === w.capital ? colors.success : colors.danger }}>{totalApports.toLocaleString("fr-FR")} FCFA</Text>
              </View>
              {w.associes.map((a, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
                  <Text style={{ fontFamily: fonts.regular, color: colors.text }}>{a.prenom} {a.nom}</Text>
                  <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>
                    {a.type_apport === "industrie" ? "Industrie" : `${w.valeur_nominale > 0 ? Math.floor(a.apport / w.valeur_nominale) : 0} actions`}
                  </Text>
                </View>
              ))}
            </View>
          </>);
        })()}

        {/* Étape 3 : Président (+ DG optionnel) */}
        {w.currentStep === 3 && (<>
          <SectionTitle title="Président" colors={colors} />
          <Choice colors={colors} label="Type de président" options={[
            { value: "physique", label: "Personne physique" },
            { value: "morale", label: "Personne morale" },
          ]} value={w.president.type} onChange={(v) => w.setPresident({ type: v as "physique" | "morale" })} />

          {w.president.type === "physique" && (<>
            {w.associes.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Remplir depuis un associé :</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {w.associes.map((a, i) => (
                    <TouchableOpacity key={i} onPress={() => w.setPresident({ civilite: a.civilite, nom: a.nom, prenom: a.prenom, date_naissance: a.date_naissance, lieu_naissance: a.lieu_naissance, nationalite: a.nationalite, adresse: a.adresse })}
                      style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#e2e8f0" }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary }}>{a.prenom} {a.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.president.civilite} onChange={(v) => w.setPresident({ civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president.nom} onChangeText={(v) => w.setPresident({ nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president.prenom} onChangeText={(v) => w.setPresident({ prenom: v })} /></View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={w.president.date_naissance} onChangeText={(v) => w.setPresident({ date_naissance: v })} placeholder="01/01/1970" /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={w.president.lieu_naissance} onChangeText={(v) => w.setPresident({ lieu_naissance: v })} /></View>
            </View>
            <Field colors={colors} label="Nationalité" value={w.president.nationalite} onChangeText={(v) => w.setPresident({ nationalite: v })} />
            <Field colors={colors} label="Adresse" value={w.president.adresse} onChangeText={(v) => w.setPresident({ adresse: v })} />
          </>)}

          {w.president.type === "morale" && (<>
            <Field colors={colors} label="Dénomination de la personne morale" value={w.president.denomination_pm} onChangeText={(v) => w.setPresident({ denomination_pm: v })} />
            <Field colors={colors} label="Forme juridique" value={w.president.forme_pm} onChangeText={(v) => w.setPresident({ forme_pm: v })} placeholder="Ex: SARL, SA..." />
            <Field colors={colors} label="Capital social (FCFA)" value={w.president.capital_pm} onChangeText={(v) => w.setPresident({ capital_pm: v })} keyboardType="numeric" />
            <Field colors={colors} label="Siège social" value={w.president.siege_pm} onChangeText={(v) => w.setPresident({ siege_pm: v })} />
            <Field colors={colors} label="RCCM" value={w.president.rccm_pm} onChangeText={(v) => w.setPresident({ rccm_pm: v })} />
            <Field colors={colors} label="Nom du représentant permanent" value={w.president.representant_nom} onChangeText={(v) => w.setPresident({ representant_nom: v, nom: v })} />
            <Field colors={colors} label="Qualité du représentant" value={w.president.representant_qualite} onChangeText={(v) => w.setPresident({ representant_qualite: v })} placeholder="Gérant, DG..." />
          </>)}

          <Field colors={colors} label="Durée du mandat" value={w.president.duree_mandat} onChangeText={(v) => w.setPresident({ duree_mandat: v })} />

          <SectionTitle title="Directeur Général (optionnel)" colors={colors} />
          <ToggleRow colors={colors} label="Nommer un Directeur Général" value={w.has_dg} onToggle={(v) => w.set({ has_dg: v })} />
          {w.has_dg && (<>
            <View style={{ marginTop: 12 }} />
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.dg.civilite} onChange={(v) => w.setDg({ civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.dg.nom} onChangeText={(v) => w.setDg({ nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.dg.prenom} onChangeText={(v) => w.setDg({ prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.dg.adresse} onChangeText={(v) => w.setDg({ adresse: v })} />
          </>)}
        </>)}

        {/* Étape 4 : Clauses (4 variantes cession + contestation) */}
        {w.currentStep === 4 && (<>
          <SectionTitle title="Clauses de cession d'actions (Art. 13)" colors={colors} />
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
            Vous pouvez activer plusieurs clauses. Elles sont cumulables.
          </Text>

          <ToggleRow colors={colors} label="Clause d'agrément" value={w.clause_agrement} onToggle={(v) => w.set({ clause_agrement: v })} />
          <ToggleRow colors={colors} label="Clause de préemption" value={w.clause_preemption} onToggle={(v) => w.set({ clause_preemption: v })} />
          {w.clause_preemption && (
            <Field colors={colors} label="Délai de préemption (mois)" value={w.delai_preemption} onChangeText={(v) => w.set({ delai_preemption: v })} keyboardType="numeric" />
          )}
          <ToggleRow colors={colors} label="Clause d'inaliénabilité" value={w.clause_inalienabilite} onToggle={(v) => w.set({ clause_inalienabilite: v })} />
          {w.clause_inalienabilite && (
            <Field colors={colors} label="Durée d'inaliénabilité (années, max 10)" value={w.duree_inalienabilite} onChangeText={(v) => w.set({ duree_inalienabilite: v })} keyboardType="numeric" />
          )}
          <ToggleRow colors={colors} label="Clause d'exclusion" value={w.clause_exclusion} onToggle={(v) => w.set({ clause_exclusion: v })} />
          {w.clause_exclusion && (
            <Field colors={colors} label="Délai notification exclusion (jours)" value={w.jours_notification_exclusion} onChangeText={(v) => w.set({ jours_notification_exclusion: v })} keyboardType="numeric" />
          )}

          <SectionTitle title="Contestation (Art. 21)" colors={colors} />
          <Choice colors={colors} label="Mode de règlement des litiges" options={[
            { value: "droit_commun", label: "Droit commun" },
            { value: "arbitrage", label: "Arbitrage OHADA" },
          ]} value={w.mode_contestation} onChange={(v) => w.set({ mode_contestation: v })} />

          <SectionTitle title="Commissaire aux comptes (Art. 17)" colors={colors} />
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
            Obligatoire si : bilan &gt; 125M, CA &gt; 250M, ou &gt; 50 personnes.
          </Text>
          <ToggleRow colors={colors} label="Désigner un CAC" value={w.has_cac} onToggle={(v) => w.set({ has_cac: v })} />
          {w.has_cac && (<>
            <View style={{ marginTop: 12 }} />
            <SectionTitle title="CAC titulaire" colors={colors} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_titulaire.nom} onChangeText={(v) => w.setCac("titulaire", { nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cac_titulaire.prenom} onChangeText={(v) => w.setCac("titulaire", { prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.cac_titulaire.adresse} onChangeText={(v) => w.setCac("titulaire", { adresse: v })} />
            <SectionTitle title="CAC suppléant" colors={colors} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_suppleant.nom} onChangeText={(v) => w.setCac("suppleant", { nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cac_suppleant.prenom} onChangeText={(v) => w.setCac("suppleant", { prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.cac_suppleant.adresse} onChangeText={(v) => w.setCac("suppleant", { adresse: v })} />
          </>)}
        </>)}

        {/* Étape 5 : Décisions (quorum/majorité personnalisables) */}
        {w.currentStep === 5 && (<>
          <SectionTitle title="Assemblée Générale Ordinaire" colors={colors} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Quorum 1re conv. (%)" value={w.quorum_ago_1} onChangeText={(v) => w.set({ quorum_ago_1: v })} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Quorum 2e conv. (%)" value={w.quorum_ago_2} onChangeText={(v) => w.set({ quorum_ago_2: v })} keyboardType="numeric" /></View>
          </View>
          <Field colors={colors} label="Majorité AGO (%)" value={w.majorite_ago} onChangeText={(v) => w.set({ majorite_ago: v })} keyboardType="numeric" />

          <SectionTitle title="Assemblée Générale Extraordinaire" colors={colors} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Quorum 1re conv. (%)" value={w.quorum_age_1} onChangeText={(v) => w.set({ quorum_age_1: v })} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Quorum 2e conv. (%)" value={w.quorum_age_2} onChangeText={(v) => w.set({ quorum_age_2: v })} keyboardType="numeric" /></View>
          </View>
          <Field colors={colors} label="Majorité AGE (%)" value={w.majorite_age} onChangeText={(v) => w.set({ majorite_age: v })} keyboardType="numeric" />

          <SectionTitle title="Consultation écrite" colors={colors} />
          <Field colors={colors} label="Majorité consultation écrite (%)" value={w.majorite_ecrite} onChangeText={(v) => w.set({ majorite_ecrite: v })} keyboardType="numeric" />

          <View style={{ backgroundColor: "#fffbeb", padding: 16, marginTop: 16, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
              Liberté statutaire SAS
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#a16207", lineHeight: 20 }}>
              Contrairement à la SA, les quorum et majorités sont librement fixés dans les statuts de la SAS.
            </Text>
          </View>
        </>)}

        {/* Étape 6 : Récapitulatif */}
        {w.currentStep === 6 && (() => {
          const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          const Row = ({ label, value }: { label: string; value: string }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 }}>{label}</Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, flex: 1, textAlign: "right" }}>{value}</Text>
            </View>
          );
          const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
            <View style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 10 }}>{title}</Text>
              {children}
            </View>
          );
          const clausesActive: string[] = [];
          if (w.clause_agrement) clausesActive.push("Agrément");
          if (w.clause_preemption) clausesActive.push(`Préemption (${w.delai_preemption} mois)`);
          if (w.clause_inalienabilite) clausesActive.push(`Inaliénabilité (${w.duree_inalienabilite} ans)`);
          if (w.clause_exclusion) clausesActive.push("Exclusion");

          return (<>
            <Section title="Société">
              <Row label="Dénomination" value={w.denomination} />
              <Row label="Forme" value="SAS" />
              <Row label="Siège" value={`${w.siege_social}, ${w.ville}`} />
              <Row label="Durée" value={`${w.duree} ans`} />
            </Section>
            <Section title="Capital">
              <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Actions" value={`${nbActions} x ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Libération" value={w.mode_liberation} />
            </Section>
            <Section title={`Associés (${w.associes.length})`}>
              {w.associes.map((a, i) => <Row key={i} label={`${a.prenom} ${a.nom}`} value={a.type_apport === "industrie" ? "Industrie" : `${a.apport.toLocaleString("fr-FR")} FCFA`} />)}
            </Section>
            <Section title="Président">
              <Row label="Type" value={w.president.type === "physique" ? "Personne physique" : "Personne morale"} />
              <Row label="Nom" value={w.president.type === "physique" ? `${w.president.prenom} ${w.president.nom}` : w.president.denomination_pm} />
              <Row label="Mandat" value={w.president.duree_mandat} />
              {w.has_dg && <Row label="DG" value={`${w.dg.prenom} ${w.dg.nom}`} />}
            </Section>
            <Section title="Clauses de cession">
              <Row label="Clauses actives" value={clausesActive.join(", ") || "Aucune"} />
              <Row label="Contestation" value={w.mode_contestation === "arbitrage" ? "Arbitrage" : "Droit commun"} />
            </Section>
            <Section title="Décisions collectives">
              <Row label="Quorum AGO" value={`${w.quorum_ago_1}% / ${w.quorum_ago_2}%`} />
              <Row label="Majorité AGO" value={`${w.majorite_ago}%`} />
              <Row label="Quorum AGE" value={`${w.quorum_age_1}% / ${w.quorum_age_2}%`} />
              <Row label="Majorité AGE" value={`${w.majorite_age}%`} />
              <Row label="Majorité écrite" value={`${w.majorite_ecrite}%`} />
            </Section>
            {w.has_cac && (
              <Section title="Commissaires aux comptes">
                <Row label="Titulaire" value={`${w.cac_titulaire.prenom} ${w.cac_titulaire.nom}`} />
                <Row label="Suppléant" value={`${w.cac_suppleant.prenom} ${w.cac_suppleant.nom}`} />
              </Section>
            )}
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          </>);
        })()}

        {/* Étape 7 : Aperçu */}
        {w.currentStep === 7 && (<>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            {generatedUrl ? (<>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 22, color: colors.text, marginTop: 16 }}>Document généré</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 8 }}>Statuts SAS — {w.denomination}</Text>
              <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="download-outline" size={22} color="#ffffff" />
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>Télécharger le DOCX</Text>
              </TouchableOpacity>
            </>) : (
              <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: colors.textSecondary }}>Génération en cours...</Text>
            )}
            <TouchableOpacity onPress={() => { w.reset(); router.replace("/(app)"); }} style={{ marginTop: 16, padding: 12 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
            </TouchableOpacity>
          </View>
        </>)}

    </WizardLayout>
  );
}
