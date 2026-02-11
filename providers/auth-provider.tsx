import { User, onAuthStateChanged } from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth] Setting up onAuthStateChanged listener");

    const unsub = onAuthStateChanged(auth, (nextUser: User | null) => {
      console.log("[Auth] ===== AUTH STATE CHANGED =====");
      console.log("[Auth] Previous user:", user ? user.uid : "null");
      console.log("[Auth] New user:", nextUser ? nextUser.uid : "null");
      console.log("[Auth] New user email:", nextUser ? nextUser.email : "null");

      setUser(nextUser);
      setLoading(false);

      console.log("[Auth] Loading set to false");
    });

    return () => {
      console.log("[Auth] Cleaning up onAuthStateChanged listener");
      unsub();
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
