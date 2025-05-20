// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useCustomizationChirho, FontSizeChirho, ThemeChirho } from "@/contexts/customization-context-chirho"; 
import { Moon, Sun, CaseLower, CaseUpper, Laptop, Loader2, Languages } from "lucide-react";
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import { useRouter, usePathname } from "next/navigation";
import { useToastChirho } from "@/hooks/use-toast-chirho";

interface SettingsClientPagePropsChirho {
  dictionary: DictionaryChirho['settingsPage'];
  lang: string;
}

const LOCAL_STORAGE_LANG_KEY_CHIRHO = 'faithforward-lang';

export default function SettingsClientPageChirho({ dictionary, lang: currentUrlLang }: SettingsClientPagePropsChirho) {
  const { fontSizeChirho, setFontSizeChirho, themeChirho, setThemeChirho, effectiveThemeChirho } = useCustomizationChirho();
  const [selectedLangChirho, setSelectedLangChirho] = useState<string>(currentUrlLang);
  const routerChirho = useRouter();
  const pathnameChirho = usePathname();
  const { toastChirho } = useToastChirho();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY_CHIRHO);
    if (storedLang && storedLang !== currentUrlLang) {
      // If localStorage lang is different from URL lang, prioritize URL lang for initial state
      // but you could also redirect here if desired:
      // routerChirho.push(pathnameChirho.replace(`/${currentUrlLang}`, `/${storedLang}`));
      setSelectedLangChirho(currentUrlLang);
    } else if (storedLang) {
      setSelectedLangChirho(storedLang);
    } else {
      setSelectedLangChirho(currentUrlLang);
    }
  }, [currentUrlLang, routerChirho, pathnameChirho]);

  const handleLanguageChangeChirho = (newLang: string) => {
    if (!isMounted) return;

    setSelectedLangChirho(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY_CHIRHO, newLang);

    // Construct new path
    // Pathname might be /en/settings-chirho or /settings-chirho if middleware hasn't run
    // So we ensure we're always replacing the correct part if it exists
    let newPathname = pathnameChirho;
    if (pathnameChirho.startsWith(`/${currentUrlLang}`)) {
      newPathname = pathnameChirho.replace(`/${currentUrlLang}`, `/${newLang}`);
    } else {
      // If currentUrlLang is not in the path, assume it's a path without lang (e.g. root redirected by middleware)
      // or a path that needs the lang prefix added
      if (pathnameChirho === '/') {
         newPathname = `/${newLang}`;
      } else if (!pathnameChirho.startsWith('/')) {
         newPathname = `/${newLang}/${pathnameChirho}`;
      } else if (!pathnameChirho.substring(1).includes('/')) { // e.g. /settings-chirho but missing lang
         newPathname = `/${newLang}${pathnameChirho}`;
      } else { // For paths like /some/other/page, prepend lang
         newPathname = `/${newLang}${pathnameChirho}`;
      }
    }
    
    routerChirho.push(newPathname);
    toastChirho({
      title: dictionary.languageChangedToastTitle || "Language Updated",
      description: (dictionary.languageChangedToastDescription || "Switched to {lang}.").replace("{lang}", newLang === 'en' ? 'English' : 'Español'),
    });
  };


  if (!dictionary || !isMounted) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme-selector" className="text-lg font-semibold">{dictionary.themeLabel}</Label>
            <p className="text-sm text-muted-foreground">
              {dictionary.themeDescription}
            </p>
            <div className="flex space-x-2 pt-2">
              {(['light', 'dark', 'system'] as ThemeChirho[]).map((tChirho) => (
                <Button
                  key={tChirho}
                  variant={themeChirho === tChirho ? "default" : "outline"}
                  onClick={() => setThemeChirho(tChirho)}
                  className="flex-1 capitalize"
                  aria-pressed={themeChirho === tChirho}
                >
                  {tChirho === 'light' && <Sun className="mr-2 h-4 w-4" />}
                  {tChirho === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                  {tChirho === 'system' && <Laptop className="mr-2 h-4 w-4" />}
                  {dictionary.themes ? dictionary.themes[tChirho] : tChirho}
                </Button>
              ))}
            </div>
             {themeChirho === 'system' && (
              <p className="text-xs text-muted-foreground pt-1">
                {dictionary.themeSystemCurrent.replace('{theme}', effectiveThemeChirho)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size-selector" className="text-lg font-semibold">{dictionary.fontSizeLabel}</Label>
             <p className="text-sm text-muted-foreground">
              {dictionary.fontSizeDescription}
            </p>
            <RadioGroup
              id="font-size-selector"
              value={fontSizeChirho}
              onValueChange={(valueChirho: string) => setFontSizeChirho(valueChirho as FontSizeChirho)}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              {(['small', 'medium', 'large'] as FontSizeChirho[]).map((sizeChirho) => (
                <Label
                  key={sizeChirho}
                  htmlFor={`font-${sizeChirho}`}
                  className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-primary ${
                    fontSizeChirho === sizeChirho ? 'border-primary ring-2 ring-primary' : ''
                  }`}
                >
                  <RadioGroupItem value={sizeChirho} id={`font-${sizeChirho}`} className="sr-only" />
                  {sizeChirho === 'small' && <CaseLower className="h-6 w-6 mb-1" />}
                  {sizeChirho === 'medium' && <span className="text-xl font-bold mb-1">Aa</span>}
                  {sizeChirho === 'large' && <CaseUpper className="h-6 w-6 mb-1" />}
                  <span className="text-sm capitalize">
                    {sizeChirho === 'small' && dictionary.fontSmall}
                    {sizeChirho === 'medium' && dictionary.fontMedium}
                    {sizeChirho === 'large' && dictionary.fontLarge}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language-selector" className="text-lg font-semibold flex items-center">
              <Languages className="mr-2 h-5 w-5 text-primary" />
              {dictionary.languageSelectorLabel}
            </Label>
            <p className="text-sm text-muted-foreground">
              {dictionary.languageSelectorDescription}
            </p>
            <RadioGroup
              id="language-selector"
              value={selectedLangChirho}
              onValueChange={handleLanguageChangeChirho}
              className="grid grid-cols-2 gap-4 pt-2"
            >
              {[
                { value: 'en', label: dictionary.languageEnglish },
                { value: 'es', label: dictionary.languageSpanish },
              ].map((langOption) => (
                <Label
                  key={langOption.value}
                  htmlFor={`lang-${langOption.value}`}
                  className={`border rounded-md p-4 flex items-center justify-center cursor-pointer transition-colors hover:border-primary ${
                    selectedLangChirho === langOption.value ? 'border-primary ring-2 ring-primary' : ''
                  }`}
                >
                  <RadioGroupItem value={langOption.value} id={`lang-${langOption.value}`} className="sr-only" />
                  <span className="text-sm">{langOption.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
