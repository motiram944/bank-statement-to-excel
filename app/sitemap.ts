import { MetadataRoute } from 'next';
import { BANK_CONFIGS } from '@/lib/banks-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bankstatementconverter.web.app';

  const bankUrls = Object.keys(BANK_CONFIGS).map((slug) => ({
    url: `${baseUrl}/convert/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...bankUrls,
  ];
}
