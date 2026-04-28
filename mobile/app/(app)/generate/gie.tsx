import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { Field, Choice, ToggleRow, SectionTitle } from "@/components/wizard/FormComponents";
import { WizardLayout, type PreviewLine } from "@/components/wizard/WizardLayout";
import { useDocumentGeneration } from "@/lib/wizard/useDocumentGeneration";
import { openDocx } from "@/lib/wizard/openDocx";
import { create } from "zustand";

// ── Types ──
interface GieMembre {
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  profession: string;
  adresse: string;
  is_personne_morale: boolean;
  raison_sociale: string;
  forme_juridique: string;
  siege_social: string;
  rccm: string;
  apport: number;
  type_apport: string;
}

interface GieAdmin {
  civilite: string;
  nom: string;
  prenom: string;
  adresse: string;
}

interface GieState {
  denomination: string;
  sigle: string;
  objet_social: string;
  siege_social: string;
  ville: string;
  pays: string;
  duree: number;
  has_capital: boolean;
  capital: number;
  valeur_nominale: number;
  mode_financement: string;
  membres: GieMembre[];
  mode_administration: string;
  administrateur: GieAdmin;
  nombre_administrateurs: number;
  duree_mandat_admin: string;
  remuneration_admin: string;
  quorum_ago: string;
  majorite_ago: string;
  quorum_age: string;
  majorite_age: string;
  majorite_admission: string;
  delai_preavis_retrait: string;
  duree_mandat_controleur: string;
  mission_controleur: string;
  remuneration_controleur: string;
  gie_emet_obligations: boolean;
  mode_contestation: string;
  date_signature: string;
  lieu_signature: string;
  currentStep: number;
  set: (data: Partial<GieState>) => void;
  setMembre: (i: number, data: Partial<GieMembre>) => void;
  addMembre: () => void;
  removeMembre: (i: number) => void;
  setAdmin: (data: Partial<GieAdmin>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultMembre: GieMembre = {
  civilite: "Monsieur", nom: "", prenom: "", date_naissance: "", lieu_naissance: "",
  nationalite: "Congolaise", profession: "", adresse: "",
  is_personne_morale: false, raison_sociale: "", forme_juridique: "", siege_social: "", rccm: "",
  apport: 0, type_apport: "numeraire",
};

const defaultAdmin: GieAdmin = { civilite: "Monsieur", nom: "", prenom: "", adresse: "" };

const useGieStore = create<GieState>((set) => ({
  denomination: "", sigle: "", objet_social: "", siege_social: "",
  ville: "Brazzaville", pays: "République du Congo", duree: 99,
  has_capital: false, capital: 0, valeur_nominale: 0, mode_financement: "",
  membres: [{ ...defaultMembre }, { ...defaultMembre }],
  mode_administration: "admin_unique", administrateur: { ...defaultAdmin }, nombre_administrateurs: 3,
  duree_mandat_admin: "4 ans", remuneration_admin: "à titre gratuit",
  quorum_ago: "la moitié des", majorite_ago: "la majorité simple",
  quorum_age: "les deux tiers des", majorite_age: "les deux tiers des voix",
  majorite_admission: "l'unanimité", delai_preavis_retrait: "trois (3) mois",
  duree_mandat_controleur: "3", mission_controleur: "", remuneration_controleur: "à titre gratuit",
  gie_emet_obligations: false, mode_contestation: "droit_commun",
  date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  set: (data) => set(data),
  setMembre: (i, data) => set((s) => ({ membres: s.membres.map((m, j) => j === i ? { ...m, ...data } : m) })),
  addMembre: () => set((s) => ({ membres: [...s.membres, { ...defaultMembre }] })),
  removeMembre: (i) => set((s) => ({ membres: s.membres.filter((_, j) => j !== i) })),
  setAdmin: (data) => set((s) => ({ administrateur: { ...s.administrateur, ...data } })),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  reset: () => set({
    denomination: "", sigle: "", objet_social: "", siege_social: "",
    ville: "Brazzaville", pays: "République du Congo", duree: 99,
    has_capital: false, capital: 0, valeur_nominale: 0, mode_financement: "",
    membres: [{ ...defaultMembre }, { ...defaultMembre }],
    mode_administration: "admin_unique", administrateur: { ...defaultAdmin }, nombre_administrateurs: 3,
    duree_mandat_admin: "4 ans", remuneration_admin: "à titre gratuit",
    quorum_ago: "la moitié des", majorite_ago: "la majorité simple",
    quorum_age: "les deux tiers des", majorite_age: "les deux tiers des voix",
    majorite_admission: "l'unanimité", delai_preavis_retrait: "trois (3) mois",
    duree_mandat_controleur: "3", mission_controleur: "", remuneration_controleur: "à titre gratuit",
    gie_emet_obligations: false, mode_contestation: "droit_commun",
    date_signature: "", lieu_signature: "Brazzaville", currentStep: 0,
  }),
}));

const STEPS = ["Groupement", "Membres", "Capital", "Administration", "Assemblées", "Contrôle", "Récapitulatif", "Aperçu"];

// ── Main Screen ──
export default function GieWizardScreen() {
  const { colors } = useTheme();
  const w = useGieStore();
  const { isGenerating, generatedUrl, error, generate } = useDocumentGeneration("/generate/gie", w.nextStep);
  const handleGenerate = () => generate({
        denomination: w.denomination,
        sigle: w.sigle,
        objet_social: w.objet_social,
        siege_social: w.siege_social,
        ville: w.ville,
        pays: w.pays,
        duree: w.duree,
        has_capital: w.has_capital,
        capital: w.capital,
        valeur_nominale: w.valeur_nominale,
        mode_financement: w.mode_financement,
        membres: w.membres,
        mode_administration: w.mode_administration,
        administrateur: w.administrateur,
        nombre_administrateurs: w.nombre_administrateurs,
        duree_mandat_admin: w.duree_mandat_admin,
        remuneration_admin: w.remuneration_admin,
        quorum_ago: w.quorum_ago,
        majorite_ago: w.majorite_ago,
        quorum_age: w.quorum_age,
        majorite_age: w.majorite_age,
        majorite_admission: w.majorite_admission,
        delai_preavis_retrait: w.delai_preavis_retrait,
        duree_mandat_controleur: w.duree_mandat_controleur,
        mission_controleur: w.mission_controleur,
        remuneration_controleur: w.remuneration_controleur,
        gie_emet_obligations: w.gie_emet_obligations,
        mode_contestation: w.mode_contestation,
        date_signature: w.date_signature || new Date().toLocaleDateString("fr-FR"),
        lieu_signature: w.lieu_signature,
      });
  const handleDownload = () => openDocx(generatedUrl);

  const isLastDataStep = w.currentStep === 6;
  const isDownloadStep = w.currentStep === 7;

  // ── Aperçu document temps réel ──
  const previewLines = useMemo(() => {
    const v = (s: string) => s || "...";
    const lines: PreviewLine[] = [
      { text: v(w.denomination), bold: true, center: true, size: "xl" as const, spaceBefore: true },
      { text: "Groupement d'Intérêt Économique", center: true, size: "md" as const },
      { text: `Au capital de ${w.has_capital ? w.capital.toLocaleString("fr-FR") + " FCFA" : "sans capital"}`, center: true, size: "sm" as const },
      { text: `Siège social : ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}`, center: true, size: "sm" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "CONVENTION CONSTITUTIVE", bold: true, center: true, size: "lg" as const },
      { text: "━━━━━━━━━━━━━━━━━━━━━━", center: true },
      { text: "", spaceBefore: true },
      { text: "Entre les soussignés :", spaceBefore: true },
    ];
    w.membres.forEach((m, i) => {
      const nom = m.nom && m.prenom ? `${m.civilite} ${m.prenom} ${m.nom}` : `Membre ${i + 1} (à compléter)`;
      lines.push({ text: `- ${nom}${m.adresse ? ", demeurant à " + m.adresse : ""} ;` });
    });
    lines.push(
      { text: "", spaceBefore: true },
      { text: "Article premier : Forme du groupement", bold: true, spaceBefore: true },
      { text: "Les soussignés décident de créer un groupement d'intérêt économique (GIE) régi par les dispositions de l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du GIE." },
      { text: "", spaceBefore: true },
      { text: "Article 2 : Dénomination", bold: true, spaceBefore: true },
      { text: `Le GIE a pour dénomination « ${v(w.denomination)} ».` },
      { text: w.sigle ? `Son sigle est : « ${w.sigle} ».` : "", italic: true },
      { text: "", spaceBefore: true },
      { text: "Article 3 : Objet", bold: true, spaceBefore: true },
      { text: v(w.objet_social) },
      { text: "", spaceBefore: true },
      { text: "Article 4 : Siège du GIE", bold: true, spaceBefore: true },
      { text: `Le siège du groupement est fixé à ${v(w.siege_social)}, ${v(w.ville)}, ${v(w.pays)}.` },
      { text: "", spaceBefore: true },
      { text: "Article 5 : Exercice", bold: true, spaceBefore: true },
      { text: `L'exercice commence le 1er janvier et finit le 31 décembre.` },
      { text: "", spaceBefore: true },
      { text: "Article 6 : Durée", bold: true, spaceBefore: true },
      { text: `Le GIE est constitué pour une durée de ${w.duree} années.` },
      { text: "", spaceBefore: true },
      { text: "Article 7 : Capital", bold: true, spaceBefore: true },
      { text: w.has_capital
        ? `Le GIE a un capital de ${w.capital.toLocaleString("fr-FR")} FCFA divisé en ${w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : "..."} parts de ${w.valeur_nominale.toLocaleString("fr-FR")} FCFA chacune.`
        : "Le GIE est constitué sans capital conformément à l'article 869 de l'Acte Uniforme." },
      { text: "", spaceBefore: true },
      { text: "Article 13 : Administration du GIE", bold: true, spaceBefore: true },
      { text: w.mode_administration === "admin_unique"
        ? `Le GIE est administré par un administrateur unique, ${v(w.administrateur?.prenom)} ${v(w.administrateur?.nom)}.`
        : `Le GIE est administré par un conseil d'administration de ${w.nombre_administrateurs} membres.` },
      { text: "", spaceBefore: true },
      { text: "[ ... articles 8 à 22 ... ]", italic: true, center: true },
      { text: "", spaceBefore: true },
      { text: `Fait à ${v(w.lieu_signature)}, le ${w.date_signature || new Date().toLocaleDateString("fr-FR")}`, center: true, spaceBefore: true },
    );
    return lines.filter(l => l.text !== undefined);
  }, [w.denomination, w.sigle, w.objet_social, w.siege_social, w.ville, w.pays, w.duree,
      w.has_capital, w.capital, w.valeur_nominale, w.membres, w.mode_administration,
      w.administrateur, w.nombre_administrateurs, w.lieu_signature, w.date_signature]);

  return (
    <WizardLayout
      title="Convention GIE"
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

        {/* Étape 0 : Groupement */}
        {w.currentStep === 0 && (<>
          <Field colors={colors} label="Dénomination du groupement" value={w.denomination} onChangeText={(v) => w.set({ denomination: v })} placeholder="Ex: GIE ALPHA SERVICES" />
          <Field colors={colors} label="Sigle (optionnel)" value={w.sigle} onChangeText={(v) => w.set({ sigle: v })} />
          <Field colors={colors} label="Objet social" value={w.objet_social} onChangeText={(v) => w.set({ objet_social: v })} placeholder="Décrivez l'activité économique du groupement..." multiline />
          <Field colors={colors} label="Siège social" value={w.siege_social} onChangeText={(v) => w.set({ siege_social: v })} placeholder="Adresse complète" />
          <Field colors={colors} label="Ville" value={w.ville} onChangeText={(v) => w.set({ ville: v })} />
          <Field colors={colors} label="Pays" value={w.pays} onChangeText={(v) => w.set({ pays: v })} />
          <Field colors={colors} label="Durée (années, max 99)" value={String(w.duree)} onChangeText={(v) => w.set({ duree: parseInt(v) || 99 })} keyboardType="numeric" />
        </>)}

        {/* Étape 1 : Membres */}
        {w.currentStep === 1 && (<>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
            Le GIE doit compter au minimum 2 membres (art. 870 OHADA).
          </Text>
          {w.membres.map((m, i) => (
            <View key={i} style={{ backgroundColor: "#ffffff", padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.primary }}>Membre {i + 1}</Text>
                {w.membres.length > 2 && <TouchableOpacity onPress={() => w.removeMembre(i)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>}
              </View>
              <ToggleRow colors={colors} label="Personne morale" value={m.is_personne_morale} onToggle={(v) => w.setMembre(i, { is_personne_morale: v })} />
              <View style={{ marginTop: 12 }} />
              {m.is_personne_morale ? (<>
                <Field colors={colors} label="Raison sociale" value={m.raison_sociale} onChangeText={(v) => w.setMembre(i, { raison_sociale: v })} />
                <Field colors={colors} label="Forme juridique" value={m.forme_juridique} onChangeText={(v) => w.setMembre(i, { forme_juridique: v })} placeholder="Ex: SARL, SA..." />
                <Field colors={colors} label="Siège social" value={m.siege_social} onChangeText={(v) => w.setMembre(i, { siege_social: v })} />
                <Field colors={colors} label="RCCM" value={m.rccm} onChangeText={(v) => w.setMembre(i, { rccm: v })} />
                <Field colors={colors} label="Représentant — Nom" value={m.nom} onChangeText={(v) => w.setMembre(i, { nom: v })} />
                <Field colors={colors} label="Représentant — Prénom" value={m.prenom} onChangeText={(v) => w.setMembre(i, { prenom: v })} />
              </>) : (<>
                <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={m.civilite} onChange={(v) => w.setMembre(i, { civilite: v })} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={m.nom} onChangeText={(v) => w.setMembre(i, { nom: v })} /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={m.prenom} onChangeText={(v) => w.setMembre(i, { prenom: v })} /></View>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Date de naissance" value={m.date_naissance} onChangeText={(v) => w.setMembre(i, { date_naissance: v })} placeholder="01/01/1980" /></View>
                  <View style={{ flex: 1 }}><Field colors={colors} label="Lieu de naissance" value={m.lieu_naissance} onChangeText={(v) => w.setMembre(i, { lieu_naissance: v })} /></View>
                </View>
                <Field colors={colors} label="Nationalité" value={m.nationalite} onChangeText={(v) => w.setMembre(i, { nationalite: v })} />
                <Field colors={colors} label="Profession" value={m.profession} onChangeText={(v) => w.setMembre(i, { profession: v })} />
                <Field colors={colors} label="Adresse" value={m.adresse} onChangeText={(v) => w.setMembre(i, { adresse: v })} />
              </>)}
              <View style={{ marginTop: 8 }} />
              <Choice colors={colors} label="Type d'apport" options={[
                { value: "numeraire", label: "Numéraire" },
                { value: "nature", label: "Nature" },
              ]} value={m.type_apport} onChange={(v) => w.setMembre(i, { type_apport: v })} />
              <Field colors={colors} label="Apport (FCFA)" value={m.apport ? String(m.apport) : ""} onChangeText={(v) => w.setMembre(i, { apport: parseInt(v) || 0 })} keyboardType="numeric" />
            </View>
          ))}
          <TouchableOpacity onPress={w.addMembre} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderWidth: 1, borderColor: colors.primary, borderStyle: "dashed" }}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Ajouter un membre</Text>
          </TouchableOpacity>
        </>)}

        {/* Étape 2 : Capital */}
        {w.currentStep === 2 && (<>
          <ToggleRow colors={colors} label="Le GIE est constitué avec un capital" value={w.has_capital} onToggle={(v) => w.set({ has_capital: v })} />
          <View style={{ marginTop: 12 }} />
          {w.has_capital ? (<>
            <Field colors={colors} label="Capital du groupement (FCFA)" value={w.capital ? String(w.capital) : ""} onChangeText={(v) => w.set({ capital: parseInt(v) || 0 })} keyboardType="numeric" />
            <Field colors={colors} label="Valeur nominale d'une part (FCFA)" value={w.valeur_nominale ? String(w.valeur_nominale) : ""} onChangeText={(v) => w.set({ valeur_nominale: parseInt(v) || 0 })} keyboardType="numeric" />
            {(() => {
              const totalApports = w.membres.reduce((s, m) => s + m.apport, 0);
              const nbParts = w.valeur_nominale > 0 ? Math.floor(w.capital / w.valeur_nominale) : 0;
              return (
                <View style={{ backgroundColor: "#ffffff", padding: 16, borderWidth: 1, borderColor: "#e2e8f0", marginTop: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Nombre de parts</Text>
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>{nbParts.toLocaleString("fr-FR")}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ fontFamily: fonts.regular, color: colors.textSecondary }}>Total apports</Text>
                    <Text style={{ fontFamily: fonts.semiBold, color: totalApports === w.capital ? colors.success : colors.danger }}>{totalApports.toLocaleString("fr-FR")} FCFA</Text>
                  </View>
                  {w.membres.map((m, i) => (
                    <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
                      <Text style={{ fontFamily: fonts.regular, color: colors.text }}>{m.is_personne_morale ? m.raison_sociale : `${m.prenom} ${m.nom}`}</Text>
                      <Text style={{ fontFamily: fonts.medium, color: colors.textSecondary }}>
                        {w.valeur_nominale > 0 ? Math.floor(m.apport / w.valeur_nominale) : 0} parts
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })()}
          </>) : (<>
            <View style={{ backgroundColor: "#fffbeb", padding: 16, borderLeftWidth: 3, borderLeftColor: colors.primary, marginBottom: 14 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
                GIE sans capital
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#a16207", lineHeight: 20 }}>
                Le GIE est constitué sans capital (art. 869 OHADA). Le financement est assuré par cotisations.
              </Text>
            </View>
            <Field colors={colors} label="Mode de financement" value={w.mode_financement} onChangeText={(v) => w.set({ mode_financement: v })} placeholder="Ex: cotisations annuelles des membres" />
          </>)}
        </>)}

        {/* Étape 3 : Administration */}
        {w.currentStep === 3 && (<>
          <Choice colors={colors} label="Mode d'administration" options={[
            { value: "admin_unique", label: "Administrateur unique" },
            { value: "ca", label: "Conseil d'administration" },
          ]} value={w.mode_administration} onChange={(v) => w.set({ mode_administration: v })} />

          {w.mode_administration === "admin_unique" && (<>
            <SectionTitle title="Administrateur" colors={colors} />
            {w.membres.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Remplir depuis un membre :</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {w.membres.map((m, i) => (
                    <TouchableOpacity key={i} onPress={() => w.setAdmin({ civilite: m.civilite, nom: m.nom, prenom: m.prenom, adresse: m.adresse })}
                      style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#e2e8f0" }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary }}>{m.is_personne_morale ? m.raison_sociale : `${m.prenom} ${m.nom}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <Choice colors={colors} label="Civilité" options={[{ value: "Monsieur", label: "M." }, { value: "Madame", label: "Mme" }]} value={w.administrateur.civilite} onChange={(v) => w.setAdmin({ civilite: v })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}><Field colors={colors} label="Nom" value={w.administrateur.nom} onChangeText={(v) => w.setAdmin({ nom: v })} /></View>
              <View style={{ flex: 1 }}><Field colors={colors} label="Prénom" value={w.administrateur.prenom} onChangeText={(v) => w.setAdmin({ prenom: v })} /></View>
            </View>
            <Field colors={colors} label="Adresse" value={w.administrateur.adresse} onChangeText={(v) => w.setAdmin({ adresse: v })} />
          </>)}

          {w.mode_administration === "ca" && (<>
            <SectionTitle title="Conseil d'administration" colors={colors} />
            <Field colors={colors} label="Nombre d'administrateurs (min. 3)" value={String(w.nombre_administrateurs)} onChangeText={(v) => {
              const n = parseInt(v) || 3;
              w.set({ nombre_administrateurs: Math.max(n, 3) });
            }} keyboardType="numeric" />
          </>)}

          <View style={{ marginTop: 12 }} />
          <Field colors={colors} label="Durée du mandat" value={w.duree_mandat_admin} onChangeText={(v) => w.set({ duree_mandat_admin: v })} />
          <Field colors={colors} label="Rémunération de l'administrateur" value={w.remuneration_admin} onChangeText={(v) => w.set({ remuneration_admin: v })} />
        </>)}

        {/* Étape 4 : Assemblées */}
        {w.currentStep === 4 && (<>
          <SectionTitle title="Assemblée Générale Ordinaire" colors={colors} />
          <Field colors={colors} label="Quorum AGO" value={w.quorum_ago} onChangeText={(v) => w.set({ quorum_ago: v })} placeholder="la moitié des" />
          <Field colors={colors} label="Majorité AGO" value={w.majorite_ago} onChangeText={(v) => w.set({ majorite_ago: v })} placeholder="la majorité simple" />

          <SectionTitle title="Assemblée Générale Extraordinaire" colors={colors} />
          <Field colors={colors} label="Quorum AGE" value={w.quorum_age} onChangeText={(v) => w.set({ quorum_age: v })} placeholder="les deux tiers des" />
          <Field colors={colors} label="Majorité AGE" value={w.majorite_age} onChangeText={(v) => w.set({ majorite_age: v })} placeholder="les deux tiers des voix" />

          <SectionTitle title="Admission et retrait" colors={colors} />
          <Field colors={colors} label="Majorité pour admission d'un nouveau membre" value={w.majorite_admission} onChangeText={(v) => w.set({ majorite_admission: v })} placeholder="l'unanimité" />
          <Field colors={colors} label="Délai de préavis pour retrait" value={w.delai_preavis_retrait} onChangeText={(v) => w.set({ delai_preavis_retrait: v })} placeholder="trois (3) mois" />

          <View style={{ backgroundColor: "#fffbeb", padding: 16, marginTop: 16, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
              Responsabilité solidaire
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#a16207", lineHeight: 20 }}>
              Les membres du GIE sont indéfiniment et solidairement responsables des dettes du groupement (art. 873 OHADA).
            </Text>
          </View>
        </>)}

        {/* Étape 5 : Contrôle */}
        {w.currentStep === 5 && (<>
          <SectionTitle title="Contrôleur de gestion" colors={colors} />
          <Field colors={colors} label="Durée du mandat du contrôleur (années)" value={w.duree_mandat_controleur} onChangeText={(v) => w.set({ duree_mandat_controleur: v })} keyboardType="numeric" />
          <Field colors={colors} label="Mission du contrôleur" value={w.mission_controleur} onChangeText={(v) => w.set({ mission_controleur: v })} placeholder="Vérification des comptes, contrôle de gestion..." multiline />
          <Field colors={colors} label="Rémunération du contrôleur" value={w.remuneration_controleur} onChangeText={(v) => w.set({ remuneration_controleur: v })} />

          <SectionTitle title="Obligations" colors={colors} />
          <ToggleRow colors={colors} label="Le GIE peut émettre des obligations" value={w.gie_emet_obligations} onToggle={(v) => w.set({ gie_emet_obligations: v })} />

          <SectionTitle title="Contestation" colors={colors} />
          <Choice colors={colors} label="Mode de règlement des litiges" options={[
            { value: "droit_commun", label: "Droit commun" },
            { value: "arbitrage", label: "Arbitrage OHADA" },
          ]} value={w.mode_contestation} onChange={(v) => w.set({ mode_contestation: v })} />
        </>)}

        {/* Étape 6 : Récapitulatif */}
        {w.currentStep === 6 && (() => {
          const totalApports = w.membres.reduce((s, m) => s + m.apport, 0);
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
            <Section title="Groupement">
              <Row label="Dénomination" value={w.denomination} />
              {w.sigle ? <Row label="Sigle" value={w.sigle} /> : null}
              <Row label="Forme" value="GIE" />
              <Row label="Siège" value={`${w.siege_social}, ${w.ville}`} />
              <Row label="Durée" value={`${w.duree} ans`} />
            </Section>
            <Section title="Capital">
              {w.has_capital ? (<>
                <Row label="Capital" value={`${w.capital.toLocaleString("fr-FR")} FCFA`} />
                <Row label="Valeur nominale" value={`${w.valeur_nominale.toLocaleString("fr-FR")} FCFA`} />
              </>) : (
                <Row label="Capital" value="Sans capital (cotisations)" />
              )}
              <Row label="Total apports" value={`${totalApports.toLocaleString("fr-FR")} FCFA`} />
            </Section>
            <Section title={`Membres (${w.membres.length})`}>
              {w.membres.map((m, i) => <Row key={i} label={m.is_personne_morale ? m.raison_sociale : `${m.prenom} ${m.nom}`} value={`${m.apport.toLocaleString("fr-FR")} FCFA`} />)}
            </Section>
            <Section title="Administration">
              <Row label="Mode" value={w.mode_administration === "admin_unique" ? "Administrateur unique" : "Conseil d'administration"} />
              {w.mode_administration === "admin_unique" && <Row label="Administrateur" value={`${w.administrateur.prenom} ${w.administrateur.nom}`} />}
              {w.mode_administration === "ca" && <Row label="Nb administrateurs" value={String(w.nombre_administrateurs)} />}
              <Row label="Mandat" value={w.duree_mandat_admin} />
              <Row label="Rémunération" value={w.remuneration_admin} />
            </Section>
            <Section title="Assemblées">
              <Row label="Quorum AGO" value={w.quorum_ago} />
              <Row label="Majorité AGO" value={w.majorite_ago} />
              <Row label="Quorum AGE" value={w.quorum_age} />
              <Row label="Majorité AGE" value={w.majorite_age} />
              <Row label="Admission" value={w.majorite_admission} />
              <Row label="Préavis retrait" value={w.delai_preavis_retrait} />
            </Section>
            <Section title="Contrôle">
              <Row label="Mandat contrôleur" value={`${w.duree_mandat_controleur} ans`} />
              <Row label="Rémunération" value={w.remuneration_controleur} />
              <Row label="Émission obligations" value={w.gie_emet_obligations ? "Oui" : "Non"} />
              <Row label="Contestation" value={w.mode_contestation === "arbitrage" ? "Arbitrage OHADA" : "Droit commun"} />
            </Section>
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
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 8 }}>Convention GIE — {w.denomination}</Text>
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
