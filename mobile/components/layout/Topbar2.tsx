import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";
import { SIDEBAR2_DATA, ROUTES } from "./Sidebar2";

// ── Onglets principaux OHADA ──
const NAV_ITEMS = [
  { key: "accueil", label: "Accueil", icon: "home-outline" as const },
  { key: "creer", label: "Créer", icon: "add-circle-outline" as const, hasDropdown: true },
  { key: "gerer", label: "Gérer", icon: "settings-outline" as const, hasDropdown: true },
  { key: "convoquer", label: "Convoquer", icon: "megaphone-outline" as const, hasDropdown: true },
  { key: "capital", label: "Capital & Fusion", icon: "trending-up-outline" as const, hasDropdown: true },
  { key: "dissoudre", label: "Dissoudre", icon: "close-circle-outline" as const, hasDropdown: true },
  { key: "documents", label: "Mes documents", icon: "document-text-outline" as const },
  { key: "chat", label: "Assistant IA", icon: "chatbubbles-outline" as const },
];

interface Topbar2Props {
  activeSection: string;
  onSectionPress: (key: string) => void;
  activeSubItem: string | null;
  onItemPress: (id: string) => void;
}

export function Topbar2({ activeSection, onSectionPress, activeSubItem, onItemPress }: Topbar2Props) {
  const { colors } = useTheme();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleNavPress = (key: string, hasDropdown?: boolean) => {
    if (hasDropdown) {
      setOpenDropdown(openDropdown === key ? null : key);
    } else {
      setOpenDropdown(null);
      onSectionPress(key);
      if (key === "accueil") router.navigate("/(app)");
      if (key === "documents") router.navigate("/(app)");
      if (key === "chat") router.navigate("/(app)/chat" as never);
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
          backgroundColor: colors.card,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
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
                borderBottomColor: isActive ? colors.primary : "transparent",
              }}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={{
                  fontFamily: isActive ? fonts.semiBold : fonts.medium,
                  fontWeight: isActive ? fontWeights.semiBold : fontWeights.medium,
                  fontSize: 13,
                  color: isActive ? colors.primary : colors.text,
                }}
              >
                {item.label}
              </Text>
              {item.hasDropdown && (
                <Ionicons
                  name={openDropdown === item.key ? "chevron-up" : "chevron-down"}
                  size={12}
                  color={isActive ? colors.primary : colors.textMuted}
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
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
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
                    color: colors.primary,
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
                        backgroundColor: isItemActive ? colors.sidebarActive : "transparent",
                        gap: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: item.available ? colors.success : colors.disabled,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: isItemActive ? fonts.semiBold : fonts.regular,
                          fontWeight: isItemActive ? fontWeights.semiBold : fontWeights.regular,
                          fontSize: 13,
                          color: item.available
                            ? isItemActive ? "#92400e" : colors.text
                            : colors.textMuted,
                        }}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      {!item.available && (
                        <Text style={{ fontFamily: fonts.regular, fontSize: 9, color: colors.disabled }}>
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
            <Ionicons name="close" size={18} color={colors.textMuted} />
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
