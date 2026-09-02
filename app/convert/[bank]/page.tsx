import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BANK_CONFIGS } from '@/lib/banks-config';
import { BankConverterClient } from './BankConverterClient';

interface Props {
  params: {
    bank: string;
  };
}

const siteUrl = 'https://ledgerclean.app';

export async function generateStaticParams() {
  return Object.keys(BANK_CONFIGS).map((slug) => ({
    bank: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bankConfig = BANK_CONFIGS[params.bank];
  if (!bankConfig) {
    return {
      title: 'Bank Statement Converter',
    };
  }

  const pageUrl = `${siteUrl}/convert/${bankConfig.slug}`;

  return {
    title: bankConfig.metaTitle,
    description: bankConfig.metaDescription,
    keywords: [
      `${bankConfig.name} bank statement to excel`,
      `convert ${bankConfig.name} statement to csv`,
      `${bankConfig.name} quickbooks import`,
      `${bankConfig.name} pdf statement converter`,
      'zero server upload pdf converter',
      'GLBA compliant bank parser',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: bankConfig.metaTitle,
      description: bankConfig.metaDescription,
      url: pageUrl,
      siteName: 'BankStatementConverter',
      images: [
        {
          url: `${siteUrl}/icon.png`,
          width: 1024,
          height: 1024,
          alt: `${bankConfig.name} Bank Statement Converter Icon`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: bankConfig.metaTitle,
      description: bankConfig.metaDescription,
      images: [`${siteUrl}/icon.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BankPage({ params }: Props) {
  const bankConfig = BANK_CONFIGS[params.bank];

  if (!bankConfig) {
    notFound();
  }

  const pageUrl = `${siteUrl}/convert/${bankConfig.slug}`;

  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `BankStatementConverter — ${bankConfig.name} Statement Converter`,
      operatingSystem: 'Any Browser (Chrome, Safari, Edge, Firefox)',
      applicationCategory: 'FinanceApplication',
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
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Supported Banks',
          item: `${siteUrl}/#supported-banks`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: bankConfig.metaTitle,
          item: pageUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: bankConfig.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <BankConverterClient bankConfig={bankConfig} />
    </>
  );
}
