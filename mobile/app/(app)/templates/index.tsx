import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { ModelPreviewCard } from "@/components/ModelPreviewCard";
import { OhadaCountryPicker } from "@/components/OhadaCountryPicker";
import { useOhadaStore } from "@/lib/ohada/store";
import { findCountry } from "@/lib/ohada/countries";

interface ModelTemplate {
  id: string;
  title: string;
  subtitle: string;
  reference?: string;
  forme: string;
  category: string;
  /** Couleur d'accent par catégorie */
  accent: string;
  /** Quelques pays où le modèle est particulièrement adapté ; si vide = tous OHADA */
  countriesSpecific?: string[];
  previewLines: { text: string; bold?: boolean; center?: boolean; size?: "xs" | "sm" | "md" }[];
}

const CAT_COLORS = {
  Statuts: "#3b82f6",
  "Vie sociale": "#D4A843",
  Assemblées: "#8b5cf6",
  "Procès-verbaux": "#0F2A42",
  Capital: "#10b981",
  Conventions: "#f97316",
  Dissolution: "#ef4444",
  Fusion: "#06b6d4",
};

const TEMPLATES: ModelTemplate[] = [
  {
    id: "sarl",
    title: "Statuts SARL",
    subtitle: "Société à Responsabilité Limitée — 2 à 50 associés",
    reference: "AUSCGIE art. 309 à 384",
    forme: "SARL",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SARL", bold: true, center: true, size: "md" },
      { text: "Société à Responsabilité Limitée", center: true, size: "sm" },
      { text: "Au capital de 1 000 000 FCFA", center: true, size: "xs" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "Il est formé entre les soussignés une société...", size: "xs" },
      { text: "Article 2 — Dénomination", bold: true, size: "sm" },
      { text: "La société a pour dénomination sociale...", size: "xs" },
    ],
  },
  {
    id: "sarlu",
    title: "Statuts SARLU",
    subtitle: "SARL à associé unique",
    reference: "AUSCGIE art. 309",
    forme: "SARLU",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SARLU", bold: true, center: true, size: "md" },
      { text: "Société à Responsabilité Limitée Unipersonnelle", center: true, size: "sm" },
      { text: "Au capital de 1 000 000 FCFA", center: true, size: "xs" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "Il est formé une SARL à associé unique...", size: "xs" },
    ],
  },
  {
    id: "sas",
    title: "Statuts SAS",
    subtitle: "Société par Actions Simplifiée — grande liberté statutaire",
    reference: "AUSCGIE art. 853-1 et s.",
    forme: "SAS",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SAS", bold: true, center: true, size: "md" },
      { text: "Société par Actions Simplifiée", center: true, size: "sm" },
      { text: "Au capital de 1 000 000 FCFA", center: true, size: "xs" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "Il est formé une société par actions simplifiée...", size: "xs" },
    ],
  },
  {
    id: "sasu",
    title: "Statuts SASU",
    subtitle: "SAS à actionnaire unique",
    reference: "AUSCGIE art. 853-1",
    forme: "SASU",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SASU", bold: true, center: true, size: "md" },
      { text: "SAS à actionnaire unique", center: true, size: "sm" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "Société par actions simplifiée unipersonnelle...", size: "xs" },
    ],
  },
  {
    id: "sa-ag",
    title: "Statuts SA (AG)",
    subtitle: "Société Anonyme avec Administrateur Général",
    reference: "AUSCGIE art. 494 à 515",
    forme: "SA",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SA", bold: true, center: true, size: "md" },
      { text: "Société Anonyme à Administrateur Général", center: true, size: "sm" },
      { text: "Au capital de 10 000 000 FCFA", center: true, size: "xs" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "Il est formé une société anonyme...", size: "xs" },
    ],
  },
  {
    id: "sa-ca",
    title: "Statuts SA (CA)",
    subtitle: "Société Anonyme avec Conseil d'Administration",
    reference: "AUSCGIE art. 414 à 493",
    forme: "SA",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SA", bold: true, center: true, size: "md" },
      { text: "Société Anonyme à Conseil d'Administration", center: true, size: "sm" },
      { text: "Au capital de 10 000 000 FCFA", center: true, size: "xs" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "La société est administrée par un Conseil...", size: "xs" },
    ],
  },
  {
    id: "snc",
    title: "Statuts SNC",
    subtitle: "Société en Nom Collectif",
    reference: "AUSCGIE art. 270 à 292",
    forme: "SNC",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SNC", bold: true, center: true, size: "md" },
      { text: "Société en Nom Collectif", center: true, size: "sm" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
      { text: "Société en nom collectif régie par l'AUSCGIE...", size: "xs" },
    ],
  },
  {
    id: "scs",
    title: "Statuts SCS",
    subtitle: "Société en Commandite Simple",
    reference: "AUSCGIE art. 293 à 308",
    forme: "SCS",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "DÉNOMINATION SCS", bold: true, center: true, size: "md" },
      { text: "Société en Commandite Simple", center: true, size: "sm" },
      { text: "STATUTS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Forme", bold: true, size: "sm" },
    ],
  },
  {
    id: "gie",
    title: "Convention GIE",
    subtitle: "Groupement d'Intérêt Économique — pas de capital min.",
    reference: "AUSCGIE art. 869 et s.",
    forme: "GIE",
    category: "Statuts",
    accent: CAT_COLORS.Statuts,
    previewLines: [
      { text: "GROUPEMENT D'INTÉRÊT ÉCONOMIQUE", bold: true, center: true, size: "md" },
      { text: "CONVENTION CONSTITUTIVE", center: true, size: "sm" },
      { text: "Article 1 — Constitution", bold: true, size: "sm" },
    ],
  },

  // Vie sociale
  {
    id: "drc",
    title: "DRC (art. 73)",
    subtitle: "Déclaration de Régularité et de Conformité",
    reference: "AUSCGIE art. 73 à 75",
    forme: "Tous",
    category: "Vie sociale",
    accent: CAT_COLORS["Vie sociale"],
    previewLines: [
      { text: "DÉCLARATION DE RÉGULARITÉ", bold: true, center: true, size: "md" },
      { text: "ET DE CONFORMITÉ", bold: true, center: true, size: "md" },
      { text: "Article 73 AUSCGIE", center: true, size: "xs" },
      { text: "Le(s) soussigné(s) déclare(nt) sous sa (leur)...", size: "xs" },
      { text: "responsabilité que les opérations préalables...", size: "xs" },
      { text: "à la constitution sont conformes...", size: "xs" },
    ],
  },
  {
    id: "rapport-gestion",
    title: "Rapport de gestion",
    subtitle: "Rapport annuel de gestion (AGO)",
    reference: "AUSCGIE art. 138 et s.",
    forme: "Tous",
    category: "Vie sociale",
    accent: CAT_COLORS["Vie sociale"],
    previewLines: [
      { text: "RAPPORT DE GESTION", bold: true, center: true, size: "md" },
      { text: "Exercice clos le 31 décembre", center: true, size: "sm" },
      { text: "I. ACTIVITÉ DE LA SOCIÉTÉ", bold: true, size: "sm" },
      { text: "II. RÉSULTATS FINANCIERS", bold: true, size: "sm" },
    ],
  },
  {
    id: "pacte-actionnaires",
    title: "Pacte d'actionnaires",
    subtitle: "Encadre les relations entre actionnaires",
    reference: "Art. 768-1 AUSCGIE",
    forme: "SA/SAS",
    category: "Vie sociale",
    accent: CAT_COLORS["Vie sociale"],
    previewLines: [
      { text: "PACTE D'ACTIONNAIRES", bold: true, center: true, size: "md" },
      { text: "ENTRE LES SOUSSIGNÉS", bold: true, center: true, size: "sm" },
      { text: "Article 1 — Objet", bold: true, size: "sm" },
      { text: "Article 2 — Clauses de préemption", bold: true, size: "sm" },
    ],
  },

  // Assemblées
  {
    id: "conv-ago",
    title: "Convocation AGO",
    subtitle: "Convocation à l'Assemblée Générale Ordinaire",
    forme: "SARL",
    category: "Assemblées",
    accent: CAT_COLORS.Assemblées,
    previewLines: [
      { text: "CONVOCATION", bold: true, center: true, size: "md" },
      { text: "Assemblée Générale Ordinaire", center: true, size: "sm" },
      { text: "Madame, Monsieur,", size: "xs" },
      { text: "Vous êtes convoqué(e) à l'AGO du...", size: "xs" },
    ],
  },
  {
    id: "conv-age",
    title: "Convocation AGE",
    subtitle: "Convocation à l'Assemblée Générale Extraordinaire",
    forme: "SARL",
    category: "Assemblées",
    accent: CAT_COLORS.Assemblées,
    previewLines: [
      { text: "CONVOCATION", bold: true, center: true, size: "md" },
      { text: "Assemblée Générale Extraordinaire", center: true, size: "sm" },
      { text: "Madame, Monsieur,", size: "xs" },
      { text: "Vous êtes convoqué(e) à l'AGE du...", size: "xs" },
    ],
  },
  {
    id: "feuille-presence",
    title: "Feuille de présence",
    subtitle: "Feuille de présence AG (SARL)",
    forme: "SARL",
    category: "Assemblées",
    accent: CAT_COLORS.Assemblées,
    previewLines: [
      { text: "FEUILLE DE PRÉSENCE", bold: true, center: true, size: "md" },
      { text: "AG Ordinaire du XX/XX/XXXX", center: true, size: "sm" },
      { text: "Présents :", bold: true, size: "sm" },
      { text: "M./Mme … — XXX parts", size: "xs" },
    ],
  },
  {
    id: "pouvoir-ag",
    title: "Pouvoir AG",
    subtitle: "Procuration pour AG (SARL)",
    forme: "SARL",
    category: "Assemblées",
    accent: CAT_COLORS.Assemblées,
    previewLines: [
      { text: "POUVOIR", bold: true, center: true, size: "md" },
      { text: "Pour l'Assemblée Générale", center: true, size: "sm" },
      { text: "Je soussigné(e), …, donne pouvoir à …", size: "xs" },
      { text: "de me représenter à l'assemblée...", size: "xs" },
    ],
  },

  // PV
  {
    id: "pv-ago",
    title: "PV AGO",
    subtitle: "Procès-verbal AGO (SARL)",
    forme: "SARL",
    category: "Procès-verbaux",
    accent: CAT_COLORS["Procès-verbaux"],
    previewLines: [
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "md" },
      { text: "Assemblée Générale Ordinaire", center: true, size: "sm" },
      { text: "Le …, les associés se sont réunis...", size: "xs" },
      { text: "Ordre du jour :", bold: true, size: "sm" },
      { text: "1. Approbation des comptes", size: "xs" },
      { text: "2. Affectation du résultat", size: "xs" },
    ],
  },
  {
    id: "pv-age",
    title: "PV AGE",
    subtitle: "Procès-verbal AGE (SARL) avec résolutions",
    forme: "SARL",
    category: "Procès-verbaux",
    accent: CAT_COLORS["Procès-verbaux"],
    previewLines: [
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "md" },
      { text: "Assemblée Générale Extraordinaire", center: true, size: "sm" },
      { text: "Première résolution", bold: true, size: "sm" },
      { text: "L'assemblée décide de modifier...", size: "xs" },
      { text: "Cette résolution est adoptée à l'unanimité.", size: "xs" },
    ],
  },
  {
    id: "pv-ago-sa",
    title: "PV AGO (SA)",
    subtitle: "Procès-verbal AGO pour SA/SAS",
    forme: "SA",
    category: "Procès-verbaux",
    accent: CAT_COLORS["Procès-verbaux"],
    previewLines: [
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "md" },
      { text: "Assemblée Générale Ordinaire", center: true, size: "sm" },
      { text: "1. Approbation des comptes", size: "xs" },
      { text: "2. Affectation du résultat", size: "xs" },
      { text: "3. Conventions réglementées", size: "xs" },
    ],
  },
  {
    id: "pv-reunion-ca",
    title: "PV CA",
    subtitle: "Procès-verbal de réunion du CA",
    forme: "SA",
    category: "Procès-verbaux",
    accent: CAT_COLORS["Procès-verbaux"],
    previewLines: [
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "md" },
      { text: "Conseil d'Administration", center: true, size: "sm" },
      { text: "Présents :", bold: true, size: "sm" },
      { text: "Délibérations :", bold: true, size: "sm" },
    ],
  },

  // Capital
  {
    id: "acte-cession-parts",
    title: "Cession de parts",
    subtitle: "Acte de cession de parts sociales (SARL)",
    forme: "SARL",
    category: "Capital",
    accent: CAT_COLORS.Capital,
    previewLines: [
      { text: "ACTE DE CESSION", bold: true, center: true, size: "md" },
      { text: "DE PARTS SOCIALES", bold: true, center: true, size: "md" },
      { text: "ENTRE LES SOUSSIGNÉS :", bold: true, size: "sm" },
      { text: "Le cédant : …", size: "xs" },
      { text: "Le cessionnaire : …", size: "xs" },
      { text: "Article 1 — Cession", bold: true, size: "sm" },
    ],
  },
  {
    id: "acte-cession-actions",
    title: "Cession d'actions",
    subtitle: "Acte de cession d'actions (SA/SAS)",
    forme: "SA",
    category: "Capital",
    accent: CAT_COLORS.Capital,
    previewLines: [
      { text: "ACTE DE CESSION", bold: true, center: true, size: "md" },
      { text: "D'ACTIONS", bold: true, center: true, size: "md" },
      { text: "Article 1 — Cession", bold: true, size: "sm" },
      { text: "Article 2 — Prix", bold: true, size: "sm" },
    ],
  },
  {
    id: "bulletin-souscription-augmentation",
    title: "Bulletin souscription",
    subtitle: "Augmentation de capital",
    forme: "Tous",
    category: "Capital",
    accent: CAT_COLORS.Capital,
    previewLines: [
      { text: "BULLETIN DE SOUSCRIPTION", bold: true, center: true, size: "md" },
      { text: "Augmentation de capital", center: true, size: "sm" },
      { text: "Le soussigné déclare souscrire...", size: "xs" },
    ],
  },

  // Dissolution & Fusion
  {
    id: "pv-age-dissolution",
    title: "PV AGE dissolution",
    subtitle: "PV AGE prononçant la dissolution",
    forme: "Tous",
    category: "Dissolution",
    accent: CAT_COLORS.Dissolution,
    previewLines: [
      { text: "PROCÈS-VERBAL", bold: true, center: true, size: "md" },
      { text: "AGE de dissolution", center: true, size: "sm" },
      { text: "Première résolution — Dissolution anticipée", bold: true, size: "sm" },
      { text: "L'AGE décide de prononcer la dissolution...", size: "xs" },
    ],
  },
  {
    id: "projet-fusion",
    title: "Projet de fusion",
    subtitle: "Projet de fusion par absorption",
    reference: "AUSCGIE art. 191 à 199",
    forme: "SA",
    category: "Fusion",
    accent: CAT_COLORS.Fusion,
    previewLines: [
      { text: "PROJET DE FUSION", bold: true, center: true, size: "md" },
      { text: "PAR ABSORPTION", bold: true, center: true, size: "md" },
      { text: "Article 1 — Sociétés concernées", bold: true, size: "sm" },
      { text: "Article 2 — Modalités", bold: true, size: "sm" },
    ],
  },
];

