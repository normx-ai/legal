import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";

export function DownloadStep({ colors, generatedUrl, onDownload, onReset, title, subtitle }: {
  colors: Record<string, string>;
  generatedUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <View style={{ backgroundColor: "#ffffff", padding: 32, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 20, color: "#1f2937", textAlign: "center", marginBottom: 16 }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 16, color: "#1f2937", textAlign: "center", marginBottom: 8 }}>
            {subtitle}
          </Text>
        )}
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 16 }}>
          ··· Document complet dans le fichier DOCX ···
        </Text>
      </View>
      <View style={{ alignItems: "center", paddingBottom: 24 }}>
        {generatedUrl ? (
          <TouchableOpacity
            onPress={onDownload}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10, width: "100%", justifyContent: "center" }}
          >
            <Ionicons name="download-outline" size={22} color="#ffffff" />
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>
              Télécharger le DOCX
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: colors.success + "15", padding: 16, width: "100%", alignItems: "center" }}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 8 }}>Document généré</Text>
          </View>
        )}
        <TouchableOpacity onPress={onReset} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.primary }}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
