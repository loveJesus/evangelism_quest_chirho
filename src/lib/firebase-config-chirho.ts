// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";

// Diagnostic logs: Check these in your browser console after restarting the dev server.
console.log("--- Firebase Config Attempting to Load (firebase-config-chirho.ts) ---");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `Loaded: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}` : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("--------------------------------------------------------------------");

const firebaseConfigChirho: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Critical check for essential config
if (!firebaseConfigChirho.apiKey || !firebaseConfigChirho.projectId || !firebaseConfigChirho.authDomain) {
  console.error(
    "CRITICAL Firebase config is missing (apiKey, projectId, or authDomain). " +
    "Firebase Auth and Firestore will NOT initialize correctly. " +
    "Ensure your .env.local file is correctly set up in the project root with all NEXT_PUBLIC_ variables " +
    "and that you have restarted your Next.js development server."
  );
}

// Initialize Firebase
const appChirho = !getApps().length ? initializeApp(firebaseConfigChirho) : getApp();

// Log the options of the app instance being used for Firestore
console.log('Firebase App Options (for Firestore):', appChirho.options);

const authChirho = getAuth(appChirho);
const dbChirho = getFirestore(appChirho);

try {
  enableNetwork(dbChirho);
  console.log("Firestore network connection explicitly enabled by enableNetwork(dbChirho).");
} catch (e) {
  console.error("Error calling enableNetwork(dbChirho) for Firestore:", e);
}

export { appChirho, authChirho, dbChirho };
