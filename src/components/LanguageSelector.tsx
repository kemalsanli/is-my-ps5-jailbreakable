'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LANGUAGES } from '@/lib/i18n/config';
import type { Locale } from '@/types/serial';

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Select language"
      data-testid="language-selector"
      style={{
        background: 'transparent',
        border: 'none',
        color: '#444',
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        cursor: 'pointer',
        outline: 'none',
        padding: '0',
      }}
    >
      {LANGUAGES.map((lang) => (
        <option
          key={lang.code}
          value={lang.code}
          style={{
            background: 'var(--surface-color-primary)',
            color: 'var(--text-color-secondary)',
          }}
        >
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
