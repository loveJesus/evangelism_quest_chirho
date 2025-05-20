// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google'; // Ensure Inter is imported
import './globals.css';
import { AuthProviderChirho } from '@/contexts/auth-context-chirho';
import { CustomizationProviderChirho } from '@/contexts/customization-context-chirho';
import { ToasterChirho } from '@/components/ui/toaster';
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho'; // For metadata
import { defaultLocale } from '@/middleware'; // For metadata

const inter = Inter({ // Initialize Inter
  subsets: ['latin'],
  variable: '--font-sans', // Define a CSS variable for Inter
});

// Updated metadata function to use a default title and description if dictionary fails or for simplicity
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang || defaultLocale;
  let appName = "Faith Forward ☧"; // Default app name

  try {
    const dictionary = await getDictionaryChirho(lang);
    appName = dictionary.appLayout?.appName || appName; // Use dictionary appName if available
  } catch (error) {
    console.warn(`Could not load dictionary for lang '${lang}' in root metadata:`, error);
  }

  return {
    title: `${appName} (${lang.toUpperCase()})`,
    description: 'Empowering your evangelism journey.',
  };
}


export const viewport: Viewport = {
  themeColor: [ 
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { lang: string }; 
}) {
  const lang = params?.lang || defaultLocale;

  return (
    <html lang={lang} suppressHydrationWarning> 
      <body className={`${inter.variable} antialiased bg-background text-foreground`}> {/* Use Inter variable and ensure base styles */}
        {/* AuthProviderChirho is now in src/app/[lang]/layout.tsx */}
        {children}
        {/* Toaster can be here if not dependent on lang-specific context provided by AuthProvider/CustomizationProvider */}
        {/* Or move Toaster to src/app/[lang]/layout.tsx if it needs those contexts */}
      </body>
    </html>
  );
}
