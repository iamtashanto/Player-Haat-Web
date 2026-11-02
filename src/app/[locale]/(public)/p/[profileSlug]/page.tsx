import React from 'react';
import { notFound } from 'next/navigation';
import { BadgeCheck, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { PhAvatar, PhBadge, PhCard, RatingStars } from '@/design-system';
import { OpenInApp } from '@/components/public/open-in-app';
import { formatDate, formatMoneyRange, formatNumber } from '@/lib/format';
import { buildSeoMetadata, fetchPublicPlayer, fetchPublicSports, getSiteBaseUrl } from '@/lib/public-data';

type Params = Promise<{ locale: string; profileSlug: string }>;
const loc = (l: string) => (l === 'en' ? 'en' : 'bn') as AppLocale;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale: raw, profileSlug } = await params;
  const locale = loc(raw);
  const [p, sports] = await Promise.all([fetchPublicPlayer(profileSlug), fetchPublicSports()]);
  if (!p) return { title: 'PlayerHaat', robots: { index: false } };
  const first = p.sports[0];
  const sport = sports.find((s) => s.id === first?.sportId);
  const sportName = sport ? (locale === 'bn' ? sport.nameBn : sport.nameEn) : '';
  const area = locale === 'bn' ? `${p.location.upazila.nameBn}, ${p.location.district.nameBn}` : `${p.location.upazila.nameEn}, ${p.location.district.nameEn}`;
  return buildSeoMetadata({
    locale,
    path: `/p/${p.id}`,
    title: `${p.name}${sportName ? ` (${sportName})` : ''} — ${area} | PlayerHaat`,
    description: first?.headline || p.bio || `${p.name} · ${area}`,
    ogImage: `${getSiteBaseUrl()}/${locale}/p/${p.id}/opengraph-image`,
  });
}

export default async function PublicPlayerPage({ params }: { params: Params }) {
  const { locale: raw, profileSlug } = await params;
  const locale = loc(raw);
  const t = await getTranslations({ locale });
  const [p, sports] = await Promise.all([fetchPublicPlayer(profileSlug), fetchPublicSports()]);
  if (!p) notFound();
  const name = (n: { nameBn: string; nameEn: string }) => (locale === 'bn' ? n.nameBn : n.nameEn);
  const area = `${name(p.location.upazila)}, ${name(p.location.district)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    url: `${getSiteBaseUrl()}/${locale}/p/${p.id}`,
    image: p.avatarUrl ?? undefined,
    description: p.bio ?? undefined,
    homeLocation: { '@type': 'Place', name: `${p.location.upazila.nameEn}, ${p.location.district.nameEn}, Bangladesh` },
    ...(p.rating.count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating.average, reviewCount: p.rating.count } } : {}),
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="flex items-center gap-4">
        <PhAvatar name={p.name} url={p.avatarUrl} size={88} verified={p.verifiedBadge} />
        <div className="min-w-0">
          <h1 className="tx-title1">{p.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {p.verifiedBadge && <PhBadge tone="accent" icon={<BadgeCheck className="h-3 w-3" />} label={t('verifiedPlayer')} />}
            <span className="inline-flex items-center gap-1 tx-subhead"><MapPin className="h-4 w-4" aria-hidden />{area}</span>
          </div>
          {p.rating.count > 0 && (
            <div className="mt-1 flex items-center gap-2"><RatingStars value={p.rating.average} /><span className="tx-footnote">{t('ratingsCount', { count: p.rating.count })}</span></div>
          )}
          <p className="mt-1 tx-footnote text-[var(--ph-text-tertiary)]">{t('memberSince', { date: formatDate(p.memberSince, locale) })}</p>
        </div>
      </div>
      {p.bio && <p className="tx-body whitespace-pre-line">{p.bio}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {p.sports.map((s) => {
          const sport = sports.find((x) => x.id === s.sportId);
          const positions = s.positions.map((c) => (sport?.positions.find((x) => x.code === c) ? name(sport.positions.find((x) => x.code === c)!) : c)).join(', ');
          const rate = s.khepAvailable ? formatMoneyRange(s.rateMin, s.rateMax, locale) || t('negotiableRate') : '';
          return (
            <PhCard key={s.sportId} paddingClassName="p-4">
              <h2 className="tx-headline">{sport ? name(sport) : ''}</h2>
              {s.headline && <p className="tx-subhead">{s.headline}</p>}
              <dl className="mt-3 space-y-1 tx-footnote">
                {positions && <div><dt className="inline text-[var(--ph-text-tertiary)]">{t('positionsLabel')}: </dt><dd className="inline">{positions}</dd></div>}
                <div><dt className="inline text-[var(--ph-text-tertiary)]">{t('skillLabel')}: </dt><dd className="inline">{t(`skill${Math.min(5, Math.max(1, s.skillLevel))}`)}</dd></div>
                {s.experienceYears != null && <div><dd>{t('yearsExperience', { n: formatNumber(s.experienceYears, locale) })}</dd></div>}
                {rate && <div><dt className="inline text-[var(--ph-text-tertiary)]">{t('khepRate')}: </dt><dd className="inline">{rate}</dd></div>}
              </dl>
              {s.statsVerified && <div className="mt-2"><PhBadge tone="accent" label={t('statsVerifiedBadge')} /></div>}
            </PhCard>
          );
        })}
      </div>
      <OpenInApp appHref={`/player/${p.id}`} backHref={`/p/${p.id}`} />
    </article>
  );
}
