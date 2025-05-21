// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import AIPersonasClientPageChirho from './client-page-chirho.tsx'; // Added .tsx extension

interface AIPersonasPagePropsChirho {
  params: { lang: string };
}

export default async function AIPersonasPageChirho({ params: { lang } }: AIPersonasPagePropsChirho) {
  const dictionary: DictionaryChirho = await getDictionaryChirho(lang);
  return <AIPersonasClientPageChirho dictionary={dictionary} lang={lang} />;
}
