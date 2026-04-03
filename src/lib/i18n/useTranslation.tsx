/**
 * useTranslation Hook
 *
 * Provides typed access to the current locale's translations.
 * Falls back to English for missing keys.
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { Locale, Translations } from '@/types/serial';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getStoredLocale, setStoredLocale, getLocaleDirection } from './config';
import enTranslations from '../../../public/locales/en.json';

const fallbackTranslations = enTranslations as unknown as Translations;

interface I18nContextValue {
  locale: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
  t: Translations;
  direction: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Deep merge two translation objects (for fallback).
 */
function deepMerge(
  base: Translations,
  override: Partial<Translations>
): Translations {
  const result = { ...base };
  for (const key in override) {
    const overrideValue = override[key as keyof Translations];
    const baseValue = base[key as keyof Translations];
    
    if (
      overrideValue &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue) &&
      baseValue &&
      typeof baseValue === 'object'
    ) {
      (result as any)[key] = { ...baseValue, ...overrideValue };
    } else if (overrideValue !== undefined) {
      (result as any)[key] = overrideValue;
    }
  }
  return result as Translations;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<Translations>(fallbackTranslations);
  const [enTranslationsState, setEnTranslationsState] = useState<Translations>(fallbackTranslations);

  // Load translations
  const loadTranslations = useCallback(async (loc: Locale) => {
    try {
      const enModule = await import('../../../public/locales/en.json');
      const enData = enModule.default as Translations;
      setEnTranslationsState(enData);

      if (loc === 'en') {
        setTranslations(enData);
      } else {
        const locModule = await import(`../../../public/locales/${loc}.json`);
        const locData = locModule.default as Translations;
        // Merge with English as fallback
        setTranslations(deepMerge(enData, locData));
      }
    } catch (error) {
      console.error(`Failed to load translations for ${loc}:`, error);
      // Fallback to English
      const enModule = await import('../../../public/locales/en.json');
      setTranslations(enModule.default as Translations);
    }
  }, []);

  // Initialize locale on mount
  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    loadTranslations(stored);
  }, [loadTranslations]);

  // Change locale
  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!SUPPORTED_LOCALES.includes(newLocale)) return;
      setLocaleState(newLocale);
      setStoredLocale(newLocale);
      loadTranslations(newLocale);
      // Update html lang and dir attributes
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
        document.documentElement.dir = getLocaleDirection(newLocale);
      }
    },
    [loadTranslations]
  );

  const direction = getLocaleDirection(locale);

  // Wait for translations to load
  const isLoaded = Object.keys(translations).length > 0;
  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider
      value={{ locale, translations, setLocale, t: translations, direction }}
    >
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access translations and locale functions.
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Return fallback English translations during SSR/static generation
    return {
      locale: DEFAULT_LOCALE,
      translations: fallbackTranslations,
      setLocale: () => {},
      t: fallbackTranslations,
      direction: 'ltr',
    };
  }
  return context;
}

/**
 * Interpolate template variables in a string.
 * Example: "Firmware: {version}" with { version: "4.51" } => "Firmware: 4.51"
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key) => String(vars[key] ?? `{${key}}`)
  );
}
