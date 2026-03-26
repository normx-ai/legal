import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";

export type SidebarItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hasArrow?: boolean;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "accueil", label: "Accueil", icon: "home-outline" },
  { key: "entreprise", label: "Entreprise", icon: "briefcase-outline", hasArrow: true },
  { key: "travail", label: "Travail", icon: "people-outline", hasArrow: true },
  { key: "immobilier", label: "Immobilier", icon: "home-outline", hasArrow: true },
  { key: "famille", label: "Famille", icon: "heart-outline", hasArrow: true },
  { key: "documents", label: "Mes documents", icon: "document-text-outline" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionPress: (key: string) => void;
}

export function Sidebar({ collapsed, onToggle, activeSection, onSectionPress }: SidebarProps) {
  const width = collapsed ? 56 : 220;

  return (
    <View
      style={{
        width,
        backgroundColor: "#ffffff",
        borderRightWidth: 1,
        borderRightColor: "#e5e7eb",
        justifyContent: "space-between",
      }}
    >
      <ScrollView style={{ flex: 1, paddingTop: 12 }}>
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSectionPress(item.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 11,
                paddingHorizontal: collapsed ? 16 : 16,
                marginHorizontal: 8,
                marginVertical: 2,
                borderRadius: 8,
                backgroundColor: isActive ? "#FDF8EE" : "transparent",
                gap: collapsed ? 0 : 12,
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? "#D4A843" : "#374151"}
              />
              {!collapsed && (
                <Text
                  style={{
                    flex: 1,
                    fontFamily: isActive ? fonts.semiBold : fonts.medium,
                    fontWeight: isActive ? fontWeights.semiBold : fontWeights.medium,
                    fontSize: 14,
                    color: isActive ? "#D4A843" : "#374151",
                  }}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              )}
              {!collapsed && item.hasArrow && (
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={isActive ? "#D4A843" : "#9ca3af"}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom section: toggle + branding */}
      <View style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingVertical: 12, alignItems: "center" }}>
        {/* Toggle button */}
        <TouchableOpacity
          onPress={onToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#D4A843",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: collapsed ? 0 : 10,
          }}
        >
          <Ionicons
            name={collapsed ? "chevron-forward" : "chevron-back"}
            size={16}
            color="#ffffff"
          />
        </TouchableOpacity>

        {!collapsed && (
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center" }}>
            <Text style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontWeight: "bold", fontSize: 22, color: "#D4A843" }}>
              N
            </Text>
            <Text style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontWeight: "bold", fontSize: 16, color: "#374151" }}>
              ormX
            </Text>
            <Text style={{ fontFamily: "Georgia, 'Playfair Display', serif", fontWeight: "bold", fontSize: 16, color: "#374151" }}>
              {" "}Legal
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export { SIDEBAR_ITEMS };
