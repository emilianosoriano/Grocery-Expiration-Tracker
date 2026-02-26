import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";
import { useSettings } from "@/providers/settings-provider";
import { GroceryItem } from "@/types/grocery";

type GroceryContextValue = {
  groceries: GroceryItem[];
  loading: boolean;
  addGrocery: (
    item: Omit<GroceryItem, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateGrocery: (id: string, updates: Partial<GroceryItem>) => Promise<void>;
  deleteGrocery: (id: string) => Promise<void>;
};

const GroceryContext = createContext<GroceryContextValue | null>(null);

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();

  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Grocery] ===== EFFECT TRIGGERED =====");
    console.log("[Grocery] authLoading:", authLoading);
    console.log("[Grocery] user:", user ? user.uid : "null");

    // Wait until Firebase finishes restoring auth
    if (authLoading) {
      console.log("[Grocery] waiting for auth restore...");
      setLoading(true);
      return;
    }

    // Auth restored but no user logged in
    if (!user) {
      console.log("[Grocery] no user → clearing groceries");
      setGroceries([]);
      setLoading(false);
      return;
    }

    console.log("[Grocery] ===== ATTACHING SNAPSHOT =====");
    console.log("[Grocery] User ID:", user.uid);
    console.log("[Grocery] User email:", user.email);

    setLoading(true);

    const q = query(
      collection(db, "groceries"),
      where("userId", "==", user.uid),
    );

    console.log("[Grocery] Query created, setting up listener...");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("[Grocery] ===== SNAPSHOT RECEIVED =====");
        console.log("[Grocery] Snapshot size:", snapshot.size);
        console.log("[Grocery] Snapshot empty:", snapshot.empty);
        console.log(
          "[Grocery] Snapshot metadata - fromCache:",
          snapshot.metadata.fromCache,
        );
        console.log(
          "[Grocery] Snapshot metadata - hasPendingWrites:",
          snapshot.metadata.hasPendingWrites,
        );

        const items: GroceryItem[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          console.log(
            "[Grocery] Document:",
            docSnap.id,
            "- name:",
            data.name,
            "- userId:",
            data.userId,
          );

          items.push({
            id: docSnap.id,
            userId: data.userId,
            name: data.name,
            category: data.category,
            purchaseDate: data.purchaseDate,
            expirationDate: data.expirationDate,
            photoUrl: data.photoUrl,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
          });
        });

        items.sort(
          (a, b) =>
            new Date(a.expirationDate).getTime() -
            new Date(b.expirationDate).getTime(),
        );

        console.log("[Grocery] Total items processed:", items.length);
        if (items.length > 0) {
          console.log("[Grocery] First item name:", items[0].name);
        }
        console.log("[Grocery] ===== END SNAPSHOT =====");

        setGroceries(items);
        setLoading(false);
      },
      (error) => {
        console.error("[Grocery] ===== SNAPSHOT ERROR =====");
        console.error("[Grocery] Error code:", error.code);
        console.error("[Grocery] Error message:", error.message);
        console.error("[Grocery] Full error:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, authLoading]);

  // Auto-delete expired items whenever groceries or settings change
  useEffect(() => {
    if (!settings?.autoDeleteExpired || groceries.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threshold = settings.deleteAfterDays ?? 3;

    groceries.forEach((item) => {
      const [y, m, d] = item.expirationDate.split("-").map(Number);
      const expDate = new Date(y, m - 1, d);
      const daysOver = Math.floor(
        (today.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysOver >= threshold) {
        deleteDoc(doc(db, "groceries", item.id)).catch((err) =>
          console.error("[Grocery] Auto-delete failed:", err),
        );
      }
    });
  }, [groceries, settings]);

  // TODO: Add error handling

  const addGrocery = useCallback(
    async (
      item: Omit<GroceryItem, "id" | "userId" | "createdAt" | "updatedAt">,
    ) => {
      console.log("[Grocery] ===== ADD GROCERY CALLED =====");
      console.log("[Grocery] Item name:", item.name);
      console.log("[Grocery] User:", user ? user.uid : "null");

      if (!user) {
        console.error("[Grocery] No user - cannot add grocery");
        return;
      }

      try {
        const now = new Date().toISOString();
        const docData = {
          ...item,
          userId: user.uid,
          createdAt: now,
          updatedAt: now,
        };

        console.log("[Grocery] Writing document with data:", docData);

        const docRef = await addDoc(collection(db, "groceries"), docData);

        console.log("[Grocery] ===== WRITE SUCCESS =====");
        console.log("[Grocery] Document ID:", docRef.id);
        console.log("[Grocery] Document path:", docRef.path);
      } catch (error: any) {
        console.error("[Grocery] ===== WRITE ERROR =====");
        console.error("[Grocery] Error code:", error.code);
        console.error("[Grocery] Error message:", error.message);
        console.error("[Grocery] Full error:", error);
        throw error;
      }
    },
    [user],
  );

  const updateGrocery = useCallback(
    async (id: string, updates: Partial<GroceryItem>) => {
      if (!user) return;

      const docRef = doc(db, "groceries", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    [user],
  );

  const deleteGrocery = useCallback(
    async (id: string) => {
      if (!user) return;

      const docRef = doc(db, "groceries", id);
      await deleteDoc(docRef);
    },
    [user],
  );

  const value = useMemo(
    () => ({ groceries, loading, addGrocery, updateGrocery, deleteGrocery }),
    [groceries, loading, addGrocery, updateGrocery, deleteGrocery],
  );

  return (
    <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>
  );
}

export function useGroceries() {
  const ctx = useContext(GroceryContext);
  if (!ctx) throw new Error("useGroceries must be used within GroceryProvider");
  return ctx;
}
