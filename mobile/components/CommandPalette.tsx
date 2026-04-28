import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";

interface PaletteItem {
  id: string;
  label: string;
  category: string;
  route: string;
  keywords?: string;
}

const ITEMS: PaletteItem[] = [
  // Statuts
  { id: "sarl", label: "Statuts SARL", category: "Statuts", route: "/(app)/generate/sarl", keywords: "société responsabilité limitée parts" },
  { id: "sarlu", label: "Statuts SARLU", category: "Statuts", route: "/(app)/generate/sarl", keywords: "unipersonnelle associé unique" },
  { id: "sas", label: "Statuts SAS", category: "Statuts", route: "/(app)/generate/sas", keywords: "société par actions simplifiée" },
  { id: "sasu", label: "Statuts SASU", category: "Statuts", route: "/(app)/generate/sasu", keywords: "actionnaire unique" },
  { id: "sa-ag", label: "Statuts SA (AG)", category: "Statuts", route: "/(app)/generate/sa-ag", keywords: "société anonyme assemblée générale" },
  { id: "sa-ca", label: "Statuts SA (CA)", category: "Statuts", route: "/(app)/generate/sa-ca", keywords: "conseil administration" },
  { id: "sa-uni", label: "Statuts SA Unipersonnelle", category: "Statuts", route: "/(app)/generate/sa-uni" },
  { id: "snc", label: "Statuts SNC", category: "Statuts", route: "/(app)/generate/snc", keywords: "société nom collectif" },
  { id: "scs", label: "Statuts SCS", category: "Statuts", route: "/(app)/generate/scs", keywords: "société commandite simple" },
  { id: "gie", label: "Convention GIE", category: "Statuts", route: "/(app)/generate/gie", keywords: "groupement intérêt économique" },
  { id: "ste-part", label: "Société en Participation", category: "Statuts", route: "/(app)/generate/ste-part" },

  // Vie sociale
  { id: "drc", label: "DRC (art. 73)", category: "Vie sociale", route: "/(app)/generate/drc", keywords: "déclaration régularité conformité" },
  { id: "rapport-gestion", label: "Rapport de gestion", category: "Vie sociale", route: "/(app)/generate/rapport-gestion", keywords: "annuel exercice" },
  { id: "dec-associe-unique-gerant", label: "Décisions associé unique (gérant)", category: "Vie sociale", route: "/(app)/generate/dec-associe-unique-gerant" },
  { id: "dec-associe-unique-non-gerant", label: "Décisions associé unique (non gérant)", category: "Vie sociale", route: "/(app)/generate/dec-associe-unique-non-gerant" },
  { id: "dec-actionnaire-unique-ag", label: "Décisions actionnaire unique AG", category: "Vie sociale", route: "/(app)/generate/dec-actionnaire-unique-ag" },
  { id: "dec-actionnaire-unique-non-ag", label: "Décisions actionnaire unique non AG", category: "Vie sociale", route: "/(app)/generate/dec-actionnaire-unique-non-ag" },
  { id: "pacte-actionnaires", label: "Pacte d'actionnaires", category: "Vie sociale", route: "/(app)/generate/pacte-actionnaires" },
  { id: "certificat-actions-nominatives", label: "Certificat actions nominatives", category: "Vie sociale", route: "/(app)/generate/certificat-actions-nominatives" },

  // Assemblées & convocations
  { id: "conv-ago", label: "Convocation AGO (SARL)", category: "Assemblées", route: "/(app)/generate/conv-ago" },
  { id: "conv-age", label: "Convocation AGE (SARL)", category: "Assemblées", route: "/(app)/generate/conv-age" },
  { id: "avis-convocation-ag-sa", label: "Avis convocation AG (SA)", category: "Assemblées", route: "/(app)/generate/avis-convocation-ag-sa" },
  { id: "convocation-actionnaires-sa", label: "Convocation actionnaires (SA)", category: "Assemblées", route: "/(app)/generate/convocation-actionnaires-sa" },
  { id: "convocation-cac", label: "Convocation CAC", category: "Assemblées", route: "/(app)/generate/convocation-cac" },
  { id: "convocation-ca", label: "Convocation CA", category: "Assemblées", route: "/(app)/generate/convocation-ca" },
  { id: "lettre-consultation-gerance", label: "Consultation gérance (SARL)", category: "Assemblées", route: "/(app)/generate/lettre-consultation-gerance" },
  { id: "pouvoir-ag", label: "Pouvoir AG (SARL)", category: "Assemblées", route: "/(app)/generate/pouvoir-ag" },
  { id: "pouvoir-ag-sa", label: "Pouvoir AG (SA)", category: "Assemblées", route: "/(app)/generate/pouvoir-ag-sa" },
  { id: "pouvoir-ca", label: "Pouvoir CA (SA)", category: "Assemblées", route: "/(app)/generate/pouvoir-ca" },
  { id: "feuille-presence", label: "Feuille de présence (SARL)", category: "Assemblées", route: "/(app)/generate/feuille-presence" },
  { id: "feuille-presence-ag-sa", label: "Feuille de présence AG (SA)", category: "Assemblées", route: "/(app)/generate/feuille-presence-ag-sa" },
  { id: "feuille-presence-ca", label: "Feuille de présence CA", category: "Assemblées", route: "/(app)/generate/feuille-presence-ca" },
  { id: "deroulement-ag-sarl", label: "Déroulement AG (SARL)", category: "Assemblées", route: "/(app)/generate/deroulement-ag-sarl" },
  { id: "deroulement-ag-sa", label: "Déroulement AG (SA)", category: "Assemblées", route: "/(app)/generate/deroulement-ag-sa" },

  // PV
  { id: "pv-ago", label: "PV AGO (SARL)", category: "Procès-verbaux", route: "/(app)/generate/pv-ago" },
  { id: "pv-age", label: "PV AGE (SARL)", category: "Procès-verbaux", route: "/(app)/generate/pv-age" },
  { id: "pv-ago-sa", label: "PV AGO (SA/SAS)", category: "Procès-verbaux", route: "/(app)/generate/pv-ago-sa" },
  { id: "pv-age-sa", label: "PV AGE (SA/SAS)", category: "Procès-verbaux", route: "/(app)/generate/pv-age-sa" },
  { id: "pv-reunion-ca", label: "PV réunion CA", category: "Procès-verbaux", route: "/(app)/generate/pv-reunion-ca" },
  { id: "pv-consultation-ecrite", label: "PV consultation écrite", category: "Procès-verbaux", route: "/(app)/generate/pv-consultation-ecrite" },
  { id: "pv-carence-ago", label: "PV carence AGO", category: "Procès-verbaux", route: "/(app)/generate/pv-carence-ago" },
  { id: "pv-carence-age", label: "PV carence AGE", category: "Procès-verbaux", route: "/(app)/generate/pv-carence-age" },

  // Capital
  { id: "acte-cession-parts", label: "Cession de parts (SARL)", category: "Capital", route: "/(app)/generate/acte-cession-parts" },
  { id: "acte-cession-actions", label: "Cession d'actions (SA)", category: "Capital", route: "/(app)/generate/acte-cession-actions" },
  { id: "bulletin-souscription-constitution", label: "Bulletin souscription (constitution)", category: "Capital", route: "/(app)/generate/bulletin-souscription-constitution" },
  { id: "bulletin-souscription-augmentation", label: "Bulletin souscription (augmentation)", category: "Capital", route: "/(app)/generate/bulletin-souscription-augmentation" },
  { id: "renonciation-droits-souscription", label: "Renonciation droits souscription", category: "Capital", route: "/(app)/generate/renonciation-droits-souscription" },
  { id: "lettre-appel-fonds", label: "Lettre appel de fonds", category: "Capital", route: "/(app)/generate/lettre-appel-fonds" },
  { id: "mise-en-demeure-defaillant", label: "Mise en demeure défaillant", category: "Capital", route: "/(app)/generate/mise-en-demeure-defaillant" },
  { id: "requete-designation-cac", label: "Requête désignation CAC", category: "Capital", route: "/(app)/generate/requete-designation-cac" },

  // Conventions réglementées
  { id: "avis-cac-conventions-sarl", label: "Avis CAC conventions (SARL)", category: "Conventions", route: "/(app)/generate/avis-cac-conventions-sarl" },
  { id: "avis-cac-conventions-sa", label: "Avis CAC conventions (SA)", category: "Conventions", route: "/(app)/generate/avis-cac-conventions-sa" },
  { id: "lettre-info-ca-conventions", label: "Lettre info CA conventions", category: "Conventions", route: "/(app)/generate/lettre-info-ca-conventions" },

  // Dissolution & fusion
  { id: "pv-ca-dissolution", label: "PV CA dissolution", category: "Dissolution", route: "/(app)/generate/pv-ca-dissolution" },
  { id: "pv-age-dissolution", label: "PV AGE dissolution", category: "Dissolution", route: "/(app)/generate/pv-age-dissolution" },
  { id: "rapport-ca-dissolution", label: "Rapport CA dissolution", category: "Dissolution", route: "/(app)/generate/rapport-ca-dissolution" },
  { id: "projet-resolutions-dissolution", label: "Projet résolutions dissolution", category: "Dissolution", route: "/(app)/generate/projet-resolutions-dissolution" },
  { id: "pv-dissolution-liquidation", label: "PV 1ère AG liquidateur", category: "Dissolution", route: "/(app)/generate/pv-dissolution-liquidation" },
  { id: "publication-nomination-liquidateur", label: "Publication nomination liquidateur", category: "Dissolution", route: "/(app)/generate/publication-nomination-liquidateur" },
  { id: "lettre-notification-representant", label: "Notification représentant permanent", category: "Dissolution", route: "/(app)/generate/lettre-notification-representant" },
  { id: "projet-fusion", label: "Projet de fusion", category: "Fusion", route: "/(app)/generate/projet-fusion" },
  { id: "projet-fusion-absorbee-absorbante", label: "Fusion absorbée/absorbante", category: "Fusion", route: "/(app)/generate/projet-fusion-absorbee-absorbante" },
  { id: "projet-fusion-participation", label: "Fusion avec participation", category: "Fusion", route: "/(app)/generate/projet-fusion-participation" },
  { id: "projet-fusion-societe-nouvelle", label: "Fusion par société nouvelle", category: "Fusion", route: "/(app)/generate/projet-fusion-societe-nouvelle" },
  { id: "requete-prorogation-ago", label: "Requête prorogation AGO", category: "Fusion", route: "/(app)/generate/requete-prorogation-ago" },

  // Workflows guidés
  { id: "_wf-creer-societe", label: "Créer une société de A à Z", category: "Workflow guidé", route: "/(app)/workflows/creer-societe", keywords: "constitution statuts drc parcours guide" },

  // Navigation
  { id: "_nav-dashboard", label: "Tableau de bord", category: "Navigation", route: "/(app)" },
  { id: "_nav-chat", label: "Assistant IA", category: "Navigation", route: "/(app)/chat", keywords: "ia ohada questions" },
  { id: "_nav-profil", label: "Profil", category: "Navigation", route: "/(app)/profil" },
  { id: "_nav-templates", label: "Tous les modèles", category: "Navigation", route: "/(app)/generate" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
}

export function CommandPalette({ visible, onClose }: CommandPaletteProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [visible]);

  const results = useMemo(() => {
    if (!query.trim()) return ITEMS.slice(0, 8);
    const q = normalize(query);
    return ITEMS.filter(item =>
      normalize(item.label).includes(q) ||
      normalize(item.category).includes(q) ||
      (item.keywords && normalize(item.keywords).includes(q))
    ).slice(0, 12);
  }, [query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIndex];
        if (target) {
          onClose();
          router.navigate(target.route as never);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, results, activeIndex, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(15, 42, 66, 0.5)", justifyContent: "flex-start", paddingTop: 100, paddingHorizontal: 20 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{ maxWidth: 640, width: "100%", alignSelf: "center", backgroundColor: colors.card, borderRadius: 12, overflow: "hidden", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24 }}
        >
          {/* Search input */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un document, un modèle, une action..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.text, ...(Platform.OS === "web" ? { outlineStyle: "none" } as never : {}) }}
            />
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: colors.background }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted }}>Esc</Text>
            </TouchableOpacity>
          </View>

          {/* Results */}
          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
            {results.length === 0 ? (
              <View style={{ padding: 32, alignItems: "center" }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted }}>Aucun résultat</Text>
              </View>
            ) : (
              results.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => { onClose(); router.navigate(item.route as never); }}
                    onPressIn={() => setActiveIndex(i)}
                    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, gap: 14, backgroundColor: isActive ? colors.background : "transparent" }}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#FDF8EE", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="document-text-outline" size={16} color="#D4A843" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 14, color: colors.text }}>{item.label}</Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{item.category}</Text>
                    </View>
                    {isActive && Platform.OS === "web" && (
                      <Ionicons name="return-down-back" size={16} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer with shortcuts */}
          {Platform.OS === "web" && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 18, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, backgroundColor: colors.card, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 1, borderColor: colors.border }}>↑↓</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>Naviguer</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, backgroundColor: colors.card, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 1, borderColor: colors.border }}>↵</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>Ouvrir</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, backgroundColor: colors.card, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 1, borderColor: colors.border }}>Esc</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>Fermer</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
