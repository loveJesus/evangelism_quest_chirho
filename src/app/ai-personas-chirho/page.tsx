// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
// This file is a server component wrapper that fetches the dictionary and passes it to the client component.
// The actual page UI and logic are in ./client-page-chirho.tsx
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import AIPersonasClientPageChirho from './client-page-chirho'; // Assuming client component is in the same folder

interface AIPersonasPagePropsChirho {
  params: { lang: string };
}

export default async function AIPersonasPage({ params: { lang } }: AIPersonasPagePropsChirho) {
  const dictionary = await getDictionaryChirho(lang);
  return <AIPersonasClientPageChirho dictionary={dictionary.aiPersonasPage} lang={lang} />;
}
