// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { DecodedIdToken } from 'firebase-admin/auth'; // Not used directly, but good for context if expanding
import { FieldValue as AdminFieldValue, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';


import type { GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import type { MessageChirho, ArchivedConversationChirho as ClientArchivedConversationChirho } from '@/app/[lang]/ai-personas-chirho/client-page-chirho';
import type { UserProfileChirho } from '@/contexts/auth-context-chirho';

// --- Firebase Admin SDK Initialization ---
// let adminAppChirho: adminChirho.app.App;
// let adminDbChirho: adminChirho.firestore.Firestore;
// let adminStorageChirho: adminChirho.storage.Storage;
let adminAppChirho: any;
let adminDbChirho: any;
let adminStorageChirho: any;

const INITIAL_FREE_CREDITS_CHIRHO = 50;
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;
const ACTIVE_CONVERSATION_DOC_ID_CHIRHO = "current_active_conversation_v1"; // Specific doc ID for active conversation
const FREE_CREDITS_ADD_AMOUNT_CHIRHO = 25;
const FREE_CREDITS_THRESHOLD_CHIRHO = 50;

console.log(`[actions-chirho.ts] Module loaded at: ${new Date().toISOString()}`);
console.log("[Admin Action Init] Attempting to load Firebase Admin SDK...");

try {
  if (getApps().length === 0) {
    console.log("[Admin Action Init] No Firebase Admin apps initialized. Attempting to initialize default app...");
    let serviceAccountCredentialsChirho;
    try {
      // Path is relative to the CWD of the Next.js server process, which is usually the project root.
      // If actions-chirho.ts is in src/lib/, then '../../serviceAccountChirho.json' points to the root.
      serviceAccountCredentialsChirho = require('../../serviceAccountChirho.json'); 
      console.log("[Admin Action Init] serviceAccountChirho.json found via require.");
    } catch (e: any) {
      console.error(`[Admin Action Init] FAILED to load serviceAccountChirho.json. 
        Ensure the file exists at the project root and is named correctly (case-sensitive).
        Current working directory: ${process.cwd()}. Attempted path: ../../serviceAccountChirho.json (relative to this file's expected location in build).
        Error: ${e.message}`);
      throw new Error("Failed to load service account credentials. Admin SDK cannot be initialized.");
    }

    const storageBucketEnvChirho = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucketEnvChirho) {
      console.error("[Admin Action Init] CRITICAL: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not defined. Storage operations will fail if they rely on this for bucket name.");
      // Not throwing an error here, but logging it as critical. Storage operations will fail later.
    }

    adminAppChirho = initializeApp({
        credential: cert(serviceAccountCredentialsChirho),
        storageBucket: storageBucketEnvChirho
    });
    console.log("[Admin Action Init] Default Firebase Admin app INITIALIZED. App Name:", adminAppChirho.name);
  } else {
    adminAppChirho = getApps()[0]; // Get the default app if already initialized
    console.log("[Admin Action Init] Firebase Admin app already exists. Retrieved default app. App Name:", adminAppChirho.name);
  }

  if (adminAppChirho) {
    adminDbChirho = getFirestore(adminAppChirho);
    adminStorageChirho = getStorage(adminAppChirho);
    console.log("[Admin Action Init] Firestore and Storage services obtained from Admin app.");
  } else {
    console.error("[Admin Action Init] CRITICAL: Firebase Admin app instance is undefined after initialization attempts. Firestore and Storage services will not be available.");
    // This state should ideally not be reached if initialization logic is sound.
  }

} catch (e: any) {
  console.error("[Admin Action Init] OVERALL CRITICAL ERROR initializing Firebase Admin SDK in actions-chirho.ts:", e.message, e.stack);
  // If adminDbChirho is not initialized, subsequent calls to actions will fail.
}
// --- End Firebase Admin SDK Initialization ---


export interface ActiveConversationDataChirho {
  personaChirho: GenerateAiPersonaOutputChirho;
  messagesChirho: MessageChirho[];
  difficultyLevelChirho: number;
  currentConversationLanguageChirho: string;
  dynamicPersonaImageChirho: string | null;
  lastSavedMillis?: number; // Changed from AdminTimestamp
}


export async function initializeUserChirho(
  userIdChirho: string,
  emailChirho: string | null,
  displayNameChirho?: string | null,
  photoURLChirho?: string | null
): Promise<{ success: boolean; error?: string; profile?: UserProfileChirho; profileExists?: boolean }> {
  console.log(`[Admin SDK Action initializeUserChirho] Called for user: ${userIdChirho}. Email: ${emailChirho}`);
  if (!adminDbChirho) {
    const errorMsg = "CRITICAL: Firestore Admin SDK (adminDbChirho) not initialized. Cannot initialize user.";
    console.error("[Admin SDK Action initializeUserChirho]", errorMsg);
    return { success: false, error: errorMsg };
  }
  if (!userIdChirho) {
    const errorMsg = "User ID is required for initializeUserChirho.";
    console.error("[Admin SDK Action initializeUserChirho]", errorMsg);
    return { success: false, error: errorMsg };
  }

  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  let userProfileDataToReturn: UserProfileChirho | undefined;

  try {
    console.log(`[Admin SDK Action initializeUserChirho] Attempting to get document: users/${userIdChirho}`);
    const userDocSnapChirho = await userDocRefChirho.get();

    if (userDocSnapChirho.exists) {
      console.log(`[Admin SDK Action initializeUserChirho] Document users/${userIdChirho} exists. Attempting update.`);
      const existingDataChirho = userDocSnapChirho.data()!; // Assert data exists
      const updatesChirho: { [key: string]: any } = {
        lastLogin: AdminFieldValue.serverTimestamp(),
        email: emailChirho || existingDataChirho.email || null, // Preserve existing email if new one is null
      };
      if (displayNameChirho && existingDataChirho.displayName !== displayNameChirho) {
        updatesChirho.displayName = displayNameChirho;
      }
      if (photoURLChirho && existingDataChirho.photoURL !== photoURLChirho) {
        updatesChirho.photoURL = photoURLChirho;
      }
      
      await userDocRefChirho.update(updatesChirho);
      console.log(`[Admin SDK Action initializeUserChirho] User profile UPDATED for: ${userIdChirho}`);
      
      const updatedDocSnapChirho = await userDocRefChirho.get();
      const dataChirho = updatedDocSnapChirho.data();
      if (!dataChirho) throw new Error("Failed to retrieve profile data after update.");
      
      userProfileDataToReturn = {
        uid: userIdChirho,
        email: dataChirho.email,
        displayName: dataChirho.displayName,
        photoURL: dataChirho.photoURL,
        credits: dataChirho.credits,
        createdAt: (dataChirho.createdAt as AdminTimestamp)?.toMillis(),
        lastLogin: (dataChirho.lastLogin as AdminTimestamp)?.toMillis(),
      };
      return { success: true, profile: userProfileDataToReturn, profileExists: true };

    } else {
      console.log(`[Admin SDK Action initializeUserChirho] Document users/${userIdChirho} does NOT exist. Attempting to create.`);
      const newProfileDataChirho = {
        uid: userIdChirho, 
        email: emailChirho || null,
        displayName: displayNameChirho || "Evangelism Quest User", 
        photoURL: photoURLChirho || null,
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: AdminFieldValue.serverTimestamp(),
        lastLogin: AdminFieldValue.serverTimestamp(),
      };
      await userDocRefChirho.set(newProfileDataChirho);
      console.log(`[Admin SDK Action initializeUserChirho] User profile CREATED for: ${userIdChirho}`);

      const createdDocSnapChirho = await userDocRefChirho.get();
      const dataChirho = createdDocSnapChirho.data();
      if (!dataChirho) throw new Error("Failed to retrieve profile data after creation.");
      
      userProfileDataToReturn = {
        uid: userIdChirho,
        email: dataChirho.email,
        displayName: dataChirho.displayName,
        photoURL: dataChirho.photoURL,
        credits: dataChirho.credits,
        createdAt: (dataChirho.createdAt as AdminTimestamp)?.toMillis(), 
        lastLogin: (dataChirho.lastLogin as AdminTimestamp)?.toMillis(),
      };
      return { success: true, profile: userProfileDataToReturn, profileExists: false };
    }
  } catch (error: any) {
    const errorMsg = `Error in initializeUserChirho for ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action initializeUserChirho]", errorMsg, error);
    return { success: false, error: errorMsg };
  }
}


export async function fetchUserProfileFromServerChirho(userIdChirho: string): Promise<{ success: boolean; data?: UserProfileChirho; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot fetch profile." };
  if (!userIdChirho) return { success: false, error: "User ID is required." };
  
  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  try {
    const userDocSnapChirho = await userDocRefChirho.get();
    if (userDocSnapChirho.exists) {
      const dataChirho = userDocSnapChirho.data();
      if (dataChirho) {
        const profileDataChirho: UserProfileChirho = {
          uid: userIdChirho,
          email: dataChirho.email,
          displayName: dataChirho.displayName,
          photoURL: dataChirho.photoURL,
          credits: dataChirho.credits,
          // Ensure Timestamps are converted to numbers (milliseconds) for serialization
          createdAt: (dataChirho.createdAt as AdminTimestamp)?.toMillis(),
          lastLogin: (dataChirho.lastLogin as AdminTimestamp)?.toMillis(),
        };
        return { success: true, data: profileDataChirho };
      }
      return { success: false, error: "User profile data is malformed." };
    } else {
      return { success: false, error: "User profile not found." };
    }
  } catch (error: any) {
    const errorMsg = `Error fetching profile for 'users/${userIdChirho}': ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error(`[Admin SDK Action fetchUserProfileFromServerChirho]: ${errorMsg}`, error);
    return { success: false, error: errorMsg };
  }
}

export async function decrementUserCreditsChirho(userIdChirho: string, amountChirho: number = 1): Promise<{ success: boolean; newCredits?: number; error?: string; }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot decrement credits." };
  if (!userIdChirho) return { success: false, error: "User ID is required." };

  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  try {
    const newCredits = await adminDbChirho.runTransaction(async (transaction) => {
      const userDocSnap = await transaction.get(userDocRefChirho);
      if (!userDocSnap.exists) {
        throw new Error("User profile not found for credit decrement.");
      }
      const currentCredits = userDocSnap.data()?.credits ?? 0;
      if (currentCredits < amountChirho) {
        // Instead of just setting to 0, throw an error that client can interpret
        // transaction.update(userDocRefChirho, { credits: 0 });
        // return 0; 
        throw new Error("Insufficient credits.");
      }
      const updatedCredits = currentCredits - amountChirho;
      transaction.update(userDocRefChirho, { credits: AdminFieldValue.increment(-amountChirho) });
      return updatedCredits;
    });
    
    console.log(`[Admin SDK Action decrementUserCreditsChirho] Credits decremented for ${userIdChirho}. New balance: ${newCredits}`);
    return { success: true, newCredits };
  } catch (error: any) {
    const errorMsg = `Error decrementing credits for ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action decrementUserCreditsChirho]", errorMsg, error);
    // Propagate specific "Insufficient credits" error
    if (error.message === "Insufficient credits.") {
        return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update credits." };
  }
}

export async function addFreeCreditsChirho(userIdChirho: string): Promise<{ success: boolean; newCredits?: number; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot add free credits." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for adding free credits." };
  }

  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  try {
     const newCredits = await adminDbChirho.runTransaction(async (transaction) => {
        const userDocSnap = await transaction.get(userDocRefChirho);
        if (!userDocSnap.exists) {
          throw new Error("User profile not found for adding free credits.");
        }
        const currentCredits = userDocSnap.data()?.credits ?? 0;
        if (currentCredits >= FREE_CREDITS_THRESHOLD_CHIRHO) {
          throw new Error(`Free credits only available if balance is below ${FREE_CREDITS_THRESHOLD_CHIRHO}.`);
        }
        transaction.update(userDocRefChirho, { credits: AdminFieldValue.increment(FREE_CREDITS_ADD_AMOUNT_CHIRHO) });
        return currentCredits + FREE_CREDITS_ADD_AMOUNT_CHIRHO;
     });
    console.log(`[Admin SDK Action addFreeCreditsChirho] Added ${FREE_CREDITS_ADD_AMOUNT_CHIRHO} free credits for user ${userIdChirho}. New balance: ${newCredits}`);
    return { success: true, newCredits };
  } catch (error: any) {
    const errorMsg = `Error adding free credits for ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action addFreeCreditsChirho]", errorMsg, error);
    if (error.message.startsWith("Free credits only available")) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Could not add free credits due to a server error." };
  }
}

