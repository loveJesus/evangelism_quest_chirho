
import { config } from 'dotenv';
config();

// These imports load the flows for Genkit to discover them.
// The actual function names inside these modules have been suffixed with Chirho.
import '@/ai/flows/generate-ai-persona.ts';
import '@/ai/flows/ai-persona-convincing.ts';
import '@/ai/flows/contextual-guidance.ts';
import '@/ai/flows/update-persona-visuals.ts';
import '@/ai/flows/suggest-evangelistic-response.ts';
