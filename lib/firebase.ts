import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

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

if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

/**
 * Initialize Auth WITH persistence FIRST
 */
let auth: Auth;

if (getApps().length === 1) {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(firebaseApp);
}

/**
 * Firestore
 */
const db: Firestore = getFirestore(firebaseApp);

export { auth, db, firebaseApp };

