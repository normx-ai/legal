import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/lib/store/auth";

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="generate" />
    </Stack>
  );
}
