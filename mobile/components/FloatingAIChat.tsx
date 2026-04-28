import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";

export function FloatingAIChat() {
  const { colors } = useTheme();
  const pathname = usePathname();

  if (Platform.OS !== "web") return null;
  if (pathname?.includes("/chat")) return null;
  if (pathname?.includes("/(auth)") || pathname === "/" || pathname?.startsWith("/auth")) return null;

  return (
    <TouchableOpacity
      onPress={() => router.navigate("/(app)/chat" as never)}
      activeOpacity={0.85}
      style={{
        position: "absolute" as never,
        bottom: 24,
        right: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: colors.headerBg,
        borderRadius: 999,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        zIndex: 50,
      }}
    >
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="sparkles" size={15} color="#ffffff" />
      </View>
      <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: "#ffffff" }}>
        Assistant IA
      </Text>
    </TouchableOpacity>
  );
}
