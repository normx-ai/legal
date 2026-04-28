import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/lib/store/auth";

export default function Index() {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  // Pendant l'hydratation depuis localStorage, attendre avant de rediriger
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#0F2A42" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)" />;
}