const CATEGORIES = ["Toutes", "Statuts", "Vie sociale", "Assemblées", "Procès-verbaux", "Capital", "Conventions", "Dissolution", "Fusion"];

const ROUTES: Record<string, string> = {
  sarl: "/(app)/generate/sarl", sarlu: "/(app)/generate/sarl",
  sas: "/(app)/generate/sas", sasu: "/(app)/generate/sasu",
  "sa-ag": "/(app)/generate/sa-ag", "sa-ca": "/(app)/generate/sa-ca",
  "sa-uni": "/(app)/generate/sa-uni",
  snc: "/(app)/generate/snc", scs: "/(app)/generate/scs",
  gie: "/(app)/generate/gie", "ste-part": "/(app)/generate/ste-part",
  drc: "/(app)/generate/drc",
  "rapport-gestion": "/(app)/generate/rapport-gestion",
  "pacte-actionnaires": "/(app)/generate/pacte-actionnaires",
  "conv-ago": "/(app)/generate/conv-ago",
  "conv-age": "/(app)/generate/conv-age",
  "feuille-presence": "/(app)/generate/feuille-presence",
  "pouvoir-ag": "/(app)/generate/pouvoir-ag",
  "pv-ago": "/(app)/generate/pv-ago",
  "pv-age": "/(app)/generate/pv-age",
  "pv-ago-sa": "/(app)/generate/pv-ago-sa",
  "pv-age-sa": "/(app)/generate/pv-age-sa",
  "pv-reunion-ca": "/(app)/generate/pv-reunion-ca",
  "acte-cession-parts": "/(app)/generate/acte-cession-parts",
  "acte-cession-actions": "/(app)/generate/acte-cession-actions",
  "bulletin-souscription-augmentation": "/(app)/generate/bulletin-souscription-augmentation",
  "pv-age-dissolution": "/(app)/generate/pv-age-dissolution",
  "projet-fusion": "/(app)/generate/projet-fusion",
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function TemplatesLibraryScreen() {
  const { colors } = useTheme();
  const { country } = useOhadaStore();
  const currentCountry = findCountry(country);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Toutes");

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (activeCategory !== "Toutes") {
      list = list.filter(t => t.category === activeCategory);
    }
    if (country) {
      list = list.filter(t => !t.countriesSpecific || t.countriesSpecific.includes(country));
    }
    if (query.trim()) {
      const q = normalize(query);
      list = list.filter(t =>
        normalize(t.title).includes(q) ||
        normalize(t.subtitle).includes(q) ||
        normalize(t.category).includes(q)
      );
    }
    return list;
  }, [query, activeCategory, country]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f3f4f6" }} contentContainerStyle={{ padding: 32, maxWidth: 1300, alignSelf: "center", width: "100%" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Tableau de bord</Text>
        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text }}>Bibliothèque de modèles</Text>
      </View>
      <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: colors.text, marginBottom: 6 }}>
        Bibliothèque de modèles OHADA
      </Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 28 }}>
        Aperçu des {TEMPLATES.length} modèles disponibles. Cliquez sur un modèle pour le générer.
      </Text>

      {/* Filtres : recherche + pays + categories */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            flex: 1,
            minWidth: 240,
            maxWidth: 480,
          }}
        >
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un modèle..."
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, ...(Platform.OS === "web" ? { outlineStyle: "none" } as never : {}) }}
          />
        </View>
        <OhadaCountryPicker variant="row" />
      </View>

      {/* Pills catégories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} style={{ marginBottom: 24 }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isActive ? colors.headerBg : colors.card,
                borderWidth: 1,
                borderColor: isActive ? colors.headerBg : colors.border,
              }}
            >
              <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 13, color: isActive ? "#ffffff" : colors.text }}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bandeau juridiction */}
      {currentCountry && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, backgroundColor: "#FDF8EE", borderRadius: 8, marginBottom: 24 }}>
          <Text style={{ fontSize: 18 }}>{currentCountry.flag}</Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.text, flex: 1 }}>
            Juridiction <Text style={{ fontFamily: fonts.semiBold }}>{currentCountry.name}</Text> — RCCM {currentCountry.rccmPrefix}.
            Les modèles sont conformes à l'AUSCGIE et adaptés au droit local lors du remplissage.
          </Text>
        </View>
      )}

      {/* Résultats */}
      {filtered.length === 0 ? (
        <View style={{ padding: 60, alignItems: "center", backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search-outline" size={36} color={colors.textMuted} />
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginTop: 12 }}>
            Aucun modèle ne correspond à votre recherche
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {filtered.map(t => (
            <ModelPreviewCard
              key={t.id}
              title={t.title}
              subtitle={t.subtitle}
              previewLines={t.previewLines}
              reference={t.reference}
              forme={t.forme}
              accentColor={t.accent}
              onPress={() => {
                const route = ROUTES[t.id];
                if (route) router.navigate(route as never);
              }}
            />
          ))}
        </View>
      )}

      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 32 }}>
        {filtered.length} modèle{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} sur {TEMPLATES.length} aperçus disponibles
      </Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}
