import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '@/lib/i18n/useTranslation';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://controlserial.com'),
  title: 'Is my PS5 Jailbreakable? | Serial Number Firmware Checker',
  description:
    'Check if your PlayStation 5 can be jailbroken by entering its serial number. Fast, accurate firmware detection based on manufacturing data from PSDevWiki.',
  keywords: [
    'PS5',
    'jailbreak',
    'serial number',
    'firmware',
    'CFW',
    'homebrew',
    'PlayStation 5',
    'exploit',
    'BD-JB',
  ],
  authors: [{ name: 'Kemal Sanlı', url: 'https://github.com/kemalsanli' }],
  creator: 'Kemal Sanlı',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://controlserial.com',
    title: 'PS5 Jailbreak Checker - Check Your Serial Number',
    description:
      'Free tool to check if your PS5 is jailbreakable by serial number. Instant firmware estimation based on community data.',
    siteName: 'PS5 Jailbreak Checker',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PS5 Jailbreak Checker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is my PS5 Jailbreakable?',
    description:
      'Check if your PS5 can be jailbroken by serial number',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F0F0F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PS5 Jailbreak Checker',
    url: 'https://controlserial.com',
    description:
      'Check if your PlayStation 5 can be jailbroken by serial number',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'Kemal Sanlı',
      url: 'https://github.com/kemalsanli',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ps5-bg-primary text-ps5-text-primary antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
