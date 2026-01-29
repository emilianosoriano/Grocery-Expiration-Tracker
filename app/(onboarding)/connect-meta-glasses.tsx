import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColors } from "@/constants/brand";
import { useOnboarding } from "@/providers/onboarding-provider";

export default function ConnectMetaGlassesScreen() {
  const router = useRouter();
  const { markCompleted } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const onConnect = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      await markCompleted();
      router.replace("/(tabs)" as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Connect Meta glasses
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          We’ll use speech‑to‑text so you can say “expires January 12” while you
          scan.
        </ThemedText>

        <Pressable
          style={styles.primaryButton}
          onPress={onConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={BrandColors.background} />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
              Connect
            </ThemedText>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.link}>Back</ThemedText>
        </Pressable>
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
  link: {
    color: BrandColors.textMuted,
    textAlign: "center",
    marginTop: 10,
  },
});
