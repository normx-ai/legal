import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";
import { OHADA_COUNTRIES, findCountry } from "@/lib/ohada/countries";
import { useOhadaStore } from "@/lib/ohada/store";

interface OhadaCountryPickerProps {
  /** Style "pill" (header) ou "row" (large) */
  variant?: "pill" | "row";
}

export function OhadaCountryPicker({ variant = "pill" }: OhadaCountryPickerProps) {
  const { colors } = useTheme();
  const { country, setCountry } = useOhadaStore();
  const [open, setOpen] = useState(false);
  const current = findCountry(country);

  const trigger = (
    <TouchableOpacity
      onPress={() => setOpen(true)}
      style={
        variant === "pill"
          ? {
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }
          : {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }
      }
    >
      <Text style={{ fontSize: 16 }}>{current?.flag || "🌍"}</Text>
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: variant === "pill" ? 12 : 13,
          color: variant === "pill" ? "rgba(255,255,255,0.85)" : colors.text,
        }}
      >
        {current?.name || "Tous les pays OHADA"}
      </Text>
      <Ionicons name="chevron-down" size={12} color={variant === "pill" ? "rgba(255,255,255,0.5)" : colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <>
      {trigger}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(15, 42, 66, 0.5)", justifyContent: "flex-start", paddingTop: 100, paddingHorizontal: 20 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              maxWidth: 480,
              width: "100%",
              alignSelf: "center",
              backgroundColor: colors.card,
              borderRadius: 12,
              overflow: "hidden",
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
            }}
          >
            <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text }}>
                Choisir une juridiction OHADA
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                Personnalise les modèles, références RCCM et calendriers fiscaux
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <TouchableOpacity
                onPress={() => { setCountry(null); setOpen(false); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: !country ? "#FDF8EE" : "transparent",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 22 }}>🌍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.text }}>Tous les pays OHADA</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>Pas de filtre</Text>
                </View>
                {!country && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>

              {OHADA_COUNTRIES.map((c) => {
                const active = country === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => { setCountry(c.code); setOpen(false); }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      backgroundColor: active ? "#FDF8EE" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{c.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text }}>{c.name}</Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>RCCM {c.rccmPrefix}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {Platform.OS === "web" && (
              <View style={{ paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                  Les modèles OHADA sont conformes dans les 17 États membres. Le pays sélectionné personnalise le RCCM, le tribunal compétent et les références fiscales.
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
