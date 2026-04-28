import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/lib/store/auth";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AppLayoutScreen() {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Attendre que l'état persisté soit restauré avant de prendre une décision
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/(auth)");
    }
  }, [isAuthenticated, hasHydrated]);

  // Pendant l'hydratation, afficher un splash plutôt que de rediriger
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#0F2A42" />
      </View>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="generate" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="profil" />
        <Stack.Screen name="templates/index" />
        <Stack.Screen name="clauses/index" />
        <Stack.Screen name="workflows/creer-societe" />
      </Stack>
    </AppLayout>
  );
}
