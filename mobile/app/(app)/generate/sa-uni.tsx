import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── SA UNI Store ──
interface SaUniAssocieUnique {
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

interface SaUniAg {
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
  duree_mandat: string;
}

interface SaUniCac {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface SaUniState {
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
  associe: SaUniAssocieUnique;
  ag: SaUniAg;
  cac_titulaire: SaUniCac;
  cac_suppleant: SaUniCac;
  date_signature: string;
  lieu_signature: string;
  currentStep: number;
  set: (data: Partial<SaUniState>) => void;
  setAssocie: (data: Partial<SaUniAssocieUnique>) => void;
  setAg: (data: Partial<SaUniAg>) => void;
  setCac: (type: "titulaire" | "suppleant", data: Partial<SaUniCac>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultAssocie: SaUniAssocieUnique = {
  civilite: "Monsieur", nom: "", prenom: "", date_naissance: "",
  lieu_naissance: "", nationalite: "Congolaise", profession: "", adresse: "",
  apport: 0, type_apport: "numeraire",
};
const defaultAg: SaUniAg = {
  civilite: "Monsieur", nom: "", prenom: "", date_naissance: "",
  lieu_naissance: "", nationalite: "Congolaise", adresse: "", duree_mandat: "deux ans",
};
const defaultCac: SaUniCac = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };

const useSaUniStore = create<SaUniState>((set) => ({
  denomination: "", sigle: "", objet_social: "", siege_social: "",
  ville: "Brazzaville", pays: "République du Congo", duree: 99,
  exercice_debut: "1er janvier", exercice_fin: "31 décembre", premier_exercice_fin: "",
  capital: 10000000, valeur_nominale: 10000,
  mode_liberation: "intégralement", lieu_depot: "", nom_depositaire: "", date_certificat_depot: "",
  associe: { ...defaultAssocie },
  ag: { ...defaultAg },
  cac_titulaire: { ...defaultCac },
  cac_suppleant: { ...defaultCac },
  date_signature: "", lieu_signature: "Brazzaville",
  currentStep: 0,
  set: (data) => set(data),
  setAssocie: (data) => set((s) => ({ associe: { ...s.associe, ...data } })),
  setAg: (data) => set((s) => ({ ag: { ...s.ag, ...data } })),
  setCac: (type, data) => set((s) =>
    type === "titulaire"
      ? { cac_titulaire: { ...s.cac_titulaire, ...data } }
      : { cac_suppleant: { ...s.cac_suppleant, ...data } }
  ),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  reset: () => set({
    denomination: "", sigle: "", objet_social: "", siege_social: "",
    ville: "Brazzaville", pays: "République du Congo", duree: 99,
    exercice_debut: "1er janvier", exercice_fin: "31 décembre", premier_exercice_fin: "",
    capital: 10000000, valeur_nominale: 10000,
    mode_liberation: "intégralement", lieu_depot: "", nom_depositaire: "", date_certificat_depot: "",
    associe: { ...defaultAssocie }, ag: { ...defaultAg },
    cac_titulaire: { ...defaultCac }, cac_suppleant: { ...defaultCac },
    date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  }),
}));

const STEPS = ["Société", "Actionnaire unique", "Capital", "Admin. Général", "CAC", "Récapitulatif", "Aperçu"];

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

export default function SaUniWizardScreen() {
  const { colors } = useTheme();
  const w = useSaUniStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true); setError("");
    try {
      const { data } = await documentsApi.generate("/generate/sa-uni", {
        denomination: w.denomination, sigle: w.sigle, objet_social: w.objet_social,
        siege_social: w.siege_social, ville: w.ville, pays: w.pays, duree: w.duree,
        exercice_debut: w.exercice_debut, exercice_fin: w.exercice_fin, premier_exercice_fin: w.premier_exercice_fin,
        capital: w.capital, valeur_nominale: w.valeur_nominale,
        mode_liberation: w.mode_liberation, lieu_depot: w.lieu_depot, nom_depositaire: w.nom_depositaire, date_certificat_depot: w.date_certificat_depot,
        associes: [w.associe],
        ag: w.ag, cac_titulaire: w.cac_titulaire, cac_suppleant: w.cac_suppleant,
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

  const isLastDataStep = w.currentStep === 5;
  const isDownloadStep = w.currentStep === 6;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "SA Unipersonnelle", center: true, size: "md" as const },
      { text: `Au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "sm" as const },
      { text: `Siège social : ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "STATUTS", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "L'actionnaire unique soussigné :", spaceBefore: true },
    ];
    const nom = w.associe.nom && w.associe.prenom ? `${w.associe.civilite} ${w.associe.prenom} ${w.associe.nom}` : "Actionnaire unique (à compléter)";
    lines.push({ text: `- ${nom}${w.associe.adresse ? ", demeurant à " + w.associe.adresse : ""} ;` });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Article premier : Forme", bold: true, spaceBefore: true },
      { text: "Il est formé par l'actionnaire unique une société anonyme unipersonnelle régie par l'Acte Uniforme OHADA." },
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
      { text: "Article 14 : Administrateur Général", bold: true, spaceBefore: true },
      { text: `Est nommé administrateur général : ${v(w.ag.prenom)} ${v(w.ag.nom)}, pour une durée de ${v(w.ag.duree_mandat)}.` },
      { text: "", spaceBefore: true },
      { text: "[ ... articles complets dans le document DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.sigle, w.objet_social, w.siege_social, w.ville, w.pays,
      w.capital, w.valeur_nominale, w.associe, w.ag, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Statuts SA Unipersonnelle"
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
          <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA HOLDING" />
          <Field colors={colors} label="Sigle (optionnel)" value={w.sigle} onChangeText={(v) => w.set({ sigle: v })} />
          <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.set({ objet_social: v })} placeholder="Décrivez l'activité principale..." multiline />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
          <Field colors={colors} label="Ville" value={w.ville} onChangeText={(v) => w.set({ ville: v })} />
          <Field colors={colors} label="Pays" value={w.pays} onChangeText={(v) => w.set({ pays: v })} />
          <Field colors={colors} label="Durée (années, max 99)" value={String(w.duree)} onChangeText={(v) => w.set({ duree: parseInt(v) || 99 })} keyboardType="numeric" />
          <Field colors={colors} label="Clôture du 1er exercice" value={w.premier_exercice_fin} onChangeText={(v) => w.set({ premier_exercice_fin: v })} placeholder="Ex: 31 décembre 2026" />
        </>)}

