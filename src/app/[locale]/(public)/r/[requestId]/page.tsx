import React from 'react';
import {
  Calendar,
  FileText,
  MapPin,
  Users,
  Wallet,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import {
  PhAvatar,
  PhBadge,
  PhCard,
  PhGroup,
  PhRow,
  RatingPill,
} from '@/design-system';
import { PublicRequestActions } from '@/components/public/public-request-actions';
import {
  formatDate,
  formatDateShort,
  formatMoneyRange,
  formatRatingText,
  formatTime,
} from '@/lib/format';
import {
  buildSeoMetadata,
  fetchPublicRequestDetail,
  getSiteBaseUrl,
} from '@/lib/public-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; requestId: string }>;
}) {
  const { locale: rawLocale, requestId } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const req = await fetchPublicRequestDetail(requestId);

  const sportLabel = locale === 'bn' ? req.sport.nameBn : req.sport.nameEn;
  const area =
    locale === 'bn'
      ? `${req.location.upazila.nameBn}, ${req.location.district.nameBn}`
      : `${req.location.upazila.nameEn}, ${req.location.district.nameEn}`;

  const title = `${sportLabel} Match in ${area} — ${req.venueText} | PlayerHaat`;
  const description = `${sportLabel} match on ${formatDate(req.matchAt, locale)} at ${req.venueText}, ${area}.`;

  return buildSeoMetadata({
    locale,
    path: `/r/${req.id}`,
    title,
    description,
  });
}

export default async function PublicRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; requestId: string }>;
}) {
  const { locale: rawLocale, requestId } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });
  const req = await fetchPublicRequestDetail(requestId);

  const siteUrl = getSiteBaseUrl();
  const shareUrl = `${siteUrl}/${locale}/r/${req.id}`;

  const sportName = locale === 'bn' ? req.sport.nameBn : req.sport.nameEn;
  const whenShort = `${formatDateShort(req.matchAt, locale)} · ${formatTime(req.matchAt, locale)}`;
  const whenFull = `${formatDate(req.matchAt, locale)} · ${formatTime(req.matchAt, locale)}`;
  const areaFull =
    locale === 'bn'
      ? [
          req.location.union?.nameBn,
          req.location.upazila.nameBn,
          req.location.district.nameBn,
        ]
          .filter(Boolean)
          .join(', ')
      : [
          req.location.union?.nameEn,
          req.location.upazila.nameEn,
          req.location.district.nameEn,
        ]
          .filter(Boolean)
          .join(', ');

  const budgetRange = req.isPaid
    ? formatMoneyRange(req.budgetMin, req.budgetMax, locale, (amt) =>
        t('upTo', { amount: amt }),
      )
    : '';

  const positionsText =
    req.positionsNeeded.length === 0
      ? t('anyPosition')
      : req.positionsNeeded
          .map((p) => (locale === 'bn' ? p.nameBn : p.nameEn))
          .join(', ');

  const statusTone =
    req.status === 'OPEN'
      ? 'accent'
      : req.status === 'FILLED'
        ? 'warning'
        : req.status === 'CANCELLED'
          ? 'danger'
          : 'neutral';

  const statusLabel =
    req.status === 'OPEN'
      ? t('statusOpen')
      : req.status === 'FILLED'
        ? t('statusFilled')
        : req.status === 'CANCELLED'
          ? t('statusCancelled')
          : t('statusCompleted');

  // Schema.org JSON-LD (`SportsEvent`)
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: req.title || `${req.sport.nameEn} Match — ${req.venueText}`,
    startDate: req.matchAt,
    eventStatus:
      req.status === 'CANCELLED'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: req.venueText,
      address: {
        '@type': 'PostalAddress',
        addressLocality: req.location.upazila.nameEn,
        addressRegion: req.location.district.nameEn,
        addressCountry: 'BD',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: req.captain.organization || req.captain.name,
    },
    ...(req.isPaid && (req.budgetMin != null || req.budgetMax != null)
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BDT',
            price: req.budgetMax ?? req.budgetMin ?? 0,
            availability:
              req.status === 'OPEN'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* Header Summary Card — 1:1 with Flutter `RequestDetailScreen._Body` */}
      <PhCard className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <PhBadge tone={statusTone}>{statusLabel}</PhBadge>
          {req.kind === 'EVENT' && (
            <PhBadge tone="accent">{t('eventLabel')}</PhBadge>
          )}
          <span className="tx-subhead">
            {sportName} ·{' '}
            {req.isPaid
              ? budgetRange || t('paidGame')
              : t('freeGame')}
          </span>
        </div>

        <h1 className="tx-title1">
          {req.title || `${sportName} — ${whenShort}`}
        </h1>

        <p className="tx-subhead text-[var(--ph-text-secondary)]">
          {req.venueText} · {areaFull}
        </p>
      </PhCard>

      {/* Match Details Group */}
      <PhGroup header={t('aboutMatch')}>
        <PhRow
          icon={<Calendar className="h-4 w-4" />}
          title={t('labelWhen')}
          subtitle={whenFull}
          chevron={false}
        />
        <PhRow
          icon={<MapPin className="h-4 w-4" />}
          title={t('labelWhere')}
          subtitle={`${req.venueText} — ${areaFull}`}
          chevron={false}
        />
        <PhRow
          icon={<Users className="h-4 w-4" />}
          title={t('labelNeeded')}
          subtitle={`${t('playersNeededCount', { count: req.playersNeeded })} · ${t('spotsLeftCount', { count: req.spotsLeft })} · ${positionsText}`}
          chevron={false}
        />
        {req.isPaid && (
          <PhRow
            icon={<Wallet className="h-4 w-4" />}
            title={t('labelBudget')}
            subtitle={budgetRange || t('negotiable')}
            chevron={false}
          />
        )}
        {req.notes && (
          <PhRow
            icon={<FileText className="h-4 w-4" />}
            title={t('labelNotes')}
            subtitle={req.notes}
            chevron={false}
          />
        )}
      </PhGroup>

      {/* Captain / Recruiter Card */}
      <PhCard className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PhAvatar
            name={req.captain.name}
            url={req.captain.avatarUrl}
            size={48}
            verified={req.captain.recruiterVerified}
          />
          <div>
            <div className="tx-headline">{req.captain.name}</div>
            <div className="tx-caption">
              {req.captain.organization || t('labelCaptain')}
            </div>
          </div>
        </div>
        <RatingPill
          average={req.captain.rating.average}
          count={req.captain.rating.count}
          format={(a, n) => formatRatingText(a, n, locale)}
          emptyLabel={t('newPlayerLabel')}
        />
      </PhCard>

      {/* Open in App + Apply Action */}
      <PublicRequestActions
        requestId={req.id}
        sportName={sportName}
        whenText={whenShort}
        whereText={areaFull}
        shareUrl={shareUrl}
        isPaid={req.isPaid}
        offeredBudgetText={budgetRange}
        status={req.status}
      />
    </div>
  );
}

