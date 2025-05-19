// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { config } from 'dotenv';
config();

// These imports load the flows for Genkit to discover them.
// The actual function names inside these modules have been suffixed with Chirho.
import '@/ai/flows/generate-ai-persona-chirho.ts'; // Updated import
import '@/ai/flows/ai-persona-convincing-chirho.ts'; // Updated import
import '@/ai/flows/contextual-guidance-chirho.ts'; // Updated import
import '@/ai/flows/update-persona-visuals-chirho.ts'; // Updated import
import '@/ai/flows/suggest-evangelistic-response-chirho.ts'; // Updated import
