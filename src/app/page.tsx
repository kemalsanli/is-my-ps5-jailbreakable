'use client';

import { SerialForm } from '@/components/SerialForm';
import { GuideImages } from '@/components/GuideImages';
import { Footer } from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-ps5-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-ps5-blue rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-ps5-text-primary hidden sm:block">
                PS5 Jailbreak Checker
              </h1>
            </div>

            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* PS5 Logo-like decorative element */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-ps5-blue/20 to-ps5-blue/5 border border-ps5-blue/30 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-ps5-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-4 bg-ps5-blue/5 rounded-full blur-xl -z-10" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              <span className="text-gradient">{t.common.title}</span>
            </h2>
            <p className="text-lg md:text-xl text-ps5-text-secondary max-w-2xl mx-auto leading-relaxed mb-4">
              {t.common.description}
            </p>
            <p className="text-sm text-ps5-text-muted">
              {t.footer.dataFrom}{' '}
              <a
                href="https://www.psdevwiki.com/ps5/Serial_Number_guide"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ps5-blue hover:underline"
              >
                PSDevWiki
              </a>
            </p>
          </div>
        </section>

        {/* Serial Check Form */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <SerialForm />
        </section>

        {/* Guide Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <GuideImages />
        </section>

        {/* About Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-ps5-text-primary mb-8 text-center">
              {t.about.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="ps5-card p-6">
                <div className="w-10 h-10 rounded-lg bg-ps5-blue/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-ps5-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ps5-text-primary mb-2">
                  {t.about.whatIsThis}
                </h3>
                <p className="text-sm text-ps5-text-secondary leading-relaxed">
                  {t.about.whatIsThisDesc}
                </p>
              </div>

              <div className="ps5-card p-6">
                <div className="w-10 h-10 rounded-lg bg-ps5-blue/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-ps5-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ps5-text-primary mb-2">
                  {t.about.howItWorks}
                </h3>
                <p className="text-sm text-ps5-text-secondary leading-relaxed">
                  {t.about.howItWorksDesc}
                </p>
              </div>

              <div className="ps5-card p-6">
                <div className="w-10 h-10 rounded-lg bg-ps5-blue/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-ps5-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ps5-text-primary mb-2">
                  {t.about.disclaimer}
                </h3>
                <p className="text-sm text-ps5-text-secondary leading-relaxed">
                  {t.about.disclaimerDesc}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
