// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayoutChirho } from '@/components/layout/app-layout-chirho'; // Updated import
import { ToasterChirho } from '@/components/ui/toaster'; 
import { CustomizationProviderChirho } from '@/contexts/customization-context-chirho'; // Updated import

const geistSansChirho = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMonoChirho = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadataChirho: Metadata = {
  title: 'Faith Forward Chirho',
  description: 'Empowering your evangelism journey.',
};

export default function RootLayoutChirho({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSansChirho.variable} ${geistMonoChirho.variable} antialiased`}>
        <CustomizationProviderChirho>
          <AppLayoutChirho>{children}</AppLayoutChirho>
          <ToasterChirho />
        </CustomizationProviderChirho>
      </body>
    </html>
  );
}
