import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BrandColors } from "@/constants/brand";
import { useOnboarding } from "@/providers/onboarding-provider";

export default function ManualAddItemScreen() {
  const router = useRouter();
  const { markCompleted } = useOnboarding();
  const [name, setName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const onSave = async () => {
    await markCompleted();
    router.replace("/(tabs)" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Add an item
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter the item name and exact expiration date.
        </ThemedText>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Item name (e.g., Milk)"
          placeholderTextColor={BrandColors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={expirationDate}
          onChangeText={setExpirationDate}
          placeholder="Expiration date (e.g., 2026-01-12)"
          placeholderTextColor={BrandColors.textMuted}
          style={styles.input}
        />

        <Pressable style={styles.primaryButton} onPress={onSave}>
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
            Save
          </ThemedText>
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
  input: {
    borderWidth: 1,
    borderColor: "rgba(243,246,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: BrandColors.text,
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
