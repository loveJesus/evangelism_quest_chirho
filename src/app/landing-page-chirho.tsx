// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Lightbulb, LogIn, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useAuthChirho } from '@/contexts/auth-context-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';

interface LandingPagePropsChirho {
  lang: string;
  dictionary: DictionaryChirho['landingPage'];
}

export default function LandingPageChirho({ lang, dictionary }: LandingPagePropsChirho) {
  const { currentUserChirho, loadingAuthChirho } = useAuthChirho();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 text-center">
      <header className="absolute top-0 right-0 p-6">
        {!loadingAuthChirho && !currentUserChirho && (
          <Button asChild variant="outline">
            <Link href={`/${lang}/login-chirho`}>
              <LogIn className="mr-2 h-4 w-4" /> {dictionary.loginButton}
            </Link>
          </Button>
        )}
        {!loadingAuthChirho && currentUserChirho && (
           <Button asChild variant="default">
            <Link href={`/${lang}/ai-personas-chirho`}>
              {dictionary.ctaLoggedIn}
            </Link>
          </Button>
        )}
      </header>
      
      <main className="flex flex-col items-center justify-center flex-1">
        <Card className="w-full max-w-3xl shadow-xl bg-card/90 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex justify-center mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                <path d="M10.5 2V8H4V12H10.5V22H13.5V12H20V8H13.5V2H10.5Z"/>
              </svg>
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold text-foreground">
              {dictionary.title}
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground mt-2">
              {dictionary.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 mt-4">
            <p className="text-lg text-foreground/80">
              {dictionary.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border bg-background/70 hover:shadow-md transition-shadow flex flex-col items-center">
                <Gamepad2 className="h-10 w-10 text-accent mb-3" />
                <h3 className="text-xl font-semibold">{dictionary.feature1Title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{dictionary.feature1Desc}</p>
              </div>
              <div className="p-6 rounded-lg border bg-background/70 hover:shadow-md transition-shadow flex flex-col items-center">
                <Users className="h-10 w-10 text-accent mb-3" />
                <h3 className="text-xl font-semibold">{dictionary.feature2Title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{dictionary.feature2Desc}</p>
              </div>
              <div className="p-6 rounded-lg border bg-background/70 hover:shadow-md transition-shadow flex flex-col items-center">
                <Lightbulb className="h-10 w-10 text-accent mb-3" />
                <h3 className="text-xl font-semibold">{dictionary.feature3Title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{dictionary.feature3Desc}</p>
              </div>
            </div>
            <div className="mt-10">
              {loadingAuthChirho ? (
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground opacity-50 cursor-not-allowed">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {dictionary.loading || "Loading..."}
                </Button>
              ) : !currentUserChirho ? (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/${lang}/login-chirho`}>{dictionary.ctaLoggedOut}</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/${lang}/ai-personas-chirho`}>{dictionary.ctaLoggedIn}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
       <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>{dictionary.footerVerse}</p>
        <p>&copy; {new Date().getFullYear()} {dictionary.footerCopyright}</p>
      </footer>
    </div>
  );
}
