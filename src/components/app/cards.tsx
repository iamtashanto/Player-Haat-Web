'use client';

import React from 'react';
import { Flag, MapPin, Sparkles, Trophy } from 'lucide-react';
import { PhAvatar, PhBadge, PhCard, RatingPill } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useSportsCatalog, type SportCatalogItem } from '@/lib/player-api';
import type { PlayerRequest } from '@/lib/api/requests';
import { useToggleShortlistHeart, type PlayerCard } from '@/lib/api/social';
import { ShortlistHeart } from '@/components/shared/domain-cards';
import { useFmt } from './kit';

type Named = { nameBn: string; nameEn: string };

export function useSports() {
  const q = useSportsCatalog();
  const { name } = useFmt();
  const sports = q.data ?? [];
  return {
    ...q,
    sports,
    sportName: (s?: Named | null) => name(s),
    sportById: (id?: number | null): SportCatalogItem | undefined => sports.find((s) => s.id === id),
    positionNames: (sportId: number | undefined, codes: string[]) => {
      const sport = sports.find((s) => s.id === sportId);
      return codes.map((c) => name(sport?.positions.find((p) => p.code === c)) || c).join(', ');
    },
  };
}

export const requestTone = (status: string) =>
  status === 'OPEN' ? 'accent' : status === 'CANCELLED' ? 'danger' : 'neutral';

export function statusKey(status: string): string {
  return { OPEN: 'statusOpen', FILLED: 'statusFilled', CANCELLED: 'statusCancelled', COMPLETED: 'statusCompleted' }[status] ?? 'statusOpen';
}

/** One "player needed" post in a list. Tap opens the request. */
export function RequestCard({ request: r, trailing, showCaptain = true }: { request: PlayerRequest; trailing?: React.ReactNode; showCaptain?: boolean }) {
  const { t, name, money, date, time, num, locale } = useFmt();
  const router = useRouter();
  const { positionNames } = useSports();
  const isEvent = r.kind === 'EVENT';
  const when = `${date(r.matchAt)} · ${time(r.matchAt)}`;
  const positions = r.positionsNeeded.length ? positionNames(r.sport.id, r.positionsNeeded) : t('anyPosition');
  const budget = r.isPaid
    ? r.budgetMin != null && r.budgetMax != null
      ? `${money(r.budgetMin)}–${num(r.budgetMax)}`
      : r.budgetMax != null
        ? t('upTo', { amount: money(r.budgetMax) })
        : r.budgetMin != null
          ? `${money(r.budgetMin)}+`
          : t('paidGame')
    : '';
  const open = r.status === 'OPEN';

  return (
    <PhCard onTap={() => router.push(`/request/${r.id}`)} semanticLabel={`${name(r.sport)}, ${when}, ${r.venueText}`} paddingClassName="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]">
          <Trophy className="h-[22px] w-[22px]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="tx-headline truncate text-[var(--ph-text)]">{isEvent && r.title ? r.title : when}</div>
          <div className="tx-subhead truncate">{isEvent ? `${when} · ${name(r.sport)}` : `${name(r.sport)} · ${positions}`}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isEvent && <PhBadge tone="accent" icon={<Flag className="h-3 w-3" />} label={t('eventLabel')} />}
        {!open ? <PhBadge tone={requestTone(r.status)} label={t(statusKey(r.status))} /> : r.isPaid ? <PhBadge tone="accent" label={budget} /> : <PhBadge label={t('freeGame')} />}
        {r.boostedUntil && <PhBadge tone="warning" icon={<Sparkles className="h-3 w-3" />} label={t('featuredTitle')} />}
        {open && (
          <span className="tx-footnote text-[var(--ph-text-secondary)]">
            {isEvent && r.interested.count > 0 ? t('interestedCount', { n: num(r.interested.count) }) : t('spotsLeftCount', { count: r.spotsLeft })}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[var(--ph-text-tertiary)]">
        <MapPin className="h-[15px] w-[15px] shrink-0" aria-hidden />
        <span className="tx-footnote truncate">
          {r.venueText} · {name(r.location.upazila)}, {name(r.location.district)}
        </span>
      </div>
      {(showCaptain || trailing) && (
        <div className="mt-3 flex items-center gap-2 border-t-[0.5px] border-[var(--ph-border)] pt-3">
          {showCaptain && (
            <>
              <PhAvatar name={r.captain.name} url={r.captain.avatarUrl} size={26} />
              <span className="tx-footnote min-w-0 truncate text-[var(--ph-text)]">{r.captain.name}</span>
              <RatingPill average={r.captain.rating.average} count={r.captain.rating.count} emptyLabel={t('newPlayerLabel')} />
            </>
          )}
          <span className="ml-auto">{trailing}</span>
        </div>
      )}
      <span className="sr-only">{locale}</span>
    </PhCard>
  );
}

/** One player in search results / shortlist / viewers. */
export function PlayerTile({ player: p, sportId, compact }: { player: PlayerCard; sportId?: number; compact?: boolean }) {
  const { t, name, money, num } = useFmt();
  const router = useRouter();
  const { sportById, positionNames } = useSports();
  const { activeRole } = useAuth();
  const heart = useToggleShortlistHeart();
  const entry = p.sports.find((s) => s.sportId === sportId) ?? p.sports[0];
  const sport = sportById(entry?.sportId);
  const bits = [
    sport ? name(sport) : '',
    entry?.positions.length ? positionNames(entry.sportId, entry.positions.slice(0, 2)) : '',
    entry?.experienceYears != null ? t('yearsShort', { n: num(entry.experienceYears) }) : '',
  ].filter(Boolean);
  const rate = entry?.khepAvailable
    ? entry.rateMin != null && entry.rateMax != null
      ? `${money(entry.rateMin)}–${num(entry.rateMax)}`
      : entry.rateMin != null
        ? `${money(entry.rateMin)}+`
        : entry.rateMax != null
          ? t('upTo', { amount: money(entry.rateMax) })
          : t('filterPaid')
    : null;

  return (
    <PhCard onTap={() => router.push(`/player/${p.id}`)} semanticLabel={p.name} paddingClassName={compact ? 'p-3' : 'p-4'}>
      <div className="flex items-center gap-3">
        <PhAvatar name={p.name} url={p.avatarUrl} size={compact ? 48 : 56} verified={p.verifiedBadge} />
        <div className="min-w-0 flex-1">
          <div className="tx-headline truncate text-[var(--ph-text)]">{p.name}</div>
          {bits.length > 0 && <div className="tx-subhead truncate">{bits.join(' · ')}</div>}
          <div className="mt-1 flex items-center gap-3">
            <RatingPill average={p.rating.average} count={p.rating.count} emptyLabel={t('newPlayerLabel')} />
            <span className="inline-flex min-w-0 items-center gap-1 text-[var(--ph-text-tertiary)]">
              <MapPin className="h-[13px] w-[13px] shrink-0" aria-hidden />
              <span className="tx-footnote truncate">{name(p.location.upazila)}</span>
            </span>
          </div>
        </div>
        {rate && <PhBadge tone="accent" label={rate} />}
        {activeRole === 'RECRUITER' && (
          <span onClick={(e) => e.stopPropagation()}>
            <ShortlistHeart
              key={String(p.shortlisted)}
              initialSaved={p.shortlisted}
              onToggle={(saved) =>
                heart.mutate(
                  { profileId: p.id, saved },
                  { onSuccess: () => undefined },
                )
              }
            />
          </span>
        )}
      </div>
    </PhCard>
  );
}
