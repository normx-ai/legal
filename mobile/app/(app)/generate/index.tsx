import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";

// ── Onglets principaux ──
const TABS = [
  { key: "entreprise", label: "Entreprise", icon: "briefcase-outline" as const },
  { key: "travail", label: "Travail", icon: "people-outline" as const },
  { key: "immobilier", label: "Immobilier", icon: "home-outline" as const },
  { key: "famille", label: "Famille", icon: "heart-outline" as const },
];

// ── Contenu par onglet ──
type DocItem = { id: string; label: string; available: boolean };
type Section = { title: string; docs: DocItem[] };
type TabContent = { sections: Section[]; popular: DocItem[] };

const TAB_CONTENT: Record<string, TabContent> = {
  entreprise: {
    popular: [
      { id: "sarl", label: "Statuts SARL", available: true },
      { id: "sas", label: "Statuts SAS", available: true },
      { id: "drc", label: "DRC", available: true },
      { id: "sa-ag", label: "Statuts SA (AG)", available: true },
    ],
    sections: [
      {
        title: "Créez votre entreprise",
        docs: [
          { id: "sarl", label: "Statuts SARL", available: true },
          { id: "sarlu", label: "Statuts SARLU", available: true },
          { id: "sas", label: "Statuts SAS", available: true },
          { id: "sasu", label: "Statuts SASU", available: true },
          { id: "sa-ag", label: "Statuts SA (AG)", available: true },
          { id: "sa-ca", label: "Statuts SA (CA)", available: true },
          { id: "sa-uni", label: "Statuts SA Unipersonnelle", available: true },
          { id: "gie", label: "Convention GIE", available: true },
          { id: "ste-part", label: "Statuts Société en Participation", available: true },
          { id: "snc", label: "Statuts SNC (Société en Nom Collectif)", available: true },
          { id: "scs", label: "Statuts SCS (Société en Commandite Simple)", available: true },
        ],
      },
      {
        title: "Gérez votre entreprise",
        docs: [
          { id: "drc", label: "Déclaration de Régularité et de Conformité", available: true },
          { id: "dec-associe-unique-gerant", label: "Décisions associé unique gérant (SARL)", available: true },
          { id: "dec-associe-unique-non-gerant", label: "Décisions associé unique non gérant (SARL)", available: true },
          { id: "pv-reunion-ca", label: "PV réunion du Conseil d'Administration (SA)", available: true },
          { id: "pv-consultation-ecrite", label: "PV de consultation écrite (SARL)", available: true },
          { id: "dec-actionnaire-unique-ag", label: "Décisions actionnaire unique AG (SA/SASU)", available: true },
          { id: "dec-actionnaire-unique-non-ag", label: "Décisions actionnaire unique non AG (SA/SAS)", available: true },
          { id: "pv-ago-sa", label: "PV AGO (SA/SAS)", available: true },
          { id: "pv-age-sa", label: "PV AGE (SA/SAS)", available: true },
          { id: "acte-cession-parts", label: "Acte de cession de parts sociales (SARL)", available: true },
          { id: "pacte-actionnaires", label: "Pacte d'actionnaires/associés", available: true },
        ],
      },
      {
        title: "Convocations & Assemblées",
        docs: [
          { id: "avis-convocation-ag-sa", label: "Avis de convocation AG (SA - journal)", available: true },
          { id: "convocation-actionnaires-sa", label: "Convocation actionnaires AG (SA - lettre)", available: true },
          { id: "lettre-consultation-gerance", label: "Lettre de consultation gérance (SARL)", available: true },
          { id: "pouvoir-ca", label: "Pouvoir au Conseil d'Administration (SA)", available: true },
          { id: "feuille-presence-ca", label: "Feuille de présence CA (SA)", available: true },
          { id: "feuille-presence-ag-sa", label: "Feuille de présence AG (SA)", available: true },
          { id: "pouvoir-ag-sa", label: "Pouvoir pour AG (SA)", available: true },
          { id: "pv-carence-ago", label: "PV de carence AGO (SA/SAS)", available: true },
          { id: "pv-carence-age", label: "PV de carence AGE (SA/SAS)", available: true },
        ],
      },
      {
        title: "Capital & Souscription",
        docs: [
          { id: "bulletin-souscription-augmentation", label: "Bulletin souscription (augmentation capital)", available: true },
          { id: "bulletin-souscription-constitution", label: "Bulletin souscription (constitution)", available: true },
          { id: "renonciation-droits-souscription", label: "Renonciation droits de souscription", available: true },
          { id: "lettre-appel-fonds", label: "Lettre appel de fonds (fraction non libérée)", available: true },
          { id: "mise-en-demeure-defaillant", label: "Mise en demeure défaillant", available: true },
        ],
      },
      {
        title: "Conventions réglementées",
        docs: [
          { id: "avis-cac-conventions-sa", label: "Avis CAC conventions (SA)", available: true },
          { id: "avis-cac-conventions-sarl", label: "Avis CAC conventions (SARL)", available: true },
          { id: "lettre-info-ca-conventions", label: "Lettre info CA conventions (SA)", available: true },
        ],
      },
      {
        title: "Dissolution & Liquidation",
        docs: [
          { id: "pv-ca-dissolution", label: "PV CA convoquant AGE dissolution", available: true },
          { id: "rapport-ca-dissolution", label: "Rapport CA pour dissolution", available: true },
          { id: "projet-resolutions-dissolution", label: "Projet résolutions dissolution", available: true },
          { id: "pv-age-dissolution", label: "PV AGE dissolution/liquidation", available: true },
          { id: "pv-dissolution-liquidation", label: "PV 1ère AG tenue par liquidateur", available: true },
          { id: "publication-nomination-liquidateur", label: "Publication nomination liquidateur", available: true },
        ],
      },
      {
        title: "Fusion & Opérations",
        docs: [
          { id: "projet-fusion", label: "Fusion par absorption (SA)", available: true },
          { id: "projet-fusion-participation", label: "Fusion avec participation (SA)", available: true },
          { id: "projet-fusion-societe-nouvelle", label: "Fusion par société nouvelle (SA)", available: true },
          { id: "requete-designation-cac", label: "Requête désignation commissaire apports", available: true },
          { id: "lettre-notification-representant", label: "Notification représentant permanent (SA)", available: true },
        ],
      },
    ],
  },
  travail: {
    popular: [
      { id: "cdd", label: "Contrat CDD", available: false },
      { id: "cdi", label: "Contrat CDI", available: false },
      { id: "licenciement", label: "Lettre de licenciement", available: false },
    ],
    sections: [
      {
        title: "Recrutez votre équipe",
        docs: [
          { id: "cdi", label: "Contrat de travail CDI", available: false },
          { id: "cdd", label: "Contrat de travail CDD", available: false },
          { id: "stage", label: "Convention de stage", available: false },
          { id: "promesse-embauche", label: "Promesse d'embauche", available: false },
          { id: "description-poste", label: "Description de poste", available: false },
        ],
      },
      {
        title: "Gérez votre équipe",
        docs: [
          { id: "avenant", label: "Avenant au contrat de travail", available: false },
          { id: "attestation-travail", label: "Attestation de travail", available: false },
          { id: "avertissement", label: "Avertissement à un salarié", available: false },
          { id: "conge", label: "Acceptation de congé", available: false },
          { id: "certificat-travail", label: "Certificat de travail", available: false },
        ],
      },
      {
        title: "Se séparer d'un employé",
        docs: [
          { id: "licenciement", label: "Convocation pour un licenciement", available: false },
          { id: "rupture-cdd", label: "Rupture anticipée de CDD", available: false },
          { id: "solde-tout-compte", label: "Reçu pour solde de tout compte", available: false },
          { id: "demission", label: "Lettre de démission", available: false },
        ],
      },
    ],
  },
  immobilier: {
    popular: [
      { id: "bail-habitation", label: "Bail d'habitation", available: false },
      { id: "bail-commercial", label: "Bail commercial", available: false },
      { id: "sci", label: "Statuts SCI", available: false },
    ],
    sections: [
      {
        title: "Immobilier commercial",
        docs: [
          { id: "bail-commercial", label: "Bail commercial", available: false },
          { id: "bail-professionnel", label: "Bail professionnel", available: false },
          { id: "sous-location", label: "Autorisation de sous-location", available: false },
          { id: "resiliation-bail-com", label: "Résiliation de bail commercial", available: false },
        ],
      },
      {
        title: "Patrimoine immobilier résidentiel",
        docs: [
          { id: "bail-habitation", label: "Bail d'habitation meublée", available: false },
          { id: "bail-non-meuble", label: "Bail d'habitation non meublée", available: false },
          { id: "sci", label: "Statuts SCI", available: false },
          { id: "etat-lieux-entree", label: "État des lieux d'entrée", available: false },
          { id: "etat-lieux-sortie", label: "État des lieux de sortie", available: false },
          { id: "quittance", label: "Quittance de loyer", available: false },
        ],
      },
    ],
  },
  famille: {
    popular: [
      { id: "donation", label: "Acte de donation", available: false },
      { id: "testament", label: "Testament", available: false },
    ],
    sections: [
      {
        title: "Succession & Patrimoine",
        docs: [
          { id: "testament", label: "Testament", available: false },
          { id: "donation", label: "Acte de donation", available: false },
          { id: "procuration", label: "Procuration générale", available: false },
          { id: "reconnaissance-dette", label: "Reconnaissance de dette", available: false },
        ],
      },
      {
        title: "Associations",
        docs: [
          { id: "statuts-asso", label: "Statuts d'association", available: false },
          { id: "pv-ag-asso", label: "PV d'AG d'association", available: false },
          { id: "reglement-interieur", label: "Règlement intérieur", available: false },
        ],
      },
    ],
  },
};

