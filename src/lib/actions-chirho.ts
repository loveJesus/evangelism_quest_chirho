// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import * as adminChirho from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { Timestamp as AdminTimestamp, FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import type { GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import type { MessageChirho, ArchivedConversationChirho as ClientArchivedConversationChirho } from '@/app/[lang]/ai-personas-chirho/client-page-chirho';
import type { UserProfileChirho } from '@/contexts/auth-context-chirho';

// --- Firebase Admin SDK Initialization ---
let serviceAccountChirho: adminChirho.ServiceAccount | undefined;
let adminAppChirho: adminChirho.app.App | undefined;
let adminDbChirho: adminChirho.firestore.Firestore | undefined;
let adminStorageChirho: adminChirho.storage.Storage | undefined;

const INITIAL_FREE_CREDITS_CHIRHO = 50;
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;
const ACTIVE_CONVERSATION_DOC_ID_CHIRHO = "current_active_conversation_v1";
const FREE_CREDITS_ADD_AMOUNT_CHIRHO = 25;
const FREE_CREDITS_THRESHOLD_CHIRHO = 50;

try {
  // Check if running in a Node.js environment where `require` is available
  if (typeof require !== 'undefined') {
    serviceAccountChirho = require('../../serviceAccountChirho.json');
    console.log("[Admin Action Init] serviceAccountChirho.json loaded successfully.");
  } else {
    console.warn("[Admin Action Init] `require` is not available. Assuming service account JSON is handled by environment variables (e.g., GOOGLE_APPLICATION_CREDENTIALS) or service account already configured for this environment.");
    // For environments like Firebase Functions or Cloud Run, service account might be auto-configured.
    // If GOOGLE_APPLICATION_CREDENTIALS env var is set pointing to the JSON file, it might also work.
  }

  if (adminChirho.apps.length === 0) {
    console.log("[Admin Action Init] No Firebase Admin apps initialized. Attempting to initialize default app...");
    if (serviceAccountChirho) {
      adminAppChirho = adminChirho.initializeApp({
        credential: adminChirho.credential.cert(serviceAccountChirho),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
      console.log("[Admin Action Init] Default Firebase Admin app INITIALIZED with service account JSON. App Name:", adminAppChirho.name);
    } else {
      // Attempt to initialize without explicit credentials, relying on ADC or pre-configured environment
      adminAppChirho = adminChirho.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
      console.log("[Admin Action Init] Default Firebase Admin app INITIALIZED (likely via ADC or environment). App Name:", adminAppChirho.name);
    }
  } else {
    adminAppChirho = adminChirho.app(); // Get the default app if already initialized
    console.log("[Admin Action Init] Firebase Admin app already exists. Retrieved default app. App Name:", adminAppChirho.name);
  }

  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    console.error("CRITICAL ERROR: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not defined in environment variables. Storage operations will fail.");
  }

  if (adminAppChirho) {
    adminDbChirho = adminChirho.firestore(adminAppChirho);
    adminStorageChirho = adminChirho.storage(adminAppChirho);
    console.log("[Admin Action Init] Firestore and Storage services obtained from Admin app.");
  } else {
    console.error("[Admin Action Init] CRITICAL: Firebase Admin app instance is undefined after initialization attempts. Firestore and Storage services will not be available for server actions.");
  }

} catch (e: any) {
  console.error("[Admin Action Init] CRITICAL ERROR initializing Firebase Admin SDK in actions-chirho.ts:", e.message, e.stack);
  // If initialization fails, adminDbChirho and adminStorageChirho will remain undefined.
  // Subsequent calls to actions using them will fail, which is expected.
}
// --- End Firebase Admin SDK Initialization ---


export interface ActiveConversationDataChirho {
  personaChirho: GenerateAiPersonaOutputChirho;
  messagesChirho: MessageChirho[];
  difficultyLevelChirho: number;
  currentConversationLanguageChirho: string;
  dynamicPersonaImageChirho: string | null;
  lastSaved: any; 
}

interface FirestoreArchivedConversationChirho extends Omit<ClientArchivedConversationChirho, 'timestamp' | 'archivedAtServerMillis'> {
  timestamp: AdminTimestamp;
  archivedAtServer: AdminTimestamp;
}

export async function initializeUserChirho(
  userIdChirho: string,
  emailChirho: string | null,
  displayNameChirho?: string | null,
  photoURLChirho?: string | null
): Promise<{ success: boolean; error?: string; profile?: UserProfileChirho, profileExists?: boolean }> {
  console.log(`[Admin Action initializeUserChirho] Called for user: ${userIdChirho}. Email: ${emailChirho}`);
  if (!adminDbChirho) {
    const errorMsg = "CRITICAL: Firestore Admin SDK not initialized. Cannot initialize user.";
    console.error("[Admin Action initializeUserChirho]", errorMsg);
    return { success: false, error: errorMsg };
  }
  if (!userIdChirho) {
    const errorMsgChirho = "User ID is required for initializeUserChirho.";
    console.error("[Admin Action initializeUserChirho]", errorMsgChirho);
    return { success: false, error: errorMsgChirho };
  }

  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);

  try {
    console.log(`[Admin Action initializeUserChirho] Attempting to get document: users/${userIdChirho}`);
    const userDocSnapChirho = await userDocRefChirho.get();

    if (userDocSnapChirho.exists) {
      console.log(`[Admin Action initializeUserChirho] Document users/${userIdChirho} exists. Attempting update.`);
      const updatesChirho: { [key: string]: any } = {
        lastLogin: AdminFieldValue.serverTimestamp(),
        email: emailChirho || null,
      };
      const existingDataChirho = userDocSnapChirho.data();
      if (displayNameChirho && existingDataChirho?.displayName !== displayNameChirho) {
        updatesChirho.displayName = displayNameChirho;
      }
      if (photoURLChirho && existingDataChirho?.photoURL !== photoURLChirho) {
        updatesChirho.photoURL = photoURLChirho;
      }
      
      await userDocRefChirho.update(updatesChirho);
      console.log(`[Admin Action initializeUserChirho] User profile UPDATED for: ${userIdChirho}`);
      
      const updatedDocSnapChirho = await userDocRefChirho.get(); // Re-fetch to get server-generated timestamps
      const dataChirho = updatedDocSnapChirho.data();
      if (dataChirho) {
        const profileChirho: UserProfileChirho = {
          uid: userIdChirho,
          email: dataChirho.email,
          displayName: dataChirho.displayName,
          photoURL: dataChirho.photoURL,
          credits: dataChirho.credits,
          createdAt: (dataChirho.createdAt as AdminTimestamp)?.toMillis() || Date.now(),
          lastLogin: (dataChirho.lastLogin as AdminTimestamp)?.toMillis() || Date.now(),
        };
        return { success: true, profile: profileChirho, profileExists: true };
      }
      // Should not happen if update was successful and data exists
      return { success: false, error: "Failed to retrieve profile data after update.", profileExists: true };

    } else {
      console.log(`[Admin Action initializeUserChirho] Document users/${userIdChirho} does NOT exist. Attempting to create.`);
      const newProfileDataChirho = {
        uid: userIdChirho, // Crucial for the 'allow create' rule if it were client-side
        email: emailChirho || null,
        displayName: displayNameChirho || "Evangelism Quest User", // Provide a default display name
        photoURL: photoURLChirho || null,
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: AdminFieldValue.serverTimestamp(),
        lastLogin: AdminFieldValue.serverTimestamp(),
      };
      await userDocRefChirho.set(newProfileDataChirho);
      console.log(`[Admin Action initializeUserChirho] User profile CREATED for: ${userIdChirho}`);

      // Fetch and convert for return after creation
      const createdDocSnapChirho = await userDocRefChirho.get();
      const dataChirho = createdDocSnapChirho.data();
      if (dataChirho) {
        const profileChirho: UserProfileChirho = {
          uid: userIdChirho,
          email: dataChirho.email,
          displayName: dataChirho.displayName,
          photoURL: dataChirho.photoURL,
          credits: dataChirho.credits,
          createdAt: (dataChirho.createdAt as AdminTimestamp)?.toMillis() || Date.now(),
          lastLogin: (dataChirho.lastLogin as AdminTimestamp)?.toMillis() || Date.now(),
        };
        return { success: true, profile: profileChirho, profileExists: false };
      }
       // Should not happen if create was successful and data exists
      return { success: false, error: "Failed to retrieve profile data after creation.", profileExists: false };
    }
  } catch (error: any) {
    const errorMsgChirho = `Error in initializeUserChirho for ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action initializeUserChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}


export async function fetchUserProfileFromServerChirho(userIdChirho: string): Promise<{ success: boolean; data?: UserProfileChirho; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
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
          createdAt: (dataChirho.createdAt as AdminTimestamp).toMillis(),
          lastLogin: (dataChirho.lastLogin as AdminTimestamp)?.toMillis(),
        };
        return { success: true, data: profileDataChirho };
      }
      return { success: false, error: "User profile data is malformed." };
    } else {
      return { success: false, error: "User profile not found." };
    }
  } catch (error: any) {
    const errorMsgChirho = `Error fetching profile for 'users/${userIdChirho}': ${error.message} (Code: ${error.code})`;
    console.error(`[Admin Action fetchUserProfileFromServerChirho]: ${errorMsgChirho}`, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function decrementUserCreditsChirho(userIdChirho: string, amountChirho: number = 1): Promise<{ success: boolean; newCredits?: number; error?: string; }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho) return { success: false, error: "User ID is required." };
  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  try {
    const userDocSnapChirho = await userDocRefChirho.get();
    if (!userDocSnapChirho.exists) {
      return { success: false, error: "User profile not found for credit decrement." };
    }
    const currentCreditsChirho = userDocSnapChirho.data()?.credits ?? 0;
    if (currentCreditsChirho < amountChirho) {
      // Don't let credits go negative if decrementing by more than available.
      // Set to 0 and report success with 0 credits.
      await userDocRefChirho.update({ credits: 0 });
      console.log(`[Admin Action decrementUserCreditsChirho] Credits set to 0 for ${userIdChirho} as amount ${amountChirho} exceeded balance ${currentCreditsChirho}.`);
      return { success: true, newCredits: 0 };
    }
    await userDocRefChirho.update({
      credits: AdminFieldValue.increment(-amountChirho)
    });
    const updatedUserDocSnapChirho = await userDocRefChirho.get();
    const newCreditsAfterDecrementChirho = updatedUserDocSnapChirho.data()?.credits;
    console.log(`[Admin Action decrementUserCreditsChirho] Credits decremented for ${userIdChirho}. New balance: ${newCreditsAfterDecrementChirho}`);
    return { success: true, newCredits: newCreditsAfterDecrementChirho };
  } catch (error: any) {
    const errorMsgChirho = `Error decrementing credits for ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action decrementUserCreditsChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function addFreeCreditsChirho(userIdChirho: string): Promise<{ success: boolean; newCredits?: number; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for adding free credits." };
  }
  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  try {
    const userDocSnapChirho = await userDocRefChirho.get();
    if (!userDocSnapChirho.exists) {
      return { success: false, error: "User profile not found for adding free credits." };
    }
    const currentCreditsChirho = userDocSnapChirho.data()?.credits ?? 0;
    if (currentCreditsChirho >= FREE_CREDITS_THRESHOLD_CHIRHO) {
      return { success: false, error: `Free credits only available if balance is below ${FREE_CREDITS_THRESHOLD_CHIRHO}.`, newCredits: currentCreditsChirho };
    }
    await userDocRefChirho.update({
      credits: AdminFieldValue.increment(FREE_CREDITS_ADD_AMOUNT_CHIRHO)
    });
    const newCreditsChirho = (await userDocRefChirho.get()).data()?.credits;
    console.log(`[Admin Action addFreeCreditsChirho] Added ${FREE_CREDITS_ADD_AMOUNT_CHIRHO} free credits for user ${userIdChirho}. New balance: ${newCreditsChirho}`);
    return { success: true, newCredits: newCreditsChirho };
  } catch (error: any) {
    const errorMsgChirho = `Error adding free credits for ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action addFreeCreditsChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function uploadImageToStorageChirho(userIdChirho: string, imageDataUriChirho: string, imageNameChirho: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
  if (!adminStorageChirho) return { success: false, error: "Storage Admin SDK not initialized." };
  if (!userIdChirho || !imageDataUriChirho || !imageNameChirho) {
    return { success: false, error: "User ID, image data, and image name are required." };
  }
  
  const bucketNameChirho = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketNameChirho) {
    const errorMsg = "Firebase Storage bucket name is not configured in environment variables.";
    console.error("[Admin Action uploadImageToStorageChirho]", errorMsg);
    return { success: false, error: errorMsg };
  }

  if (imageDataUriChirho.startsWith('http')) { // Already a URL, likely from a previous upload
    return { success: true, downloadURL: imageDataUriChirho };
  }
  if (!imageDataUriChirho.startsWith('data:image')) {
    return { success: false, error: "Invalid image data URI format." };
  }

  try {
    const bucketChirho = adminStorageChirho.bucket(bucketNameChirho);
    const storagePathChirho = `userImages/${userIdChirho}/${imageNameChirho}.png`;
    const fileChirho = bucketChirho.file(storagePathChirho);

    const base64EncodedImageString = imageDataUriChirho.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');

    await fileChirho.save(imageBuffer, {
      metadata: { contentType: 'image/png' },
      public: true, // Make the file publicly readable by default
    });
    
    // Construct the public URL. This format is standard for public GCS files.
    const downloadURL = `https://storage.googleapis.com/${bucketNameChirho}/${storagePathChirho}`;
    
    console.log(`[Admin Action uploadImageToStorageChirho] Image uploaded successfully for user ${userIdChirho}. URL: ${downloadURL}`);
    return { success: true, downloadURL };
  } catch (error: any) {
    const errorMsgChirho = `Error uploading image to Firebase Storage: ${error.message}`;
    console.error("[Admin Action uploadImageToStorageChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}


export async function saveActiveConversationToFirestoreChirho(userIdChirho: string, activeDataChirho: ActiveConversationDataChirho): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho || !activeDataChirho || !activeDataChirho.personaChirho) {
    return { success: false, error: "User ID and active conversation data (with persona) are required." };
  }
  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    const dataToSaveChirho = {
      ...activeDataChirho,
      lastSaved: AdminFieldValue.serverTimestamp(),
    };
    await activeConvDocRefChirho.set(dataToSaveChirho);
    console.log(`[Admin Action saveActiveConversationToFirestoreChirho] Saved for user ${userIdChirho}. Persona: ${activeDataChirho.personaChirho.personaNameChirho}`);
    return { success: true };
  } catch (error: any) {
    const errorMsgChirho = `Error saving active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error(`[Admin Action saveActiveConversationToFirestoreChirho] ${errorMsgChirho}`, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function fetchActiveConversationFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; data?: ActiveConversationDataChirho; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for fetching active conversation." };
  }
  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    const docSnapChirho = await activeConvDocRefChirho.get();
    if (docSnapChirho.exists) {
      const dataChirho = docSnapChirho.data();
      if (dataChirho) {
        // Convert Firestore Timestamps to milliseconds for client-side consumption
        const convertedMessagesChirho = (dataChirho.messagesChirho as any[]).map(msg => ({
          ...msg,
          // Assuming 'timestamp' on messages might also be a server timestamp if saved that way,
          // but more likely it's a client-generated number. Adjust if necessary.
        }));

        const activeDataChirho: ActiveConversationDataChirho = {
          ...dataChirho,
          messagesChirho: convertedMessagesChirho,
          lastSaved: (dataChirho.lastSaved as AdminTimestamp)?.toMillis() || Date.now(),
        } as ActiveConversationDataChirho;
        console.log(`[Admin Action fetchActiveConversationFromFirestoreChirho] Fetched for user ${userIdChirho}.`);
        return { success: true, data: activeDataChirho };
      }
      return { success: false, error: "Active conversation data malformed." };
    } else {
      return { success: false, error: "No active conversation found." };
    }
  } catch (error: any) {
    const errorMsgChirho = `Error fetching active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error(`[Admin Action fetchActiveConversationFromFirestoreChirho] ${errorMsgChirho}`, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function clearActiveConversationFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for clearing active conversation." };
  }
  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    await activeConvDocRefChirho.delete();
    console.log(`[Admin Action clearActiveConversationFromFirestoreChirho] Cleared for user ${userIdChirho}`);
    return { success: true };
  } catch (error: any) {
     if ((error as any).code === 5) { // Firestore 'NOT_FOUND' error code
        console.log(`[Admin Action clearActiveConversationFromFirestoreChirho] Active conversation document already cleared or never existed for user ${userIdChirho}`);
        return { success: true };
    }
    const errorMsgChirho = `Error clearing active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error(`[Admin Action clearActiveConversationFromFirestoreChirho] ${errorMsgChirho}`, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function archiveConversationToFirestoreChirho(userIdChirho: string, conversationDataChirho: ClientArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho || !conversationDataChirho) {
    return { success: false, error: "User ID and conversation data are required." };
  }
  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  try {
    const newConvDocRefChirho = userConversationsRefChirho.doc(conversationDataChirho.id);
    const dataToSaveChirho: FirestoreArchivedConversationChirho = {
      ...conversationDataChirho,
      timestamp: AdminTimestamp.fromMillis(conversationDataChirho.timestamp), // Ensure client timestamp is converted
      archivedAtServer: AdminFieldValue.serverTimestamp() as AdminTimestamp,
    };
    await newConvDocRefChirho.set(dataToSaveChirho);
    console.log(`[Admin Action archiveConversationToFirestoreChirho] Archived conversation ${conversationDataChirho.id} for user ${userIdChirho}.`);

    const querySnapshotChirho = await userConversationsRefChirho.orderBy("timestamp", "desc").get();
    if (querySnapshotChirho.docs.length > MAX_ARCHIVED_CONVERSATIONS_CHIRHO) {
      const batchChirho = adminDbChirho.batch();
      const docsToDeleteChirho = querySnapshotChirho.docs.slice(MAX_ARCHIVED_CONVERSATIONS_CHIRHO);
      docsToDeleteChirho.forEach(docChirho => {
        batchChirho.delete(docChirho.ref);
        console.log(`[Admin Action archiveConversationToFirestoreChirho] Marking for deletion old conversation ${docChirho.id}`);
      });
      await batchChirho.commit();
      console.log(`[Admin Action archiveConversationToFirestoreChirho] Pruning complete. Deleted ${docsToDeleteChirho.length} old conversations.`);
    }
    return { success: true };
  } catch (error: any) {
    const errorMsgChirho = `Error archiving conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action archiveConversationToFirestoreChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function fetchArchivedConversationsFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; data?: ClientArchivedConversationChirho[]; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required." };
  }
  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  const qChirho = userConversationsRefChirho.orderBy("timestamp", "desc").limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO);
  try {
    const snapshotChirho = await qChirho.get();
    const conversationsChirho: ClientArchivedConversationChirho[] = snapshotChirho.docs.map(docSnapshotChirho => {
      const dataChirho = docSnapshotChirho.data() as FirestoreArchivedConversationChirho;
      // Convert Firestore Timestamps to milliseconds for client-side consumption
      const convertedMessagesChirho = (dataChirho.messagesChirho as any[]).map(msg => ({
        ...msg,
        // Assuming 'timestamp' on messages is already a number. If it's a Firestore Timestamp:
        // timestamp: (msg.timestamp as AdminTimestamp)?.toMillis() || msg.timestamp,
      }));
      return {
        ...dataChirho,
        messagesChirho: convertedMessagesChirho,
        timestamp: (dataChirho.timestamp as AdminTimestamp).toMillis(),
        archivedAtServerMillis: (dataChirho.archivedAtServer as AdminTimestamp)?.toMillis(),
      };
    });
    console.log(`[Admin Action fetchArchivedConversationsFromFirestoreChirho] Fetched ${conversationsChirho.length} archived conversations for user ${userIdChirho}`);
    return { success: true, data: conversationsChirho };
  } catch (error: any) {
    const errorMsgChirho = `Error fetching archived conversations for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action fetchArchivedConversationsFromFirestoreChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function clearArchivedConversationsFromFirestoreChirho(userIdChirho: string): Promise<{ success: boolean; error?: string }> {
  if (!adminDbChirho) return { success: false, error: "Firestore Admin SDK not initialized." };
  if (!userIdChirho) {
    return { success: false, error: "User ID is required." };
  }
  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  try {
    const snapshotChirho = await userConversationsRefChirho.limit(500).get(); // Limit batch size for deletion
    if (snapshotChirho.empty) {
      console.log(`[Admin Action clearArchivedConversationsFromFirestoreChirho] No archived conversations for user ${userIdChirho}`);
      return { success: true };
    }
    const batchChirho = adminDbChirho.batch();
    snapshotChirho.docs.forEach(docChirho => batchChirho.delete(docChirho.ref));
    await batchChirho.commit();
    // If there were more than 500, this might need to be called multiple times by the client,
    // or a more robust batched delete implemented (e.g., via a Callable Function).
    console.log(`[Admin Action clearArchivedConversationsFromFirestoreChirho] Cleared ${snapshotChirho.docs.length} archived conversations for user ${userIdChirho}`);
    return { success: true };
  } catch (error: any) {
    const errorMsgChirho = `Error clearing archived conversations for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action clearArchivedConversationsFromFirestoreChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}


// --- Genkit Flow Wrapper Actions ---
// These actions now use the Admin SDK enabled helper functions where appropriate,
// especially for image uploads if the Genkit flows return data URIs.

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
    let resultChirho = await generateAiPersonaFlowChirho(inputChirho);
    if (resultChirho.personaImageChirho && userIdChirho) {
      const imageNameChirho = `persona_${Date.now()}_initial_${Math.random().toString(36).substring(2, 7)}`;
      const uploadResultChirho = await uploadImageToStorageChirho(userIdChirho, resultChirho.personaImageChirho, imageNameChirho);
      if (uploadResultChirho.success && uploadResultChirho.downloadURL) {
        resultChirho.personaImageChirho = uploadResultChirho.downloadURL;
        console.log("[Action generateNewPersonaActionChirho] Image uploaded, URL:", resultChirho.personaImageChirho);
      } else {
        console.warn("[Action generateNewPersonaActionChirho] Failed to upload initial persona image, using data URI as fallback. Error:", uploadResultChirho.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action generateNewPersonaActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to generate persona." };
  }
}

export async function sendMessageToPersonaActionChirho(inputChirho: AIPersonaConvincingInputChirho): Promise<{ success: boolean; data?: AIPersonaConvincingOutputChirho; error?: string; }> {
  console.log("[Action sendMessageToPersonaActionChirho] Called with input:", inputChirho);
  try {
    const resultChirho = await aiPersonaConvincingFlowChirho(inputChirho);
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action sendMessageToPersonaActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to get persona response." };
  }
}

export async function fetchContextualGuidanceActionChirho(inputChirho: ContextualGuidanceInputChirho): Promise<{ success: boolean; data?: ContextualGuidanceOutputChirho; error?: string; }> {
  console.log("[Action fetchContextualGuidanceActionChirho] Called with input:", inputChirho);
  try {
    const resultChirho = await contextualGuidanceFlowChirho(inputChirho);
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action fetchContextualGuidanceActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to fetch guidance." };
  }
}

export async function updatePersonaImageActionChirho(inputChirho: UpdatePersonaVisualsInputChirho, userIdChirho: string): Promise<{ success: boolean; data?: UpdatePersonaVisualsOutputChirho; error?: string; }> {
  console.log("[Action updatePersonaImageActionChirho] Called with input for user:", userIdChirho, "Visual prompt:", inputChirho.newVisualPromptChirho);
  try {
    let resultChirho = await updatePersonaVisualsFlowChirho(inputChirho);
    if (resultChirho.updatedImageUriChirho && userIdChirho) {
      const imageNameChirho = `persona_${Date.now()}_update_${Math.random().toString(36).substring(2, 7)}`;
      const uploadResultChirho = await uploadImageToStorageChirho(userIdChirho, resultChirho.updatedImageUriChirho, imageNameChirho);
      if (uploadResultChirho.success && uploadResultChirho.downloadURL) {
        resultChirho.updatedImageUriChirho = uploadResultChirho.downloadURL;
        console.log("[Action updatePersonaImageActionChirho] Image updated and uploaded, URL:", resultChirho.updatedImageUriChirho);
      } else {
         console.warn("[Action updatePersonaImageActionChirho] Failed to upload updated persona image, using data URI as fallback. Error:", uploadResultChirho.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action updatePersonaImageActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseActionChirho(inputChirho: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("[Action fetchSuggestedResponseActionChirho] Server action received client input:", inputChirho);
  try {
    const resultChirho = await suggestEvangelisticResponseFlowChirho(inputChirho);
    return { success: true, data: resultChirho };
  } catch (error: any) {
    console.error("[Action fetchSuggestedResponseActionChirho] Error:", error);
    return { success: false, error: error.message || "Failed to fetch suggested response." };
  }
}
