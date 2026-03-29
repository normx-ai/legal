import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { fonts, fontWeights } from "@/lib/theme/fonts";
import LandingPage from "@/components/landing/LandingPage";

const BG = "#1A3A5C";
const GOLD = "#D4A843";
const PURPLE = "#7c3aed";

export default function LoginKeycloak() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const handleCallback = useAuthStore((s) => s.handleCallback);

  // S'assurer que le callback Keycloak est traité au montage
  useEffect(() => {
    if (Platform.OS === "web" && window.location.search.includes("code=")) {
      handleCallback();
    }
  }, []);

  // Rediriger vers le dashboard quand authentifié
  useEffect(() => {
    if (isAuthenticated) {
      const { router } = require("expo-router");
      router.replace("/(app)");
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BG }}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={{ color: "#fff", marginTop: 16, fontFamily: fonts.medium, fontSize: 14 }}>
          Connexion en cours...
        </Text>
      </View>
    );
  }

  // Sur web : afficher la landing page complète
  if (Platform.OS === "web") {
    return <LandingPage />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ color: PURPLE, fontSize: 40, fontFamily: fonts.bold, fontWeight: fontWeights.bold }}>
        NX
      </Text>

      <Text style={{
        color: "#fff", fontSize: 28, fontFamily: fonts.bold, fontWeight: fontWeights.bold,
        marginTop: 16, marginBottom: 8, textAlign: "center",
      }}>
        NORMX Legal
      </Text>

      <Text style={{
        color: "rgba(255,255,255,0.7)", fontSize: 15, fontFamily: fonts.regular,
        textAlign: "center", marginBottom: 40, maxWidth: 320, lineHeight: 22,
      }}>
        Documents juridiques OHADA : statuts, PV, cessions, actes
      </Text>

      <TouchableOpacity onPress={login} style={{
        backgroundColor: PURPLE, paddingVertical: 16, paddingHorizontal: 48,
        borderRadius: 12, width: "100%", maxWidth: 360,
      }}>
        <Text style={{
          color: "#fff", fontSize: 16, fontFamily: fonts.bold,
          fontWeight: fontWeights.bold, textAlign: "center",
        }}>
          Se connecter
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={login} style={{
        marginTop: 16, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12,
        borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)", width: "100%", maxWidth: 360,
      }}>
        <Text style={{ color: "#fff", fontSize: 16, fontFamily: fonts.medium, textAlign: "center" }}>
          Creer un compte
        </Text>
      </TouchableOpacity>

      <Text style={{
        color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: fonts.regular,
        marginTop: 32, textAlign: "center",
      }}>
        Connexion securisee via NORMX AI
      </Text>
    </View>
  );
}
