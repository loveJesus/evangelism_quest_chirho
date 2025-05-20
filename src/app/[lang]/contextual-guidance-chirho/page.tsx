// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import ContextualGuidanceClientPageChirho from './client-page-chirho';

interface ContextualGuidancePagePropsChirho {
  params: { lang: string };
}

export default async function ContextualGuidancePageChirho({ params: { lang } }: ContextualGuidancePagePropsChirho) {
  const dictionary: DictionaryChirho = await getDictionaryChirho(lang);
  return <ContextualGuidanceClientPageChirho dictionary={dictionary} lang={lang} />;
}
