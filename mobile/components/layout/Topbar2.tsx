import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { SIDEBAR2_DATA, ROUTES } from "./Sidebar2";

// ── Onglets principaux ──
const NAV_ITEMS = [
  { key: "accueil", label: "Accueil", icon: "home-outline" as const },
  { key: "entreprise", label: "Entreprise", icon: "briefcase-outline" as const, hasDropdown: true },
  { key: "travail", label: "Travail", icon: "people-outline" as const, hasDropdown: true },
  { key: "immobilier", label: "Immobilier", icon: "home-outline" as const, hasDropdown: true },
  { key: "famille", label: "Famille", icon: "heart-outline" as const, hasDropdown: true },
  { key: "documents", label: "Mes documents", icon: "document-text-outline" as const },
];

interface Topbar2Props {
  activeSection: string;
  onSectionPress: (key: string) => void;
  activeSubItem: string | null;
  onItemPress: (id: string) => void;
}

export function Topbar2({ activeSection, onSectionPress, activeSubItem, onItemPress }: Topbar2Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleNavPress = (key: string, hasDropdown?: boolean) => {
    if (hasDropdown) {
      setOpenDropdown(openDropdown === key ? null : key);
    } else {
      setOpenDropdown(null);
      onSectionPress(key);
      if (key === "accueil") router.navigate("/(app)");
      if (key === "documents") router.navigate("/(app)");
    }
  };

  const handleItemPress = (id: string) => {
    const route = ROUTES[id];
    if (route) {
      onItemPress(id);
      setOpenDropdown(null);
      router.navigate(route as any);
    }
  };

  const dropdownData = openDropdown ? SIDEBAR2_DATA[openDropdown] : null;

  return (
    <View style={{ zIndex: 100 }}>
      {/* ── Barre de navigation horizontale ── */}
      <View
        style={{
          height: 44,
          backgroundColor: "#ffffff",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          gap: 0,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.key || openDropdown === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleNavPress(item.key, item.hasDropdown)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 10,
                gap: 6,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? "#D4A843" : "transparent",
              }}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={isActive ? "#D4A843" : "#6b7280"}
              />
              <Text
                style={{
                  fontFamily: isActive ? fonts.semiBold : fonts.medium,
                  fontWeight: isActive ? fontWeights.semiBold : fontWeights.medium,
                  fontSize: 13,
                  color: isActive ? "#D4A843" : "#374151",
                }}
              >
                {item.label}
              </Text>
              {item.hasDropdown && (
                <Ionicons
                  name={openDropdown === item.key ? "chevron-up" : "chevron-down"}
                  size={12}
                  color={isActive ? "#D4A843" : "#9ca3af"}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Dropdown menu (s'affiche sous la barre) ── */}
      {dropdownData && (
        <View
          style={{
            position: "absolute" as any,
            top: 44,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            ...(Platform.OS === "web" ? { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } : {}),
            zIndex: 200,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 32,
            }}
          >
            {dropdownData.map((group, gIdx) => (
              <View key={gIdx} style={{ minWidth: 180 }}>
                {/* Titre de section */}
                <Text
                  style={{
                    fontFamily: fonts.semiBold,
                    fontWeight: fontWeights.semiBold,
                    fontSize: 10,
                    color: "#D4A843",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    marginBottom: 10,
                  }}
                >
                  {group.title}
                </Text>

                {/* Documents */}
                {group.items.map((item) => {
                  const isItemActive = activeSubItem === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => item.available && handleItemPress(item.id)}
                      disabled={!item.available}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        backgroundColor: isItemActive ? "#FDF8EE" : "transparent",
                        gap: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: item.available ? "#22c55e" : "#d1d5db",
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: isItemActive ? fonts.semiBold : fonts.regular,
                          fontWeight: isItemActive ? fontWeights.semiBold : fontWeights.regular,
                          fontSize: 13,
                          color: item.available
                            ? isItemActive ? "#92400e" : "#374151"
                            : "#9ca3af",
                        }}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      {!item.available && (
                        <Text style={{ fontFamily: fonts.regular, fontSize: 9, color: "#d1d5db" }}>
                          soon
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Bouton fermer */}
          <TouchableOpacity
            onPress={() => setOpenDropdown(null)}
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              padding: 4,
            }}
          >
            <Ionicons name="close" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Overlay pour fermer le dropdown au clic dehors ── */}
      {openDropdown && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpenDropdown(null)}
          style={{
            position: "absolute" as any,
            top: 44 + (dropdownData ? 250 : 0),
            left: 0,
            right: 0,
            bottom: -2000,
            zIndex: 99,
          }}
        />
      )}
    </View>
  );
}
