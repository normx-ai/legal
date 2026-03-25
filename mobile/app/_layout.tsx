import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import "@/lib/i18n";
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import { GOOGLE_FONTS_URL } from "@/lib/theme/fonts";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
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
