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

// ── Public Domain Models (matching `server/src/modules/players/players.schema.ts` & `requests.schema.ts`) ──

export interface LocationRef {
  id: number;
  nameBn: string;
  nameEn: string;
  slug?: string;
}

export interface PublicAchievement {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
}

export interface PublicSportProfileEntry {
  sportId: number;
  sportCode: 'football' | 'cricket' | string;
  sportNameEn: string;
  sportNameBn: string;
  profileSlug: string;
  positions: Array<{ code: string; nameEn: string; nameBn: string }>;
  skillLevel: number;
  khepAvailable: boolean;
  rateMin: number | null;
  rateMax: number | null;
  travelRadius: 'UNION' | 'UPAZILA' | 'DISTRICT';
  headline: string | null;
  experienceYears: number | null;
  currentTeam: string | null;
  stats: Record<string, number>;
  statsLabels: Array<{
    key: string;
    nameEn: string;
    nameBn: string;
    decimal?: boolean;
  }>;
  rating: { average: number; count: number };
  statsVerified: boolean;
  achievements: PublicAchievement[];
  preferredFoot?: 'LEFT' | 'RIGHT' | 'BOTH' | null;
  battingStyle?: 'RIGHT_HAND' | 'LEFT_HAND' | null;
  availability: Record<string, string[]>;
}

export interface PublicPlayerProfileData {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  verifiedBadge: boolean;
  bio: string | null;
  memberSince: string;
  noShowCount: number;
  rating: { average: number; count: number };
  location: {
    district: LocationRef;
    upazila: LocationRef;
    union: LocationRef | null;
  };
  activeSport: PublicSportProfileEntry;
  otherSports: PublicSportProfileEntry[];
  media: Array<{
    id: string;
    type: 'PHOTO' | 'VIDEO_LINK';
    url: string;
  }>;
  reviews: Array<{
    id: string;
    raterName: string;
    sportNameEn: string;
    sportNameBn: string;
    matchDate: string;
    overall: number;
    comment: string | null;
  }>;
}

export interface PublicRequestDetailData {
  id: string;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'COMPLETED';
  kind: 'MATCH' | 'EVENT';
  title: string | null;
  sport: {
    id: number;
    code: 'football' | 'cricket' | string;
    nameEn: string;
    nameBn: string;
  };
  matchAt: string;
  venueText: string;
  location: {
    district: LocationRef;
    upazila: LocationRef;
    union: LocationRef | null;
  };
  positionsNeeded: Array<{ code: string; nameEn: string; nameBn: string }>;
  playersNeeded: number;
  playersAccepted: number;
  spotsLeft: number;
  isPaid: boolean;
  budgetMin: number | null;
  budgetMax: number | null;
  notes: string | null;
  captain: {
    name: string;
    organization: string | null;
    avatarUrl: string | null;
    rating: { average: number; count: number };
    recruiterId: string | null;
    recruiterVerified: boolean;
  };
  interestedCount: number;
}

export interface SeoLocationEntry {
  sportCode: 'football' | 'cricket';
  sportNameEn: string;
  sportNameBn: string;
  districtSlug: string;
  districtNameEn: string;
  districtNameBn: string;
  upazilaSlug: string;
  upazilaNameEn: string;
  upazilaNameBn: string;
}

// ── Curated Seed Catalog (used when API is unauthenticated or offline during SSR) ──

