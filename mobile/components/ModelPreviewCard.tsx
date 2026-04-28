import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";

interface PreviewLine {
  text: string;
  bold?: boolean;
  center?: boolean;
  size?: "xs" | "sm" | "md";
}

interface ModelPreviewCardProps {
  title: string;
  subtitle?: string;
  /** Quelques lignes représentatives du document */
  previewLines: PreviewLine[];
  /** Référence OHADA (ex: AUSCGIE art. 309) */
  reference?: string;
  /** Tag forme juridique (SARL / SAS / SA) */
  forme?: string;
  /** Couleur d'accent par catégorie */
  accentColor?: string;
  onPress?: () => void;
  width?: number;
}

const fontSize = (size?: string) => {
  switch (size) {
    case "md": return 9;
    case "sm": return 7.5;
    default: return 6.5;
  }
};

export function ModelPreviewCard({
  title,
  subtitle,
  previewLines,
  reference,
  forme,
  accentColor,
  onPress,
  width = 260,
}: ModelPreviewCardProps) {
  const { colors } = useTheme();
  const accent = accentColor || colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Mini page A4 simulée */}
      <View
        style={{
          height: 150,
          backgroundColor: "#f8fafc",
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sheet en arriere plan */}
        <View
          style={{
            position: "absolute" as never,
            inset: 0 as never,
            top: 8,
            left: 12,
            right: 12,
            bottom: -4,
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
          }}
        >
          {previewLines.slice(0, 8).map((line, i) => (
            <Text
              key={i}
              numberOfLines={1}
              style={{
                fontFamily: "Times New Roman, Times, serif",
                fontWeight: line.bold ? "bold" : "normal",
                fontSize: fontSize(line.size),
                color: "#1f2937",
                textAlign: line.center ? "center" : "left",
                marginTop: i === 0 ? 0 : 2,
                lineHeight: fontSize(line.size) * 1.4,
              }}
            >
              {line.text}
            </Text>
          ))}
        </View>

        {/* Tag forme juridique */}
        {forme && (
          <View
            style={{
              position: "absolute" as never,
              top: 8,
              right: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              backgroundColor: accent,
              borderRadius: 4,
              zIndex: 2,
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 9, color: "#ffffff", letterSpacing: 0.3 }}>
              {forme}
            </Text>
          </View>
        )}
      </View>

      {/* Métadonnées */}
      <View style={{ padding: 14 }}>
        <Text
          style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: colors.text, marginBottom: 4 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginBottom: 6 }} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
        {reference && (
          <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, fontStyle: "italic", marginBottom: 8 }}>
            Réf. {reference}
          </Text>
        )}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="document-text-outline" size={12} color={colors.textMuted} />
            <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>DOCX + PDF</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 12, color: accent }}>Générer</Text>
            <Ionicons name="arrow-forward" size={12} color={accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
