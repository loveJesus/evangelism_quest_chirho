
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'light' | 'dark' | 'system';

interface CustomizationContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedFontSize = localStorage.getItem('faithforward-fontSize') as FontSize | null;
    const storedTheme = localStorage.getItem('faithforward-theme') as Theme | null;

    if (storedFontSize) setFontSizeState(storedFontSize);
    if (storedTheme) {
      setThemeState(storedTheme);
    } else { 
      // Set initial theme based on system preference if nothing is stored
      // This runs client-side, so window.matchMedia is safe
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // This will be applied in the applyTheme effect
      // setEffectiveTheme(systemPrefersDark ? 'dark' : 'light');
      // We actually want applyTheme to handle this logic on first load if theme is 'system'
    }

  }, []);

  const applyFontSize = useCallback((size: FontSize) => {
    let scale = 1;
    if (size === 'small') scale = 0.875; // 14px base
    else if (size === 'large') scale = 1.125; // 18px base
    document.documentElement.style.setProperty('--font-scale-factor', scale.toString());
    localStorage.setItem('faithforward-fontSize', size);
  }, []);

  const applyTheme = useCallback((currentTheme: Theme) => {
    let finalTheme: 'light' | 'dark';
    if (currentTheme === 'system') {
      finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      finalTheme = currentTheme;
    }
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(finalTheme);
    setEffectiveTheme(finalTheme);
    localStorage.setItem('faithforward-theme', currentTheme);
  }, []);


  useEffect(() => {
    if (isMounted) {
      applyFontSize(fontSize);
    }
  }, [fontSize, isMounted, applyFontSize]);

  useEffect(() => {
    if (isMounted) {
      applyTheme(theme);
    }
  }, [theme, isMounted, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isMounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only call applyTheme if the theme is still 'system'
      // This prevents overriding a user's explicit theme choice if they change system theme then pick a specific app theme
      setThemeState(currentLocalTheme => {
        if (currentLocalTheme === 'system') {
           applyTheme('system');
        }
        return currentLocalTheme; // keep it 'system' or whatever it was changed to
      });
    };
    
    // Initial check for system theme if no theme was stored
    if (localStorage.getItem('faithforward-theme') === null && theme === 'system') {
        handleChange();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMounted, theme, applyTheme]);


  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  // The CustomizationContext.Provider should always be rendered to make the context available.
  // Initial values (from useState) will be used on SSR and first client render.
  // Client-side useEffects will then update these values from localStorage or system preferences.
  return (
    <CustomizationContext.Provider value={{ fontSize, setFontSize, theme, setTheme, effectiveTheme }}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (context === undefined) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

