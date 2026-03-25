import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme/ThemeContext";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import { useAuthStore } from "@/lib/store/auth";
import { authApi } from "@/lib/api/auth";
import { useResponsive } from "@/lib/hooks/useResponsive";

export default function AuthScreen() {
  const { colors } = useTheme();
  const { step, email, setEmail, setStep, login, setLoading } = useAuthStore();
  const { isMobile } = useResponsive();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [entrepriseNom, setEntrepriseNom] = useState("");

  const isRegister = step === "register";

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      if (data.user) {
        await login(data.user, data.token, data.refreshToken);
        router.replace("/(app)");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Erreur de connexion");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.register({ nom, prenom, email, password, entrepriseNom });
      if (data.user) {
        await login(data.user, data.token, data.refreshToken);
        router.replace("/(app)");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Erreur d'inscription");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 15,
    marginBottom: 12,
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#ffffff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flexDirection: isMobile ? "column" : "row", flex: 1, minHeight: "100%" as unknown as number }}>

          {/* ── Left: Hero ── */}
          <View style={{
            flex: isMobile ? 0 : 1,
            backgroundColor: colors.headerBg,
            padding: isMobile ? 40 : 60,
            justifyContent: "center",
            minHeight: isMobile ? 280 : undefined,
          }}>
            <View style={{ maxWidth: 480 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <View style={{ width: 40, height: 40, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="document-text" size={22} color="#fff" />
                </View>
                <Text style={{ fontFamily: fonts.heading, fontWeight: fontWeights.heading, fontSize: 24, color: "#ffffff" }}>
                  NORMX Legal
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: isMobile ? 24 : 32, color: "#ffffff", marginBottom: 16, lineHeight: isMobile ? 32 : 42 }}>
                Générez vos documents juridiques OHADA en quelques minutes
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 24, marginBottom: 32 }}>
                Statuts de société, PV, cessions de parts — conformes à l'Acte Uniforme OHADA et adaptés au droit congolais.
              </Text>

              {!isMobile && (
                <View style={{ gap: 16 }}>
                  {[
                    { icon: "checkmark-circle", text: "Conforme OHADA & droit congolais" },
                    { icon: "time", text: "Document prêt en 5 minutes" },
                    { icon: "download", text: "Téléchargement DOCX immédiat" },
                  ].map((item, i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Ionicons name={item.icon as "checkmark-circle"} size={20} color={colors.primary} />
                      <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: "rgba(255,255,255,0.9)" }}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Right: Form ── */}
          <View style={{
            flex: isMobile ? 1 : 1,
            justifyContent: "center",
            alignItems: "center",
            padding: isMobile ? 24 : 48,
          }}>
            <View style={{ width: "100%", maxWidth: 420 }}>
              <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 24, color: colors.text, marginBottom: 8 }}>
                {isRegister ? "Créer un compte" : "Se connecter"}
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 32 }}>
                {isRegister ? "Commencez à générer vos documents juridiques" : "Accédez à vos documents"}
              </Text>

              {isRegister && (
                <>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>Nom du cabinet / entreprise</Text>
                  <TextInput placeholder="Ex: Cabinet Juridique XYZ" placeholderTextColor={colors.textMuted} value={entrepriseNom} onChangeText={setEntrepriseNom} style={inputStyle} />

                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>Nom</Text>
                      <TextInput placeholder="Nom" placeholderTextColor={colors.textMuted} value={nom} onChangeText={setNom} style={inputStyle} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>Prénom</Text>
                      <TextInput placeholder="Prénom" placeholderTextColor={colors.textMuted} value={prenom} onChangeText={setPrenom} style={inputStyle} />
                    </View>
                  </View>
                </>
              )}

              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>Adresse email</Text>
              <TextInput placeholder="vous@exemple.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" style={inputStyle} />

              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>Mot de passe</Text>
              <TextInput placeholder="••••••••" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword}
                secureTextEntry style={{ ...inputStyle, marginBottom: 20 }} />

              {error ? (
                <View style={{ backgroundColor: "#fef2f2", padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: colors.danger }}>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.danger }}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity onPress={isRegister ? handleRegister : handleLogin}
                style={{ backgroundColor: colors.primary, padding: 16, alignItems: "center" }}>
                <Text style={{ fontFamily: fonts.semiBold, fontWeight: fontWeights.semiBold, fontSize: 16, color: "#ffffff" }}>
                  {isRegister ? "Créer mon compte" : "Se connecter"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep(isRegister ? "email" : "register")} style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary }}>
                  {isRegister ? "Déjà un compte ? " : "Pas encore de compte ? "}
                  <Text style={{ color: colors.primary, fontFamily: fonts.semiBold }}>{isRegister ? "Se connecter" : "S'inscrire"}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
