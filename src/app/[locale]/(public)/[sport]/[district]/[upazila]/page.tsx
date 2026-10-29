import React from 'react';
import { MapPin, Trophy, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link, type AppLocale } from '@/i18n/routing';
import {
  PhBadge,
  PhButton,
  PhCard,
  PhSectionHeader,
} from '@/design-system';
import {
  PlayerTileCard,
  RequestCardView,
  type PlayerCardItem,
  type RequestCardItem,
} from '@/components/shared/domain-cards';
import {
  buildSeoMetadata,
  FEATURED_SEO_LOCATIONS,
} from '@/lib/public-data';

function formatSlugTitle(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function resolvePlaceNames(
  sport: string,
  district: string,
  upazila: string,
  locale: AppLocale,
) {
  const matched = FEATURED_SEO_LOCATIONS.find(
    (x) =>
      x.sportCode === sport.toLowerCase() &&
      x.districtSlug === district.toLowerCase() &&
      x.upazilaSlug === upazila.toLowerCase(),
  );

  const sportLabel = matched
    ? locale === 'bn'
      ? matched.sportNameBn
      : matched.sportNameEn
    : sport.toLowerCase() === 'cricket'
      ? locale === 'bn'
        ? 'ক্রিকেট'
        : 'Cricket'
      : locale === 'bn'
        ? 'ফুটবল'
        : 'Football';

  const districtLabel = matched
    ? locale === 'bn'
      ? matched.districtNameBn
      : matched.districtNameEn
    : formatSlugTitle(district);

  const upazilaLabel = matched
    ? locale === 'bn'
      ? matched.upazilaNameBn
      : matched.upazilaNameEn
    : formatSlugTitle(upazila);

  return { sportLabel, districtLabel, upazilaLabel };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    sport: string;
    district: string;
    upazila: string;
  }>;
}) {
  const { locale: rawLocale, sport, district, upazila } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  const { sportLabel, districtLabel, upazilaLabel } = resolvePlaceNames(
    sport,
    district,
    upazila,
    locale,
  );

  const title = `${t('locationHeroTitle', {
    sport: sportLabel,
    upazila: upazilaLabel,
    district: districtLabel,
  })} | PlayerHaat`;
  const description = t('locationHeroSubtitle', {
    sport: sportLabel,
    upazila: upazilaLabel,
    district: districtLabel,
  });

  return buildSeoMetadata({
    locale,
    path: `/${sport.toLowerCase()}/${district.toLowerCase()}/${upazila.toLowerCase()}`,
    title,
    description,
  });
}

