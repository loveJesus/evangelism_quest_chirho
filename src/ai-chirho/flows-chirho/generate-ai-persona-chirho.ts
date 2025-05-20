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
  languageChirho: z.string().optional().default('en').describe('The language code for the persona generation (e.g., "en" for English, "es" for Spanish).'),
});
export type GenerateAiPersonaInputChirho = z.infer<typeof GenerateAiPersonaInputSchemaChirho>;

const GenerateAiPersonaOutputSchemaChirho = z.object({
  personaNameChirho: z.string().describe('The first name of the AI persona. Should be diverse and not repetitive. MUST be in the language specified by the input languageChirho.'),
  personaDetailsChirho: z.string().describe('The detailed backstory of the AI persona (intended for AI context, not direct user display). This MUST include the persona\'s sex and approximate age/age range. MUST be in the language specified by the input languageChirho.'),
  meetingContextChirho: z.string().describe('A brief scenario describing how the user meets the persona, consistent with the persona image and backstory. This context determines if the name is immediately known, leave personaNameChirho out if not known. MUST be in the language specified by the input languageChirho.'),
  encounterTitleChirho: z.string().describe('A short, engaging title for the encounter (max 5-7 words), suitable for display if the persona name is not immediately known. e.g., "The Distressed Artist", "Park Bench Contemplation", "Barista\'s Questions". This is different from the full meetingContextChirho. MUST be in the language specified by the input languageChirho.'),
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
    const languageNameChirho = input.languageChirho === 'es' ? 'Español' : 'English';

    const personaDataPromptChirho = `You are an AI that generates diverse and unique characters for evangelism simulations.
CRITICAL LANGUAGE INSTRUCTION: ALL text fields in your JSON output (personaNameChirho, personaDetailsChirho, meetingContextChirho, encounterTitleChirho) MUST be strictly in the language: ${languageNameChirho}. No other language is acceptable for these text fields.

Based on the following input hint: "${input.personaDescriptionChirho}".

Your primary goal is to create a NEW and UNIQUE character each time.
1.  **Persona Name ("personaNameChirho")**:
    *   Generate a unique first name appropriate for the specified language (${languageNameChirho}).
    *   Ensure a WIDE VARIETY of names: common, uncommon, diverse cultural backgrounds relevant to the language ${languageNameChirho}.
    *   **CRITICAL: DO NOT REPEAT names like Caleb, Kai, Zephyr, Zephyrine, or any other names you might have used in recent generations. Always try for something fresh unless specifically hinted.**
2.  **Persona Details ("personaDetailsChirho")**:
    *   Craft a detailed backstory (a few paragraphs) strictly in the language: ${languageNameChirho}. This backstory is for the AI to understand its role and should allow for discovery through conversation.
    *   It MUST explicitly state the persona's **sex** (e.g., "a man" or "a woman" or equivalent in ${languageNameChirho}) and an approximate **age or age range** (e.g., "in her early 20s", "a man in his mid-40s", "around 60 years old" or equivalent in ${languageNameChirho}).
    *   Include personality traits, beliefs (or lack thereof), current emotional state, and potential points of resistance or curiosity regarding faith, all in ${languageNameChirho}.
    *   Ensure varied professions, cultural backgrounds, and life situations appropriate for the language context of ${languageNameChirho}.
3.  **Meeting Context ("meetingContextChirho")**:
    *   Create a brief, imaginative meeting context (1-4 engaging sentences) strictly in ${languageNameChirho}, describing how the user might encounter this person. Please keep it pure, for example, don't call something like a pizza delivery man dropping his pizza comical.
    *   This context should provide a natural starting point for a conversation and be consistent with a potential visual for the character.
    *   Make this context varied; not everyone is a barista or librarian. Think about everyday situations, unique encounters, or community settings relevant to ${languageNameChirho}.
    *   If the person's name is known, explain why it is known (in ${languageNameChirho}). If it is an encounter with a stranger, do not mention the individual's name.
4.  **Encounter Title ("encounterTitleChirho")**:
    *   Based on the persona and meeting context, generate a short, engaging title for this specific encounter (max 5-7 words) strictly in ${languageNameChirho}. 
    *   This title will be displayed to the user if the persona's name isn't immediately known.
    *   Examples (The language of these example titles should be overridden by ${languageNameChirho} in your actual output): "The Lost Tourist", "Anxious at the Airport", "Cafe Philosopher", "Skeptic in the Park", "Grieving Widow".
    *   Make it descriptive of the situation or the persona's initial presentation.
5.  **Name Known to User ("personaNameKnownToUserChirho")**:
    *   Based on the "meetingContextChirho", determine if the persona's name would be immediately known to the user.
    *   If the context implies the name is known (e.g., coworker, introduced by a friend, wearing a nametag like "Barista named Leo"), set to \`true\`.
    *   If it's a chance encounter with a stranger (e.g., "a person on a park bench", "someone who dropped their keys"), set to \`false\`.

Return ONLY a JSON object with five keys: "personaNameChirho", "personaDetailsChirho", "meetingContextChirho", "encounterTitleChirho", and "personaNameKnownToUserChirho". All string values in the JSON MUST be in the language: ${languageNameChirho}.

Example (The language of this example's text fields MUST be overridden by ${languageNameChirho} in your actual output. Ensure to vary ALL details, especially names, from this example):
{
  "personaNameChirho": "Soren", 
  "personaDetailsChirho": "Soren is a man in his early 50s...",
  "meetingContextChirho": "At a local farmers' market...",
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
       // Looser check for sex/age in details as AI might phrase it differently
       if (!parsedPersonaDataChirho.personaDetailsChirho.match(/(sex|gender|sexo|género|man|woman|male|female|hombre|mujer|masculino|femenino)/i) || !parsedPersonaDataChirho.personaDetailsChirho.match(/(age|edad|\d+\s*years old|\d+\s*años)/i)) {
        console.warn("Generated personaDetailsChirho might be missing explicit sex or age information, or it's phrased unexpectedly. Details:", parsedPersonaDataChirho.personaDetailsChirho.substring(0,100) + "...");
      }
    } catch (e: any) {
      console.error("Failed to parse persona data JSON:", personaDataResultChirho.text, e);
      const fallbackName = input.languageChirho === 'es' ? "Jordan (Alternativo) Chirho" : "Jordan (Fallback) Chirho";
      const fallbackDetails = input.languageChirho === 'es' 
        ? "Jordan Chirho es una persona reflexiva, de sexo femenino, de unos 30 años, que se enfrenta a algunas de las preguntas comunes de la vida. Está abierta a la discusión pero requiere un compromiso sincero. Esta es una persona alternativa debido a un error de generación: " + e.message
        : "Jordan Chirho is a thoughtful individual, female, in their early 30s, encountering some of life's common questions. They are open to discussion but require sincere engagement. This is a fallback persona due to a generation error: " + e.message;
      const fallbackContext = input.languageChirho === 'es'
        ? "Te has encontrado con Jordan Chirho por casualidad hoy. ¿Quizás un saludo amistoso sería apropiado?"
        : "You've encountered Jordan Chirho by chance today. Perhaps a friendly greeting is in order?";
      const fallbackTitle = input.languageChirho === 'es' ? "Un Encuentro Casual" : "A Chance Encounter";

      parsedPersonaDataChirho = {
        personaNameChirho: fallbackName,
        personaDetailsChirho: fallbackDetails,
        meetingContextChirho: fallbackContext,
        encounterTitleChirho: fallbackTitle,
        personaNameKnownToUserChirho: false,
      };
    }

    const imagePromptChirho = `Generate a 512x512 photorealistic portrait style image of a person named ${parsedPersonaDataChirho.personaNameChirho}.
Their general disposition, sex, and age can be inferred from: ${parsedPersonaDataChirho.personaDetailsChirho.substring(0, 350)}...
They are encountered in this specific context: "${parsedPersonaDataChirho.meetingContextChirho}".
The image should focus on ${parsedPersonaDataChirho.personaNameChirho} and subtly reflect the mood or setting of the meeting context and their ${parsedPersonaDataChirho.encounterTitleChirho}. Aim for a friendly, neutral, or context-appropriate expression suitable for a chat simulation.
The image should be photorealistic, modest, appropriate for all audiences, and strictly avoid any revealing attire, cleavage, or suggestive elements. Focus on a respectful and friendly depiction. Ensure varied appearances. Photorealistic style.`;

    const imageResultChirho = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
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
        // Fallback data URI for a 1x1 transparent PNG
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

