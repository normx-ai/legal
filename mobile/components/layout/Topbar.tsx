import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useAuthStore } from "@/lib/store/auth";

export function Topbar() {
  const { user, logout } = useAuthStore();

  return (
    <View
      style={{
        height: 54,
        backgroundColor: "#1A3A5C",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        // Pas de position:fixed — le conteneur AppLayout gère le 100vh
      }}
    >
      {/* Logo — style Playfair Display comme normx */}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)")}
        style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}
      >
        <Text style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontWeight: "bold", fontSize: 26, color: "#D4A843", letterSpacing: -1 }}>
          NORMX
        </Text>
        <Text style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontWeight: "400", fontSize: 26, color: "#e8e6e1", letterSpacing: -1 }}>
          {" "}Legal
        </Text>
      </TouchableOpacity>

      {/* User info + logout */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={15} color="#ffffff" />
          </View>
          <Text
            style={{
              fontFamily: fonts.medium,
              fontWeight: fontWeights.medium,
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {user?.prenom} {user?.nom}
          </Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Ionicons name="log-out-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text
            style={{
              fontFamily: fonts.medium,
              fontWeight: fontWeights.medium,
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Quitter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
