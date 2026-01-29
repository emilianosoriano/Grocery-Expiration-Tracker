import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
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
import { DEFAULT_SETTINGS, UserSettings } from "@/types/grocery";

type SettingsContextValue = {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (
    updates: Partial<Omit<UserSettings, "userId" | "updatedAt">>,
  ) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "settings", user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            userId: user.uid,
            autoDeleteExpired:
              data.autoDeleteExpired ?? DEFAULT_SETTINGS.autoDeleteExpired,
            deleteAfterDays:
              data.deleteAfterDays ?? DEFAULT_SETTINGS.deleteAfterDays,
            expiringReminders:
              data.expiringReminders ?? DEFAULT_SETTINGS.expiringReminders,
            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString() ??
              new Date().toISOString(),
          });
        } else {
          // Create default settings for new user
          const newSettings = {
            userId: user.uid,
            ...DEFAULT_SETTINGS,
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, newSettings);
          setSettings({
            ...newSettings,
            updatedAt: new Date().toISOString(),
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching settings:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const updateSettings = useCallback(
    async (updates: Partial<Omit<UserSettings, "userId" | "updatedAt">>) => {
      if (!user) return;

      const docRef = doc(db, "settings", user.uid);
      await setDoc(
        docRef,
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    },
    [user],
  );

  const value = useMemo(
    () => ({ settings, loading, updateSettings }),
    [settings, loading, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
