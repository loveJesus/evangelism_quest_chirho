
"use server";

import { generateAiPersona as genPersona, GenerateAiPersonaInput } from "@/ai/flows/generate-ai-persona";
import { aiPersonaConvincing as convincePersona, AIPersonaConvincingInput } from "@/ai/flows/ai-persona-convincing";
import { contextualGuidance as getGuidance, ContextualGuidanceInput } from "@/ai/flows/contextual-guidance";

export async function generateNewPersona(input: GenerateAiPersonaInput) {
  try {
    const result = await genPersona(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating persona:", error);
    return { success: false, error: (error as Error).message || "Failed to generate persona." };
  }
}

export async function sendMessageToPersona(input: AIPersonaConvincingInput) {
  try {
    const result = await convincePersona(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending message to persona:", error);
    return { success: false, error: (error as Error).message || "Failed to get persona response." };
  }
}

export async function fetchContextualGuidance(input: ContextualGuidanceInput) {
  try {
    const result = await getGuidance(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching contextual guidance:", error);
    return { success: false, error: (error as Error).message || "Failed to fetch guidance." };
  }
}
