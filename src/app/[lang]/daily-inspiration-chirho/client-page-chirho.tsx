// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { quotesChirho, InspirationalQuoteChirho } from "@/lib/quotes-chirho"; 
import { Sun, CalendarDays, Loader2 } from "lucide-react";
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import { defaultLocale } from '@/middleware';

interface DailyInspirationClientPagePropsChirho {
  dictionary: DictionaryChirho['dailyInspirationPage'];
  lang: string;
}

export default function DailyInspirationClientPageChirho({ dictionary, lang }: DailyInspirationClientPagePropsChirho) {
  const [dailyQuoteChirho, setDailyQuoteChirho] = useState<InspirationalQuoteChirho | null>(null);
  const [currentDateChirho, setCurrentDateChirho] = useState<string>("");

  useEffect(() => {
    const todayChirho = new Date();
    const dayOfYearChirho = Math.floor((todayChirho.getTime() - new Date(todayChirho.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setDailyQuoteChirho(quotesChirho[dayOfYearChirho % quotesChirho.length]);
    
    const localeForDate = lang === defaultLocale ? undefined : lang;
    setCurrentDateChirho(todayChirho.toLocaleDateString(localeForDate, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, [lang]);

  if (!dailyQuoteChirho || !dictionary) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{dictionary?.loading || "Loading inspiration..."}</p>
        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
      </div>
    );
  }

  const quoteText = dailyQuoteChirho.text[lang as keyof typeof dailyQuoteChirho.text] || dailyQuoteChirho.text['en'];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sun className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold">{dictionary.title}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground"/> {currentDateChirho}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
          <blockquote className="text-2xl italic font-serif text-foreground mb-4">
            "{quoteText}"
          </blockquote>
          <p className="text-lg text-muted-foreground">&mdash; {dailyQuoteChirho.author}</p>
        </CardContent>
        <CardFooter className="text-center block">
          <p className="text-sm text-muted-foreground">
            {dictionary.reflectMessage}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
