import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";

// ── Catégories de documents ──
const CATEGORIES = [
  {
    title: "Créez votre entreprise",
    icon: "briefcase-outline" as const,
    color: "#1A3A5C",
    docs: [
      { id: "sarl", label: "Statuts SARL", desc: "2 à 50 associés, capital min. 1M FCFA", available: true },
      { id: "sarlu", label: "Statuts SARLU", desc: "SARL à associé unique", available: true },
      { id: "sas", label: "Statuts SAS", desc: "Société par Actions Simplifiée", available: true },
      { id: "sasu", label: "Statuts SASU", desc: "SAS Unipersonnelle", available: true },
      { id: "sa-ag", label: "Statuts SA (AG)", desc: "SA avec Administrateur Général", available: true },
      { id: "sa-ca", label: "Statuts SA (CA)", desc: "SA avec Conseil d'Administration", available: true },
      { id: "sa-uni", label: "Statuts SA Unipersonnelle", desc: "SA à actionnaire unique", available: true },
    ],
  },
  {
    title: "Autres formes juridiques",
    icon: "people-outline" as const,
    color: "#0891b2",
    docs: [
      { id: "gie", label: "Convention GIE", desc: "Groupement d'Intérêt Économique (22 articles)", available: true },
      { id: "ste-part", label: "Statuts Sté en Participation", desc: "Société en Participation (13 articles)", available: true },
      { id: "sci", label: "Statuts SCI", desc: "Société Civile Immobilière", available: false },
    ],
  },
  {
    title: "Documents transversaux",
    icon: "document-text-outline" as const,
    color: "#7c3aed",
    docs: [
      { id: "drc", label: "DRC", desc: "Déclaration de Régularité et de Conformité (art. 73)", available: true },
      { id: "pv-ago", label: "PV d'AGO", desc: "Assemblée Générale Ordinaire", available: false },
      { id: "cession", label: "Cession de parts", desc: "Transfert de parts sociales SARL", available: false },
    ],
  },
];

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
};

// ── Raccourcis populaires ──
const POPULAR = [
  { id: "sarl", label: "Statuts SARL", icon: "people-outline" as const },
  { id: "sas", label: "Statuts SAS", icon: "business-outline" as const },
  { id: "drc", label: "DRC", icon: "checkmark-circle-outline" as const },
  { id: "gie", label: "Convention GIE", icon: "people-outline" as const },
];

export default function GenerateIndexScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const [expandedCat, setExpandedCat] = useState<number | null>(0);

  const navigateTo = (id: string) => {
    const route = ROUTES[id];
    if (route) router.navigate(route as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.headerBg, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: "#ffffff" }}>
            Nouveau document
          </Text>
        </View>

        {/* Hero */}
        <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 24, color: "#ffffff", marginBottom: 6 }}>
          Vos documents juridiques OHADA
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Conformes à l'Acte Uniforme révisé. Générés en quelques minutes.
        </Text>

        {/* Raccourcis populaires */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {POPULAR.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigateTo(item.id)}
                style={{
                  backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 12,
                  flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6,
                }}
              >
                <Ionicons name={item.icon} size={18} color="#ffffff" />
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 13, color: "#ffffff" }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 900, alignSelf: "center", width: "100%", padding: isMobile ? 16 : 24 }}>

        {/* Catégories */}
        {CATEGORIES.map((cat, catIndex) => (
          <View key={catIndex} style={{ marginBottom: 16 }}>
            {/* En-tête catégorie */}
            <TouchableOpacity
              onPress={() => setExpandedCat(expandedCat === catIndex ? null : catIndex)}
              style={{
                backgroundColor: "#ffffff", padding: 18,
                borderWidth: 1, borderColor: "#e2e8f0",
                flexDirection: "row", alignItems: "center", gap: 14,
                borderBottomWidth: expandedCat === catIndex ? 0 : 1,
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 10,
                backgroundColor: cat.color + "12", alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name={cat.icon} size={22} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text }}>
                  {cat.title}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {cat.docs.filter(d => d.available).length} modèle{cat.docs.filter(d => d.available).length > 1 ? "s" : ""} disponible{cat.docs.filter(d => d.available).length > 1 ? "s" : ""}
                </Text>
              </View>
              <Ionicons
                name={expandedCat === catIndex ? "chevron-up" : "chevron-down"}
                size={20} color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Liste des documents de la catégorie */}
            {expandedCat === catIndex && (
              <View style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderTopWidth: 0 }}>
                {cat.docs.map((doc, docIndex) => (
                  <TouchableOpacity
                    key={doc.id}
                    disabled={!doc.available}
                    onPress={() => navigateTo(doc.id)}
                    style={{
                      padding: 16, paddingLeft: 24,
                      flexDirection: "row", alignItems: "center", gap: 14,
                      borderTopWidth: docIndex > 0 ? 1 : 0, borderTopColor: "#f1f5f9",
                      opacity: doc.available ? 1 : 0.5,
                    }}
                  >
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: doc.available ? colors.success : colors.disabled,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 15, color: colors.text }}>
                        {doc.label}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                        {doc.desc}
                      </Text>
                    </View>
                    {doc.available ? (
                      <Ionicons name="arrow-forward" size={18} color={cat.color} />
                    ) : (
                      <View style={{ backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted }}>Bientôt</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Aide */}
        <View style={{
          backgroundColor: "#f0f9ff", padding: 20, marginTop: 8, marginBottom: 24,
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
      </ScrollView>
    </View>
  );
}
