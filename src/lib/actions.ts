
"use server";

import { generateAiPersonaChirho, GenerateAiPersonaInputChirho, GenerateAiPersonaOutputChirho } from "@/ai/flows/generate-ai-persona";
import { aiPersonaConvincingChirho, AIPersonaConvincingInputChirho, AIPersonaConvincingOutputChirho } from "@/ai/flows/ai-persona-convincing";
import { contextualGuidanceChirho, ContextualGuidanceInputChirho, ContextualGuidanceOutputChirho } from "@/ai/flows/contextual-guidance";
import { updatePersonaVisualsChirho, UpdatePersonaVisualsInputChirho, UpdatePersonaVisualsOutputChirho } from "@/ai/flows/update-persona-visuals";
import { suggestEvangelisticResponseChirho, SuggestEvangelisticResponseInputChirho, SuggestEvangelisticResponseOutputChirho } from "@/ai/flows/suggest-evangelistic-response";


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
