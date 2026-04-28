import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useDocumentsStore } from "@/lib/store/documents";
import { documentsApi } from "@/lib/api/documents";

type FormeJuridique = "sarl" | "sarlu" | "sas" | "sasu" | "sa-ag" | "sa-ca";

interface FormeOption {
  id: FormeJuridique;
  label: string;
  description: string;
  capitalMin: string;
  associes: string;
}

const FORMES: FormeOption[] = [
  { id: "sarl", label: "SARL", description: "Société à Responsabilité Limitée — pour 2 associés et plus", capitalMin: "1 000 000 FCFA", associes: "2 à 50 associés" },
  { id: "sarlu", label: "SARLU", description: "SARL à associé unique", capitalMin: "1 000 000 FCFA", associes: "1 associé" },
  { id: "sas", label: "SAS", description: "Société par Actions Simplifiée — grande liberté statutaire", capitalMin: "1 000 000 FCFA", associes: "2 actionnaires et plus" },
  { id: "sasu", label: "SASU", description: "SAS à associé unique", capitalMin: "1 000 000 FCFA", associes: "1 actionnaire" },
  { id: "sa-ag", label: "SA (AG)", description: "Société Anonyme avec Administrateur Général (forme simplifiée)", capitalMin: "10 000 000 FCFA", associes: "1 à 3 actionnaires" },
  { id: "sa-ca", label: "SA (CA)", description: "Société Anonyme avec Conseil d'Administration", capitalMin: "10 000 000 FCFA", associes: "3 actionnaires et plus" },
];

interface Step {
  key: string;
  title: string;
  description: string;
  /** Routes de wizards correspondant à cette étape — l'utilisateur clique pour générer */
  wizardId: string;
  /** Types de document qui valident l'étape (présence en base = étape ok) */
  docTypes: string[];
  /** Référence article OHADA */
  reference?: string;
  optional?: boolean;
}

