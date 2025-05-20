// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
'use server';
/**
 * @fileOverview Provides suggested evangelistic responses in the style of Ray Comfort.
 *
 * - suggestEvangelisticResponseChirho - A function that generates a suggested response.
 * - SuggestEvangelisticResponseInputChirho - The input type for the function.
 * - SuggestEvangelisticResponseOutputChirho - The return type for the function.
 */

import {ai} from '@/ai-chirho/genkit-chirho'; 
import {z} from 'genkit';

const SuggestEvangelisticResponseInputSchemaChirho = z.object({
  personaLastResponseChirho: z.string().describe("The last statement or question from the AI persona you are talking to."),
  personaActualNameForContextChirho: z.string().describe("The actual name of the AI persona. The AI coach uses this name internally for contextual understanding of who the user is interacting with."),
  personaDisplayNameForUserChirho: z.string().describe("The name or generic term (e.g., 'the person', 'them') that the user currently knows the AI persona by. This is what should be used in the suggested response if addressing the persona directly."),
  conversationHistoryChirho: z.string().optional().describe("A brief summary of the conversation so far, if available. This helps provide context for the suggestion."),
  languageChirho: z.string().optional().default('en').describe('The language for the suggested response (e.g., "en", "es").'),
});
export type SuggestEvangelisticResponseInputChirho = z.infer<typeof SuggestEvangelisticResponseInputSchemaChirho>;

const SuggestEvangelisticResponseOutputSchemaChirho = z.object({
  suggestedResponseChirho: z.string().describe("The suggested evangelistic response for the user."),
});
export type SuggestEvangelisticResponseOutputChirho = z.infer<typeof SuggestEvangelisticResponseOutputSchemaChirho>;

export async function suggestEvangelisticResponseChirho(input: SuggestEvangelisticResponseInputChirho): Promise<SuggestEvangelisticResponseOutputSchemaChirho> {
  return suggestEvangelisticResponseFlowChirho(input);
}

const promptChirho = ai.definePrompt({
  name: 'suggestEvangelisticResponsePromptChirho',
  input: {schema: SuggestEvangelisticResponseInputSchemaChirho},
  output: {schema: SuggestEvangelisticResponseOutputSchemaChirho},
  prompt: `You are an expert evangelism coach, modeling your response style after Ray Comfort of Living Waters.
CRITICAL LANGUAGE INSTRUCTION: Your "suggestedResponseChirho" MUST be strictly in the language specified by the language code: {{{languageChirho}}}. For example, if {{{languageChirho}}} is 'en', all text must be in English. If {{{languageChirho}}} is 'es', all text must be in Spanish.

Your goal is to help the user effectively share their faith. The user is interacting with an AI persona.

For your internal context, the AI persona's actual name is {{{personaActualNameForContextChirho}}}.
However, the user currently knows this persona as: "{{{personaDisplayNameForUserChirho}}}".
It is CRITICAL that your suggested response for the user ONLY refers to the persona as "{{{personaDisplayNameForUserChirho}}}". DO NOT use the actual name "{{{personaActualNameForContextChirho}}}" in the suggested response unless "{{{personaDisplayNameForUserChirho}}}" *is* that actual name. If "{{{personaDisplayNameForUserChirho}}}" is a generic term like "the person" or "them", use that generic term.

The persona (referred to as "{{{personaDisplayNameForUserChirho}}}") just said: "{{{personaLastResponseChirho}}}"

{{#if conversationHistoryChirho}}
Here's a brief summary of the conversation so far (this summary is also in {{{languageChirho}}}):
{{{conversationHistoryChirho}}}
{{/if}}

Craft a "suggestedResponseChirho" for the user to say next to {{{personaDisplayNameForUserChirho}}}, strictly in the language: {{{languageChirho}}}.
Your suggestion should:
1.  Be conversational and natural, yet direct and purposeful.
2.  Reflect a Bible-believing, evangelical Christian perspective. This includes belief in the authority of Scripture and the necessity of salvation through Jesus Christ.
3.  Acknowledge that true faith in Jesus Christ will result in a changed life (practicing righteous living).
4.  Incorporate principles of a young earth creationist viewpoint where relevant and natural (e.g., when discussing origins, purpose, or God's design), but don't force it if the immediate context doesn't lend itself to it.
5.  Often use questions to gently guide {{{personaDisplayNameForUserChirho}}} to consider their own conscience, the moral law (like the Ten Commandments), and their standing before a holy God.
6.  Clearly present the Gospel: God's love, humanity's sinfulness, Christ's substitutionary death and resurrection, and the call to repentance and faith.
7.  Be sensitive: "Law to the proud, grace to the humble." If {{{personaDisplayNameForUserChirho}}} seems resistant or self-righteous, gently use the Law to show their need for a Savior. If they seem open or broken, extend grace and hope.
8.  Be concise and focused on one or two key points.

Example of a possible interaction (if user knows persona as "Eliza", language 'en'):
Persona Question: "Why does a good God allow so much suffering?"
Your Suggested Response for User: "That's a really deep question, Eliza. Before we explore that, have you ever considered what the Bible says about why we experience good things in life, despite our own imperfections? For example, have you ever told a lie, stolen anything (even small), or used God's name in vain?"

Example of a possible interaction (if user knows persona as "la persona", language 'es'):
Declaración de la Persona: "Creo que soy una buena persona, hago lo mejor que puedo."
Tu Respuesta Sugerida para el Usuario: "Aprecio tu sinceridad. A la mayoría nos gusta pensar que somos buenos. ¿Podría preguntarte si siempre has guardado todos los Diez Mandamientos? Por ejemplo, ¿alguna vez has mirado con lujuria, que Jesús dijo que es como adulterio en el corazón, o te has enojado sin causa, lo cual Él comparó con el asesinato?"

Provide ONLY the "suggestedResponseChirho" text.
Format your entire response as a single, valid JSON object with the key "suggestedResponseChirho".
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const suggestEvangelisticResponseFlowChirho = ai.defineFlow(
  {
    name: 'suggestEvangelisticResponseFlowChirho',
    inputSchema: SuggestEvangelisticResponseInputSchemaChirho,
    outputSchema: SuggestEvangelisticResponseOutputSchemaChirho,
  },
  async (input: SuggestEvangelisticResponseInputChirho) => {
    console.log("[Genkit Flow] suggestEvangelisticResponseFlowChirho received input:", input);
    const {output} = await promptChirho(input);
    if (!output) {
      console.error("Suggest Evangelistic Response Flow Chirho received undefined output from prompt for input:", input);
      const fallbackSuggestion = input.languageChirho === 'es'
        ? "Estoy teniendo un poco de dificultad para pensar en una sugerencia ahora mismo. Quizás intenta responder basándote en lo último que dijeron, y haz una pregunta amable que invite a la reflexión."
        : "I'm having a bit of trouble thinking of a suggestion right now. Perhaps try to respond based on what they last said, and ask a gentle, thought-provoking question?";
      return {
        suggestedResponseChirho: fallbackSuggestion,
      };
    }
    return output;
  }
);
