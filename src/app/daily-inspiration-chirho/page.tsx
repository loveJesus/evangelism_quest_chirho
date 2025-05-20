// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
// This file is a server component wrapper
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import DailyInspirationClientPageChirho from './client-page-chirho';

interface DailyInspirationPagePropsChirho {
  params: { lang: string };
}

export default async function DailyInspirationPage({ params: { lang } }: DailyInspirationPagePropsChirho) {
  const dictionary = await getDictionaryChirho(lang);
  return <DailyInspirationClientPageChirho dictionary={dictionary.dailyInspirationPage} lang={lang} />;
}
