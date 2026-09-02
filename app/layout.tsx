import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = 'https://ledgerclean.app';

export const metadata: Metadata = {
  title: 'LedgerClean — Bank Statement to Excel Converter',
  description: 'Convert PDF bank statements to Excel & QuickBooks CSV 100% in-browser with zero server uploads. Private & free.',
  keywords: [
    'bank statement to excel',
    'bank statement to csv',
    'convert pdf bank statement to excel free',
    'convert pdf bank statement to qbo',
    'bank statement converter to quickbooks',
    'bank statement to xero csv converter',
    'in-browser bank statement converter',
    'zero server upload pdf OCR',
    'GLBA compliant bank statement parser',
    'GDPR compliant financial data converter',
    '100 percent local client side bank statement converter',
    'offline pdf bank statement to excel',
    'bank statement transaction extractor',
    'scanned pdf bank statement OCR',
    'credit card statement to excel',
    'checking account statement to csv',
    'bank reconciliation balance calculator',
    'automatic bank statement transaction categorizer',
    'bank statement to google sheets',
    'Chase bank statement to excel',
    'Bank of America statement converter',
    'Wells Fargo pdf statement converter',
    'Barclays bank statement to csv',
    'HSBC pdf bank statement converter',
    'Citibank statement to excel',
    'Capital One statement to csv',
    'US Bank pdf statement converter',
    'TD Bank statement to excel',
    'RBC Royal Bank statement to csv',
    'CBA Australia bank statement converter',
    'ANZ bank statement to excel',
    'Revolut pdf statement to csv',
    'Wise multi currency bank statement converter',
    'PDF OCR bank statement converter',
    'convert bank statement to xero',
  ],
  authors: [{ name: 'LedgerClean Team' }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': siteUrl,
      'es-ES': `${siteUrl}?lang=es`,
      'fr-FR': `${siteUrl}?lang=fr`,
      'de-DE': `${siteUrl}?lang=de`,
      'pt-PT': `${siteUrl}?lang=pt`,
      'ja-JP': `${siteUrl}?lang=ja`,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    google: 'P85CV44_DdHfGdIwCZCpyePFMPvriouHe2XKjivQ4gU',
  },
  openGraph: {
    title: 'LedgerClean — Private Bank Statement Engine',
    description: 'Convert PDF bank statements to Excel & QuickBooks CSV 100% locally on your device with complete privacy.',
    url: siteUrl,
    siteName: 'LedgerClean',
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1024,
        height: 1024,
        alt: 'LedgerClean App Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LedgerClean — Private Bank Statement Engine',
    description: '100% In-Browser WebAssembly PDF & OCR Converter for CPAs and Bookkeepers.',
    images: [`${siteUrl}/icon.png`],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'LedgerClean',
      url: siteUrl,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any Browser (Chrome, Safari, Edge, Firefox)',
      description: '100% In-Browser Client-Side Bank Statement PDF to Excel and QuickBooks CSV Converter.',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1240',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LedgerClean',
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
    },
  ];

  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="google-site-verification" content="P85CV44_DdHfGdIwCZCpyePFMPvriouHe2XKjivQ4gU" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchemas) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}

        {/* Lemon Squeezy Overlay Checkout Script */}
        <Script
          src="https://assets.lemonsqueezy.com/lemon.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
