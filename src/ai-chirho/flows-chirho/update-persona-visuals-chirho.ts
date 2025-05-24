// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
'use server';
/**
 * @fileOverview Regenerates an AI persona's image with updated expressions or context.
 *
 * - updatePersonaVisualsChirho - A function that regenerates the persona image.
 * - UpdatePersonaVisualsInputChirho - The input type for the function.
 * - UpdatePersonaVisualsOutputChirho - The return type for the function.
 */

import {ai} from '@/ai-chirho/genkit-chirho';
import {z} from 'genkit';
import { fal } from "@fal-ai/client";

const UpdatePersonaVisualsInputSchemaChirho = z.object({
  baseImageUriChirho: z
    .string()
    .describe(
      'Data URI of the base image of the persona to ensure visual consistency. Expected format: \'data:<mimetype>;base64,<encoded_data>\', or a public HTTPS URL.'
    ),
  personaNameChirho: z.string().describe('Name of the persona.'),
  originalMeetingContextChirho: z
    .string()
    .describe(
      'The original setting/context the persona was introduced in, to help maintain setting consistency.'
    ),
  newVisualPromptChirho: z
    .string()
    .describe(
      "Prompt describing the persona's current expression, pose, or minor environmental changes for the new image. MUST be in English."
    ),
});
export type UpdatePersonaVisualsInputChirho = z.infer<
  typeof UpdatePersonaVisualsInputSchemaChirho
>;

const UpdatePersonaVisualsOutputSchemaChirho = z.object({
  updatedImageUriChirho: z
    .string()
    .describe(
      'Data URI of the newly generated image. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type UpdatePersonaVisualsOutputChirho = z.infer<
  typeof UpdatePersonaVisualsOutputSchemaChirho
>;

export async function updatePersonaVisualsChirho(
  input: UpdatePersonaVisualsInputChirho
): Promise<UpdatePersonaVisualsOutputChirho> {
  return updatePersonaVisualsFlowChirho(input);
}

const updatePersonaVisualsFlowChirho = ai.defineFlow(
  {
    name: 'updatePersonaVisualsFlowChirho',
    inputSchema: UpdatePersonaVisualsInputSchemaChirho,
    outputSchema: UpdatePersonaVisualsOutputSchemaChirho,
  },
  async ({
    baseImageUriChirho,
    personaNameChirho,
    originalMeetingContextChirho,
    newVisualPromptChirho,
  }) => {
    const imageTextPromptChirho = `You are an image generation AI. You have been given a base image of a character named ${personaNameChirho}. Their original meeting context was: "${originalMeetingContextChirho}".
Your task is to generate a *new* 512x512 image that maintains the *exact same character identity and core appearance* from the base image, and keeps them in the *same general setting* as described by their original meeting context.
The new image should only reflect changes in their expression, pose, or minor environmental details as described in the 'new visual prompt' below.
Do NOT change the character into someone else. Do NOT drastically change the setting. Focus on their expression and pose. Help the changes keep the conversation engaging (in a pure, non-sensual) way.
Ensure the updated image remains modest, appropriate for all audiences, photorealistic, and strictly avoids any revealing attire, cleavage, or suggestive elements.

New Visual Prompt (expression, pose, minor changes, MUST BE IN ENGLISH): "${newVisualPromptChirho}"

Generate the updated image.`;


    try {
      let randSeedChirho = Math.floor(Math.random() * 65535);
      let image_result_chirho = await fal.run("fal-ai/flux/schnell/image-to-image", {
        input: {
          prompt: imageTextPromptChirho,
          image_url: baseImageUriChirho,
          seed: randSeedChirho,
          image_size: "square",
          num_images: 1,
        },
      });

      let imageUrlChirho = image_result_chirho.data.images[0].url;

      return {
         updatedImageUriChirho: imageUrlChirho
      };
    } catch (errorChirho: any) {
      console.error(
       '[Update Persona Visuals Flow] Image regeneration CRITICALLY FAILED. Error:', errorChirho.message ? errorChirho.message : errorChirho, 'Inputs:',
       {baseImageUriShorthandChirho: baseImageUriChirho.substring(0,50) + "...", personaNameChirho, originalMeetingContextChirho, newVisualPromptChirho}
     );
     throw new Error(`Image regeneration failed for persona: ${errorChirho.message || "Unknown error"}`);
   }

    /*

    try {
      const imageGenPromptChirho = [
        {media: {url: baseImageUriChirho}}, 
        {
          text: imageTextPromptChirho,
        },
      ];
      const imageResultChirho = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: imageGenPromptChirho,
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

      const imageUrlChirho = imageResultChirho.media?.url;
      if (!imageUrlChirho) {
        console.error(
          '[Update Persona Visuals Flow] Image regeneration failed to return a URL (no media.url). Inputs:',
          {baseImageUriShorthandChirho: baseImageUriChirho.substring(0,50) + "...", personaNameChirho, originalMeetingContextChirho, newVisualPromptChirho}
        );
        throw new Error('Image regeneration failed for persona: No media URL returned.');
      }
      return {updatedImageUriChirho: imageUrlChirho};

    } catch (error: any) {
       console.error(
        '[Update Persona Visuals Flow] Image regeneration CRITICALLY FAILED. Error:', error.message ? error.message : error, 'Inputs:',
        {baseImageUriShorthandChirho: baseImageUriChirho.substring(0,50) + "...", personaNameChirho, originalMeetingContextChirho, newVisualPromptChirho}
      );
      throw new Error(`Image regeneration failed for persona: ${error.message || "Unknown error"}`);
    } */
  }
);
