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

interface DecActionnaireUniqueAGState {
  denomination: string;
  siege_social: string;
  capital: string;
  forme_juridique: string;
  rc_numero: string;
  is_personne_physique: boolean;
  // Personne physique
  actionnaire_civilite: string;
  actionnaire_nom: string;
  actionnaire_prenom: string;
  actionnaire_adresse: string;
  // Personne morale
  actionnaire_denomination: string;
  actionnaire_forme: string;
  actionnaire_capital: string;
  actionnaire_siege: string;
  actionnaire_rc: string;
  actionnaire_representant: string;
  qualite_actionnaire: string;
  date_decisions: string;
  date_decisions_lettres: string;
  heure_decisions: string;
  heure_decisions_lettres: string;
  decisions_selectionnees: string[];
  // Conditional fields
  exercice_clos_le: string;
  resultat_type: string;
  resultat_montant: number;
  affectation_details: string;
  has_conventions: boolean;
  convention_details: string;
  duree_mandat: string;
  remuneration_details: string;
  commissaire_titulaire_nom: string;
  commissaire_titulaire_adresse: string;
  commissaire_suppleant_nom: string;
  commissaire_suppleant_adresse: string;
  ancien_siege: string;
  nouveau_siege: string;
  liquidateur_nom: string;
  nouvelle_forme_juridique: string;
  lieu_signature: string;
  date_signature: string;
  currentStep: number;
  set: (data: Partial<DecActionnaireUniqueAGState>) => void;
  toggleDecision: (d: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const INITIAL: Omit<DecActionnaireUniqueAGState, "set" | "toggleDecision" | "nextStep" | "prevStep" | "reset"> = {
  denomination: "",
  siege_social: "",
  capital: "",
  forme_juridique: "SA",
  rc_numero: "",
  is_personne_physique: true,
  actionnaire_civilite: "Monsieur",
  actionnaire_nom: "",
  actionnaire_prenom: "",
  actionnaire_adresse: "",
  actionnaire_denomination: "",
  actionnaire_forme: "",
  actionnaire_capital: "",
  actionnaire_siege: "",
  actionnaire_rc: "",
  actionnaire_representant: "",
  qualite_actionnaire: "administrateur général",
  date_decisions: "",
  date_decisions_lettres: "",
  heure_decisions: "",
  heure_decisions_lettres: "",
  decisions_selectionnees: [],
  exercice_clos_le: "",
  resultat_type: "bénéficiaire",
  resultat_montant: 0,
  affectation_details: "",
  has_conventions: false,
  convention_details: "",
  duree_mandat: "",
  remuneration_details: "",
  commissaire_titulaire_nom: "",
  commissaire_titulaire_adresse: "",
  commissaire_suppleant_nom: "",
  commissaire_suppleant_adresse: "",
  ancien_siege: "",
  nouveau_siege: "",
  liquidateur_nom: "",
  nouvelle_forme_juridique: "",
  lieu_signature: "Brazzaville",
  date_signature: "",
  currentStep: 0,
};

const useStore = create<DecActionnaireUniqueAGState>((set) => ({
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

const STEPS = ["Société", "Actionnaire", "Décisions", "Détails", "Aperçu"];

const DECISIONS_LIST: { key: string; label: string }[] = [
  { key: "approbation_comptes", label: "Approbation des comptes" },
  { key: "affectation_resultats", label: "Affectation des résultats" },
  { key: "conventions", label: "Approbation des conventions" },
  { key: "renouvellement_mandat", label: "Renouvellement du mandat" },
  { key: "remuneration", label: "Rémunération du dirigeant" },
  { key: "nomination_cac", label: "Nomination CAC" },
  { key: "renouvellement_cac", label: "Renouvellement CAC" },
  { key: "changement_denomination", label: "Changement de dénomination" },
  { key: "prorogation_duree", label: "Prorogation de la durée" },
  { key: "modification_objet", label: "Modification de l'objet social" },
  { key: "transfert_siege", label: "Transfert du siège social" },
  { key: "continuation_perte", label: "Continuation malgré pertes" },
  { key: "augmentation_capital_numeraire", label: "Augmentation capital (numéraire)" },
  { key: "augmentation_capital_nature", label: "Augmentation capital (nature)" },
  { key: "augmentation_capital_reserves", label: "Augmentation capital (réserves)" },
  { key: "reduction_capital", label: "Réduction de capital" },
  { key: "transformation", label: "Transformation" },
  { key: "dissolution", label: "Dissolution et liquidation" },
  { key: "mise_harmonie", label: "Mise en harmonie des statuts" },
  { key: "pouvoirs", label: "Pouvoirs" },
];

// ── Main Screen ──

export default function DecActionnaireUniqueAGWizardScreen() {
  const { colors } = useTheme();
  const w = useStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/dec-actionnaire-unique-ag", w.nextStep);

  const has = (d: string) => w.decisions_selectionnees.includes(d);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        siege_social: w.siege_social,
        capital: parseAmount(w.capital),
        forme_juridique: w.forme_juridique,
        rc_numero: w.rc_numero,
        is_personne_physique: w.is_personne_physique,
        actionnaire_civilite: w.is_personne_physique ? w.actionnaire_civilite : undefined,
        actionnaire_nom: w.is_personne_physique ? w.actionnaire_nom : undefined,
        actionnaire_prenom: w.is_personne_physique ? w.actionnaire_prenom : undefined,
        actionnaire_adresse: w.is_personne_physique ? w.actionnaire_adresse : undefined,
        actionnaire_denomination: !w.is_personne_physique ? w.actionnaire_denomination : undefined,
        actionnaire_forme: !w.is_personne_physique ? w.actionnaire_forme : undefined,
        actionnaire_capital: !w.is_personne_physique ? w.actionnaire_capital : undefined,
        actionnaire_siege: !w.is_personne_physique ? w.actionnaire_siege : undefined,
        actionnaire_rc: !w.is_personne_physique ? w.actionnaire_rc : undefined,
        actionnaire_representant: !w.is_personne_physique ? w.actionnaire_representant : undefined,
        qualite_actionnaire: w.qualite_actionnaire,
        date_decisions: w.date_decisions,
        date_decisions_lettres: w.date_decisions_lettres,
        heure_decisions: w.heure_decisions,
        heure_decisions_lettres: w.heure_decisions_lettres,
        decisions_selectionnees: w.decisions_selectionnees,
        exercice_clos_le: has("approbation_comptes") ? w.exercice_clos_le : undefined,
        resultat_type: has("approbation_comptes") ? w.resultat_type : undefined,
        resultat_montant: has("approbation_comptes") ? w.resultat_montant : undefined,
        affectation_details: has("affectation_resultats") ? w.affectation_details : undefined,
        has_conventions: has("conventions") ? w.has_conventions : undefined,
        convention_details: has("conventions") && w.has_conventions ? w.convention_details : undefined,
        duree_mandat: has("renouvellement_mandat") ? w.duree_mandat : undefined,
        remuneration_details: has("remuneration") ? w.remuneration_details : undefined,
        commissaire_titulaire_nom: has("nomination_cac") ? w.commissaire_titulaire_nom : undefined,
        commissaire_titulaire_adresse: has("nomination_cac") ? w.commissaire_titulaire_adresse : undefined,
        commissaire_suppleant_nom: has("nomination_cac") ? w.commissaire_suppleant_nom : undefined,
        commissaire_suppleant_adresse: has("nomination_cac") ? w.commissaire_suppleant_adresse : undefined,
        ancien_siege: has("transfert_siege") ? w.ancien_siege : undefined,
        nouveau_siege: has("transfert_siege") ? w.nouveau_siege : undefined,
        liquidateur_nom: has("dissolution") ? w.liquidateur_nom : undefined,
        nouvelle_forme_juridique: has("transformation") ? w.nouvelle_forme_juridique : undefined,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 3;
  const isDownloadStep = w.currentStep === 4;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const actName = w.is_personne_physique
      ? `${v(w.actionnaire_civilite)} ${v(w.actionnaire_prenom)} ${v(w.actionnaire_nom)}`
      : v(w.actionnaire_denomination);
    const lines: any[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${v(w.capital)} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "DÉCISIONS DE L'ACTIONNAIRE UNIQUE", bold: true, center: true, size: "lg" as const },
      { text: "(Assemblée Générale)", center: true, size: "md" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `${actName}, actionnaire unique (${v(w.qualite_actionnaire)}) de la société ${v(w.denomination)}, a pris les décisions suivantes le ${v(w.date_decisions)} à ${v(w.heure_decisions)}.`, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "Décisions sélectionnées :", bold: true, spaceBefore: true },
    ];
    w.decisions_selectionnees.forEach((d) => {
      const found = DECISIONS_LIST.find((x) => x.key === d);
      if (found) lines.push({ text: `- ${found.label}` });
    });
    if (w.decisions_selectionnees.length === 0) {
      lines.push({ text: "(aucune décision sélectionnée)", italic: true });
    }
    lines.push(
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
    );
    return lines.filter((l: any) => l.text !== undefined);
  }, [w.denomination, w.siege_social, w.capital, w.forme_juridique, w.is_personne_physique,
      w.actionnaire_civilite, w.actionnaire_nom, w.actionnaire_prenom, w.actionnaire_denomination,
      w.qualite_actionnaire, w.date_decisions, w.heure_decisions, w.decisions_selectionnees,
      w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Décisions actionnaire unique AG (SA/SASU)"
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
              { value: "SASU", label: "SASU" },
            ]} value={w.forme_juridique} onChange={(v) => w.set({ forme_juridique: v })} />
            <Field colors={colors} label="Numéro RC" value={w.rc_numero} onChangeText={(v) => w.set({ rc_numero: v })} placeholder="Ex: RCCM BZV-..." />
          </>
        )}

