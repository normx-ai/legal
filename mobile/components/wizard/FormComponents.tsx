import React from "react";
import { View, Text, TouchableOpacity, TextInput, Switch } from "react-native";
import { fonts, fontWeights } from "@/lib/theme/fonts";

export function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: "default" | "numeric"; colors: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 16, color: colors.text, marginBottom: 7 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted}
        multiline={multiline} keyboardType={keyboardType}
        style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, padding: 14,
          fontFamily: fonts.regular, color: colors.text, fontSize: 17,
          minHeight: multiline ? 90 : undefined, textAlignVertical: multiline ? "top" : undefined }} />
    </View>
  );
}

export function Choice({ label, options, value, onChange, colors }: {
  label: string; options: { value: string; label: string }[]; value: string;
  onChange: (v: string) => void; colors: Record<string, string>;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 16, color: colors.text, marginBottom: 7 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)}
            style={{ flex: 1, minWidth: 80, padding: 14, backgroundColor: value === o.value ? colors.primary : colors.input,
              alignItems: "center", borderWidth: 1, borderColor: value === o.value ? colors.primary : colors.border }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: value === o.value ? "#fff" : colors.text }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function ToggleRow({ label, value, onToggle, colors }: {
  label: string; value: boolean; onToggle: (v: boolean) => void; colors: Record<string, string>;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
      <Text style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.text, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#e2e8f0", true: colors.primary }} />
    </View>
  );
}

export function SectionTitle({ title, colors }: { title: string; colors: Record<string, string> }) {
  return <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 18, color: colors.primary, marginBottom: 14, marginTop: 10 }}>{title}</Text>;
}
