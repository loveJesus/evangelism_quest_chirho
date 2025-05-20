// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
// This file is a server component wrapper
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import LoginClientPageChirho from './client-page-chirho';

interface LoginPagePropsChirho {
  params: { lang: string };
}

export default async function LoginPage({ params: { lang } }: LoginPagePropsChirho) {
  const dictionary = await getDictionaryChirho(lang);
  return <LoginClientPageChirho dictionary={dictionary.loginPage} lang={lang} />;
}
