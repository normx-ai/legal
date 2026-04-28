import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { parseAmount } from "@/lib/utils/parseAmount";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// ── Types ──

interface PvAgeSaState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  date_assemblee: string;
  date_assemblee_lettres: string;
  heure_assemblee: string;
  heure_assemblee_lettres: string;
  lieu_assemblee: string;
  mode_convocation: string;
  date_convocation: string;
  president_assemblee: string;
  scrutateur_1: string;
  scrutateur_2: string;
  secretaire_assemblee: string;
  nombre_actionnaires: number;
  nombre_actions_presentes: number;
  nombre_actions_total: number;
  quorum_atteint: boolean;
  decisions_selectionnees: string[];
  // Détails conditionnels
  ancien_siege: string;
  nouveau_siege: string;
  nouvelle_denomination: string;
  nouvel_objet: string;
  nouvelle_duree: string;
  augmentation_montant: number;
  augmentation_mode: string;
  reduction_montant: number;
  reduction_motif: string;
  nouvelle_forme_juridique: string;
  liquidateur_nom: string;
  liquidateur_adresse: string;
  fusion_details: string;
  scission_details: string;
  apport_partiel_details: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<PvAgeSaState>) => void;
  toggleDecision: (d: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<PvAgeSaState, "set" | "toggleDecision" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  date_assemblee: "",
  date_assemblee_lettres: "",
  heure_assemblee: "",
  heure_assemblee_lettres: "",
  lieu_assemblee: "",
  mode_convocation: "lettre recommandée",
  date_convocation: "",
  president_assemblee: "",
  scrutateur_1: "",
  scrutateur_2: "",
  secretaire_assemblee: "",
  nombre_actionnaires: 0,
  nombre_actions_presentes: 0,
  nombre_actions_total: 0,
  quorum_atteint: true,
  decisions_selectionnees: [],
  ancien_siege: "",
  nouveau_siege: "",
  nouvelle_denomination: "",
  nouvel_objet: "",
  nouvelle_duree: "",
  augmentation_montant: 0,
  augmentation_mode: "numéraire",
  reduction_montant: 0,
  reduction_motif: "",
  nouvelle_forme_juridique: "",
  liquidateur_nom: "",
  liquidateur_adresse: "",
  fusion_details: "",
  scission_details: "",
  apport_partiel_details: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<PvAgeSaState>((set) => ({
  ...INITIAL,
  set: (data) => set((s) => ({ ...s, ...data })),
  toggleDecision: (d) =>
    set((s) => ({
      decisions_selectionnees: s.decisions_selectionnees.includes(d)
        ? s.decisions_selectionnees.filter((x) => x !== d)
        : [...s.decisions_selectionnees, d],
    })),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  reset: () => set({ ...INITIAL }),
}));

const STEPS = ["Société", "Assemblée", "Bureau", "Résolutions", "Détails", "Aperçu"];

const RESOLUTIONS_LIST: { key: string; label: string }[] = [
  { key: "changement_denomination", label: "Changement de dénomination" },
  { key: "modification_objet", label: "Modification de l'objet social" },
  { key: "transfert_siege", label: "Transfert du siège social" },
  { key: "prorogation_duree", label: "Prorogation de la durée" },
  { key: "augmentation_capital", label: "Augmentation de capital" },
  { key: "reduction_capital", label: "Réduction de capital" },
  { key: "continuation_perte", label: "Continuation malgré pertes" },
  { key: "transformation", label: "Transformation de la société" },
  { key: "dissolution", label: "Dissolution anticipée" },
  { key: "fusion", label: "Fusion" },
  { key: "scission", label: "Scission" },
  { key: "apport_partiel", label: "Apport partiel d'actif" },
  { key: "mise_harmonie", label: "Mise en harmonie des statuts" },
  { key: "pouvoirs", label: "Pouvoirs" },
];

// ── Main Screen ──

export default function PvAgeSaWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/pv-age-sa", w.nextStep);

  const has = (d: string) => w.decisions_selectionnees.includes(d);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        date_assemblee: w.date_assemblee,
        date_assemblee_lettres: w.date_assemblee_lettres,
        heure_assemblee: w.heure_assemblee,
        heure_assemblee_lettres: w.heure_assemblee_lettres,
        lieu_assemblee: w.lieu_assemblee,
        mode_convocation: w.mode_convocation,
        date_convocation: w.date_convocation,
        president_assemblee: w.president_assemblee,
        scrutateur_1: w.scrutateur_1,
        scrutateur_2: w.scrutateur_2,
        secretaire_assemblee: w.secretaire_assemblee,
        nombre_actionnaires: w.nombre_actionnaires,
        nombre_actions_presentes: w.nombre_actions_presentes,
        nombre_actions_total: w.nombre_actions_total,
        quorum_atteint: w.quorum_atteint,
        decisions_selectionnees: w.decisions_selectionnees,
        ancien_siege: has("transfert_siege") ? w.ancien_siege : undefined,
        nouveau_siege: has("transfert_siege") ? w.nouveau_siege : undefined,
        nouvelle_denomination: has("changement_denomination") ? w.nouvelle_denomination : undefined,
        nouvel_objet: has("modification_objet") ? w.nouvel_objet : undefined,
        nouvelle_duree: has("prorogation_duree") ? w.nouvelle_duree : undefined,
        augmentation_montant: has("augmentation_capital") ? w.augmentation_montant : undefined,
        augmentation_mode: has("augmentation_capital") ? w.augmentation_mode : undefined,
        reduction_montant: has("reduction_capital") ? w.reduction_montant : undefined,
        reduction_motif: has("reduction_capital") ? w.reduction_motif : undefined,
        nouvelle_forme_juridique: has("transformation") ? w.nouvelle_forme_juridique : undefined,
        liquidateur_nom: has("dissolution") ? w.liquidateur_nom : undefined,
        liquidateur_adresse: has("dissolution") ? w.liquidateur_adresse : undefined,
        fusion_details: has("fusion") ? w.fusion_details : undefined,
        scission_details: has("scission") ? w.scission_details : undefined,
        apport_partiel_details: has("apport_partiel") ? w.apport_partiel_details : undefined,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 4;
  const isDownloadStep = w.currentStep === 5;

  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE EXTRAORDINAIRE", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `L'assemblée générale extraordinaire s'est réunie le ${v(w.date_assemblee)} à ${v(w.heure_assemblee)} au ${v(w.lieu_assemblee)}.`, spaceBefore: true },
      { text: `Président de séance : ${v(w.president_assemblee)}`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Résolutions adoptées :", bold: true, spaceBefore: true },
    ];
    w.decisions_selectionnees.forEach((d) => {
      const found = RESOLUTIONS_LIST.find((x) => x.key === d);
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
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.date_assemblee,
      w.heure_assemblee, w.lieu_assemblee, w.president_assemblee, w.decisions_selectionnees,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="PV AGE (SA/SAS)"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: ALPHA HOLDING SA" />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital} onChangeText={(v) => w.set({ capital: v })} placeholder="Ex: 10 000 000" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Numéro RC" value={w.rc_numero} onChangeText={(v) => w.set({ rc_numero: v })} placeholder="Ex: RCCM BZV-..." />
          </>
        )}

        {/* ── Étape 1 : Assemblée ── */}
        {w.currentStep === 1 && (
          <>
            <Field colors={colors} label="Date de l'assemblée" value={w.date_assemblee} onChangeText={(v) => w.set({ date_assemblee: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Date en lettres" value={w.date_assemblee_lettres} onChangeText={(v) => w.set({ date_assemblee_lettres: v })} placeholder="Ex: quinze mars deux mille vingt-six" />
            <Field colors={colors} label="Heure de l'assemblée" value={w.heure_assemblee} onChangeText={(v) => w.set({ heure_assemblee: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Heure en lettres" value={w.heure_assemblee_lettres} onChangeText={(v) => w.set({ heure_assemblee_lettres: v })} placeholder="Ex: dix heures" />
            <Field colors={colors} label="Lieu de l'assemblée" value={w.lieu_assemblee} onChangeText={(v) => w.set({ lieu_assemblee: v })} placeholder="Ex: siège social" />
            <Choice colors={colors} label="Mode de convocation" options={[
              { value: "lettre recommandée", label: "Lettre recommandée" },
              { value: "acte extrajudiciaire", label: "Acte extrajudiciaire" },
              { value: "email", label: "Email" },
            ]} value={w.mode_convocation} onChange={(v) => w.set({ mode_convocation: v })} />
            <Field colors={colors} label="Date de convocation" value={w.date_convocation} onChangeText={(v) => w.set({ date_convocation: v })} placeholder="Ex: 1er mars 2026" />
          </>
        )}

        {/* ── Étape 2 : Bureau ── */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Président de séance" value={w.president_assemblee} onChangeText={(v) => w.set({ president_assemblee: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Premier scrutateur" value={w.scrutateur_1} onChangeText={(v) => w.set({ scrutateur_1: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Deuxième scrutateur" value={w.scrutateur_2} onChangeText={(v) => w.set({ scrutateur_2: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Secrétaire de séance" value={w.secretaire_assemblee} onChangeText={(v) => w.set({ secretaire_assemblee: v })} placeholder="Nom complet" />
            <Field colors={colors} label="Nombre d'actionnaires présents/représentés" value={w.nombre_actionnaires ? String(w.nombre_actionnaires) : ""} onChangeText={(v) => w.set({ nombre_actionnaires: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Actions présentes/représentées" value={w.nombre_actions_presentes ? String(w.nombre_actions_presentes) : ""} onChangeText={(v) => w.set({ nombre_actions_presentes: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Total des actions" value={w.nombre_actions_total ? String(w.nombre_actions_total) : ""} onChangeText={(v) => w.set({ nombre_actions_total: parseInt(v) || 0 })} keyboardType="numeric" />
            <ToggleRow colors={colors} label="Quorum atteint" value={w.quorum_atteint} onToggle={(v) => w.set({ quorum_atteint: v })} />
          </>
        )}

        {/* ── Étape 3 : Résolutions ── */}
        {w.currentStep === 3 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Sélectionnez les résolutions soumises à l'assemblée générale extraordinaire.
            </Text>
            {RESOLUTIONS_LIST.map((d) => (
              <ToggleRow key={d.key} colors={colors} label={d.label} value={w.decisions_selectionnees.includes(d.key)} onToggle={() => w.toggleDecision(d.key)} />
            ))}
          </>
        )}

        {/* ── Étape 4 : Détails ── */}
        {w.currentStep === 4 && (
          <>
            {has("changement_denomination") && (
              <>
                <SectionTitle title="Changement de dénomination" colors={colors} />
                <Field colors={colors} label="Nouvelle dénomination" value={w.nouvelle_denomination} onChangeText={(v) => w.set({ nouvelle_denomination: v })} placeholder="Nouvelle dénomination sociale" />
              </>
            )}

            {has("modification_objet") && (
              <>
                <SectionTitle title="Modification de l'objet social" colors={colors} />
                <Field colors={colors} label="Nouvel objet social" value={w.nouvel_objet} onChangeText={(v) => w.set({ nouvel_objet: v })} placeholder="Décrire le nouvel objet..." multiline />
              </>
            )}

            {has("transfert_siege") && (
              <>
                <SectionTitle title="Transfert du siège social" colors={colors} />
                <Field colors={colors} label="Ancien siège" value={w.ancien_siege} onChangeText={(v) => w.set({ ancien_siege: v })} />
                <Field colors={colors} label="Nouveau siège" value={w.nouveau_siege} onChangeText={(v) => w.set({ nouveau_siege: v })} />
              </>
            )}

            {has("prorogation_duree") && (
              <>
                <SectionTitle title="Prorogation de la durée" colors={colors} />
                <Field colors={colors} label="Nouvelle durée" value={w.nouvelle_duree} onChangeText={(v) => w.set({ nouvelle_duree: v })} placeholder="Ex: 99 ans" />
              </>
            )}

            {has("augmentation_capital") && (
              <>
                <SectionTitle title="Augmentation de capital" colors={colors} />
                <Field colors={colors} label="Montant de l'augmentation (FCFA)" value={w.augmentation_montant ? String(w.augmentation_montant) : ""} onChangeText={(v) => w.set({ augmentation_montant: parseInt(v) || 0 })} keyboardType="numeric" />
                <Choice colors={colors} label="Mode d'augmentation" options={[
                  { value: "numéraire", label: "Numéraire" },
                  { value: "nature", label: "Nature" },
                  { value: "incorporation_reserves", label: "Incorporation de réserves" },
                ]} value={w.augmentation_mode} onChange={(v) => w.set({ augmentation_mode: v })} />
              </>
            )}

            {has("reduction_capital") && (
              <>
                <SectionTitle title="Réduction de capital" colors={colors} />
                <Field colors={colors} label="Montant de la réduction (FCFA)" value={w.reduction_montant ? String(w.reduction_montant) : ""} onChangeText={(v) => w.set({ reduction_montant: parseInt(v) || 0 })} keyboardType="numeric" />
                <Field colors={colors} label="Motif de la réduction" value={w.reduction_motif} onChangeText={(v) => w.set({ reduction_motif: v })} placeholder="Motif..." multiline />
              </>
            )}

            {has("transformation") && (
              <>
                <SectionTitle title="Transformation" colors={colors} />
                <Field colors={colors} label="Nouvelle forme juridique" value={w.nouvelle_forme_juridique} onChangeText={(v) => w.set({ nouvelle_forme_juridique: v })} placeholder="Ex: SARL, SAS..." />
              </>
            )}

            {has("dissolution") && (
              <>
                <SectionTitle title="Dissolution anticipée" colors={colors} />
                <Field colors={colors} label="Nom du liquidateur" value={w.liquidateur_nom} onChangeText={(v) => w.set({ liquidateur_nom: v })} />
                <Field colors={colors} label="Adresse du liquidateur" value={w.liquidateur_adresse} onChangeText={(v) => w.set({ liquidateur_adresse: v })} />
              </>
            )}

            {has("fusion") && (
              <>
                <SectionTitle title="Fusion" colors={colors} />
                <Field colors={colors} label="Détails de la fusion" value={w.fusion_details} onChangeText={(v) => w.set({ fusion_details: v })} placeholder="Décrire les modalités de la fusion..." multiline />
              </>
            )}

            {has("scission") && (
              <>
                <SectionTitle title="Scission" colors={colors} />
                <Field colors={colors} label="Détails de la scission" value={w.scission_details} onChangeText={(v) => w.set({ scission_details: v })} placeholder="Décrire les modalités de la scission..." multiline />
              </>
            )}

            {has("apport_partiel") && (
              <>
                <SectionTitle title="Apport partiel d'actif" colors={colors} />
                <Field colors={colors} label="Détails de l'apport partiel" value={w.apport_partiel_details} onChangeText={(v) => w.set({ apport_partiel_details: v })} placeholder="Décrire l'apport partiel d'actif..." multiline />
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
                  PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE EXTRAORDINAIRE
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  L'assemblée générale extraordinaire s'est réunie le {w.date_assemblee} à {w.heure_assemblee} au {w.lieu_assemblee}, sous la présidence de {w.president_assemblee}.
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Résolutions</Text>
                {w.decisions_selectionnees.map((d) => {
                  const found = RESOLUTIONS_LIST.find((x) => x.key === d);
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
