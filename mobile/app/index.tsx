import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/store/auth";
import { Platform } from "react-native";
import LandingPage from "@/components/landing/LandingPage";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  // Sur web : afficher la landing page
  if (Platform.OS === "web") {
    return <LandingPage />;
  }

  // Sur mobile : aller au login Keycloak
  return <Redirect href="/(auth)" />;
}
