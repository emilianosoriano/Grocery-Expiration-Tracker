// Light theme palette matching mockups
export const BrandColors = {
  // Backgrounds
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F0F2F5",

  // Primary blue (from logo/mockups)
  primary: "#4A90D9",
  primaryLight: "#E8F4FD",

  // Text
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Status colors for expiration
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#22C55E",

  // UI elements
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  inputBg: "#F9FAFB",

  // Category pill colors
  pillBg: "#E8F4FD",
  pillBgActive: "#4A90D9",
  pillText: "#4A90D9",
  pillTextActive: "#FFFFFF",
} as const;

// Category definitions with emoji icons
export const CATEGORIES = [
  { id: "meat-poultry", label: "Meat & Poultry", emoji: "🍗" },
  { id: "seafood", label: "Seafood", emoji: "🐟" },
  { id: "fruits", label: "Fruits", emoji: "🍎" },
  { id: "vegetables", label: "Vegetables", emoji: "🥦" },
  { id: "dairy-eggs", label: "Dairy & Eggs", emoji: "🥛" },
  { id: "drinks-beverages", label: "Drinks & Beverages", emoji: "🥤" },
  { id: "prepared-leftovers", label: "Prepared / Leftovers", emoji: "🍱" },
  { id: "condiments-sauces", label: "Condiments & Sauces", emoji: "🧴" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// Helper to get days remaining color
export function getDaysRemainingColor(days: number): string {
  if (days <= 2) return BrandColors.danger;
  if (days <= 5) return BrandColors.warning;
  return BrandColors.success;
}

// Helper to format days remaining text
export function formatDaysRemaining(days: number): string {
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
