import { View, Text, TouchableOpacity, ScrollView, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme/ThemeContext";
import type { ThemeColors } from "@/lib/theme/colors";
import { useAuthStore } from "@/lib/store/auth";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import i18n from "@/lib/i18n";

// Colors are now sourced from useTheme() — see ProfilScreen and its sub-components

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ThemeColors }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingHorizontal: 4 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
        {children}
      </View>
    </View>
  );
}

function Row({ icon, label, value, onPress, danger, toggle, toggleValue, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !toggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: danger ? "rgba(239,68,68,0.1)" : `${colors.primary}12`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: danger ? colors.danger : colors.text }}>
        {label}
      </Text>
      {value && (
        <Text style={{ fontFamily: fonts.medium, fontWeight: fontWeights.medium, fontSize: 14, color: colors.textMuted, marginRight: 8 }}>
          {value}
        </Text>
      )}
      {toggle && (
        <TouchableOpacity
          onPress={onPress}
          style={{
            width: 48, height: 28, borderRadius: 14,
            backgroundColor: toggleValue ? colors.primary : colors.border,
            justifyContent: "center",
            paddingHorizontal: 2,
          }}
        >
          <View style={{
            width: 24, height: 24, borderRadius: 12,
            backgroundColor: "#fff",
            alignSelf: toggleValue ? "flex-end" : "flex-start",
            shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
          }} />
        </TouchableOpacity>
      )}
      {!toggle && onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfilScreen() {
  const { t } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const subscription = user?.subscription;

  const currentLang = i18n.language === "en" ? "English" : "Français";
  const toggleLang = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const planLabels: Record<string, string> = {
    trial: t("profil.planTrial"),
    gratuit: t("profil.planFree"),
    pro: t("profil.planPro"),
    entreprise: t("profil.planEnterprise"),
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: isMobile ? 16 : 32, maxWidth: 600, alignSelf: "center", width: "100%" }}>

      {/* Avatar + nom */}
      <View style={{ alignItems: "center", marginBottom: 32, paddingTop: 16 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: colors.headerBg,
          alignItems: "center", justifyContent: "center",
          marginBottom: 12,
        }}>
          <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 28, color: "#fff" }}>
            {(user?.prenom?.[0] || "").toUpperCase()}{(user?.nom?.[0] || "").toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontFamily: fonts.bold, fontWeight: fontWeights.bold, fontSize: 22, color: colors.text }}>
          {user?.prenom} {user?.nom}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 2 }}>
          {user?.email}
        </Text>
        {subscription && (
          <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 8 }}>
            <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 12, color: colors.primary }}>
              {planLabels[subscription.plan] || subscription.plan}
            </Text>
          </View>
        )}
      </View>

      {/* Compte */}
      <Section title={t("profil.account")} colors={colors}>
        <Row icon="person-outline" label={t("profil.name")} value={`${user?.prenom} ${user?.nom}`} colors={colors} />
        <Row icon="mail-outline" label={t("profil.email")} value={user?.email} colors={colors} />
        <Row icon="shield-checkmark-outline" label={t("profil.subscription")} value={planLabels[subscription?.plan || "trial"]} colors={colors} />
      </Section>

      {/* Apparence */}
      <Section title={t("profil.appearance")} colors={colors}>
        <Row
          icon={mode === "dark" ? "moon" : "sunny-outline"}
          label={t("profil.darkMode")}
          toggle
          toggleValue={mode === "dark"}
          onPress={toggleTheme}
          colors={colors}
        />
        <Row
          icon="language-outline"
          label={t("profil.language")}
          value={currentLang}
          onPress={toggleLang}
          colors={colors}
        />
      </Section>

      {/* Légal */}
      <Section title={t("profil.legal")} colors={colors}>
        <Row
          icon="document-text-outline"
          label={t("profil.terms")}
          onPress={() => { if (Platform.OS === "web") window.open("https://normx-ai.com/cgu.html", "_blank"); }}
          colors={colors}
        />
        <Row
          icon="lock-closed-outline"
          label={t("profil.privacy")}
          onPress={() => { if (Platform.OS === "web") window.open("https://normx-ai.com/confidentialite.html", "_blank"); }}
          colors={colors}
        />
        <Row
          icon="information-circle-outline"
          label={t("profil.legalNotices")}
          onPress={() => { if (Platform.OS === "web") window.open("https://normx-ai.com/mentions.html", "_blank"); }}
          colors={colors}
        />
      </Section>

      {/* Déconnexion */}
      <Section title="" colors={colors}>
        <Row icon="log-out-outline" label={t("profil.logout")} onPress={logout} danger colors={colors} />
      </Section>

      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 8, marginBottom: 32 }}>
        NORMX Legal v1.0 — © 2026 NORMX AI SAS
      </Text>
    </ScrollView>
  );
}
