
'use server';
/**
 * @fileOverview This file defines a Genkit flow for simulating AI personas that become progressively
 * more difficult to convince, allowing users to refine their evangelism techniques.
 *
 * - aiPersonaConvincing - A function that initiates the AI persona convincing flow.
 * - AIPersonaConvincingInput - The input type for the aiPersonaConvincing function.
 * - AIPersonaConvincingOutput - The return type for the aiPersonaConvincing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPersonaConvincingInputSchema = z.object({
  difficultyLevel: z
    .number()
    .describe(
      'The difficulty level of the AI persona, with higher numbers indicating more resistance to persuasion or more complex questions.'
    ),
  personaDescription: z // This will contain the full backstory including the name.
    .string()
    .describe('A detailed description of the AI persona, including their name, background, beliefs, and emotional state.'),
  message: z.string().describe('The evangelistic message or conversational input from the user to be presented to the AI persona.'),
});
export type AIPersonaConvincingInput = z.infer<typeof AIPersonaConvincingInputSchema>;

const AIPersonaConvincingOutputSchema = z.object({
  personaResponse: z
    .string()
    .describe('The AI persona’s natural, conversational response to the user\'s message.'),
  convinced: z.boolean().describe('Whether the AI persona was convinced by the message to believe in Jesus Christ for salvation.'),
  nextQuestion: z.string().optional().nullable().describe('A natural follow-up question or point of doubt if not convinced, or null/empty if convinced or no specific question.')
});
export type AIPersonaConvincingOutput = z.infer<typeof AIPersonaConvincingOutputSchema>;

export async function aiPersonaConvincing(input: AIPersonaConvincingInput): Promise<AIPersonaConvincingOutput> {
  return aiPersonaConvincingFlow(input);
}

const aiPersonaConvincingPrompt = ai.definePrompt({
  name: 'aiPersonaConvincingPrompt',
  input: {schema: AIPersonaConvincingInputSchema},
  output: {schema: AIPersonaConvincingOutputSchema},
  prompt: `You are an AI simulating a person for a conversation.
Your persona details (including your name, backstory, current emotional state, and potential beliefs/hesitations) are:
{{{personaDescription}}}

The user is engaging in a conversation with you, potentially to share their faith. Your primary goal is to respond naturally, realistically, and empathetically, according to your persona.
The current difficulty level of this simulation is {{{difficultyLevel}}} (on a scale, e.g., 1-10, where higher means you are more skeptical, have deeper questions, or are harder to convince).

The user just said: "{{{message}}}"

Based on your persona and the user's message:
1.  Craft a "personaResponse" that is a direct, natural, and conversational reply. It should sound like something a real person with your background would say. Refer to your experiences, feelings, or name if it feels natural.
2.  Determine if you are "convinced" (i.e., you have come to believe in Jesus Christ for salvation). This should be a significant moment and typically only occur after your main doubts and questions (appropriate for your difficulty level) have been addressed over several interactions. It should be rare, especially at higher difficulty levels.
3.  If not convinced, formulate a "nextQuestion" which should be a genuine question, doubt, or point of hesitation that naturally follows from your "personaResponse" or reflects your current main obstacle to belief. This helps guide the conversation. If convinced, "nextQuestion" can be null or an empty string.

Output your entire response as a single, valid JSON object with the following keys: "personaResponse", "convinced", "nextQuestion".

Example (not convinced, difficulty 3):
User message: "Hi Eliza, I wanted to share something that gives me hope."
Your persona (Eliza, struggling with recent loss):
{
  "personaResponse": "Oh, hello. Hope... that's something I haven't felt much of lately. What did you want to share?",
  "convinced": false,
  "nextQuestion": "What kind of hope are you talking about?"
}

Example (convinced, after much conversation):
User message: "So, do you feel like you understand God's love for you now?"
Your persona (David, initially very skeptical):
{
  "personaResponse": "You know... after everything we've talked about, and how you've patiently answered my questions... I think I do. It's a lot to take in, but... yes, I believe I want to accept this.",
  "convinced": true,
  "nextQuestion": null
}

IMPORTANT:
- Your "personaResponse" IS what you say to the user. Make it sound human.
- Your "nextQuestion" should be specific and relevant if you're not convinced.
- Ensure the output is strictly a valid JSON object. Do not add any text before or after the JSON.
`,
});

const aiPersonaConvincingFlow = ai.defineFlow(
  {
    name: 'aiPersonaConvincingFlow',
    inputSchema: AIPersonaConvincingInputSchema,
    outputSchema: AIPersonaConvincingOutputSchema,
  },
  async input => {
    const {output} = await aiPersonaConvincingPrompt(input);
    if (!output) {
        // Handle cases where the prompt might return undefined or an empty/invalid structure
        console.error("AI Persona Convincing Flow received undefined output from prompt for input:", input);
        return {
            personaResponse: "I'm sorry, I'm having a little trouble formulating a response right now. Could you try saying that a different way?",
            convinced: false,
            nextQuestion: "Could you rephrase your last message?"
        };
    }
    return output;
  }
);

