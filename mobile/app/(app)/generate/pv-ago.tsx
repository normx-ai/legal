import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { documentsApi } from "@/lib/api/documents";
import { useDocumentsStore } from "@/lib/store/documents";
import { create } from "zustand";

interface AssocieRow {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
  parts: number;
  mandataire_nom?: string;
}

interface PvAgoState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  date_ag: string;
  heure_ag: string;
  lieu_ag: string;
  exercice_clos_le: string;
  associes_presents: AssocieRow[];
  associes_representes: AssocieRow[];
  associes_absents: AssocieRow[];
  president_seance: { civilite: string; nom: string; prenom: string };
  ordre_du_jour: string;
  resultat_exercice: number;
  resultat_type: string;
  affectation_resultat: string;
  has_conventions: boolean;
  convention_details: string;
  gerant_civilite: string;
  gerant_nom: string;
  gerant_prenom: string;
  has_renouvellement_gerant: boolean;
  duree_renouvellement: string;
  has_remuneration_gerant: boolean;
  remuneration_montant: string;
  has_cac: boolean;
  cac_nom: string;
  cac_duree: string;
  resolutions_supplementaires: string;
  heure_levee_seance: string;
  date_signature: string;
  lieu_signature: string;
  currentStep: number;
  set: (data: Partial<PvAgoState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const emptyAssocie = (): AssocieRow => ({ civilite: "Monsieur", nom: "", prenom: "", adresse: "", parts: 0 });

const initialState = {
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  capital: "",
  date_ag: "",
  heure_ag: "",
  lieu_ag: "",
  exercice_clos_le: "",
  associes_presents: [emptyAssocie()],
  associes_representes: [] as AssocieRow[],
  associes_absents: [] as AssocieRow[],
  president_seance: { civilite: "Monsieur", nom: "", prenom: "" },
  ordre_du_jour: "",
  resultat_exercice: 0,
  resultat_type: "bénéficiaire",
  affectation_resultat: "",
  has_conventions: false,
  convention_details: "",
  gerant_civilite: "Monsieur",
  gerant_nom: "",
  gerant_prenom: "",
  has_renouvellement_gerant: false,
  duree_renouvellement: "",
  has_remuneration_gerant: false,
  remuneration_montant: "",
  has_cac: false,
  cac_nom: "",
  cac_duree: "6 exercices",
  resolutions_supplementaires: "",
  heure_levee_seance: "",
  date_signature: "",
  lieu_signature: "Brazzaville",
  currentStep: 0,
};

const useStore = create<PvAgoState>((set) => ({
  ...initialState,
  set: (data) => set((s) => ({ ...s, ...data })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set(initialState),
}));

const STEPS = ["Société", "Assemblée", "Présents", "Représentés/Absents", "Bureau & ODJ", "Résultat", "Gérance & CAC", "Clôture", "Aperçu"];

export default function PvAgoWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateAssocies = (key: "associes_presents" | "associes_representes" | "associes_absents") =>
    (i: number, patch: Partial<AssocieRow>) => {
      const list = [...w[key]];
      list[i] = { ...list[i], ...patch };
      w.set({ [key]: list } as Partial<PvAgoState>);
    };

  const addAssocie = (key: "associes_presents" | "associes_representes" | "associes_absents") => () => {
    w.set({ [key]: [...w[key], emptyAssocie()] } as Partial<PvAgoState>);
  };

  const removeAssocie = (key: "associes_presents" | "associes_representes" | "associes_absents") => (i: number) => {
    w.set({ [key]: w[key].filter((_, idx) => idx !== i) } as Partial<PvAgoState>);
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/pv-ago", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: w.capital,
        date_ag: w.date_ag,
        heure_ag: w.heure_ag,
        lieu_ag: w.lieu_ag,
        exercice_clos_le: w.exercice_clos_le,
        associes_presents: w.associes_presents,
        associes_representes: w.associes_representes,
        associes_absents: w.associes_absents,
        president_seance: w.president_seance,
        ordre_du_jour: w.ordre_du_jour,
        resultat_exercice: w.resultat_exercice,
        resultat_type: w.resultat_type,
        affectation_resultat: w.affectation_resultat,
        has_conventions: w.has_conventions,
        convention_details: w.convention_details,
        gerant_civilite: w.gerant_civilite,
        gerant_nom: w.gerant_nom,
        gerant_prenom: w.gerant_prenom,
        has_renouvellement_gerant: w.has_renouvellement_gerant,
        duree_renouvellement: w.duree_renouvellement,
        has_remuneration_gerant: w.has_remuneration_gerant,
        remuneration_montant: w.remuneration_montant,
        has_cac: w.has_cac,
        cac_nom: w.cac_nom,
        cac_duree: w.cac_duree,
        resolutions_supplementaires: w.resolutions_supplementaires,
        heure_levee_seance: w.heure_levee_seance,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        lieu_signature: w.lieu_signature,
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

  const isLastDataStep = w.currentStep === 7;
  const isDownloadStep = w.currentStep === 8;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl", spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "lg" },
      { text: "Assemblée Générale Ordinaire", center: true, size: "md" },
      { text: `Exercice clos le ${v(w.exercice_clos_le)}`, center: true, size: "sm" },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Le ${v(w.date_ag)} à ${v(w.heure_ag)}, les associés de ${v(w.denomination)} se sont réunis en AGO à ${v(w.lieu_ag)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Ordre du jour :", bold: true, spaceBefore: true },
      { text: w.ordre_du_jour || "..." },
      { text: "", spaceBefore: true },
      { text: `Résultat de l'exercice : ${w.resultat_exercice.toLocaleString("fr-FR")} FCFA (${w.resultat_type})`, spaceBefore: true },
      { text: w.affectation_resultat ? `Affectation : ${w.affectation_resultat}` : "" },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    ];
    return lines.filter(l => l.text !== "");
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital, w.exercice_clos_le,
      w.date_ag, w.heure_ag, w.lieu_ag, w.ordre_du_jour,
      w.resultat_exercice, w.resultat_type, w.affectation_resultat]);

  return (
    <WizardLayout
      title="PV AGO (SARL)"
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
      {w.currentStep === 0 && (
        <>
          <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} />
          <Choice colors={colors} label="Forme juridique" options={[
            { value: "SARL", label: "SARL" },
            { value: "SARLU", label: "SARLU" },
            { value: "SNC", label: "SNC" },
          ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} />
          <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} />
          <Field colors={colors} label="Exercice clos le" value={w.exercice_clos_le} onChangeText={(v) => w.set({ exercice_clos_le: v })} placeholder="Ex: 31 décembre 2025" />
        </>
      )}

      {w.currentStep === 1 && (
        <>
          <Field colors={colors} label="Date de l'AGO" value={w.date_ag} onChangeText={(v) => w.set({ date_ag: v })} placeholder="Ex: 30 juin 2026" />
          <Field colors={colors} label="Heure" value={w.heure_ag} onChangeText={(v) => w.set({ heure_ag: v })} placeholder="Ex: 10h00" />
          <Field colors={colors} label="Lieu" value={w.lieu_ag} onChangeText={(v) => w.set({ lieu_ag: v })} />
        </>
      )}

      {w.currentStep === 2 && (
        <>
          <SectionTitle title="Associés présents" colors={colors} />
          {w.associes_presents.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_presents")} onRemove={removeAssocie("associes_presents")} canRemove={w.associes_presents.length > 1} colors={colors} />
          ))}
          <TouchableOpacity onPress={addAssocie("associes_presents")} style={addBtn(colors)}><Text style={{ color: colors.primary }}>+ Ajouter un associé</Text></TouchableOpacity>
        </>
      )}

      {w.currentStep === 3 && (
        <>
          <SectionTitle title="Associés représentés" colors={colors} />
          {w.associes_representes.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_representes")} onRemove={removeAssocie("associes_representes")} canRemove withMandataire colors={colors} />
          ))}
          <TouchableOpacity onPress={addAssocie("associes_representes")} style={addBtn(colors)}><Text style={{ color: colors.primary }}>+ Ajouter un représenté</Text></TouchableOpacity>
          <SectionTitle title="Associés absents" colors={colors} />
          {w.associes_absents.map((a, i) => (
            <AssocieCard key={i} a={a} i={i} onChange={updateAssocies("associes_absents")} onRemove={removeAssocie("associes_absents")} canRemove colors={colors} />
          ))}
          <TouchableOpacity onPress={addAssocie("associes_absents")} style={addBtn(colors)}><Text style={{ color: colors.primary }}>+ Ajouter un absent</Text></TouchableOpacity>
        </>
      )}

      {w.currentStep === 4 && (
        <>
          <SectionTitle title="Président de séance" colors={colors} />
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_seance.civilite} onChange={(v) => w.set({ president_seance: { ...w.president_seance, civilite: v } })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_seance.nom} onChangeText={(v) => w.set({ president_seance: { ...w.president_seance, nom: v } })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president_seance.prenom} onChangeText={(v) => w.set({ president_seance: { ...w.president_seance, prenom: v } })} /></View>
          </View>
          <SectionTitle title="Ordre du jour" colors={colors} />
          <Field colors={colors} label="Ordre du jour" value={w.ordre_du_jour} onChangeText={(v) => w.set({ ordre_du_jour: v })} multiline />
        </>
      )}

      {w.currentStep === 5 && (
        <>
          <Field colors={colors} label="Résultat de l'exercice (FCFA)" value={w.resultat_exercice ? String(w.resultat_exercice) : ""} onChangeText={(v) => w.set({ resultat_exercice: parseInt(v) || 0 })} keyboardType="numeric" />
          <Choice colors={colors} label="Type" options={[{ value: "bénéficiaire", label: "Bénéficiaire" }, { value: "déficitaire", label: "Déficitaire" }]} value={w.resultat_type} onChange={(v) => w.set({ resultat_type: v })} />
          <Field colors={colors} label="Affectation du résultat" value={w.affectation_resultat} onChangeText={(v) => w.set({ affectation_resultat: v })} multiline placeholder="Réserve légale, report à nouveau, dividendes..." />
          <ToggleRow label="Conventions réglementées" value={w.has_conventions} onToggle={(v) => w.set({ has_conventions: v })} colors={colors} />
          {w.has_conventions && (
            <Field colors={colors} label="Détail des conventions" value={w.convention_details} onChangeText={(v) => w.set({ convention_details: v })} multiline />
          )}
        </>
      )}

      {w.currentStep === 6 && (
        <>
          <SectionTitle title="Gérant" colors={colors} />
          <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.gerant_civilite} onChange={(v) => w.set({ gerant_civilite: v })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant_nom} onChangeText={(v) => w.set({ gerant_nom: v })} /></View>
            <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.gerant_prenom} onChangeText={(v) => w.set({ gerant_prenom: v })} /></View>
          </View>
          <ToggleRow label="Renouvellement du mandat" value={w.has_renouvellement_gerant} onToggle={(v) => w.set({ has_renouvellement_gerant: v })} colors={colors} />
          {w.has_renouvellement_gerant && (
            <Field colors={colors} label="Durée du renouvellement" value={w.duree_renouvellement} onChangeText={(v) => w.set({ duree_renouvellement: v })} placeholder="Ex: 4 ans" />
          )}
          <ToggleRow label="Rémunération du gérant" value={w.has_remuneration_gerant} onToggle={(v) => w.set({ has_remuneration_gerant: v })} colors={colors} />
          {w.has_remuneration_gerant && (
            <Field colors={colors} label="Montant" value={w.remuneration_montant} onChangeText={(v) => w.set({ remuneration_montant: v })} placeholder="Ex: 500 000 FCFA / mois" />
          )}
          <SectionTitle title="Commissaire aux Comptes" colors={colors} />
          <ToggleRow label="Désigner un CAC" value={w.has_cac} onToggle={(v) => w.set({ has_cac: v })} colors={colors} />
          {w.has_cac && (
            <>
              <Field colors={colors} label="Nom du CAC" value={w.cac_nom} onChangeText={(v) => w.set({ cac_nom: v })} />
              <Field colors={colors} label="Durée du mandat" value={w.cac_duree} onChangeText={(v) => w.set({ cac_duree: v })} />
            </>
          )}
        </>
      )}

      {w.currentStep === 7 && (
        <>
          <Field colors={colors} label="Résolutions supplémentaires" value={w.resolutions_supplementaires} onChangeText={(v) => w.set({ resolutions_supplementaires: v })} multiline placeholder="Optionnel" />
          <Field colors={colors} label="Heure de levée de séance" value={w.heure_levee_seance} onChangeText={(v) => w.set({ heure_levee_seance: v })} placeholder="Ex: 12h00" />
          <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
          <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
        </>
      )}

      {w.currentStep === 8 && (
        <DownloadStep colors={colors} generatedUrl={generatedUrl} onDownload={handleDownload} onReset={() => { w.reset(); router.replace("/(app)"); }} title={w.denomination} />
      )}
    </WizardLayout>
  );
}

