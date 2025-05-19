// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type FontSizeChirho = 'small' | 'medium' | 'large';
export type ThemeChirho = 'light' | 'dark' | 'system';

interface CustomizationContextTypeChirho {
  fontSizeChirho: FontSizeChirho;
  setFontSizeChirho: (sizeChirho: FontSizeChirho) => void;
  themeChirho: ThemeChirho;
  setThemeChirho: (themeChirho: ThemeChirho) => void;
  effectiveThemeChirho: 'light' | 'dark';
}

const CustomizationContextChirho = createContext<CustomizationContextTypeChirho | undefined>(undefined);

export const CustomizationProviderChirho = ({ children }: { children: ReactNode }) => {
  const [fontSizeChirho, setFontSizeStateChirho] = useState<FontSizeChirho>('medium');
  const [themeChirho, setThemeStateChirho] = useState<ThemeChirho>('system');
  const [effectiveThemeChirho, setEffectiveThemeChirho] = useState<'light' | 'dark'>('light');
  const [isMountedChirho, setIsMountedChirho] = useState(false);

  useEffect(() => {
    setIsMountedChirho(true);
    const storedFontSizeChirho = localStorage.getItem('faithforward-fontSize') as FontSizeChirho | null; 
    const storedThemeChirho = localStorage.getItem('faithforward-theme') as ThemeChirho | null; 

    if (storedFontSizeChirho) setFontSizeStateChirho(storedFontSizeChirho);
    if (storedThemeChirho) {
      setThemeStateChirho(storedThemeChirho);
    }
  }, []);

  const applyFontSizeChirho = useCallback((sizeChirho: FontSizeChirho) => {
    let scaleChirho = 1;
    if (sizeChirho === 'small') scaleChirho = 0.875; 
    else if (sizeChirho === 'large') scaleChirho = 1.125; 
    document.documentElement.style.setProperty('--font-scale-factor', scaleChirho.toString()); 
    localStorage.setItem('faithforward-fontSize', sizeChirho); 
  }, []);

  const applyThemeChirho = useCallback((currentThemeChirho: ThemeChirho) => {
    let finalThemeChirho: 'light' | 'dark';
    if (currentThemeChirho === 'system') {
      finalThemeChirho = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      finalThemeChirho = currentThemeChirho;
    }
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(finalThemeChirho);
    setEffectiveThemeChirho(finalThemeChirho);
    localStorage.setItem('faithforward-theme', currentThemeChirho); 
  }, []);


  useEffect(() => {
    if (isMountedChirho) {
      applyFontSizeChirho(fontSizeChirho);
    }
  }, [fontSizeChirho, isMountedChirho, applyFontSizeChirho]);

  useEffect(() => {
    if (isMountedChirho) {
      applyThemeChirho(themeChirho);
    }
  }, [themeChirho, isMountedChirho, applyThemeChirho]);

  useEffect(() => {
    if (!isMountedChirho || themeChirho !== 'system') return;

    const mediaQueryChirho = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChangeChirho = () => {
      setThemeStateChirho(currentLocalThemeChirho => {
        if (currentLocalThemeChirho === 'system') {
           applyThemeChirho('system');
        }
        return currentLocalThemeChirho; 
      });
    };
    
    if (localStorage.getItem('faithforward-theme') === null && themeChirho === 'system') {
        handleChangeChirho();
    }

    mediaQueryChirho.addEventListener('change', handleChangeChirho);
    return () => mediaQueryChirho.removeEventListener('change', handleChangeChirho);
  }, [isMountedChirho, themeChirho, applyThemeChirho]);


  const setFontSizeChirho = (sizeChirho: FontSizeChirho) => setFontSizeStateChirho(sizeChirho);
  const setThemeChirho = (newThemeChirho: ThemeChirho) => setThemeStateChirho(newThemeChirho);

  return (
    <CustomizationContextChirho.Provider value={{ fontSizeChirho, setFontSizeChirho, themeChirho, setThemeChirho, effectiveThemeChirho }}>
      {children}
    </CustomizationContextChirho.Provider>
  );
};

export const useCustomizationChirho = () => {
  const contextChirho = useContext(CustomizationContextChirho);
  if (contextChirho === undefined) {
    throw new Error('useCustomizationChirho must be used within a CustomizationProviderChirho');
  }
  return contextChirho;
};
