// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import LandingPageChirho from '../landing-page-chirho'; // Adjusted path
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';

export default async function HomePage({ params: { lang } }: { params: { lang: string } }) {
  const dictionary = await getDictionaryChirho(lang);
  return <LandingPageChirho lang={lang} dictionary={dictionary.landingPage} />;
}
