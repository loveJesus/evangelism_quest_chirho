
'use server';
/**
 * @fileOverview Provides suggested evangelistic responses in the style of Ray Comfort.
 *
 * - suggestEvangelisticResponse - A function that generates a suggested response.
 * - SuggestEvangelisticResponseInput - The input type for the function.
 * - SuggestEvangelisticResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEvangelisticResponseInputSchema = z.object({
  personaLastResponse: z.string().describe("The last statement or question from the AI persona you are talking to."),
  personaName: z.string().describe("The name of the AI persona."),
  conversationHistory: z.string().optional().describe("A brief summary of the conversation so far, if available. This helps provide context for the suggestion."),
});
export type SuggestEvangelisticResponseInput = z.infer<typeof SuggestEvangelisticResponseInputSchema>;

const SuggestEvangelisticResponseOutputSchema = z.object({
  suggestedResponse: z.string().describe("The suggested evangelistic response for the user."),
});
export type SuggestEvangelisticResponseOutput = z.infer<typeof SuggestEvangelisticResponseOutputSchema>;

export async function suggestEvangelisticResponse(input: SuggestEvangelisticResponseInput): Promise<SuggestEvangelisticResponseOutput> {
  return suggestEvangelisticResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEvangelisticResponsePrompt',
  input: {schema: SuggestEvangelisticResponseInputSchema},
  output: {schema: SuggestEvangelisticResponseOutputSchema},
  prompt: `You are an expert evangelism coach, modeling your response style after Ray Comfort of Living Waters.
Your goal is to help the user effectively share their faith with an AI persona named {{{personaName}}}.

The persona, {{{personaName}}}, just said: "{{{personaLastResponse}}}"

{{#if conversationHistory}}
Here's a brief summary of the conversation so far:
{{{conversationHistory}}}
{{/if}}

Craft a "suggestedResponse" for the user to say next to {{{personaName}}}.
Your suggestion should:
1.  Be conversational and natural, yet direct and purposeful.
2.  Reflect a Bible-believing, evangelical Christian perspective. This includes belief in the authority of Scripture and the necessity of salvation through Jesus Christ.
3.  Acknowledge that true faith in Jesus Christ will result in a changed life (practicing righteous living).
4.  Incorporate principles of a young earth creationist viewpoint where relevant and natural (e.g., when discussing origins, purpose, or God's design), but don't force it if the immediate context doesn't lend itself to it.
5.  Often use questions to gently guide {{{personaName}}} to consider their own conscience, the moral law (like the Ten Commandments), and their standing before a holy God.
6.  Clearly present the Gospel: God's love, humanity's sinfulness, Christ's substitutionary death and resurrection, and the call to repentance and faith.
7.  Be sensitive: "Law to the proud, grace to the humble." If {{{personaName}}} seems resistant or self-righteous, gently use the Law to show their need for a Savior. If they seem open or broken, extend grace and hope.
8.  Be concise and focused on one or two key points.

Example of a possible interaction and your suggested response:
Persona Question: "Why does a good God allow so much suffering?"
Your Suggested Response for User: "That's a really deep question, {{{personaName}}}. Before we explore that, have you ever considered what the Bible says about why we experience good things in life, despite our own imperfections? For example, have you ever told a lie, stolen anything (even small), or used God's name in vain?" (This then leads to discussion of the Law and conscience).

Another Persona Statement: "I think I'm a good person, I try my best."
Your Suggested Response for User: "I appreciate your sincerity, {{{personaName}}}. Most of us like to think of ourselves as good. Could I ask, have you always kept all of the Ten Commandments? For instance, have you ever looked with lust, which Jesus said is like adultery in the heart, or been angry without cause, which He likened to murder?"

Provide ONLY the "suggestedResponse" text.
Format your entire response as a single, valid JSON object with the key "suggestedResponse".
`,
});

const suggestEvangelisticResponseFlow = ai.defineFlow(
  {
    name: 'suggestEvangelisticResponseFlow',
    inputSchema: SuggestEvangelisticResponseInputSchema,
    outputSchema: SuggestEvangelisticResponseOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      console.error("Suggest Evangelistic Response Flow received undefined output from prompt for input:", input);
      return {
        suggestedResponse: "I'm having a bit of trouble thinking of a suggestion right now. Perhaps try to respond based on what they last said, and ask a gentle, thought-provoking question?",
      };
    }
    return output;
  }
);
