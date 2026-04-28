import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";
import { SIDEBAR2_DATA, ROUTES } from "./Sidebar2";

interface NavSection {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  /** Sections avec sous-items (utilise SIDEBAR2_DATA) */
  expandable?: boolean;
}

const NAV: NavSection[] = [
  { key: "accueil", label: "Tableau de bord", icon: "home-outline", route: "/(app)" },
  { key: "templates", label: "Bibliothèque", icon: "library-outline", route: "/(app)/templates" },
  { key: "clauses", label: "Clauses-types", icon: "bookmark-outline", route: "/(app)/clauses" },
  { key: "creer-societe", label: "Créer une société", icon: "rocket-outline", route: "/(app)/workflows/creer-societe" },
  { key: "creer", label: "Créer", icon: "add-circle-outline", expandable: true },
  { key: "gerer", label: "Gérer", icon: "settings-outline", expandable: true },
  { key: "convoquer", label: "Convoquer", icon: "megaphone-outline", expandable: true },
  { key: "capital", label: "Capital & Fusion", icon: "trending-up-outline", expandable: true },
  { key: "dissoudre", label: "Dissoudre", icon: "close-circle-outline", expandable: true },
  { key: "chat", label: "Assistant IA", icon: "chatbubbles-outline", route: "/(app)/chat" },
  { key: "profil", label: "Profil", icon: "person-circle-outline", route: "/(app)/profil" },
];

interface SidebarPersistentProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarPersistent({ collapsed, onToggleCollapse }: SidebarPersistentProps) {
  const { colors } = useTheme();
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isActive = (item: NavSection) => {
    if (!item.route) return false;
    if (item.route === "/(app)") return pathname === "/" || pathname === "/(app)";
    const target = item.route.replace("/(app)", "");
    return pathname?.startsWith(target);
  };

  const handleNavPress = (item: NavSection) => {
    if (item.expandable) {
      setExpandedSection(expandedSection === item.key ? null : item.key);
    } else if (item.route) {
      setExpandedSection(null);
      router.navigate(item.route as never);
    }
  };

  const handleSubItemPress = (id: string) => {
    const route = ROUTES[id];
    if (route) {
      setExpandedSection(null);
      router.navigate(route as never);
    }
  };

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <View
      style={{
        width: sidebarWidth,
        backgroundColor: "#0F2A42",
        borderRightWidth: 1,
        borderRightColor: "rgba(255,255,255,0.06)",
        flexDirection: "column",
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {NAV.map(item => {
          const active = isActive(item);
          const isExpanded = expandedSection === item.key;
          const data = item.expandable ? SIDEBAR2_DATA[item.key] : null;

          return (
            <View key={item.key} style={{ marginBottom: 2 }}>
              <TouchableOpacity
                onPress={() => handleNavPress(item)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: collapsed ? 0 : 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: active || isExpanded ? "rgba(212, 168, 67, 0.15)" : "transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active || isExpanded ? "#D4A843" : "rgba(255,255,255,0.65)"}
                />
                {!collapsed && (
                  <>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: active || isExpanded ? fonts.semiBold : fonts.medium,
                        fontWeight: active || isExpanded ? fontWeights.semiBold : fontWeights.medium,
                        fontSize: 13,
                        color: active || isExpanded ? "#ffffff" : "rgba(255,255,255,0.78)",
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.expandable && (
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={12}
                        color="rgba(255,255,255,0.4)"
                      />
                    )}
                  </>
                )}
              </TouchableOpacity>

              {/* Sous-sections */}
              {!collapsed && isExpanded && data && (
                <View style={{ paddingLeft: 12, paddingVertical: 6, gap: 12 }}>
                  {data.map((sub, sIdx) => (
                    <View key={sIdx}>
                      <Text
                        style={{
                          fontFamily: fonts.semiBold,
                          fontSize: 10,
                          color: "rgba(212, 168, 67, 0.85)",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          marginLeft: 12,
                          marginBottom: 4,
                        }}
                      >
                        {sub.title}
                      </Text>
                      {sub.items.map(it => (
                        <TouchableOpacity
                          key={it.id}
                          disabled={!it.available}
                          onPress={() => handleSubItemPress(it.id)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            opacity: it.available ? 1 : 0.4,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: fonts.regular,
                              fontSize: 12,
                              color: "rgba(255,255,255,0.78)",
                            }}
                            numberOfLines={1}
                          >
                            {it.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bouton collapse */}
      <TouchableOpacity
        onPress={onToggleCollapse}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.06)",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Ionicons
          name={collapsed ? "chevron-forward" : "chevron-back"}
          size={14}
          color="rgba(255,255,255,0.5)"
        />
        {!collapsed && (
          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Réduire
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
