'use client';

import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { checkSerial } from '@/lib/serial-validator';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { FirmwareDetectionResult } from '@/types/serial';
import { ResultDisplay } from './ResultDisplay';

export function SerialForm() {
  const { t } = useTranslation();
  const [serial, setSerial] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FirmwareDetectionResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validation
    if (!serial.trim()) {
      setError(t.form.required);
      return;
    }

    if (serial.trim().length < 10) {
      setError(t.form.tooShort);
      return;
    }

    // Check serial
    setIsChecking(true);
    
    // Simulate async operation (in case we add API calls later)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const checkResult = checkSerial(serial);

    if (!checkResult) {
      setError(t.form.invalidFormat);
      setIsChecking(false);
      return;
    }

    setResult(checkResult);
    setIsChecking(false);
  };

  const handleClear = () => {
    setSerial('');
    setError('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label={t.form.label}
          placeholder={t.form.placeholder}
          value={serial}
          onChange={(e) => {
            setSerial(e.target.value.toUpperCase());
            setError('');
          }}
          error={error}
          hint={!error ? t.form.hint : undefined}
          maxLength={21}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isChecking}
            disabled={!serial.trim() || isChecking}
          >
            {isChecking ? t.common.loading : t.common.check}
          </Button>

          {serial && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              disabled={isChecking}
            >
              {t.common.clear}
            </Button>
          )}
        </div>
      </form>

      {result && (
        <div className="animate-slide-up">
          <ResultDisplay result={result} />
        </div>
      )}
    </div>
  );
}
