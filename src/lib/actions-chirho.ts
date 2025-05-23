// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import {
  generateAiPersonaChirho,
  type GenerateAiPersonaInputChirho,
  type GenerateAiPersonaOutputChirho
} from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import {
  aiPersonaConvincingChirho,
  type AIPersonaConvincingInputChirho,
  type AIPersonaConvincingOutputChirho
} from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";
import {
  contextualGuidanceChirho,
  type ContextualGuidanceInputChirho,
  type ContextualGuidanceOutputChirho
} from "@/ai-chirho/flows-chirho/contextual-guidance-chirho";
import {
  updatePersonaVisualsChirho,
  type UpdatePersonaVisualsInputChirho,
  type UpdatePersonaVisualsOutputChirho
} from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";
import {
  suggestEvangelisticResponseChirho,
  type SuggestEvangelisticResponseInputChirho,
  type SuggestEvangelisticResponseOutputChirho
} from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";

import { dbChirho, storageChirho } from '@/lib/firebase-config-chirho';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  Timestamp,
  deleteDoc,
  type DocumentSnapshot,
  type FirestoreError
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import type { UserProfileChirho } from '@/contexts/auth-context-chirho';
import type { ArchivedConversationChirho, MessageChirho } from '@/app/[lang]/ai-personas-chirho/client-page-chirho';


const INITIAL_FREE_CREDITS_CHIRHO = 50;
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;
const ACTIVE_CONVERSATION_DOC_ID_CHIRHO = "current_active_conversation_v1";
const FREE_CREDITS_ADD_AMOUNT_CHIRHO = 25;
const FREE_CREDITS_THRESHOLD_CHIRHO = 50;


export interface ActiveConversationDataChirho {
  personaChirho: GenerateAiPersonaOutputChirho;
  messagesChirho: MessageChirho[];
  difficultyLevelChirho: number;
  currentConversationLanguageChirho: string;
  dynamicPersonaImageChirho: string | null;
  lastSaved: any;
}

