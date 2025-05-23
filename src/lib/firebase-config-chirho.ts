// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// --- Start Firebase Config Logging ---
console.log("--- Firebase Config Attempting to Load (firebase-config-chirho.ts) ---");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `Loaded: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}` : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Loaded" : "MISSING or UNDEFINED");
// --- End Firebase Config Logging ---

const firebaseConfigChirho: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let appChirho: FirebaseApp;
let authChirho: ReturnType<typeof getAuth>;
let dbChirho: Firestore;
let storageChirho: FirebaseStorage;

if (!firebaseConfigChirho.apiKey || !firebaseConfigChirho.projectId || !firebaseConfigChirho.authDomain) {
  console.error(
    "CRITICAL Firebase config is missing essential keys (apiKey, projectId, or authDomain). " +
    "Firebase Auth and Firestore will NOT initialize correctly. " +
    "Ensure your .env.local file is correctly set up with all NEXT_PUBLIC_ variables " +
    "and that you have restarted your Next.js development server."
  );
  // To prevent further errors, we might want to stop here or use placeholder objects,
  // but for now, it will likely throw errors downstream if config is missing.
}

if (typeof window !== 'undefined') { // Ensure Firebase is only initialized on the client-side for client SDK
  if (!getApps().length) {
    console.log("No Firebase apps initialized. Initializing default app...");
    try {
      appChirho = initializeApp(firebaseConfigChirho);
      console.log("Default Firebase app initialized:", appChirho.name);
    } catch (e) {
      console.error("Error initializing Firebase app:", e);
      // Handle initialization error, perhaps by setting appChirho to a state that indicates failure
    }
  } else {
    console.log("Firebase app(s) already initialized. Getting default app...");
    try {
      appChirho = getApp(); // Gets the "[DEFAULT]" app
      console.log("Retrieved default Firebase app:", appChirho.name);
    } catch (e) {
      console.error("Error getting default Firebase app, attempting to re-initialize:", e);
      // Fallback: if getApp() fails for some reason, try initializeApp again.
      // This state should ideally not be reached if getApps().length > 0.
      try {
        appChirho = initializeApp(firebaseConfigChirho);
        console.log("Re-initialized default Firebase app after getApp() error:", appChirho.name);
      } catch (initError) {
        console.error("Error re-initializing Firebase app:", initError);
      }
    }
  }

  if (appChirho!) { // Add a null check or ensure appChirho is assigned
    console.log("Firebase App Options for appChirho instance:", appChirho.options);
    authChirho = getAuth(appChirho);
    dbChirho = getFirestore(appChirho);
    storageChirho = getStorage(appChirho);

    try {
      enableNetwork(dbChirho);
      console.log("Firestore network connection explicitly enabled by enableNetwork(dbChirho).");
    } catch (e) {
      console.error("Error calling enableNetwork(dbChirho) for Firestore:", e);
    }
  } else {
    console.error("CRITICAL: Firebase appChirho instance is undefined after initialization attempts. Firebase services will not work.");
    // Provide dummy objects or throw to prevent further runtime errors if appChirho is truly undefined
    // This state indicates a severe problem with Firebase setup.
    // For now, downstream code will likely fail if it tries to use undefined authChirho, dbChirho.
  }
} else {
  // For server-side contexts (like Server Actions if they were to import this, though they shouldn't rely on client SDK init here)
  // Admin SDK should be used for server-side. This client config is primarily for the browser.
  console.warn("Firebase client SDK (firebase-config-chirho.ts) is being imported in a non-client environment. This is usually not intended for client-side services like Auth, Firestore client, etc.");
}

export { appChirho, authChirho, dbChirho, storageChirho };
