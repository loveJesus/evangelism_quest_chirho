// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use server";

import { generateAiPersonaChirho, GenerateAiPersonaInputChirho, GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import { aiPersonaConvincingChirho, AIPersonaConvincingInputChirho, AIPersonaConvincingOutputChirho } from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";
import { contextualGuidanceChirho, ContextualGuidanceInputChirho, ContextualGuidanceOutputChirho } from "@/ai-chirho/flows-chirho/contextual-guidance-chirho";
import { updatePersonaVisualsChirho, UpdatePersonaVisualsInputChirho, UpdatePersonaVisualsOutputChirho } from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";
import { suggestEvangelisticResponseChirho, SuggestEvangelisticResponseInputChirho, SuggestEvangelisticResponseOutputChirho } from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";

import { dbChirho } from '@/lib/firebase-config-chirho';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import type { UserProfileChirho } from '@/contexts/auth-context-chirho';

const INITIAL_FREE_CREDITS_CHIRHO = 100;

export async function initializeUserChirho(userId: string, email: string | null, displayName?: string | null, photoURL?: string | null): Promise<void> {
  if (!userId) {
    console.error("initializeUserChirho: userId is required.");
    // Optionally throw an error or return a status
    return;
  }
  const userDocRef = doc(dbChirho, "users", userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      const newUserProfile: UserProfileChirho = {
        uid: userId,
        email: email,
        displayName: displayName || email?.split('@')[0] || "User",
        photoURL: photoURL || null, // Store photoURL if available
        credits: INITIAL_FREE_CREDITS_CHIRHO,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserProfile);
      console.log("User initialized in Firestore:", userId);
    } else {
      // User exists, update lastLogin and potentially displayName/photoURL if changed
      const updates: { lastLogin: any; displayName?: string | null; photoURL?: string | null } = {
        lastLogin: serverTimestamp(),
      };
      const existingData = userDocSnap.data();
      if (displayName && existingData.displayName !== displayName) {
        updates.displayName = displayName;
      }
      if (photoURL && existingData.photoURL !== photoURL) {
        updates.photoURL = photoURL;
      }
      if (Object.keys(updates).length > 1 || !existingData.lastLogin) { // update if more than just lastLogin changed, or if lastLogin was never set
         await updateDoc(userDocRef, updates);
         console.log("User profile updated in Firestore:", userId, updates);
      } else {
         await updateDoc(userDocRef, { lastLogin: serverTimestamp() }); // Just update lastLogin
      }
    }
  } catch (error: any) {
    console.error("Error initializing/updating user in Firestore:", userId, error.code, error.message, error);
    // Depending on policy, you might want to throw error or handle silently
    // For now, let the AuthProvider handle generic error toasts if this fails and profile isn't loadable
    throw error; // Re-throw to be caught by AuthProvider if needed
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


// Existing AI-related actions
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
  try {
    const resultChirho = await suggestEvangelisticResponseChirho(input);
    return { success: true, data: resultChirho };
  } catch (errorChirho)
   {
    console.error("Error fetching suggested response:", errorChirho);
    return { success: false, error: (errorChirho as Error).message || "Failed to fetch suggested response." };
  }
}
