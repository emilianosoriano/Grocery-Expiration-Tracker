import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/brand";
import { useOnboarding } from "@/providers/onboarding-provider";

export default function WelcomeScreen() {
  const router = useRouter();
  const { markCompleted } = useOnboarding();

  const handleGetStarted = async () => {
    await markCompleted();
    router.replace("/(tabs)" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Stay ahead of expiration dates.</Text>
          <Text style={styles.subtitle}>
            Track groceries in seconds and see what expires in the next 7
            days—sorted by what's going first.
          </Text>
        </View>

        {/* Button */}
        <View style={styles.buttonSection}>
          <Pressable style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get started</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  textSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: BrandColors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  buttonSection: {
    paddingTop: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: BrandColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.surface,
  },
});
