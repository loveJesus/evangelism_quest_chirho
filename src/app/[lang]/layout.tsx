// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata } from 'next';
import { AppLayoutChirho } from '@/components/layout/app-layout-chirho';
import { ToasterChirho } from '@/components/ui/toaster';
import { CustomizationProviderChirho } from '@/contexts/customization-context-chirho';
import { AuthProviderChirho } from '@/contexts/auth-context-chirho';
import { getDictionaryChirho, DictionaryChirho } from '@/lib/get-dictionary-chirho';
import { defaultLocale } from '@/middleware';

// This function can be exported on its own or used in generateMetadata
// This metadata will be for the [lang] segment, potentially overriding or merging with root.
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang || defaultLocale;
  let appName = "Faith Forward ☧"; // Default
  let description = "Empowering your evangelism journey."; // Default

  try {
    const dictionary = await getDictionaryChirho(lang);
    appName = dictionary.appLayout?.appName || appName;
    // You could add a lang-specific description from the dictionary if needed
    // description = dictionary.appLayout?.description || description; 
  } catch (error) {
    console.warn(`Could not load dictionary for lang '${lang}' in [lang] layout metadata:`, error);
  }
  
  return {
    title: `${appName} (${lang.toUpperCase()})`, // Example: Faith Forward ☧ (EN)
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
  const dictionary = await getDictionaryChirho(params.lang);

  return (
    // The lang attribute is set in the root src/app/layout.tsx
    // The html and body tags are also in the root layout.
    // This component's output will be placed inside the root body.
    <AuthProviderChirho lang={params.lang}>
      <CustomizationProviderChirho>
        <AppLayoutChirho lang={params.lang} dictionary={dictionary.siteNav} appName={dictionary.appLayout.appName}>
          {children}
        </AppLayoutChirho>
        <ToasterChirho />
      </CustomizationProviderChirho>
    </AuthProviderChirho>
  );
}
