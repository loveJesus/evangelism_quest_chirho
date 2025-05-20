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
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage"; 
import type { UserProfileChirho } from '@/contexts/auth-context-chirho'; 
import type { ArchivedConversationChirho as ClientArchivedConversationChirho, MessageChirho } from '@/app/[lang]/ai-personas-chirho/client-page-chirho'; 


const INITIAL_FREE_CREDITS_CHIRHO = 50; // Updated initial credits
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10; 
const ACTIVE_CONVERSATION_DOC_ID = "current"; // Define a constant for the active conversation doc ID

export interface ActiveConversationDataChirho {
  personaChirho: GenerateAiPersonaOutputChirho;
  messagesChirho: MessageChirho[];
  difficultyLevelChirho: number;
  currentConversationLanguageChirho: string;
  dynamicPersonaImageChirho: string | null;
  lastSaved: any; 
}


export async function uploadImageToStorageChirho(userId: string, imageDataUri: string, imageName: string): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
  if (!userId || !imageDataUri || !imageName) {
    return { success: false, error: "User ID, image data, and image name are required." };
  }
   if (!imageDataUri.startsWith('data:image')) {
    if (imageDataUri.startsWith('http')) { 
        console.warn("[Storage Action] uploadImageToStorageChirho received an HTTP URL, assuming already uploaded:", imageDataUri.substring(0, 70) + "...");
        return { success: true, downloadURL: imageDataUri };
    }
    return { success: false, error: "Invalid image data URI format." };
  }

  try {
    const storageRefVal = ref(storageChirho, `userImages/${userId}/${imageName}.png`);
    await uploadString(storageRefVal, imageDataUri, 'data_url');
    const downloadURL = await getDownloadURL(storageRefVal);
    return { success: true, downloadURL };
  } catch (error: any) {
    console.error("[Storage Action] Error uploading image to Firebase Storage:", error);
    return { success: false, error: error.message || "Failed to upload image." };
  }
}


