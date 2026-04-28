import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/lib/store/auth";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AppLayoutScreen() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)");
    }
  }, [isAuthenticated]);

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