export default async function LocationSeoPage({
  params,
}: {
  params: Promise<{
    locale: string;
    sport: string;
    district: string;
    upazila: string;
  }>;
}) {
  const { locale: rawLocale, sport, district, upazila } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  const { sportLabel, districtLabel, upazilaLabel } = resolvePlaceNames(
    sport,
    district,
    upazila,
    locale,
  );

  const isCricket = sport.toLowerCase() === 'cricket';
  const areaDisplay = `${upazilaLabel}, ${districtLabel}`;

  const topPlayers: PlayerCardItem[] = [
    {
      id: isCricket ? 'sohel-rana-cricket' : 'sohel-rana-football',
      name: 'Sohel Rana',
      verified: true,
      area: areaDisplay,
      sportName: sportLabel,
      positions: isCricket ? ['ALL', 'FAST'] : ['LW', 'CAM'],
      skillLevel: 5,
      ratingAverage: 4.9,
      ratingCount: 31,
      khepAvailable: true,
      rateMin: 1500,
      rateMax: 3000,
      statsVerified: true,
      experienceYears: 6,
      shortlisted: false,
    },
    {
      id: `arif-hossain-${sport.toLowerCase()}`,
      name: 'Arif Hossain',
      verified: true,
      area: areaDisplay,
      sportName: sportLabel,
      positions: isCricket ? ['BAT', 'WK'] : ['ST', 'RW'],
      skillLevel: 4,
      ratingAverage: 4.8,
      ratingCount: 18,
      khepAvailable: true,
      rateMin: 1200,
      rateMax: 2500,
      statsVerified: true,
      experienceYears: 5,
      shortlisted: false,
    },
    {
      id: `mehedi-hasan-${sport.toLowerCase()}`,
      name: 'Mehedi Hasan',
      verified: false,
      area: areaDisplay,
      sportName: sportLabel,
      positions: isCricket ? ['SPIN'] : ['CB', 'CDM'],
      skillLevel: 4,
      ratingAverage: 4.7,
      ratingCount: 11,
      khepAvailable: true,
      rateMin: 1000,
      rateMax: 1800,
      statsVerified: false,
      experienceYears: 4,
      shortlisted: false,
    },
  ];

  const openRequests: RequestCardItem[] = [
    {
      id: isCricket ? 'req-mirpur-t20-friday' : 'req-kalapara-gold-cup',
      sportName: sportLabel,
      whenText:
        locale === 'bn'
          ? 'শুক্র, ৬ নভে · বিকেল ৩:৩০'
          : 'Fri, 6 Nov · 3:30 PM',
      venueText: `${upazilaLabel} Central Ground`,
      areaText: areaDisplay,
      positions: isCricket
        ? ['Pace Bowler', 'Wicket-Keeper']
        : ['Striker (ST)', 'Goalkeeper (GK)'],
      spotsLeft: 2,
      playersNeeded: 2,
      isPaid: true,
      budgetMin: 1500,
      budgetMax: 3000,
      captainName: `${upazilaLabel} Sporting Club`,
      captainVerified: true,
      status: 'OPEN',
      featured: true,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Breadcrumb + Location Hero */}
      <PhCard className="p-6 sm:p-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2 tx-caption">
          <Link href="/" className="hover:text-[var(--ph-accent)]">
            PlayerHaat
          </Link>
          <span>/</span>
          <span className="font-semibold text-[var(--ph-accent)]">
            {sportLabel}
          </span>
          <span>/</span>
          <span>{districtLabel}</span>
          <span>/</span>
          <span className="font-semibold text-[var(--ph-text)]">
            {upazilaLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PhBadge tone="accent">{sportLabel}</PhBadge>
          <span className="inline-flex items-center gap-1 tx-subhead">
            <MapPin className="h-4 w-4 text-[var(--ph-accent)]" />
            <span>{areaDisplay}</span>
          </span>
        </div>

        <h1 className="tx-title1 sm:text-[32px]">
          {t('locationHeroTitle', {
            sport: sportLabel,
            upazila: upazilaLabel,
            district: districtLabel,
          })}
        </h1>

        <p className="max-w-2xl tx-body text-[var(--ph-text-secondary)]">
          {t('locationHeroSubtitle', {
            sport: sportLabel,
            upazila: upazilaLabel,
            district: districtLabel,
          })}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/auth">
            <PhButton
              label={t('createPlayerProfile')}
              icon={<Trophy className="h-4 w-4" />}
              size="medium"
              expand={false}
            />
          </Link>
          <Link href="/auth">
            <PhButton
              label={t('postRequest')}
              icon={<Users className="h-4 w-4" />}
              variant="secondary"
              size="medium"
              expand={false}
            />
          </Link>
        </div>
      </PhCard>

      {/* Top Players in this Area */}
      <section>
        <PhSectionHeader title={`${t('homeFeatured')} — ${areaDisplay}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPlayers.map((player) => (
            <Link key={player.id} href={`/p/${player.id}`}>
              <PlayerTileCard player={player} />
            </Link>
          ))}
        </div>
      </section>

      {/* Open Recruitment Requests in this Area */}
      <section>
        <PhSectionHeader title={`${t('homeNearby')} — ${areaDisplay}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openRequests.map((req) => (
            <Link key={req.id} href={`/r/${req.id}`}>
              <RequestCardView request={req} />
            </Link>
          ))}
        </div>
      </section>

      {/* Other Areas Quick Links */}
      <section>
        <PhSectionHeader title={t('landingBrowseByAreaTitle')} />
        <div className="flex flex-wrap gap-2">
          {FEATURED_SEO_LOCATIONS.map((loc) => {
            const href = `/${loc.sportCode}/${loc.districtSlug}/${loc.upazilaSlug}`;
            const label =
              locale === 'bn'
                ? `${loc.sportNameBn} · ${loc.upazilaNameBn}, ${loc.districtNameBn}`
                : `${loc.sportNameEn} · ${loc.upazilaNameEn}, ${loc.districtNameEn}`;
            return (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-[var(--ph-border)] bg-[var(--ph-surface)] px-3.5 py-2 tx-caption font-semibold text-[var(--ph-text-secondary)] hover:border-[var(--ph-accent)] hover:text-[var(--ph-accent)] transition-colors"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

