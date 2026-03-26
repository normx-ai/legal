import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { useAuthStore } from "@/lib/store/auth";
import { useDocumentsStore } from "@/lib/store/documents";
import { documentsApi, type DocumentItem } from "@/lib/api/documents";

// ── Raccourcis rapides ──
const QUICK_ACTIONS = [
  { id: "sarl", label: "Statuts\nSARL", icon: "people-outline" as const, color: "#1A3A5C", route: "/(app)/generate/sarl" },
  { id: "sas", label: "Statuts\nSAS", icon: "business-outline" as const, color: "#0891b2", route: "/(app)/generate/sas" },
  { id: "sa-ag", label: "Statuts\nSA (AG)", icon: "briefcase-outline" as const, color: "#7c3aed", route: "/(app)/generate/sa-ag" },
  { id: "gie", label: "Convention\nGIE", icon: "people-outline" as const, color: "#059669", route: "/(app)/generate/gie" },
  { id: "drc", label: "DRC", icon: "checkmark-circle-outline" as const, color: "#d97706", route: "/(app)/generate/drc" },
  { id: "ste-part", label: "Sté en\nParticipation", icon: "git-compare-outline" as const, color: "#dc2626", route: "/(app)/generate/ste-part" },
];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const { user, logout } = useAuthStore();
  const { documents, setDocuments, setLoading } = useDocumentsStore();
  const [error, setError] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await documentsApi.list();
      setDocuments(data.documents);
    } catch {
      setError("Impossible de charger les documents");
    } finally { setLoading(false); }
  };

  const renderDocument = ({ item }: { item: DocumentItem }) => (
    <TouchableOpacity style={{
      backgroundColor: "#ffffff", padding: 18, marginBottom: 1,
      borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
      flexDirection: "row", alignItems: "center", gap: 14,
    }}>
      <View style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: colors.primary + "12", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="document-text" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: colors.text }}>{item.label}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
          {item.forme_juridique} — {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        {item.docx_url && (
          <View style={{ backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: "#2563eb" }}>DOCX</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const docsCeMois = documents.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.headerBg,
        paddingTop: 50, paddingBottom: 28, paddingHorizontal: 24,
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="document-text" size={20} color="#fff" />
            </View>
            <View>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 18, color: "#ffffff" }}>NORMX Legal</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Documents juridiques OHADA</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: "#ffffff" }}>{user?.prenom} {user?.nom}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={{ padding: 8 }}>
              <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Salutation + CTA */}
        <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 26, color: "#ffffff", marginBottom: 6 }}>
          Bonjour, {user?.prenom}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          Créez vos documents juridiques conformes OHADA en quelques clics.
        </Text>

        {/* Bouton principal */}
        <TouchableOpacity
          onPress={() => router.navigate("/(app)/generate")}
          style={{
            backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 24,
            borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <Ionicons name="add-circle" size={22} color="#ffffff" />
          <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#ffffff" }}>
            Nouveau document
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 900, alignSelf: "center", width: "100%", padding: isMobile ? 16 : 24 }}>

        {/* Raccourcis rapides */}
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text, marginBottom: 14 }}>
          Accès rapide
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: isMobile ? -16 : 0, paddingHorizontal: isMobile ? 16 : 0 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.navigate(action.route as any)}
                style={{
                  width: 110, backgroundColor: "#ffffff", padding: 16,
                  borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
                  alignItems: "center", gap: 10,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 10,
                  backgroundColor: action.color + "12", alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={{
                  fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 12,
                  color: colors.text, textAlign: "center", lineHeight: 16,
                }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 20, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>Total documents</Text>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary + "12", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              </View>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 32, color: colors.text }}>{documents.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", padding: 20, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>Ce mois</Text>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#0891b2" + "12", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="calendar-outline" size={16} color="#0891b2" />
              </View>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 32, color: colors.text }}>{docsCeMois}</Text>
          </View>
        </View>

        {/* Modèles disponibles */}
        <View style={{
          backgroundColor: "#f0f9ff", padding: 18, borderRadius: 10, marginBottom: 24,
          flexDirection: "row", alignItems: "center", gap: 14,
          borderWidth: 1, borderColor: "#bae6fd",
        }}>
          <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#0891b2" + "18", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="layers-outline" size={22} color="#0891b2" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: "#164e63" }}>
              10 modèles disponibles
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#155e75", marginTop: 2 }}>
              SARL, SA, SAS, GIE, Sté en Participation, DRC
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.navigate("/(app)/generate")}>
            <Ionicons name="arrow-forward-circle" size={28} color="#0891b2" />
          </TouchableOpacity>
        </View>

        {/* Documents list */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text }}>
            Mes documents
          </Text>
          {documents.length > 0 && (
            <TouchableOpacity onPress={loadDocuments} style={{ padding: 4 }}>
              <Ionicons name="refresh-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <View style={{ backgroundColor: "#fef2f2", padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.danger, marginBottom: 16 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: "#991b1b" }}>{error}</Text>
          </View>
        ) : null}

        {documents.length === 0 ? (
          <View style={{ backgroundColor: "#ffffff", padding: 48, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 16,
              backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 18,
            }}>
              <Ionicons name="document-text-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text, marginBottom: 8 }}>
              Aucun document
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: "center", maxWidth: 300, marginBottom: 24 }}>
              Créez votre premier document juridique conforme OHADA en quelques minutes.
            </Text>
            <TouchableOpacity
              onPress={() => router.navigate("/(app)/generate")}
              style={{
                backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14,
                borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 8,
              }}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: "#ffffff" }}>Créer un document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <FlatList data={documents} renderItem={renderDocument} keyExtractor={(item) => item.id} scrollEnabled={false} />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
