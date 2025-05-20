// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useCustomizationChirho, FontSizeChirho, ThemeChirho } from "@/contexts/customization-context-chirho"; 
import { Moon, Sun, CaseLower, CaseUpper, Laptop, Loader2 } from "lucide-react";
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho'; // Updated import

interface SettingsClientPagePropsChirho {
  dictionary: DictionaryChirho['settingsPage'];
  lang: string;
}

export default function SettingsClientPageChirho({ dictionary, lang }: SettingsClientPagePropsChirho) {
  const { fontSizeChirho, setFontSizeChirho, themeChirho, setThemeChirho, effectiveThemeChirho } = useCustomizationChirho();

  if (!dictionary) {
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
                  {tChirho}
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
        </CardContent>
      </Card>
    </div>
  );
}
