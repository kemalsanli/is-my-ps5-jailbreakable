import type { Metadata, Viewport } from 'next';
import { I18nProvider } from '@/lib/i18n/useTranslation';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://controlserial.com'),
  title: 'PS5 Jailbreak Checker — controlserial.com',
  description:
    'Check if your PlayStation 5 can be jailbroken by entering its serial number. Fast, accurate firmware detection based on PSDevWiki data.',
  keywords: [
    'PS5', 'jailbreak', 'serial number', 'firmware', 'CFW', 'homebrew',
    'PlayStation 5', 'exploit', 'BD-JB', 'controlserial',
  ],
  authors: [{ name: 'Kemal Sanlı', url: 'https://github.com/kemalsanli' }],
  creator: 'Kemal Sanlı',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://controlserial.com',
    title: 'PS5 Jailbreak Checker',
    description: 'Check if your PS5 is jailbreakable by serial number.',
    siteName: 'controlserial.com',
  },
  twitter: {
    card: 'summary',
    title: 'PS5 Jailbreak Checker',
    description: 'Check if your PS5 can be jailbroken by serial number',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c0c0f',
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
    description: 'Check if your PlayStation 5 can be jailbroken by serial number',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Person', name: 'Kemal Sanlı' },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
