// src/ai/flows/generate-ai-persona.ts
'use server';
/**
 * @fileOverview Generates a new AI persona with a unique backstory and image for each evangelism simulation.
 *
 * - generateAiPersona - A function that generates the AI persona.
 * - GenerateAiPersonaInput - The input type for the generateAiPersona function.
 * - GenerateAiPersonaOutput - The return type for the generateAiPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiPersonaInputSchema = z.object({
  personaDescription: z
    .string()
    .default(
      'A person with a unique life story, who may have difficult questions before they come to believe.'
    )
    .describe('A description of the desired persona.'),
});
export type GenerateAiPersonaInput = z.infer<typeof GenerateAiPersonaInputSchema>;

const GenerateAiPersonaOutputSchema = z.object({
  personaDetails: z.string().describe('The detailed backstory of the AI persona.'),
  personaImage: z
    .string()
    .describe(
      'The image of the AI persona, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // keep the backslashes here, to not break the JSON.
    ),
});
export type GenerateAiPersonaOutput = z.infer<typeof GenerateAiPersonaOutputSchema>;

export async function generateAiPersona(input: GenerateAiPersonaInput): Promise<GenerateAiPersonaOutput> {
  return generateAiPersonaFlow(input);
}

const personaPrompt = ai.definePrompt({
  name: 'personaPrompt',
  input: {schema: GenerateAiPersonaInputSchema},
  output: {schema: GenerateAiPersonaOutputSchema},
  prompt: `You are an AI that generates descriptions and images of people for evangelism simulations.

  Create a detailed backstory for a person who: {{{personaDescription}}}.

  Output a detailed description of the person and also generate an image of the person.  The image should match the description and backstory.
  The image MUST be returned as a data URI.

  Description:
  {{personaDetails}}

  Image:
  {{media url=personaImage}}
  `,
});

const generateAiPersonaFlow = ai.defineFlow(
  {
    name: 'generateAiPersonaFlow',
    inputSchema: GenerateAiPersonaInputSchema,
    outputSchema: GenerateAiPersonaOutputSchema,
  },
  async input => {
    const personaDetailsResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Create a detailed backstory for a person who: ${input.personaDescription}. Return ONLY the description of the person. Do not include any image`,
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });

    const imageResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate an image of the person described here: ${personaDetailsResult.text}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });

    return {
      personaDetails: personaDetailsResult.text,
      personaImage: imageResult.media!.url,
    };
  }
);
