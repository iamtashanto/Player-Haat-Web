import React from 'react';
import { notFound } from 'next/navigation';
import { Flag, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { PhAvatar, PhBadge, PhCard } from '@/design-system';
import { OpenInApp } from '@/components/public/open-in-app';
import { formatDate, formatMoneyRange, formatTime } from '@/lib/format';
import { buildSeoMetadata, fetchPublicRequest, getSiteBaseUrl } from '@/lib/public-data';

type Params = Promise<{ locale: string; requestId: string }>;
const loc = (l: string) => (l === 'en' ? 'en' : 'bn') as AppLocale;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale: raw, requestId } = await params;
  const locale = loc(raw);
  const r = await fetchPublicRequest(requestId);
  if (!r) return { title: 'PlayerHaat', robots: { index: false } };
  const sport = locale === 'bn' ? r.sport.nameBn : r.sport.nameEn;
  const place = locale === 'bn' ? `${r.location.upazila.nameBn}, ${r.location.district.nameBn}` : `${r.location.upazila.nameEn}, ${r.location.district.nameEn}`;
  return buildSeoMetadata({ locale, path: `/r/${r.id}`, title: `${r.title ?? sport} — ${place} | PlayerHaat`, description: r.notes ?? `${sport} · ${r.venueText} · ${place}` });
}

export default async function PublicRequestPage({ params }: { params: Params }) {
  const { locale: raw, requestId } = await params;
  const locale = loc(raw);
  const t = await getTranslations({ locale });
  const r = await fetchPublicRequest(requestId);
  if (!r) notFound();
  const name = (n: { nameBn: string; nameEn: string }) => (locale === 'bn' ? n.nameBn : n.nameEn);
  const place = `${name(r.location.upazila)}, ${name(r.location.district)}`;
  const budget = r.isPaid ? formatMoneyRange(r.budgetMin, r.budgetMax, locale) || t('paidGame') : t('freeGame');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: r.title ?? `${r.sport.nameEn} — ${r.location.upazila.nameEn}`,
    startDate: r.matchAt,
    eventStatus: r.status === 'CANCELLED' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: r.venueText, address: `${r.location.upazila.nameEn}, ${r.location.district.nameEn}, Bangladesh` },
    url: `${getSiteBaseUrl()}/${locale}/r/${r.id}`,
  };
  return (
    <article className="mx-auto max-w-2xl space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="flex flex-wrap items-center gap-2">
        {r.kind === 'EVENT' && <PhBadge tone="accent" icon={<Flag className="h-3 w-3" />} label={t('eventLabel')} />}
        <PhBadge tone={r.status === 'OPEN' ? 'accent' : 'neutral'} label={t({ OPEN: 'statusOpen', FILLED: 'statusFilled', CANCELLED: 'statusCancelled', COMPLETED: 'statusCompleted' }[r.status])} />
        <PhBadge label={budget} />
      </div>
      <h1 className="tx-title1">{r.title ?? name(r.sport)}</h1>
      <PhCard paddingClassName="p-4">
        <p className="tx-body">{formatDate(r.matchAt, locale)} · {formatTime(r.matchAt, locale)}</p>
        <p className="mt-1 inline-flex items-center gap-1 tx-subhead"><MapPin className="h-4 w-4" aria-hidden />{r.venueText} · {place}</p>
        <p className="mt-2 tx-footnote">{t('playersNeededCount', { count: r.playersNeeded })}{r.status === 'OPEN' ? ` · ${t('spotsLeftCount', { count: r.spotsLeft })}` : ''}</p>
        {r.notes && <p className="mt-3 tx-body whitespace-pre-line">{r.notes}</p>}
      </PhCard>
      <div className="flex items-center gap-3">
        <PhAvatar name={r.captain.name} url={r.captain.avatarUrl} size={40} verified={r.captain.recruiterVerified} />
        <span className="tx-subhead-strong">{r.captain.name}</span>
      </div>
      <OpenInApp appHref={`/request/${r.id}`} backHref={`/r/${r.id}`} />
    </article>
  );
}
