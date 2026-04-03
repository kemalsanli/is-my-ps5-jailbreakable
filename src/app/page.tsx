'use client';

import { SerialForm } from '@/components/SerialForm';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function HomePage() {
  const { t, direction } = useTranslation();

  return (
    <div
      dir={direction}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '440px',
          padding: '24px 32px 32px',
        }}
      >
        {/* Main */}
        <div>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-color-tertiary)',
              marginBottom: '8px',
            }}
          >
            PlayStation 5 Jailbreak Checker
          </p>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-color-primary)',
              letterSpacing: '-0.4px',
              lineHeight: 1.2,
              marginBottom: '8px',
              whiteSpace: 'pre-line',
            }}
          >
            {t.common.title}
          </h1>

          <SerialForm />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid var(--surface-color-primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '11px', color: '#444' }}>
              <a
                href="https://github.com/kemalsanli"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#444', textDecoration: 'none' }}
              >
                kemalsanli
              </a>
              {' · '}
              controlserial.com
            </span>
            <span style={{ fontSize: '11px', color: '#444' }}>
              <a
                href="https://psdevwiki.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#444', textDecoration: 'none' }}
              >
                PSDevWiki
              </a>
              {' · '}
              <LanguageSelector />
            </span>
          </div>
          <p
            style={{
              fontSize: '10px',
              color: '#333',
              lineHeight: 1.5,
            }}
          >
            {t.about?.disclaimerDesc || 'This site is not affiliated with Sony Interactive Entertainment. PlayStation and PS5 are registered trademarks of Sony Interactive Entertainment LLC.'}
          </p>
        </div>
      </div>
    </div>
  );
}
