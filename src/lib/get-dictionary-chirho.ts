// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import 'server-only'; // Ensures this module only runs on the server

const dictionariesChirho = {
  en: () => import('@/dictionaries/en-chirho').then((module) => module.default),
  es: () => import('@/dictionaries/es-chirho').then((module) => module.default),
};

export const getDictionaryChirho = async (locale: string) => {
  if (locale === 'es') {
    return dictionariesChirho.es();
  }
  return dictionariesChirho.en(); // Default to English
};

export type DictionaryChirho = Awaited<ReturnType<typeof getDictionaryChirho>>;
