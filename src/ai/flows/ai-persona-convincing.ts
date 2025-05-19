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
      'The difficulty level of the AI persona, with higher numbers indicating more resistance to persuasion.'
    ),
  personaDescription: z
    .string()
    .describe('A description of the AI persona, including their background and beliefs.'),
  message: z.string().describe('The evangelistic message to be presented to the AI persona.'),
});
export type AIPersonaConvincingInput = z.infer<typeof AIPersonaConvincingInputSchema>;

const AIPersonaConvincingOutputSchema = z.object({
  personaResponse: z
    .string()
    .describe('The AI persona’s response to the evangelistic message.'),
  convinced: z.boolean().describe('Whether the AI persona was convinced by the message.'),
  nextQuestion: z.string().optional().describe('The next question from the AI persona if not convinced.')
});
export type AIPersonaConvincingOutput = z.infer<typeof AIPersonaConvincingOutputSchema>;

export async function aiPersonaConvincing(input: AIPersonaConvincingInput): Promise<AIPersonaConvincingOutput> {
  return aiPersonaConvincingFlow(input);
}

const aiPersonaConvincingPrompt = ai.definePrompt({
  name: 'aiPersonaConvincingPrompt',
  input: {schema: AIPersonaConvincingInputSchema},
  output: {schema: AIPersonaConvincingOutputSchema},
  prompt: `You are simulating a person with the following background and beliefs: {{{personaDescription}}}. The goal is for you to be convinced to believe in Jesus Christ for salvation.

The difficulty level is {{{difficultyLevel}}}, meaning you should be more resistant to persuasion as the number gets larger.

Here is the evangelistic message: {{{message}}}.

Respond to the message. If you are not convinced, ask a challenging question that would need to be answered before you would be convinced.  Structure the output as follows:

Response: <your response>
Convinced: <true or false>
Next Question: <If Convinced is false, your next question.  Otherwise, leave blank.>

It is extremely important that the output is valid and parsable JSON.
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
    return output!;
  }
);