export async function uploadImageToStorageChirho(userIdChirho: string, imageDataUriChirho: string, imageNameChirho: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
  if (!adminStorageChirho) {
      const initErrorMsg = "CRITICAL: Storage Admin SDK (adminStorageChirho) not initialized. Cannot upload image.";
      console.error(initErrorMsg);
      return { success: false, error: initErrorMsg };
  }
  if (!userIdChirho || !imageDataUriChirho || !imageNameChirho) {
    return { success: false, error: "User ID, image data, and image name are required." };
  }
  
  const bucketNameChirho = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketNameChirho) {
    const errorMsg = "Firebase Storage bucket name is not configured in environment variables (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).";
    console.error("[Admin SDK Action uploadImageToStorageChirho]", errorMsg);
    return { success: false, error: errorMsg };
  }

  if (imageDataUriChirho.startsWith('http')) { 
    console.warn("[Admin SDK Action uploadImageToStorageChirho] imageDataUriChirho is already an HTTP URL, returning it directly:", imageDataUriChirho);
    return { success: true, downloadURL: imageDataUriChirho };
  }
  if (!imageDataUriChirho.startsWith('data:image')) {
    return { success: false, error: "Invalid image data URI format." };
  }

  try {
    const bucketChirho = adminStorageChirho.bucket(bucketNameChirho);
    const storagePathChirho = `userImages/${userIdChirho}/${imageNameChirho}.png`;
    const fileChirho = bucketChirho.file(storagePathChirho);

    const match = imageDataUriChirho.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return { success: false, error: "Could not parse image data URI." };
    }
    const mimeType = match[1];
    const base64EncodedImageString = match[2];
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');

    await fileChirho.save(imageBuffer, {
      metadata: { contentType: mimeType },
      // public: true, // No longer needed with getSignedUrl if we want controlled access.
                     // If files should be genuinely public, this can be set, and rules adjusted.
    });
    
    // Get a publicly accessible URL. For truly public files, you can use file.publicUrl() after making the object public.
    // For controlled access or long-lived URLs without making the object inherently public via GCS ACLs:
    const [url] = await fileChirho.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future expiration date
    });
    
    console.log(`[Admin SDK Action uploadImageToStorageChirho] Image uploaded for user ${userIdChirho}. URL: ${url}`);
    return { success: true, downloadURL: url };
  } catch (error: any) {
    const errorMsg = `Error uploading image to Firebase Storage: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action uploadImageToStorageChirho]", errorMsg, error);
    return { success: false, error: errorMsg };
  }
}


export async function saveActiveConversationToFirestoreChirho(userIdChirho: string, activeDataChirho: ActiveConversationDataChirho): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot save active conversation." };
  if (!userIdChirho || !activeDataChirho || !activeDataChirho.personaChirho) {
    return { success: false, error: "User ID and active conversation data (with persona) are required." };
  }
  
  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    // Ensure lastSaved is a server timestamp when saving
    const dataToSaveChirho = {
      ...activeDataChirho,
      lastSaved: AdminFieldValue.serverTimestamp(),
    };
    await activeConvDocRefChirho.set(dataToSaveChirho);
    console.log(`[Admin SDK Action saveActiveConversationToFirestoreChirho] Saved for user ${userIdChirho}. Persona: ${activeDataChirho.personaChirho.personaNameChirho}`);
    return { success: true };
  } catch (error: any) {
    const errorMsg = `Error saving active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error(`[Admin SDK Action saveActiveConversationToFirestoreChirho] ${errorMsg}`, error);
    return { success: false, error: errorMsg };
  }
}

