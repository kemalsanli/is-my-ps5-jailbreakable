'use client';

import React, { useState } from 'react';
import { checkSerial, formatSerialInput } from '@/lib/serial-validator';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { FirmwareDetectionResult } from '@/types/serial';

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#666',
  marginBottom: '2px',
};

const VALUE_STYLE: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-color-secondary)',
  lineHeight: 1.5,
};

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  padding: '5px 0',
};

const SEP_STYLE: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--surface-color-primary)',
  margin: '6px 0',
};

export function SerialForm() {
  const { t } = useTranslation();
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<FirmwareDetectionResult | null>(null);
  const [error, setError] = useState('');
  const [borderColor, setBorderColor] = useState('');

  const details = t.results?.details;

  const handleInput = (value: string) => {
    const formatted = formatSerialInput(value);
    setSerial(formatted);
    setError('');
    setBorderColor('');
    setResult(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const cleaned = pasted.replace(/[\s\u200B\u200C\u200D\uFEFF\n\r\t]+/g, '');
    const formatted = formatSerialInput(cleaned);
    setSerial(formatted);
    setError('');
    setBorderColor('');
    setResult(null);
  };

  const handleCheck = () => {
    const v = serial.trim();
    if (!v) return;

    const checkResult = checkSerial(v);

    if (!checkResult) {
      setBorderColor('#ff6666');
      setError(t.form?.invalidFormat || 'Invalid format — e.g. CFI-1215A');
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
    if (result.status === 'JAILBREAKABLE') return t.results?.jailbreakable?.title || 'Jailbreakable';
    if (result.status === 'NOT_JAILBREAKABLE') return t.results?.notJailbreakable?.title || 'Not Jailbreakable';
    return t.results?.uncertain?.title || 'Uncertain';
  };

  const getResultDesc = () => {
    if (!result) return '';
    if (result.status === 'JAILBREAKABLE') return t.results?.jailbreakable?.description || 'This PS5 is likely jailbreakable! The estimated factory firmware is within the exploitable range.';
    if (result.status === 'NOT_JAILBREAKABLE') return t.results?.notJailbreakable?.description || 'This PS5 likely shipped with a firmware version that is not currently exploitable.';
    return t.results?.uncertain?.description || 'This PS5 was manufactured during a transition period. The actual firmware could vary.';
  };

  const getQualityLabel = (): string => {
    if (!result?.jailbreakInfo) return '';
    const q = result.jailbreakInfo.quality;
    if (q === 'BEST') return details?.qualityBest || 'Best range — full JB with all exploits';
    if (q === 'GOOD') return details?.qualityGood || 'Good range — full JB with multiple exploits';
    if (q === 'OK') return details?.qualityOk || 'Jailbreakable — kernel exploit available';
    if (q === 'PARTIAL') return details?.qualityPartial || 'Partial — usermode only, no full JB';
    return details?.qualityNone || 'No jailbreak available';
  };

  const getQualityColor = (): string => {
    if (!result?.jailbreakInfo) return '#666';
    const q = result.jailbreakInfo.quality;
    if (q === 'BEST') return '#66ff66';
    if (q === 'GOOD') return '#88dd66';
    if (q === 'OK') return '#cccc44';
    if (q === 'PARTIAL') return '#ffcc00';
    return '#ff6666';
  };

  return (
    <>
      <input
        id="si"
        type="text"
        placeholder={t.form?.placeholder || 'CFI-1215A'}
        maxLength={24}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={serial}
        onChange={(e) => handleInput(e.target.value)}
        onPaste={handlePaste}
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
        {t.common?.check || 'Check Serial'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid var(--surface-color-primary)',
          }}
        >
          {/* Status Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
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
            <div style={{ flex: 1 }}>
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
            </div>
          </div>

          {/* Detail Section */}
          <div style={{ marginTop: '16px', paddingLeft: '17px' }}>
            {/* Model */}
            {result.modelName && result.modelName !== 'Unknown' && (
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>{details?.model || 'Model'}</span>
                <span style={{ ...VALUE_STYLE, fontFamily: "'SF Mono', Menlo, monospace", fontSize: '12px', letterSpacing: '0.03em' }}>
                  {result.modelName} — {result.modelType}
                </span>
              </div>
            )}

            {/* Production */}
            {result.yearManufactured > 0 && result.monthManufactured > 0 && (
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>{details?.production || 'Production'}</span>
                <span style={VALUE_STYLE}>
                  {t.results?.months && t.results.months[result.monthManufactured - 1]
                    ? `${t.results.months[result.monthManufactured - 1]} ${result.yearManufactured}`
                    : result.productionMonthName}
                  {result.factoryCountry && result.factoryCountry !== 'Unknown'
                    ? ` — ${t.results?.countries?.[result.factoryCountry as keyof typeof t.results.countries] || result.factoryCountry}`
                    : ''}
                </span>
              </div>
            )}

            <hr style={SEP_STYLE} />

            {/* Factory Firmware */}
            {result.firmwareRange && result.firmwareRange !== 'Unknown' && (
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>{details?.factoryFirmware || 'Factory Firmware'}</span>
                <span style={{
                  ...VALUE_STYLE,
                  fontFamily: "'SF Mono', Menlo, monospace",
                  fontSize: '12px',
                  letterSpacing: '0.03em',
                  color: getDotColor(),
                }}>
                  {result.firmwareRange}
                </span>
              </div>
            )}

            {/* Kernel Exploit */}
            {result.jailbreakInfo && result.jailbreakInfo.kernelExploit !== 'Unknown' && result.jailbreakInfo.kernelExploit !== 'None' && (
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>{details?.kernelExploit || 'Kernel Exploit'}</span>
                <span style={{
                  ...VALUE_STYLE,
                  fontFamily: "'SF Mono', Menlo, monospace",
                  fontSize: '12px',
                  letterSpacing: '0.03em',
                }}>
                  {result.jailbreakInfo.kernelExploit}
                </span>
              </div>
            )}

            {/* Quality */}
            {result.jailbreakInfo && (
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>{details?.availableExploits || 'JB Status'}</span>
                <span style={{
                  ...VALUE_STYLE,
                  fontSize: '12px',
                  color: getQualityColor(),
                }}>
                  {getQualityLabel()}
                </span>
              </div>
            )}

            {/* Exploits list */}
            {result.jailbreakInfo && result.jailbreakInfo.exploits.length > 0 && (
              <div style={{ padding: '5px 0' }}>
                <span style={LABEL_STYLE}>{details?.availableExploits || 'Available Exploits'}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {result.jailbreakInfo.exploits.map((exploit, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'var(--surface-color-primary)',
                        color: 'var(--text-color-tertiary)',
                        fontFamily: "'SF Mono', Menlo, monospace",
                        letterSpacing: '0.02em',
                      }}
                    >
                      {exploit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Usermode only note */}
            {result.jailbreakInfo && result.jailbreakInfo.quality === 'PARTIAL' && (
              <p style={{
                fontSize: '11px',
                color: '#ffcc00',
                marginTop: '6px',
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                {details?.usermodeOnly || 'Only usermode access (mast1c0re, Lua). No kernel-level jailbreak yet.'}
              </p>
            )}

            {/* Warning */}
            {result.warning && (
              <>
                <hr style={SEP_STYLE} />
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  lineHeight: 1.6,
                  padding: '4px 0',
                }}>
                  <p style={{ marginBottom: '3px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffcc00', flexShrink: 0, marginTop: '5px' }} />
                    <span>{details?.warningFactory || 'Serial number only shows FACTORY firmware. Console may have been updated.'}</span>
                  </p>
                  <p style={{ marginBottom: '3px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffcc00', flexShrink: 0, marginTop: '5px' }} />
                    <span>{details?.warningPSN || 'Do NOT connect to PSN before verifying — it triggers auto-update.'}</span>
                  </p>
                  <p style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffcc00', flexShrink: 0, marginTop: '5px' }} />
                    <span>{details?.warningRefurbished || 'Refurbished / renewed units do not follow this table.'}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