function AssocieCard({ a, i, onChange, onRemove, canRemove, withMandataire, colors }: {
  a: AssocieRow;
  i: number;
  onChange: (i: number, patch: Partial<AssocieRow>) => void;
  onRemove: (i: number) => void;
  canRemove: boolean;
  withMandataire?: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontSize: 13 }}>Associé {i + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={() => onRemove(i)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
      <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={a.civilite} onChange={(v) => onChange(i, { civilite: v })} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => onChange(i, { nom: v })} /></View>
        <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => onChange(i, { prenom: v })} /></View>
      </View>
      <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => onChange(i, { adresse: v })} />
      <Field colors={colors} label="Nombre de parts" value={a.parts ? String(a.parts) : ""} onChangeText={(v) => onChange(i, { parts: parseInt(v) || 0 })} keyboardType="numeric" />
      {withMandataire && (
        <Field colors={colors} label="Mandataire" value={a.mandataire_nom || ""} onChangeText={(v) => onChange(i, { mandataire_nom: v })} />
      )}
    </View>
  );
}

function DownloadStep({ colors, generatedUrl, onDownload, onReset, title }: {
  colors: ReturnType<typeof useTheme>["colors"];
  generatedUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
  title: string;
}) {
  return (
    <>
      <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>PROCÈS-VERBAL AGO</Text>
        <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, textAlign: "center" }}>{title}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
      </View>
      <View style={{ alignItems: "center", paddingBottom: 24 }}>
        {generatedUrl ? (
          <TouchableOpacity onPress={onDownload} style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}>
            <Ionicons name="download-outline" size={22} color="#ffffff" />
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>Télécharger le DOCX</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: colors.success + "15", padding: 16, width: "100%", alignItems: "center" }}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, marginTop: 8 }}>Document généré</Text>
          </View>
        )}
        <TouchableOpacity onPress={onReset} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function addBtn(colors: ReturnType<typeof useTheme>["colors"]) {
  return { paddingVertical: 10, alignItems: "center" as const, borderWidth: 1, borderStyle: "dashed" as const, borderColor: colors.primary, borderRadius: 6 };
}
