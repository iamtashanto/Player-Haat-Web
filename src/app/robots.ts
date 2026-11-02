import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/public-data';
import { APP_SEGMENTS } from '@/lib/route-protection';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The signed-in app (and auth screens) aren't for search engines; /p, /r and the area pages are.
        disallow: ['/api/', ...['en', 'bn'].flatMap((l) => [...APP_SEGMENTS.map((s) => `/${l}/${s}`), `/${l}/auth`])],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

