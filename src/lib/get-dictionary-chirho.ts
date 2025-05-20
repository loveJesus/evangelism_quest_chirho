// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import 'server-only'; // Ensures this module only runs on the server
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho'; // Import type from new file

const dictionariesChirho = {
  en: () => import('@/dictionaries/en-chirho').then((module) => module.default),
  es: () => import('@/dictionaries/es-chirho').then((module) => module.default),
};

export const getDictionaryChirho = async (locale: string): Promise<DictionaryChirho> => {
  if (locale === 'es') {
    return dictionariesChirho.es();
  }
  // Default to English if locale is not 'es' or if the specific locale dictionary is not found
  return dictionariesChirho.en(); 
};
