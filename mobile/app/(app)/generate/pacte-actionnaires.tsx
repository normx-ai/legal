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

interface Signataire {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
  nombre_actions: number;
}

interface PacteActionnairesState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  capital: string;
  rccm: string;
  signataires: Signataire[];
  has_clause_preeemption: boolean;
  has_clause_agrement: boolean;
  has_clause_inaliénabilite: boolean;
  duree_inalienabilite: string;
  has_clause_non_concurrence: boolean;
  duree_non_concurrence: string;
  has_clause_sortie_conjointe: boolean;
  has_clause_sortie_forcee: boolean;
  seuil_sortie_forcee: string;
  has_clause_gouvernance: boolean;
  description_gouvernance: string;
  duree_pacte: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PacteActionnairesState>) => void;
  setSignataire: (i: number, data: Partial<Signataire>) => void;
  addSignataire: () => void;
  removeSignataire: (i: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const defaultSignataire: Signataire = { civilite: "Monsieur", nom: "", prenom: "", adresse: "", nombre_actions: 0 };

const useStore = create<PacteActionnairesState>((set) => ({
  denomination: "",
  forme_juridique: "SA",
  siege_social: "",
  capital: "",
  rccm: "",
  signataires: [{ ...defaultSignataire }, { ...defaultSignataire }],
  has_clause_preeemption: true,
  has_clause_agrement: true,
  has_clause_inaliénabilite: false,
  duree_inalienabilite: "3 ans",
  has_clause_non_concurrence: false,
  duree_non_concurrence: "2 ans",
  has_clause_sortie_conjointe: true,
  has_clause_sortie_forcee: false,
  seuil_sortie_forcee: "90%",
  has_clause_gouvernance: false,
  description_gouvernance: "",
  duree_pacte: "5 ans",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
  set: (data) => set((s) => ({ ...s, ...data })),
  setSignataire: (i, data) =>
    set((s) => {
      const signataires = [...s.signataires];
      signataires[i] = { ...signataires[i], ...data };
      return { signataires };
    }),
  addSignataire: () =>
    set((s) => ({
      signataires: [...s.signataires, { ...defaultSignataire }],
    })),
  removeSignataire: (i) =>
    set((s) => ({
      signataires: s.signataires.filter((_, idx) => idx !== i),
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () =>
    set({
      denomination: "",
      forme_juridique: "SA",
      siege_social: "",
      capital: "",
      rccm: "",
      signataires: [{ ...defaultSignataire }, { ...defaultSignataire }],
      has_clause_preeemption: true,
      has_clause_agrement: true,
      has_clause_inaliénabilite: false,
      duree_inalienabilite: "3 ans",
      has_clause_non_concurrence: false,
      duree_non_concurrence: "2 ans",
      has_clause_sortie_conjointe: true,
      has_clause_sortie_forcee: false,
      seuil_sortie_forcee: "90%",
      has_clause_gouvernance: false,
      description_gouvernance: "",
      duree_pacte: "5 ans",
      lieu_signature: "Brazzaville",
      date_signature: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Signataires", "Clauses", "Aperçu"];

// ── Main Screen ──

export default function PacteActionnairesWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/pacte-actionnaires", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        rccm: w.rccm,
        signataires: w.signataires,
        has_clause_preeemption: w.has_clause_preeemption,
        has_clause_agrement: w.has_clause_agrement,
        has_clause_inaliénabilite: w.has_clause_inaliénabilite,
        duree_inalienabilite: w.has_clause_inaliénabilite ? w.duree_inalienabilite : undefined,
        has_clause_non_concurrence: w.has_clause_non_concurrence,
        duree_non_concurrence: w.has_clause_non_concurrence ? w.duree_non_concurrence : undefined,
        has_clause_sortie_conjointe: w.has_clause_sortie_conjointe,
        has_clause_sortie_forcee: w.has_clause_sortie_forcee,
        seuil_sortie_forcee: w.has_clause_sortie_forcee ? w.seuil_sortie_forcee : undefined,
        has_clause_gouvernance: w.has_clause_gouvernance,
        description_gouvernance: w.has_clause_gouvernance ? w.description_gouvernance : undefined,
        duree_pacte: w.duree_pacte,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 2;
  const isDownloadStep = w.currentStep === 3;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const clauses: string[] = [];
    if (w.has_clause_preeemption) clauses.push("Droit de préemption");
    if (w.has_clause_agrement) clauses.push("Clause d'agrément");
    if (w.has_clause_inaliénabilite) clauses.push(`Inaliénabilité (${w.duree_inalienabilite})`);
    if (w.has_clause_non_concurrence) clauses.push(`Non-concurrence (${w.duree_non_concurrence})`);
    if (w.has_clause_sortie_conjointe) clauses.push("Sortie conjointe (tag-along)");
    if (w.has_clause_sortie_forcee) clauses.push(`Sortie forcée (drag-along, seuil ${w.seuil_sortie_forcee})`);
    if (w.has_clause_gouvernance) clauses.push("Gouvernance");

    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PACTE D'ACTIONNAIRES", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "ENTRE LES SOUSSIGNÉS :", bold: true, spaceBefore: true },
    ];
    w.signataires.forEach((s, i) => {
      const nom = s.nom && s.prenom ? `${s.civilite} ${s.prenom} ${s.nom}` : `Signataire ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}${s.adresse ? ", demeurant à " + s.adresse : ""}, détenant ${s.nombre_actions || "..."} actions ;` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: `Durée du pacte : ${v(w.duree_pacte)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Clauses retenues :", bold: true, spaceBefore: true },
    );
    clauses.forEach(c => lines.push({ text: `- ${c}` }));
    if (clauses.length === 0) lines.push({ text: "- Aucune clause sélectionnée", italic: true });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.capital, w.signataires,
      w.has_clause_preeemption, w.has_clause_agrement,
      w.has_clause_inaliénabilite, w.duree_inalienabilite,
      w.has_clause_non_concurrence, w.duree_non_concurrence,
      w.has_clause_sortie_conjointe, w.has_clause_sortie_forcee, w.seuil_sortie_forcee,
      w.has_clause_gouvernance, w.duree_pacte,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Pacte d'actionnaires"
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

        {/* ── Étape 1 : Signataires ── */}
        {w.currentStep === 1 && (
          <>
            {w.signataires.map((s, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Signataire {i + 1}</Text>
                  {w.signataires.length > 2 && (
                    <TouchableOpacity onPress={() => w.removeSignataire(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={s.civilite} onChange={(v) => w.setSignataire(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={s.nom} onChangeText={(v) => w.setSignataire(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={s.prenom} onChangeText={(v) => w.setSignataire(i, { prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Adresse" value={s.adresse} onChangeText={(v) => w.setSignataire(i, { adresse: v })} placeholder="Adresse complète" />
                <Field colors={colors} label="Nombre d'actions" value={s.nombre_actions ? String(s.nombre_actions) : ""} onChangeText={(v) => w.setSignataire(i, { nombre_actions: parseInt(v) || 0 })} keyboardType="numeric" />
              </View>
            ))}
            {w.signataires.length < 20 && (
              <TouchableOpacity onPress={w.addSignataire}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un signataire</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Étape 2 : Clauses ── */}
        {w.currentStep === 2 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Sélectionnez les clauses à inclure dans le pacte d'actionnaires.
            </Text>

            <ToggleRow colors={colors} label="Droit de préemption" value={w.has_clause_preeemption} onToggle={(v) => w.set({ has_clause_preeemption: v })} />
            <ToggleRow colors={colors} label="Clause d'agrément" value={w.has_clause_agrement} onToggle={(v) => w.set({ has_clause_agrement: v })} />

            <ToggleRow colors={colors} label="Clause d'inaliénabilité" value={w.has_clause_inaliénabilite} onToggle={(v) => w.set({ has_clause_inaliénabilite: v })} />
            {w.has_clause_inaliénabilite && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Field colors={colors} label="Durée d'inaliénabilité" value={w.duree_inalienabilite} onChangeText={(v) => w.set({ duree_inalienabilite: v })} placeholder="Ex: 3 ans" />
              </View>
            )}

            <ToggleRow colors={colors} label="Clause de non-concurrence" value={w.has_clause_non_concurrence} onToggle={(v) => w.set({ has_clause_non_concurrence: v })} />
            {w.has_clause_non_concurrence && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Field colors={colors} label="Durée de non-concurrence" value={w.duree_non_concurrence} onChangeText={(v) => w.set({ duree_non_concurrence: v })} placeholder="Ex: 2 ans" />
              </View>
            )}

            <ToggleRow colors={colors} label="Sortie conjointe (tag-along)" value={w.has_clause_sortie_conjointe} onToggle={(v) => w.set({ has_clause_sortie_conjointe: v })} />

            <ToggleRow colors={colors} label="Sortie forcée (drag-along)" value={w.has_clause_sortie_forcee} onToggle={(v) => w.set({ has_clause_sortie_forcee: v })} />
            {w.has_clause_sortie_forcee && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Field colors={colors} label="Seuil de déclenchement" value={w.seuil_sortie_forcee} onChangeText={(v) => w.set({ seuil_sortie_forcee: v })} placeholder="Ex: 90%" />
              </View>
            )}

            <ToggleRow colors={colors} label="Clause de gouvernance" value={w.has_clause_gouvernance} onToggle={(v) => w.set({ has_clause_gouvernance: v })} />
            {w.has_clause_gouvernance && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Field colors={colors} label="Description des règles de gouvernance" value={w.description_gouvernance} onChangeText={(v) => w.set({ description_gouvernance: v })} placeholder="Décrivez les règles de gouvernance" multiline />
              </View>
            )}

            <SectionTitle title="Durée et signature" colors={colors} />
            <Field colors={colors} label="Durée du pacte" value={w.duree_pacte} onChangeText={(v) => w.set({ duree_pacte: v })} placeholder="Ex: 5 ans" />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 3 : Aperçu + Téléchargement ── */}
        {w.currentStep === 3 && (() => {
          const clauses: string[] = [];
          if (w.has_clause_preeemption) clauses.push("Droit de préemption");
          if (w.has_clause_agrement) clauses.push("Clause d'agrément");
          if (w.has_clause_inaliénabilite) clauses.push(`Inaliénabilité (${w.duree_inalienabilite})`);
          if (w.has_clause_non_concurrence) clauses.push(`Non-concurrence (${w.duree_non_concurrence})`);
          if (w.has_clause_sortie_conjointe) clauses.push("Sortie conjointe (tag-along)");
          if (w.has_clause_sortie_forcee) clauses.push(`Sortie forcée (drag-along, seuil ${w.seuil_sortie_forcee})`);
          if (w.has_clause_gouvernance) clauses.push("Gouvernance");

          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  PACTE D'ACTIONNAIRES
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA - Durée : {w.duree_pacte}
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginBottom: 6 }}>Signataires ({w.signataires.length})</Text>
                {w.signataires.map((s, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", paddingVertical: 2 }}>
                    {s.civilite} {s.prenom} {s.nom} - {s.nombre_actions} actions
                  </Text>
                ))}
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Clauses ({clauses.length})</Text>
                {clauses.map((c, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", paddingVertical: 2 }}>- {c}</Text>
                ))}
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