export async function fetchActiveConversationFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; data?: ActiveConversationDataChirho; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot fetch active conversation." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for fetching active conversation." };
  }

  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    const docSnapChirho = await activeConvDocRefChirho.get();
    if (docSnapChirho.exists) {
      const dataChirho = docSnapChirho.data();
      if (dataChirho) {
        const activeDataForClientChirho: ActiveConversationDataChirho = {
          ...dataChirho,
          // Convert AdminTimestamp to milliseconds for client
          lastSavedMillis: (dataChirho.lastSaved as AdminTimestamp)?.toMillis(), 
        } as ActiveConversationDataChirho; 
        // Remove the original Timestamp object if it exists in dataChirho to avoid serialization issues
        if ('lastSaved' in activeDataForClientChirho) {
            delete (activeDataForClientChirho as any).lastSaved;
        }
        console.log(`[Admin SDK Action fetchActiveConversationFromFirestoreChirho] Fetched for user ${userIdChirho}.`);
        return { success: true, data: activeDataForClientChirho };
      }
      return { success: false, error: "Active conversation data malformed." };
    } else {
      console.log(`[Admin SDK Action fetchActiveConversationFromFirestoreChirho] No active conversation found for user ${userIdChirho}.`);
      return { success: false, error: "No active conversation found." };
    }
  } catch (error: any) {
    const errorMsg = `Error fetching active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error(`[Admin SDK Action fetchActiveConversationFromFirestoreChirho] ${errorMsg}`, error);
    return { success: false, error: errorMsg };
  }
}

export async function clearActiveConversationFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot clear active conversation." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for clearing active conversation." };
  }

  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    await activeConvDocRefChirho.delete();
    console.log(`[Admin SDK Action clearActiveConversationFromFirestoreChirho] Cleared for user ${userIdChirho}`);
    return { success: true };
  } catch (error: any) {
     if ((error as any).code === 5 || (error as any).code === 'not-found') { 
        console.log(`[Admin SDK Action clearActiveConversationFromFirestoreChirho] Active conversation document already cleared or never existed for user ${userIdChirho}`);
        return { success: true };
    }
    const errorMsg = `Error clearing active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error(`[Admin SDK Action clearActiveConversationFromFirestoreChirho] ${errorMsg}`, error);
    return { success: false, error: errorMsg };
  }
}

