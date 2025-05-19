
'use server';
/**
 * @fileOverview Generates a new AI persona with a unique backstory, name, meeting context, and image for each evangelism simulation.
 *
 * - generateAiPersonaChirho - A function that generates the AI persona.
 * - GenerateAiPersonaInputChirho - The input type for the generateAiPersonaChirho function.
 * - GenerateAiPersonaOutputChirho - The return type for the generateAiPersonaChirho function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiPersonaInputSchemaChirho = z.object({
  personaDescriptionChirho: z
    .string()
    .default(
      'A person with a unique life story, who may have difficult questions before they come to believe.'
    )
    .describe('A general description or theme for the desired persona (e.g., struggling with loss, curious skeptic, specific profession).'),
});
export type GenerateAiPersonaInputChirho = z.infer<typeof GenerateAiPersonaInputSchemaChirho>;

const GenerateAiPersonaOutputSchemaChirho = z.object({
  personaNameChirho: z.string().describe('The first name of the AI persona.'),
  personaDetailsChirho: z.string().describe('The detailed backstory of the AI persona (intended for AI context, not direct user display).'),
  meetingContextChirho: z.string().describe('A brief scenario describing how the user meets the persona, consistent with the persona image and backstory.'),
  personaImageChirho: z
    .string()
    .describe(
      'The image of the AI persona, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateAiPersonaOutputChirho = z.infer<typeof GenerateAiPersonaOutputSchemaChirho>;

export async function generateAiPersonaChirho(input: GenerateAiPersonaInputChirho): Promise<GenerateAiPersonaOutputChirho> {
  return generateAiPersonaFlowChirho(input);
}

const generateAiPersonaFlowChirho = ai.defineFlow(
  {
    name: 'generateAiPersonaFlowChirho',
    inputSchema: GenerateAiPersonaInputSchemaChirho,
    outputSchema: GenerateAiPersonaOutputSchemaChirho,
  },
  async (input: GenerateAiPersonaInputChirho) => {
    const personaDataPromptChirho = `You are an AI that generates diverse and unique characters for evangelism simulations.
Based on the following input hint: "${input.personaDescriptionChirho}".
Create a character ensuring a WIDE VARIETY of names, professions, cultural backgrounds, and life situations. Avoid common tropes or repeating recent characters.
The character needs:
1. A unique first name (avoid very common names like Caleb, Kai, Eliza unless the input hint strongly suggests it). This name will be the value for "personaNameChirho".
2. A detailed backstory (a few paragraphs). This backstory is for the AI to understand its role and should allow for discovery through conversation. It should include personality traits, beliefs (or lack thereof), current emotional state, and potential points of resistance or curiosity regarding faith. This will be the value for "personaDetailsChirho".
3. A brief, imaginative meeting context (1-2 engaging sentences) describing how the user might encounter this person. This context should provide a natural starting point for a conversation and be consistent with a potential visual for the character. Make this context varied; not everyone is a barista or librarian. Think about everyday situations, unique encounters, or community settings. This will be the value for "meetingContextChirho".

Return ONLY a JSON object with three keys: "personaNameChirho", "personaDetailsChirho", and "meetingContextChirho".
Example JSON (ensure to vary from this example):
{
  "personaNameChirho": "Priya",
  "personaDetailsChirho": "Priya is a software developer in her late 20s, deeply analytical and passionate about ethical AI. She volunteers at a local coding bootcamp for underprivileged youth on weekends. While open-minded, she's skeptical of anything that can't be logically proven and has had negative experiences with organized religion in her family. She's currently pondering the societal impact of rapidly advancing technology.",
  "meetingContextChirho": "You're at a community tech fair, and Priya is giving a short presentation on AI ethics. She seems approachable for a question afterwards."
}
Ensure the output is a single, valid JSON object and nothing else.`;

    const personaDataResultChirho = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: personaDataPromptChirho,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      },
    });

    let parsedPersonaDataChirho: { personaNameChirho: string; personaDetailsChirho: string; meetingContextChirho: string };
    try {
      const jsonStringChirho = personaDataResultChirho.text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStringChirho) {
        throw new Error("No JSON object found in the model's response.");
      }
      parsedPersonaDataChirho = JSON.parse(jsonStringChirho);
      if (!parsedPersonaDataChirho.personaNameChirho || !parsedPersonaDataChirho.personaDetailsChirho || !parsedPersonaDataChirho.meetingContextChirho) {
        throw new Error("Parsed JSON is missing required fields: personaNameChirho, personaDetailsChirho, meetingContextChirho.");
      }
    } catch (e) {
      console.error("Failed to parse persona data JSON:", personaDataResultChirho.text, e);
      parsedPersonaDataChirho = {
        personaNameChirho: "Jordan (Fallback) Chirho",
        personaDetailsChirho: "Jordan Chirho is a thoughtful individual encountering some of life's common questions. They are open to discussion but require sincere engagement. This is a fallback persona due to a generation error in parsing.",
        meetingContextChirho: "You've encountered Jordan Chirho by chance today. Perhaps a friendly greeting is in order?",
      };
    }

    const imagePromptChirho = `Generate a realistic portrait style image of a person named ${parsedPersonaDataChirho.personaNameChirho}.
Their general disposition and appearance can be inferred from: ${parsedPersonaDataChirho.personaDetailsChirho.substring(0, 250)}...
They are encountered in this specific context: "${parsedPersonaDataChirho.meetingContextChirho}".
The image should focus on ${parsedPersonaDataChirho.personaNameChirho} and subtly reflect the mood or setting of the meeting context. Aim for a friendly, neutral, or context-appropriate expression suitable for a chat simulation. Ensure diverse appearances.`;

    const imageResultChirho = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePromptChirho,
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
        console.error("Image generation failed to return a URL. Persona data:", parsedPersonaDataChirho);
        // Fallback image or throw error
        throw new Error("Image generation failed for persona.");
    }

    return {
      personaNameChirho: parsedPersonaDataChirho.personaNameChirho,
      personaDetailsChirho: parsedPersonaDataChirho.personaDetailsChirho,
      meetingContextChirho: parsedPersonaDataChirho.meetingContextChirho,
      personaImageChirho: imageUrlChirho,
    };
  }
);
