import React from 'react';
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Play,
  Star,
  Wallet,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link, type AppLocale } from '@/i18n/routing';
import {
  PhAvatar,
  PhBadge,
  PhCard,
  PhChip,
  PhGroup,
  PhRow,
  PhSectionHeader,
  RatingStars,
} from '@/design-system';
import { PublicProfileRecruiterActions } from '@/components/public/public-profile-actions';
import {
  formatDate,
  formatDecimal1,
  formatMoneyRange,
  formatNumber,
} from '@/lib/format';
import {
  buildSeoMetadata,
  fetchPublicSportsProfile,
  getSiteBaseUrl,
} from '@/lib/public-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; profileSlug: string }>;
}) {
  const { locale: rawLocale, profileSlug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const profile = await fetchPublicSportsProfile(profileSlug);
  const sportName =
    locale === 'bn'
      ? profile.activeSport.sportNameBn
      : profile.activeSport.sportNameEn;
  const area =
    locale === 'bn'
      ? `${profile.location.upazila.nameBn}, ${profile.location.district.nameBn}`
      : `${profile.location.upazila.nameEn}, ${profile.location.district.nameEn}`;

  const title = `${profile.name} (${sportName}) — ${area} | PlayerHaat`;
  const description =
    profile.activeSport.headline ||
    profile.bio ||
    `${profile.name} · ${sportName} player in ${area}`;

  return buildSeoMetadata({
    locale,
    path: `/p/${profile.slug}`,
    title,
    description,
    ogImage: `${getSiteBaseUrl()}/${locale}/p/${profile.slug}/opengraph-image`,
  });
}

export default async function PublicSportsProfilePage({
  params,
}: {
  params: Promise<{ locale: string; profileSlug: string }>;
}) {
  const { locale: rawLocale, profileSlug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });
  const profile = await fetchPublicSportsProfile(profileSlug);

  const siteUrl = getSiteBaseUrl();
  const shareUrl = `${siteUrl}/${locale}/p/${profile.slug}`;

  const areaFull =
    locale === 'bn'
      ? [
          profile.location.union?.nameBn,
          profile.location.upazila.nameBn,
          profile.location.district.nameBn,
        ]
          .filter(Boolean)
          .join(', ')
      : [
          profile.location.union?.nameEn,
          profile.location.upazila.nameEn,
          profile.location.district.nameEn,
        ]
          .filter(Boolean)
          .join(', ');

  const active = profile.activeSport;
  const activeSportLabel =
    locale === 'bn' ? active.sportNameBn : active.sportNameEn;

  const skillKey = `skill${Math.min(5, Math.max(1, active.skillLevel))}` as
    | 'skill1'
    | 'skill2'
    | 'skill3'
    | 'skill4'
    | 'skill5';

  const travelKey =
    active.travelRadius === 'UNION'
      ? 'travelUnion'
      : active.travelRadius === 'UPAZILA'
        ? 'travelUpazila'
        : 'travelDistrict';

  // Schema.org JSON-LD (`Person`)
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: shareUrl,
    description: active.headline || profile.bio || undefined,
    jobTitle: `${active.sportNameEn} Player`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.upazila.nameEn,
      addressRegion: profile.location.district.nameEn,
      addressCountry: 'BD',
    },
    ...(profile.rating.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: profile.rating.average,
            reviewCount: profile.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Top Hero Card — 1:1 with Flutter `PlayerProfileScreen._Body` */}
      <PhCard className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <PhAvatar
            name={profile.name}
            url={profile.avatarUrl}
            size={104}
            verified={profile.verifiedBadge}
          />

          <div className="mt-3 inline-flex items-center gap-2">
            <PhBadge tone="accent">{activeSportLabel}</PhBadge>
            <PhBadge>
              {t(skillKey)} · {formatNumber(active.skillLevel, locale)}/
              {formatNumber(5, locale)}
            </PhBadge>
          </div>

          <h1 className="mt-3 tx-title1">{profile.name}</h1>
          <p className="mt-1 inline-flex items-center gap-1.5 tx-subhead">
            <MapPin className="h-4 w-4 text-[var(--ph-accent)]" />
            <span>{areaFull}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {profile.rating.count > 0 ? (
              <div className="inline-flex items-center gap-2">
                <RatingStars value={profile.rating.average} size={18} />
                <span className="tx-subhead-strong text-[var(--ph-text)]">
                  {formatDecimal1(profile.rating.average, locale)} (
                  {formatNumber(profile.rating.count, locale)})
                </span>
              </div>
            ) : (
              <span className="tx-subhead">{t('noRatingsYet')}</span>
            )}
          </div>

          <p className="mt-2 tx-caption">
            {t('memberSince', {
              date: formatDate(profile.memberSince, locale),
            })}
          </p>
        </div>

        {/* Links to Player's other sports profiles */}
        {profile.otherSports.length > 0 && (
          <div className="mt-6 border-t-[0.5px] border-[var(--ph-border)] pt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="tx-caption font-semibold">
              {t('otherSportsByPlayer', { name: profile.name })}:
            </span>
            {profile.otherSports.map((other) => (
              <Link key={other.profileSlug} href={`/p/${other.profileSlug}`}>
                <PhChip
                  label={locale === 'bn' ? other.sportNameBn : other.sportNameEn}
                  dense
                />
              </Link>
            ))}
          </div>
        )}
      </PhCard>

      {/* Open in App + Recruiter Contact Actions (Visible only to logged-in recruiters) */}
      <PublicProfileRecruiterActions
        profileId={profile.slug}
        playerName={profile.name}
        shareUrl={shareUrl}
      />

      {/* About Bio */}
      {profile.bio && (
        <PhCard>
          <div className="tx-subhead-strong text-[var(--ph-text)]">
            {t('aboutLabel')}
          </div>
          <p className="mt-2 tx-body text-[var(--ph-text-secondary)]">
            {profile.bio}
          </p>
        </PhCard>
      )}

      {/* Sport Profile Detail Card (`_SportCard` parity) */}
      <div>
        <PhSectionHeader title={`${activeSportLabel} · ${t('sportsLabel')}`} />
        <PhCard className="space-y-4">
          {active.headline && (
            <div className="tx-headline text-[var(--ph-text)]">
              {active.headline}
            </div>
          )}

          {/* Positions */}
          <div className="flex flex-wrap gap-2">
            {active.positions.map((pos) => (
              <PhChip
                key={pos.code}
                label={locale === 'bn' ? pos.nameBn : pos.nameEn}
                selected
                dense
              />
            ))}
          </div>

          {/* Stats Badges */}
          {active.statsLabels.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {active.statsVerified && (
                <PhBadge
                  tone="accent"
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  {t('statsVerifiedBadge')}
                </PhBadge>
              )}
              {active.statsLabels.map((field) => {
                const rawVal = active.stats[field.key];
                if (rawVal === undefined) return null;
                const label = locale === 'bn' ? field.nameBn : field.nameEn;
                const formatted = field.decimal
                  ? formatDecimal1(rawVal, locale)
                  : formatNumber(rawVal, locale);
                return (
                  <PhBadge key={field.key}>
                    {label}: {formatted}
                  </PhBadge>
                );
              })}
            </div>
          )}

          {/* Achievements */}
          {active.achievements.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="tx-subhead-strong text-[var(--ph-text)]">
                {t('achievementsLabel')}
              </div>
              {active.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-start gap-2 tx-footnote text-[var(--ph-text-secondary)]"
                >
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ph-accent)]" />
                  <span>
                    <strong className="font-semibold text-[var(--ph-text)]">
                      {ach.title}
                    </strong>
                    {ach.year ? ` · ${formatNumber(ach.year, locale)}` : ''}
                    {ach.description ? ` — ${ach.description}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Key Metadata lines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t-[0.5px] border-[var(--ph-border)] pt-4 tx-footnote">
            {(active.experienceYears !== null || active.currentTeam) && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[var(--ph-text-tertiary)]" />
                <span>
                  {[
                    active.experienceYears !== null
                      ? t('yearsExperience', {
                          n: formatNumber(active.experienceYears, locale),
                        })
                      : null,
                    active.currentTeam,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            )}

            {active.khepAvailable && (
              <div className="flex items-center gap-2 font-semibold text-[var(--ph-accent)]">
                <Wallet className="h-4 w-4" />
                <span>
                  {active.rateMin != null || active.rateMax != null
                    ? t('khepRate', {
                        range: formatMoneyRange(
                          active.rateMin,
                          active.rateMax,
                          locale,
                        ),
                      })
                    : `${t('khepAvailable')} · ${t('negotiableRate')}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--ph-text-tertiary)]" />
              <span>{t(travelKey)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--ph-text-tertiary)]" />
              <span>
                {Object.keys(active.availability).length > 0
                  ? Object.entries(active.availability)
                      .map(([d, slots]) => `${d.toUpperCase()}: ${slots.join(', ')}`)
                      .join(' · ')
                  : t('noAvailability')}
              </span>
            </div>
          </div>
        </PhCard>
      </div>

      {/* Videos */}
      {profile.media.filter((m) => m.type === 'VIDEO_LINK').length > 0 && (
        <div>
          <PhSectionHeader title={t('videosLabel')} />
          <PhGroup>
            {profile.media
              .filter((m) => m.type === 'VIDEO_LINK')
              .map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <PhRow
                    icon={<Play className="h-4 w-4" />}
                    title="YouTube Highlight"
                    subtitle={video.url}
                    trailing={<ExternalLink className="h-4 w-4 text-[var(--ph-text-tertiary)]" />}
                    chevron={false}
                  />
                </a>
              ))}
          </PhGroup>
        </div>
      )}

      {/* Reviews */}
      <div>
        <PhSectionHeader title={t('reviewsLabel')} />
        {profile.reviews.length === 0 ? (
          <PhCard>
            <p className="tx-subhead">{t('noReviews')}</p>
          </PhCard>
        ) : (
          <div className="space-y-3">
            {profile.reviews.map((rev) => (
              <PhCard key={rev.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PhAvatar name={rev.raterName} size={36} />
                    <div>
                      <div className="tx-subhead-strong text-[var(--ph-text)]">
                        {rev.raterName}
                      </div>
                      <div className="tx-caption">
                        {locale === 'bn' ? rev.sportNameBn : rev.sportNameEn} ·{' '}
                        {formatDate(rev.matchDate, locale)}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[var(--ph-star)]">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="tx-subhead-strong text-[var(--ph-text)]">
                      {formatDecimal1(rev.overall, locale)}
                    </span>
                  </div>
                </div>
                {rev.comment && (
                  <p className="tx-body text-[var(--ph-text-secondary)]">
                    {rev.comment}
                  </p>
                )}
              </PhCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