interface FirestoreArchivedConversationChirho extends Omit<ClientArchivedConversationChirho, 'timestamp' | 'archivedAtServerMillis'> {
  timestamp: AdminTimestamp; // Stored as Firestore Timestamp
  archivedAtServer: AdminTimestamp; // Stored as Firestore ServerTimestamp
}

export async function archiveConversationToFirestoreChirho(userIdChirho: string, conversationDataChirho: ClientArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot archive conversation." };
  if (!userIdChirho || !conversationDataChirho) {
    return { success: false, error: "User ID and conversation data are required." };
  }

  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  try {
    const dataToSaveChirho: FirestoreArchivedConversationChirho = {
      ...conversationDataChirho,
      timestamp: AdminTimestamp.fromMillis(conversationDataChirho.timestamp), // Convert client millis to AdminTimestamp
      archivedAtServer: AdminFieldValue.serverTimestamp() as AdminTimestamp,
    };
    const docRefChirho = userConversationsRefChirho.doc(conversationDataChirho.id);
    await docRefChirho.set(dataToSaveChirho);
    console.log(`[Admin SDK Action archiveConversationToFirestoreChirho] Archived conversation ${docRefChirho.id} for user ${userIdChirho}.`);

    const querySnapshotChirho = await userConversationsRefChirho.orderBy("timestamp", "desc").get();
    if (querySnapshotChirho.docs.length > MAX_ARCHIVED_CONVERSATIONS_CHIRHO) {
      const batchChirho = adminDbChirho.batch();
      const docsToDeleteChirho = querySnapshotChirho.docs.slice(MAX_ARCHIVED_CONVERSATIONS_CHIRHO);
      docsToDeleteChirho.forEach(docChirho => {
        batchChirho.delete(docChirho.ref);
      });
      await batchChirho.commit();
      console.log(`[Admin SDK Action archiveConversationToFirestoreChirho] Pruning complete. Deleted ${docsToDeleteChirho.length} old conversations for user ${userIdChirho}.`);
    }
    return { success: true };
  } catch (error: any) {
    const errorMsg = `Error archiving conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action archiveConversationToFirestoreChirho]", errorMsg, error);
    return { success: false, error: errorMsg };
  }
}

export async function fetchArchivedConversationsFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; data?: ClientArchivedConversationChirho[]; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot fetch archived conversations." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required." };
  }

  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  const qChirho = userConversationsRefChirho.orderBy("timestamp", "desc").limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO);
  try {
    const snapshotChirho = await qChirho.get();
    const conversationsChirho: ClientArchivedConversationChirho[] = snapshotChirho.docs.map(docSnapshotChirho => {
      const dataChirho = docSnapshotChirho.data() as FirestoreArchivedConversationChirho;
      const clientData: ClientArchivedConversationChirho = {
        ...dataChirho,
        timestamp: (dataChirho.timestamp as AdminTimestamp).toMillis(), // Convert AdminTimestamp to number
        // Convert AdminTimestamp to number for archivedAtServerMillis
        archivedAtServerMillis: (dataChirho.archivedAtServer as AdminTimestamp)?.toMillis(),
      };
      // Remove the original AdminTimestamp objects to ensure only plain objects are sent
      delete (clientData as any).archivedAtServer;
      return clientData;
    });
    console.log(`[Admin SDK Action fetchArchivedConversationsFromFirestoreChirho] Fetched ${conversationsChirho.length} archived conversations for user ${userIdChirho}`);
    return { success: true, data: conversationsChirho };
  } catch (error: any) {
    const errorMsg = `Error fetching archived conversations for user ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action fetchArchivedConversationsFromFirestoreChirho]", errorMsg, error);
    return { success: false, error: errorMsg };
  }
}

