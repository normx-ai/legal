import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

// ── Types ──
interface StePartAssocie {
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

interface StePartGerant {
  civilite: string;
  nom: string;
  prenom: string;
  remuneration: number;
}

interface StePartState {
  denomination: string;
  objet_social: string;
  domicile: string;
  duree: number;
  duree_indeterminee: boolean;
  delai_preavis: string;
  date_effet: string;
  associes: StePartAssocie[];
  valeur_part: number;
  conditions_mise_disposition: string;
  gerant: StePartGerant;
  limitations_supplementaires: string;
  mode_contestation: string;
  lieu_signature: string;
  date_signature: string;
  nombre_exemplaires: string;
  currentStep: number;
  set: (data: Partial<StePartState>) => void;
  setAssocie: (i: number, data: Partial<StePartAssocie>) => void;
  addAssocie: () => void;
  removeAssocie: (i: number) => void;
  setGerant: (data: Partial<StePartGerant>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultAssocie: StePartAssocie = {
  civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "",
  nationalite: "Congolaise", profession: "", adresse: "", apport: 0, type_apport: "numeraire",
};

const defaultGerant: StePartGerant = { civilite: "Monsieur", nom: "", prenom: "", remuneration: 0 };

const useStePartStore = create<StePartState>((set) => ({
  denomination: "", objet_social: "", domicile: "", duree: 99,
  duree_indeterminee: false, delai_preavis: "3", date_effet: "",
  associes: [{ ...defaultAssocie }, { ...defaultAssocie }],
  valeur_part: 10000, conditions_mise_disposition: "imm\u00e9diatement \u00e0 la signature des pr\u00e9sents statuts",
  gerant: { ...defaultGerant }, limitations_supplementaires: "", mode_contestation: "droit_commun",
  lieu_signature: "Brazzaville", date_signature: "", nombre_exemplaires: "",
  currentStep: 0,
  set: (data) => set(data),
  setAssocie: (i, data) => set((s) => ({ associes: s.associes.map((a, j) => j === i ? { ...a, ...data } : a) })),
  addAssocie: () => set((s) => ({ associes: [...s.associes, { ...defaultAssocie }] })),
  removeAssocie: (i) => set((s) => ({ associes: s.associes.filter((_, j) => j !== i) })),
  setGerant: (data) => set((s) => ({ gerant: { ...s.gerant, ...data } })),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  reset: () => set({
    denomination: "", objet_social: "", domicile: "", duree: 99,
    duree_indeterminee: false, delai_preavis: "3", date_effet: "",
    associes: [{ ...defaultAssocie }, { ...defaultAssocie }],
    valeur_part: 10000, conditions_mise_disposition: "imm\u00e9diatement \u00e0 la signature des pr\u00e9sents statuts",
    gerant: { ...defaultGerant }, limitations_supplementaires: "", mode_contestation: "droit_commun",
    lieu_signature: "Brazzaville", date_signature: "", nombre_exemplaires: "",
    currentStep: 0,
  }),
}));

const STEPS = ["Soci\u00e9t\u00e9", "Associ\u00e9s", "Apports", "G\u00e9rance", "D\u00e9cisions", "R\u00e9capitulatif", "Aper\u00e7u"];

// ── Main Screen ──
export default function StePartWizardScreen() {
  const { colors } = useTheme();
  const w = useStePartStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true); setError("");
    try {
      const { data } = await documentsApi.generate("/generate/ste-part", {
        denomination: w.denomination,
        objet_social: w.objet_social,
        domicile: w.domicile,
        duree: w.duree,
        duree_indeterminee: w.duree_indeterminee,
        delai_preavis: w.delai_preavis,
        date_effet: w.date_effet,
        associes: w.associes,
        valeur_part: w.valeur_part,
        conditions_mise_disposition: w.conditions_mise_disposition,
        gerant: w.gerant,
        limitations_supplementaires: w.limitations_supplementaires,
        mode_contestation: w.mode_contestation,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        nombre_exemplaires: w.nombre_exemplaires,
      });
      addDocument(data.document);
      setGeneratedUrl(data.docx_url);
      w.nextStep();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } };
      const errs = e.response?.data?.errors;
      if (errs && Array.isArray(errs)) setError(errs.map((x) => x.message).join("\n"));
      else setError(e.response?.data?.error || "Erreur lors de la g\u00e9n\u00e9ration");
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.headerBg, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => { if (w.currentStep === 0) router.back(); else w.prevStep(); }}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: "#ffffff" }}>Statuts Soci\u00e9t\u00e9 en Participation</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>\u00c9tape {w.currentStep + 1} / {STEPS.length} \u2014 {STEPS[w.currentStep]}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {STEPS.map((_, i) => (<View key={i} style={{ flex: 1, height: 4, backgroundColor: i <= w.currentStep ? colors.primary : "rgba(255,255,255,0.2)" }} />))}
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ maxWidth: 640, alignSelf: "center", width: "100%" }}>

        {/* \u00c9tape 0 : Soci\u00e9t\u00e9 */}
        {w.currentStep === 0 && (<>
          <Field colors={colors} label="D\u00e9nomination" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA SERVICES" />
          <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.set({ objet_social: v })} placeholder="D\u00e9crivez l'activit\u00e9 principale..." multiline />
          <Field colors={colors} label="Domicile" value={w.domicile} onChangeText={(v) => w.set({ domicile: v })} placeholder="Adresse du si\u00e8ge d'exploitation" />
          <Field colors={colors} label="Dur\u00e9e (ann\u00e9es, max 99)" value={String(w.duree)} onChangeText={(v) => w.set({ duree: parseInt(v) || 99 })} keyboardType="numeric" />
          <ToggleRow colors={colors} label="Dur\u00e9e ind\u00e9termin\u00e9e" value={w.duree_indeterminee} onToggle={(v) => w.set({ duree_indeterminee: v })} />
          {w.duree_indeterminee && (
            <Field colors={colors} label="D\u00e9lai de pr\u00e9avis (mois)" value={w.delai_preavis} onChangeText={(v) => w.set({ delai_preavis: v })} keyboardType="numeric" />
          )}
          <Field colors={colors} label="Date d'effet" value={w.date_effet} onChangeText={(v) => w.set({ date_effet: v })} placeholder="Ex: 01/01/2026" />
        </>)}

        {/* \u00c9tape 1 : Associ\u00e9s */}
        {w.currentStep === 1 && (<>
          {w.associes.map((a, i) => (
            <View key={i} style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Associ\u00e9 {i + 1}</Text>
                {w.associes.length > 2 && <TouchableOpacity onPress={() => w.removeAssocie(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>}
              </View>
              <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={a.civilite} onChange={(v) => w.setAssocie(i, { civilite: v })} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => w.setAssocie(i, { nom: v })} /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={a.prenom} onChangeText={(v) => w.setAssocie(i, { prenom: v })} /></View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={a.date_naissance} onChangeText={(v) => w.setAssocie(i, { date_naissance: v })} placeholder="01/01/1980" /></View>
                <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={a.lieu_naissance} onChangeText={(v) => w.setAssocie(i, { lieu_naissance: v })} /></View>
              </View>
              <Field colors={colors} label="Nationalit\u00e9" value={a.nationalite} onChangeText={(v) => w.setAssocie(i, { nationalite: v })} />
              <Field colors={colors} label="Profession" value={a.profession} onChangeText={(v) => w.setAssocie(i, { profession: v })} />
              <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => w.setAssocie(i, { adresse: v })} />
            </View>
          ))}
          <TouchableOpacity onPress={w.addAssocie} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un associ\u00e9</Text>
          </TouchableOpacity>
        </>)}

        {/* \u00c9tape 2 : Apports */}
        {w.currentStep === 2 && (() => {
          const totalApports = w.associes.reduce((s, a) => s + a.apport, 0);
          const totalParts = w.valeur_part > 0 ? Math.floor(totalApports / w.valeur_part) : 0;
          return (<>
            <SectionTitle title="Apports par associ\u00e9" colors={colors} />
            {w.associes.map((a, i) => (
              <View key={i} style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.primary, marginBottom: 8 }}>{a.prenom || "Associ\u00e9"} {a.nom || i + 1}</Text>
                <Field colors={colors} label="Apport (FCFA)" value={a.apport ? String(a.apport) : ""} onChangeText={(v) => w.setAssocie(i, { apport: parseInt(v) || 0 })} keyboardType="numeric" />
                <Choice colors={colors} label="Type d'apport" options={[
                  { value: "numeraire", label: "Num\u00e9raire" },
                  { value: "nature", label: "Nature" },
                ]} value={a.type_apport} onChange={(v) => w.setAssocie(i, { type_apport: v })} />
              </View>
            ))}
            <SectionTitle title="Parts sociales" colors={colors} />
            <Field colors={colors} label="Valeur d'une part (FCFA)" value={String(w.valeur_part)} onChangeText={(v) => w.set({ valeur_part: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Conditions de mise \u00e0 disposition" value={w.conditions_mise_disposition} onChangeText={(v) => w.set({ conditions_mise_disposition: v })} />
            <SectionTitle title="R\u00e9partition" colors={colors} />
            <View style={{ backgroundColor: "#ffffff", padding: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Total apports</Text>
                <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{totalApports.toLocaleString("fr-FR")} FCFA</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Nombre de parts</Text>
                <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{totalParts.toLocaleString("fr-FR")}</Text>
              </View>
              {w.associes.map((a, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
                  <Text style={{ fontFamily: fonts.regular, color: colors.text }}>{a.prenom} {a.nom}</Text>
                  <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>
                    {w.valeur_part > 0 ? Math.floor(a.apport / w.valeur_part) : 0} parts
                  </Text>
                </View>
              ))}
            </View>
          </>);
        })()}

        {/* \u00c9tape 3 : G\u00e9rance */}
        {w.currentStep === 3 && (<>
          <SectionTitle title="G\u00e9rant" colors={colors} />
          {w.associes.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Remplir depuis un associ\u00e9 :</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {w.associes.map((a, i) => (
                  <TouchableOpacity key={i} onPress={() => w.setGerant({ civilite: a.civilite, nom: a.nom, prenom: a.prenom })}
                    style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#e2e8f0" }}>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary }}>{a.prenom} {a.nom}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <Choice colors={colors} label="Civilit\u00e9" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.gerant.civilite} onChange={(v) => w.setGerant({ civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant.nom} onChangeText={(v) => w.setGerant({ nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Pr\u00e9nom" value={w.gerant.prenom} onChangeText={(v) => w.setGerant({ prenom: v })} /></View>
          </View>
          <Field colors={colors} label="R\u00e9mun\u00e9ration (FCFA)" value={w.gerant.remuneration ? String(w.gerant.remuneration) : ""} onChangeText={(v) => w.setGerant({ remuneration: parseInt(v) || 0 })} keyboardType="numeric" />
          <Field colors={colors} label="Limitations suppl\u00e9mentaires (optionnel)" value={w.limitations_supplementaires} onChangeText={(v) => w.set({ limitations_supplementaires: v })} placeholder="Pr\u00e9cisez les limitations de pouvoir..." multiline />

          <SectionTitle title="Contestation" colors={colors} />
          <Choice colors={colors} label="Mode de r\u00e8glement des litiges" options={[
            { value: "droit_commun", label: "Droit commun" },
            { value: "arbitrage", label: "Arbitrage OHADA" },
          ]} value={w.mode_contestation} onChange={(v) => w.set({ mode_contestation: v })} />
        </>)}

        {/* \u00c9tape 4 : D\u00e9cisions */}
        {w.currentStep === 4 && (<>
          <SectionTitle title="R\u00e8gles de d\u00e9cision" colors={colors} />
          <View style={{ backgroundColor: "#fffbeb", padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
              R\u00e8gles applicables
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#a16207", lineHeight: 20 }}>
              Approbation des comptes : majorit\u00e9 repr\u00e9sentant plus de 50% des parts.{"\n"}
              Autres d\u00e9cisions (modification des statuts, dissolution, etc.) : unanimit\u00e9 des associ\u00e9s.
            </Text>
          </View>

          <SectionTitle title="Signature" colors={colors} />
          <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          <Field colors={colors} label="Nombre d'exemplaires" value={w.nombre_exemplaires} onChangeText={(v) => w.set({ nombre_exemplaires: v })} placeholder="Ex: 4" keyboardType="numeric" />
        </>)}

        {/* \u00c9tape 5 : R\u00e9capitulatif */}
        {w.currentStep === 5 && (() => {
          const totalApports = w.associes.reduce((s, a) => s + a.apport, 0);
          const totalParts = w.valeur_part > 0 ? Math.floor(totalApports / w.valeur_part) : 0;
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
            <Section title="Soci\u00e9t\u00e9">
              <Row label="D\u00e9nomination" value={w.denomination} />
              <Row label="Forme" value="Soci\u00e9t\u00e9 en Participation" />
              <Row label="Domicile" value={w.domicile} />
              <Row label="Dur\u00e9e" value={w.duree_indeterminee ? `Ind\u00e9termin\u00e9e (pr\u00e9avis ${w.delai_preavis} mois)` : `${w.duree} ans`} />
              <Row label="Date d'effet" value={w.date_effet} />
            </Section>
            <Section title={`Associ\u00e9s (${w.associes.length})`}>
              {w.associes.map((a, i) => <Row key={i} label={`${a.prenom} ${a.nom}`} value={`${a.apport.toLocaleString("fr-FR")} FCFA`} />)}
            </Section>
            <Section title="Apports">
              <Row label="Total apports" value={`${totalApports.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Valeur part" value={`${w.valeur_part.toLocaleString("fr-FR")} FCFA`} />
              <Row label="Nombre de parts" value={`${totalParts}`} />
            </Section>
            <Section title="G\u00e9rance">
              <Row label="G\u00e9rant" value={`${w.gerant.prenom} ${w.gerant.nom}`} />
              <Row label="R\u00e9mun\u00e9ration" value={w.gerant.remuneration ? `${w.gerant.remuneration.toLocaleString("fr-FR")} FCFA` : "Gratuit"} />
              <Row label="Contestation" value={w.mode_contestation === "arbitrage" ? "Arbitrage OHADA" : "Droit commun"} />
            </Section>
            <Section title="Signature">
              <Row label="Lieu" value={w.lieu_signature} />
              <Row label="Date" value={w.date_signature || new Date().toLocaleDateString("fr-FR")} />
              <Row label="Exemplaires" value={w.nombre_exemplaires || "-"} />
            </Section>
          </>);
        })()}

        {/* \u00c9tape 6 : Aper\u00e7u */}
        {w.currentStep === 6 && (<>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            {generatedUrl ? (<>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 22, color: colors.text, marginTop: 16 }}>Document g\u00e9n\u00e9r\u00e9</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 8 }}>Statuts Soci\u00e9t\u00e9 en Participation \u2014 {w.denomination}</Text>
              <TouchableOpacity onPress={handleDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="download-outline" size={22} color="#ffffff" />
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>T\u00e9l\u00e9charger le DOCX</Text>
              </TouchableOpacity>
            </>) : (
              <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: colors.textSecondary }}>G\u00e9n\u00e9ration en cours...</Text>
            )}
            <TouchableOpacity onPress={() => { w.reset(); router.replace("/(app)"); }} style={{ marginTop: 16, padding: 12 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
            </TouchableOpacity>
          </View>
        </>)}

        {error ? <Text style={{ color: colors.danger, fontFamily: fonts.regular, fontSize: 14, marginTop: 8 }}>{error}</Text> : null}
      </ScrollView>

      {/* Footer */}
      {!isDownloadStep && (
        <View style={{ flexDirection: "row", padding: 16, gap: 12, backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
          {w.currentStep > 0 && (
            <TouchableOpacity onPress={w.prevStep} style={{ flex: 1, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.text }}>Pr\u00e9c\u00e9dent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={isLastDataStep ? handleGenerate : w.nextStep} disabled={isGenerating}
            style={{ flex: 1, padding: 14, backgroundColor: isGenerating ? colors.disabled : colors.primary, alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: "#ffffff" }}>
              {isGenerating ? "G\u00e9n\u00e9ration..." : isLastDataStep ? "G\u00e9n\u00e9rer le document" : "Suivant"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
