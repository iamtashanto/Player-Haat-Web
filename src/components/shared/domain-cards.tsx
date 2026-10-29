'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Sparkles, Trophy, DollarSign, Flag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  PhAvatar,
  PhBadge,
  PhCard,
  PhIconButton,
  PhRadius,
  RatingPill,
  showPhToast,
} from '@/design-system';
import { formatMoneyRange, formatRatingText } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';

export interface SamplePlayerCardData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  verifiedBadge?: boolean;
  sportName: string;
  positions: string[];
  experienceYears?: number;
  ratingAverage: number;
  ratingCount: number;
  upazilaName: string;
  districtName?: string;
  khepAvailable?: boolean;
  rateMin?: number | null;
  rateMax?: number | null;
  shortlisted?: boolean;
}

/**
 * Save-for-later heart with spring pop animation matching Flutter's `ShortlistHeart`.
 */
export function ShortlistHeart({
  initialSaved = false,
  onToggle,
}: {
  initialSaved?: boolean;
  onToggle?: (saved: boolean) => void;
}) {
  const t = useTranslations();
  const [saved, setSaved] = useState(initialSaved);
  const [popKey, setPopKey] = useState(0);

  const handleTap = () => {
    const next = !saved;
    setSaved(next);
    setPopKey((k) => k + 1);
    onToggle?.(next);
    showPhToast(next ? t('shortlistSavedToast') : t('shortlistRemovedToast'));
  };

  return (
    <motion.div
      key={popKey}
      initial={popKey > 0 ? { scale: 0.9 } : false}
      animate={{ scale: [1, 1.32, 1] }}
      transition={{ duration: 0.28 }}
      onClick={(e) => e.stopPropagation()}
    >
      <PhIconButton
        icon={
          <Heart
            className="h-5 w-5"
            fill={saved ? 'var(--ph-danger)' : 'none'}
            stroke={saved ? 'var(--ph-danger)' : 'currentColor'}
          />
        }
        semanticLabel={t('shortlistSave')}
        filled={false}
        onPressed={handleTap}
      />
    </motion.div>
  );
}

/**
 * Exact parity with Flutter's `PlayerTile` (`app/lib/shared/widgets/cards.dart`).
 */
