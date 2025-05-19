// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import { generateAiPersonaChirho, type GenerateAiPersonaInputChirho, type GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import { aiPersonaConvincingChirho, type AIPersonaConvincingInputChirho, type AIPersonaConvincingOutputChirho } from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";
import { contextualGuidanceChirho, type ContextualGuidanceInputChirho, type ContextualGuidanceOutputChirho } from "@/ai-chirho/flows-chirho/contextual-guidance-chirho";
import { updatePersonaVisualsChirho, type UpdatePersonaVisualsInputChirho, type UpdatePersonaVisualsOutputChirho } from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";
import { suggestEvangelisticResponseChirho, type SuggestEvangelisticResponseInputChirho, type SuggestEvangelisticResponseOutputChirho } from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";

import { dbChirho } from '@/lib/firebase-config-chirho';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, collection, query, orderBy, limit, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import type { UserProfileChirho } from '@/contexts/auth-context-chirho'; 
import type { ArchivedConversationChirho } from '@/app/ai-personas-chirho/page-chirho'; 

const INITIAL_FREE_CREDITS_CHIRHO = 100;
const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10; 

export async function initializeUserChirho(userId: string, email: string | null, displayName?: string | null, photoURL?: string | null): Promise<{ success: boolean, error?: string }> {
  if (!userId) {
    console.error("initializeUserChirho Action: userId is required.");
    return { success: false, error: "User ID is required." };
  }
  console.log("initializeUserChirho Action: Processing user:", userId);
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    console.log("initializeUserChirho Action: Attempting to get user document for:", userId);
    const userDocSnap = await getDoc(userDocRef);
    console.log("initializeUserChirho Action: User document snapshot exists for", userId, ":", userDocSnap.exists());

    if (!userDocSnap.exists()) {
      const newUserProfile: UserProfileChirho = {
        uid: userId,
        email: email,
        displayName: displayName || email?.split('@')[0] || "User",
        photoURL: photoURL || null,
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      console.log("initializeUserChirho Action: Attempting to set new user document for:", userId);
      await setDoc(userDocRef, newUserProfile);
      console.log("initializeUserChirho Action: User initialized in Firestore:", userId);
    } else {
      const updates: { lastLogin: any; displayName?: string | null; photoURL?: string | null } = {
        lastLogin: serverTimestamp(),
      };
      const existingData = userDocSnap.data() as UserProfileChirho; 
      if (displayName && existingData.displayName !== displayName) {
        updates.displayName = displayName;
      }
      if (photoURL && existingData.photoURL !== photoURL) {
        updates.photoURL = photoURL;
      }
      if(Object.keys(updates).length > 1 || !existingData.lastLogin) { 
        console.log("initializeUserChirho Action: Attempting to update user document for:", userId, "with updates:", updates);
        await updateDoc(userDocRef, updates);
        console.log("initializeUserChirho Action: User profile updated in Firestore:", userId);
      } else {
        console.log("initializeUserChirho Action: No significant profile details changed for user:", userId, ". Only updating lastLogin.");
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
      }
    }
    return { success: true };
  } catch (error: any) {
    console.error("initializeUserChirho Action: Firestore error for user", userId, ":", error.code, error.message, error);
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


export async function generateNewPersonaChirho(input: GenerateAiPersonaInputChirho): Promise<{ success: boolean; data?: GenerateAiPersonaOutputChirho; error?: string; }> {
  try {
    const resultChirho = await generateAiPersonaChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error generating persona:", errorChirho);
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

export async function updatePersonaImageChirho(input: UpdatePersonaVisualsInputChirho): Promise<{ success: boolean; data?: UpdatePersonaVisualsOutputChirho; error?: string; }> {
  try {
    const resultChirho = await updatePersonaVisualsChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error updating persona image:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to update persona image." };
  }
}

export async function fetchSuggestedResponseChirho(input: SuggestEvangelisticResponseInputChirho): Promise<{ success: boolean; data?: SuggestEvangelisticResponseOutputChirho; error?: string; }> {
  console.log("Server action fetchSuggestedResponseChirho received input:", input); // Log the input to the server action
  try {
    const resultChirho = await suggestEvangelisticResponseChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho) {
    console.error("Error fetching suggested response:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch suggested response." };
  }
}

// Firestore Conversation History Actions
export async function archiveConversationToFirestoreChirho(userId: string, conversationData: ArchivedConversationChirho): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  if (!conversationData) return { success: false, error: "Conversation data is required." };

  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  
  try {
    const newConvDocRef = doc(userConversationsRef, conversationData.id);
    await setDoc(newConvDocRef, { ...conversationData, archivedAtServer: serverTimestamp() });
    console.log(`Archived conversation ${conversationData.id} for user ${userId}`);

    const q = query(userConversationsRef, orderBy("timestamp", "desc"), limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO + 5)); 
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > MAX_ARCHIVED_CONVERSATIONS_CHIRHO) {
      const batch = writeBatch(dbChirho);
      const docsToDelete = snapshot.docs.slice(MAX_ARCHIVED_CONVERSATIONS_CHIRHO); 
      
      docsToDelete.forEach(docToDelete => {
        batch.delete(docToDelete.ref);
        console.log(`Pruning old conversation ${docToDelete.id} for user ${userId}`);
      });
      await batch.commit();
      console.log(`Pruning complete for user ${userId}. Deleted ${docsToDelete.length} conversations.`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error archiving conversation to Firestore:", error);
    return { success: false, error: error.message || "Failed to archive conversation." };
  }
}

export async function fetchArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; data?: ArchivedConversationChirho[]; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  
  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  const q = query(userConversationsRef, orderBy("timestamp", "desc"), limit(MAX_ARCHIVED_CONVERSATIONS_CHIRHO));
  
  try {
    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(doc => doc.data() as ArchivedConversationChirho);
    console.log(`Fetched ${conversations.length} archived conversations for user ${userId}`);
    return { success: true, data: conversations };
  } catch (error: any) {
    console.error("Error fetching archived conversations from Firestore:", error);
    return { success: false, error: error.message || "Failed to fetch conversation history." };
  }
}

export async function clearArchivedConversationsFromFirestoreChirho(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID is required." };
  
  const userConversationsRef = collection(dbChirho, "users", userId, "archivedConversations");
  try {
    const snapshot = await getDocs(userConversationsRef);
    if (snapshot.empty) {
      console.log(`No archived conversations to clear for user ${userId}`);
      return { success: true }; 
    }
    const batch = writeBatch(dbChirho);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Cleared all ${snapshot.docs.length} archived conversations for user ${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error clearing archived conversations from Firestore:", error);
    return { success: false, error: error.message || "Failed to clear conversation history." };
  }
}
