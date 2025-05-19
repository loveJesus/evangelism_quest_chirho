// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import { generateAiPersonaChirho, type GenerateAiPersonaInputChirho, type GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import { aiPersonaConvincingChirho, type AIPersonaConvincingInputChirho, type AIPersonaConvincingOutputChirho } from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";
import { contextualGuidanceChirho, type ContextualGuidanceInputChirho, type ContextualGuidanceOutputChirho } from "@/ai-chirho/flows-chirho/contextual-guidance-chirho";
import { updatePersonaVisualsChirho, type UpdatePersonaVisualsInputChirho, type UpdatePersonaVisualsOutputChirho } from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";
import { suggestEvangelisticResponseChirho, type SuggestEvangelisticResponseInputChirho, type SuggestEvangelisticResponseOutputChirho } from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";

import { dbChirho, storageChirho } from '@/lib/firebase-config-chirho'; 
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, collection, query, orderBy, limit, getDocs, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore'; // Added Timestamp
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage"; 
import type { UserProfileChirho } from '@/contexts/auth-context-chirho'; 
import type { ArchivedConversationChirho as ClientArchivedConversationChirho } from '@/app/ai-personas-chirho/page'; // Use client-defined type for return

const INITIAL_FREE_CREDITS_CHIRHO = 100;
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10; 

// Helper to convert data URI to Blob
function dataUriToBlobChirho(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export async function uploadImageToStorageChirho(userId: string, imageDataUri: string, imageName: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
  if (!userId || !imageDataUri || !imageName) {
    return { success: false, error: "User ID, image data, and image name are required." };
  }
  if (!imageDataUri.startsWith('data:image')) {
    if (imageDataUri.startsWith('http')) {
        console.warn("[Storage Action] uploadImageToStorageChirho received an HTTP URL, assuming already uploaded:", imageDataUri.substring(0, 50) + "...");
        return { success: true, downloadURL: imageDataUri };
    }
    return { success: false, error: "Invalid image data URI format." };
  }

  try {
    const storageRefVal = ref(storageChirho, `userImages/${userId}/${imageName}.png`);
    
    console.log(`[Storage Action] Attempting to upload image to: userImages/${userId}/${imageName}.png`);
    await uploadString(storageRefVal, imageDataUri, 'data_url');
    const downloadURL = await getDownloadURL(storageRefVal);
    console.log(`[Storage Action] Image uploaded successfully. URL: ${downloadURL}`);
    return { success: true, downloadURL };
  } catch (error: any) {
    console.error("[Storage Action] Error uploading image to Firebase Storage:", error);
    return { success: false, error: error.message || "Failed to upload image." };
  }
}


export async function initializeUserChirho(userId: string, email: string | null, displayName?: string | null, photoURL?: string | null): Promise<{ success: boolean, error?: string }> {
  console.log("[Action initializeUserChirho] Called for user:", userId);
  if (!userId) {
    console.error("initializeUserChirho Action: userId is required.");
    return { success: false, error: "User ID is required." };
  }
  
  const userDocRef = doc(dbChirho, "users", userId);
  
  try {
    console.log("[Action initializeUserChirho] Attempting to get user document for:", userId);
    const userDocSnap = await getDoc(userDocRef);
    console.log("[Action initializeUserChirho] User document snapshot exists for", userId, ":", userDocSnap.exists());

    if (!userDocSnap.exists()) {
      console.log("[Action initializeUserChirho] User document does not exist, creating new profile for:", userId);
      const newUserProfile: UserProfileChirho = {
        uid: userId,
        email: email,
        displayName: displayName || email?.split('@')[0] || "User",
        photoURL: photoURL || null,
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserProfile);
      console.log("[Action initializeUserChirho] New user profile created in Firestore for:", userId);
    } else {
      console.log("[Action initializeUserChirho] User document exists, updating profile for:", userId);
      const existingData = userDocSnap.data() as UserProfileChirho;
      const updates: { lastLogin: any; displayName?: string | null; photoURL?: string | null } = {
        lastLogin: serverTimestamp(),
      };
      if (displayName && (existingData.displayName !== displayName || existingData.displayName === "User" || (existingData.email && existingData.displayName === existingData.email.split('@')[0]))) {
        updates.displayName = displayName;
      }
      if (photoURL && existingData.photoURL !== photoURL) {
        updates.photoURL = photoURL;
      }
      await updateDoc(userDocRef, updates);
      console.log("[Action initializeUserChirho] User profile updated in Firestore for:", userId, "with updates:", Object.keys(updates).length > 1 ? updates : { lastLogin: "updated" });
    }
    return { success: true };
  } catch (error: any) {
    console.error("[Action initializeUserChirho] Firestore error for user", userId, ":", error.code, error.message, error);
    // Return the error message so the client can potentially display it or log it
    return { success: false, error: `Failed to initialize user profile: ${error.message} (Code: ${error.code})` };
  }
}

export async function decrementUserCreditsChirho(userId: string, amount: number = 1): Promise<{ success: boolean; newCredits?: number; error?: string; }> {
  if (!userId) return { success: false, error: "User ID is required." };
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return { success: false, error: "User profile not found." };
    }
    const currentCredits = userDocSnap.data()?.credits || 0;
    if (currentCredits < amount) {
      return { success: false, error: "Insufficient credits.", newCredits: currentCredits };
    }
    await updateDoc(userDocRef, {
      credits: increment(-amount)
    });
    const newCredits = currentCredits - amount;
    return { success: true, newCredits };
  } catch (error: any) {
    console.error("Error decrementing user credits:", error);
    return { success: false, error: error.message || "Failed to update credits." };
  }
}