const STEPS_BY_FORME: Record<FormeJuridique, Step[]> = {
  sarl: [
    { key: "statuts", title: "Rédiger les statuts", description: "Création des statuts SARL conformes à l'AUSCGIE", wizardId: "sarl", docTypes: ["statuts-sarl"], reference: "AUSCGIE art. 309 à 313" },
    { key: "drc", title: "Déclaration Régularité et Conformité", description: "DRC obligatoire à déposer au RCCM", wizardId: "drc", docTypes: ["drc"], reference: "AUSCGIE art. 73 à 75" },
    { key: "pacte", title: "Pacte d'associés (optionnel)", description: "Encadrer les relations entre associés", wizardId: "pacte-actionnaires", docTypes: ["pacte-actionnaires"], optional: true },
  ],
  sarlu: [
    { key: "statuts", title: "Rédiger les statuts SARLU", description: "Statuts adaptés à l'associé unique", wizardId: "sarl", docTypes: ["statuts-sarlu", "statuts-sarl"], reference: "AUSCGIE art. 309" },
    { key: "drc", title: "Déclaration Régularité et Conformité", description: "DRC obligatoire au RCCM", wizardId: "drc", docTypes: ["drc"], reference: "AUSCGIE art. 73" },
    { key: "decision", title: "Décision de l'associé unique gérant", description: "Première décision après immatriculation", wizardId: "dec-associe-unique-gerant", docTypes: ["dec-associe-unique-gerant"] },
  ],
  sas: [
    { key: "statuts", title: "Rédiger les statuts SAS", description: "Création des statuts SAS conformes à l'AUSCGIE", wizardId: "sas", docTypes: ["statuts-sas"], reference: "AUSCGIE art. 853-1 et s." },
    { key: "drc", title: "Déclaration Régularité et Conformité", description: "DRC obligatoire au RCCM", wizardId: "drc", docTypes: ["drc"], reference: "AUSCGIE art. 73" },
    { key: "pacte", title: "Pacte d'actionnaires (optionnel)", description: "Encadrer les relations entre actionnaires", wizardId: "pacte-actionnaires", docTypes: ["pacte-actionnaires"], optional: true },
  ],
  sasu: [
    { key: "statuts", title: "Rédiger les statuts SASU", description: "Statuts SAS à actionnaire unique", wizardId: "sasu", docTypes: ["statuts-sasu"], reference: "AUSCGIE art. 853-1" },
    { key: "drc", title: "Déclaration Régularité et Conformité", description: "DRC obligatoire au RCCM", wizardId: "drc", docTypes: ["drc"], reference: "AUSCGIE art. 73" },
    { key: "decision", title: "Décisions actionnaire unique AG", description: "Première décision après immatriculation", wizardId: "dec-actionnaire-unique-ag", docTypes: ["dec-actionnaire-unique-ag"] },
  ],
  "sa-ag": [
    { key: "statuts", title: "Rédiger les statuts SA (AG)", description: "Forme simplifiée avec Administrateur Général", wizardId: "sa-ag", docTypes: ["statuts-sa-ag"], reference: "AUSCGIE art. 494 à 515" },
    { key: "drc", title: "Déclaration Régularité et Conformité", description: "DRC obligatoire au RCCM", wizardId: "drc", docTypes: ["drc"], reference: "AUSCGIE art. 73" },
    { key: "pv-ago", title: "Premier PV AGO", description: "PV de l'assemblée constitutive ou approuvant les comptes", wizardId: "pv-ago-sa", docTypes: ["pv-ago-sa"], optional: true },
  ],
  "sa-ca": [
    { key: "statuts", title: "Rédiger les statuts SA (CA)", description: "Forme avec Conseil d'Administration", wizardId: "sa-ca", docTypes: ["statuts-sa-ca"], reference: "AUSCGIE art. 414 à 493" },
    { key: "drc", title: "Déclaration Régularité et Conformité", description: "DRC obligatoire au RCCM", wizardId: "drc", docTypes: ["drc"], reference: "AUSCGIE art. 73" },
    { key: "pv-ca", title: "Premier PV de réunion du CA", description: "Constat de la composition du Conseil", wizardId: "pv-reunion-ca", docTypes: ["pv-reunion-ca"], optional: true },
    { key: "pv-ago", title: "Premier PV AGO", description: "PV de l'assemblée constitutive ou approuvant les comptes", wizardId: "pv-ago-sa", docTypes: ["pv-ago-sa"], optional: true },
  ],
};

const ROUTES: Record<string, string> = {
  sarl: "/(app)/generate/sarl",
  sas: "/(app)/generate/sas",
  sasu: "/(app)/generate/sasu",
  "sa-ag": "/(app)/generate/sa-ag",
  "sa-ca": "/(app)/generate/sa-ca",
  drc: "/(app)/generate/drc",
  "pacte-actionnaires": "/(app)/generate/pacte-actionnaires",
  "dec-associe-unique-gerant": "/(app)/generate/dec-associe-unique-gerant",
  "dec-actionnaire-unique-ag": "/(app)/generate/dec-actionnaire-unique-ag",
  "pv-ago-sa": "/(app)/generate/pv-ago-sa",
  "pv-reunion-ca": "/(app)/generate/pv-reunion-ca",
};