export async function initializeUserChirho(userId: string, email: string | null, displayName?: string | null, photoURL?: string | null): Promise<{ success: boolean, error?: string, profile?: UserProfileChirho }> {
  console.log("[Action initializeUserChirho] Called for user:", userId);
  if (!userId) {
    const errorMsg = "User ID is required for initializeUserChirho.";
    console.error("[Action initializeUserChirho]", errorMsg);
    return { success: false, error: errorMsg };
  }
  
  const userDocRef = doc(dbChirho, "users", userId);
  let userProfileData: UserProfileChirho | undefined;
  
  try {
    console.log("[Action initializeUserChirho] Attempting to get user document for:", userId);
    const userDocSnap = await getDoc(userDocRef);
    console.log("[Action initializeUserChirho] User document snapshot exists for", userId, ":", userDocSnap.exists());

    if (!userDocSnap.exists()) {
      console.log("[Action initializeUserChirho] User document does not exist, creating new profile for:", userId);
      const newProfile: Omit<UserProfileChirho, 'createdAt' | 'lastLogin'> & { createdAt: any; lastLogin: any } = {
        uid: userId,
        email: email,
        displayName: displayName || email?.split('@')[0] || "User",
        photoURL: photoURL || null,
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userDocRef, newProfile);
      const fetchedData = (await getDoc(userDocRef)).data();
      userProfileData = {
          ...newProfile, // Use newProfile as base to ensure all fields are present
          uid: userId,
          email: newProfile.email, // ensure email is from newProfile
          displayName: newProfile.displayName,
          photoURL: newProfile.photoURL,
          credits: newProfile.credits,
          createdAt: fetchedData?.createdAt instanceof Timestamp ? fetchedData.createdAt.toMillis() : Date.now(),
          lastLogin: fetchedData?.lastLogin instanceof Timestamp ? fetchedData.lastLogin.toMillis() : Date.now(),
      } as UserProfileChirho;
      console.log("[Action initializeUserChirho] New user profile CREATED in Firestore for:", userId);
    } else {
      console.log("[Action initializeUserChirho] User document exists, UPDATING profile for:", userId);
      const existingData = userDocSnap.data() as UserProfileChirho;
      const updates: any = { 
        lastLogin: serverTimestamp(),
      };
      
      if (displayName && displayName.trim() !== "" && 
          (!existingData.displayName || existingData.displayName === "User" || 
           (existingData.email && existingData.displayName === existingData.email.split('@')[0]) || 
           existingData.displayName !== displayName)) {
        updates.displayName = displayName;
      }
      
      if (photoURL && existingData.photoURL !== photoURL) {
        updates.photoURL = photoURL;
      }
      
      if (email && existingData.email !== email) {
        updates.email = email;
      }
      
      if(Object.keys(updates).length > 1) { 
        await updateDoc(userDocRef, updates);
        console.log("[Action initializeUserChirho] User profile UPDATED in Firestore for:", userId, "with updates:", updates);
      } else {
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
        console.log("[Action initializeUserChirho] User profile lastLogin UPDATED in Firestore for:", userId);
      }
      
      const fetchedData = (await getDoc(userDocRef)).data();
      userProfileData = {
          ...existingData, // Use existing data as base
          ...fetchedData, // Overlay with potentially updated fields from Firestore
          uid: userId, 
          createdAt: fetchedData?.createdAt instanceof Timestamp ? fetchedData.createdAt.toMillis() : (existingData.createdAt || Date.now()),
          lastLogin: fetchedData?.lastLogin instanceof Timestamp ? fetchedData.lastLogin.toMillis() : Date.now(),
      } as UserProfileChirho;
    }
    return { success: true, profile: userProfileData };
  } catch (error: any) {
    console.error("[Action initializeUserChirho] Firestore error for user", userId, ":", error.code, error.message, error.stack);
    return { success: false, error: `Failed to initialize user profile: ${error.message} (Code: ${error.code})` };
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
        uid: userId, // Ensure uid is present
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
        lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toMillis() : data.lastLogin,
      } as UserProfileChirho;
      return { success: true, data: profileData };
    } else {
      return { success: false, error: "User profile not found." };
    }
  } catch (error: any) {
    console.error(`[Action fetchUserProfileFromServerChirho]: Error fetching profile for 'users/${userId}':`, error);
    return { success: false, error: error.message || "Could not load user profile." };
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
    const newCreditsAfterDecrement = (await getDoc(userDocRef)).data()?.credits;
    console.log(`[Action decrementUserCreditsChirho] Credits decremented for ${userId}. New balance: ${newCreditsAfterDecrement}`);
    return { success: true, newCredits: newCreditsAfterDecrement };
  } catch (error: any) {
    console.error("[Action decrementUserCreditsChirho] Error decrementing user credits:", error);
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
    const newCreditsAfterAddition = (await getDoc(userDocRef)).data()?.credits;
    return { success: true, newCredits: newCreditsAfterAddition };
  } catch (error: any) {
    console.error("[Action addTestCreditsChirho] Error adding test credits:", error);
    return { success: false, error: error.message || "Failed to add test credits." };
  }
}


