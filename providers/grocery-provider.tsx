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
  const { user } = useAuth();
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroceries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "groceries"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: GroceryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
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
        // Sort by expiration date (soonest first)
        items.sort(
          (a, b) =>
            new Date(a.expirationDate).getTime() -
            new Date(b.expirationDate).getTime(),
        );
        setGroceries(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching groceries:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addGrocery = useCallback(
    async (
      item: Omit<GroceryItem, "id" | "userId" | "createdAt" | "updatedAt">,
    ) => {
      if (!user) return;

      const now = new Date().toISOString();
      await addDoc(collection(db, "groceries"), {
        ...item,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      });
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
