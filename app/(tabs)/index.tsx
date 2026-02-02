import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BrandColors,
  CATEGORIES,
  CategoryId,
  getDaysRemainingColor,
} from "@/constants/brand";
import { useGroceries } from "@/providers/grocery-provider";
import { GroceryItem } from "@/types/grocery";

// Calculate days until expiration
function getDaysUntilExpiration(expirationDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get category info by id
function getCategoryById(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id);
}

type FilterType = "expiring" | CategoryId;

export default function HomeScreen() {
  const { groceries, loading } = useGroceries();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("expiring");

  // Filter groceries based on search and active filter
  const filteredGroceries = useMemo(() => {
    let items = groceries;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    // Category/expiring filter
    // Category/expiring filter (only when NOT searching)
    if (!searchQuery.trim()) {
      if (activeFilter === "expiring") {
        items = items.filter(
          (item) => getDaysUntilExpiration(item.expirationDate) <= 7,
        );
      } else {
        items = items.filter((item) => item.category === activeFilter);
      }
    }

    return items;
  }, [groceries, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.appTitle}>Grocery</Text>
            <Text style={styles.appTitle}>Expiration</Text>
            <Text style={styles.appTitle}>Tracker</Text>
          </View>
        </View>
        <View style={styles.avatarPlaceholder}>
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={BrandColors.textMuted}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={BrandColors.textMuted}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={BrandColors.textMuted}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);

            if (text.trim()) {
              setActiveFilter("expiring"); // optional UX choice
            }
          }}
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsContainer}
        contentContainerStyle={styles.pillsContent}
      >
        <Pressable
          style={[
            styles.pill,
            activeFilter === "expiring" && styles.pillActive,
          ]}
          onPress={() => setActiveFilter("expiring")}
        >
          <Text
            style={[
              styles.pillText,
              activeFilter === "expiring" && styles.pillTextActive,
            ]}
          >
            Expiring
          </Text>
        </Pressable>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.pill,
              activeFilter === category.id && styles.pillActive,
            ]}
            onPress={() => setActiveFilter(category.id)}
          >
            <Text style={styles.pillEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.pillText,
                activeFilter === category.id && styles.pillTextActive,
              ]}
            >
              {category.label.split(" ")[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Grocery List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : filteredGroceries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="basket-outline"
              size={48}
              color={BrandColors.textMuted}
            />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === "expiring"
                ? "No items expiring in the next 7 days"
                : "Add items using the + button below"}
            </Text>
          </View>
        ) : (
          filteredGroceries.map((item) => (
            <GroceryCard key={item.id} item={item} />
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GroceryCard({ item }: { item: GroceryItem }) {
  const daysRemaining = getDaysUntilExpiration(item.expirationDate);
  const daysColor = getDaysRemainingColor(daysRemaining);
  const category = getCategoryById(item.category);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.cardImage} />
        ) : (
          <Text style={styles.cardEmoji}>{category?.emoji || "🛒"}</Text>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardMeta}>
          Purchased, {formatDate(item.purchaseDate)}
        </Text>
        <Text style={styles.cardMeta}>
          Expires, {formatDate(item.expirationDate)}
        </Text>
      </View>
      <View style={styles.cardDays}>
        <Text style={[styles.daysNumber, { color: daysColor }]}>
          {daysRemaining < 0 ? "!" : daysRemaining}
        </Text>
        <Text style={[styles.daysLabel, { color: daysColor }]}>
          {daysRemaining < 0 ? "expired" : "days"}
        </Text>
        <Text style={[styles.daysLabel, { color: daysColor }]}>remaining</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.text,
    lineHeight: 18,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.surface,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: BrandColors.text,
  },
  pillsContainer: {
    maxHeight: 50,
    marginVertical: 10,
  },
  pillsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.pillBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  pillActive: {
    backgroundColor: BrandColors.pillBgActive,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
    color: BrandColors.pillText,
  },
  pillTextActive: {
    color: BrandColors.pillTextActive,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: BrandColors.textMuted,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: BrandColors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: BrandColors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  cardDays: {
    alignItems: "flex-end",
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  daysLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});
