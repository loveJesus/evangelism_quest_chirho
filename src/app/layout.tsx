// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import type { Metadata, Viewport } from 'next';
import { Geist_Sans as GeistSans, Geist_Mono as GeistMono } from 'next/font/google'; // Corrected import for Geist Sans
import './globals.css';

const geistSansChirho = GeistSans({ // Use the corrected import
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMonoChirho = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Note: Metadata and Viewport in the root layout are often static.
// Dynamic metadata based on locale would typically be in [lang]/layout.tsx
export const metadata: Metadata = {
  title: 'Faith Forward ☧', // Updated
  description: 'Empowering your evangelism journey.',
};

export const viewport: Viewport = {
  themeColor: [ // Example theme color, adjust as needed
    { media: '(prefers-color-scheme: light)', color: 'hsl(216 25% 95%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(240 10% 3.9%)' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The [lang] segment in the URL will determine the actual lang attribute.
    // The middleware handles redirecting to a locale-prefixed path.
    // This html tag doesn't need a lang prop directly if children (i.e., [lang]/layout.tsx) handle it.
    <html lang="en" suppressHydrationWarning> 
      <body className={`${geistSansChirho.variable} ${geistMonoChirho.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
