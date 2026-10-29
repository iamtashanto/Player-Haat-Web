import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/public-data';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/en/player/',
          '/bn/player/',
          '/en/recruiter/',
          '/bn/recruiter/',
          '/en/auth/',
          '/bn/auth/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

