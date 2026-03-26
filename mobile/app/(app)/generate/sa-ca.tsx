import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──
interface Administrateur {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface Actionnaire {
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
}

interface CacInfo {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface PresidentCa {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface DgInfo {
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
}

// ── SA CA Store ──
interface SaCaState {
  denomination: string; sigle: string; objet_social: string; siege_social: string;
  ville: string; pays: string; duree: number;
  exercice_debut: string; exercice_fin: string; premier_exercice_fin: string;
  capital: number; valeur_nominale: number;
  mode_liberation: string; lieu_depot: string; nom_depositaire: string; date_certificat_depot: string;
  associes: Actionnaire[];
  conseil_administration: Administrateur[];
  president_ca: PresidentCa;
  direction_generale: string;
  dg: DgInfo;
  duree_mandat_admin: string;
  jours_convocation_ca: string;
  voix_preponderante: boolean;
  cac_titulaire: CacInfo;
  cac_suppleant: CacInfo;
  clause_cession: string; delai_preemption: string; duree_inalienabilite: string;
  representation_ag: string;
  representation_ca: string;
  date_signature: string; lieu_signature: string;
  currentStep: number;
  set: (data: Partial<SaCaState>) => void;
  setAssocie: (i: number, data: Partial<Actionnaire>) => void;
  addAssocie: () => void;
  removeAssocie: (i: number) => void;
  setAdmin: (i: number, data: Partial<Administrateur>) => void;
  addAdmin: () => void;
  removeAdmin: (i: number) => void;
  setPresidentCa: (data: Partial<PresidentCa>) => void;
  setDg: (data: Partial<DgInfo>) => void;
  setCac: (type: "titulaire" | "suppleant", data: Partial<CacInfo>) => void;
  nextStep: () => void; prevStep: () => void; reset: () => void;
}

const defaultActionnaire: Actionnaire = { civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "", nationalite: "Congolaise", profession: "", adresse: "", apport: 0, type_apport: "numeraire" };
const defaultAdmin: Administrateur = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };
const defaultPresidentCa: PresidentCa = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };
const defaultDg: DgInfo = { civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "", nationalite: "Congolaise", adresse: "" };
const defaultCac: CacInfo = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };

const useSaCaStore = create<SaCaState>((set) => ({
  denomination: "", sigle: "", objet_social: "", siege_social: "",
  ville: "Brazzaville", pays: "République du Congo", duree: 99,
  exercice_debut: "1er janvier", exercice_fin: "31 décembre", premier_exercice_fin: "",
  capital: 10000000, valeur_nominale: 10000,
  mode_liberation: "intégralement", lieu_depot: "", nom_depositaire: "", date_certificat_depot: "",
  associes: [{ ...defaultActionnaire }],
  conseil_administration: [{ ...defaultAdmin }, { ...defaultAdmin }, { ...defaultAdmin }],
  president_ca: { ...defaultPresidentCa },
  direction_generale: "variante_pca_dg",
  dg: { ...defaultDg },
  duree_mandat_admin: "deux ans",
  jours_convocation_ca: "quinze",
  voix_preponderante: true,
  cac_titulaire: { ...defaultCac }, cac_suppleant: { ...defaultCac },
  clause_cession: "agrement", delai_preemption: "3", duree_inalienabilite: "5",
  representation_ag: "libre",
  representation_ca: "libre",
  date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  set: (data) => set(data),
  setAssocie: (i, data) => set((s) => ({ associes: s.associes.map((a, j) => j === i ? { ...a, ...data } : a) })),
  addAssocie: () => set((s) => ({ associes: [...s.associes, { ...defaultActionnaire }] })),
  removeAssocie: (i) => set((s) => ({ associes: s.associes.filter((_, j) => j !== i) })),
  setAdmin: (i, data) => set((s) => ({ conseil_administration: s.conseil_administration.map((a, j) => j === i ? { ...a, ...data } : a) })),
  addAdmin: () => set((s) => {
    if (s.conseil_administration.length >= 12) return s;
    return { conseil_administration: [...s.conseil_administration, { ...defaultAdmin }] };
  }),
  removeAdmin: (i) => set((s) => {
    if (s.conseil_administration.length <= 3) return s;
    return { conseil_administration: s.conseil_administration.filter((_, j) => j !== i) };
  }),
  setPresidentCa: (data) => set((s) => ({ president_ca: { ...s.president_ca, ...data } })),
  setDg: (data) => set((s) => ({ dg: { ...s.dg, ...data } })),
  setCac: (type, data) => set((s) => type === "titulaire" ? { cac_titulaire: { ...s.cac_titulaire, ...data } } : { cac_suppleant: { ...s.cac_suppleant, ...data } }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 8) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  reset: () => set({
    denomination: "", sigle: "", objet_social: "", siege_social: "",
    ville: "Brazzaville", pays: "République du Congo", duree: 99,
    exercice_debut: "1er janvier", exercice_fin: "31 décembre", premier_exercice_fin: "",
    capital: 10000000, valeur_nominale: 10000,
    mode_liberation: "intégralement", lieu_depot: "", nom_depositaire: "", date_certificat_depot: "",
    associes: [{ ...defaultActionnaire }],
    conseil_administration: [{ ...defaultAdmin }, { ...defaultAdmin }, { ...defaultAdmin }],
    president_ca: { ...defaultPresidentCa },
    direction_generale: "variante_pca_dg",
    dg: { ...defaultDg },
    duree_mandat_admin: "deux ans",
    jours_convocation_ca: "quinze",
    voix_preponderante: true,
    cac_titulaire: { ...defaultCac }, cac_suppleant: { ...defaultCac },
    clause_cession: "agrement", delai_preemption: "3", duree_inalienabilite: "5",
    representation_ag: "libre",
    representation_ca: "libre",
    date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  }),
}));

