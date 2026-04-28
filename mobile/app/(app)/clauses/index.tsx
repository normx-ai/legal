import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { CLAUSES, CLAUSE_CATEGORIES, CLAUSE_AU_LABELS, type Clause } from "@/lib/clauses/library";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function copyToClipboard(text: string): boolean {
  if (Platform.OS !== "web") return false;
  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export default function ClausesLibraryScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [activeForme, setActiveForme] = useState<"Toutes" | "SARL" | "SAS" | "SA" | "SNC">("Toutes");
  const [openClauseId, setOpenClauseId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = CLAUSES;
    if (activeCategory !== "Toutes") {
      list = list.filter(c => c.category === activeCategory);
    }
    if (activeForme !== "Toutes") {
      list = list.filter(c => c.formes.includes(activeForme) || c.formes.includes("Toutes"));
    }
    if (query.trim()) {
      const q = normalize(query);
      list = list.filter(c =>
        normalize(c.title).includes(q) ||
        normalize(c.description).includes(q) ||
        normalize(c.category).includes(q) ||
        normalize(c.text).includes(q)
      );
    }
    return list;
  }, [query, activeCategory, activeForme]);

  const handleCopy = (clause: Clause) => {
    if (copyToClipboard(clause.text)) {
      setCopiedId(clause.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f3f4f6" }} contentContainerStyle={{ padding: 32, maxWidth: 1100, alignSelf: "center", width: "100%" }}>
      {/* Breadcrumb */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Tableau de bord</Text>
        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text }}>Clauses-types OHADA</Text>
      </View>

      <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: colors.text, marginBottom: 6 }}>
        Bibliothèque de clauses-types OHADA
      </Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 28 }}>
        {CLAUSES.length} clauses prêtes à intégrer dans vos statuts ou pactes — classées par Acte Uniforme et forme juridique.
      </Text>

      {/* Filtres */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            flex: 1,
            minWidth: 240,
          }}
        >
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher dans le texte des clauses..."
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, ...(Platform.OS === "web" ? { outlineStyle: "none" } as never : {}) }}
          />
        </View>
      </View>

      {/* Pills catégories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} style={{ marginBottom: 8 }}>
        {CLAUSE_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isActive ? colors.headerBg : colors.card,
                borderWidth: 1,
                borderColor: isActive ? colors.headerBg : colors.border,
              }}
            >
              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: isActive ? "#ffffff" : colors.text }}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pills formes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} style={{ marginBottom: 24 }}>
        {(["Toutes", "SARL", "SAS", "SA", "SNC"] as const).map(forme => {
          const isActive = activeForme === forme;
          return (
            <TouchableOpacity
              key={forme}
              onPress={() => setActiveForme(forme)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isActive ? colors.primary : colors.card,
                borderWidth: 1,
                borderColor: isActive ? colors.primary : colors.border,
              }}
            >
              <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: isActive ? "#ffffff" : colors.textSecondary }}>
                {forme}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <View style={{ padding: 60, alignItems: "center", backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search-outline" size={36} color={colors.textMuted} />
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginTop: 12 }}>
            Aucune clause ne correspond aux filtres
          </Text>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          {filtered.map(clause => {
            const isOpen = openClauseId === clause.id;
            const isCopied = copiedId === clause.id;
            return (
              <View
                key={clause.id}
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: isOpen ? colors.primary : colors.border,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <TouchableOpacity
                  onPress={() => setOpenClauseId(isOpen ? null : clause.id)}
                  style={{ padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FDF8EE", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="bookmark-outline" size={18} color="#D4A843" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.text }}>
                        {clause.title}
                      </Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.background, borderRadius: 4 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.textSecondary, letterSpacing: 0.3 }}>
                          {clause.au} · {clause.articles}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                      {clause.description}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                      {clause.formes.map(f => (
                        <View key={f} style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3, backgroundColor: "rgba(15, 42, 66, 0.08)" }}>
                          <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.headerBg }}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Texte de la clause */}
                {isOpen && (
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: 18, backgroundColor: colors.background }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 12, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Texte de la clause
                      </Text>
                      {Platform.OS === "web" && (
                        <TouchableOpacity
                          onPress={() => handleCopy(clause)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: isCopied ? "#dcfce7" : colors.card,
                            borderWidth: 1,
                            borderColor: isCopied ? "#22c55e" : colors.border,
                            borderRadius: 6,
                          }}
                        >
                          <Ionicons
                            name={isCopied ? "checkmark" : "copy-outline"}
                            size={14}
                            color={isCopied ? "#15803d" : colors.text}
                          />
                          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: isCopied ? "#15803d" : colors.text }}>
                            {isCopied ? "Copié !" : "Copier"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
                      <Text style={{ fontFamily: "Times New Roman, Times, serif", fontSize: 13, color: colors.text, lineHeight: 22 }} selectable>
                        {clause.text}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 10, fontStyle: "italic" }}>
                      Source : Acte Uniforme {CLAUSE_AU_LABELS[clause.au]} ({clause.articles})
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 32 }}>
        {filtered.length} clause{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur {CLAUSES.length}
      </Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}
