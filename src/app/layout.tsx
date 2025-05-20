// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { defaultLocale } from '@/middleware';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export async function generateMetadata(): Promise<Metadata> {
  // Minimal metadata for the root layout, as [lang]/layout.tsx will handle locale-specific metadata
  return {
    title: 'Evangelism Quest ☧', // Updated Default title
    description: 'Empowering your evangelism journey.',
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This root layout is intentionally minimal.
  // The actual app structure, providers, and locale-specific content
  // are handled by src/app/[lang]/layout.tsx.
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