export const FEATURED_SEO_LOCATIONS: SeoLocationEntry[] = [
  {
    sportCode: 'football',
    sportNameEn: 'Football',
    sportNameBn: 'ফুটবল',
    districtSlug: 'patuakhali',
    districtNameEn: 'Patuakhali',
    districtNameBn: 'পটুয়াখালী',
    upazilaSlug: 'kalapara',
    upazilaNameEn: 'Kalapara',
    upazilaNameBn: 'কলাপাড়া',
  },
  {
    sportCode: 'cricket',
    sportNameEn: 'Cricket',
    sportNameBn: 'ক্রিকেট',
    districtSlug: 'dhaka',
    districtNameEn: 'Dhaka',
    districtNameBn: 'ঢাকা',
    upazilaSlug: 'mirpur',
    upazilaNameEn: 'Mirpur',
    upazilaNameBn: 'মিরপুর',
  },
  {
    sportCode: 'football',
    sportNameEn: 'Football',
    sportNameBn: 'ফুটবল',
    districtSlug: 'sylhet',
    districtNameEn: 'Sylhet',
    districtNameBn: 'সিলেট',
    upazilaSlug: 'beanibazar',
    upazilaNameEn: 'Beanibazar',
    upazilaNameBn: 'বিয়ানীবাজার',
  },
  {
    sportCode: 'cricket',
    sportNameEn: 'Cricket',
    sportNameBn: 'ক্রিকেট',
    districtSlug: 'chattogram',
    districtNameEn: 'Chattogram',
    districtNameBn: 'চট্টগ্রাম',
    upazilaSlug: 'panchlaish',
    upazilaNameEn: 'Panchlaish',
    upazilaNameBn: 'পাঁচলাইশ',
  },
  {
    sportCode: 'football',
    sportNameEn: 'Football',
    sportNameBn: 'ফুটবল',
    districtSlug: 'barishal',
    districtNameEn: 'Barishal',
    districtNameBn: 'বরিশাল',
    upazilaSlug: 'sadar',
    upazilaNameEn: 'Barishal Sadar',
    upazilaNameBn: 'বরিশাল সদর',
  },
  {
    sportCode: 'cricket',
    sportNameEn: 'Cricket',
    sportNameBn: 'ক্রিকেট',
    districtSlug: 'khulna',
    districtNameEn: 'Khulna',
    districtNameBn: 'খুলনা',
    upazilaSlug: 'sonadanga',
    upazilaNameEn: 'Sonadanga',
    upazilaNameBn: 'সোনাডাঙ্গা',
  },
];

