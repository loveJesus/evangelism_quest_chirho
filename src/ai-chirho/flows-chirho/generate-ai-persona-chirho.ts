// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
'use server';
/**
 * @fileOverview Generates a new AI persona with a unique backstory, name, meeting context, image, name visibility, and a short encounter title for evangelism simulations.
 *
 * - generateAiPersonaChirho - A function that generates the AI persona.
 * - GenerateAiPersonaInputChirho - The input type for the generateAiPersonaChirho function.
 * - GenerateAiPersonaOutputChirho - The return type for the generateAiPersonaChirho function.
 */

import {ai} from '@/ai-chirho/genkit-chirho';
import {z} from 'genkit';

const GenerateAiPersonaInputSchemaChirho = z.object({
  personaDescriptionChirho: z
    .string()
    .default(
      'A person with a unique life story, who may have difficult questions before they come to believe.'
    )
    .describe('A general description or theme for the desired persona (e.g., struggling with loss, curious skeptic, specific profession).'),
  languageChirho: z.string().optional().default('en').describe('The language for the persona generation (e.g., "en", "es").'),
});
export type GenerateAiPersonaInputChirho = z.infer<typeof GenerateAiPersonaInputSchemaChirho>;

const GenerateAiPersonaOutputSchemaChirho = z.object({
  personaNameChirho: z.string().describe('The first name of the AI persona. Should be diverse and not repetitive.'),
  personaDetailsChirho: z.string().describe('The detailed backstory of the AI persona (intended for AI context, not direct user display). This MUST include the persona\'s sex and approximate age/age range.'),
  meetingContextChirho: z.string().describe('A brief scenario describing how the user meets the persona, consistent with the persona image and backstory. This context determines if the name is immediately known, leave personaNameChirho out if not known.'),
  encounterTitleChirho: z.string().describe('A short, engaging title for the encounter (max 5-7 words), suitable for display if the persona name is not immediately known. e.g., "The Distressed Artist", "Park Bench Contemplation", "Barista\'s Questions". This is different from the full meetingContextChirho.'),
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
    const personaDataPromptChirho = `You are an AI that generates diverse and unique characters for evangelism simulations in the specified language.
Language for all generated text: {{{languageChirho}}}
Based on the following input hint: "${input.personaDescriptionChirho}".

Your primary goal is to create a NEW and UNIQUE character each time.
1.  **Persona Name ("personaNameChirho")**:
    *   Generate a unique first name appropriate for the specified language ({{{languageChirho}}}).
    *   Ensure a WIDE VARIETY of names: common, uncommon, diverse cultural backgrounds relevant to the language.
    *   **CRITICAL: DO NOT REPEAT names like Caleb, Kai, Zephyr, Zephyrine, or any other names you might have used in recent generations. Always try for something fresh unless specifically hinted.**
2.  **Persona Details ("personaDetailsChirho")**:
    *   Craft a detailed backstory (a few paragraphs) in the specified language ({{{languageChirho}}}). This backstory is for the AI to understand its role and should allow for discovery through conversation.
    *   It MUST explicitly state the persona's **sex** (e.g., "a man" or "a woman" or equivalent in {{{languageChirho}}}) and an approximate **age or age range** (e.g., "in her early 20s", "a man in his mid-40s", "around 60 years old" or equivalent in {{{languageChirho}}}).
    *   Include personality traits, beliefs (or lack thereof), current emotional state, and potential points of resistance or curiosity regarding faith, all in {{{languageChirho}}}.
    *   Ensure varied professions, cultural backgrounds, and life situations appropriate for the language context.
3.  **Meeting Context ("meetingContextChirho")**:
    *   Create a brief, imaginative meeting context (1-4 engaging sentences) in {{{languageChirho}}}, describing how the user might encounter this person. Please keep it pure, for example, don't call something like a pizza delivery man dropping his pizza comical.
    *   This context should provide a natural starting point for a conversation and be consistent with a potential visual for the character.
    *   Make this context varied; not everyone is a barista or librarian. Think about everyday situations, unique encounters, or community settings.
    *   If the person's name is known, explain why it is known (in {{{languageChirho}}}). If it is an encounter with a stranger, do not mention the individual's name.
4.  **Encounter Title ("encounterTitleChirho")**:
    *   Based on the persona and meeting context, generate a short, engaging title for this specific encounter (max 5-7 words) in {{{languageChirho}}}. 
    *   This title will be displayed to the user if the persona's name isn't immediately known.
    *   Examples (in English, adapt for other languages): "The Lost Tourist", "Anxious at the Airport", "Cafe Philosopher", "Skeptic in the Park", "Grieving Widow".
    *   Make it descriptive of the situation or the persona's initial presentation.
5.  **Name Known to User ("personaNameKnownToUserChirho")**:
    *   Based on the "meetingContextChirho", determine if the persona's name would be immediately known to the user.
    *   If the context implies the name is known (e.g., coworker, introduced by a friend, wearing a nametag like "Barista named Leo"), set to \`true\`.
    *   If it's a chance encounter with a stranger (e.g., "a person on a park bench", "someone who dropped their keys"), set to \`false\`.

Return ONLY a JSON object with five keys: "personaNameChirho", "personaDetailsChirho", "meetingContextChirho", "encounterTitleChirho", and "personaNameKnownToUserChirho".

Example (ensure to vary ALL details, especially names, from this example):
{
  "personaNameChirho": "Soren",
  "personaDetailsChirho": "Soren is a man in his early 50s, a former architect turned urban farmer after a midlife crisis prompted him to seek a simpler, more grounded life. Born in a small Danish immigrant community in the Midwest, he carries a quiet pride in his heritage but feels disconnected from the religious traditions of his upbringing, favoring a pragmatic, self-reliant worldview. Recently, a blight destroyed half his crop, leaving him frustrated and introspective, wondering if there's a deeper meaning to his struggles. His sex is male, age early 50s. Soren is reserved but warm once trust is earned, with a sharp wit and a curiosity about others' beliefs, though he’s skeptical of anything that feels dogmatic.",
  "meetingContextChirho": "At a local farmers' market, you notice a man with weathered hands and a thoughtful gaze arranging baskets of vibrant vegetables. He catches your eye and offers a small, knowing smile, as if inviting a conversation about more than just produce.",
  "encounterTitleChirho": "The Thoughtful Farmer",
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

    let parsedPersonaDataChirho: { personaNameChirho: string; personaDetailsChirho: string; meetingContextChirho: string; encounterTitleChirho: string; personaNameKnownToUserChirho: boolean; };
    try {
      const jsonStringChirho = personaDataResultChirho.text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStringChirho) {
        throw new Error("No JSON object found in the model's response for persona data.");
      }
      parsedPersonaDataChirho = JSON.parse(jsonStringChirho);
      if (!parsedPersonaDataChirho.personaNameChirho || !parsedPersonaDataChirho.personaDetailsChirho || !parsedPersonaDataChirho.meetingContextChirho || !parsedPersonaDataChirho.encounterTitleChirho || typeof parsedPersonaDataChirho.personaNameKnownToUserChirho !== 'boolean') {
        throw new Error("Parsed JSON is missing required fields (name, details, context, title, or nameKnown) or personaNameKnownToUserChirho is not a boolean.");
      }
       if (!parsedPersonaDataChirho.personaDetailsChirho.match(/(sex|gender|sexo|género)\s*:\s*(male|female|non-binary|hombre|mujer|no binario)/i) || !parsedPersonaDataChirho.personaDetailsChirho.match(/(age|edad)\s*:\s*.*?\d/i)) {
        console.warn("Generated personaDetailsChirho might be missing explicit sex or age information. Full details:", parsedPersonaDataChirho.personaDetailsChirho);
      }
    } catch (e: any) {
      console.error("Failed to parse persona data JSON:", personaDataResultChirho.text, e);
      parsedPersonaDataChirho = {
        personaNameChirho: "Jordan (Fallback) Chirho",
        personaDetailsChirho: "Jordan Chirho is a thoughtful individual, female, in their early 30s, encountering some of life's common questions. They are open to discussion but require sincere engagement. This is a fallback persona due to a generation error: " + e.message,
        meetingContextChirho: "You've encountered Jordan Chirho by chance today. Perhaps a friendly greeting is in order?",
        encounterTitleChirho: "A Chance Encounter",
        personaNameKnownToUserChirho: false,
      };
    }

    const imagePromptChirho = `Generate a 512x512 photorealistic portrait style image of a person named ${parsedPersonaDataChirho.personaNameChirho}.
Their general disposition, sex, and age can be inferred from: ${parsedPersonaDataChirho.personaDetailsChirho.substring(0, 350)}...
They are encountered in this specific context: "${parsedPersonaDataChirho.meetingContextChirho}".
The image should focus on ${parsedPersonaDataChirho.personaNameChirho} and subtly reflect the mood or setting of the meeting context and their ${parsedPersonaDataChirho.encounterTitleChirho}. Aim for a friendly, neutral, or context-appropriate expression suitable for a chat simulation. Ensure varied appearances. Photorealistic style.`;

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
        // Using a simple placeholder for safety if image generation fails
        const placeholderDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; 
        return {
          ...parsedPersonaDataChirho,
          personaImageChirho: placeholderDataUri, 
        };
    }

    return {
      ...parsedPersonaDataChirho,
      personaImageChirho: imageUrlChirho,
    };
  }
);
