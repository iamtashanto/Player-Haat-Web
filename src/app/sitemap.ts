import type { MetadataRoute } from 'next';
import { FEATURED_SEO_LOCATIONS, getSiteBaseUrl } from '@/lib/public-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteBaseUrl();
  const now = new Date();

  const staticPaths = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/account-deletion',
    '/p/sohel-rana-football',
    '/p/sohel-rana-cricket',
    '/r/req-kalapara-gold-cup',
    '/r/req-mirpur-t20-friday',
  ];

  const locationPaths = FEATURED_SEO_LOCATIONS.map(
    (loc) => `/${loc.sportCode}/${loc.districtSlug}/${loc.upazilaSlug}`,
  );

  const allPaths = [...staticPaths, ...locationPaths];
  const entries: MetadataRoute.Sitemap = [];

  for (const path of allPaths) {
    const enUrl = `${siteUrl}/en${path}`;
    const bnUrl = `${siteUrl}/bn${path}`;

    for (const locale of ['bn', 'en'] as const) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : path.startsWith('/p/') || path.startsWith('/r/') ? 0.8 : 0.7,
        alternates: {
          languages: {
            bn: bnUrl,
            en: enUrl,
          },
        },
      });
    }
  }

  return entries;
}

