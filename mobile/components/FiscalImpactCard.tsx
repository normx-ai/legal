import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useTheme } from "@/lib/theme/ThemeContext";
import { type FiscalSummary, formatFCFA } from "@/lib/fiscal/cessions";
import { findCountry } from "@/lib/ohada/countries";

interface FiscalImpactCardProps {
  summary: FiscalSummary;
}

export function FiscalImpactCard({ summary }: FiscalImpactCardProps) {
  const { colors } = useTheme();
  const country = findCountry(summary.countryCode);

  return (
    <View
      style={{
        backgroundColor: "#FDF8EE",
        borderWidth: 1,
        borderColor: "rgba(212, 168, 67, 0.4)",
        borderRadius: 12,
        padding: 18,
        marginVertical: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#D4A843", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="calculator-outline" size={18} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 15, color: colors.text }}>
            Impact fiscal estimé
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary }}>
            Juridiction : {country?.flag} {country?.name || "OHADA"} · Base : {formatFCFA(summary.prixCession)}
          </Text>
        </View>
      </View>

      {/* Detail des impacts */}
      <View style={{ gap: 10, marginBottom: 14 }}>
        {summary.impacts.map((imp, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottomWidth: i < summary.impacts.length - 1 ? 1 : 0, borderBottomColor: "rgba(212, 168, 67, 0.2)" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text }}>
                {imp.label}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                {imp.rate > 0 ? `${imp.rate}% × ${formatFCFA(imp.base)} · ` : ""}{imp.reference}
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 14, color: colors.text, marginLeft: 12 }}>
              {formatFCFA(imp.amount)}
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 2, borderTopColor: "#D4A843" }}>
        <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 14, color: colors.text }}>
          Total estimé à régler
        </Text>
        <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 18, color: colors.headerBg }}>
          {formatFCFA(summary.totalDue)}
        </Text>
      </View>

      {/* Notes */}
      {summary.notes.length > 0 && (
        <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(212, 168, 67, 0.2)" }}>
          {summary.notes.map((note, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
              <Ionicons name="information-circle-outline" size={12} color={colors.textMuted} style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, lineHeight: 16 }}>
                {note}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, fontStyle: "italic", marginTop: 10 }}>
        Estimation indicative. Les barèmes peuvent évoluer (loi de finances annuelle). Confirmez auprès de votre conseil fiscal.
      </Text>
    </View>
  );
}