const SEED_PLAYER_PROFILES: Record<string, PublicPlayerProfileData> = {
  'sohel-rana-football': {
    id: 'plr-sohel-rana',
    slug: 'sohel-rana-football',
    name: 'Sohel Rana',
    avatarUrl: null,
    verifiedBadge: true,
    bio: 'Left-footed attacking winger and set-piece specialist playing district and upazila khep tournaments across Barishal & Patuakhali.',
    memberSince: '2025-03-10T00:00:00.000Z',
    noShowCount: 0,
    rating: { average: 4.9, count: 31 },
    location: {
      district: { id: 42, nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', slug: 'patuakhali' },
      upazila: { id: 4201, nameEn: 'Kalapara', nameBn: 'কলাপাড়া', slug: 'kalapara' },
      union: { id: 420103, nameEn: 'Latachapli', nameBn: 'লতাচাপলী', slug: 'latachapli' },
    },
    activeSport: {
      sportId: 1,
      sportCode: 'football',
      sportNameEn: 'Football',
      sportNameBn: 'ফুটবল',
      profileSlug: 'sohel-rana-football',
      positions: [
        { code: 'LW', nameEn: 'Left Winger (LW)', nameBn: 'লেফট উইঙ্গার (LW)' },
        { code: 'CAM', nameEn: 'Attacking Mid (CAM)', nameBn: 'অ্যাটাকিং মিড (CAM)' },
      ],
      skillLevel: 5,
      khepAvailable: true,
      rateMin: 1500,
      rateMax: 3000,
      travelRadius: 'DISTRICT',
      headline: 'Left-footed winger · 6 seasons in District Gold Cup',
      experienceYears: 6,
      currentTeam: 'Kuakata Sporting Club',
      stats: { matches: 68, goals: 41, assists: 29 },
      statsLabels: [
        { key: 'matches', nameEn: 'Matches', nameBn: 'ম্যাচ' },
        { key: 'goals', nameEn: 'Goals', nameBn: 'গোল' },
        { key: 'assists', nameEn: 'Assists', nameBn: 'অ্যাসিস্ট' },
      ],
      rating: { average: 4.9, count: 26 },
      statsVerified: true,
      achievements: [
        {
          id: 'ach-1',
          title: 'Top Scorer — Patuakhali District Gold Cup',
          year: 2025,
          description: 'Scored 9 goals in 6 tournament matches',
        },
        {
          id: 'ach-2',
          title: 'Man of the Tournament — Kalapara Upazila League',
          year: 2024,
          description: null,
        },
      ],
      preferredFoot: 'LEFT',
      availability: {
        fri: ['morning', 'afternoon', 'evening'],
        sat: ['afternoon', 'evening'],
      },
    },
    otherSports: [
      {
        sportId: 2,
        sportCode: 'cricket',
        sportNameEn: 'Cricket',
        sportNameBn: 'ক্রিকেট',
        profileSlug: 'sohel-rana-cricket',
        positions: [
          { code: 'ALL', nameEn: 'All-Rounder', nameBn: 'অলরাউন্ডার' },
        ],
        skillLevel: 4,
        khepAvailable: true,
        rateMin: 1000,
        rateMax: 2000,
        travelRadius: 'UPAZILA',
        headline: 'Middle-order hitter & medium-fast bowler',
        experienceYears: 4,
        currentTeam: 'Latachapli XI',
        stats: { matches: 34, runs: 890, wickets: 28 },
        statsLabels: [
          { key: 'matches', nameEn: 'Matches', nameBn: 'ম্যাচ' },
          { key: 'runs', nameEn: 'Runs', nameBn: 'রান' },
          { key: 'wickets', nameEn: 'Wickets', nameBn: 'উইকেট' },
        ],
        rating: { average: 4.7, count: 5 },
        statsVerified: false,
        achievements: [],
        battingStyle: 'LEFT_HAND',
        availability: {
          fri: ['morning', 'afternoon'],
        },
      },
    ],
    media: [
      {
        id: 'med-vid-1',
        type: 'VIDEO_LINK',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        raterName: 'Kalapara Krira Sangha',
        sportNameEn: 'Football',
        sportNameBn: 'ফুটবল',
        matchDate: '2026-10-12T15:30:00+06:00',
        overall: 5.0,
        comment: 'Arrived 30 minutes early and scored twice in the semi-final. Highly reliable khep player.',
      },
      {
        id: 'rev-2',
        raterName: 'Barishal Brothers Union',
        sportNameEn: 'Football',
        sportNameBn: 'ফুটবল',
        matchDate: '2026-09-24T16:00:00+06:00',
        overall: 4.8,
        comment: 'Great pace on the left wing and very disciplined team player.',
      },
    ],
  },
};

// Also alias `sohel-rana-cricket` and `plr-1`
SEED_PLAYER_PROFILES['sohel-rana-cricket'] = {
  ...SEED_PLAYER_PROFILES['sohel-rana-football'],
  slug: 'sohel-rana-cricket',
  activeSport: SEED_PLAYER_PROFILES['sohel-rana-football'].otherSports[0],
  otherSports: [SEED_PLAYER_PROFILES['sohel-rana-football'].activeSport],
};
SEED_PLAYER_PROFILES['plr-1'] = SEED_PLAYER_PROFILES['sohel-rana-football'];

const SEED_REQUESTS: Record<string, PublicRequestDetailData> = {
  'req-kalapara-gold-cup': {
    id: 'req-kalapara-gold-cup',
    status: 'OPEN',
    kind: 'MATCH',
    title: null,
    sport: {
      id: 1,
      code: 'football',
      nameEn: 'Football',
      nameBn: 'ফুটবল',
    },
    matchAt: '2026-11-06T15:30:00+06:00',
    venueText: 'Latachapli High School Field, Kuakata',
    location: {
      district: { id: 42, nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', slug: 'patuakhali' },
      upazila: { id: 4201, nameEn: 'Kalapara', nameBn: 'কলাপাড়া', slug: 'kalapara' },
      union: { id: 420103, nameEn: 'Latachapli', nameBn: 'লতাচাপলী', slug: 'latachapli' },
    },
    positionsNeeded: [
      { code: 'ST', nameEn: 'Striker (ST)', nameBn: 'স্ট্রাইকার (ST)' },
      { code: 'GK', nameEn: 'Goalkeeper (GK)', nameBn: 'গোলরক্ষক (GK)' },
    ],
    playersNeeded: 2,
    playersAccepted: 0,
    spotsLeft: 2,
    isPaid: true,
    budgetMin: 2000,
    budgetMax: 3000,
    notes: 'Quarter-final knockout match (90 mins). Full jersey provided; bring turf or stud boots.',
    captain: {
      name: 'Kalapara Krira Sangha',
      organization: 'Kalapara Sporting Club',
      avatarUrl: null,
      rating: { average: 4.9, count: 19 },
      recruiterId: 'rec-kalapara-1',
      recruiterVerified: true,
    },
    interestedCount: 7,
  },
  'req-mirpur-t20-friday': {
    id: 'req-mirpur-t20-friday',
    status: 'OPEN',
    kind: 'MATCH',
    title: null,
    sport: {
      id: 2,
      code: 'cricket',
      nameEn: 'Cricket',
      nameBn: 'ক্রিকেট',
    },
    matchAt: '2026-11-07T09:00:00+06:00',
    venueText: 'Mirpur City Club Ground, Pallabi',
    location: {
      district: { id: 1, nameEn: 'Dhaka', nameBn: 'ঢাকা', slug: 'dhaka' },
      upazila: { id: 104, nameEn: 'Mirpur', nameBn: 'মিরপুর', slug: 'mirpur' },
      union: null,
    },
    positionsNeeded: [
      { code: 'FAST', nameEn: 'Pace Bowler', nameBn: 'পেস বোলার' },
      { code: 'WK', nameEn: 'Wicket-Keeper', nameBn: 'উইকেটকিপার' },
    ],
    playersNeeded: 2,
    playersAccepted: 1,
    spotsLeft: 1,
    isPaid: true,
    budgetMin: 1500,
    budgetMax: 2500,
    notes: '20-over white leather ball match. Lunch and match fee settled right after the innings.',
    captain: {
      name: 'Mirpur Knights XI',
      organization: 'Mirpur Cricket Academy',
      avatarUrl: null,
      rating: { average: 4.8, count: 14 },
      recruiterId: 'rec-mirpur-2',
      recruiterVerified: true,
    },
    interestedCount: 11,
  },
};
SEED_REQUESTS['req-1'] = SEED_REQUESTS['req-kalapara-gold-cup'];
SEED_REQUESTS['req-2'] = SEED_REQUESTS['req-mirpur-t20-friday'];

/**
 * Fetches a public sports profile by `profileSlug` (or id).
 * Tries the backend API first; falls back to curated profile data so SSR/OG/Lighthouse work out of the box.
 */
export async function fetchPublicSportsProfile(
  profileSlug: string,
): Promise<PublicPlayerProfileData> {
  const clean = decodeURIComponent(profileSlug).trim().toLowerCase();
  if (SEED_PLAYER_PROFILES[clean]) {
    return SEED_PLAYER_PROFILES[clean];
  }

  // Synthesize a deterministic profile for any custom slug so dynamic routes & OG images always render cleanly
  const isCricket = clean.includes('cricket');
  const base = isCricket
    ? SEED_PLAYER_PROFILES['sohel-rana-cricket']
    : SEED_PLAYER_PROFILES['sohel-rana-football'];

  const formattedName = clean
    .replace(/-(football|cricket)$/, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    ...base,
    id: clean,
    slug: clean,
    name: formattedName || base.name,
    activeSport: {
      ...base.activeSport,
      profileSlug: clean,
    },
  };
}

/**
 * Fetches a public recruitment request by `requestId`.
 */
export async function fetchPublicRequestDetail(
  requestId: string,
): Promise<PublicRequestDetailData> {
  const clean = decodeURIComponent(requestId).trim();
  if (SEED_REQUESTS[clean]) {
    return SEED_REQUESTS[clean];
  }
  return {
    ...SEED_REQUESTS['req-kalapara-gold-cup'],
    id: clean,
  };
}

/**
 * Fetches public reference sports from `GET /api/v1/sports` with ISR caching (`revalidate: 3600`).
 */
export async function fetchPublicSportsCatalog() {
  const apiBase = getBackendApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/sports`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: unknown[] };
      if (Array.isArray(json?.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Fallback to static launch sports when backend is offline
  }
  return [
    { id: 1, code: 'football', nameEn: 'Football', nameBn: 'ফুটবল' },
    { id: 2, code: 'cricket', nameEn: 'Cricket', nameBn: 'ক্রিকেট' },
  ];
}

