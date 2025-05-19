
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
    .describe('A general description or theme for the desired persona (e.g., struggling with loss, curious skeptic).'),
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
    const personaDataPrompt = `You are an AI that generates characters for evangelism simulations.
Create a character based on the following input hint: "${input.personaDescription}".
The character needs:
1. A first name.
2. A detailed backstory (a few paragraphs). This backstory is for the AI to understand its role and should allow for discovery through conversation.
3. A brief meeting context (1-2 engaging sentences) describing how the user might encounter this person. This context should be imaginative, provide a starting point for a conversation, and be consistent with a potential visual.

Return ONLY a JSON object with three keys: "personaName", "personaDetails", and "meetingContext".
Example JSON:
{
  "personaName": "Eliza",
  "personaDetails": "Eliza is a librarian in her late 30s, recently widowed. She finds solace in books but is quietly struggling with grief and questions about the future. She is introspective and values deep conversations but is wary of easy answers. She often visits the old park to read and reflect.",
  "meetingContext": "You are in the local library and notice Eliza, the librarian, looking a bit down as she re-shelves books. You feel a nudge to say something kind."
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
      // Attempt to parse the text, robustly handling potential non-JSON prefixes/suffixes from the model
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
      // Provide a fallback structure if parsing fails, to prevent app crash
      parsedPersonaData = {
        personaName: "Alex",
        personaDetails: "Alex is a thoughtful individual facing some of life's common questions. They are open to discussion but require sincere engagement. This is a fallback persona due to a generation error.",
        meetingContext: "You've encountered Alex by chance today. Perhaps a friendly greeting is in order?",
      };
      // Optionally, re-throw or handle more gracefully if fallback isn't desired long-term
      // throw new Error(`Failed to generate valid persona data structure: ${(e as Error).message}`);
    }

    const imagePrompt = `Generate a realistic portrait style image of a person named ${parsedPersonaData.personaName}.
Their general disposition can be inferred from: ${parsedPersonaData.personaDetails.substring(0, 250)}...
They are encountered in this specific context: "${parsedPersonaData.meetingContext}".
The image should focus on ${parsedPersonaData.personaName} and subtly reflect the mood or setting of the meeting context. Aim for a friendly and approachable look suitable for a chat simulation.`;

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
      personaDetails: parsedPersonaData.personaDetails, // Full backstory for AI context
      meetingContext: parsedPersonaData.meetingContext, // For user display
      personaImage: imageUrl,
    };
  }
);
