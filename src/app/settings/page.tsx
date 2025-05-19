
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useCustomization, FontSize, Theme } from "@/contexts/customization-context";
import { Moon, Sun, CaseLower, CaseUpper, Laptop } from "lucide-react";

export default function SettingsPage() {
  const { fontSize, setFontSize, theme, setTheme, effectiveTheme } = useCustomization();

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
              {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  onClick={() => setTheme(t)}
                  className="flex-1 capitalize"
                  aria-pressed={theme === t}
                >
                  {t === 'light' && <Sun className="mr-2 h-4 w-4" />}
                  {t === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                  {t === 'system' && <Laptop className="mr-2 h-4 w-4" />}
                  {t}
                </Button>
              ))}
            </div>
             {theme === 'system' && (
              <p className="text-xs text-muted-foreground pt-1">
                Currently using: {effectiveTheme} mode.
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
              value={fontSize}
              onValueChange={(value: string) => setFontSize(value as FontSize)}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                <Label
                  key={size}
                  htmlFor={`font-${size}`}
                  className={`border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-primary ${
                    fontSize === size ? 'border-primary ring-2 ring-primary' : ''
                  }`}
                >
                  <RadioGroupItem value={size} id={`font-${size}`} className="sr-only" />
                  {size === 'small' && <CaseLower className="h-6 w-6 mb-1" />}
                  {size === 'medium' && <span className="text-xl font-bold mb-1">Aa</span>}
                  {size === 'large' && <CaseUpper className="h-6 w-6 mb-1" />}
                  <span className="text-sm capitalize">{size}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
