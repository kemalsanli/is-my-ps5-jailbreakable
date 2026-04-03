/**
 * i18n Configuration
 *
 * Supports: English, Turkish, Japanese, German, French, Spanish, Italian
 */

import type { Locale, LanguageInfo } from '@/types/serial';

export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_LOCALES: Locale[] = [
  'en',
  'tr',
  'ja',
  'de',
  'fr',
  'es',
  'it',
];

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

/**
 * Detect the user's preferred language from browser settings.
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLang = navigator.language.split('-')[0] as Locale;
  return SUPPORTED_LOCALES.includes(browserLang)
    ? browserLang
    : DEFAULT_LOCALE;
}

/**
 * Get the stored locale from localStorage, or detect from browser.
 */
export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = localStorage.getItem('ps5-checker-locale') as Locale | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }
  return detectBrowserLocale();
}

/**
 * Save the user's locale preference.
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ps5-checker-locale', locale);
}
