// Implemented Genkit flow for contextual guidance to provide relevant Bible verses and talking points based on a given topic.
'use server';
/**
 * @fileOverview Provides contextual guidance by generating relevant Bible verses and talking points based on a given topic.
 *
 * - contextualGuidance - A function that generates Bible verses and talking points based on a topic.
 * - ContextualGuidanceInput - The input type for the contextualGuidance function.
 * - ContextualGuidanceOutput - The return type for the contextualGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualGuidanceInputSchema = z.object({
  topic: z.string().describe('The topic or theme for which to generate Bible verses and talking points.'),
});
export type ContextualGuidanceInput = z.infer<typeof ContextualGuidanceInputSchema>;

const ContextualGuidanceOutputSchema = z.object({
  bibleVerses: z.array(z.string()).describe('A list of relevant Bible verses.'),
  talkingPoints: z.array(z.string()).describe('A list of talking points related to the topic.'),
});
export type ContextualGuidanceOutput = z.infer<typeof ContextualGuidanceOutputSchema>;

export async function contextualGuidance(input: ContextualGuidanceInput): Promise<ContextualGuidanceOutput> {
  return contextualGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualGuidancePrompt',
  input: {schema: ContextualGuidanceInputSchema},
  output: {schema: ContextualGuidanceOutputSchema},
  prompt: `You are a helpful AI assistant that provides relevant Bible verses and talking points based on a given topic or theme.

  Topic: {{{topic}}}

  Please provide a list of relevant Bible verses and talking points that can be used for discussions or evangelism. The verses and talking points should be distinct and concise.
  Verses should include book name, chapter, and verse numbers.
  Do not include commentary. 

  Format:
  {
   bibleVerses: string[];
   talkingPoints: string[];
  }
  `,
});

const contextualGuidanceFlow = ai.defineFlow(
  {
    name: 'contextualGuidanceFlow',
    inputSchema: ContextualGuidanceInputSchema,
    outputSchema: ContextualGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
