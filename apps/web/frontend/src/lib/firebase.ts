

import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Pranir-AquaTech Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj9yaVKWE2Q60rXCn9SIAUrqBEJ14r3ZE",
  authDomain: "praniraqua.firebaseapp.com",
  databaseURL: "https://praniraqua-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "praniraqua",
  storageBucket: "praniraqua.firebasestorage.app",
  messagingSenderId: "1040296367403",
  appId: "1:1040296367403:web:37d5c6af092318a086e16e",
  measurementId: "G-T3GLKYSX70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent offline support
// Firestore (primary database)
export const db = getFirestore(app);

// Enable Firestore persistence with safe error handling
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.info("✓ Firestore offline persistence enabled");
    })
    .catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("⚠ Firestore persistence: Multiple tabs open - using in-memory cache");
      } else if (err.code === "unimplemented") {
        console.warn("⚠ Firestore persistence: Not supported - using in-memory cache");
      } else {
        console.error("Firestore persistence error:", err.message);
      }
    });
}

// Initialize Firebase Authentication with fallback persistence
export const auth = getAuth(app);

// Set auth persistence with fallback strategy
if (typeof window !== "undefined") {
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(() => {
      // Fallback to browser localStorage if IndexedDB unavailable
      console.warn("⚠ Auth: IndexedDB unavailable, falling back to localStorage");
      return setPersistence(auth, browserLocalPersistence);
    })
    .catch((err) => {
      console.error("Auth persistence setup failed:", err.message);
    });
}

// Realtime Database (legacy modules still use this)
export const rtdb = getDatabase(app);

// Cloud Storage
export const storage = getStorage(app);

// Development: Connect to emulator if available (optional)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Uncomment to use Firebase emulators for local development:
  // import { connectAuthEmulator } from "firebase/auth";
  // connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}

