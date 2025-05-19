
'use server';
/**
 * @fileOverview Provides contextual guidance by generating relevant Bible verses and talking points based on a given topic.
 *
 * - contextualGuidanceChirho - A function that generates Bible verses and talking points based on a topic.
 * - ContextualGuidanceInputChirho - The input type for the contextualGuidanceChirho function.
 * - ContextualGuidanceOutputChirho - The return type for the contextualGuidanceChirho function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualGuidanceInputSchemaChirho = z.object({
  topicChirho: z.string().describe('The topic or theme for which to generate Bible verses and talking points.'),
});
export type ContextualGuidanceInputChirho = z.infer<typeof ContextualGuidanceInputSchemaChirho>;

const ContextualGuidanceOutputSchemaChirho = z.object({
  bibleVersesChirho: z.array(z.string()).describe('A list of relevant Bible verses.'),
  talkingPointsChirho: z.array(z.string()).describe('A list of talking points related to the topic.'),
});
export type ContextualGuidanceOutputChirho = z.infer<typeof ContextualGuidanceOutputSchemaChirho>;

export async function contextualGuidanceChirho(input: ContextualGuidanceInputChirho): Promise<ContextualGuidanceOutputChirho> {
  return contextualGuidanceFlowChirho(input);
}

const promptChirho = ai.definePrompt({
  name: 'contextualGuidancePromptChirho',
  input: {schema: ContextualGuidanceInputSchemaChirho},
  output: {schema: ContextualGuidanceOutputSchemaChirho},
  prompt: `You are a helpful AI assistant that provides relevant Bible verses and talking points based on a given topic or theme.

  Topic: {{{topicChirho}}}

  Please provide a list of relevant Bible verses and talking points that can be used for discussions or evangelism. The verses and talking points should be distinct and concise.
  Verses should include book name, chapter, and verse numbers.
  Do not include commentary. 

  Format:
  {
   "bibleVersesChirho": string[];
   "talkingPointsChirho": string[];
  }
  `,
});

const contextualGuidanceFlowChirho = ai.defineFlow(
  {
    name: 'contextualGuidanceFlowChirho',
    inputSchema: ContextualGuidanceInputSchemaChirho,
    outputSchema: ContextualGuidanceOutputSchemaChirho,
  },
  async (input: ContextualGuidanceInputChirho) => {
    const {output} = await promptChirho(input);
    return output!;
  }
);
