import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandColors, CATEGORIES, CategoryId } from "@/constants/brand";
import { useGroceries } from "@/providers/grocery-provider";

export default function AddProductScreen() {
  const router = useRouter();
  const { addGrocery } = useGroceries();

  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
    null,
  );
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [autoCalculateExpiration, setAutoCalculateExpiration] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-calculate expiration date (7 days from purchase)
  const calculatedExpiration = new Date(purchaseDate);
  calculatedExpiration.setDate(calculatedExpiration.getDate() + 7);

  const effectiveExpirationDate = autoCalculateExpiration
    ? calculatedExpiration
    : expirationDate;

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Product Image",
      "Choose an option",
      [
        { text: "Photo Library", onPress: pickFromLibrary },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose File", onPress: pickFile },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a product name");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!effectiveExpirationDate) {
      Alert.alert("Error", "Please set an expiration date");
      return;
    }

    setLoading(true);

    // Fire and forget
    addGrocery({
      name: name.trim(),
      category: selectedCategory,
      purchaseDate: toLocalDateString(purchaseDate),
      expirationDate: toLocalDateString(effectiveExpirationDate),
      ...(photoUri && { photoUrl: photoUri }),
    }).catch((err) => {
      console.error("Add grocery failed:", err);
      Alert.alert("Error", "Failed to add product.");
    });

    // Immediately leave the screen
    router.replace("/(tabs)");

    // Reset local state
    setName("");
    setSelectedCategory(null);
    setPurchaseDate(new Date());
    setExpirationDate(null);
    setAutoCalculateExpiration(true);
    setPhotoUri(null);
    setLoading(false);
  };

  // End of handleSubmit

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Add New Product</Text>

        {/* Product Name */}
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Milk, Eggs, Bread"
          placeholderTextColor={BrandColors.textMuted}
          value={name}
          onChangeText={setName}
        />

        {/* Label Selection */}
        <Text style={styles.label}>Label your item</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id &&
                    styles.categoryLabelActive,
                ]}
                numberOfLines={2}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Purchase Date */}
        <Text style={styles.label}>Purchase Date</Text>
        <Pressable
          style={styles.dateInput}
          onPress={() => setShowPurchasePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(purchaseDate)}</Text>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={BrandColors.textMuted}
          />
        </Pressable>
        {showPurchasePicker && (
          <DateTimePicker
            value={purchaseDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_event: any, date?: Date) => {
              if (date) setPurchaseDate(date);
            }}
          />
        )}

        {/* Product Image (Optional) */}
        <Text style={styles.label}>Product Image (Optional)</Text>
        <Pressable style={styles.imageInput} onPress={showImageOptions}>
          {photoUri ? (
            <Text style={styles.imageText}>Image selected ✓</Text>
          ) : (
            <>
              <Ionicons
                name="image-outline"
                size={18}
                color={BrandColors.textMuted}
              />
              <Text style={styles.imageText}>Tap to add image</Text>
            </>
          )}
        </Pressable>

        {/* Expiration Date */}
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setAutoCalculateExpiration(!autoCalculateExpiration)}
        >
          <View
            style={[
              styles.checkbox,
              autoCalculateExpiration && styles.checkboxChecked,
            ]}
          >
            {autoCalculateExpiration && (
              <Ionicons
                name="checkmark"
                size={14}
                color={BrandColors.surface}
              />
            )}
          </View>
          <Text style={styles.checkboxLabel}>Set custom expiration date</Text>
        </Pressable>

        {autoCalculateExpiration ? (
          <Text style={styles.autoCalcText}>
            Expiration will be calculated automatically (7 days from purchase)
          </Text>
        ) : (
          <>
            <Text style={styles.label}>Expiration Date</Text>
            <Pressable
              style={styles.dateInput}
              onPress={() => setShowExpirationPicker(true)}
            >
              <Text style={styles.dateText}>
                {expirationDate ? formatDate(expirationDate) : "Select date"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={BrandColors.textMuted}
              />
            </Pressable>
            {showExpirationPicker && (
              <DateTimePicker
                value={expirationDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_event: any, date?: Date) => {
                  if (date) setExpirationDate(date);
                }}
              />
            )}
          </>
        )}

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Adding..." : "Add Product"}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
  // End of AddProductScreen
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: BrandColors.text,
    marginTop: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: BrandColors.text,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "23%",
    aspectRatio: 1,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  categoryCardActive: {
    borderColor: BrandColors.primary,
    borderWidth: 2,
    backgroundColor: BrandColors.primaryLight,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: BrandColors.textSecondary,
    textAlign: "center",
  },
  categoryLabelActive: {
    color: BrandColors.primary,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 16,
    color: BrandColors.text,
  },
  imageInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  browseText: {
    fontSize: 14,
    color: BrandColors.text,
    backgroundColor: BrandColors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  imageText: {
    fontSize: 14,
    color: BrandColors.textMuted,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: BrandColors.text,
  },
  autoCalcText: {
    fontSize: 13,
    color: BrandColors.textMuted,
    fontStyle: "italic",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.surface,
  },
});