export async function clearArchivedConversationsFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "CRITICAL: Firestore Admin SDK not initialized. Cannot clear archived conversations." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required." };
  }

  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  try {
    // Firestore batch delete is more efficient for large numbers of documents
    // However, for up to 500 docs, a loop with individual deletes is fine.
    const snapshotChirho = await userConversationsRefChirho.limit(500).get(); // Get up to 500 docs to delete
    if (snapshotChirho.empty) {
      console.log(`[Admin SDK Action clearArchivedConversationsFromFirestoreChirho] No archived conversations to clear for user ${userIdChirho}`);
      return { success: true };
    }
    const batchChirho = adminDbChirho.batch();
    snapshotChirho.docs.forEach(docChirho => batchChirho.delete(docChirho.ref));
    await batchChirho.commit();
    console.log(`[Admin SDK Action clearArchivedConversationsFromFirestoreChirho] Cleared ${snapshotChirho.docs.length} archived conversations for user ${userIdChirho}`);
    return { success: true };
  } catch (error: any) {
    const errorMsg = `Error clearing archived conversations for user ${userIdChirho}: ${error.message} (Code: ${error.code || 'N/A'})`;
    console.error("[Admin SDK Action clearArchivedConversationsFromFirestoreChirho]", errorMsg, error);
    return { success: false, error: errorMsg };
  }
}


