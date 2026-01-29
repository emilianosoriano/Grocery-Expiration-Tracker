import Ionicons from "@expo/vector-icons/Ionicons";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/brand";
import { auth } from "@/lib/firebase";
import { useSettings } from "@/providers/settings-provider";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const onSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const deleteAfterOptions = [1, 2, 3, 5, 7];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="settings-outline"
            size={28}
            color={BrandColors.text}
          />
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Expiration Settings */}
        <Text style={styles.sectionTitle}>Expiration Settings</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Text style={styles.emoji}>🗑️</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Auto delete expired items</Text>
              <Text style={styles.settingDescription}>Don't appear it</Text>
            </View>
            <Switch
              value={settings?.autoDeleteExpired ?? true}
              onValueChange={(value) =>
                updateSettings({ autoDeleteExpired: value })
              }
              trackColor={{
                false: BrandColors.border,
                true: BrandColors.primary,
              }}
              thumbColor={BrandColors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Delete after:</Text>
            <Pressable style={styles.daysSelector}>
              <Text style={styles.daysSelectorText}>
                {settings?.deleteAfterDays ?? 3} days
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={BrandColors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.daysOptions}>
            {deleteAfterOptions.map((days) => (
              <Pressable
                key={days}
                style={[
                  styles.dayOption,
                  settings?.deleteAfterDays === days && styles.dayOptionActive,
                ]}
                onPress={() => updateSettings({ deleteAfterDays: days })}
              >
                <Text
                  style={[
                    styles.dayOptionText,
                    settings?.deleteAfterDays === days &&
                      styles.dayOptionTextActive,
                  ]}
                >
                  {days}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Expiring soon reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified a day before items expire
              </Text>
            </View>
            <Switch
              value={settings?.expiringReminders ?? true}
              onValueChange={(value) =>
                updateSettings({ expiringReminders: value })
              }
              trackColor={{
                false: BrandColors.border,
                true: BrandColors.primary,
              }}
              thumbColor={BrandColors.surface}
            />
          </View>
        </View>

        {/* Settings Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Settings Summary</Text>
            <Ionicons name="chevron-up" size={16} color={BrandColors.surface} />
          </View>
          <Text style={styles.summaryText}>
            Expired items delete after {settings?.deleteAfterDays ?? 3} days
            (auto expiration)
          </Text>
        </View>

        {/* Sign Out */}
        <Pressable
          style={styles.signOutButton}
          onPress={onSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={BrandColors.surface} />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={BrandColors.surface}
              />
              <Text style={styles.signOutText}>Sign out</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: BrandColors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.textSecondary,
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BrandColors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: BrandColors.text,
  },
  settingDescription: {
    fontSize: 13,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginVertical: 14,
  },
  daysSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  daysSelectorText: {
    fontSize: 14,
    color: BrandColors.textSecondary,
  },
  daysOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  dayOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  dayOptionActive: {
    backgroundColor: BrandColors.primary,
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.textSecondary,
  },
  dayOptionTextActive: {
    color: BrandColors.surface,
  },
  summaryCard: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.surface,
  },
  summaryText: {
    fontSize: 13,
    color: BrandColors.surface,
    opacity: 0.9,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 30,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.surface,
  },
});