const ROUTES: Record<string, string> = {
  sarl: "/(app)/generate/sarl",
  sarlu: "/(app)/generate/sarl",
  "sa-ag": "/(app)/generate/sa-ag",
  "sa-ca": "/(app)/generate/sa-ca",
  "sa-uni": "/(app)/generate/sa-uni",
  sas: "/(app)/generate/sas",
  sasu: "/(app)/generate/sasu",
  gie: "/(app)/generate/gie",
  "ste-part": "/(app)/generate/ste-part",
  drc: "/(app)/generate/drc",
  "pouvoir-ca": "/(app)/generate/pouvoir-ca",
  "avis-convocation-ag-sa": "/(app)/generate/avis-convocation-ag-sa",
  "convocation-actionnaires-sa": "/(app)/generate/convocation-actionnaires-sa",
  "lettre-info-ca-conventions": "/(app)/generate/lettre-info-ca-conventions",
  "avis-cac-conventions-sa": "/(app)/generate/avis-cac-conventions-sa",
  "avis-cac-conventions-sarl": "/(app)/generate/avis-cac-conventions-sarl",
  "feuille-presence-ca": "/(app)/generate/feuille-presence-ca",
  "lettre-consultation-gerance": "/(app)/generate/lettre-consultation-gerance",
  "pv-consultation-ecrite": "/(app)/generate/pv-consultation-ecrite",
  "dec-associe-unique-gerant": "/(app)/generate/dec-associe-unique-gerant",
  "dec-associe-unique-non-gerant": "/(app)/generate/dec-associe-unique-non-gerant",
  "pv-reunion-ca": "/(app)/generate/pv-reunion-ca",
  "acte-cession-parts": "/(app)/generate/acte-cession-parts",
  "bulletin-souscription-augmentation": "/(app)/generate/bulletin-souscription-augmentation",
  "bulletin-souscription-constitution": "/(app)/generate/bulletin-souscription-constitution",
  "feuille-presence-ag-sa": "/(app)/generate/feuille-presence-ag-sa",
  "pouvoir-ag-sa": "/(app)/generate/pouvoir-ag-sa",
  "lettre-appel-fonds": "/(app)/generate/lettre-appel-fonds",
  "mise-en-demeure-defaillant": "/(app)/generate/mise-en-demeure-defaillant",
  "pv-carence-ago": "/(app)/generate/pv-carence-ago",
  "pv-carence-age": "/(app)/generate/pv-carence-age",
  "renonciation-droits-souscription": "/(app)/generate/renonciation-droits-souscription",
  "requete-designation-cac": "/(app)/generate/requete-designation-cac",
  "pacte-actionnaires": "/(app)/generate/pacte-actionnaires",
  "dec-actionnaire-unique-ag": "/(app)/generate/dec-actionnaire-unique-ag",
  "dec-actionnaire-unique-non-ag": "/(app)/generate/dec-actionnaire-unique-non-ag",
  "pv-ago-sa": "/(app)/generate/pv-ago-sa",
  "pv-age-sa": "/(app)/generate/pv-age-sa",
  "pv-dissolution-liquidation": "/(app)/generate/pv-dissolution-liquidation",
  "rapport-ca-dissolution": "/(app)/generate/rapport-ca-dissolution",
  "pv-ca-dissolution": "/(app)/generate/pv-ca-dissolution",
  "projet-resolutions-dissolution": "/(app)/generate/projet-resolutions-dissolution",
  "pv-age-dissolution": "/(app)/generate/pv-age-dissolution",
  "publication-nomination-liquidateur": "/(app)/generate/publication-nomination-liquidateur",
  "projet-fusion": "/(app)/generate/projet-fusion",
  "projet-fusion-participation": "/(app)/generate/projet-fusion-participation",
  "projet-fusion-societe-nouvelle": "/(app)/generate/projet-fusion-societe-nouvelle",
  "lettre-notification-representant": "/(app)/generate/lettre-notification-representant",
  snc: "/(app)/generate/snc",
  scs: "/(app)/generate/scs",
};

