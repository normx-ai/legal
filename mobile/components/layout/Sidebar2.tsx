import React, { useState } from "react";
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
  // Batch 1 - 12 documents
  "pouvoir-ca": "/(app)/generate/pouvoir-ca",
  "avis-convocation-ag-sa": "/(app)/generate/avis-convocation-ag-sa",
  "convocation-actionnaires-sa": "/(app)/generate/convocation-actionnaires-sa",
  "lettre-info-ca-conventions": "/(app)/generate/lettre-info-ca-conventions",
  "avis-cac-conventions-sa": "/(app)/generate/avis-cac-conventions-sa",
  "avis-cac-conventions-sarl": "/(app)/generate/avis-cac-conventions-sarl",
  "feuille-presence-ca": "/(app)/generate/feuille-presence-ca",
  "lettre-consultation-gerance": "/(app)/generate/lettre-consultation-gerance",
  "pv-consultation-ecrite": "/(app)/generate/pv-consultation-ecrite",
  "dec-associe-unique-gerant": "/(app)/generate/dec-associe-unique-gerant",
  "dec-associe-unique-non-gerant": "/(app)/generate/dec-associe-unique-non-gerant",
  "pv-reunion-ca": "/(app)/generate/pv-reunion-ca",
  // Batch 2 - 23 documents
  "acte-cession-parts": "/(app)/generate/acte-cession-parts",
  "bulletin-souscription-augmentation": "/(app)/generate/bulletin-souscription-augmentation",
  "bulletin-souscription-constitution": "/(app)/generate/bulletin-souscription-constitution",
  "feuille-presence-ag-sa": "/(app)/generate/feuille-presence-ag-sa",
  "pouvoir-ag-sa": "/(app)/generate/pouvoir-ag-sa",
  "lettre-appel-fonds": "/(app)/generate/lettre-appel-fonds",
  "mise-en-demeure-defaillant": "/(app)/generate/mise-en-demeure-defaillant",
  "pv-carence-ago": "/(app)/generate/pv-carence-ago",
  "pv-carence-age": "/(app)/generate/pv-carence-age",
  "renonciation-droits-souscription": "/(app)/generate/renonciation-droits-souscription",
  "requete-designation-cac": "/(app)/generate/requete-designation-cac",
  "pacte-actionnaires": "/(app)/generate/pacte-actionnaires",
  "dec-actionnaire-unique-ag": "/(app)/generate/dec-actionnaire-unique-ag",
  "dec-actionnaire-unique-non-ag": "/(app)/generate/dec-actionnaire-unique-non-ag",
  "pv-ago-sa": "/(app)/generate/pv-ago-sa",
  "pv-age-sa": "/(app)/generate/pv-age-sa",
  "pv-dissolution-liquidation": "/(app)/generate/pv-dissolution-liquidation",
  "rapport-ca-dissolution": "/(app)/generate/rapport-ca-dissolution",
  "pv-ca-dissolution": "/(app)/generate/pv-ca-dissolution",
  "projet-resolutions-dissolution": "/(app)/generate/projet-resolutions-dissolution",
  "pv-age-dissolution": "/(app)/generate/pv-age-dissolution",
  "publication-nomination-liquidateur": "/(app)/generate/publication-nomination-liquidateur",
  "projet-fusion": "/(app)/generate/projet-fusion",
};

