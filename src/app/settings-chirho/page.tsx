// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
// This file is a server component wrapper
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import SettingsClientPageChirho from './client-page-chirho';

interface SettingsPagePropsChirho {
  params: { lang: string };
}

export default async function SettingsPage({ params: { lang } }: SettingsPagePropsChirho) {
  const dictionary = await getDictionaryChirho(lang);
  return <SettingsClientPageChirho dictionary={dictionary.settingsPage} lang={lang} />;
}
