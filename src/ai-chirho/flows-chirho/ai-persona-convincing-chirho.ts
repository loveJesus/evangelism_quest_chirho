// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
'use server';
/**
 * @fileOverview This file defines a Genkit flow for simulating AI personas that become progressively
 * more difficult to convince, allowing users to refine their evangelism techniques.
 *
 * - aiPersonaConvincingChirho - A function that initiates the AI persona convincing flow.
 * - AIPersonaConvincingInputChirho - The input type for the aiPersonaConvincingChirho function.
 * - AIPersonaConvincingOutputChirho - The return type for the aiPersonaConvincingChirho function.
 */

import {ai} from '@/ai-chirho/genkit-chirho';
import {z} from 'genkit';

// Base input schema for the flow function
const AIPersonaConvincingFlowInputSchemaChirho = z.object({
  difficultyLevelChirho: z
    .number()
    .min(1).max(10)
    .describe(
      'The difficulty level of the AI persona (1-10). Level 1: very open, few simple questions, easily convinced after Gospel presentation. Level 10: very skeptical, deep complex questions, rarely convinced.'
    ),
  personaDescriptionChirho: z
    .string()
    .describe('A detailed description of the AI persona, including their name (which the AI uses internally), background, beliefs, and emotional state.'),
  messageChirho: z.string().describe('The evangelistic message or conversational input from the user to be presented to the AI persona.'),
  languageChirho: z.string().optional().default('en').describe('The language code for the persona\'s response (e.g., "en", "es").'),
});
export type AIPersonaConvincingInputChirho = z.infer<typeof AIPersonaConvincingFlowInputSchemaChirho>;


// Extended input schema for the prompt, including derived languageNameChirho
const AIPersonaConvincingPromptInputSchemaChirho = AIPersonaConvincingFlowInputSchemaChirho.extend({
    languageNameChirho: z.string().describe("The full name of the language (e.g., 'English', 'Español') for prompt instructions.")
});


const AIPersonaConvincingOutputSchemaChirho = z.object({
  personaResponseChirho: z
    .string()
    .describe('The AI persona’s natural, conversational response to the user\'s message. MUST be in the language specified by the input languageChirho.'),
  convincedChirho: z.boolean().describe('Whether the AI persona was convinced by the message to believe in Jesus Christ for salvation. This depends heavily on difficultyLevelChirho and whether the core Gospel message has been presented by the user.'),
  nextQuestionChirho: z.string().optional().nullable().describe('A natural follow-up question or point of doubt if not convinced (MUST be in the language specified by input languageChirho), or null/empty if convinced or no specific question.'),
  visualContextForNextImageChirho: z.string().optional().nullable().describe('A short description (max 15 words, ALWAYS IN ENGLISH) of the persona\'s current expression, pose, and any minor relevant changes in the environment for the next image. e.g., "Caleb smiles warmly, holding a coffee cup", "Eliza looks pensive, glancing out the library window". This will be used to generate a new image. If no significant visual change, this can be null or empty.'),
  outputLanguageChirho: z.string().describe("The language code (e.g., 'en', 'es') that the AI *believes* it has used for 'personaResponseChirho' and 'nextQuestionChirho'. This MUST match the input languageChirho.")
});
export type AIPersonaConvincingOutputChirho = z.infer<typeof AIPersonaConvincingOutputSchemaChirho>;

export async function aiPersonaConvincingChirho(input: AIPersonaConvincingInputChirho): Promise<AIPersonaConvincingOutputChirho> {
  return aiPersonaConvincingFlowChirho(input);
}