        {/* ── Étape 1 : Actionnaire ── */}
        {w.currentStep === 1 && (
          <>
            <ToggleRow colors={colors} label="Actionnaire personne physique" value={w.is_personne_physique} onToggle={(v) => w.set({ is_personne_physique: v })} />

            {w.is_personne_physique ? (
              <>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.actionnaire_civilite} onChange={(v) => w.set({ actionnaire_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.actionnaire_nom} onChangeText={(v) => w.set({ actionnaire_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.actionnaire_prenom} onChangeText={(v) => w.set({ actionnaire_prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Adresse" value={w.actionnaire_adresse} onChangeText={(v) => w.set({ actionnaire_adresse: v })} placeholder="Adresse complète" />
              </>
            ) : (
              <>
                <Field colors={colors} label="Dénomination" value={w.actionnaire_denomination} onChangeText={(v) => w.set({ actionnaire_denomination: v })} placeholder="Dénomination de la personne morale" />
                <Field colors={colors} label="Forme juridique" value={w.actionnaire_forme} onChangeText={(v) => w.set({ actionnaire_forme: v })} placeholder="Ex: SA, SARL..." />
                <Field colors={colors} label="Capital" value={w.actionnaire_capital} onChangeText={(v) => w.set({ actionnaire_capital: v })} placeholder="Capital social (FCFA)" />
                <Field colors={colors} label="Siège social" value={w.actionnaire_siege} onChangeText={(v) => w.set({ actionnaire_siege: v })} />
                <Field colors={colors} label="Numéro RC" value={w.actionnaire_rc} onChangeText={(v) => w.set({ actionnaire_rc: v })} />
                <Field colors={colors} label="Représentant" value={w.actionnaire_representant} onChangeText={(v) => w.set({ actionnaire_representant: v })} placeholder="Nom du représentant légal" />
              </>
            )}

            <Choice colors={colors} label="Qualité de l'actionnaire" options={[
              { value: "administrateur général", label: "Administrateur général" },
              { value: "président", label: "Président" },
            ]} value={w.qualite_actionnaire} onChange={(v) => w.set({ qualite_actionnaire: v })} />

            <Field colors={colors} label="Date des décisions" value={w.date_decisions} onChangeText={(v) => w.set({ date_decisions: v })} placeholder="Ex: 15 mars 2026" />
            <Field colors={colors} label="Date des décisions (en lettres)" value={w.date_decisions_lettres} onChangeText={(v) => w.set({ date_decisions_lettres: v })} placeholder="Ex: quinze mars deux mille vingt-six" />
            <Field colors={colors} label="Heure des décisions" value={w.heure_decisions} onChangeText={(v) => w.set({ heure_decisions: v })} placeholder="Ex: 10h00" />
            <Field colors={colors} label="Heure des décisions (en lettres)" value={w.heure_decisions_lettres} onChangeText={(v) => w.set({ heure_decisions_lettres: v })} placeholder="Ex: dix heures" />
          </>
        )}

        {/* ── Étape 2 : Décisions ── */}
        {w.currentStep === 2 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Sélectionnez les décisions prises par l'actionnaire unique.
            </Text>
            {DECISIONS_LIST.map((d) => (
              <ToggleRow key={d.key} colors={colors} label={d.label} value={w.decisions_selectionnees.includes(d.key)} onToggle={() => w.toggleDecision(d.key)} />
            ))}
          </>
        )}

        {/* ── Étape 3 : Détails ── */}
        {w.currentStep === 3 && (
          <>
            {has("approbation_comptes") && (
              <>
                <SectionTitle title="Approbation des comptes" colors={colors} />
                <Field colors={colors} label="Exercice clos le" value={w.exercice_clos_le} onChangeText={(v) => w.set({ exercice_clos_le: v })} placeholder="Ex: 31 décembre 2025" />
                <Choice colors={colors} label="Type de résultat" options={[
                  { value: "bénéficiaire", label: "Bénéficiaire" },
                  { value: "déficitaire", label: "Déficitaire" },
                ]} value={w.resultat_type} onChange={(v) => w.set({ resultat_type: v })} />
                <Field colors={colors} label="Montant du résultat (FCFA)" value={w.resultat_montant ? String(w.resultat_montant) : ""} onChangeText={(v) => w.set({ resultat_montant: parseInt(v) || 0 })} keyboardType="numeric" />
              </>
            )}

            {has("affectation_resultats") && (
              <>
                <SectionTitle title="Affectation des résultats" colors={colors} />
                <Field colors={colors} label="Détails de l'affectation" value={w.affectation_details} onChangeText={(v) => w.set({ affectation_details: v })} placeholder="Décrire l'affectation du résultat..." multiline />
              </>
            )}

            {has("conventions") && (
              <>
                <SectionTitle title="Conventions réglementées" colors={colors} />
                <ToggleRow colors={colors} label="Des conventions ont été conclues" value={w.has_conventions} onToggle={(v) => w.set({ has_conventions: v })} />
                {w.has_conventions && (
                  <Field colors={colors} label="Détails des conventions" value={w.convention_details} onChangeText={(v) => w.set({ convention_details: v })} placeholder="Décrire les conventions..." multiline />
                )}
              </>
            )}

            {has("renouvellement_mandat") && (
              <>
                <SectionTitle title="Renouvellement du mandat" colors={colors} />
                <Field colors={colors} label="Durée du mandat" value={w.duree_mandat} onChangeText={(v) => w.set({ duree_mandat: v })} placeholder="Ex: 4 ans" />
              </>
            )}

            {has("remuneration") && (
              <>
                <SectionTitle title="Rémunération du dirigeant" colors={colors} />
                <Field colors={colors} label="Détails de la rémunération" value={w.remuneration_details} onChangeText={(v) => w.set({ remuneration_details: v })} placeholder="Décrire la rémunération..." multiline />
              </>
            )}

            {has("nomination_cac") && (
              <>
                <SectionTitle title="Nomination CAC" colors={colors} />
                <Field colors={colors} label="Nom du commissaire titulaire" value={w.commissaire_titulaire_nom} onChangeText={(v) => w.set({ commissaire_titulaire_nom: v })} />
                <Field colors={colors} label="Adresse du commissaire titulaire" value={w.commissaire_titulaire_adresse} onChangeText={(v) => w.set({ commissaire_titulaire_adresse: v })} />
                <Field colors={colors} label="Nom du commissaire suppléant" value={w.commissaire_suppleant_nom} onChangeText={(v) => w.set({ commissaire_suppleant_nom: v })} />
                <Field colors={colors} label="Adresse du commissaire suppléant" value={w.commissaire_suppleant_adresse} onChangeText={(v) => w.set({ commissaire_suppleant_adresse: v })} />
              </>
            )}

            {has("transfert_siege") && (
              <>
                <SectionTitle title="Transfert du siège social" colors={colors} />
                <Field colors={colors} label="Ancien siège" value={w.ancien_siege} onChangeText={(v) => w.set({ ancien_siege: v })} />
                <Field colors={colors} label="Nouveau siège" value={w.nouveau_siege} onChangeText={(v) => w.set({ nouveau_siege: v })} />
              </>
            )}

            {has("dissolution") && (
              <>
                <SectionTitle title="Dissolution et liquidation" colors={colors} />
                <Field colors={colors} label="Nom du liquidateur" value={w.liquidateur_nom} onChangeText={(v) => w.set({ liquidateur_nom: v })} />
              </>
            )}

            {has("transformation") && (
              <>
                <SectionTitle title="Transformation" colors={colors} />
                <Field colors={colors} label="Nouvelle forme juridique" value={w.nouvelle_forme_juridique} onChangeText={(v) => w.set({ nouvelle_forme_juridique: v })} placeholder="Ex: SA, SAS..." />
              </>
            )}

            <SectionTitle title="Signature" colors={colors} />
            <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
            <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
          </>
        )}

        {/* ── Étape 4 : Aperçu + Téléchargement ── */}
        {w.currentStep === 4 && (() => {
          const actName = w.is_personne_physique
            ? `${w.actionnaire_civilite} ${w.actionnaire_prenom} ${w.actionnaire_nom}`
            : w.actionnaire_denomination;
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  DÉCISIONS DE L'ACTIONNAIRE UNIQUE (AG)
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  {actName}, actionnaire unique ({w.qualite_actionnaire}) de la société {w.denomination}, a pris les décisions suivantes le {w.date_decisions} à {w.heure_decisions}.
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>Décisions</Text>
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
