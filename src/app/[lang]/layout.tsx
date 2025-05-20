// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata } from 'next';
import { AppLayoutChirho } from '@/components/layout/app-layout-chirho';
import { ToasterChirho } from '@/components/ui/toaster';
import { CustomizationProviderChirho } from '@/contexts/customization-context-chirho';
import { AuthProviderChirho } from '@/contexts/auth-context-chirho';
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho'; // Updated import
import { defaultLocale } from '@/middleware';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang || defaultLocale;
  let appName = "Faith Forward ☧"; 
  let description = "Empowering your evangelism journey."; 

  try {
    const dictionary: DictionaryChirho = await getDictionaryChirho(lang); // Add type for dictionary
    appName = dictionary.appLayout?.appName || appName;
  } catch (error) {
    console.warn(`Could not load dictionary for lang '${lang}' in [lang] layout metadata:`, error);
  }
  
  return {
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description: description,
  };
}


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const dictionary: DictionaryChirho = await getDictionaryChirho(params.lang); // Add type for dictionary

  return (
    <AuthProviderChirho lang={params.lang} dictionary={dictionary.authContext}>
      <CustomizationProviderChirho>
        <AppLayoutChirho lang={params.lang} dictionary={dictionary.siteNav} appName={dictionary.appLayout.appName}>
          {children}
        </AppLayoutChirho>
        <ToasterChirho />
      </CustomizationProviderChirho>
    </AuthProviderChirho>
  );
}
