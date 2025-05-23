// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import * as adminChirho from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { Timestamp as AdminTimestamp, FieldValue as AdminFieldValue } from 'firebase-admin/firestore'; // Correct import for Admin SDK Timestamp
import type { GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import type { MessageChirho, ArchivedConversationChirho as ClientArchivedConversationChirho } from '@/app/[lang]/ai-personas-chirho/client-page-chirho'; // Assuming this is the client-side type
import type { UserProfileChirho } from '@/contexts/auth-context-chirho';

// Attempt to import service account credentials
let serviceAccountChirho: adminChirho.ServiceAccount;
try {
  serviceAccountChirho = require('../../serviceAccountChirho.json');
} catch (e) {
  console.error("CRITICAL ERROR: serviceAccountChirho.json not found or invalid. Place it in the project root. Error:", e);
  // In a real app, you might throw here or have a fallback for local dev without service account if purely client SDK was an option
}

const INITIAL_FREE_CREDITS_CHIRHO = 50;
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;
const ACTIVE_CONVERSATION_DOC_ID_CHIRHO = "current_active_conversation_v1"; // Use a constant for the doc ID
const FREE_CREDITS_ADD_AMOUNT_CHIRHO = 25;
const FREE_CREDITS_THRESHOLD_CHIRHO = 50;

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
if (!adminChirho.apps.length) {
  try {
    adminChirho.initializeApp({
      credential: adminChirho.credential.cert(serviceAccountChirho),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET // Ensure this is set in .env.local
    });
    console.log("Firebase Admin SDK initialized successfully by actions-chirho.ts.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error in actions-chirho.ts:", error);
  }
}

const adminDbChirho = adminChirho.firestore();
const adminStorageChirho = adminChirho.storage();

export interface ActiveConversationDataChirho {
  personaChirho: GenerateAiPersonaOutputChirho;
  messagesChirho: MessageChirho[];
  difficultyLevelChirho: number;
  currentConversationLanguageChirho: string;
  dynamicPersonaImageChirho: string | null;
  lastSaved: any; // Will be AdminTimestamp for Firestore, number for client
}

// Type for archived conversation as stored in Firestore (using AdminTimestamp)
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
  console.log(`[Admin Action initializeUserChirho] Called for user: ${userIdChirho}`);
  if (!userIdChirho) {
    const errorMsgChirho = "User ID is required for initializeUserChirho.";
    console.error("[Admin Action initializeUserChirho]", errorMsgChirho);
    return { success: false, error: errorMsgChirho };
  }

  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);

  try {
    const userDocSnapChirho = await userDocRefChirho.get();

    if (userDocSnapChirho.exists) {
      console.log(`[Admin Action initializeUserChirho] User document exists, updating for: ${userIdChirho}`);
      const updatesChirho: { [key: string]: any } = {
        lastLogin: AdminFieldValue.serverTimestamp(),
        email: emailChirho || null, // Ensure email is updated if changed
      };
      const existingDataChirho = userDocSnapChirho.data() as UserProfileChirho;
      if (displayNameChirho && existingDataChirho.displayName !== displayNameChirho) {
        updatesChirho.displayName = displayNameChirho;
      }
      if (photoURLChirho && existingDataChirho.photoURL !== photoURLChirho) {
        updatesChirho.photoURL = photoURLChirho;
      }
      await userDocRefChirho.update(updatesChirho);
      console.log(`[Admin Action initializeUserChirho] User profile UPDATED for: ${userIdChirho}`);
      
      // Fetch and convert for return
      const updatedDocSnapChirho = await userDocRefChirho.get();
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
      return { success: true, profileExists: true }; // Should not happen if update was successful
    } else {
      console.log(`[Admin Action initializeUserChirho] User document does NOT exist, creating for: ${userIdChirho}`);
      const newProfileDataChirho = {
        uid: userIdChirho,
        email: emailChirho || null,
        displayName: displayNameChirho || null,
        photoURL: photoURLChirho || null,
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: AdminFieldValue.serverTimestamp(),
        lastLogin: AdminFieldValue.serverTimestamp(),
      };
      await userDocRefChirho.set(newProfileDataChirho);
      console.log(`[Admin Action initializeUserChirho] User profile CREATED for: ${userIdChirho}`);
      // Convert for return after creation (timestamps will be server-generated)
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
      return { success: true, profileExists: false }; // Should not happen
    }
  } catch (error: any) {
    const errorMsgChirho = `Error in initializeUserChirho for ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action initializeUserChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function fetchUserProfileFromServerChirho(userIdChirho: string): Promise<{ success: boolean; data?: UserProfileChirho; error?: string }> {
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
  if (!userIdChirho) return { success: false, error: "User ID is required." };
  const userDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho);
  try {
    const userDocSnapChirho = await userDocRefChirho.get();
    if (!userDocSnapChirho.exists) {
      return { success: false, error: "User profile not found for credit decrement." };
    }
    const currentCreditsChirho = userDocSnapChirho.data()?.credits ?? 0;
    if (currentCreditsChirho < amountChirho) {
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
  if (!userIdChirho || !imageDataUriChirho || !imageNameChirho) {
    return { success: false, error: "User ID, image data, and image name are required." };
  }
  if (!imageDataUriChirho.startsWith('data:image')) {
     if (imageDataUriChirho.startsWith('http')) { // Already a URL
        return { success: true, downloadURL: imageDataUriChirho };
    }
    return { success: false, error: "Invalid image data URI format." };
  }

  try {
    const bucketNameChirho = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketNameChirho) {
      throw new Error("Firebase Storage bucket name is not configured in environment variables.");
    }
    const bucketChirho = adminStorageChirho.bucket(bucketNameChirho);
    const storagePathChirho = `userImages/${userIdChirho}/${imageNameChirho}.png`;
    const fileChirho = bucketChirho.file(storagePathChirho);

    const base64EncodedImageString = imageDataUriChirho.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');

    await fileChirho.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
      },
      public: true, // Make the file publicly readable
    });
    
    // Construct the public URL (standard format for public GCS files)
    // Note: getSignedUrl() with a long expiry is another option if you don't want them fully public indefinitely.
    // For simplicity and if images are meant to be easily displayed, making them public is often done.
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
  if (!userIdChirho) {
    return { success: false, error: "User ID is required for fetching active conversation." };
  }
  const activeConvDocRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("activeConversationData").doc(ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    const docSnapChirho = await activeConvDocRefChirho.get();
    if (docSnapChirho.exists) {
      const dataChirho = docSnapChirho.data();
      if (dataChirho) {
        const activeDataChirho: ActiveConversationDataChirho = {
          ...dataChirho,
          lastSaved: (dataChirho.lastSaved as AdminTimestamp)?.toMillis() || Date.now(),
        } as ActiveConversationDataChirho; // Cast carefully
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
        return { success: true }; // Treat as success if it's already gone
    }
    const errorMsgChirho = `Error clearing active conversation for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error(`[Admin Action clearActiveConversationFromFirestoreChirho] ${errorMsgChirho}`, error);
    return { success: false, error: errorMsgChirho };
  }
}

