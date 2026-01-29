import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColors } from "@/constants/brand";

export default function AddFirstItemChoiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Add your first item
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Connect Meta glasses for hands‑off logging, or add items manually.
        </ThemedText>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push("/(onboarding)/connect-meta-glasses" as any)
          }
        >
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
            Connect Meta glasses
          </ThemedText>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/(onboarding)/manual-add-item" as any)}
        >
          <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
            Skip and add manually
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.helper}>
          You can change this anytime in Settings.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    color: BrandColors.text,
  },
  subtitle: {
    color: BrandColors.textMuted,
  },
  primaryButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: BrandColors.background,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(243,246,255,0.18)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: BrandColors.text,
  },
  helper: {
    color: BrandColors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
});