// ── Sidebar 2 data by section ──
const SIDEBAR2_DATA: Record<string, SubSection[]> = {
  entreprise: [
    {
      title: "CRÉEZ VOTRE ENTREPRISE",
      items: [
        { id: "sarl", label: "Statuts SARL", available: true },
        { id: "sarlu", label: "Statuts SARLU", available: true },
        { id: "sas", label: "Statuts SAS", available: true },
        { id: "sasu", label: "Statuts SASU", available: true },
        { id: "sa-ag", label: "Statuts SA (AG)", available: true },
        { id: "sa-ca", label: "Statuts SA (CA)", available: true },
        { id: "sa-uni", label: "Statuts SA Uni.", available: true },
        { id: "gie", label: "Convention GIE", available: true },
        { id: "ste-part", label: "Sté en Participation", available: true },
        { id: "drc", label: "DRC (art. 73)", available: true },
        { id: "bulletin-souscription-constitution", label: "Bulletin souscription (constitution)", available: true },
      ],
    },
    {
      title: "GÉREZ VOTRE ENTREPRISE",
      items: [
        { id: "dec-associe-unique-gerant", label: "Décisions associé unique gérant", available: true },
        { id: "dec-associe-unique-non-gerant", label: "Décisions associé unique non gérant", available: true },
        { id: "dec-actionnaire-unique-ag", label: "Décisions actionnaire unique AG", available: true },
        { id: "dec-actionnaire-unique-non-ag", label: "Décisions actionnaire unique non AG", available: true },
        { id: "pv-ago-sa", label: "PV AGO (SA/SAS)", available: true },
        { id: "pv-age-sa", label: "PV AGE (SA/SAS)", available: true },
        { id: "pv-reunion-ca", label: "PV réunion CA (SA)", available: true },
        { id: "pv-consultation-ecrite", label: "PV consultation écrite (SARL)", available: true },
        { id: "pv-carence-ago", label: "PV carence AGO", available: true },
        { id: "pv-carence-age", label: "PV carence AGE", available: true },
        { id: "acte-cession-parts", label: "Cession de parts (SARL)", available: true },
        { id: "pacte-actionnaires", label: "Pacte d'actionnaires", available: true },
      ],
    },
    {
      title: "CONVOCATIONS & ASSEMBLÉES",
      items: [
        { id: "avis-convocation-ag-sa", label: "Avis convocation AG (SA)", available: true },
        { id: "convocation-actionnaires-sa", label: "Convocation actionnaires (SA)", available: true },
        { id: "lettre-consultation-gerance", label: "Consultation gérance (SARL)", available: true },
        { id: "pouvoir-ca", label: "Pouvoir CA (SA)", available: true },
        { id: "pouvoir-ag-sa", label: "Pouvoir AG (SA)", available: true },
        { id: "feuille-presence-ca", label: "Feuille présence CA", available: true },
        { id: "feuille-presence-ag-sa", label: "Feuille présence AG (SA)", available: true },
      ],
    },
    {
      title: "CONVENTIONS RÉGLEMENTÉES",
      items: [
        { id: "avis-cac-conventions-sa", label: "Avis CAC conventions (SA)", available: true },
        { id: "avis-cac-conventions-sarl", label: "Avis CAC conventions (SARL)", available: true },
        { id: "lettre-info-ca-conventions", label: "Lettre info CA conventions", available: true },
      ],
    },
    {
      title: "CAPITAL & SOUSCRIPTION",
      items: [
        { id: "bulletin-souscription-augmentation", label: "Bulletin souscription (augmentation)", available: true },
        { id: "renonciation-droits-souscription", label: "Renonciation droits souscription", available: true },
        { id: "lettre-appel-fonds", label: "Lettre appel de fonds", available: true },
        { id: "mise-en-demeure-defaillant", label: "Mise en demeure défaillant", available: true },
      ],
    },
    {
      title: "DISSOLUTION & LIQUIDATION",
      items: [
        { id: "pv-ca-dissolution", label: "PV CA dissolution", available: true },
        { id: "rapport-ca-dissolution", label: "Rapport CA dissolution", available: true },
        { id: "projet-resolutions-dissolution", label: "Projet résolutions dissolution", available: true },
        { id: "pv-age-dissolution", label: "PV AGE dissolution", available: true },
        { id: "pv-dissolution-liquidation", label: "PV 1ère AG liquidateur", available: true },
        { id: "publication-nomination-liquidateur", label: "Publication liquidateur", available: true },
      ],
    },
    {
      title: "FUSION & OPÉRATIONS",
      items: [
        { id: "projet-fusion", label: "Projet de fusion (SA)", available: true },
        { id: "requete-designation-cac", label: "Requête commissaire apports", available: true },
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
  // Première section ouverte par défaut
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

  if (!data) return null;

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

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
        {data.map((group, gIdx) => {
          const isOpen = !!openSections[gIdx];
          return (
            <View key={gIdx} style={{ paddingHorizontal: 16, marginBottom: 4 }}>
              {/* Section header - clickable toggle */}
              <TouchableOpacity
                onPress={() => toggleSection(gIdx)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  marginTop: gIdx > 0 ? 2 : 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.semiBold,
                    fontWeight: fontWeights.semiBold,
                    fontSize: 10,
                    color: isOpen ? "#374151" : "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    flex: 1,
                  }}
                >
                  {group.title}
                </Text>
                <Ionicons
                  name={isOpen ? "chevron-down" : "chevron-forward"}
                  size={14}
                  color={isOpen ? "#374151" : "#9ca3af"}
                />
              </TouchableOpacity>

              {/* Items - visible only when open */}
              {isOpen && group.items.map((item) => {
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
          );
        })}
      </ScrollView>
    </View>
  );
}

export { SIDEBAR2_DATA, ROUTES };
