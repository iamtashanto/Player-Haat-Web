'use client';

import React from 'react';
import {
  Briefcase,
  ChevronRight,
  Heart,
  MapPin,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  Users,
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
} from '@/design-system';
import { useMyRecruiterProfile } from '@/lib/recruiter-api';

export default function RecruiterMePage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { me, logout, hasBothRoles, switchActiveRole } = useAuth();
  const { data: profile } = useMyRecruiterProfile();

  const recruiterName = me?.name || profile?.name || 'Abahani Youth Club';
  const orgName = profile?.organization || 'Abahani Krira Chakra';
  const recruiterType = profile?.type || 'CLUB';

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title={t('tabMe')}
        subtitle="Manage your club profile, team details, and recruitment preferences."
      />

      {/* Recruiter Overview Card */}
      <PhCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <PhAvatar
            name={recruiterName}
            url={profile?.avatarUrl}
            size={76}
            verified={profile?.verifiedBadge ?? true}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="tx-title2 text-[var(--ph-text)]">{recruiterName}</h2>
              <PhBadge label={recruiterType} tone="accent" />
            </div>

            <div className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
              {orgName}
            </div>

            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 tx-subhead text-[var(--ph-text-secondary)]">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--ph-text-tertiary)]" />
              <span>{profile?.district ? (locale === 'bn' ? profile.district.nameBn : profile.district.nameEn) : 'Patuakhali, Barishal'}</span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <PhButton
              variant="secondary"
              label={t('edit')}
              onPressed={() => router.push('/recruiter/onboarding')}
            />
          </div>
        </div>
      </PhCard>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <PhCard
          onTap={() => router.push('/recruiter/requests')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  {t('gamesRequests')}
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Post matches, review applicants, and confirm rosters
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>

        <PhCard
          onTap={() => router.push('/recruiter/shortlist')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text)]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  Saved Shortlists
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  View and manage target players for your club
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>

        <PhCard
          onTap={() => router.push('/recruiter/discover')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  Discover Players
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Filter by sport, position, skill level, and location
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>

        <PhCard
          onTap={() => router.push('/recruiter/onboarding')}
          className="p-4 hover:border-[var(--ph-accent)] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text)]">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="tx-headline text-[var(--ph-text)]">
                  Team Onboarding & Verification
                </div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Update recruiter type, organization, and sports
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--ph-text-tertiary)]" />
          </div>
        </PhCard>
      </div>

      {/* Switch to Player Role / Add Player */}
      <PhCard className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="tx-headline text-[var(--ph-text)]">
              {hasBothRoles ? 'Switch to Player Mode' : 'Also Play Sports?'}
            </div>
            <div className="tx-caption text-[var(--ph-text-secondary)]">
              {hasBothRoles
                ? 'Switch mode to manage your sports profiles and find khep games.'
                : 'Many team captains also play. Add a player profile to your account.'}
            </div>
          </div>

          <PhButton
            variant="secondary"
            label={hasBothRoles ? 'Switch' : 'Add role'}
            onPressed={async () => {
              await switchActiveRole('PLAYER');
              router.push('/player');
            }}
          />
        </div>
      </PhCard>
    </div>
  );
}

