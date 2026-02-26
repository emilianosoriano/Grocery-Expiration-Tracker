import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { BrandColors } from "@/constants/brand";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { GroceryProvider } from "@/providers/grocery-provider";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/providers/onboarding-provider";
import { SettingsProvider } from "@/providers/settings-provider";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Light theme matching our brand colors
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: BrandColors.background,
    card: BrandColors.surface,
    text: BrandColors.text,
    border: BrandColors.border,
    primary: BrandColors.primary,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OnboardingProvider>
          <GroceryProvider>
            <SettingsProvider>
              <ThemeProvider value={LightTheme}>
                <RootLayoutNav />
                <StatusBar style="dark" />
              </ThemeProvider>
            </SettingsProvider>
          </GroceryProvider>
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading: authLoading } = useAuth();
  const { completed, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (authLoading || onboardingLoading) return;

    const top = segments[0] as string | undefined;
    const inAuthGroup = top === "(auth)";
    const inOnboardingGroup = top === "(onboarding)";
    const inTabsGroup = top === "(tabs)";

    if (!user) {
      if (!inAuthGroup) router.replace("/(auth)/sign-in" as any);
      return;
    }

    if (!completed) {
      if (!inOnboardingGroup) router.replace("/(onboarding)/welcome" as any);
      return;
    }

    if (!inTabsGroup) router.replace("/(tabs)" as any);
  }, [authLoading, onboardingLoading, user, completed, router, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}
