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
      canonical: `https://ledgerclean.app/convert/${bankConfig.slug}`,
    },
    openGraph: {
      title: bankConfig.metaTitle,
      description: bankConfig.metaDescription,
      url: `https://ledgerclean.app/convert/${bankConfig.slug}`,
      siteName: 'LedgerClean',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: bankConfig.metaTitle,
      description: bankConfig.metaDescription,
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

  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `LedgerClean — ${bankConfig.name} Statement Converter`,
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
          item: 'https://ledgerclean.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Supported Banks',
          item: 'https://ledgerclean.app/#supported-banks',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: bankConfig.metaTitle,
          item: `https://ledgerclean.app/convert/${bankConfig.slug}`,
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
