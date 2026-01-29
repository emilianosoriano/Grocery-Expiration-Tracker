import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="add-first-item" />
      <Stack.Screen name="connect-meta-glasses" />
      <Stack.Screen name="manual-add-item" />
    </Stack>
  );
}
