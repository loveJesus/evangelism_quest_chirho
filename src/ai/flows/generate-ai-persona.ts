
'use server';
/**
 * @fileOverview Generates a new AI persona with a unique backstory, name, meeting context, and image for each evangelism simulation.
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
    .describe('A general description or theme for the desired persona (e.g., struggling with loss, curious skeptic, specific profession).'),
});
export type GenerateAiPersonaInput = z.infer<typeof GenerateAiPersonaInputSchema>;

const GenerateAiPersonaOutputSchema = z.object({
  personaName: z.string().describe('The first name of the AI persona.'),
  personaDetails: z.string().describe('The detailed backstory of the AI persona (intended for AI context, not direct user display).'),
  meetingContext: z.string().describe('A brief scenario describing how the user meets the persona, consistent with the persona image and backstory.'),
  personaImage: z
    .string()
    .describe(
      'The image of the AI persona, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateAiPersonaOutput = z.infer<typeof GenerateAiPersonaOutputSchema>;

export async function generateAiPersona(input: GenerateAiPersonaInput): Promise<GenerateAiPersonaOutput> {
  return generateAiPersonaFlow(input);
}

const generateAiPersonaFlow = ai.defineFlow(
  {
    name: 'generateAiPersonaFlow',
    inputSchema: GenerateAiPersonaInputSchema,
    outputSchema: GenerateAiPersonaOutputSchema,
  },
  async (input: GenerateAiPersonaInput) => {
    const personaDataPrompt = `You are an AI that generates diverse and unique characters for evangelism simulations.
Based on the following input hint: "${input.personaDescription}".
Create a character ensuring a WIDE VARIETY of names, professions, cultural backgrounds, and life situations. Avoid common tropes or repeating recent characters.
The character needs:
1. A unique first name (avoid very common names like Caleb, Kai, Eliza unless the input hint strongly suggests it).
2. A detailed backstory (a few paragraphs). This backstory is for the AI to understand its role and should allow for discovery through conversation. It should include personality traits, beliefs (or lack thereof), current emotional state, and potential points of resistance or curiosity regarding faith.
3. A brief, imaginative meeting context (1-2 engaging sentences) describing how the user might encounter this person. This context should provide a natural starting point for a conversation and be consistent with a potential visual for the character. Make this context varied; not everyone is a barista or librarian. Think about everyday situations, unique encounters, or community settings.

Return ONLY a JSON object with three keys: "personaName", "personaDetails", and "meetingContext".
Example JSON (ensure to vary from this example):
{
  "personaName": "Priya",
  "personaDetails": "Priya is a software developer in her late 20s, deeply analytical and passionate about ethical AI. She volunteers at a local coding bootcamp for underprivileged youth on weekends. While open-minded, she's skeptical of anything that can't be logically proven and has had negative experiences with organized religion in her family. She's currently pondering the societal impact of rapidly advancing technology.",
  "meetingContext": "You're at a community tech fair, and Priya is giving a short presentation on AI ethics. She seems approachable for a question afterwards."
}
Ensure the output is a single, valid JSON object and nothing else.`;

    const personaDataResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: personaDataPrompt,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      },
    });

    let parsedPersonaData: { personaName: string; personaDetails: string; meetingContext: string };
    try {
      const jsonString = personaDataResult.text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonString) {
        throw new Error("No JSON object found in the model's response.");
      }
      parsedPersonaData = JSON.parse(jsonString);
      if (!parsedPersonaData.personaName || !parsedPersonaData.personaDetails || !parsedPersonaData.meetingContext) {
        throw new Error("Parsed JSON is missing required fields.");
      }
    } catch (e) {
      console.error("Failed to parse persona data JSON:", personaDataResult.text, e);
      parsedPersonaData = {
        personaName: "Jordan (Fallback)",
        personaDetails: "Jordan is a thoughtful individual encountering some of life's common questions. They are open to discussion but require sincere engagement. This is a fallback persona due to a generation error in parsing.",
        meetingContext: "You've encountered Jordan by chance today. Perhaps a friendly greeting is in order?",
      };
    }

    const imagePrompt = `Generate a realistic portrait style image of a person named ${parsedPersonaData.personaName}.
Their general disposition and appearance can be inferred from: ${parsedPersonaData.personaDetails.substring(0, 250)}...
They are encountered in this specific context: "${parsedPersonaData.meetingContext}".
The image should focus on ${parsedPersonaData.personaName} and subtly reflect the mood or setting of the meeting context. Aim for a friendly, neutral, or context-appropriate expression suitable for a chat simulation. Ensure diverse appearances.`;

    const imageResult = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePrompt,
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
        console.error("Image generation failed to return a URL. Persona data:", parsedPersonaData);
        // Fallback image or throw error
        throw new Error("Image generation failed for persona.");
    }

    return {
      personaName: parsedPersonaData.personaName,
      personaDetails: parsedPersonaData.personaDetails,
      meetingContext: parsedPersonaData.meetingContext,
      personaImage: imageUrl,
    };
  }
);
