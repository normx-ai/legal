import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";

const DOCUMENT_TYPES = [
  {
    id: "sarl", label: "Statuts SARL", desc: "Société à Responsabilité Limitée (2 à 50 associés)",
    icon: "people-outline" as const, available: true, tag: "Disponible",
  },
  {
    id: "sarlu", label: "Statuts SARLU", desc: "SARL Unipersonnelle (associé unique)",
    icon: "person-outline" as const, available: true, tag: "Disponible",
  },
  {
    id: "sa-ag", label: "Statuts SA (AG)", desc: "Société Anonyme avec Administrateur Général",
    icon: "business-outline" as const, available: true, tag: "Disponible",
  },
  {
    id: "sa-ca", label: "Statuts SA (CA)", desc: "SA avec Conseil d'Administration",
    icon: "business-outline" as const, available: true, tag: "Disponible",
  },
  {
    id: "sa-uni", label: "Statuts SA Unipersonnelle", desc: "SA avec actionnaire unique",
    icon: "person-outline" as const, available: true, tag: "Disponible",
  },
  {
    id: "sas", label: "Statuts SAS", desc: "Société par Actions Simplifiée",
    icon: "business-outline" as const, available: false, tag: "Bientôt",
  },
  {
    id: "sci", label: "Statuts SCI", desc: "Société Civile Immobilière",
    icon: "home-outline" as const, available: false, tag: "Bientôt",
  },
  {
    id: "gie", label: "Convention GIE", desc: "Groupement d'Intérêt Économique",
    icon: "people-outline" as const, available: false, tag: "Bientôt",
  },
  {
    id: "pv-ago", label: "PV d'AGO", desc: "Assemblée Générale Ordinaire",
    icon: "document-text-outline" as const, available: false, tag: "Bientôt",
  },
  {
    id: "cession", label: "Cession de parts", desc: "Transfert de parts sociales SARL",
    icon: "swap-horizontal-outline" as const, available: false, tag: "Bientôt",
  },
];

export default function GenerateIndexScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#ffffff", paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24,
        borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
        flexDirection: "row", alignItems: "center", gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text }}>
          Nouveau document
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 800, alignSelf: "center", width: "100%", padding: 24 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 22, color: colors.text, marginBottom: 4 }}>
          Quel document souhaitez-vous créer ?
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 24 }}>
          Tous nos modèles sont conformes à l'Acte Uniforme OHADA révisé.
        </Text>

        <View style={{ gap: 8 }}>
          {DOCUMENT_TYPES.map((docType) => (
            <TouchableOpacity
              key={docType.id}
              disabled={!docType.available}
              onPress={() => {
                if (docType.id === "sarl" || docType.id === "sarlu") {
                  router.navigate("/(app)/generate/sarl");
                } else if (docType.id === "sa-ag") {
                  router.navigate("/(app)/generate/sa-ag");
                } else if (docType.id === "sa-ca") {
                  router.navigate("/(app)/generate/sa-ca");
                } else if (docType.id === "sa-uni") {
                  router.navigate("/(app)/generate/sa-uni");
                }
              }}
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderWidth: 1,
                borderColor: docType.available ? "#e2e8f0" : "#f1f5f9",
                opacity: docType.available ? 1 : 0.6,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View style={{
                width: 48, height: 48,
                backgroundColor: docType.available ? colors.primary + "10" : "#f8fafc",
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name={docType.icon} size={24} color={docType.available ? colors.primary : colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text }}>
                  {docType.label}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {docType.desc}
                </Text>
              </View>
              {docType.available ? (
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              ) : (
                <View style={{ backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted }}>{docType.tag}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={{ backgroundColor: "#fffbeb", padding: 16, marginTop: 24, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
            Besoin d'aide pour choisir ?
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#a16207", lineHeight: 20 }}>
            SARL : 2 à 50 associés, capital min. 1.000.000 FCFA{"\n"}
            SARLU : 1 seul associé (unipersonnelle), mêmes règles de capital
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
