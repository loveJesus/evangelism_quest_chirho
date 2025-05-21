// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Gamepad2, Users, Lightbulb, LogIn, Loader2, Github, Youtube, Languages, ExternalLink } from "lucide-react";
import Link from 'next/link';
import { useAuthChirho } from '@/contexts/auth-context-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import { useRouter, usePathname } from "next/navigation";
import { useToastChirho } from "@/hooks/use-toast-chirho";

const LOCAL_STORAGE_LANG_KEY_CHIRHO = 'faithforward-lang'; // Consistent key

interface LandingPagePropsChirho {
  lang: string;
  dictionary: DictionaryChirho['landingPage'];
}

export default function LandingPageChirho({ lang: currentUrlLang, dictionary }: LandingPagePropsChirho) {
  const { currentUserChirho, loadingAuthChirho } = useAuthChirho();
  const routerChirho = useRouter();
  const pathnameChirho = usePathname();
  const { toastChirho } = useToastChirho();

  const [selectedLangChirho, setSelectedLangChirho] = useState<string>(currentUrlLang);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY_CHIRHO);
    if (storedLang) {
      setSelectedLangChirho(storedLang);
      // If stored lang is different from URL lang, redirect to ensure consistency
      if (storedLang !== currentUrlLang) {
        let newPathname = pathnameChirho;
        if (pathnameChirho.startsWith(`/${currentUrlLang}`)) {
            newPathname = pathnameChirho.replace(`/${currentUrlLang}`, `/${storedLang}`);
        } else {
            newPathname = `/${storedLang}${pathnameChirho.startsWith('/') ? '' : '/'}${pathnameChirho}`;
        }
        routerChirho.push(newPathname);
      }
    } else {
      setSelectedLangChirho(currentUrlLang);
    }
  }, [currentUrlLang, pathnameChirho, routerChirho]);


  const handleLanguageChangeChirho = (newLang: string) => {
    if (!isMounted) return;

    setSelectedLangChirho(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY_CHIRHO, newLang);

    let newPathname = pathnameChirho;
     if (pathnameChirho.startsWith(`/${currentUrlLang}`)) {
      newPathname = pathnameChirho.replace(`/${currentUrlLang}`, `/${newLang}`);
    } else {
       // Handle cases where pathname might not start with lang, e.g. root path
       newPathname = `/${newLang}${pathnameChirho === '/' ? '' : pathnameChirho}`;
    }
    
    routerChirho.push(newPathname);
    // Toast is more appropriate in settings, here the page reloads with new lang.
  };


  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 text-center">
      <header className="w-full flex justify-end items-center p-6 absolute top-0 right-0">
        {!loadingAuthChirho && !currentUserChirho && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/${selectedLangChirho}/login-chirho`}>
              <LogIn className="mr-2 h-4 w-4" /> {dictionary.loginButton}
            </Link>
          </Button>
        )}
        {!loadingAuthChirho && currentUserChirho && (
           <Button asChild variant="default" size="sm">
            <Link href={`/${selectedLangChirho}/ai-personas-chirho`}>
              {dictionary.ctaLoggedIn}
            </Link>
          </Button>
        )}
      </header>
      
      <main className="flex flex-col items-center justify-center flex-1 mt-16 mb-8"> {/* Added margin-top for header space */}
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
                  <Link href={`/${selectedLangChirho}/login-chirho`}>{dictionary.ctaLoggedOut}</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/${selectedLangChirho}/ai-personas-chirho`}>{dictionary.ctaLoggedIn}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 space-y-4">
            <div className="flex justify-center items-center space-x-4">
                <Button variant="outline" asChild>
                    <a href="https://github.com/loveJesus/evangelism_quest_chirho" target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" /> {dictionary.viewSourceLink}
                    </a>
                </Button>
                <Button variant="outline" asChild>
                    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer"> {/* Replace with actual video URL */}
                        <Youtube className="mr-2 h-4 w-4" /> {dictionary.watchDemoLink}
                    </a>
                </Button>
            </div>
        </div>
      </main>

       <footer className="w-full py-8 text-center text-sm text-muted-foreground space-y-3">
        {isMounted && (
          <div className="flex flex-col items-center space-y-2 mb-4">
            <Label htmlFor="landing-language-selector" className="text-xs">{dictionary.languageSelectorLabel}</Label>
            <RadioGroup
              id="landing-language-selector"
              value={selectedLangChirho}
              onValueChange={handleLanguageChangeChirho}
              className="flex space-x-2"
            >
              {[
                { value: 'en', label: dictionary.languageEnglish },
                { value: 'es', label: dictionary.languageSpanish },
              ].map((langOption) => (
                <Label
                  key={langOption.value}
                  htmlFor={`landing-lang-${langOption.value}`}
                  className={`border rounded-md px-3 py-1 text-xs cursor-pointer transition-colors hover:border-primary ${
                    selectedLangChirho === langOption.value ? 'border-primary bg-primary/10 text-primary' : 'border-input'
                  }`}
                >
                  <RadioGroupItem value={langOption.value} id={`landing-lang-${langOption.value}`} className="sr-only" />
                  {langOption.label}
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}
        <p>{dictionary.footerVerse}</p>
        <p>&copy; {new Date().getFullYear()} {dictionary.footerCopyright}</p>
      </footer>
    </div>
  );
}
