import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useResponsive } from "@/lib/hooks/useResponsive";

export interface PreviewLine {
  text: string;
  bold?: boolean;
  center?: boolean;
  italic?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  spaceBefore?: boolean;
}

interface WizardLayoutProps {
  title: string;
  steps: string[];
  currentStep: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  isLastDataStep: boolean;
  isDownloadStep: boolean;
  isGenerating?: boolean;
  error?: string;
  previewLines: PreviewLine[];
  children: React.ReactNode;
}

export function WizardLayout({
  title, steps, currentStep, onBack, onPrev, onNext,
  isLastDataStep, isDownloadStep, isGenerating, error,
  previewLines, children,
}: WizardLayoutProps) {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const isDesktop = !isMobile && Platform.OS === "web";

  const fontSize = (size?: string) => {
    switch (size) {
      case "xl": return 24;
      case "lg": return 18;
      case "sm": return 13;
      default: return 15;
    }
  };

  const preview = (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      contentContainerStyle={{ padding: 32, paddingTop: 40 }}
    >
      {/* Simuler une page A4 */}
      <View style={{
        backgroundColor: "#ffffff",
        borderWidth: 1, borderColor: "#e5e7eb",
        padding: 40, minHeight: 600,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
      }}>
        {previewLines.map((line, i) => (
          <Text
            key={i}
            style={{
              fontFamily: "Times New Roman, Times, serif",
              fontWeight: line.bold ? "bold" : "normal",
              fontStyle: line.italic ? "italic" : "normal",
              fontSize: fontSize(line.size),
              color: line.text.startsWith("{") || line.text.includes("...") ? "#9ca3af" : "#1f2937",
              textAlign: line.center ? "center" : "justify",
              marginTop: line.spaceBefore ? 16 : 2,
              marginBottom: 2,
              lineHeight: fontSize(line.size) * 1.6,
            }}
          >
            {line.text}
          </Text>
        ))}
      </View>
    </ScrollView>
  );

  const form = (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header formulaire */}
      <View style={{ backgroundColor: colors.headerBg, paddingTop: isDesktop ? 20 : 50, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 19, color: "#ffffff" }}>{title}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
              Etape {currentStep + 1} / {steps.length} — {steps[currentStep]}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 3 }}>
          {steps.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= currentStep ? colors.primary : "rgba(255,255,255,0.2)" }} />
          ))}
        </View>
      </View>

      {/* Contenu formulaire */}
      <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {error ? (
          <View style={{ backgroundColor: "#fef2f2", padding: 14, marginBottom: 16, borderRadius: 6, borderLeftWidth: 4, borderLeftColor: colors.danger }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: "#991b1b" }}>{error}</Text>
          </View>
        ) : null}
        {children}
      </ScrollView>

      {/* Footer navigation */}
      {!isDownloadStep && (
        <View style={{
          flexDirection: "row", gap: 12, padding: 16,
          backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#e2e8f0",
        }}>
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={onPrev}
              style={{
                flex: 1, paddingVertical: 14, alignItems: "center",
                borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8,
              }}
            >
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: colors.text }}>Precedent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onNext}
            disabled={isGenerating}
            style={{
              flex: 1, paddingVertical: 14, alignItems: "center",
              backgroundColor: isGenerating ? colors.disabled : colors.primary, borderRadius: 8,
            }}
          >
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>
              {isGenerating ? "Generation..." : isLastDataStep ? "Generer le document" : "Suivant"}
            </Text>

          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Mobile : formulaire seul
  if (!isDesktop) {
    return form;
  }

  // Desktop : split 65/35 (no MainHeader - Topbar is in AppLayout)
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ width: "65%", borderRightWidth: 1, borderRightColor: "#e2e8f0" }}>
        {/* En-tete apercu */}
        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.textSecondary }}>
            Apercu du document
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginLeft: "auto" }}>
            Mise a jour en temps reel
          </Text>
        </View>
        {preview}
      </View>
      <View style={{ width: "35%" }}>
        {form}
      </View>
    </View>
  );
}
