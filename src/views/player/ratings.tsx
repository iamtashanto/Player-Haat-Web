'use client';

import React from 'react';
import { Award, Calendar, CheckCircle2, Star, Trophy, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhAvatar,
  PhBadge,
  PhButton,
  PhCard,
  PhLargeTitleBar,
  PhStarRating,
  RatingPill,
} from '@/design-system';
import {
  useMyPlayerProfile,
  usePlayerReviews,
  type PlayerReviewItem,
} from '@/lib/player-api';
import { formatRatingText } from '@/lib/format';

export default function PlayerRatingsPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const { data: profile } = useMyPlayerProfile();

  const sampleReviews: PlayerReviewItem[] = [
    {
      id: 'rev-1',
      rating: 5,
      comment: 'Outstanding striker! Scored two goals and pressed constantly. Very punctual and great sportsmanship.',
      reviewerName: 'Latachapli Krira Sangha',
      reviewerRole: 'Team Captain',
      sportName: 'Football',
      matchDate: '2026-10-24',
      createdAt: '2026-10-25T11:00:00Z',
    },
    {
      id: 'rev-2',
      rating: 5,
      comment: 'Top quality winger. Excellent cross for the winning header.',
      reviewerName: 'Kalapara Stars',
      reviewerRole: 'Club Manager',
      sportName: 'Football',
      matchDate: '2026-10-18',
      createdAt: '2026-10-19T09:30:00Z',
    },
    {
      id: 'rev-3',
      rating: 4.8,
      comment: 'Disciplined player and respected the referee throughout.',
      reviewerName: 'Kuakata Football Club',
      reviewerRole: 'Team Captain',
      sportName: 'Football',
      matchDate: '2026-10-10',
      createdAt: '2026-10-11T16:00:00Z',
    },
  ];

  const { data: serverReviews } = usePlayerReviews(profile?.id);
  const reviews = serverReviews && serverReviews.length > 0 ? serverReviews : sampleReviews;

  const averageRating = profile?.rating?.average ?? 4.9;
  const ratingCount = profile?.rating?.count ?? 31;

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title="Ratings & Reviews"
        subtitle="Match reviews and sportsmanship ratings left by team captains and recruiters."
      />

      {/* Aggregate Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PhCard className="md:col-span-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[var(--ph-surface)] to-[var(--ph-accent-soft)]/20">
          <div className="text-5xl font-black text-[var(--ph-text)] tracking-tight">
            {averageRating.toFixed(1)}
          </div>

          <div className="mt-2 flex items-center justify-center">
            <PhStarRating rating={averageRating} size={22} />
          </div>

          <div className="mt-2 tx-subhead text-[var(--ph-text-secondary)]">
            {formatRatingText(averageRating, ratingCount, locale)}
          </div>

          <div className="mt-4 flex items-center gap-1.5 rounded-full bg-[var(--ph-accent-soft)] px-3 py-1.5 tx-caption font-semibold text-[var(--ph-accent)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>100% Reliable (0 No-Shows)</span>
          </div>
        </PhCard>

        {/* Rating Breakdown / Highlights */}
        <PhCard className="md:col-span-2 flex flex-col justify-center space-y-4 p-6">
          <h3 className="tx-headline text-[var(--ph-text)]">
            Captain Feedback Highlights
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--ph-surface-alt)] p-4">
              <div className="tx-caption text-[var(--ph-text-secondary)]">
                Punctuality
              </div>
              <div className="tx-headline font-bold text-[var(--ph-accent)] mt-0.5">
                5.0 / 5.0
              </div>
              <p className="tx-caption text-[var(--ph-text-tertiary)] mt-1">
                Always arrived at venue before kickoff.
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--ph-surface-alt)] p-4">
              <div className="tx-caption text-[var(--ph-text-secondary)]">
                Fair Play & Respect
              </div>
              <div className="tx-headline font-bold text-[var(--ph-accent)] mt-0.5">
                4.9 / 5.0
              </div>
              <p className="tx-caption text-[var(--ph-text-tertiary)] mt-1">
                Zero yellow cards in paid matches.
              </p>
            </div>
          </div>
        </PhCard>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="tx-headline text-[var(--ph-text)]">
          Recent Match Reviews ({reviews.length})
        </h3>

        {reviews.map((rev) => (
          <PhCard key={rev.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PhAvatar name={rev.reviewerName} size={40} />
                <div>
                  <div className="tx-subhead-strong text-[var(--ph-text)]">
                    {rev.reviewerName}
                  </div>
                  <div className="tx-caption text-[var(--ph-text-secondary)]">
                    {rev.reviewerRole} · {rev.sportName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <PhStarRating rating={rev.rating} size={16} />
                <span className="tx-footnote font-bold text-[var(--ph-text)] ml-1">
                  {rev.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {rev.comment && (
              <p className="tx-subhead text-[var(--ph-text-secondary)] bg-[var(--ph-surface-alt)]/60 rounded-2xl p-3.5">
                &ldquo;{rev.comment}&rdquo;
              </p>
            )}

            <div className="flex items-center gap-2 tx-caption text-[var(--ph-text-tertiary)]">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Match played on {rev.matchDate}</span>
            </div>
          </PhCard>
        ))}
      </div>
    </div>
  );
}

