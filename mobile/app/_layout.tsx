import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import "@/lib/i18n";
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { GOOGLE_FONTS_URL } from "@/lib/theme/fonts";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.lang = "fr";
      document.documentElement.setAttribute("translate", "no");
      const meta = document.createElement("meta");
      meta.httpEquiv = "Content-Language";
      meta.content = "fr";
      document.head.appendChild(meta);
      const metaTranslate = document.createElement("meta");
      metaTranslate.name = "google";
      metaTranslate.content = "notranslate";
      document.head.appendChild(metaTranslate);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </ThemeProvider>
  );
}
