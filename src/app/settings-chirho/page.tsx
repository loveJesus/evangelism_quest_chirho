// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useCustomizationChirho, FontSizeChirho, ThemeChirho } from "@/contexts/customization-context-chirho"; 
import { Moon, Sun, CaseLower, CaseUpper, Laptop } from "lucide-react";

export default function SettingsPage() { // Renamed component
  const { fontSizeChirho, setFontSizeChirho, themeChirho, setThemeChirho, effectiveThemeChirho } = useCustomizationChirho();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme-selector" className="text-lg font-semibold">Theme</Label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color scheme. System will match your OS setting.
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
                Currently using: {effectiveThemeChirho} mode.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size-selector" className="text-lg font-semibold">Font Size</Label>
             <p className="text-sm text-muted-foreground">
              Adjust the application's base font size for better readability.
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
                  <span className="text-sm capitalize">{sizeChirho}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