export async function addTestCreditsChirho(userId: string, amount: number): Promise<{ success: boolean; newCredits?: number; error?: string; }> {
  if (!userId) return { success: false, error: "User ID is required." };
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      return { success: false, error: "User profile not found. Cannot add credits." };
    }
    await updateDoc(userDocRef, {
      credits: increment(amount)
    });
    const currentCredits = userDocSnap.data()?.credits || 0;
    const newCredits = currentCredits + amount;
    return { success: true, newCredits };
  } catch (error: any) {
    console.error("Error adding test credits:", error);
    return { success: false, error: error.message || "Failed to add test credits." };
  }
}


export async function generateNewPersonaChirho(input: GenerateAiPersonaInputChirho, userId: string): Promise<{ success: boolean; data?: GenerateAiPersonaOutputChirho; error?: string; }> {
  try {
    let resultChirho = await generateAiPersonaChirho(input); 
    
    if (resultChirho.personaImageChirho && userId) {
      const imageName = `persona_${Date.now()}_initial`;
      const uploadResult = await uploadImageToStorageChirho(userId, resultChirho.personaImageChirho, imageName);
      if (uploadResult.success && uploadResult.downloadURL) {
        resultChirho.personaImageChirho = uploadResult.downloadURL; 
      } else {
        console.warn("Failed to upload initial persona image to Firebase Storage, using data URI as fallback. Error:", uploadResult.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error generating new persona:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to generate persona." };
  }
}

export async function sendMessageToPersonaChirho(input: AIPersonaConvincingInputChirho): Promise<{ success: boolean; data?: AIPersonaConvincingOutputChirho; error?: string; }> {
  try {
    const resultChirho = await aiPersonaConvincingChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error sending message to persona:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to get persona response." };
  }
}

export async function fetchContextualGuidanceChirho(input: ContextualGuidanceInputChirho): Promise<{ success: boolean; data?: ContextualGuidanceOutputChirho; error?: string; }> {
  try {
    const resultChirho = await contextualGuidanceChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error fetching contextual guidance:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch guidance." };
  }
}

export async function updatePersonaImageChirho(input: UpdatePersonaVisualsInputChirho, userId: string): Promise<{ success: boolean; data?: UpdatePersonaVisualsOutputChirho; error?: string; }> {
  try {
    let resultChirho = await updatePersonaVisualsChirho(input); 

    if (resultChirho.updatedImageUriChirho && userId) {
      const imageName = `persona_${Date.now()}_update`;
      const uploadResult = await uploadImageToStorageChirho(userId, resultChirho.updatedImageUriChirho, imageName);
      if (uploadResult.success && uploadResult.downloadURL) {
        resultChirho.updatedImageUriChirho = uploadResult.downloadURL; 
      } else {
        console.warn("Failed to upload updated persona image to Firebase Storage, using data URI as fallback. Error:", uploadResult.error);
      }
    }
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error updating persona image:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseChirho(input: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("Server action fetchSuggestedResponseChirho received input:", input);
  try {
    const resultChirho = await suggestEvangelisticResponseChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error fetching suggested response:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch suggested response." };
  }
}

export async function archiveConversationToFirestoreChirho(userId: string, conversationData: ClientArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  if (!conversationData) return { success: false, error: "Conversation data is required." };
  console.log(`[Firestore Action] Attempting to archive conversation ${conversationData.id} for user ${userId}`);

  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  
  try {
    const newConvDocRef = doc(userConversationsRef, conversationData.id);
    // Data to save to Firestore; Firestore Timestamps are fine on the server.
    const dataToSave = { 
        ...conversationData, 
        archivedAtServer: serverTimestamp(), // Firestore server timestamp
    };

    await setDoc(newConvDocRef, dataToSave);
    console.log(`[Firestore Action] Successfully archived conversation ${conversationData.id} for user ${userId}`);

    // Pruning logic
    const q = query(userConversationsRef, orderBy("timestamp", "desc")); 
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > MAX_ARCHIVED_CONVERSATIONS_CHIRHO) {
      console.log(`[Firestore Action] Pruning. Found ${snapshot.docs.length} conversations, limit is ${MAX_ARCHIVED_CONVERSATIONS_CHIRHO}.`);
      const batch = writeBatch(dbChirho);
      const docsToDelete = snapshot.docs.slice(MAX_ARCHIVED_CONVERSATIONS_CHIRHO); 
      
      docsToDelete.forEach(docToDelete => {
        batch.delete(docToDelete.ref);
        console.log(`[Firestore Action] Marking for deletion: old conversation ${docToDelete.id} (timestamp: ${docToDelete.data().timestamp}) for user ${userId}`);
      });
      await batch.commit();
      console.log(`[Firestore Action] Pruning complete for user ${userId}. Deleted ${docsToDelete.length} conversations.`);
    } else {
      console.log(`[Firestore Action] No pruning needed for user ${userId}. Conversation count: ${snapshot.docs.length}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("[Firestore Action] Error archiving conversation to Firestore:", error);
    return { success: false, error: error.message || "Failed to archive conversation." };
  }
}

export async function fetchArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; data?: ClientArchivedConversationChirho[]; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  console.log(`[Firestore Action] Attempting to fetch archived conversations for user ${userId}`);
  
  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  const q = query(userConversationsRef, orderBy("timestamp", "desc"), limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO));
  
  try {
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Explicitly construct the object for the client, converting Timestamp
      const clientData: ClientArchivedConversationChirho = {
        id: data.id,
        timestamp: data.timestamp, // This is client-generated Date.now()
        personaNameChirho: data.personaNameChirho,
        initialPersonaImageChirho: data.initialPersonaImageChirho || null,
        meetingContextChirho: data.meetingContextChirho,
        encounterTitleChirho: data.encounterTitleChirho || null,
        personaDetailsChirho: data.personaDetailsChirho,
        personaNameKnownToUserChirho: data.personaNameKnownToUserChirho,
        difficultyLevelChirho: data.difficultyLevelChirho,
        messagesChirho: data.messagesChirho.map((msg: any) => ({ // Ensure messages are also plain
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            imageUrlChirho: msg.imageUrlChirho || null
        })),
        convincedChirho: data.convincedChirho,
        // Convert Firestore Timestamp for archivedAtServer to a number (milliseconds)
        archivedAtServerMillis: data.archivedAtServer && typeof data.archivedAtServer.toMillis === 'function' 
                                ? data.archivedAtServer.toMillis() 
                                : undefined,
      };
      return clientData;
    });
    console.log(`[Firestore Action] Fetched ${conversations.length} archived conversations for user ${userId}`);
    return { success: true, data: conversations };
  } catch (error: any) {
    console.error("[Firestore Action] Error fetching archived conversations from Firestore:", error);
    return { success: false, error: error.message || "Failed to fetch conversation history." };
  }
}

export async function clearArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  console.log(`[Firestore Action] Attempting to clear all archived conversations for user ${userId}`);
  
  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  try {
    const snapshot = await getDocs(userConversationsRef);
    if (snapshot.empty) {
      console.log(`[Firestore Action] No archived conversations to clear for user ${userId}`);
      return { success: true }; 
    }
    const batch = writeBatch(dbChirho);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`[Firestore Action] Cleared all ${snapshot.docs.length} archived conversations for user ${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[Firestore Action] Error clearing archived conversations from Firestore:", error);
    return { success: false, error: error.message || "Failed to clear conversation history." };
  }
}
