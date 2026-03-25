import { Stack } from "expo-router";

export default function GenerateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sarl" />
    </Stack>
  );
}