// --- Genkit Flow Wrapper Actions (Unchanged from previous logic using Client SDK, as they call Genkit flows) ---
import {
  generateAiPersonaChirho as generateAiPersonaFlowChirho,
  type GenerateAiPersonaInputChirho,
} from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";

import {
  aiPersonaConvincingChirho as aiPersonaConvincingFlowChirho,
  type AIPersonaConvincingInputChirho,
  type AIPersonaConvincingOutputChirho
} from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";

import {
  contextualGuidanceChirho as contextualGuidanceFlowChirho,
  type ContextualGuidanceInputChirho,
  type ContextualGuidanceOutputChirho
} from "@/ai-chirho/flows-chirho/contextual-guidance-chirho";

import {
  updatePersonaVisualsChirho as updatePersonaVisualsFlowChirho,
  type UpdatePersonaVisualsInputChirho,
  type UpdatePersonaVisualsOutputChirho
} from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";

import {
  suggestEvangelisticResponseChirho as suggestEvangelisticResponseFlowChirho,
  type SuggestEvangelisticResponseInputChirho,
  type SuggestEvangelisticResponseOutputChirho
} from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";


export async function generateNewPersonaActionChirho(inputChirho: GenerateAiPersonaInputChirho, userIdChirho: string): Promise<{ success: boolean; data?: GenerateAiPersonaOutputChirho; error?: string; }> {
  console.log("[Action generateNewPersonaActionChirho] Called with input:", inputChirho, "for user:", userIdChirho);
  try {
    let resultChirho = await generateAiPersonaFlowChirho(inputChirho); // This is a Genkit flow call
    if (resultChirho.personaImageChirho && userIdChirho) {
      const imageNameChirho = `persona_${Date.now()}_initial_${Math.random().toString(36).substring(2, 7)}`;
      // Use the Admin SDK upload function
      const uploadResultChirho = await uploadImageToStorageChirho(userIdChirho, resultChirho.personaImageChirho, imageNameChirho);
      if (uploadResultChirho.success && uploadResultChirho.downloadURL) {
        resultChirho.personaImageChirho = uploadResultChirho.downloadURL;
      } else {
        console.warn("[Action generateNewPersonaActionChirho] Failed to upload initial persona image via Admin SDK. Error:", uploadResultChirho.error);
        // Decide if this is a critical failure or use placeholder
        // For now, let it fail to make it visible
        return { success: false, error: `Failed to upload persona image: ${uploadResultChirho.error}` };
      }
    }
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action generateNewPersonaActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to generate persona." };
  }
}

