import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ONBOARDING_KEY = "onboarding_completed_v1";

type OnboardingContextValue = {
  completed: boolean;
  loading: boolean;
  markCompleted: () => Promise<void>;
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!cancelled) setCompleted(raw === "true");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const markCompleted = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setCompleted(true);
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    setCompleted(false);
  }, []);

  const value = useMemo(
    () => ({ completed, loading, markCompleted, reset }),
    [completed, loading, markCompleted, reset]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
