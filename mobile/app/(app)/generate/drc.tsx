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

interface DrcSignataire {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface DrcState {
  denomination: string;
  forme_juridique: string;
  siege_social: string;
  date_statuts: string;
  signataires: DrcSignataire[];
  qualite_signataires: string;
  capital: number;
  valeur_nominale: number;
  type_titres: string;
  liberation_fractionnee: boolean;
  quotite_liberee: string;
  nom_banque: string;
  adresse_banque: string;
  has_president_ca: boolean;
  president_ca_civilite: string;
  president_ca_nom: string;
  president_ca_prenom: string;
  has_dg: boolean;
  dg_civilite: string;
  dg_nom: string;
  dg_prenom: string;
  has_ag: boolean;
  ag_civilite: string;
  ag_nom: string;
  ag_prenom: string;
  has_president_sas: boolean;
  president_sas_civilite: string;
  president_sas_nom: string;
  president_sas_prenom: string;
  has_gerant: boolean;
  gerant_civilite: string;
  gerant_nom: string;
  gerant_prenom: string;
  has_cac: boolean;
  cac_civilite: string;
  cac_nom: string;
  cac_prenom: string;
  duree_mandat_cac: string;
  has_cac_suppleant: boolean;
  cac_suppleant_civilite: string;
  cac_suppleant_nom: string;
  cac_suppleant_prenom: string;
  has_actes_anterieurs: boolean;
  lieu_signature: string;
  date_signature: string;
  nombre_exemplaires: string;
  currentStep: number;
  set: (data: Partial<DrcState>) => void;
  setSignataire: (i: number, data: Partial<DrcSignataire>) => void;
  addSignataire: () => void;
  removeSignataire: (i: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

// ── Store ──

const useDrcStore = create<DrcState>((set) => ({
  denomination: "",
  forme_juridique: "SARL",
  siege_social: "",
  date_statuts: "",
  signataires: [{ civilite: "Monsieur", nom: "", prenom: "", adresse: "" }],
  qualite_signataires: "fondateurs, premiers membres des organes de gestion, d'administration et de direction",
  capital: 0,
  valeur_nominale: 0,
  type_titres: "parts sociales",
  liberation_fractionnee: false,
  quotite_liberee: "la moitié",
  nom_banque: "",
  adresse_banque: "",
  has_president_ca: false,
  president_ca_civilite: "Monsieur",
  president_ca_nom: "",
  president_ca_prenom: "",
  has_dg: false,
  dg_civilite: "Monsieur",
  dg_nom: "",
  dg_prenom: "",
  has_ag: false,
  ag_civilite: "Monsieur",
  ag_nom: "",
  ag_prenom: "",
  has_president_sas: false,
  president_sas_civilite: "Monsieur",
  president_sas_nom: "",
  president_sas_prenom: "",
  has_gerant: false,
  gerant_civilite: "Monsieur",
  gerant_nom: "",
  gerant_prenom: "",
  has_cac: false,
  cac_civilite: "Monsieur",
  cac_nom: "",
  cac_prenom: "",
  duree_mandat_cac: "6",
  has_cac_suppleant: false,
  cac_suppleant_civilite: "Monsieur",
  cac_suppleant_nom: "",
  cac_suppleant_prenom: "",
  has_actes_anterieurs: false,
  lieu_signature: "Brazzaville",
  date_signature: "",
  nombre_exemplaires: "",
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
      signataires: [...s.signataires, { civilite: "Monsieur", nom: "", prenom: "", adresse: "" }],
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
      forme_juridique: "SARL",
      siege_social: "",
      date_statuts: "",
      signataires: [{ civilite: "Monsieur", nom: "", prenom: "", adresse: "" }],
      qualite_signataires: "fondateurs, premiers membres des organes de gestion, d'administration et de direction",
      capital: 0,
      valeur_nominale: 0,
      type_titres: "parts sociales",
      liberation_fractionnee: false,
      quotite_liberee: "la moitié",
      nom_banque: "",
      adresse_banque: "",
      has_president_ca: false,
      president_ca_civilite: "Monsieur",
      president_ca_nom: "",
      president_ca_prenom: "",
      has_dg: false,
      dg_civilite: "Monsieur",
      dg_nom: "",
      dg_prenom: "",
      has_ag: false,
      ag_civilite: "Monsieur",
      ag_nom: "",
      ag_prenom: "",
      has_president_sas: false,
      president_sas_civilite: "Monsieur",
      president_sas_nom: "",
      president_sas_prenom: "",
      has_gerant: false,
      gerant_civilite: "Monsieur",
      gerant_nom: "",
      gerant_prenom: "",
      has_cac: false,
      cac_civilite: "Monsieur",
      cac_nom: "",
      cac_prenom: "",
      duree_mandat_cac: "6",
      has_cac_suppleant: false,
      cac_suppleant_civilite: "Monsieur",
      cac_suppleant_nom: "",
      cac_suppleant_prenom: "",
      has_actes_anterieurs: false,
      lieu_signature: "Brazzaville",
      date_signature: "",
      nombre_exemplaires: "",
      currentStep: 0,
    }),
}));

const STEPS = ["Société", "Signataires", "Capital", "Organes", "Récapitulatif", "Aperçu"];

// ── Main Screen ──

export default function DrcWizardScreen() {
  const { colors } = useTheme();
  const w = useDrcStore();
  const { addDocument } = useDocumentsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await documentsApi.generate("/generate/drc", {
        denomination: w.denomination,
        forme_juridique: w.forme_juridique,
        siege_social: w.siege_social,
        date_statuts: w.date_statuts,
        signataires: w.signataires,
        qualite_signataires: w.qualite_signataires,
        capital: w.capital,
        valeur_nominale: w.valeur_nominale,
        type_titres: w.type_titres,
        liberation_fractionnee: w.liberation_fractionnee,
        quotite_liberee: w.liberation_fractionnee ? w.quotite_liberee : undefined,
        nom_banque: w.nom_banque,
        adresse_banque: w.adresse_banque,
        has_president_ca: w.has_president_ca,
        president_ca_civilite: w.has_president_ca ? w.president_ca_civilite : undefined,
        president_ca_nom: w.has_president_ca ? w.president_ca_nom : undefined,
        president_ca_prenom: w.has_president_ca ? w.president_ca_prenom : undefined,
        has_dg: w.has_dg,
        dg_civilite: w.has_dg ? w.dg_civilite : undefined,
        dg_nom: w.has_dg ? w.dg_nom : undefined,
        dg_prenom: w.has_dg ? w.dg_prenom : undefined,
        has_ag: w.has_ag,
        ag_civilite: w.has_ag ? w.ag_civilite : undefined,
        ag_nom: w.has_ag ? w.ag_nom : undefined,
        ag_prenom: w.has_ag ? w.ag_prenom : undefined,
        has_president_sas: w.has_president_sas,
        president_sas_civilite: w.has_president_sas ? w.president_sas_civilite : undefined,
        president_sas_nom: w.has_president_sas ? w.president_sas_nom : undefined,
        president_sas_prenom: w.has_president_sas ? w.president_sas_prenom : undefined,
        has_gerant: w.has_gerant,
        gerant_civilite: w.has_gerant ? w.gerant_civilite : undefined,
        gerant_nom: w.has_gerant ? w.gerant_nom : undefined,
        gerant_prenom: w.has_gerant ? w.gerant_prenom : undefined,
        has_cac: w.has_cac,
        cac_civilite: w.has_cac ? w.cac_civilite : undefined,
        cac_nom: w.has_cac ? w.cac_nom : undefined,
        cac_prenom: w.has_cac ? w.cac_prenom : undefined,
        duree_mandat_cac: w.has_cac ? w.duree_mandat_cac : undefined,
        has_cac_suppleant: w.has_cac_suppleant,
        cac_suppleant_civilite: w.has_cac_suppleant ? w.cac_suppleant_civilite : undefined,
        cac_suppleant_nom: w.has_cac_suppleant ? w.cac_suppleant_nom : undefined,
        cac_suppleant_prenom: w.has_cac_suppleant ? w.cac_suppleant_prenom : undefined,
        has_actes_anterieurs: w.has_actes_anterieurs,
        lieu_signature: w.lieu_signature,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        nombre_exemplaires: w.nombre_exemplaires,
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
    const nombreTitres = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
    const lines = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: `${v(w.forme_juridique)} au capital de ${w.capital.toLocaleString("fr-FR")} FCFA`, center: true, size: "md" as const },
      { text: `Siège social : ${v(w.siege_social)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "DÉCLARATION DE RÉGULARITÉ ET DE CONFORMITÉ", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: `Les soussignés, agissant en qualité de ${v(w.qualite_signataires)} de la société ${v(w.denomination)}, ${v(w.forme_juridique)}, déclarent :`, spaceBefore: true },
      { text: "", spaceBefore: true },
    ];
    w.signataires.forEach((s, i) => {
      const nom = s.nom && s.prenom ? `${s.civilite} ${s.prenom} ${s.nom}` : `Signataire ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}${s.adresse ? ", demeurant à " + s.adresse : ""} ;` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "1. Constitution", bold: true, spaceBefore: true },
      { text: `La société a été constituée suivant acte sous seing privé en date du ${v(w.date_statuts)}, avec un capital de ${w.capital.toLocaleString("fr-FR")} FCFA, divisé en ${nombreTitres} ${w.type_titres} de ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA chacune.` },
      { text: "", spaceBefore: true },
      { text: "2. Libération du capital", bold: true, spaceBefore: true },
      { text: `Les ${w.type_titres} ont été ${w.liberation_fractionnee ? `libérées à concurrence de ${w.quotite_liberee}` : "intégralement libérées"} et les fonds ont été déposés auprès de ${v(w.nom_banque)}.` },
      { text: "", spaceBefore: true },
      { text: "3. Organes désignés", bold: true, spaceBefore: true },
    );
    if (w.has_president_ca) lines.push({ text: `Président du CA : ${w.president_ca_civilite} ${v(w.president_ca_prenom)} ${v(w.president_ca_nom)}` });
    if (w.has_dg) lines.push({ text: `Directeur Général : ${w.dg_civilite} ${v(w.dg_prenom)} ${v(w.dg_nom)}` });
    if (w.has_ag) lines.push({ text: `Administrateur Général : ${w.ag_civilite} ${v(w.ag_prenom)} ${v(w.ag_nom)}` });
    if (w.has_president_sas) lines.push({ text: `Président SAS : ${w.president_sas_civilite} ${v(w.president_sas_prenom)} ${v(w.president_sas_nom)}` });
    if (w.has_gerant) lines.push({ text: `Gérant : ${w.gerant_civilite} ${v(w.gerant_prenom)} ${v(w.gerant_nom)}` });
    if (w.has_cac) lines.push({ text: `CAC : ${w.cac_civilite} ${v(w.cac_prenom)} ${v(w.cac_nom)}` });
    if (w.has_cac_suppleant) lines.push({ text: `CAC suppléant : ${w.cac_suppleant_civilite} ${v(w.cac_suppleant_prenom)} ${v(w.cac_suppleant_nom)}` });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "[ ... document complet dans le fichier DOCX ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    if (w.nombre_exemplaires) lines.push({ text: `En ${w.nombre_exemplaires} exemplaires originaux.`, center: true });
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.forme_juridique, w.siege_social, w.date_statuts, w.signataires,
      w.qualite_signataires, w.capital, w.valeur_nominale, w.type_titres,
      w.liberation_fractionnee, w.quotite_liberee, w.nom_banque,
      w.has_president_ca, w.president_ca_civilite, w.president_ca_prenom, w.president_ca_nom,
      w.has_dg, w.dg_civilite, w.dg_prenom, w.dg_nom,
      w.has_ag, w.ag_civilite, w.ag_prenom, w.ag_nom,
      w.has_president_sas, w.president_sas_civilite, w.president_sas_prenom, w.president_sas_nom,
      w.has_gerant, w.gerant_civilite, w.gerant_prenom, w.gerant_nom,
      w.has_cac, w.cac_civilite, w.cac_prenom, w.cac_nom,
      w.has_cac_suppleant, w.cac_suppleant_civilite, w.cac_suppleant_prenom, w.cac_suppleant_nom,
      w.lieu_signature, w.date_signature, w.nombre_exemplaires]);

  return (
    <WizardLayout
      title="Déclaration de Régularité et de Conformité"
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
            <Field colors={colors} label="Dénomination sociale" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: OMEGA SERVICES SARL" />
            <Choice colors={colors} label="Forme juridique" options={[
              { value: "SARL", label: "SARL" },
              { value: "SA", label: "SA" },
              { value: "SAS", label: "SAS" },
              { value: "SASU", label: "SASU" },
              { value: "SARLU", label: "SARLU" },
              { value: "SA AG", label: "SA AG" },
              { value: "SA CA", label: "SA CA" },
              { value: "SCI", label: "SCI" },
              { value: "GIE", label: "GIE" },
            ]} value={w.forme_juridique} onChange={(v) => {
              const titres = ["SA", "SAS", "SASU", "SA AG", "SA CA"].includes(v) ? "actions" : "parts sociales";
              w.set({ forme_juridique: v, type_titres: titres });
            }} />
            <Field colors={colors} label="Siège social (adresse complète)" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="123 Avenue de la Paix, Brazzaville" />
            <Field colors={colors} label="Date de signature des statuts" value={w.date_statuts} onChangeText={(v) => w.set({ date_statuts: v })} placeholder="Ex: 20 mars 2026" />
          </>
        )}

        {/* ── Étape 1 : Signataires ── */}
        {w.currentStep === 1 && (
          <>
            {w.signataires.map((s, i) => (
              <View key={i} style={{ backgroundColor: colors.card, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Signataire {i + 1}</Text>
                  {w.signataires.length > 1 && (
                    <TouchableOpacity onPress={() => w.removeSignataire(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                  )}
                </View>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={s.civilite} onChange={(v) => w.setSignataire(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={s.nom} onChangeText={(v) => w.setSignataire(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={s.prenom} onChangeText={(v) => w.setSignataire(i, { prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Adresse" value={s.adresse} onChangeText={(v) => w.setSignataire(i, { adresse: v })} placeholder="Adresse complète" />
              </View>
            ))}
            {w.signataires.length < 50 && (
              <TouchableOpacity onPress={w.addSignataire}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un signataire</Text>
              </TouchableOpacity>
            )}
            <View style={{ marginTop: 16 }}>
              <Field colors={colors} label="Qualité des signataires" value={w.qualite_signataires}
                onChangeText={(v) => w.set({ qualite_signataires: v })}
                placeholder="fondateurs, premiers membres des organes de gestion..." multiline />
            </View>
          </>
        )}

        {/* ── Étape 2 : Capital ── */}
        {w.currentStep === 2 && (
          <>
            <Field colors={colors} label="Capital social (FCFA)" value={w.capital ? String(w.capital) : ""} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale d'un titre (FCFA)" value={w.valeur_nominale ? String(w.valeur_nominale) : ""} onChangeText={(v) => w.set({ valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
            <Choice colors={colors} label="Type de titres" options={[
              { value: "actions", label: "Actions" },
              { value: "parts sociales", label: "Parts sociales" },
            ]} value={w.type_titres} onChange={(v) => w.set({ type_titres: v })} />

            <View style={{ marginTop: 8 }}>
              <ToggleRow colors={colors} label="Libération fractionnée du capital" value={w.liberation_fractionnee} onToggle={(v) => w.set({ liberation_fractionnee: v })} />
            </View>
            {w.liberation_fractionnee && (
              <View style={{ marginTop: 12 }}>
                <Field colors={colors} label="Quotité libérée" value={w.quotite_liberee} onChangeText={(v) => w.set({ quotite_liberee: v })} placeholder="Ex: la moitié, le quart" />
              </View>
            )}

            <SectionTitle title="Dépôt des fonds" colors={colors} />
            <Field colors={colors} label="Nom de la banque" value={w.nom_banque} onChangeText={(v) => w.set({ nom_banque: v })} placeholder="Ex: Banque Commerciale du Congo" />
            <Field colors={colors} label="Adresse de la banque" value={w.adresse_banque} onChangeText={(v) => w.set({ adresse_banque: v })} placeholder="Ex: Agence de Brazzaville" />

            {w.capital > 0 && w.valeur_nominale > 0 && (
              <View style={{ backgroundColor: colors.card, padding: 16, marginTop: 12, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Nombre de {w.type_titres}</Text>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{Math.floor(w.capital / w.valeur_nominale).toLocaleString("fr-FR")}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Capital social</Text>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{w.capital.toLocaleString("fr-FR")} FCFA</Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* ── Étape 3 : Organes ── */}
        {w.currentStep === 3 && (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
              Activez les organes de direction et de contrôle désignés dans les statuts de la société.
            </Text>

            {/* Président du CA */}
            <ToggleRow colors={colors} label="Président du Conseil d'Administration" value={w.has_president_ca} onToggle={(v) => w.set({ has_president_ca: v })} />
            {w.has_president_ca && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_ca_civilite} onChange={(v) => w.set({ president_ca_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_ca_nom} onChangeText={(v) => w.set({ president_ca_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president_ca_prenom} onChangeText={(v) => w.set({ president_ca_prenom: v })} /></View>
                </View>
              </View>
            )}

            {/* Directeur Général */}
            <ToggleRow colors={colors} label="Directeur Général" value={w.has_dg} onToggle={(v) => w.set({ has_dg: v })} />
            {w.has_dg && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.dg_civilite} onChange={(v) => w.set({ dg_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.dg_nom} onChangeText={(v) => w.set({ dg_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.dg_prenom} onChangeText={(v) => w.set({ dg_prenom: v })} /></View>
                </View>
              </View>
            )}

            {/* Administrateur Général */}
            <ToggleRow colors={colors} label="Administrateur Général" value={w.has_ag} onToggle={(v) => w.set({ has_ag: v })} />
            {w.has_ag && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.ag_civilite} onChange={(v) => w.set({ ag_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.ag_nom} onChangeText={(v) => w.set({ ag_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.ag_prenom} onChangeText={(v) => w.set({ ag_prenom: v })} /></View>
                </View>
              </View>
            )}

            {/* Président SAS */}
            <ToggleRow colors={colors} label="Président (SAS)" value={w.has_president_sas} onToggle={(v) => w.set({ has_president_sas: v })} />
            {w.has_president_sas && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.president_sas_civilite} onChange={(v) => w.set({ president_sas_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.president_sas_nom} onChangeText={(v) => w.set({ president_sas_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.president_sas_prenom} onChangeText={(v) => w.set({ president_sas_prenom: v })} /></View>
                </View>
              </View>
            )}

            {/* Gérant */}
            <ToggleRow colors={colors} label="Gérant" value={w.has_gerant} onToggle={(v) => w.set({ has_gerant: v })} />
            {w.has_gerant && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.gerant_civilite} onChange={(v) => w.set({ gerant_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.gerant_nom} onChangeText={(v) => w.set({ gerant_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.gerant_prenom} onChangeText={(v) => w.set({ gerant_prenom: v })} /></View>
                </View>
              </View>
            )}

            {/* CAC */}
            <ToggleRow colors={colors} label="Commissaire aux comptes" value={w.has_cac} onToggle={(v) => w.set({ has_cac: v })} />
            {w.has_cac && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.cac_civilite} onChange={(v) => w.set({ cac_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_nom} onChangeText={(v) => w.set({ cac_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cac_prenom} onChangeText={(v) => w.set({ cac_prenom: v })} /></View>
                </View>
                <Field colors={colors} label="Durée du mandat (années)" value={w.duree_mandat_cac} onChangeText={(v) => w.set({ duree_mandat_cac: v })} keyboardType="numeric" />
              </View>
            )}

            {/* CAC Suppléant */}
            <ToggleRow colors={colors} label="Commissaire aux comptes suppléant" value={w.has_cac_suppleant} onToggle={(v) => w.set({ has_cac_suppleant: v })} />
            {w.has_cac_suppleant && (
              <View style={{ paddingLeft: 12, marginTop: 8, marginBottom: 8 }}>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]} value={w.cac_suppleant_civilite} onChange={(v) => w.set({ cac_suppleant_civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.cac_suppleant_nom} onChangeText={(v) => w.set({ cac_suppleant_nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.cac_suppleant_prenom} onChangeText={(v) => w.set({ cac_suppleant_prenom: v })} /></View>
                </View>
              </View>
            )}

            {/* Actes antérieurs */}
            <View style={{ marginTop: 16 }}>
              <ToggleRow colors={colors} label="Actes accomplis avant immatriculation" value={w.has_actes_anterieurs} onToggle={(v) => w.set({ has_actes_anterieurs: v })} />
              {w.has_actes_anterieurs && (
                <View style={{ backgroundColor: colors.card, padding: 12, marginTop: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>
                    Un état des actes accomplis pour le compte de la société en formation sera annexé à la déclaration, avec indication pour chaque acte des engagements qui en résulteront pour la société (art. 73 AUSCGIE).
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ── Étape 4 : Récapitulatif ── */}
        {w.currentStep === 4 && (() => {
          const nombreTitres = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          const Row = ({ label, value }: { label: string; value: string }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 }}>{label}</Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text, flex: 1, textAlign: "right" }}>{value}</Text>
            </View>
          );
          const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
            <View style={{ backgroundColor: colors.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary, marginBottom: 10 }}>{title}</Text>
              {children}
            </View>
          );

          const organes: string[] = [];
          if (w.has_president_ca) organes.push(`PCA : ${w.president_ca_civilite} ${w.president_ca_prenom} ${w.president_ca_nom}`);
          if (w.has_dg) organes.push(`DG : ${w.dg_civilite} ${w.dg_prenom} ${w.dg_nom}`);
          if (w.has_ag) organes.push(`AG : ${w.ag_civilite} ${w.ag_prenom} ${w.ag_nom}`);
          if (w.has_president_sas) organes.push(`Président SAS : ${w.president_sas_civilite} ${w.president_sas_prenom} ${w.president_sas_nom}`);
          if (w.has_gerant) organes.push(`Gérant : ${w.gerant_civilite} ${w.gerant_prenom} ${w.gerant_nom}`);
          if (w.has_cac) organes.push(`CAC : ${w.cac_civilite} ${w.cac_prenom} ${w.cac_nom} (${w.duree_mandat_cac} ans)`);
          if (w.has_cac_suppleant) organes.push(`CAC suppléant : ${w.cac_suppleant_civilite} ${w.cac_suppleant_prenom} ${w.cac_suppleant_nom}`);

          return (
            <>
              <Section title="Société">
                <Row label="Dénomination" value={w.denomination} />
                <Row label="Forme juridique" value={w.forme_juridique} />
                <Row label="Siège social" value={w.siege_social} />
                <Row label="Date des statuts" value={w.date_statuts} />
              </Section>
              <Section title={`Signataires (${w.signataires.length})`}>
                {w.signataires.map((s, i) => (
                  <Row key={i} label={`${s.civilite} ${s.prenom} ${s.nom}`} value={s.adresse || "—"} />
                ))}
                <Row label="Qualité" value={w.qualite_signataires.substring(0, 50) + (w.qualite_signataires.length > 50 ? "..." : "")} />
              </Section>
              <Section title="Capital">
                <Row label="Capital social" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
                <Row label={`Nombre de ${w.type_titres}`} value={`${nombreTitres.toLocaleString("fr-FR")} × ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA`} />
                <Row label="Libération" value={w.liberation_fractionnee ? `Fractionnée (${w.quotite_liberee})` : "Intégrale"} />
                <Row label="Banque" value={w.nom_banque || "—"} />
              </Section>
              <Section title="Organes désignés">
                {organes.length > 0 ? organes.map((o, i) => (
                  <Text key={i} style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.text, paddingVertical: 2 }}>{o}</Text>
                )) : (
                  <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted }}>Aucun organe renseigné</Text>
                )}
                {w.has_actes_anterieurs && <Row label="Actes antérieurs" value="Oui (état annexé)" />}
              </Section>

              <SectionTitle title="Signature" colors={colors} />
              <Field colors={colors} label="Lieu de signature" value={w.lieu_signature} onChangeText={(v) => w.set({ lieu_signature: v })} />
              <Field colors={colors} label="Date de signature" value={w.date_signature} onChangeText={(v) => w.set({ date_signature: v })} placeholder={new Date().toLocaleDateString("fr-FR")} />
              <Field colors={colors} label="Nombre d'exemplaires" value={w.nombre_exemplaires} onChangeText={(v) => w.set({ nombre_exemplaires: v })} placeholder="Ex: 6" />
            </>
          );
        })()}

        {/* ── Étape 5 : Aperçu + Téléchargement ── */}
        {w.currentStep === 5 && (() => {
          const nombreTitres = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
          return (
            <>
              <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
                  DÉCLARATION DE RÉGULARITÉ ET DE CONFORMITÉ
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
                  {w.denomination}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 20 }}>
                  {w.forme_juridique} au capital de {w.capital.toLocaleString("fr-FR")} FCFA
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Les soussignés, agissant en qualité de {w.qualite_signataires} de la société {w.denomination}, {w.forme_juridique}, dont le siège social est fixé à {w.siege_social}, déclarent :
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>1. Constitution</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Que la société a été constituée suivant acte sous seing privé en date du {w.date_statuts}, avec un capital de {w.capital.toLocaleString("fr-FR")} FCFA, divisé en {nombreTitres.toLocaleString("fr-FR")} {w.type_titres} de {w.valeur_nominale.toLocaleString("fr-FR")} FCFA chacune.
                </Text>

                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: "#1f2937", marginTop: 12, marginBottom: 6 }}>2. Libération du capital</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", marginBottom: 8 }}>
                  Que les {w.type_titres} ont été {w.liberation_fractionnee ? `libérées à concurrence de ${w.quotite_liberee}` : "intégralement libérées"} et que les fonds ont été déposés auprès de {w.nom_banque || "la banque"}{w.adresse_banque ? `, ${w.adresse_banque}` : ""}.
                </Text>

                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>··· Document complet dans le fichier DOCX ···</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 16 }}>
                  Fait à {w.lieu_signature || "Brazzaville"}, le {w.date_signature || new Date().toLocaleDateString("fr-FR")}
                </Text>
                {w.nombre_exemplaires ? (
                  <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#374151", textAlign: "center", marginTop: 4 }}>
                    En {w.nombre_exemplaires} exemplaires originaux.
                  </Text>
                ) : null}
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
