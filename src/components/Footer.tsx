'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ps5-border bg-ps5-bg-secondary/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-ps5-text-primary mb-3">
              {t.about.title}
            </h3>
            <p className="text-sm text-ps5-text-muted leading-relaxed">
              {t.common.description}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-ps5-text-primary mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/kemalsanli/is-my-ps5-jailbreakable"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ps5-text-secondary hover:text-ps5-blue transition-colors duration-150"
                >
                  {t.footer.github} →
                </a>
              </li>
              <li>
                <a
                  href="https://www.psdevwiki.com/ps5/Serial_Number_guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ps5-text-secondary hover:text-ps5-blue transition-colors duration-150"
                >
                  PSDevWiki Guide →
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/kemalsanli/is-my-ps5-jailbreakable/blob/main/docs/CREDITS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ps5-text-secondary hover:text-ps5-blue transition-colors duration-150"
                >
                  {t.footer.credits} →
                </a>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3 className="text-lg font-semibold text-ps5-text-primary mb-3">
              {t.footer.credits}
            </h3>
            <ul className="space-y-2 text-sm text-ps5-text-muted">
              <li>• PSDevWiki Community</li>
              <li>• MODDED WARFARE</li>
              <li>• Mc Kuc</li>
              <li>• PS5 Homebrew Community</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ps5-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-ps5-text-muted">
              © {currentYear}{' '}
              <a
                href="https://github.com/kemalsanli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ps5-text-secondary hover:text-ps5-blue transition-colors"
              >
                Kemal Sanlı
              </a>
              . {t.footer.license}
            </p>
            <p className="text-xs text-ps5-text-muted">
              {t.footer.madeWith} {t.about.disclaimerDesc.split('.')[0]}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-ps5-bg-card/30 border border-ps5-border rounded-lg">
          <p className="text-xs text-ps5-text-muted text-center leading-relaxed">
            <strong className="text-ps5-text-secondary">{t.about.disclaimer}:</strong>{' '}
            {t.about.disclaimerDesc}
          </p>
        </div>
      </div>
    </footer>
  );
}
