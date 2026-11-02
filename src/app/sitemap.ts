import type { MetadataRoute } from 'next';
import { areaPath, fetchOpenRequests, fetchPublicSports, fetchTopPlayers, getSiteBaseUrl, listActiveAreas } from '@/lib/public-data';

// Built on request from live data, so it never lists a page that doesn't exist.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteBaseUrl();
  const now = new Date();
  const sports = await fetchPublicSports();
  const [players, requests, areas] = await Promise.all([fetchTopPlayers(50), fetchOpenRequests(50), listActiveAreas(sports)]);

  const paths = [
    ...['', '/about', '/contact', '/privacy', '/terms', '/account-deletion'],
    ...players.map((p) => `/p/${p.id}`),
    ...requests.map((r) => `/r/${r.id}`),
    ...areas.map(areaPath),
  ];

  return paths.flatMap((path) =>
    (['bn', 'en'] as const).map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
      priority: path === '' ? 1 : path.startsWith('/p/') || path.startsWith('/r/') ? 0.8 : 0.7,
      alternates: { languages: { bn: `${siteUrl}/bn${path}`, en: `${siteUrl}/en${path}` } },
    })),
  );
}
