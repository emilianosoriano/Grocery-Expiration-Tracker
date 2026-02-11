import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  throw new Error(
    "Missing Firebase env vars. Check EXPO_PUBLIC_FIREBASE_* variables.",
  );
}

/**
 * Initialize Firebase App ONCE
 */
let firebaseApp: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  // First initialization - create app and auth with persistence
  firebaseApp = initializeApp(firebaseConfig);

  // Use different persistence based on platform
  if (Platform.OS === "web") {
    // Web: use browser local storage persistence
    auth = initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
    });
  } else {
    // React Native (iOS/Android): use AsyncStorage persistence
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} else {
  // App already exists (hot reload) - get existing instances
  firebaseApp = getApps()[0];
  auth = getAuth(firebaseApp);
}

/**
 * Firestore
 */
const db: Firestore = getFirestore(firebaseApp);

console.log("[Firebase] Firestore initialized for platform:", Platform.OS);

export { auth, db, firebaseApp };
