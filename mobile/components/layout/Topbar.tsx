import React from "react";
import { View, Text, TouchableOpacity, Platform, Image } from "react-native";
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
      {/* Logo */}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)")}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <Image
          source={require("@/assets/logo-horizontal.png")}
          style={{ width: 140, height: 28, resizeMode: "contain" }}
        />
        <Text style={{ fontFamily: "'Inter', sans-serif", fontWeight: "400", fontSize: 18, color: "#e8e6e1", letterSpacing: -0.5 }}>
          Legal
        </Text>
      </TouchableOpacity>

      {/* User info + profil */}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)/profil" as any)}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#D4A843",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 13, color: "#0F2A42" }}>
            {(user?.prenom?.[0] || "").toUpperCase()}{(user?.nom?.[0] || "").toUpperCase()}
          </Text>
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
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </View>
  );
}
