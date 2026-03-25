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
      backgroundColor: "#ffffff", padding: 20, marginBottom: 1,
      borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
      flexDirection: "row", alignItems: "center", gap: 16,
    }}>
      <View style={{ width: 44, height: 44, backgroundColor: colors.primary + "12", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="document-text" size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.text }}>{item.label}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
          {item.forme_juridique} — {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        {item.docx_url && (
          <View style={{ backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: "#2563eb" }}>DOCX</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#ffffff",
        paddingTop: 50, paddingBottom: 16, paddingHorizontal: 24,
        borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 36, height: 36, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="document-text" size={18} color="#fff" />
          </View>
          <View>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.text }}>NORMX Legal</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary }}>{user?.prenom} {user?.nom}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={{ padding: 8 }}>
          <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 800, alignSelf: "center", width: "100%", padding: 24 }}>

        {/* Action cards */}
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 22, color: colors.text, marginBottom: 4 }}>
          Bonjour, {user?.prenom}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 24 }}>
          Que souhaitez-vous faire aujourd'hui ?
        </Text>

        <TouchableOpacity onPress={() => router.navigate("/(app)/generate")} style={{
          backgroundColor: colors.headerBg, padding: 24, marginBottom: 24,
          flexDirection: "row", alignItems: "center", gap: 16,
        }}>
          <View style={{ width: 52, height: 52, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="add" size={28} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 17, color: "#ffffff" }}>
              Nouveau document
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              Statuts SARL, SARLU, PV, cessions...
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Documents", value: String(documents.length), icon: "document-text-outline" },
            { label: "Ce mois", value: String(documents.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length), icon: "calendar-outline" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: "#ffffff", padding: 20, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>{stat.label}</Text>
                <Ionicons name={stat.icon as "document-text-outline"} size={18} color={colors.textMuted} />
              </View>
              <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: colors.text }}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Documents list */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 17, color: colors.text }}>
            Mes documents
          </Text>
        </View>

        {documents.length === 0 ? (
          <View style={{ backgroundColor: "#ffffff", padding: 48, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" }}>
            <View style={{ width: 64, height: 64, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={{ fontFamily: fonts.semiBold, fontSize: 17, color: colors.text, marginBottom: 8 }}>
              Aucun document
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: "center", maxWidth: 300, marginBottom: 24 }}>
              Créez votre premier document juridique conforme OHADA en quelques minutes.
            </Text>
            <TouchableOpacity onPress={() => router.navigate("/(app)/generate")}
              style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: "#ffffff" }}>Créer un document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0" }}>
            <FlatList data={documents} renderItem={renderDocument} keyExtractor={(item) => item.id} scrollEnabled={false} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
