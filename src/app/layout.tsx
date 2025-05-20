// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayoutChirho } from '@/components/layout/app-layout-chirho';
import { ToasterChirho } from '@/components/ui/toaster'; 
import { CustomizationProviderChirho } from '@/contexts/customization-context-chirho';
import { AuthProviderChirho } from '@/contexts/auth-context-chirho'; // Import AuthProviderChirho

const geistSansChirho = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMonoChirho = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = { // Renamed metadataChirho to metadata for Next.js convention
  title: 'Evangelism Quest ☧',
  description: 'Empowering your evangelism journey.',
};

export default function RootLayout({ // Renamed RootLayoutChirho to RootLayout for Next.js convention
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSansChirho.variable} ${geistMonoChirho.variable} antialiased`}>
        <AuthProviderChirho> {/* AuthProviderChirho wraps CustomizationProviderChirho */}
          <CustomizationProviderChirho>
            <AppLayoutChirho>{children}</AppLayoutChirho>
            <ToasterChirho />
          </CustomizationProviderChirho>
        </AuthProviderChirho>
      </body>
    </html>
  );
}
