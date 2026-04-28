import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/lib/theme/fonts";
import { Field, Choice } from "./FormComponents";
import type { ActionnaireRow } from "@/types/legal";

export function ActionnaireCard({ a, i, onChange, onRemove, canRemove, withVoix, withMandataire, colors }: {
  a: ActionnaireRow;
  i: number;
  onChange: (i: number, patch: Partial<ActionnaireRow>) => void;
  onRemove: (i: number) => void;
  canRemove: boolean;
  withVoix?: boolean;
  withMandataire?: boolean;
  colors: Record<string, string>;
}) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, borderRadius: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: colors.text }}>Actionnaire {i + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={() => onRemove(i)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
      <Choice
        colors={colors}
        label="Civilité"
        options={[{ value: "Monsieur", label: "Monsieur" }, { value: "Madame", label: "Madame" }]}
        value={a.civilite}
        onChange={(v) => onChange(i, { civilite: v })}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field colors={colors} label="Nom" value={a.nom} onChangeText={(v) => onChange(i, { nom: v })} />
        </View>
        <View style={{ flex: 1 }}>
          <Field colors={colors} label="Prénom" value={a.prenom} onChangeText={(v) => onChange(i, { prenom: v })} />
        </View>
      </View>
      <Field colors={colors} label="Adresse" value={a.adresse} onChangeText={(v) => onChange(i, { adresse: v })} />
      <Field
        colors={colors}
        label="Nombre d'actions"
        value={a.nombre_actions ? String(a.nombre_actions) : ""}
        onChangeText={(v) => onChange(i, { nombre_actions: parseInt(v) || 0 })}
        keyboardType="numeric"
      />
      {withVoix && (
        <Field
          colors={colors}
          label="Nombre de voix"
          value={a.nombre_voix ? String(a.nombre_voix) : ""}
          onChangeText={(v) => onChange(i, { nombre_voix: parseInt(v) || 0 })}
          keyboardType="numeric"
        />
      )}
      {withMandataire && (
        <Field
          colors={colors}
          label="Mandataire"
          value={a.mandataire_nom || ""}
          onChangeText={(v) => onChange(i, { mandataire_nom: v })}
        />
      )}
    </View>
  );
}
