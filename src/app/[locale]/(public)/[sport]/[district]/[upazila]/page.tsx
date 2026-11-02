import React from 'react';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link, type AppLocale } from '@/i18n/routing';
import { PhAvatar, PhBadge, PhCard, RatingPill } from '@/design-system';
import { formatDate, formatMoneyRange, formatTime } from '@/lib/format';
import { buildSeoMetadata, fetchPlayersInArea, fetchPublicSports, fetchRequestsInArea, resolveArea } from '@/lib/public-data';

type Params = Promise<{ locale: string; sport: string; district: string; upazila: string }>;
const loc = (l: string) => (l === 'en' ? 'en' : 'bn') as AppLocale;

async function load(p: { sport: string; district: string; upazila: string }) {
  const sports = await fetchPublicSports();
  const sport = sports.find((s) => s.code.toLowerCase() === p.sport.toLowerCase());
  const area = sport ? await resolveArea(p.district, p.upazila) : null;
  return { sport, area };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale: raw, ...rest } = await params;
  const locale = loc(raw);
  const { sport, area } = await load(rest);
  if (!sport || !area) return { title: 'PlayerHaat', robots: { index: false } };
  const s = locale === 'bn' ? sport.nameBn : sport.nameEn;
  const place = locale === 'bn' ? `${area.upazila.nameBn}, ${area.district.nameBn}` : `${area.upazila.nameEn}, ${area.district.nameEn}`;
  return buildSeoMetadata({
    locale,
    path: `/${sport.code.toLowerCase()}/${rest.district}/${rest.upazila}`,
    title: locale === 'bn' ? `${place} — ${s} খেলোয়াড় ও ম্যাচ | PlayerHaat` : `${s} players & games in ${place} | PlayerHaat`,
    description: locale === 'bn' ? `${place}-এর ${s} খেলোয়াড় ও খোলা ম্যাচ।` : `Find ${s} players and open games in ${place}.`,
  });
}

export default async function LocationLandingPage({ params }: { params: Params }) {
  const { locale: raw, ...rest } = await params;
  const locale = loc(raw);
  const t = await getTranslations({ locale });
  const { sport, area } = await load(rest);
  if (!sport || !area) notFound();
  const [players, requests] = await Promise.all([fetchPlayersInArea(sport.id, area), fetchRequestsInArea(sport.id, area)]);
  const name = (n: { nameBn: string; nameEn: string }) => (locale === 'bn' ? n.nameBn : n.nameEn);
  const place = `${name(area.upazila)}, ${name(area.district)}`;
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="tx-title1">{name(sport)} · {place}</h1>
        <p className="mt-1 inline-flex items-center gap-1 tx-subhead"><MapPin className="h-4 w-4" aria-hidden />{place}</p>
      </header>
      <section>
        <h2 className="tx-title3 mb-3">{t('tabPlayers')}</h2>
        {players.length === 0 ? (
          <p className="tx-subhead">{t('searchEmptyTitle')}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {players.map((p) => (
              <Link key={p.id} href={`/p/${p.id}`}>
                <PhCard paddingClassName="p-4">
                  <div className="flex items-center gap-3">
                    <PhAvatar name={p.name} url={p.avatarUrl} size={48} verified={p.verifiedBadge} />
                    <div className="min-w-0 flex-1"><div className="tx-headline truncate">{p.name}</div><RatingPill average={p.rating.average} count={p.rating.count} emptyLabel={t('newPlayerLabel')} /></div>
                  </div>
                </PhCard>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="tx-title3 mb-3">{t('homeNearby')}</h2>
        {requests.length === 0 ? (
          <p className="tx-subhead">{t('homeEmptyTitle')}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((r) => (
              <Link key={r.id} href={`/r/${r.id}`}>
                <PhCard paddingClassName="p-4">
                  <div className="tx-headline">{r.title ?? `${formatDate(r.matchAt, locale)} · ${formatTime(r.matchAt, locale)}`}</div>
                  <div className="tx-subhead">{r.venueText}</div>
                  <div className="mt-2"><PhBadge tone={r.isPaid ? 'accent' : 'neutral'} label={r.isPaid ? formatMoneyRange(r.budgetMin, r.budgetMax, locale) || t('paidGame') : t('freeGame')} /></div>
                </PhCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