const STEPS = ["Societe", "Actionnaires", "Capital", "Conseil d'Admin.", "Direction Gen.", "CAC", "Clauses", "Recapitulatif", "Apercu"];

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
      <View style={{ flexDirection: "row", gap: 8 }}>
        {options.map((o) => (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)}
            style={{ flex: 1, padding: 12, backgroundColor: value === o.value ? colors.primary : colors.input,
              alignItems: "center", borderWidth: 1, borderColor: value === o.value ? colors.primary : colors.border }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: value === o.value ? "#fff" : colors.text }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: Record<string, string> }) {
  return <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 12, marginTop: 8 }}>{title}</Text>;
}

export default function SaCaWizardScreen() {
  const { colors } = useTheme();
  const w = useSaCaStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true); setError("");
    try {
      const { data } = await documentsApi.generate("/generate/sa-ca", {
        denomination: w.denomination, sigle: w.sigle, objet_social: w.objet_social,
        siege_social: w.siege_social, ville: w.ville, pays: w.pays, duree: w.duree,
        exercice_debut: w.exercice_debut, exercice_fin: w.exercice_fin, premier_exercice_fin: w.premier_exercice_fin,
        capital: w.capital, valeur_nominale: w.valeur_nominale,
        mode_liberation: w.mode_liberation, lieu_depot: w.lieu_depot, nom_depositaire: w.nom_depositaire, date_certificat_depot: w.date_certificat_depot,
        associes: w.associes,
        conseil_administration: w.conseil_administration,
        president_ca: w.president_ca,
        direction_generale: w.direction_generale,
        dg: w.dg,
        duree_mandat_admin: w.duree_mandat_admin,
        jours_convocation_ca: w.jours_convocation_ca,
        voix_preponderante: w.voix_preponderante,
        cac_titulaire: w.cac_titulaire, cac_suppleant: w.cac_suppleant,
        clause_agrement: w.clause_cession === "agrement",
        clause_preemption: w.clause_cession === "preemption",
        clause_inalienabilite: w.clause_cession === "inalienabilite",
        delai_preemption: w.delai_preemption, duree_inalienabilite: w.duree_inalienabilite,
        representation_ag_libre: w.representation_ag === "libre",
        representation_ag_actionnaire: w.representation_ag === "actionnaire",
        representation_ca_libre: w.representation_ca === "libre",
        representation_ca_administrateur: w.representation_ca === "administrateur",
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"), lieu_signature: w.lieu_signature,
      });
      addDocument(data.document);
      setGeneratedUrl(data.docx_url);
      w.nextStep();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } };
      const errs = e.response?.data?.errors;
      if (errs && Array.isArray(errs)) setError(errs.map((x) => x.message).join("\n"));
      else setError(e.response?.data?.error || "Erreur lors de la generation");
    } finally { setIsGenerating(false); }
  }, [w, addDocument]);

  const handleDownload = useCallback(() => {
    if (generatedUrl && Platform.OS === "web") {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
      window.open(`${baseUrl.replace(/\/api$/, "")}${generatedUrl}`, "_blank");
    }
  }, [generatedUrl]);

  const isLastDataStep = w.currentStep === 7;
  const isDownloadStep = w.currentStep === 8;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "SA avec Conseil d'Administration", center: true, size: "md" as const },
      { text: `Au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "sm" as const },
      { text: `Siège social : ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "STATUTS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "Entre les soussignés :", spaceBefore: true },
    ];
    w.associes.forEach((a, i) => {
      const nom = a.nom && a.prenom ? `${a.civilite} ${a.prenom} ${a.nom}` : `Actionnaire ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}${a.adresse ? ", demeurant à " + a.adresse : ""} ;` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Article premier : Forme", bold: true, spaceBefore: true },
      { text: "Il est formé entre les soussignés une société anonyme avec conseil d'administration régie par l'Acte Uniforme OHADA." },
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
      { text: "Article 14 : Conseil d'Administration", bold: true, spaceBefore: true },
      { text: `Le conseil d'administration est composé de ${w.conseil_administration.length} membres.` },
      { text: `Président du CA : ${v(w.president_ca.prenom)} ${v(w.president_ca.nom)}.` },
      { text: w.direction_generale === "variante_pdg"
        ? "Le Président du CA cumule les fonctions de Directeur Général (PDG)."
        : `Directeur Général : ${v(w.dg.prenom)} ${v(w.dg.nom)}.` },
      { text: "", spaceBefore: true },
      { text: "[ ... articles complets dans le document DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.sigle, w.objet_social, w.siege_social, w.ville, w.pays,
      w.capital, w.valeur_nominale, w.associes, w.conseil_administration, w.president_ca,
      w.direction_generale, w.dg, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Statuts SA — Conseil d'Administration"
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

        {/* Etape 0 : Societe */}
        {w.currentStep === 0 && (<>
          <Field colors={colors} label="Denomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA HOLDING" />
          <Field colors={colors} label="Sigle (optionnel)" value={w.sigle} onChangeText={(v) => w.set({ sigle: v })} />
          <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.set({ objet_social: v })} placeholder="Decrivez l'activite principale..." multiline />
          <Field colors={colors} label="Siege social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complete" />
          <Field colors={colors} label="Ville" value={w.ville} onChangeText={(v) => w.set({ ville: v })} />
          <Field colors={colors} label="Pays" value={w.pays} onChangeText={(v) => w.set({ pays: v })} />
          <Field colors={colors} label="Duree (annees, max 99)" value={String(w.duree)} onChangeText={(v) => w.set({ duree: parseInt(v) || 99 })} keyboardType="numeric" />
          <Field colors={colors} label="Cloture du 1er exercice" value={w.premier_exercice_fin} onChangeText={(v) => w.set({ premier_exercice_fin: v })} placeholder="Ex: 31 decembre 2026" />
        </>)}

        {/* Etape 1 : Actionnaires */}
        {w.currentStep === 1 && (<>
          {w.associes.map((a, i) => (
            <View key={i} style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Actionnaire {i + 1}</Text>
                {w.associes.length > 1 && <TouchableOpacity onPress={() => w.removeAssocie(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>}
              </View>
              <Choice colors={colors} label="Civilite" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={a.civilite} onChange={(v) => w.setAssocie(i, { civilite: v })} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setAssocie(i, { nom: v })} /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Prenom" value={a.prenom} onChangeText={(v) => w.setAssocie(i, { prenom: v })} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={a.date_naissance} onChangeText={(v) => w.setAssocie(i, { date_naissance: v })} placeholder="01/01/1980" /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={a.lieu_naissance} onChangeText={(v) => w.setAssocie(i, { lieu_naissance: v })} /></View>
              </View>
              <Field colors={colors} label="Nationalite" value={a.nationalite} onChangeText={(v) => w.setAssocie(i, { nationalite: v })} />
              <Field colors={colors} label="Profession" value={a.profession} onChangeText={(v) => w.setAssocie(i, { profession: v })} />
              <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => w.setAssocie(i, { adresse: v })} />
              <Field colors={colors} label="Apport (FCFA)" value={a.apport ? String(a.apport) : ""} onChangeText={(v) => w.setAssocie(i, { apport: parseInt(v) || 0 })} keyboardType="numeric" />
            </View>
          ))}
          <TouchableOpacity onPress={w.addAssocie} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un actionnaire</Text>
          </TouchableOpacity>
        </>)}

        {/* Etape 2 : Capital */}
        {w.currentStep === 2 && (() => {
          const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          const totalApports = w.associes.reduce((s, a) => s + a.apport, 0);
          return (<>
            <Field colors={colors} label="Capital social (FCFA)" value={String(w.capital)} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.warning, marginBottom: 12 }}>Capital minimum SA : 10.000.000 FCFA</Text>
            <Field colors={colors} label="Valeur nominale d'une action (FCFA)" value={String(w.valeur_nominale)} onChangeText={(v) => w.set({ valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.warning, marginBottom: 12 }}>Valeur nominale minimum : 10.000 FCFA</Text>
            <Choice colors={colors} label="Mode de liberation" options={[
              { value: "intégralement", label: "Integrale" },
              { value: "du quart", label: "Au 1/4" },
              { value: "de la moitié", label: "A la 1/2" },
            ]} value={w.mode_liberation} onChange={(v) => w.set({ mode_liberation: v })} />
            <SectionTitle title="Depot des fonds" colors={colors} />
            <Field colors={colors} label="Depositaire" value={w.nom_depositaire} onChangeText={(v) => w.set({ nom_depositaire: v })} placeholder="Banque ou notaire" />
            <Field colors={colors} label="Lieu de depot" value={w.lieu_depot} onChangeText={(v) => w.set({ lieu_depot: v })} />
            <Field colors={colors} label="Date certificat de depot" value={w.date_certificat_depot} onChangeText={(v) => w.set({ date_certificat_depot: v })} placeholder="20/03/2026" />
            <SectionTitle title="Repartition" colors={colors} />
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
                  <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>{w.valeur_nominale > 0 ? Math.floor(a.apport / w.valeur_nominale) : 0} actions</Text>
                </View>
              ))}
            </View>
          </>);
        })()}

        {/* Etape 3 : Conseil d'Administration */}
        {w.currentStep === 3 && (<>
          <SectionTitle title="Administrateurs (3 a 12 membres)" colors={colors} />
          {w.conseil_administration.map((adm, i) => (
            <View key={i} style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.primary }}>Administrateur {i + 1}</Text>
                {w.conseil_administration.length > 3 && <TouchableOpacity onPress={() => w.removeAdmin(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>}
              </View>
              {w.associes.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Remplir depuis un actionnaire :</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {w.associes.map((a, j) => (
                      <TouchableOpacity key={j} onPress={() => w.setAdmin(i, { civilite: a.civilite, nom: a.nom, prenom: a.prenom, adresse: a.adresse })}
                        style={{ backgroundColor: "#f8fafc", paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#e2e8f0" }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.primary }}>{a.prenom} {a.nom}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <Choice colors={colors} label="Civilite" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={adm.civilite} onChange={(v) => w.setAdmin(i, { civilite: v })} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={adm.nom} onChangeText={(v) => w.setAdmin(i, { nom: v })} /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Prenom" value={adm.prenom} onChangeText={(v) => w.setAdmin(i, { prenom: v })} /></View>
              </View>
              <Field colors={colors} label="Adresse" value={adm.adresse} onChangeText={(v) => w.setAdmin(i, { adresse: v })} />
            </View>
          ))}
          {w.conseil_administration.length < 12 && (
            <TouchableOpacity onPress={w.addAdmin} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed", marginBottom: 16 }}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un administrateur</Text>
            </TouchableOpacity>
          )}

          <SectionTitle title="President du Conseil d'Administration" colors={colors} />
          {w.conseil_administration.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Selectionner parmi les administrateurs :</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {w.conseil_administration.filter((a) => a.nom).map((a, j) => (
                  <TouchableOpacity key={j} onPress={() => w.setPresidentCa({ civilite: a.civilite, nom: a.nom, prenom: a.prenom, adresse: a.adresse })}
                    style={{ backgroundColor: "#f8fafc", paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#e2e8f0" }}>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.primary }}>{a.prenom} {a.nom}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <Choice colors={colors} label="Civilite" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.president_ca.civilite} onChange={(v) => w.setPresidentCa({ civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_ca.nom} onChangeText={(v) => w.setPresidentCa({ nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prenom" value={w.president_ca.prenom} onChangeText={(v) => w.setPresidentCa({ prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.president_ca.adresse} onChangeText={(v) => w.setPresidentCa({ adresse: v })} />

          <SectionTitle title="Parametres du CA" colors={colors} />
          <Field colors={colors} label="Duree du mandat des administrateurs" value={w.duree_mandat_admin} onChangeText={(v) => w.set({ duree_mandat_admin: v })} placeholder="Ex: deux ans" />
          <Field colors={colors} label="Delai de convocation du CA (jours)" value={w.jours_convocation_ca} onChangeText={(v) => w.set({ jours_convocation_ca: v })} placeholder="Ex: quinze" />
          <Choice colors={colors} label="Voix preponderante du president" options={[
            { value: "oui", label: "Oui" },
            { value: "non", label: "Non" },
          ]} value={w.voix_preponderante ? "oui" : "non"} onChange={(v) => w.set({ voix_preponderante: v === "oui" })} />
        </>)}

        {/* Etape 4 : Direction Generale */}
        {w.currentStep === 4 && (<>
          <SectionTitle title="Mode de direction" colors={colors} />
          <Choice colors={colors} label="Variante de direction" options={[
            { value: "variante_pca_dg", label: "PCA + DG separes" },
            { value: "variante_pdg", label: "PDG (cumul)" },
          ]} value={w.direction_generale} onChange={(v) => w.set({ direction_generale: v })} />

          {w.direction_generale === "variante_pdg" && (
            <View style={{ backgroundColor: "#fffbeb", padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: "#92400e" }}>
                Le President du CA cumule les fonctions de President et de Directeur General (PDG).
              </Text>
            </View>
          )}

          {w.direction_generale === "variante_pca_dg" && (<>
            <SectionTitle title="Directeur General" colors={colors} />
            {w.associes.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Remplir depuis un actionnaire :</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {w.associes.map((a, j) => (
                    <TouchableOpacity key={j} onPress={() => w.setDg({ civilite: a.civilite, nom: a.nom, prenom: a.prenom, date_naissance: a.date_naissance, lieu_naissance: a.lieu_naissance, nationalite: a.nationalite, adresse: a.adresse })}
                      style={{ backgroundColor: "#f8fafc", paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#e2e8f0" }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.primary }}>{a.prenom} {a.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <Choice colors={colors} label="Civilite" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.dg.civilite} onChange={(v) => w.setDg({ civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.dg.nom} onChangeText={(v) => w.setDg({ nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prenom" value={w.dg.prenom} onChangeText={(v) => w.setDg({ prenom: v })} /></View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={w.dg.date_naissance} onChangeText={(v) => w.setDg({ date_naissance: v })} placeholder="01/01/1970" /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={w.dg.lieu_naissance} onChangeText={(v) => w.setDg({ lieu_naissance: v })} /></View>
            </View>
            <Field colors={colors} label="Nationalite" value={w.dg.nationalite} onChangeText={(v) => w.setDg({ nationalite: v })} />
            <Field colors={colors} label="Adresse" value={w.dg.adresse} onChangeText={(v) => w.setDg({ adresse: v })} />
          </>)}
        </>)}

        {/* Etape 5 : Commissaires aux comptes */}
        {w.currentStep === 5 && (<>
          <SectionTitle title="Commissaire aux comptes titulaire" colors={colors} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_titulaire.nom} onChangeText={(v) => w.setCac("titulaire", { nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prenom" value={w.cac_titulaire.prenom} onChangeText={(v) => w.setCac("titulaire", { prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.cac_titulaire.adresse} onChangeText={(v) => w.setCac("titulaire", { adresse: v })} />
          <SectionTitle title="Commissaire aux comptes suppleant" colors={colors} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_suppleant.nom} onChangeText={(v) => w.setCac("suppleant", { nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prenom" value={w.cac_suppleant.prenom} onChangeText={(v) => w.setCac("suppleant", { prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.cac_suppleant.adresse} onChangeText={(v) => w.setCac("suppleant", { adresse: v })} />
        </>)}

        {/* Etape 6 : Clauses */}
        {w.currentStep === 6 && (<>
          <SectionTitle title="Cession d'actions a des tiers" colors={colors} />
          <Choice colors={colors} label="Clause applicable" options={[
            { value: "agrement", label: "Agrement" },
            { value: "preemption", label: "Preemption" },
            { value: "inalienabilite", label: "Inalienabilite" },
          ]} value={w.clause_cession} onChange={(v) => w.set({ clause_cession: v })} />
          {w.clause_cession === "preemption" && <Field colors={colors} label="Delai de preemption (mois)" value={w.delai_preemption} onChangeText={(v) => w.set({ delai_preemption: v })} />}
          {w.clause_cession === "inalienabilite" && <Field colors={colors} label="Duree d'inalienabilite (annees, max 10)" value={w.duree_inalienabilite} onChangeText={(v) => w.set({ duree_inalienabilite: v })} />}

          <SectionTitle title="Representation en assemblee generale" colors={colors} />
          <Choice colors={colors} label="Un actionnaire peut se faire representer par" options={[
            { value: "libre", label: "Toute personne" },
            { value: "actionnaire", label: "Actionnaire uniquement" },
          ]} value={w.representation_ag} onChange={(v) => w.set({ representation_ag: v })} />

          <SectionTitle title="Representation au conseil d'administration" colors={colors} />
          <Choice colors={colors} label="Un administrateur peut se faire representer par" options={[
            { value: "libre", label: "Toute personne" },
            { value: "administrateur", label: "Administrateur uniquement" },
          ]} value={w.representation_ca} onChange={(v) => w.set({ representation_ca: v })} />
        </>)}

        {/* Etape 7 : Recapitulatif */}
        {w.currentStep === 7 && (() => {
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
          return (<>
            <Section title="Societe">
              <Row label="Denomination" value={w.denomination} />
              <Row label="Forme" value="SA avec Conseil d'Administration" />
              <Row label="Siege" value={`${w.siege_social}, ${w.ville}`} />
              <Row label="Duree" value={`${w.duree} ans`} />
            </Section>
            <Section title="Capital">
              <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Actions" value={`${nbActions} x ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Liberation" value={w.mode_liberation} />
            </Section>
            <Section title={`Actionnaires (${w.associes.length})`}>
              {w.associes.map((a, i) => <Row key={i} label={`${a.prenom} ${a.nom}`} value={`${a.apport.toLocaleString("fr-FR")} FCFA`} />)}
            </Section>
            <Section title={`Conseil d'Administration (${w.conseil_administration.length})`}>
              {w.conseil_administration.map((adm, i) => <Row key={i} label={`${adm.prenom} ${adm.nom}`} value={adm.adresse || "..."} />)}
              <View style={{ borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 8, paddingTop: 8 }}>
                <Row label="President du CA" value={`${w.president_ca.prenom} ${w.president_ca.nom}`} />
              </View>
            </Section>
            <Section title="Direction Generale">
              <Row label="Variante" value={w.direction_generale === "variante_pdg" ? "PDG (cumul)" : "PCA + DG separes"} />
              {w.direction_generale === "variante_pca_dg" && <Row label="Directeur General" value={`${w.dg.prenom} ${w.dg.nom}`} />}
            </Section>
            <Section title="Commissaires aux comptes">
              <Row label="Titulaire" value={`${w.cac_titulaire.prenom} ${w.cac_titulaire.nom}`} />
              <Row label="Suppleant" value={`${w.cac_suppleant.prenom} ${w.cac_suppleant.nom}`} />
            </Section>
            <Section title="Clauses">
              <Row label="Cession tiers" value={w.clause_cession === "agrement" ? "Agrement" : w.clause_cession === "preemption" ? "Preemption" : "Inalienabilite"} />
              <Row label="Representation AG" value={w.representation_ag === "libre" ? "Libre" : "Actionnaires uniquement"} />
              <Row label="Representation CA" value={w.representation_ca === "libre" ? "Libre" : "Administrateurs uniquement"} />
            </Section>
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          </>);
        })()}

        {/* Etape 8 : Apercu */}
        {w.currentStep === 8 && (<>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            {generatedUrl ? (<>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 22, color: colors.text, marginTop: 16 }}>Document genere</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 8 }}>Statuts SA CA — {w.denomination}</Text>
              <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="download-outline" size={22} color="#ffffff" />
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>Telecharger le DOCX</Text>
              </TouchableOpacity>
            </>) : (
              <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: colors.textSecondary }}>Generation en cours...</Text>
            )}
            <TouchableOpacity onPress={() => { w.reset(); router.replace("/(app)"); }} style={{ marginTop: 16, padding: 12 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
            </TouchableOpacity>
          </View>
        </>)}

    </WizardLayout>
  );
}
