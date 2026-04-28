import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { fonts } from "@/lib/theme/fonts";

export function AddButton({ label, onPress, colors }: {
  label: string;
  onPress: () => void;
  colors: Record<string, string>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.primary,
        borderRadius: 6,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontFamily: fonts.medium, color: colors.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}