// This action is now primarily intended to update lastLogin or other details if the profile exists.
// Profile creation is ideally handled by a Firebase Auth trigger using the Admin SDK.
export async function initializeUserChirho(
  userId: string,
  email: string | null,
  displayNameFromAuth?: string | null,
  photoURLFromAuth?: string | null
): Promise<{ success: boolean; error?: string; profile?: UserProfileChirho; profileExists?: boolean }> {
  console.log("[Action initializeUserChirho] Called for user:", userId);
  if (!userId) {
    const errorMsg = "User ID is required for initializeUserChirho.";
    console.error("[Action initializeUserChirho]", errorMsg);
    return { success: false, error: errorMsg, profileExists: false };
  }

  const userDocRef = doc(dbChirho, "users", userId);
  let userProfileDataToReturn: UserProfileChirho | undefined;

  try {
    console.log("[Action initializeUserChirho] Attempting to get user document for:", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      console.log("[Action initializeUserChirho] User document exists, attempting to UPDATE profile for:", userId);
      const existingData = userDocSnap.data() as UserProfileChirho;
      const updates: Record<string, any> = {
        lastLogin: serverTimestamp(),
      };
      if (displayNameFromAuth && existingData.displayName !== displayNameFromAuth) {
        updates.displayName = displayNameFromAuth;
      }
      if (photoURLFromAuth && existingData.photoURL !== photoURLFromAuth) {
        updates.photoURL = photoURLFromAuth;
      }
      if (email && existingData.email !== email) {
        updates.email = email;
      }

      try {
        await updateDoc(userDocRef, updates);
        console.log("[Action initializeUserChirho] User profile UPDATED in Firestore for:", userId, "with updates:", Object.keys(updates));
        // Attempt to read back updated data (might fail if server action doesn't have end-user auth for read)
        const updatedDocSnap = await getDoc(userDocRef);
        if (updatedDocSnap.exists()) {
            const data = updatedDocSnap.data();
            userProfileDataToReturn = {
                ...data,
                uid: userId,
                createdAt: existingData.createdAt instanceof Timestamp ? existingData.createdAt.toMillis() : (existingData.createdAt || Date.now()),
                lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toMillis() : Date.now(),
            } as UserProfileChirho;
        } else {
            userProfileDataToReturn = undefined; // Could not read back
        }
        return { success: true, profile: userProfileDataToReturn, profileExists: true };
      } catch (updateError: any) {
        const firestoreError = updateError as FirestoreError;
        const errorMsg = `Error updating user profile for ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
        console.error("[Action initializeUserChirho] While updating doc:", errorMsg, firestoreError);
        // Return existing data if update failed but doc exists
        userProfileDataToReturn = {
            ...existingData,
            uid: userId,
            createdAt: existingData.createdAt instanceof Timestamp ? existingData.createdAt.toMillis() : (existingData.createdAt || Date.now()),
            lastLogin: existingData.lastLogin instanceof Timestamp ? existingData.lastLogin.toMillis() : (existingData.lastLogin || Date.now()),
        } as UserProfileChirho;
        return { success: false, error: errorMsg, profile: userProfileDataToReturn, profileExists: true };
      }
    } else {
      // Document does not exist.
      // Under stricter rules, this server action (using client SDK) CANNOT create it
      // if the 'create' rule requires request.auth.uid == userId.
      // This should be handled by an Admin SDK trigger (e.g., onCreateUser Cloud Function).
      console.log("[Action initializeUserChirho] User document does NOT exist for:", userId, ". Profile creation should be handled by a backend trigger (e.g., Admin SDK in Cloud Function). This action will not attempt to create it.");
      return { success: true, error: "User profile document does not exist. Creation should be handled by a backend trigger.", profileExists: false };
    }
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    // This initial getDoc might fail due to permissions if doc exists but server action can't read
    const errorMsg = `Error in initializeUserChirho (likely getDoc) for ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error("[Action initializeUserChirho] General error:", errorMsg, firestoreError);
    return { success: false, error: errorMsg, profileExists: false };
  }
}


export async function fetchUserProfileFromServerChirho(userId: string): Promise<{ success: boolean; data?: UserProfileChirho; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const profileData: UserProfileChirho = {
        ...data,
        uid: userId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
        lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toMillis() : data.lastLogin,
      } as UserProfileChirho;
      return { success: true, data: profileData };
    } else {
      return { success: false, error: "User profile not found." };
    }
  } catch (error: any) {
     const firestoreError = error as FirestoreError;
    const errorMsg = `Error fetching profile for 'users/${userId}': ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error(`[Action fetchUserProfileFromServerChirho]: ${errorMsg}`, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function decrementUserCreditsChirho(userId: string, amount: number = 1): Promise<{ success: boolean; newCredits?: number; error?: string; }> {
  if (!userId) return { success: false, error: "User ID is required." };
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return { success: false, error: "User profile not found for credit decrement." };
    }
    const currentCredits = userDocSnap.data()?.credits ?? 0;
    if (currentCredits < amount) {
      if (currentCredits > 0) {
        await updateDoc(userDocRef, { credits: 0 });
        console.log(`[Action decrementUserCreditsChirho] Credits set to 0 for ${userId} as amount ${amount} exceeded balance ${currentCredits}.`);
        return { success: true, newCredits: 0 };
      }
      console.log(`[Action decrementUserCreditsChirho] Credits already 0 for ${userId}. No decrement performed.`);
      return { success: true, newCredits: 0 };
    }
    await updateDoc(userDocRef, {
      credits: increment(-amount)
    });
    const updatedUserDocSnap = await getDoc(userDocRef);
    const newCreditsAfterDecrement = updatedUserDocSnap.data()?.credits;
    console.log(`[Action decrementUserCreditsChirho] Credits decremented for ${userId}. New balance: ${newCreditsAfterDecrement}`);
    return { success: true, newCredits: newCreditsAfterDecrement };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error decrementing credits for ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error("[Action decrementUserCreditsChirho]", errorMsg, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function addFreeCreditsChirho(userId: string): Promise<{ success: boolean; newCredits?: number; error?: string }> {
  if (!userId) {
    return { success: false, error: "User ID is required for adding free credits." };
  }
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return { success: false, error: "User profile not found for adding free credits." };
    }
    const currentCredits = userDocSnap.data()?.credits ?? 0;
    if (currentCredits >= FREE_CREDITS_THRESHOLD_CHIRHO) {
      return { success: false, error: `Free credits only available if balance is below ${FREE_CREDITS_THRESHOLD_CHIRHO}.`, newCredits: currentCredits };
    }
    await updateDoc(userDocRef, {
      credits: increment(FREE_CREDITS_ADD_AMOUNT_CHIRHO)
    });
    const newCredits = (await getDoc(userDocRef)).data()?.credits;
    console.log(`[Action addFreeCreditsChirho] Added ${FREE_CREDITS_ADD_AMOUNT_CHIRHO} free credits for user ${userId}. New balance: ${newCredits}`);
    return { success: true, newCredits };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error adding free credits for ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error("[Action addFreeCreditsChirho]", errorMsg, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function generateNewPersonaChirho(input: GenerateAiPersonaInputChirho, userId: string): Promise<{ success: boolean; data?: GenerateAiPersonaOutputChirho; error?: string; }> {
  try {
    console.log(`[Action generateNewPersonaChirho] Generating persona for user ${userId}, lang: ${input.languageChirho}`);
    let resultChirho = await generateAiPersonaChirho(input);

    if (resultChirho.personaImageChirho && userId && resultChirho.personaImageChirho.startsWith('data:image')) {
      const imageName = `persona_${Date.now()}_initial_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[Action generateNewPersonaChirho] Uploading initial image ${imageName} for user ${userId}`);
      const uploadResult = await uploadImageToStorageChirho(userId, resultChirho.personaImageChirho, imageName);
      if (uploadResult.success && uploadResult.downloadURL) {
        resultChirho.personaImageChirho = uploadResult.downloadURL;
        console.log(`[Action generateNewPersonaChirho] Initial image uploaded: ${resultChirho.personaImageChirho}`);
      } else {
        console.warn("[Action generateNewPersonaChirho] Failed to upload initial persona image to Firebase Storage, using data URI as fallback. Error:", uploadResult.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (errorChirho: any) {
    console.error("[Action generateNewPersonaChirho] Error generating new persona:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to generate persona." };
  }
}

export async function sendMessageToPersonaChirho(input: AIPersonaConvincingInputChirho): Promise<{ success: boolean; data?: AIPersonaConvincingOutputChirho; error?: string; }> {
  try {
    const resultChirho = await aiPersonaConvincingChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("[Action sendMessageToPersonaChirho] Error sending message to persona:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to get persona response." };
  }
}

export async function fetchContextualGuidanceChirho(input: ContextualGuidanceInputChirho): Promise<{ success: boolean; data?: ContextualGuidanceOutputChirho; error?: string; }> {
  try {
    const resultChirho = await contextualGuidanceChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("[Action fetchContextualGuidanceChirho] Error fetching contextual guidance:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch guidance." };
  }
}

export async function updatePersonaImageChirho(input: UpdatePersonaVisualsInputChirho, userId: string): Promise<{ success: boolean; data?: UpdatePersonaVisualsOutputChirho; error?: string; }> {
  try {
    console.log(`[Action updatePersonaImageChirho] Updating image for user ${userId}, persona: ${input.personaNameChirho}`);
    let resultChirho = await updatePersonaVisualsChirho(input);

    if (resultChirho.updatedImageUriChirho && userId && resultChirho.updatedImageUriChirho.startsWith('data:image')) {
      const imageName = `persona_${Date.now()}_update_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[Action updatePersonaImageChirho] Uploading updated image ${imageName} for user ${userId}`);
      const uploadResult = await uploadImageToStorageChirho(userId, resultChirho.updatedImageUriChirho, imageName);
      if (uploadResult.success && uploadResult.downloadURL) {
        resultChirho.updatedImageUriChirho = uploadResult.downloadURL;
        console.log(`[Action updatePersonaImageChirho] Updated image uploaded: ${resultChirho.updatedImageUriChirho}`);
      } else {
        console.warn("[Action updatePersonaImageChirho] Failed to upload updated persona image to Firebase Storage, using data URI as fallback. Error:", uploadResult.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (errorChirho: any) {
    console.error("[Action updatePersonaImageChirho] Error updating persona image:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseChirho(input: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("[Server action fetchSuggestedResponseChirho] received client input:", input);
  try {
    const resultChirho = await suggestEvangelisticResponseChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho: any) {
    console.error("[Action fetchSuggestedResponseChirho] Error fetching suggested response:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch suggested response." };
  }
}

export async function uploadImageToStorageChirho(userId: string, imageDataUri: string, imageName: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
  if (!userId || !imageDataUri || !imageName) {
    console.error("[Storage Action] uploadImageToStorageChirho: Missing required parameters.", { userId: !!userId, imageDataUri: !!imageDataUri, imageName: !!imageName });
    return { success: false, error: "User ID, image data, and image name are required." };
  }
   if (!imageDataUri.startsWith('data:image')) {
    if (imageDataUri.startsWith('http')) {
        console.warn("[Storage Action] uploadImageToStorageChirho received an HTTP URL, assuming already uploaded:", imageDataUri.substring(0, 70) + "...");
        return { success: true, downloadURL: imageDataUri };
    }
    console.error("[Storage Action] uploadImageToStorageChirho: Invalid image data URI format. URI starts with:", imageDataUri.substring(0,30));
    return { success: false, error: "Invalid image data URI format." };
  }

  try {
    const storagePath = `userImages/${userId}/${imageName}.png`;
    const storageRefVal = ref(storageChirho, storagePath);
    await uploadString(storageRefVal, imageDataUri, 'data_url');
    const downloadURL = await getDownloadURL(storageRefVal);
    console.log(`[Storage Action] Image uploaded successfully for user ${userId}, image ${imageName}. URL: ${downloadURL}`);
    return { success: true, downloadURL };
  } catch (error: any) {
    console.error("[Storage Action] Error uploading image to Firebase Storage:", error);
    let errorMessage = "Failed to upload image.";
    if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
    }
    if (error.message) {
        errorMessage += ` Message: ${error.message}`;
    }
    return { success: false, error: errorMessage };
  }
}

export async function saveActiveConversationToFirestoreChirho(userId: string, activeData: ActiveConversationDataChirho): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.error("[Action saveActiveConversationToFirestoreChirho] User ID is required.");
    return { success: false, error: "User ID is required for saving active conversation." };
  }
  if (!activeData || !activeData.personaChirho) {
    console.error("[Action saveActiveConversationToFirestoreChirho] Active conversation data with persona is required.");
    return { success: false, error: "Active conversation data with persona is required."};
  }

  const activeConvDocRef = doc(dbChirho, "users", userId, "activeConversationData", ACTIVE_CONVERSATION_DOC_ID_CHIRHO);

  try {
    const dataToSave: ActiveConversationDataChirho = {
      personaChirho: {
        ...activeData.personaChirho,
        personaImageChirho: activeData.personaChirho.personaImageChirho || "", 
      },
      messagesChirho: activeData.messagesChirho.map(msg => ({
        ...msg,
        imageUrlChirho: msg.imageUrlChirho || null, 
      })),
      difficultyLevelChirho: activeData.difficultyLevelChirho || 1,
      currentConversationLanguageChirho: activeData.currentConversationLanguageChirho || 'en',
      dynamicPersonaImageChirho: activeData.dynamicPersonaImageChirho || null,
      lastSaved: serverTimestamp(),
    };

    await setDoc(activeConvDocRef, dataToSave);
    console.log(`[Action saveActiveConversationToFirestoreChirho] Successfully saved for user ${userId}. Persona: ${dataToSave.personaChirho.personaNameChirho}, Msgs: ${dataToSave.messagesChirho.length}`);
    return { success: true };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error saving active conversation for user ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error(`[Action saveActiveConversationToFirestoreChirho] ${errorMsg}`, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function fetchActiveConversationFromFirestoreChirho(userId: string): Promise<{ success: boolean; data?: ActiveConversationDataChirho; error?: string }> {
  if (!userId) {
     console.error("[Action fetchActiveConversationFromFirestoreChirho] User ID is required.");
    return { success: false, error: "User ID is required for fetching active conversation." };
  }
  console.log(`[Action fetchActiveConversationFromFirestoreChirho] Attempting to fetch for user ${userId}`);
  const activeConvDocRef = doc(dbChirho, "users", userId, "activeConversationData", ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    const docSnap = await getDoc(activeConvDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const personaChirho = data.personaChirho || {};
      const messagesChirho = (data.messagesChirho || []).map((msg: any) => ({
             ...msg,
             imageUrlChirho: msg.imageUrlChirho || null 
      }));

      const activeData: ActiveConversationDataChirho = {
        personaChirho: { 
            personaNameChirho: personaChirho.personaNameChirho || "Unknown Persona",
            personaDetailsChirho: personaChirho.personaDetailsChirho || "No details available.",
            meetingContextChirho: personaChirho.meetingContextChirho || "No context.",
            encounterTitleChirho: personaChirho.encounterTitleChirho || "Encounter",
            personaImageChirho: personaChirho.personaImageChirho || "", 
            personaNameKnownToUserChirho: personaChirho.personaNameKnownToUserChirho === true, 
        },
        messagesChirho: messagesChirho,
        difficultyLevelChirho: data.difficultyLevelChirho || 1,
        currentConversationLanguageChirho: data.currentConversationLanguageChirho || 'en',
        dynamicPersonaImageChirho: data.dynamicPersonaImageChirho || personaChirho.personaImageChirho || null,
        lastSaved: data.lastSaved instanceof Timestamp ? data.lastSaved.toMillis() : (data.lastSaved || Date.now()),
      };
      console.log(`[Action fetchActiveConversationFromFirestoreChirho] Successfully fetched for user ${userId}. Persona: ${activeData.personaChirho.personaNameChirho}, Msgs: ${activeData.messagesChirho.length}`);
      return { success: true, data: activeData };
    } else {
      console.log(`[Action fetchActiveConversationFromFirestoreChirho] No active conversation found for user ${userId}`);
      return { success: false, error: "No active conversation found." };
    }
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error fetching active conversation for user ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error(`[Action fetchActiveConversationFromFirestoreChirho] ${errorMsg}`, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function clearActiveConversationFromFirestoreChirho(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.error("[Action clearActiveConversationFromFirestoreChirho] User ID is required.");
    return { success: false, error: "User ID is required for clearing active conversation." };
  }
  console.log(`[Action clearActiveConversationFromFirestoreChirho] Attempting to clear for user ${userId}`);
  const activeConvDocRef = doc(dbChirho, "users", userId, "activeConversationData", ACTIVE_CONVERSATION_DOC_ID_CHIRHO);
  try {
    await deleteDoc(activeConvDocRef);
    console.log(`[Action clearActiveConversationFromFirestoreChirho] Successfully cleared for user ${userId}`);
    return { success: true };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    if (firestoreError.code === 'not-found') { 
        console.log(`[Action clearActiveConversationFromFirestoreChirho] Active conversation document already cleared or never existed for user ${userId}`);
        return { success: true };
    }
    const errorMsg = `Error clearing active conversation for user ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error(`[Action clearActiveConversationFromFirestoreChirho] ${errorMsg}`, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function archiveConversationToFirestoreChirho(userId: string, conversationData: ArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.error("[Action archiveConversationToFirestoreChirho] User ID is required.");
    return { success: false, error: "User ID is required." };
  }
  if (!conversationData) {
    console.error("[Action archiveConversationToFirestoreChirho] Conversation data is required.");
    return { success: false, error: "Conversation data is required." };
  }
  console.log(`[Action archiveConversationToFirestoreChirho] Attempting to archive conversation ${conversationData.id} for user ${userId}`);

  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");

  try {
    const newConvDocRef = doc(userConversationsRef, conversationData.id);
    const dataToSave = {
        ...conversationData,
        timestamp: Timestamp.fromMillis(conversationData.timestamp), 
        archivedAtServer: serverTimestamp(), 
        messagesChirho: conversationData.messagesChirho.map(msg => ({
            ...msg,
            imageUrlChirho: msg.imageUrlChirho || null
        })),
        initialPersonaImageChirho: conversationData.initialPersonaImageChirho || null, 
    };

    await setDoc(newConvDocRef, dataToSave);
    console.log(`[Action archiveConversationToFirestoreChirho] Successfully archived conversation ${conversationData.id} for user ${userId}.`);

    const q = query(userConversationsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > MAX_ARCHIVED_CONVERSATIONS_CHIRHO) {
      console.log(`[Action archiveConversationToFirestoreChirho] Pruning. Found ${snapshot.docs.length} conversations, limit is ${MAX_ARCHIVED_CONVERSATIONS_CHIRHO}.`);
      const batch = writeBatch(dbChirho);
      const docsToDelete = snapshot.docs.slice(MAX_ARCHIVED_CONVERSATIONS_CHIRHO);

      docsToDelete.forEach(docToDelete => {
        batch.delete(docToDelete.ref);
        console.log(`[Action archiveConversationToFirestoreChirho] Marking for deletion: old conversation ${docToDelete.id} for user ${userId}`);
      });
      await batch.commit();
      console.log(`[Action archiveConversationToFirestoreChirho] Pruning complete for user ${userId}. Deleted ${docsToDelete.length} conversations.`);
    } else {
      console.log(`[Action archiveConversationToFirestoreChirho] No pruning needed for user ${userId}. Conversation count: ${snapshot.docs.length}`);
    }
    return { success: true };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error archiving conversation to Firestore for user ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error("[Action archiveConversationToFirestoreChirho]", errorMsg, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function fetchArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; data?: ArchivedConversationChirho[]; error?: string }> {
  if (!userId) {
    console.error("[Action fetchArchivedConversationsFromFirestoreChirho] User ID is required.");
    return { success: false, error: "User ID is required." };
  }
  console.log(`[Action fetchArchivedConversationsFromFirestoreChirho] Attempting to fetch archived conversations for user ${userId}`);

  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  const q = query(userConversationsRef, orderBy("timestamp", "desc"), limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO));

  try {
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      const clientData: ArchivedConversationChirho = {
        id: data.id,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp,
        personaNameChirho: data.personaNameChirho,
        initialPersonaImageChirho: data.initialPersonaImageChirho || null,
        meetingContextChirho: data.meetingContextChirho,
        encounterTitleChirho: data.encounterTitleChirho || null,
        personaDetailsChirho: data.personaDetailsChirho,
        personaNameKnownToUserChirho: data.personaNameKnownToUserChirho,
        difficultyLevelChirho: data.difficultyLevelChirho,
        messagesChirho: (data.messagesChirho || []).map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            imageUrlChirho: msg.imageUrlChirho || null
        })),
        convincedChirho: data.convincedChirho,
        conversationLanguageChirho: data.conversationLanguageChirho || 'en',
        archivedAtServerMillis: data.archivedAtServer instanceof Timestamp ? data.archivedAtServer.toMillis() : (typeof data.archivedAtServer === 'number' ? data.archivedAtServer : undefined),
      };
      return clientData;
    });
    console.log(`[Action fetchArchivedConversationsFromFirestoreChirho] Fetched ${conversations.length} archived conversations for user ${userId}`);
    return { success: true, data: conversations };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error fetching archived conversations from Firestore for user ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error("[Action fetchArchivedConversationsFromFirestoreChirho]", errorMsg, firestoreError);
    return { success: false, error: errorMsg };
  }
}

export async function clearArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.error("[Action clearArchivedConversationsFromFirestoreChirho] User ID is required.");
    return { success: false, error: "User ID is required." };
  }
  console.log(`[Action clearArchivedConversationsFromFirestoreChirho] Attempting to clear all archived conversations for user ${userId}`);

  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  try {
    const snapshot = await getDocs(userConversationsRef);
    if (snapshot.empty) {
      console.log(`[Action clearArchivedConversationsFromFirestoreChirho] No archived conversations to clear for user ${userId}`);
      return { success: true };
    }
    const batch = writeBatch(dbChirho);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`[Action clearArchivedConversationsFromFirestoreChirho] Cleared all ${snapshot.docs.length} archived conversations for user ${userId}`);
    return { success: true };
  } catch (error: any) {
    const firestoreError = error as FirestoreError;
    const errorMsg = `Error clearing archived conversations from Firestore for user ${userId}: ${firestoreError.message} (Code: ${firestoreError.code})`;
    console.error("[Action clearArchivedConversationsFromFirestoreChirho]", errorMsg, firestoreError);
    return { success: false, error: errorMsg };
  }
}
