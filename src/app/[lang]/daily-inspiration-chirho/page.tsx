// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import DailyInspirationClientPageChirho from './client-page-chirho.tsx'; // Added .tsx extension

interface DailyInspirationPagePropsChirho {
  params: { lang: string };
}

export default async function DailyInspirationPageChirho({ params: { lang } }: DailyInspirationPagePropsChirho) {
  const dictionary: DictionaryChirho = await getDictionaryChirho(lang);
  return <DailyInspirationClientPageChirho dictionary={dictionary} lang={lang} />;
}