export async function generateNewPersonaChirho(input: GenerateAiPersonaInputChirho, userId: string): Promise<{ success: boolean; data?: GenerateAiPersonaOutputChirho; error?: string; }> {
  try {
    console.log(`[Action generateNewPersonaChirho] Generating persona for user ${userId}, lang: ${input.languageChirho}`);
    let resultChirho = await generateAiPersonaChirho(input); 
    
    if (resultChirho.personaImageChirho && userId) {
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
  } catch (errorChirho) {
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

    if (resultChirho.updatedImageUriChirho && userId) {
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
  } catch (errorChirho) {
    console.error("[Action updatePersonaImageChirho] Error updating persona image:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseChirho(input: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("[Action fetchSuggestedResponseChirho] Server action received input:", input);
  try {
    const resultChirho = await suggestEvangelisticResponseChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("[Action fetchSuggestedResponseChirho] Error fetching suggested response:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch suggested response." };
  }
}

// --- Active Conversation Actions ---
export async function saveActiveConversationToFirestoreChirho(userId: string, activeData: ActiveConversationDataChirho): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required for saving active conversation." };
  if (!activeData || !activeData.personaChirho) return { success: false, error: "Active conversation data with persona is required."};
  
  const activeConvRef = doc(dbChirho, "users", userId, "activeConversationData", ACTIVE_CONVERSATION_DOC_ID);
  try {
    const dataToSave = {
      ...activeData,
      lastSaved: serverTimestamp() 
    };
    await setDoc(activeConvRef, dataToSave);
    console.log(`[Action saveActiveConversationToFirestoreChirho] Successfully saved for user ${userId}. Persona: ${dataToSave.personaChirho.personaNameChirho}, Msgs: ${dataToSave.messagesChirho.length}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[Action saveActiveConversationToFirestoreChirho] Error saving for user ${userId}:`, error);
    return { success: false, error: error.message || "Failed to save active conversation." };
  }
}

export async function fetchActiveConversationFromFirestoreChirho(userId: string): Promise<{ success: boolean; data?: ActiveConversationDataChirho; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required for fetching active conversation." };
  console.log(`[Action fetchActiveConversationFromFirestoreChirho] Attempting to fetch for user ${userId}`);
  const activeConvRef = doc(dbChirho, "users", userId, "activeConversationData", ACTIVE_CONVERSATION_DOC_ID);
  try {
    const docSnap = await getDoc(activeConvRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const activeData: ActiveConversationDataChirho = {
        personaChirho: data.personaChirho,
        messagesChirho: data.messagesChirho,
        difficultyLevelChirho: data.difficultyLevelChirho,
        currentConversationLanguageChirho: data.currentConversationLanguageChirho,
        dynamicPersonaImageChirho: data.dynamicPersonaImageChirho,
        lastSaved: data.lastSaved instanceof Timestamp ? data.lastSaved.toMillis() : data.lastSaved,
      };
      console.log(`[Action fetchActiveConversationFromFirestoreChirho] Successfully fetched for user ${userId}. Persona: ${activeData.personaChirho.personaNameChirho}, Msgs: ${activeData.messagesChirho.length}`);
      return { success: true, data: activeData };
    } else {
      console.log(`[Action fetchActiveConversationFromFirestoreChirho] No active conversation found for user ${userId}`);
      return { success: false, error: "No active conversation found." };
    }
  } catch (error: any) {
    console.error(`[Action fetchActiveConversationFromFirestoreChirho] Error fetching for user ${userId}:`, error);
    return { success: false, error: error.message || "Failed to fetch active conversation." };
  }
}

export async function clearActiveConversationFromFirestoreChirho(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required for clearing active conversation." };
  console.log(`[Action clearActiveConversationFromFirestoreChirho] Attempting to clear for user ${userId}`);
  const activeConvRef = doc(dbChirho, "users", userId, "activeConversationData", ACTIVE_CONVERSATION_DOC_ID);
  try {
    await deleteDoc(activeConvRef);
    console.log(`[Action clearActiveConversationFromFirestoreChirho] Successfully cleared for user ${userId}`);
    return { success: true };
  } catch (error: any) {
    if ((error as any).code !== 'not-found') { 
        console.error(`[Action clearActiveConversationFromFirestoreChirho] Error clearing for user ${userId}:`, error);
        return { success: false, error: (error as Error).message || "Failed to clear active conversation." };
    }
    console.log(`[Action clearActiveConversationFromFirestoreChirho] Document already cleared or never existed for user ${userId}`);
    return { success: true }; 
  }
}

// --- Archived Conversation Actions ---
export async function archiveConversationToFirestoreChirho(userId: string, conversationData: ClientArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  if (!conversationData) return { success: false, error: "Conversation data is required." };
  console.log(`[Action archiveConversationToFirestoreChirho] Attempting to archive conversation ${conversationData.id} for user ${userId}`);

  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  
  try {
    const newConvDocRef = doc(userConversationsRef, conversationData.id);
    const dataToSave: ClientArchivedConversationChirho & { archivedAtServer: any } = { 
        ...conversationData, 
        timestamp: Timestamp.fromMillis(conversationData.timestamp),
        archivedAtServer: serverTimestamp(), 
    };

    await setDoc(newConvDocRef, dataToSave);
    console.log(`[Action archiveConversationToFirestoreChirho] Successfully archived conversation ${conversationData.id} for user ${userId}`);

    const q = query(userConversationsRef, orderBy("timestamp", "desc")); 
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > MAX_ARCHIVED_CONVERSATIONS_CHIRHO) {
      console.log(`[Action archiveConversationToFirestoreChirho] Pruning. Found ${snapshot.docs.length} conversations, limit is ${MAX_ARCHIVED_CONVERSATIONS_CHIRHO}.`);
      const batch = writeBatch(dbChirho);
      const docsToDelete = snapshot.docs.slice(MAX_ARCHIVED_CONVERSATIONS_CHIRHO); 
      
      docsToDelete.forEach(docToDelete => {
        batch.delete(docToDelete.ref);
        console.log(`[Action archiveConversationToFirestoreChirho] Marking for deletion: old conversation ${docToDelete.id} (timestamp: ${docToDelete.data().timestamp?.toMillis()}) for user ${userId}`);
      });
      await batch.commit();
      console.log(`[Action archiveConversationToFirestoreChirho] Pruning complete for user ${userId}. Deleted ${docsToDelete.length} conversations.`);
    } else {
      console.log(`[Action archiveConversationToFirestoreChirho] No pruning needed for user ${userId}. Conversation count: ${snapshot.docs.length}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("[Action archiveConversationToFirestoreChirho] Error archiving conversation to Firestore:", error);
    return { success: false, error: error.message || "Failed to archive conversation." };
  }
}

export async function fetchArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; data?: ClientArchivedConversationChirho[]; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  console.log(`[Action fetchArchivedConversationsFromFirestoreChirho] Attempting to fetch archived conversations for user ${userId}`);
  
  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  const q = query(userConversationsRef, orderBy("timestamp", "desc"), limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO));
  
  try {
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      const clientData: ClientArchivedConversationChirho = {
        id: data.id,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp,
        personaNameChirho: data.personaNameChirho,
        initialPersonaImageChirho: data.initialPersonaImageChirho || null,
        meetingContextChirho: data.meetingContextChirho,
        encounterTitleChirho: data.encounterTitleChirho || null,
        personaDetailsChirho: data.personaDetailsChirho,
        personaNameKnownToUserChirho: data.personaNameKnownToUserChirho,
        difficultyLevelChirho: data.difficultyLevelChirho,
        messagesChirho: data.messagesChirho.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            imageUrlChirho: msg.imageUrlChirho || null
        })),
        convincedChirho: data.convincedChirho,
        conversationLanguageChirho: data.conversationLanguageChirho || 'en',
        archivedAtServerMillis: data.archivedAtServer instanceof Timestamp 
                                ? data.archivedAtServer.toMillis() 
                                : (typeof data.archivedAtServer === 'number' ? data.archivedAtServer : undefined),
      };
      return clientData;
    });
    console.log(`[Action fetchArchivedConversationsFromFirestoreChirho] Fetched ${conversations.length} archived conversations for user ${userId}`);
    return { success: true, data: conversations };
  } catch (error: any) {
    console.error("[Action fetchArchivedConversationsFromFirestoreChirho] Error fetching archived conversations from Firestore:", error);
    return { success: false, error: error.message || "Failed to fetch conversation history." };
  }
}

export async function clearArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
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
    console.error("[Action clearArchivedConversationsFromFirestoreChirho] Error clearing archived conversations from Firestore:", error);
    return { success: false, error: error.message || "Failed to clear conversation history." };
  }
}