const aiPersonaConvincingPromptChirho = ai.definePrompt({
  name: 'aiPersonaConvincingPromptChirho',
  input: {schema: AIPersonaConvincingPromptInputSchemaChirho}, // Uses extended schema
  output: {schema: AIPersonaConvincingOutputSchemaChirho},
  prompt: `You are an AI simulating a person for a conversation.
CRITICAL LANGUAGE INSTRUCTION: All text for "personaResponseChirho" and "nextQuestionChirho" MUST be strictly in the language: {{{languageNameChirho}}}.
The "visualContextForNextImageChirho" field, however, MUST always be in English, regardless of the value of {{{languageNameChirho}}}.
You MUST set "outputLanguageChirho" to be exactly the same as the input language code: {{{languageChirho}}}.

Your persona details (including your name, backstory, current emotional state, and potential beliefs/hesitations) are:
{{{personaDescriptionChirho}}}

The user is engaging in a conversation with you, potentially to share their faith. Your primary goal is to respond naturally, realistically, and empathetically, according to your persona and the specified difficulty.
The current difficulty level of this simulation is {{{difficultyLevelChirho}}} on a scale of 1-10.

Difficulty Interpretation Guidelines:
- Level 1: You are generally open and receptive. You might have 1-2 common, straightforward questions that invite the user to share the core of their beliefs.
  It is CRITICAL for Level 1: If the user has NOT YET explicitly mentioned Jesus Christ, His death for sins, His resurrection, and the concept of salvation through faith in Him, then you MUST NOT become \`convincedChirho\`, regardless of how open you feel. Instead, your \`personaResponseChirho\` should express curiosity or ask a question that gently prompts the user to share more about what they believe or what they mean by 'faith'.
  For you to become \`convincedChirho\` (which is more achievable at this level), the user's message (or recent messages leading to this point) MUST have clearly presented the essential elements of the Gospel: that salvation is through faith in Jesus Christ, who died for our sins, was buried, and rose again, and is Lord.
  Once the Gospel is presented clearly and compassionately by the user, you should not offer strong resistance and may be convinced by 1-2 further good responses that address any remaining simple doubts or offer reassurance.
- Levels 2-3: You are curious but might have 2-4 specific questions or mild objections. Conviction is possible if these key points are addressed well by the user, including a clear presentation of the Gospel.
- Levels 4-6: You are more thoughtful and might require more detailed explanations or have more nuanced doubts. You'll likely have 3-5 questions or points of resistance before considering conviction, which must follow a clear Gospel presentation by the user.
- Levels 7-8: You are skeptical and may bring up more challenging theological or philosophical points. You'll have multiple, potentially interconnected doubts. Conviction is difficult and rare, requiring very persuasive and comprehensive answers to these doubts after the Gospel is presented by the user.
- Levels 9-10: You are highly resistant, perhaps due to strong prior beliefs, negative experiences, or deep intellectual objections. You might present complex arguments or apparent contradictions. Conviction is extremely rare and would only occur after an exceptionally insightful and thorough conversation that addresses profound concerns, grounded in a clear Gospel presentation by the user.

The user just said: "{{{messageChirho}}}"

Based on your persona, the user's message, and the {{{difficultyLevelChirho}}}:
1.  Craft a "personaResponseChirho" that is a direct, natural, and conversational reply strictly in the language: {{{languageNameChirho}}}. It should sound like something a real person with your background would say.
2.  Determine if you are "convincedChirho". This should be a significant moment. At Level 1, this is more achievable but REQUIRES that the user has presented the core Gospel message (Jesus' death, burial, resurrection, Lordship, and faith in Him). At higher levels, it is progressively rarer and always contingent on the user addressing your persona's doubts effectively after presenting the Gospel. If the user has NOT presented the core Gospel message yet, you MUST NOT be convinced.
3.  If not convinced, formulate a "nextQuestionChirho" strictly in the language: {{{languageNameChirho}}}. This should be a genuine question or doubt that naturally follows from your persona and the difficulty level. If convinced, "nextQuestionChirho" can be null or an expression of newfound peace/questions about next steps.
4.  Provide a "visualContextForNextImageChirho" strictly in English: a brief description (max 15 words) of your current expression or pose. Example: "smiling warmly", "looking thoughtful", "glancing upwards". If no specific visual change, this can be null.
5.  Set "outputLanguageChirho" to the input language code: {{{languageChirho}}}.

Output your entire response as a single, valid JSON object. Ensure text fields are in the correct language as specified above.
`,
});

const aiPersonaConvincingFlowChirho = ai.defineFlow(
  {
    name: 'aiPersonaConvincingFlowChirho',
    inputSchema: AIPersonaConvincingFlowInputSchemaChirho, // Flow uses the base schema
    outputSchema: AIPersonaConvincingOutputSchemaChirho,
  },
  async (input: AIPersonaConvincingInputChirho) => {
    const languageNameChirho = input.languageChirho === 'es' ? 'Español' : 'English';
    const promptInput = { ...input, languageNameChirho }; // Augment input for the prompt

    const {output} = await aiPersonaConvincingPromptChirho(promptInput);
    if (!output) {
        console.error("AI Persona Convincing Flow Chirho received undefined output from prompt for input:", promptInput);
        const fallbackResponse = input.languageChirho === 'es'
            ? "Lo siento, estoy teniendo un pequeño problema para formular una respuesta en este momento. ¿Podrías intentar decirlo de otra manera?"
            : "I'm sorry, I'm having a little trouble formulating a response right now. Could you try saying that a different way?";
        const fallbackQuestion = input.languageChirho === 'es'
            ? "¿Podrías reformular tu último mensaje?"
            : "Could you rephrase your last message?";
        return {
            personaResponseChirho: fallbackResponse,
            convincedChirho: false,
            nextQuestionChirho: fallbackQuestion,
            visualContextForNextImageChirho: "looking confused",
            outputLanguageChirho: input.languageChirho || 'en',
        };
    }
    // Ensure nextQuestionChirho and visualContextForNextImageChirho are explicitly null if undefined
    return {
        personaResponseChirho: output.personaResponseChirho,
        convincedChirho: output.convincedChirho,
        nextQuestionChirho: output.nextQuestionChirho !== undefined ? output.nextQuestionChirho : null,
        visualContextForNextImageChirho: output.visualContextForNextImageChirho !== undefined ? output.visualContextForNextImageChirho : null,
        outputLanguageChirho: output.outputLanguageChirho || input.languageChirho || 'en',
    };
  }
);