export async function archiveConversationToFirestoreChirho(userIdChirho: string, conversationDataChirho: ClientArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!userIdChirho || !conversationDataChirho) {
    return { success: false, error: "User ID and conversation data are required." };
  }
  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  try {
    const newConvDocRefChirho = userConversationsRefChirho.doc(conversationDataChirho.id);
    const dataToSaveChirho: FirestoreArchivedConversationChirho = {
      ...conversationDataChirho,
      timestamp: AdminTimestamp.fromMillis(conversationDataChirho.timestamp),
      archivedAtServer: AdminFieldValue.serverTimestamp() as AdminTimestamp, // serverTimestamp() result needs cast
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
  if (!userIdChirho) {
    return { success: false, error: "User ID is required." };
  }
  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  const qChirho = userConversationsRefChirho.orderBy("timestamp", "desc").limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO);
  try {
    const snapshotChirho = await qChirho.get();
    const conversationsChirho: ClientArchivedConversationChirho[] = snapshotChirho.docs.map(docSnapshotChirho => {
      const dataChirho = docSnapshotChirho.data() as FirestoreArchivedConversationChirho;
      return {
        ...dataChirho,
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
  if (!userIdChirho) {
    return { success: false, error: "User ID is required." };
  }
  const userConversationsRefChirho = adminDbChirho.collection("users").doc(userIdChirho).collection("archivedConversations");
  try {
    const snapshotChirho = await userConversationsRefChirho.get();
    if (snapshotChirho.empty) {
      console.log(`[Admin Action clearArchivedConversationsFromFirestoreChirho] No archived conversations for user ${userIdChirho}`);
      return { success: true };
    }
    const batchChirho = adminDbChirho.batch();
    snapshotChirho.docs.forEach(docChirho => batchChirho.delete(docChirho.ref));
    await batchChirho.commit();
    console.log(`[Admin Action clearArchivedConversationsFromFirestoreChirho] Cleared all ${snapshotChirho.docs.length} archived conversations for user ${userIdChirho}`);
    return { success: true };
  } catch (error: any) {
    const errorMsgChirho = `Error clearing archived conversations for user ${userIdChirho}: ${error.message} (Code: ${error.code})`;
    console.error("[Admin Action clearArchivedConversationsFromFirestoreChirho]", errorMsgChirho, error);
    return { success: false, error: errorMsgChirho };
  }
}

// Note: Genkit flow wrappers (generateNewPersonaActionChirho, etc.) will remain as they are,
// but the underlying AI flows they call might need adjustments if their input/output schemas change
// due to how image URLs are handled now (i.e., they still deal with data URIs, and the action layer converts to/from storage URLs).
// For now, the Genkit flow wrappers are omitted as they call the Admin SDK enabled functions directly.
// The actual AI flow calls are now encapsulated within these Admin SDK enabled action functions.
// If `generateNewPersonaChirho` (the AI flow) itself needs to be called by a Server Action,
// ensure it's wrapped appropriately or its direct callers handle the Admin SDK context.

// Example structure if AI flows are called directly from actions.
// The functions below are wrappers for your Genkit flows.
// They should now be using the Admin SDK enabled helper functions where appropriate,
// especially for image uploads if the Genkit flows return data URIs.

import {
  generateAiPersonaChirho as generateAiPersonaFlowChirho, // Genkit flow
  type GenerateAiPersonaInputChirho,
  // type GenerateAiPersonaOutputChirho // Already defined
} from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";

import {
  aiPersonaConvincingChirho as aiPersonaConvincingFlowChirho, // Genkit flow
  type AIPersonaConvincingInputChirho,
  type AIPersonaConvincingOutputChirho
} from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";

import {
  contextualGuidanceChirho as contextualGuidanceFlowChirho, // Genkit flow
  type ContextualGuidanceInputChirho,
  type ContextualGuidanceOutputChirho
} from "@/ai-chirho/flows-chirho/contextual-guidance-chirho";

import {
  updatePersonaVisualsChirho as updatePersonaVisualsFlowChirho, // Genkit flow
  type UpdatePersonaVisualsInputChirho,
  type UpdatePersonaVisualsOutputChirho
} from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";

import {
  suggestEvangelisticResponseChirho as suggestEvangelisticResponseFlowChirho, // Genkit flow
  type SuggestEvangelisticResponseInputChirho,
  type SuggestEvangelisticResponseOutputChirho
} from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";


export async function generateNewPersonaActionChirho(inputChirho: GenerateAiPersonaInputChirho, userIdChirho: string): Promise<{ success: boolean; data?: GenerateAiPersonaOutputChirho; error?: string; }> {
  try {
    let resultChirho = await generateAiPersonaFlowChirho(inputChirho);
    if (resultChirho.personaImageChirho && userIdChirho) {
      const imageNameChirho = `persona_${Date.now()}_initial_${Math.random().toString(36).substring(2, 7)}`;
      const uploadResultChirho = await uploadImageToStorageChirho(userIdChirho, resultChirho.personaImageChirho, imageNameChirho);
      if (uploadResultChirho.success && uploadResultChirho.downloadURL) {
        resultChirho.personaImageChirho = uploadResultChirho.downloadURL;
      } else {
        console.warn("[Action generateNewPersonaActionChirho] Failed to upload initial persona image, using data URI as fallback. Error:", uploadResultChirho.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate persona." };
  }
}

export async function sendMessageToPersonaActionChirho(inputChirho: AIPersonaConvincingInputChirho): Promise<{ success: boolean; data?: AIPersonaConvincingOutputChirho; error?: string; }> {
  try {
    const resultChirho = await aiPersonaConvincingFlowChirho(inputChirho);
    return { success: true, data: resultChirho };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to get persona response." };
  }
}

export async function fetchContextualGuidanceActionChirho(inputChirho: ContextualGuidanceInputChirho): Promise<{ success: boolean; data?: ContextualGuidanceOutputChirho; error?: string; }> {
  try {
    const resultChirho = await contextualGuidanceFlowChirho(inputChirho);
    return { success: true, data: resultChirho };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch guidance." };
  }
}

export async function updatePersonaImageActionChirho(inputChirho: UpdatePersonaVisualsInputChirho, userIdChirho: string): Promise<{ success: boolean; data?: UpdatePersonaVisualsOutputChirho; error?: string; }> {
  try {
    let resultChirho = await updatePersonaVisualsFlowChirho(inputChirho);
    if (resultChirho.updatedImageUriChirho && userIdChirho) {
      const imageNameChirho = `persona_${Date.now()}_update_${Math.random().toString(36).substring(2, 7)}`;
      const uploadResultChirho = await uploadImageToStorageChirho(userIdChirho, resultChirho.updatedImageUriChirho, imageNameChirho);
      if (uploadResultChirho.success && uploadResultChirho.downloadURL) {
        resultChirho.updatedImageUriChirho = uploadResultChirho.downloadURL;
      } else {
         console.warn("[Action updatePersonaImageActionChirho] Failed to upload updated persona image, using data URI as fallback. Error:", uploadResultChirho.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseActionChirho(inputChirho: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("[Server action fetchSuggestedResponseActionChirho] received client input:", inputChirho);
  try {
    const resultChirho = await suggestEvangelisticResponseFlowChirho(inputChirho);
    return { success: true, data: resultChirho };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch suggested response." };
  }
}
