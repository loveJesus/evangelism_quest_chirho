
'use server';
/**
 * @fileOverview Generates a new AI persona with a unique backstory, name, meeting context, image, and name visibility for evangelism simulations.
 *
 * - generateAiPersonaChirho - A function that generates the AI persona.
 * - GenerateAiPersonaInputChirho - The input type for the generateAiPersonaChirho function.
 * - GenerateAiPersonaOutputChirho - The return type for the generateAiPersonaChirho function.
 */

import {ai} from '@/ai/genkit-chirho'; // Updated import
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
  personaNameChirho: z.string().describe('The first name of the AI persona. Should be diverse and not repetitive.'),
  personaDetailsChirho: z.string().describe('The detailed backstory of the AI persona (intended for AI context, not direct user display).'),
  meetingContextChirho: z.string().describe('A brief scenario describing how the user meets the persona, consistent with the persona image and backstory. This context determines if the name is immediately known.'),
  personaImageChirho: z
    .string()
    .describe(
      'The image of the AI persona, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  personaNameKnownToUserChirho: z.boolean().describe('Whether the persona\'s name is immediately known to the user based on the meeting context (e.g., name tag, introduction vs. random encounter).'),
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
Create a character ensuring a WIDE VARIETY of names (common, uncommon, diverse cultural backgrounds; AVOID REPEATING names like Caleb, Kai, Zephyr, Zephyrine unless specifically hinted), professions, cultural backgrounds, and life situations.
The character needs:
1. A unique first name. This name will be the value for "personaNameChirho".
2. A detailed backstory (a few paragraphs). This backstory is for the AI to understand its role and should allow for discovery through conversation. It should include personality traits, beliefs (or lack thereof), current emotional state, and potential points of resistance or curiosity regarding faith. This will be the value for "personaDetailsChirho".
3. A brief, imaginative meeting context (1-2 engaging sentences) describing how the user might encounter this person. This context should provide a natural starting point for a conversation and be consistent with a potential visual for the character. Make this context varied; not everyone is a barista or librarian. Think about everyday situations, unique encounters, or community settings. This will be the value for "meetingContextChirho".
4. Based on the "meetingContextChirho", determine if the persona's name would be immediately known to the user. For example, if they are a coworker, introduced by a friend, or wearing a nametag, set "personaNameKnownToUserChirho" to true. If it's a chance encounter with a stranger (e.g., "a person on a park bench", "someone who dropped their keys"), set "personaNameKnownToUserChirho" to false.

Return ONLY a JSON object with four keys: "personaNameChirho", "personaDetailsChirho", "meetingContextChirho", and "personaNameKnownToUserChirho".
Example JSON (ensure to vary names, context, and name visibility from this example):
{
  "personaNameChirho": "Priya",
  "personaDetailsChirho": "Priya is a software developer in her late 20s, deeply analytical and passionate about ethical AI. She volunteers at a local coding bootcamp for underprivileged youth on weekends. While open-minded, she's skeptical of anything that can't be logically proven and has had negative experiences with organized religion in her family. She's currently pondering the societal impact of rapidly advancing technology.",
  "meetingContextChirho": "You're at a community tech fair, and Priya is giving a short presentation on AI ethics. She seems approachable for a question afterwards.",
  "personaNameKnownToUserChirho": true 
}
Another Example:
{
  "personaNameChirho": "Marcus",
  "personaDetailsChirho": "Marcus is a retired history teacher in his early 70s, often found feeding pigeons in the local park. He's seen a lot in his life and carries a gentle sadness from past regrets. He's reflective and enjoys philosophical discussions but is wary of dogmatic assertions.",
  "meetingContextChirho": "You notice an elderly gentleman sitting alone on a park bench, looking thoughtfully at the pigeons. He offers a kind smile as you walk by.",
  "personaNameKnownToUserChirho": false
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

    let parsedPersonaDataChirho: { personaNameChirho: string; personaDetailsChirho: string; meetingContextChirho: string; personaNameKnownToUserChirho: boolean; };
    try {
      const jsonStringChirho = personaDataResultChirho.text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStringChirho) {
        throw new Error("No JSON object found in the model's response.");
      }
      parsedPersonaDataChirho = JSON.parse(jsonStringChirho);
      if (!parsedPersonaDataChirho.personaNameChirho || !parsedPersonaDataChirho.personaDetailsChirho || !parsedPersonaDataChirho.meetingContextChirho || typeof parsedPersonaDataChirho.personaNameKnownToUserChirho !== 'boolean') {
        throw new Error("Parsed JSON is missing required fields or personaNameKnownToUserChirho is not a boolean.");
      }
    } catch (e) {
      console.error("Failed to parse persona data JSON:", personaDataResultChirho.text, e);
      parsedPersonaDataChirho = {
        personaNameChirho: "Jordan (Fallback) Chirho",
        personaDetailsChirho: "Jordan Chirho is a thoughtful individual encountering some of life's common questions. They are open to discussion but require sincere engagement. This is a fallback persona due to a generation error in parsing.",
        meetingContextChirho: "You've encountered Jordan Chirho by chance today. Perhaps a friendly greeting is in order?",
        personaNameKnownToUserChirho: false,
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
        throw new Error("Image generation failed for persona.");
    }

    return {
      personaNameChirho: parsedPersonaDataChirho.personaNameChirho,
      personaDetailsChirho: parsedPersonaDataChirho.personaDetailsChirho,
      meetingContextChirho: parsedPersonaDataChirho.meetingContextChirho,
      personaImageChirho: imageUrlChirho,
      personaNameKnownToUserChirho: parsedPersonaDataChirho.personaNameKnownToUserChirho,
    };
  }
);
