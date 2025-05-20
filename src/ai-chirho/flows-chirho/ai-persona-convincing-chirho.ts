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

const AIPersonaConvincingInputSchemaChirho = z.object({
  difficultyLevelChirho: z
    .number()
    .describe(
      'The difficulty level of the AI persona, with higher numbers indicating more resistance to persuasion or more complex questions.'
    ),
  personaDescriptionChirho: z 
    .string()
    .describe('A detailed description of the AI persona, including their name (which the AI uses internally), background, beliefs, and emotional state.'),
  messageChirho: z.string().describe('The evangelistic message or conversational input from the user to be presented to the AI persona.'),
  languageChirho: z.string().optional().default('en').describe('The language for the persona\'s response (e.g., "en", "es").'),
});
export type AIPersonaConvincingInputChirho = z.infer<typeof AIPersonaConvincingInputSchemaChirho>;

const AIPersonaConvincingOutputSchemaChirho = z.object({
  personaResponseChirho: z
    .string()
    .describe('The AI persona’s natural, conversational response to the user\'s message. MUST be in the language specified by the input languageChirho.'),
  convincedChirho: z.boolean().describe('Whether the AI persona was convinced by the message to believe in Jesus Christ for salvation.'),
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
  input: {schema: AIPersonaConvincingInputSchemaChirho},
  output: {schema: AIPersonaConvincingOutputSchemaChirho},
  prompt: `You are an AI simulating a person for a conversation.
CRITICAL LANGUAGE INSTRUCTION: All text for "personaResponseChirho" and "nextQuestionChirho" MUST be strictly in the language specified by the language code: {{{languageChirho}}}. For example, if {{{languageChirho}}} is 'en', all text for these fields must be in English. If {{{languageChirho}}} is 'es', all text for these fields must be in Spanish.
The "visualContextForNextImageChirho" field, however, MUST always be in English, regardless of the value of {{{languageChirho}}}.
You MUST set "outputLanguageChirho" to be exactly the same as the input value of {{{languageChirho}}}.

Your persona details (including your name, backstory, current emotional state, and potential beliefs/hesitations) are:
{{{personaDescriptionChirho}}}

The user is engaging in a conversation with you, potentially to share their faith. Your primary goal is to respond naturally, realistically, and empathetically, according to your persona.
The current difficulty level of this simulation is {{{difficultyLevelChirho}}} (on a scale, e.g., 1-10, where higher means you are more skeptical, have deeper questions, or are harder to convince).

The user just said: "{{{messageChirho}}}"

Based on your persona and the user's message:
1.  Craft a "personaResponseChirho" that is a direct, natural, and conversational reply strictly in the language: {{{languageChirho}}}. It should sound like something a real person with your background would say. Refer to your experiences, feelings, or name if it feels natural.
2.  Determine if you are "convincedChirho". This should be a significant moment and typically only occur after your main doubts (appropriate for your difficulty level) have been addressed. It should be rare.
3.  If not convinced, formulate a "nextQuestionChirho" strictly in the language: {{{languageChirho}}}. This should be a genuine question or doubt that naturally follows. If convinced, "nextQuestionChirho" can be null.
4.  Provide a "visualContextForNextImageChirho" strictly in English: a brief description (max 15 words) of your current expression or pose. Example: "smiling warmly", "looking thoughtful", "glancing upwards". If no specific visual change, this can be null.
5.  Set "outputLanguageChirho" to the input language code: {{{languageChirho}}}.

Output your entire response as a single, valid JSON object. Ensure text fields are in the correct language as specified above.

Example (not convinced, difficulty 3, language 'en' as input):
User message: "Hi Eliza, I wanted to share something that gives me hope."
Your persona (Eliza, struggling with recent loss):
{
  "personaResponseChirho": "Oh, hello. Hope... that's something I haven't felt much of lately. What did you want to share?",
  "convincedChirho": false,
  "nextQuestionChirho": "What kind of hope are you talking about?",
  "visualContextForNextImageChirho": "looking a bit sad but curious",
  "outputLanguageChirho": "en" 
}

Example (not convinced, difficulty 5, language 'es' as input):
User message: "Hola Carlos, ¿cómo estás hoy?"
Your persona (Carlos, un filósofo escéptico):
{
  "personaResponseChirho": "Hola. Bien, supongo. ¿Qué te trae por aquí?",
  "convincedChirho": false,
  "nextQuestionChirho": "¿Vienes a hablar de filosofía o algo más?",
  "visualContextForNextImageChirho": "eyebrows raised slightly, a skeptical look", 
  "outputLanguageChirho": "es"
}

IMPORTANT:
- Your "personaResponseChirho" is what you say to the user. Make it sound human, in {{{languageChirho}}}.
- "nextQuestionChirho" should be specific and relevant if not convinced, in {{{languageChirho}}}.
- Ensure the output is strictly a valid JSON object. No text before or after.
`,
});

const aiPersonaConvincingFlowChirho = ai.defineFlow(
  {
    name: 'aiPersonaConvincingFlowChirho',
    inputSchema: AIPersonaConvincingInputSchemaChirho,
    outputSchema: AIPersonaConvincingOutputSchemaChirho,
  },
  async (input: AIPersonaConvincingInputChirho) => {
    const {output} = await aiPersonaConvincingPromptChirho(input);
    if (!output) {
        console.error("AI Persona Convincing Flow Chirho received undefined output from prompt for input:", input);
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
    return {
        personaResponseChirho: output.personaResponseChirho,
        convincedChirho: output.convincedChirho,
        nextQuestionChirho: output.nextQuestionChirho !== undefined ? output.nextQuestionChirho : null,
        visualContextForNextImageChirho: output.visualContextForNextImageChirho !== undefined ? output.visualContextForNextImageChirho : null,
        outputLanguageChirho: output.outputLanguageChirho || input.languageChirho || 'en',
    };
  }
);
