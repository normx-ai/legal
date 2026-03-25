import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const fonts = {
  heading: isWeb ? "Playfair Display" : "PlayfairDisplay_700Bold",
  headingBlack: isWeb ? "Playfair Display" : "PlayfairDisplay_900Black",
  light: isWeb ? "Outfit" : "Outfit_300Light",
  regular: isWeb ? "Outfit" : "Outfit_400Regular",
  medium: isWeb ? "Outfit" : "Outfit_500Medium",
  semiBold: isWeb ? "Outfit" : "Outfit_600SemiBold",
  bold: isWeb ? "Outfit" : "Outfit_700Bold",
  extraBold: isWeb ? "Outfit" : "Outfit_800ExtraBold",
  black: isWeb ? "Outfit" : "Outfit_900Black",
} as const;

export const fontWeights = {
  heading: isWeb ? ("700" as const) : undefined,
  headingBlack: isWeb ? ("900" as const) : undefined,
  light: isWeb ? ("300" as const) : undefined,
  regular: isWeb ? ("400" as const) : undefined,
  medium: isWeb ? ("500" as const) : undefined,
  semiBold: isWeb ? ("600" as const) : undefined,
  bold: isWeb ? ("700" as const) : undefined,
  extraBold: isWeb ? ("800" as const) : undefined,
  black: isWeb ? ("900" as const) : undefined,
} as const;

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&display=swap";