        {/* Étape 1 : Actionnaire unique */}
        {w.currentStep === 1 && (<>
          <SectionTitle title="Actionnaire unique" colors={colors} />
          <View style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.associe.civilite} onChange={(v) => w.setAssocie({ civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.associe.nom} onChangeText={(v) => w.setAssocie({ nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.associe.prenom} onChangeText={(v) => w.setAssocie({ prenom: v })} /></View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={w.associe.date_naissance} onChangeText={(v) => w.setAssocie({ date_naissance: v })} placeholder="01/01/1980" /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={w.associe.lieu_naissance} onChangeText={(v) => w.setAssocie({ lieu_naissance: v })} /></View>
            </View>
            <Field colors={colors} label="Nationalité" value={w.associe.nationalite} onChangeText={(v) => w.setAssocie({ nationalite: v })} />
            <Field colors={colors} label="Profession" value={w.associe.profession} onChangeText={(v) => w.setAssocie({ profession: v })} />
            <Field colors={colors} label="Adresse" value={w.associe.adresse} onChangeText={(v) => w.setAssocie({ adresse: v })} />
            <Field colors={colors} label="Apport (FCFA)" value={w.associe.apport ? String(w.associe.apport) : ""} onChangeText={(v) => w.setAssocie({ apport: parseInt(v) || 0 })} keyboardType="numeric" />
          </View>
          <View style={{ backgroundColor: "#fffbeb", padding: 12, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#92400e" }}>
              L'apport de l'actionnaire unique doit correspondre au capital social.
            </Text>
          </View>
        </>)}

        {/* Étape 2 : Capital */}
        {w.currentStep === 2 && (() => {
          const nbActions = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          return (<>
            <Field colors={colors} label="Capital social (FCFA)" value={String(w.capital)} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.warning, marginBottom: 12 }}>Capital minimum SA : 10.000.000 FCFA</Text>
            <Field colors={colors} label="Valeur nominale d'une action (FCFA)" value={String(w.valeur_nominale)} onChangeText={(v) => w.set({ valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.warning, marginBottom: 12 }}>Valeur nominale minimum : 10.000 FCFA</Text>
            <Choice colors={colors} label="Mode de libération" options={[
              { value: "intégralement", label: "Intégrale" },
              { value: "du quart", label: "Au 1/4" },
              { value: "de la moitié", label: "À la 1/2" },
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
                <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Apport actionnaire unique</Text>
                <Text style={{ fontFamily: fonts.semiBold, color: w.associe.apport === w.capital ? colors.success : colors.danger }}>{w.associe.apport.toLocaleString("fr-FR")} FCFA</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
                <Text style={{ fontFamily: fonts.regular, color: colors.text }}>{w.associe.prenom} {w.associe.nom}</Text>
                <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>{nbActions} actions</Text>
              </View>
            </View>
          </>);
        })()}

        {/* Étape 3 : Administrateur Général */}
        {w.currentStep === 3 && (<>
          <SectionTitle title="Administrateur Général" colors={colors} />
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Remplir depuis l'actionnaire unique :</Text>
            <TouchableOpacity onPress={() => w.setAg({
              civilite: w.associe.civilite, nom: w.associe.nom, prenom: w.associe.prenom,
              date_naissance: w.associe.date_naissance, lieu_naissance: w.associe.lieu_naissance,
              nationalite: w.associe.nationalite, adresse: w.associe.adresse,
            })}
              style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#e2e8f0", alignSelf: "flex-start" }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary }}>{w.associe.prenom} {w.associe.nom}</Text>
            </TouchableOpacity>
          </View>
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.ag.civilite} onChange={(v) => w.setAg({ civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.ag.nom} onChangeText={(v) => w.setAg({ nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.ag.prenom} onChangeText={(v) => w.setAg({ prenom: v })} /></View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={w.ag.date_naissance} onChangeText={(v) => w.setAg({ date_naissance: v })} placeholder="01/01/1970" /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={w.ag.lieu_naissance} onChangeText={(v) => w.setAg({ lieu_naissance: v })} /></View>
          </View>
          <Field colors={colors} label="Nationalité" value={w.ag.nationalite} onChangeText={(v) => w.setAg({ nationalite: v })} />
          <Field colors={colors} label="Adresse" value={w.ag.adresse} onChangeText={(v) => w.setAg({ adresse: v })} />
          <Field colors={colors} label="Durée du mandat" value={w.ag.duree_mandat} onChangeText={(v) => w.setAg({ duree_mandat: v })} />
        </>)}

        {/* Étape 4 : Commissaires aux comptes */}
        {w.currentStep === 4 && (<>
          <SectionTitle title="Commissaire aux comptes titulaire" colors={colors} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_titulaire.nom} onChangeText={(v) => w.setCac("titulaire", { nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cac_titulaire.prenom} onChangeText={(v) => w.setCac("titulaire", { prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.cac_titulaire.adresse} onChangeText={(v) => w.setCac("titulaire", { adresse: v })} />
          <SectionTitle title="Commissaire aux comptes suppléant" colors={colors} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_suppleant.nom} onChangeText={(v) => w.setCac("suppleant", { nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cac_suppleant.prenom} onChangeText={(v) => w.setCac("suppleant", { prenom: v })} /></View>
          </View>
          <Field colors={colors} label="Adresse" value={w.cac_suppleant.adresse} onChangeText={(v) => w.setCac("suppleant", { adresse: v })} />
        </>)}

        {/* Étape 5 : Récapitulatif */}
        {w.currentStep === 5 && (() => {
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
            <Section title="Société">
              <Row label="Dénomination" value={w.denomination} />
              <Row label="Forme" value="SA Unipersonnelle" />
              <Row label="Siège" value={`${w.siege_social}, ${w.ville}`} />
              <Row label="Durée" value={`${w.duree} ans`} />
            </Section>
            <Section title="Capital">
              <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Actions" value={`${nbActions} x ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Libération" value={w.mode_liberation} />
            </Section>
            <Section title="Actionnaire unique">
              <Row label="Nom" value={`${w.associe.prenom} ${w.associe.nom}`} />
              <Row label="Apport" value={`${w.associe.apport.toLocaleString("fr-FR")} FCFA`} />
            </Section>
            <Section title="Administrateur Général">
              <Row label="Nom" value={`${w.ag.prenom} ${w.ag.nom}`} />
              <Row label="Mandat" value={w.ag.duree_mandat} />
            </Section>
            <Section title="Commissaires aux comptes">
              <Row label="Titulaire" value={`${w.cac_titulaire.prenom} ${w.cac_titulaire.nom}`} />
              <Row label="Suppléant" value={`${w.cac_suppleant.prenom} ${w.cac_suppleant.nom}`} />
            </Section>
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          </>);
        })()}

        {/* Étape 6 : Aperçu / Téléchargement */}
        {w.currentStep === 6 && (<>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            {generatedUrl ? (<>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 22, color: colors.text, marginTop: 16 }}>Document généré</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 8 }}>Statuts SA UNI — {w.denomination}</Text>
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
