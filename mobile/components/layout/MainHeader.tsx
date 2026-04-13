import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useAuthStore } from "@/lib/store/auth";

const NAV_TABS = [
  { key: "entreprise", label: "Entreprise", icon: "briefcase-outline" as const },
  { key: "travail", label: "Travail", icon: "people-outline" as const },
  { key: "immobilier", label: "Immobilier", icon: "home-outline" as const },
  { key: "famille", label: "Famille", icon: "heart-outline" as const },
];

interface MainHeaderProps {
  onTabPress?: (tab: string) => void;
  activeTab?: string;
  compact?: boolean;
}

export function MainHeader({ onTabPress, activeTab, compact }: MainHeaderProps) {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();

  return (
    <View style={{ backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
      {/* Logo + user */}
      <View style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 24, paddingTop: compact ? 8 : 50, paddingBottom: compact ? 6 : 10,
      }}>
        <TouchableOpacity onPress={() => router.navigate("/(app)")} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image
            source={require("@/assets/logo-horizontal.png")}
            style={{ width: 130, height: 26, resizeMode: "contain" }}
          />
          <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 15, color: colors.headerBg }}>Legal</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>{user?.prenom} {user?.nom}</Text>
          <TouchableOpacity onPress={logout} style={{ padding: 4 }}>
            <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row" }}>
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  if (onTabPress) onTabPress(tab.key);
                  else router.navigate("/(app)");
                }}
                style={{
                  paddingHorizontal: 18, paddingVertical: 12,
                  borderBottomWidth: 3,
                  borderBottomColor: isActive ? colors.primary : "transparent",
                  flexDirection: "row", alignItems: "center", gap: 6,
                }}
              >
                <Ionicons name={tab.icon} size={15} color={isActive ? colors.primary : colors.textMuted} />
                <Text style={{
                  fontFamily: isActive ? fonts.bold : fonts.medium,
                  fontWeight: isActive ? fontWeights.bold : fontWeights.medium,
                  fontSize: 14,
                  color: isActive ? colors.headerBg : colors.textSecondary,
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
