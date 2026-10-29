'use client';

import React from 'react';
import {
  Award,
  Briefcase,
  ChevronRight,
  FileText,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  User,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, type AppLocale } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import {
  GlassContainer,
  PhAvatar,
  PhBadge,
  PhButton,
  PhCard,
  PhLargeTitleBar,
  RatingPill,
} from '@/design-system';
import { useMyPlayerProfile } from '@/lib/player-api';
import { formatRatingText } from '@/lib/format';

export default function PlayerMePage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { me, logout, hasBothRoles, switchActiveRole } = useAuth();
  const { data: profile } = useMyPlayerProfile();

  const playerName = me?.name || profile?.name || 'Sohel Rana';
  const playerAvatar = me?.avatarUrl || profile?.avatarUrl;
  const averageRating = profile?.rating?.average ?? 4.9;
  const ratingCount = profile?.rating?.count ?? 31;
  const locationText = profile?.location
    ? `${locale === 'bn' ? profile.location.upazila.nameBn : profile.location.upazila.nameEn}, ${locale === 'bn' ? profile.location.district.nameBn : profile.location.district.nameEn}`
    : locale === 'bn' ? 'কলাপাড়া, পটুয়াখালী' : 'Kalapara, Patuakhali';

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title={t('tabMe')}
        subtitle="Manage your player account, sport profiles, and applications."
      />

      {/* Profile Overview Card */}
      <PhCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <PhAvatar
            name={playerName}
            url={playerAvatar}
            size={76}
            verified={profile?.verifiedBadge ?? true}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="tx-title2 text-[var(--ph-text)]">{playerName}</h2>
              <PhBadge label="Player" tone="accent" />
            </div>

            <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-[var(--ph-text-secondary)] tx-subhead">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{locationText}</span>
            </div>

            <div className="mt-2 flex items-center justify-center sm:justify-start gap-3">
              <RatingPill
                average={averageRating}
                count={ratingCount}
                format={(a, n) => formatRatingText(a, n, locale)}
              />
              <span className="tx-caption text-[var(--ph-accent)] font-semibold">
                Reliable (0 No-Shows)
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <PhButton
              variant="secondary"
              label={t('edit')}
              onPressed={() => router.push('/player/onboarding')}
            />
          </div>
        </div>
      </PhCard>

      {/* Nav List Menu */}
      <div className="space-y-3">
        <PhCard
          onTap={() => router.push('/player/profiles')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  {t('navMyProfiles')}
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Positions, match stats, achievements, rates
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>

        <PhCard
          onTap={() => router.push('/player/applications')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text)]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  {t('gamesApplications')}
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Track sent offers and view captain contacts
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>

        <PhCard
          onTap={() => router.push('/player/ratings')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text)]">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  Ratings & Match Reviews
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Feedback received from captains
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>

        <PhCard
          onTap={() => router.push('/player/onboarding')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text)]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  Onboarding & Profile Setup
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Update location, bio, media links
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>
      </div>

      {/* Switch to Recruiter Role / Add Recruiter */}
      <PhCard className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="tx-headline text-[var(--ph-text)]">
              {hasBothRoles ? 'Switch to Recruiter Mode' : 'Also a Team Captain or Scout?'}
            </div>
            <div className="tx-caption text-[var(--ph-text-secondary)]">
              {hasBothRoles
                ? 'Switch mode to search players, post requests, and recruit.'
                : 'Enable the recruiter role on your account to hire players.'}
            </div>
          </div>

          <PhButton
            variant="secondary"
            label={hasBothRoles ? 'Switch' : 'Add role'}
            onPressed={async () => {
              await switchActiveRole('RECRUITER');
              router.push('/recruiter');
            }}
          />
        </div>
      </PhCard>
    </div>
  );
}

