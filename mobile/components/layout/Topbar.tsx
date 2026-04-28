import React from "react";
import { View, Text, TouchableOpacity, Platform, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useAuthStore } from "@/lib/store/auth";
import { OhadaCountryPicker } from "@/components/OhadaCountryPicker";

interface TopbarProps {
  onSearchClick?: () => void;
}

export function Topbar({ onSearchClick }: TopbarProps = {}) {
  const { user } = useAuthStore();
  const isMac = Platform.OS === "web" && typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

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

      {/* Pays OHADA + Recherche globale + User */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <OhadaCountryPicker variant="pill" />
        {onSearchClick && (
          <TouchableOpacity
            onPress={onSearchClick}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingLeft: 12,
              paddingRight: 8,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              minWidth: 240,
            }}
          >
            <Ionicons name="search" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              Rechercher un document...
            </Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}>
              {isMac ? "⌘K" : "Ctrl K"}
            </Text>
          </TouchableOpacity>
        )}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)/profil" as never)}
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
    </View>
  );
}