export default function GenerateIndexScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("entreprise");

  const navigateTo = (id: string) => {
    const route = ROUTES[id];
    if (route) router.navigate(route as any);
  };

  const content = TAB_CONTENT[activeTab];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.headerBg, paddingTop: 50 }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 20, color: "#ffffff" }}>
              Nouveau document
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: "rgba(255,255,255,0.65)", marginLeft: 38 }}>
            Tous nos modèles sont conformes à l'Acte Uniforme OHADA révisé.
          </Text>
        </View>

        {/* Onglets */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row", gap: 0 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 14,
                    borderBottomWidth: 3,
                    borderBottomColor: isActive ? colors.primary : "transparent",
                    flexDirection: "row", alignItems: "center", gap: 7,
                  }}
                >
                  <Ionicons name={tab.icon} size={16} color={isActive ? colors.primary : "rgba(255,255,255,0.5)"} />
                  <Text style={{
                    fontFamily: isActive ? fonts.bold : fonts.medium,
                    fontWeight: isActive ? fontWeights.bold : fontWeights.medium,
                    fontSize: 14,
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 24 }}>

        {/* Services populaires */}
        {content.popular.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Services populaires
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {content.popular.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  disabled={!item.available}
                  onPress={() => navigateTo(item.id)}
                  style={{
                    backgroundColor: item.available ? colors.primary : colors.disabled,
                    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 6,
                    opacity: item.available ? 1 : 0.5,
                  }}
                >
                  <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 13, color: "#ffffff" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Sections avec listes de documents */}
        <View style={{ flexDirection: isMobile ? "column" : "row", gap: isMobile ? 20 : 32, flexWrap: "wrap" }}>
          {content.sections.map((section, sIdx) => (
            <View key={sIdx} style={{ flex: 1, minWidth: isMobile ? "100%" : 220 }}>
              <Text style={{
                fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 15, color: colors.headerBg,
                textTransform: "uppercase", marginBottom: 14, letterSpacing: 0.5,
              }}>
                {section.title}
              </Text>
              <View style={{ gap: 2 }}>
                {section.docs.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    disabled={!doc.available}
                    onPress={() => navigateTo(doc.id)}
                    style={{
                      paddingVertical: 10, paddingHorizontal: 4,
                      opacity: doc.available ? 1 : 0.45,
                      flexDirection: "row", alignItems: "center", gap: 8,
                    }}
                  >
                    {doc.available && (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
                    )}
                    <Text style={{
                      fontFamily: fonts.regular, fontSize: 14,
                      color: doc.available ? colors.text : colors.textMuted,
                    }}>
                      {doc.label}
                    </Text>
                    {!doc.available && (
                      <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}> (bientôt)</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Aide */}
        {activeTab === "entreprise" && (
          <View style={{
            backgroundColor: "#f0f9ff", padding: 20, marginTop: 28, marginBottom: 24,
            borderLeftWidth: 4, borderLeftColor: "#0891b2", borderRadius: 4,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Ionicons name="help-circle-outline" size={20} color="#0891b2" />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: "#164e63" }}>
                Besoin d'aide pour choisir ?
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#155e75", lineHeight: 20 }}>
              {"SARL / SARLU : capital min. 1.000.000 FCFA, parts sociales\n"}
              {"SA : capital min. 10.000.000 FCFA, actions\n"}
              {"SAS / SASU : capital min. 1.000.000 FCFA, grande liberté\n"}
              {"GIE : pas de capital minimum (art. 869 OHADA)\n"}
              {"Sté en Participation : pas d'immatriculation RCCM"}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
