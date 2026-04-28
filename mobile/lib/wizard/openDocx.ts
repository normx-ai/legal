import { Platform } from "react-native";

export function openDocx(url: string | null) {
  if (url && Platform.OS === "web") {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3004";
    window.open(`${baseUrl.replace(/\/api$/, "")}${url}`, "_blank");
  }
}
