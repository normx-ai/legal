import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";

// ── Types ──
type SubItem = { id: string; label: string; available: boolean; route?: string };
type SubSection = { title: string; items: SubItem[] };

// ── Route mapping ──
const ROUTES: Record<string, string> = {
  sarl: "/(app)/generate/sarl",
  sarlu: "/(app)/generate/sarl",
  sas: "/(app)/generate/sas",
  sasu: "/(app)/generate/sasu",
  "sa-ag": "/(app)/generate/sa-ag",
  "sa-ca": "/(app)/generate/sa-ca",
  "sa-uni": "/(app)/generate/sa-uni",
  gie: "/(app)/generate/gie",
  "ste-part": "/(app)/generate/ste-part",
  drc: "/(app)/generate/drc",
};

// ── Sidebar 2 data by section ──
const SIDEBAR2_DATA: Record<string, SubSection[]> = {
  entreprise: [
    {
      title: "CREEZ VOTRE ENTREPRISE",
      items: [
        { id: "sarl", label: "Statuts SARL", available: true },
        { id: "sarlu", label: "Statuts SARLU", available: true },
        { id: "sas", label: "Statuts SAS", available: true },
        { id: "sasu", label: "Statuts SASU", available: true },
        { id: "sa-ag", label: "Statuts SA (AG)", available: true },
        { id: "sa-ca", label: "Statuts SA (CA)", available: true },
        { id: "sa-uni", label: "Statuts SA Uni.", available: true },
        { id: "gie", label: "Convention GIE", available: true },
        { id: "ste-part", label: "Ste en Participation", available: true },
      ],
    },
    {
      title: "GEREZ VOTRE ENTREPRISE",
      items: [
        { id: "drc", label: "DRC (art. 73)", available: true },
        { id: "pv-ago", label: "PV d'AGO", available: false },
        { id: "pv-age", label: "PV d'AGE", available: false },
        { id: "cession", label: "Cession de parts", available: false },
      ],
    },
    {
      title: "DISSOLUTION",
      items: [
        { id: "pv-dissolution", label: "PV de dissolution", available: false },
      ],
    },
  ],
  travail: [
    {
      title: "RECRUTEZ",
      items: [
        { id: "cdi", label: "Contrat CDI", available: false },
        { id: "cdd", label: "Contrat CDD", available: false },
        { id: "stage", label: "Convention de stage", available: false },
      ],
    },
    {
      title: "GEREZ VOTRE EQUIPE",
      items: [
        { id: "avenant", label: "Avenant", available: false },
        { id: "attestation", label: "Attestation de travail", available: false },
      ],
    },
  ],
  immobilier: [
    {
      title: "IMMOBILIER COMMERCIAL",
      items: [
        { id: "bail-com", label: "Bail commercial", available: false },
        { id: "bail-pro", label: "Bail professionnel", available: false },
        { id: "resil-bail", label: "Resiliation de bail", available: false },
      ],
    },
    {
      title: "PATRIMOINE RESIDENTIEL",
      items: [
        { id: "bail-hab", label: "Bail d'habitation", available: false },
        { id: "sci", label: "Statuts SCI", available: false },
        { id: "etat-lieux", label: "Etat des lieux", available: false },
        { id: "quittance", label: "Quittance de loyer", available: false },
      ],
    },
  ],
  famille: [
    {
      title: "SUCCESSION & PATRIMOINE",
      items: [
        { id: "testament", label: "Testament", available: false },
        { id: "donation", label: "Acte de donation", available: false },
        { id: "procuration", label: "Procuration", available: false },
        { id: "dette", label: "Reconnaissance de dette", available: false },
      ],
    },
    {
      title: "ASSOCIATIONS",
      items: [
        { id: "statuts-asso", label: "Statuts d'association", available: false },
        { id: "pv-asso", label: "PV d'AG association", available: false },
      ],
    },
  ],
};

interface Sidebar2Props {
  section: string;
  activeItem: string | null;
  onItemPress: (id: string) => void;
  onClose: () => void;
}

export function Sidebar2({ section, activeItem, onItemPress, onClose }: Sidebar2Props) {
  const data = SIDEBAR2_DATA[section];
  if (!data) return null;

  const handlePress = (item: SubItem) => {
    if (!item.available) return;
    const route = ROUTES[item.id];
    if (route) {
      onItemPress(item.id);
      router.navigate(route as any);
    }
  };

  return (
    <View
      style={{
        width: 240,
        backgroundColor: "#f9fafb",
        borderRightWidth: 1,
        borderRightColor: "#e5e7eb",
      }}
    >
      {/* Close button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.semiBold,
            fontWeight: fontWeights.semiBold,
            fontSize: 13,
            color: "#374151",
            textTransform: "capitalize",
          }}
        >
          {section}
        </Text>
        <TouchableOpacity onPress={onClose} style={{ padding: 2 }}>
          <Ionicons name="close" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {data.map((group, gIdx) => (
          <View key={gIdx} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            {/* Section header */}
            <Text
              style={{
                fontFamily: fonts.semiBold,
                fontWeight: fontWeights.semiBold,
                fontSize: 10,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                marginTop: gIdx > 0 ? 4 : 8,
              }}
            >
              {group.title}
            </Text>

            {/* Items */}
            {group.items.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handlePress(item)}
                  disabled={!item.available}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: isActive ? "#FAF0D8" : "transparent",
                    marginVertical: 1,
                    gap: 8,
                  }}
                >
                  {/* Status dot */}
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: item.available ? "#22c55e" : "#d1d5db",
                    }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: isActive ? fonts.semiBold : fonts.regular,
                      fontWeight: isActive ? fontWeights.semiBold : fontWeights.regular,
                      fontSize: 13,
                      color: item.available
                        ? isActive
                          ? "#92400e"
                          : "#374151"
                        : "#9ca3af",
                    }}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {!item.available && (
                    <Text
                      style={{
                        fontFamily: fonts.regular,
                        fontSize: 9,
                        color: "#d1d5db",
                        textTransform: "uppercase",
                      }}
                    >
                      soon
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export { SIDEBAR2_DATA, ROUTES };