export function PlayerTileCard({
  player,
  showShortlist = true,
  onTap,
}: {
  player: SamplePlayerCardData;
  showShortlist?: boolean;
  onTap?: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;

  const bits = [
    player.sportName,
    player.positions.slice(0, 2).join(', '),
    player.experienceYears != null
      ? t('yearsShort', { n: player.experienceYears })
      : null,
  ].filter(Boolean);

  const rateText = formatMoneyRange(player.rateMin, player.rateMax, locale, (amount) =>
    t('upTo', { amount }),
  );

  return (
    <PhCard onTap={onTap} semanticLabel={player.name}>
      <div className="flex items-center gap-3">
        <PhAvatar
          name={player.name}
          url={player.avatarUrl}
          size={56}
          verified={player.verifiedBadge}
        />
        <div className="min-w-0 flex-1">
          <div className="tx-headline truncate text-[var(--ph-text)]">
            {player.name}
          </div>
          {bits.length > 0 && (
            <div className="mt-0.5 tx-subhead truncate">{bits.join(' · ')}</div>
          )}
          <div className="mt-1 flex items-center gap-3">
            <RatingPill
              average={player.ratingAverage}
              count={player.ratingCount}
              format={(a, n) => formatRatingText(a, n, locale)}
              emptyLabel={t('newPlayerLabel')}
            />
            <span className="inline-flex min-w-0 items-center gap-1 tx-footnote">
              <MapPin className="h-[13px] w-[13px] shrink-0 text-[var(--ph-text-tertiary)]" />
              <span className="truncate">
                {player.upazilaName}
                {player.districtName ? `, ${player.districtName}` : ''}
              </span>
            </span>
          </div>
        </div>
        {player.khepAvailable && (
          <PhBadge
            label={rateText || t('filterPaid')}
            tone="accent"
            className="shrink-0"
          />
        )}
        {showShortlist && <ShortlistHeart initialSaved={player.shortlisted} />}
      </div>
    </PhCard>
  );
}

export interface SampleRequestCardData {
  id: string;
  whenText: string;
  sportName: string;
  positionsText: string;
  venueText: string;
  locationShort: string;
  isPaid: boolean;
  budgetMin?: number | null;
  budgetMax?: number | null;
  spotsLeft: number;
  isEvent?: boolean;
  title?: string;
  isBoosted?: boolean;
  captainName: string;
  captainAvatarUrl?: string | null;
  captainRatingAvg: number;
  captainRatingCount: number;
}

/**
 * Exact parity with Flutter's `RequestCard` (`app/lib/shared/widgets/cards.dart`).
 */
export function RequestCardView({
  request,
  onTap,
  trailingNote,
  showCaptain = true,
}: {
  request: SampleRequestCardData;
  onTap?: () => void;
  trailingNote?: React.ReactNode;
  showCaptain?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const r = request;

  const budgetText = r.isPaid
    ? formatMoneyRange(r.budgetMin, r.budgetMax, locale, (amount) =>
        t('upTo', { amount }),
      )
    : '';

  return (
    <PhCard onTap={onTap} semanticLabel={`${r.sportName}, ${r.whenText}, ${r.venueText}`}>
      <div className="flex flex-col items-start">
        <div className="flex w-full items-center gap-3">
          <div
            style={{ borderRadius: `${PhRadius.md}px` }}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]"
          >
            <Trophy className="h-[22px] w-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="tx-headline truncate text-[var(--ph-text)]">
              {r.isEvent && r.title ? r.title : r.whenText}
            </div>
            <div className="mt-0.5 tx-subhead truncate">
              {r.isEvent
                ? `${r.whenText} · ${r.sportName}`
                : `${r.sportName} · ${r.positionsText}`}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {r.isEvent && (
            <PhBadge
              label={t('eventLabel')}
              tone="accent"
              icon={<Flag className="h-3 w-3" />}
            />
          )}
          <PhBadge
            label={r.isPaid ? budgetText || t('paidGame') : t('freeGame')}
            tone={r.isPaid ? 'accent' : 'neutral'}
            icon={r.isPaid ? <DollarSign className="h-3 w-3" /> : undefined}
          />
          {r.isBoosted && (
            <PhBadge
              label={t('featuredTitle')}
              tone="warning"
              icon={<Sparkles className="h-3 w-3" />}
            />
          )}
          <span className="ml-1 tx-footnote font-semibold text-[var(--ph-accent)]">
            {t('spotsLeftCount', { count: r.spotsLeft })}
          </span>
        </div>

        <div className="mt-3 flex w-full items-center gap-1.5 tx-footnote">
          <MapPin className="h-[15px] w-[15px] shrink-0 text-[var(--ph-text-tertiary)]" />
          <span className="truncate">
            {r.venueText} · {r.locationShort}
          </span>
        </div>

        {(showCaptain || trailingNote) && (
          <>
            <div className="my-3 h-[0.5px] w-full bg-[var(--ph-border)]" />
            <div className="flex w-full items-center justify-between gap-2">
              {showCaptain && (
                <div className="flex min-w-0 items-center gap-2">
                  <PhAvatar
                    name={r.captainName}
                    url={r.captainAvatarUrl}
                    size={26}
                  />
                  <span className="truncate tx-footnote text-[var(--ph-text)]">
                    {r.captainName}
                  </span>
                  <RatingPill
                    average={r.captainRatingAvg}
                    count={r.captainRatingCount}
                    format={(a, n) => formatRatingText(a, n, locale)}
                    emptyLabel={t('newPlayerLabel')}
                  />
                </div>
              )}
              {trailingNote && <div className="shrink-0">{trailingNote}</div>}
            </div>
          </>
        )}
      </div>
    </PhCard>
  );
}

