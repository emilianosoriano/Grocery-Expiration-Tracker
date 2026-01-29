import { CategoryId } from "@/constants/brand";

// Grocery item stored in Firestore
export interface GroceryItem {
  id: string;
  userId: string;
  name: string;
  category: CategoryId;
  purchaseDate: string; // ISO date string
  expirationDate: string; // ISO date string
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User settings stored in Firestore
export interface UserSettings {
  userId: string;
  autoDeleteExpired: boolean;
  deleteAfterDays: number; // Days after expiration to auto-delete
  expiringReminders: boolean; // Notify a day before expiration
  updatedAt: string;
}

// Default settings for new users
export const DEFAULT_SETTINGS: Omit<UserSettings, "userId" | "updatedAt"> = {
  autoDeleteExpired: true,
  deleteAfterDays: 3,
  expiringReminders: true,
};
