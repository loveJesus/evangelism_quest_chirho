
'use server';
/**
 * @fileOverview Provides suggested evangelistic responses in the style of Ray Comfort.
 *
 * - suggestEvangelisticResponseChirho - A function that generates a suggested response.
 * - SuggestEvangelisticResponseInputChirho - The input type for the function.
 * - SuggestEvangelisticResponseOutputChirho - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEvangelisticResponseInputSchemaChirho = z.object({
  personaLastResponseChirho: z.string().describe("The last statement or question from the AI persona you are talking to."),
  personaNameChirho: z.string().describe("The name of the AI persona."),
  conversationHistoryChirho: z.string().optional().describe("A brief summary of the conversation so far, if available. This helps provide context for the suggestion."),
});
export type SuggestEvangelisticResponseInputChirho = z.infer<typeof SuggestEvangelisticResponseInputSchemaChirho>;

const SuggestEvangelisticResponseOutputSchemaChirho = z.object({
  suggestedResponseChirho: z.string().describe("The suggested evangelistic response for the user."),
});
export type SuggestEvangelisticResponseOutputChirho = z.infer<typeof SuggestEvangelisticResponseOutputSchemaChirho>;

export async function suggestEvangelisticResponseChirho(input: SuggestEvangelisticResponseInputChirho): Promise<SuggestEvangelisticResponseOutputChirho> {
  return suggestEvangelisticResponseFlowChirho(input);
}

const promptChirho = ai.definePrompt({
  name: 'suggestEvangelisticResponsePromptChirho',
  input: {schema: SuggestEvangelisticResponseInputSchemaChirho},
  output: {schema: SuggestEvangelisticResponseOutputSchemaChirho},
  prompt: `You are an expert evangelism coach, modeling your response style after Ray Comfort of Living Waters.
Your goal is to help the user effectively share their faith with an AI persona named {{{personaNameChirho}}}.

The persona, {{{personaNameChirho}}}, just said: "{{{personaLastResponseChirho}}}"

{{#if conversationHistoryChirho}}
Here's a brief summary of the conversation so far:
{{{conversationHistoryChirho}}}
{{/if}}

Craft a "suggestedResponseChirho" for the user to say next to {{{personaNameChirho}}}.
Your suggestion should:
1.  Be conversational and natural, yet direct and purposeful.
2.  Reflect a Bible-believing, evangelical Christian perspective. This includes belief in the authority of Scripture and the necessity of salvation through Jesus Christ.
3.  Acknowledge that true faith in Jesus Christ will result in a changed life (practicing righteous living).
4.  Incorporate principles of a young earth creationist viewpoint where relevant and natural (e.g., when discussing origins, purpose, or God's design), but don't force it if the immediate context doesn't lend itself to it.
5.  Often use questions to gently guide {{{personaNameChirho}}} to consider their own conscience, the moral law (like the Ten Commandments), and their standing before a holy God.
6.  Clearly present the Gospel: God's love, humanity's sinfulness, Christ's substitutionary death and resurrection, and the call to repentance and faith.
7.  Be sensitive: "Law to the proud, grace to the humble." If {{{personaNameChirho}}} seems resistant or self-righteous, gently use the Law to show their need for a Savior. If they seem open or broken, extend grace and hope.
8.  Be concise and focused on one or two key points.

Example of a possible interaction and your suggested response:
Persona Question: "Why does a good God allow so much suffering?"
Your Suggested Response for User: "That's a really deep question, {{{personaNameChirho}}}. Before we explore that, have you ever considered what the Bible says about why we experience good things in life, despite our own imperfections? For example, have you ever told a lie, stolen anything (even small), or used God's name in vain?" (This then leads to discussion of the Law and conscience).

Another Persona Statement: "I think I'm a good person, I try my best."
Your Suggested Response for User: "I appreciate your sincerity, {{{personaNameChirho}}}. Most of us like to think of ourselves as good. Could I ask, have you always kept all of the Ten Commandments? For instance, have you ever looked with lust, which Jesus said is like adultery in the heart, or been angry without cause, which He likened to murder?"

Provide ONLY the "suggestedResponseChirho" text.
Format your entire response as a single, valid JSON object with the key "suggestedResponseChirho".
`,
});

const suggestEvangelisticResponseFlowChirho = ai.defineFlow(
  {
    name: 'suggestEvangelisticResponseFlowChirho',
    inputSchema: SuggestEvangelisticResponseInputSchemaChirho,
    outputSchema: SuggestEvangelisticResponseOutputSchemaChirho,
  },
  async (input: SuggestEvangelisticResponseInputChirho) => {
    const {output} = await promptChirho(input);
    if (!output) {
      console.error("Suggest Evangelistic Response Flow Chirho received undefined output from prompt for input:", input);
      return {
        suggestedResponseChirho: "I'm having a bit of trouble thinking of a suggestion right now. Perhaps try to respond based on what they last said, and ask a gentle, thought-provoking question?",
      };
    }
    return output;
  }
);