export default function CreerSocieteWorkflow() {
  const { colors } = useTheme();
  const { documents, setDocuments } = useDocumentsStore();
  const [forme, setForme] = useState<FormeJuridique | null>(null);

  useEffect(() => {
    documentsApi.list().then(({ data }) => setDocuments(data.documents)).catch(() => {});
  }, [setDocuments]);

  const steps = forme ? STEPS_BY_FORME[forme] : [];

  const stepStatus = useMemo(() => {
    return steps.map(step => ({
      ...step,
      done: documents.some(d => step.docTypes.includes(d.type)),
    }));
  }, [steps, documents]);

  const completedCount = stepStatus.filter(s => s.done && !s.optional).length;
  const totalRequired = stepStatus.filter(s => !s.optional).length;
  const progress = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

  const handleStartWizard = (wizardId: string) => {
    const route = ROUTES[wizardId];
    if (route) router.navigate(route as never);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f3f4f6" }} contentContainerStyle={{ padding: 32, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Tableau de bord</Text>
        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text }}>Créer une société</Text>
      </View>
      <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: colors.text, marginBottom: 6 }}>
        Créer votre société de A à Z
      </Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 28, maxWidth: 720, lineHeight: 22 }}>
        Suivez le parcours guidé pour constituer votre société conformément à l'Acte uniforme OHADA :
        statuts, déclaration de régularité, premiers actes post-immatriculation.
      </Text>

      {/* Étape 1 : choisir la forme */}
      {!forme && (
        <View>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text, marginBottom: 14 }}>
            1. Choisissez la forme juridique
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
            {FORMES.map(f => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setForme(f.id)}
                style={{
                  width: 320,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FDF8EE", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="business-outline" size={20} color="#D4A843" />
                  </View>
                  <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 18, color: colors.text }}>{f.label}</Text>
                </View>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 }}>
                  {f.description}
                </Text>
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 4 }}>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
                    <Text style={{ fontFamily: fonts.medium, color: colors.text }}>Capital min. :</Text> {f.capitalMin}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
                    <Text style={{ fontFamily: fonts.medium, color: colors.text }}>Associés :</Text> {f.associes}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Étapes du workflow */}
      {forme && (
        <View>
          {/* Header workflow */}
          <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 24, marginBottom: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  Forme choisie
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 22, color: colors.text }}>
                  {FORMES.find(f => f.id === forme)?.label}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {FORMES.find(f => f.id === forme)?.description}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setForme(null)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 6 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary }}>Changer</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary }}>
                  Progression : {completedCount} / {totalRequired} étapes obligatoires
                </Text>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 12, color: colors.primary }}>{progress}%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: "100%", width: `${progress}%`, backgroundColor: colors.primary }} />
              </View>
            </View>
          </View>

          {/* Steps */}
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text, marginBottom: 14 }}>
            Parcours de constitution
          </Text>
          <View style={{ gap: 12 }}>
            {stepStatus.map((step, i) => (
              <View
                key={step.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: step.done ? "#22c55e" : colors.border,
                  borderRadius: 12,
                  padding: 18,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: step.done ? "#22c55e" : colors.background,
                    borderWidth: step.done ? 0 : 2,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.done ? (
                    <Ionicons name="checkmark" size={20} color="#ffffff" />
                  ) : (
                    <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: colors.textSecondary }}>{i + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.text }}>
                      {step.title}
                    </Text>
                    {step.optional && (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.background, borderRadius: 4 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Optionnel</Text>
                      </View>
                    )}
                    {step.done && (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#dcfce7", borderRadius: 4 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: "#15803d", textTransform: "uppercase", letterSpacing: 0.5 }}>Fait</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                    {step.description}
                  </Text>
                  {step.reference && (
                    <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, fontStyle: "italic" }}>
                      Réf. {step.reference}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleStartWizard(step.wizardId)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    backgroundColor: step.done ? colors.background : colors.primary,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderWidth: step.done ? 1 : 0,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 13, color: step.done ? colors.text : "#ffffff" }}>
                    {step.done ? "Régénérer" : "Démarrer"}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={step.done ? colors.text : "#ffffff"} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Aide */}
          <View style={{ marginTop: 28, padding: 18, backgroundColor: "#FDF8EE", borderRadius: 10, flexDirection: "row", gap: 14, borderLeftWidth: 4, borderLeftColor: "#D4A843" }}>
            <Ionicons name="information-circle" size={20} color="#D4A843" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 13, color: colors.text, marginBottom: 4 }}>
                Bon à savoir
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
                Une fois les étapes obligatoires terminées, votre dossier de constitution est prêt à être déposé au
                Registre du Commerce et du Crédit Mobilier (RCCM) de votre juridiction OHADA.
                Conservez les originaux signés — vos documents générés sont aussi disponibles dans « Mes documents ».
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}
