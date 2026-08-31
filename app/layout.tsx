import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = 'https://bankstatementconverter.web.app';

export const metadata: Metadata = {
  title: 'BankStatementConverter — 100% In-Browser Bank Statement to Excel & QuickBooks',
  description: 'Convert locked or scanned PDF bank statements into Excel (.xlsx) and QuickBooks CSV with zero server uploads. 100% private WebAssembly & OCR conversion.',
  keywords: [
    'bank statement to excel',
    'bank statement to csv',
    'convert pdf bank statement to qbo',
    'in-browser bank statement converter',
    'zero server upload pdf OCR',
    'GLBA compliant bank statement parser',
    'Chase statement to excel',
    'Bank of America statement converter',
    'Wells Fargo pdf statement converter',
    'PDF OCR bank statement converter',
    'convert bank statement to xero',
  ],
  authors: [{ name: 'BankStatementConverter Team' }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
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
    title: 'BankStatementConverter — 100% In-Browser Bank Statement Converter',
    description: 'Zero Server Uploads. Convert PDF bank statements into Excel & QuickBooks CSV 100% locally on your device with complete privacy.',
    url: siteUrl,
    siteName: 'BankStatementConverter',
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1024,
        height: 1024,
        alt: 'BankStatementConverter App Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BankStatementConverter — Private Bank Statement Engine',
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
      name: 'BankStatementConverter',
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
      name: 'BankStatementConverter',
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
    },
  ];

  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="canonical" href={siteUrl} />
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

        {/* Google AdSense Disabled */}

        {/* Lemon Squeezy Overlay Checkout Script */}
        <Script
          src="https://assets.lemonsqueezy.com/lemon.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
