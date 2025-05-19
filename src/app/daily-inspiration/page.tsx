
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { quotes, InspirationalQuote } from "@/lib/quotes";
import { Sun, CalendarDays } from "lucide-react";

export default function DailyInspirationPage() {
  const [dailyQuote, setDailyQuote] = useState<InspirationalQuote | null>(null);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setDailyQuote(quotes[dayOfYear % quotes.length]);
    
    setCurrentDate(today.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, []);

  if (!dailyQuote) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading inspiration...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sun className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold">Daily Inspiration</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground"/> {currentDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
          <blockquote className="text-2xl italic font-serif text-foreground mb-4">
            "{dailyQuote.text}"
          </blockquote>
          <p className="text-lg text-muted-foreground">&mdash; {dailyQuote.author}</p>
        </CardContent>
        <CardFooter className="text-center block">
          <p className="text-sm text-muted-foreground">
            Reflect on this and go forward in faith!
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
