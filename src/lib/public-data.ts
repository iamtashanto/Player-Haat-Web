import type { Metadata } from 'next';
import type { AppLocale } from '@/i18n/routing';
import { getBackendApiBaseUrl } from './auth-cookies';

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://playerhaat.com'
  ).replace(/\/+$/, '');
}

/**
 * Generates Next.js `Metadata` with canonical URL and `en`/`bn` `hreflang` alternates.
 */
export function buildSeoMetadata(params: {
  locale: AppLocale;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}): Metadata {
  const siteUrl = getSiteBaseUrl();
  const cleanPath = params.path === '/' ? '' : params.path;
  const canonical = `${siteUrl}/${params.locale}${cleanPath}`;
  const enUrl = `${siteUrl}/en${cleanPath}`;
  const bnUrl = `${siteUrl}/bn${cleanPath}`;

  return {
    title: params.title,
    description: params.description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        bn: bnUrl,
        'x-default': bnUrl,
      },
    },
    openGraph: {
      title: params.title,
      description: params.description,
      url: canonical,
      siteName: 'PlayerHaat',
      locale: params.locale === 'bn' ? 'bn_BD' : 'en_US',
      type: 'website',
      ...(params.ogImage
        ? {
            images: [
              {
                url: params.ogImage,
                width: 1200,
                height: 630,
                alt: params.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      ...(params.ogImage ? { images: [params.ogImage] } : {}),
    },
  };
}


// ── Real data for the public pages (signed-out `/public/*` endpoints; nothing is invented when the API is down) ──

import type { PlayerCard, PlayerProfile } from './api/social';
import type { PlayerRequest } from './api/requests';
import type { SportCatalogItem } from './player-api';

export type PublicPlayerCard = PlayerCard;
export type PublicPlayerProfile = PlayerProfile;
export type PublicRequest = PlayerRequest;

const REVALIDATE_SECONDS = 300;

/** GET a public endpoint. 404 → `null`; any other failure throws so the page shows an error instead of a blank. */
async function publicGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${getBackendApiBaseUrl()}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Public API ${path} failed with ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

/** Same, but returns `fallback` on any failure (landing/sitemap should still render when the API is unreachable). */
async function publicGetOr<T>(path: string, fallback: T): Promise<T> {
  try {
    return (await publicGet<T>(path)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const fetchPublicPlayer = (id: string) => publicGet<PublicPlayerProfile>(`/public/players/${encodeURIComponent(id)}`);
export const fetchPublicRequest = (id: string) => publicGet<PublicRequest>(`/public/requests/${encodeURIComponent(id)}`);
export const fetchPublicSports = () => publicGetOr<SportCatalogItem[]>('/sports', []);
export const fetchTopPlayers = (limit = 6) => publicGetOr<PublicPlayerCard[]>(`/public/players?limit=${limit}`, []);
export const fetchOpenRequests = (limit = 6) => publicGetOr<PublicRequest[]>(`/public/requests?limit=${limit}`, []);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export interface ResolvedArea {
  districtId: number;
  upazilaId: number;
  district: { nameEn: string; nameBn: string };
  upazila: { nameEn: string; nameBn: string };
}

/** `/football/patuakhali/kalapara` → ids, via the locations search; `null` when no such place exists. */
export async function resolveArea(districtSlug: string, upazilaSlug: string): Promise<ResolvedArea | null> {
  const q = upazilaSlug.replace(/-/g, ' ');
  const hits = await publicGetOr<
    Array<{ level: string; id: number; nameEn: string; nameBn: string; district: { id: number; nameEn: string; nameBn: string } | null }>
  >(`/locations/search?q=${encodeURIComponent(q)}&level=upazila&limit=30`, []);
  const hit = hits.find((h) => h.level === 'upazila' && slugify(h.nameEn) === upazilaSlug && h.district && slugify(h.district.nameEn) === districtSlug);
  if (!hit?.district) return null;
  return { districtId: hit.district.id, upazilaId: hit.id, district: hit.district, upazila: { nameEn: hit.nameEn, nameBn: hit.nameBn } };
}

export const fetchPlayersInArea = (sportId: number, area: ResolvedArea, limit = 24) =>
  publicGetOr<PublicPlayerCard[]>(`/public/players?sportId=${sportId}&upazilaId=${area.upazilaId}&limit=${limit}`, []);
export const fetchRequestsInArea = (sportId: number, area: ResolvedArea, limit = 12) =>
  publicGetOr<PublicRequest[]>(`/public/requests?sportId=${sportId}&upazilaId=${area.upazilaId}&limit=${limit}`, []);

/** Distinct sport/district/upazila combinations that currently have public players (landing "browse by area" + sitemap). */
export async function listActiveAreas(sports: SportCatalogItem[], limit = 50) {
  const players = await publicGetOr<PublicPlayerCard[]>(`/public/players?limit=${limit}`, []);
  const seen = new Map<string, { sport: SportCatalogItem; district: PublicPlayerCard['location']['district']; upazila: PublicPlayerCard['location']['upazila'] }>();
  for (const p of players) {
    for (const s of p.sports) {
      const sport = sports.find((x) => x.id === s.sportId);
      if (!sport) continue;
      const key = `${sport.id}/${p.location.district.id}/${p.location.upazila.id}`;
      if (!seen.has(key)) seen.set(key, { sport, district: p.location.district, upazila: p.location.upazila });
    }
  }
  return [...seen.values()];
}

export const areaPath = (a: { sport: SportCatalogItem; district: { nameEn: string }; upazila: { nameEn: string } }) =>
  `/${a.sport.code.toLowerCase()}/${slugify(a.district.nameEn)}/${slugify(a.upazila.nameEn)}`;
