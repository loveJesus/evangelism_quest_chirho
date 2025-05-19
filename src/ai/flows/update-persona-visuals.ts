
'use server';
/**
 * @fileOverview Regenerates an AI persona's image with updated expressions or context.
 *
 * - updatePersonaVisuals - A function that regenerates the persona image.
 * - UpdatePersonaVisualsInput - The input type for the function.
 * - UpdatePersonaVisualsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const UpdatePersonaVisualsInputSchema = z.object({
  baseImageUri: z
    .string()
    .describe(
      'Data URI of the base image of the persona to ensure visual consistency. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  personaName: z.string().describe('Name of the persona.'),
  originalMeetingContext: z
    .string()
    .describe(
      'The original setting/context the persona was introduced in, to help maintain setting consistency.'
    ),
  newVisualPrompt: z
    .string()
    .describe(
      "Prompt describing the persona's current expression, pose, or minor environmental changes for the new image."
    ),
});
export type UpdatePersonaVisualsInput = z.infer<
  typeof UpdatePersonaVisualsInputSchema
>;

export const UpdatePersonaVisualsOutputSchema = z.object({
  updatedImageUri: z
    .string()
    .describe(
      'Data URI of the newly generated image. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type UpdatePersonaVisualsOutput = z.infer<
  typeof UpdatePersonaVisualsOutputSchema
>;

export async function updatePersonaVisuals(
  input: UpdatePersonaVisualsInput
): Promise<UpdatePersonaVisualsOutput> {
  return updatePersonaVisualsFlow(input);
}

const updatePersonaVisualsFlow = ai.defineFlow(
  {
    name: 'updatePersonaVisualsFlow',
    inputSchema: UpdatePersonaVisualsInputSchema,
    outputSchema: UpdatePersonaVisualsOutputSchema,
  },
  async ({
    baseImageUri,
    personaName,
    originalMeetingContext,
    newVisualPrompt,
  }) => {
    const imageGenPrompt = [
      {media: {url: baseImageUri}},
      {
        text: `You are an image generation AI. You have been given a base image of a character named ${personaName}. Their original meeting context was: "${originalMeetingContext}".
Your task is to generate a *new* image that maintains the *exact same character identity and core appearance* from the base image, and keeps them in the *same general setting* as described by their original meeting context.
The new image should only reflect changes in their expression, pose, or minor environmental details as described in the 'new visual prompt' below.
Do NOT change the character into someone else. Do NOT drastically change the setting. Focus on their expression and pose.

New Visual Prompt (expression, pose, minor changes): "${newVisualPrompt}"

Generate the updated image.`,
      },
    ];

    const imageResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imageGenPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      },
    });

    const imageUrl = imageResult.media?.url;
    if (!imageUrl) {
      console.error(
        'Image regeneration failed to return a URL. Inputs:',
        {baseImageUriShorthand: baseImageUri.substring(0,50) + "...", personaName, originalMeetingContext, newVisualPrompt}
      );
      throw new Error('Image regeneration failed for persona.');
    }

    return {updatedImageUri: imageUrl};
  }
);
```