// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata } from 'next';
import { AppLayoutChirho } from '@/components/layout/app-layout-chirho';
import { ToasterChirho } from '@/components/ui/toaster';
import { CustomizationProviderChirho } from '@/contexts/customization-context-chirho';
import { AuthProviderChirho } from '@/contexts/auth-context-chirho';
import { getDictionaryChirho, DictionaryChirho } from '@/lib/get-dictionary-chirho';
import { defaultLocale } from '@/middleware'; // To provide a default lang for metadata

// This function can be exported on its own or used in generateMetadata
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang || defaultLocale;
  // For simplicity, using a static title. You could fetch translations here if needed.
  return {
    title: `Faith Forward ☧ (${lang.toUpperCase()})`,
    description: 'Empowering your evangelism journey.',
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
    // The lang attribute is set here based on the URL parameter
    // The html and body tags are in the root src/app/layout.tsx
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
