'use client';

import React, { useState } from 'react';
import { checkSerial } from '@/lib/serial-validator';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { FirmwareDetectionResult } from '@/types/serial';

export function SerialForm() {
  const { t } = useTranslation();
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<FirmwareDetectionResult | null>(null);
  const [error, setError] = useState('');
  const [borderColor, setBorderColor] = useState('');

  const handleInput = (value: string) => {
    setSerial(value.toUpperCase());
    setError('');
    setBorderColor('');
    setResult(null);
  };

  const handleCheck = () => {
    const v = serial.trim();
    if (!v) return;

    if (v.length < 8) {
      setBorderColor('#ff6666');
      setError(t.form.invalidFormat);
      return;
    }

    const checkResult = checkSerial(v);

    if (!checkResult) {
      setBorderColor('#ff6666');
      setError(t.form.invalidFormat);
      return;
    }

    setBorderColor('#66ff66');
    setResult(checkResult);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  const getDotColor = () => {
    if (!result) return '#666';
    if (result.status === 'JAILBREAKABLE') return '#66ff66';
    if (result.status === 'NOT_JAILBREAKABLE') return '#ff6666';
    return '#ffcc00';
  };

  const getResultTitle = () => {
    if (!result) return '';
    if (result.status === 'JAILBREAKABLE') return t.results.jailbreakable.title;
    if (result.status === 'NOT_JAILBREAKABLE') return t.results.notJailbreakable.title;
    return t.results.uncertain.title;
  };

  const getResultDesc = () => {
    if (!result) return '';
    if (result.status === 'JAILBREAKABLE') return t.results.jailbreakable.description;
    if (result.status === 'NOT_JAILBREAKABLE') return t.results.notJailbreakable.description;
    return t.results.uncertain.description;
  };

  return (
    <>
      <input
        id="si"
        type="text"
        placeholder={t.form.placeholder}
        maxLength={20}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={serial}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          background: 'var(--surface-color-secondary)',
          border: `1px solid ${borderColor || 'var(--surface-color-primary)'}`,
          borderRadius: '10px',
          padding: '13px 14px',
          fontSize: '16px',
          fontFamily: "'SF Mono', 'Menlo', monospace",
          color: 'var(--text-color-secondary)',
          letterSpacing: '0.06em',
          outline: 'none',
          display: 'block',
          transition: 'border-color 0.15s',
          WebkitAppearance: 'none',
        }}
      />

      {error && (
        <p
          style={{
            fontSize: '12px',
            color: '#ff6666',
            marginTop: '7px',
            paddingLeft: '2px',
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleCheck}
        style={{
          padding: '1rem 2rem',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'block',
          cursor: 'pointer',
          lineHeight: '2.5rem',
          borderRadius: '1.25rem',
          width: '100%',
          backgroundColor: 'var(--surface-color-primary)',
          border: 'none',
          color: 'var(--text-color-primary)',
          fontSize: '1.3rem',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 800,
          transition: 'background-color 0.25s ease, color 0.25s ease',
          boxSizing: 'border-box',
          marginTop: '12px',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-color-hover)';
          e.currentTarget.style.color = 'var(--text-color-primary-hover)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-color-primary)';
          e.currentTarget.style.color = 'var(--text-color-primary)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.985)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {t.common.check}
      </button>

      {result && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid var(--surface-color-primary)',
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              marginTop: '6px',
              flexShrink: 0,
              background: getDotColor(),
            }}
          />
          <div>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text-color-primary)',
                marginBottom: '3px',
              }}
            >
              {getResultTitle()}
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-color-tertiary)',
                lineHeight: 1.5,
              }}
            >
              {getResultDesc()}
            </p>
            <p
              style={{
                fontSize: '11px',
                fontFamily: "'SF Mono', Menlo, monospace",
                color: '#666',
                marginTop: '5px',
                letterSpacing: '0.03em',
              }}
            >
              {result.firmware !== 'Unknown'
                ? `${t.results.jailbreakable.firmware.split(':')[0]}: ${result.firmware}`
                : ''}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
