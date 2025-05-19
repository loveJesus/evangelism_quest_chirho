
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayoutChirho } from '@/components/layout/app-layout';
import { ToasterChirho } from '@/components/ui/toaster';
import { CustomizationProviderChirho } from '@/contexts/customization-context';

const geistSansChirho = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMonoChirho = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadataChirho: Metadata = {
  title: 'FaithForward Chirho',
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
