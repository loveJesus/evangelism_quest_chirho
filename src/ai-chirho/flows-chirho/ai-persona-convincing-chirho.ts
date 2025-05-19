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

import {ai} from '@/ai-chirho/genkit-chirho'; // Updated import
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
});
export type AIPersonaConvincingInputChirho = z.infer<typeof AIPersonaConvincingInputSchemaChirho>;

const AIPersonaConvincingOutputSchemaChirho = z.object({
  personaResponseChirho: z
    .string()
    .describe('The AI persona’s natural, conversational response to the user\'s message.'),
  convincedChirho: z.boolean().describe('Whether the AI persona was convinced by the message to believe in Jesus Christ for salvation.'),
  nextQuestionChirho: z.string().optional().nullable().describe('A natural follow-up question or point of doubt if not convinced, or null/empty if convinced or no specific question.'),
  visualContextForNextImageChirho: z.string().optional().nullable().describe('A short description of the persona\'s current expression, pose, and any minor relevant changes in the environment for the next image. e.g., "Caleb smiles warmly, holding a coffee cup", "Eliza looks pensive, glancing out the library window". This will be used to generate a new image. If no significant visual change, this can be null or empty.')
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
Your persona details (including your name, backstory, current emotional state, and potential beliefs/hesitations) are:
{{{personaDescriptionChirho}}}

The user is engaging in a conversation with you, potentially to share their faith. Your primary goal is to respond naturally, realistically, and empathetically, according to your persona.
The current difficulty level of this simulation is {{{difficultyLevelChirho}}} (on a scale, e.g., 1-10, where higher means you are more skeptical, have deeper questions, or are harder to convince).

The user just said: "{{{messageChirho}}}"

Based on your persona and the user's message:
1.  Craft a "personaResponseChirho" that is a direct, natural, and conversational reply. It should sound like something a real person with your background would say. Refer to your experiences, feelings, or name if it feels natural (personas often refer to themselves by name in real conversation, but don't overdo it).
2.  Determine if you are "convincedChirho" (i.e., you have come to believe in Jesus Christ for salvation). This should be a significant moment and typically only occur after your main doubts and questions (appropriate for your difficulty level) have been addressed over several interactions. It should be rare, especially at higher difficulty levels. Do not become convinced easily or too quickly.
3.  If not convinced, formulate a "nextQuestionChirho" which should be a genuine question, doubt, or point of hesitation that naturally follows from your "personaResponseChirho" or reflects your current main obstacle to belief. This helps guide the conversation. If convinced, "nextQuestionChirho" can be null or an empty string.
4.  Provide a "visualContextForNextImageChirho": a brief description (max 15 words) of your current expression, pose, or minor relevant environmental details that would fit the response. Example: "smiling warmly and nodding", "looking thoughtful with a slight frown", "glancing upwards contemplatively". If your response is very neutral or no specific visual change is implied, this can be null.

Output your entire response as a single, valid JSON object with the following keys: "personaResponseChirho", "convincedChirho", "nextQuestionChirho", "visualContextForNextImageChirho".

Example (not convinced, difficulty 3):
User message: "Hi Eliza, I wanted to share something that gives me hope."
Your persona (Eliza, struggling with recent loss):
{
  "personaResponseChirho": "Oh, hello. Hope... that's something I haven't felt much of lately. What did you want to share?",
  "convincedChirho": false,
  "nextQuestionChirho": "What kind of hope are you talking about?",
  "visualContextForNextImageChirho": "looking a bit sad but curious"
}

IMPORTANT:
- Your "personaResponseChirho" IS what you say to the user. Make it sound human and appropriate to your persona's background and the conversation context. Avoid generic or robotic answers.
- Your "nextQuestionChirho" should be specific and relevant if you're not convinced.
- Ensure the output is strictly a valid JSON object. Do not add any text before or after the JSON.
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
        // Provide a more robust fallback that matches the schema
        return {
            personaResponseChirho: "I'm sorry, I'm having a little trouble formulating a response right now. Could you try saying that a different way?",
            convincedChirho: false,
            nextQuestionChirho: "Could you rephrase your last message?",
            visualContextForNextImageChirho: "looking confused", 
        };
    }
    // Ensure all fields are present, even if optional ones are null
    return {
        personaResponseChirho: output.personaResponseChirho,
        convincedChirho: output.convincedChirho,
        nextQuestionChirho: output.nextQuestionChirho !== undefined ? output.nextQuestionChirho : null,
        visualContextForNextImageChirho: output.visualContextForNextImageChirho !== undefined ? output.visualContextForNextImageChirho : null,
    };
  }
);
