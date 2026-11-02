import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhBadge,
  PhButton,
  PhCard,
  PhIllustration,
  PhRadius,
  PhSectionHeader,
  PitchBackdrop,
} from '@/design-system';
import { PhAvatar, RatingPill } from '@/design-system';
import { formatDate, formatMoneyRange, formatTime } from '@/lib/format';
import {
  areaPath,
  buildSeoMetadata,
  fetchOpenRequests,
  fetchPublicSports,
  fetchTopPlayers,
  listActiveAreas,
} from '@/lib/public-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  return buildSeoMetadata({
    locale,
    path: '/',
    title: `${t('appName')} — ${t('authHeadline')}`,
    description: t('authSubhead'),
  });
}

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  const sports = await fetchPublicSports();
  const [players, requests, areas] = await Promise.all([fetchTopPlayers(6), fetchOpenRequests(6), listActiveAreas(sports, 30)]);
  const name = (n: { nameBn: string; nameEn: string }) => (locale === 'bn' ? n.nameBn : n.nameEn);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[28px] border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)] p-6 sm:p-10 md:p-14 shadow-xs">
        <PitchBackdrop className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--ph-accent-soft)] px-3.5 py-1.5 text-[var(--ph-accent)] tx-caption font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('webTagline')}</span>
            </div>

            <h1 className="tx-large-title sm:text-[40px] sm:leading-[1.15] tracking-tight text-[var(--ph-text)]">
              {t('authHeadline')}
            </h1>

            <p className="max-w-2xl tx-body text-[var(--ph-text-secondary)] sm:text-[17px]">
              {t('authSubhead')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/auth">
                <PhButton
                  label={`${t('getStarted')} — ${t('accountTypePlayer')}`}
                  variant="primary"
                  size="large"
                  expand={false}
                  icon={<Trophy className="h-5 w-5" />}
                />
              </Link>
              <Link href="/auth">
                <PhButton
                  label={`${t('searchTitle')} — ${t('accountTypeRecruiter')}`}
                  variant="secondary"
                  size="large"
                  expand={false}
                  icon={<Users className="h-5 w-5" />}
                />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 tx-footnote">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--ph-accent)]" />
                <span>{t('verifiedPlayer')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
                <span>{t('khepAvailable')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--ph-accent)]" />
                <span>{t('anywhere')}</span>
              </span>
            </div>
          </div>

          {/* Right side 3 onboarding value cards matching Flutter's OnboardingScreen */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-3.5">
            <GlassContainer radius={PhRadius.lg} className="p-4 flex items-center gap-4">
              <PhIllustration kind="find" size={72} />
              <div>
                <h2 className="tx-headline">{t('onbFindTitle')}</h2>
                <p className="mt-1 tx-footnote">{t('onbFindBody')}</p>
              </div>
            </GlassContainer>

            <GlassContainer radius={PhRadius.lg} className="p-4 flex items-center gap-4">
              <PhIllustration kind="hire" size={72} />
              <div>
                <h2 className="tx-headline">{t('onbHireTitle')}</h2>
                <p className="mt-1 tx-footnote">{t('onbHireBody')}</p>
              </div>
            </GlassContainer>

            <GlassContainer radius={PhRadius.lg} className="p-4 flex items-center gap-4">
              <PhIllustration kind="rate" size={72} />
              <div>
                <h2 className="tx-headline">{t('onbRateTitle')}</h2>
                <p className="mt-1 tx-footnote">{t('onbRateBody')}</p>
              </div>
            </GlassContainer>
          </div>
        </div>
      </section>

      {/* For Players & For Recruiters Dual Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PhCard className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <PhBadge tone="accent">{t('accountTypePlayer')}</PhBadge>
            <h2 className="mt-3 tx-title2">{t('landingForPlayersTitle')}</h2>
            <p className="mt-2 tx-body text-[var(--ph-text-secondary)]">
              {t('landingForPlayersSubtitle')}
            </p>
          </div>
          <div className="mt-6">
            <Link href="/auth">
              <PhButton
                label={t('createPlayerProfile')}
                variant="primary"
                size="medium"
                expand={false}
              />
            </Link>
          </div>
        </PhCard>

        <PhCard className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <PhBadge tone="warning">{t('accountTypeRecruiter')}</PhBadge>
            <h2 className="mt-3 tx-title2">{t('landingForRecruitersTitle')}</h2>
            <p className="mt-2 tx-body text-[var(--ph-text-secondary)]">
              {t('landingForRecruitersSubtitle')}
            </p>
          </div>
          <div className="mt-6">
            <Link href="/auth">
              <PhButton
                label={t('recruiterSetupTitle')}
                variant="secondary"
                size="medium"
                expand={false}
              />
            </Link>
          </div>
        </PhCard>
      </section>

      {players.length > 0 && (
        <section>
          <PhSectionHeader title={t('homeFeatured')} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {players.map((p) => (
              <Link key={p.id} href={`/p/${p.id}`} className="block focus:outline-none">
                <PhCard paddingClassName="p-4">
                  <div className="flex items-center gap-3">
                    <PhAvatar name={p.name} url={p.avatarUrl} size={52} verified={p.verifiedBadge} />
                    <div className="min-w-0 flex-1">
                      <div className="tx-headline truncate">{p.name}</div>
                      <div className="tx-footnote truncate">{name(p.location.upazila)}, {name(p.location.district)}</div>
                      <RatingPill average={p.rating.average} count={p.rating.count} emptyLabel={t('newPlayerLabel')} />
                    </div>
                  </div>
                </PhCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {requests.length > 0 && (
        <section>
          <PhSectionHeader title={t('homeNearby')} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {requests.map((r) => (
              <Link key={r.id} href={`/r/${r.id}`} className="block focus:outline-none">
                <PhCard paddingClassName="p-4">
                  <div className="tx-headline">{r.title ?? `${formatDate(r.matchAt, locale)} · ${formatTime(r.matchAt, locale)}`}</div>
                  <div className="tx-subhead">{name(r.sport)} · {r.venueText}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <PhBadge tone={r.isPaid ? 'accent' : 'neutral'}>{r.isPaid ? formatMoneyRange(r.budgetMin, r.budgetMax, locale) || t('paidGame') : t('freeGame')}</PhBadge>
                    <PhBadge>{t('spotsLeftCount', { count: r.spotsLeft })}</PhBadge>
                  </div>
                </PhCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {areas.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="tx-title2">{t('landingBrowseByAreaTitle')}</h2>
            <p className="mt-1 tx-subhead">{t('landingBrowseByAreaSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <Link key={areaPath(a)} href={areaPath(a)}>
                <PhCard className="flex items-center justify-between transition-colors hover:border-[var(--ph-accent)]">
                  <div>
                    <div className="tx-caption font-semibold uppercase tracking-wider text-[var(--ph-accent)]">{name(a.sport)}</div>
                    <div className="mt-0.5 tx-headline">{name(a.upazila)}, {name(a.district)}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
                </PhCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mobile App Download Banner (Play Store + App Store coming soon) */}
      <section>
        <GlassContainer radius={PhRadius.xl} className="p-6 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[var(--ph-accent)] tx-caption font-semibold uppercase tracking-wider">
                <Smartphone className="h-4 w-4" />
                <span>{t('downloadApp')}</span>
              </div>
              <h2 className="tx-title2">{t('openInAppBannerTitle')}</h2>
              <p className="tx-subhead">{t('openInAppBannerBody')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.playerhaat.playerhaat"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PhButton
                  label={t('landingPlayStoreCta')}
                  variant="primary"
                  size="medium"
                  expand={false}
                />
              </a>
              <PhButton
                label={t('landingAppStoreSoon')}
                variant="secondary"
                size="medium"
                expand={false}
                disabled
              />
            </div>
          </div>
        </GlassContainer>
      </section>
    </div>
  );
}