export async function sendMessageToPersonaActionChirho(inputChirho: AIPersonaConvincingInputChirho): Promise<{ success: boolean; data?: AIPersonaConvincingOutputChirho; error?: string; }> {
  console.log("[Action sendMessageToPersonaActionChirho] Server action received input:", inputChirho);
  try {
    const resultChirho = await aiPersonaConvincingFlowChirho(inputChirho); // Genkit flow call
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action sendMessageToPersonaActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to get persona response." };
  }
}

export async function fetchContextualGuidanceActionChirho(inputChirho: ContextualGuidanceInputChirho): Promise<{ success: boolean; data?: ContextualGuidanceOutputChirho; error?: string; }> {
  console.log("[Action fetchContextualGuidanceActionChirho] Called with input:", inputChirho);
  try {
    const resultChirho = await contextualGuidanceFlowChirho(inputChirho); // Genkit flow call
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action fetchContextualGuidanceActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to fetch guidance." };
  }
}

export async function updatePersonaImageActionChirho(inputChirho: UpdatePersonaVisualsInputChirho, userIdChirho: string): Promise<{ success: boolean; data?: UpdatePersonaVisualsOutputChirho; error?: string; }> {
  console.log("[Action updatePersonaImageActionChirho] Called for user:", userIdChirho, "Visual prompt:", inputChirho.newVisualPromptChirho);
  try {
    let resultChirho = await updatePersonaVisualsFlowChirho(inputChirho); // Genkit flow call
    if (resultChirho.updatedImageUriChirho && userIdChirho) {
      const imageNameChirho = `persona_${Date.now()}_update_${Math.random().toString(36).substring(2, 7)}`;
      // Use the Admin SDK upload function
      const uploadResultChirho = await uploadImageToStorageChirho(userIdChirho, resultChirho.updatedImageUriChirho, imageNameChirho);
      if (uploadResultChirho.success && uploadResultChirho.downloadURL) {
        resultChirho.updatedImageUriChirho = uploadResultChirho.downloadURL;
      } else {
         console.warn("[Action updatePersonaImageActionChirho] Failed to upload updated persona image via Admin SDK. Error:", uploadResultChirho.error);
         return { success: false, error: `Failed to upload updated persona image: ${uploadResultChirho.error}` };
      }
    }
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action updatePersonaImageActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseActionChirho(inputChirho: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("Server action fetchSuggestedResponseActionChirho received input:", inputChirho);
  try {
    const resultChirho = await suggestEvangelisticResponseFlowChirho(inputChirho); // Genkit flow call
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action fetchSuggestedResponseActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to fetch suggested response." };
  }
}
