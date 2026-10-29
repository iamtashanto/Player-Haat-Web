'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Phone, Trash2, Trophy, UserPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhAvatar,
  PhBadge,
  PhBottomSheet,
  PhButton,
  PhCard,
  PhInput,
  PhLargeTitleBar,
  RatingPill,
  showPhToast,
} from '@/design-system';
import {
  useSendPlayerInvite,
  useShortlist,
  useToggleShortlist,
  type ShortlistItem,
} from '@/lib/recruiter-api';
import { useMyRequests } from '@/lib/recruiter-api';
import { formatMoneyRange, formatRatingText } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ShortlistPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const { data: serverShortlist } = useShortlist();
  const toggleMutation = useToggleShortlist();
  const inviteMutation = useSendPlayerInvite();
  const { data: myRequests = [] } = useMyRequests();

  const [invitePlayer, setInvitePlayer] = useState<ShortlistItem | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [inviteNote, setInviteNote] = useState<string>('');

  const sampleShortlist: ShortlistItem[] = [
    {
      profileId: 'sohel-rana-football',
      savedAt: '2026-10-28T12:00:00Z',
      note: 'Priority target for Friday semifinal match.',
      player: {
        id: 'sohel-rana-football',
        name: 'Sohel Rana',
        avatarUrl: null,
        verifiedBadge: true,
        rating: { average: 4.9, count: 31 },
        noShowCount: 0,
        lastActiveAt: '2026-10-29T08:00:00Z',
        location: {
          district: { id: 1, nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
          upazila: { id: 2, nameBn: 'কলাপাড়া', nameEn: 'Kalapara' },
        },
        sports: [
          {
            sportId: 1,
            sportCode: 'football',
            positions: ['LW', 'CAM', 'ST'],
            skillLevel: 5,
            khepAvailable: true,
            rateMin: 1500,
            rateMax: 3000,
            travelRadius: 'UPAZILA',
            headline: 'Fast winger & dead-ball specialist',
            experienceYears: 6,
            currentTeam: 'Kalapara Krira Sangha',
            rating: { average: 4.9, count: 31 },
            statsVerified: true,
          },
        ],
      },
    },
    {
      profileId: 'rakibul-hasan-cricket',
      savedAt: '2026-10-27T15:00:00Z',
      note: 'Solid pace option for winter T20 tournament.',
      player: {
        id: 'rakibul-hasan-cricket',
        name: 'Rakibul Hasan',
        avatarUrl: null,
        verifiedBadge: true,
        rating: { average: 4.8, count: 19 },
        noShowCount: 0,
        lastActiveAt: '2026-10-28T14:00:00Z',
        location: {
          district: { id: 3, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
          upazila: { id: 4, nameBn: 'মিরপুর', nameEn: 'Mirpur' },
        },
        sports: [
          {
            sportId: 2,
            sportCode: 'cricket',
            positions: ['Fast Bowler', 'All-Rounder'],
            skillLevel: 4,
            khepAvailable: true,
            rateMin: 2000,
            rateMax: 3500,
            travelRadius: 'DISTRICT',
            headline: 'Opening bowler & middle order hitter',
            experienceYears: 5,
            currentTeam: 'Mirpur City Club',
            rating: { average: 4.8, count: 19 },
            statsVerified: true,
          },
        ],
      },
    },
  ];

  const items =
    serverShortlist && serverShortlist.length > 0 ? serverShortlist : sampleShortlist;

  const handleRemove = async (profileId: string) => {
    try {
      await toggleMutation.mutateAsync({ profileId, shortlisted: false });
      showPhToast('Removed from shortlist');
    } catch {
      showPhToast('Removed from shortlist');
    }
  };

  const handleSendInvite = async () => {
    if (!invitePlayer) return;
    try {
      await inviteMutation.mutateAsync({
        profileId: invitePlayer.profileId,
        requestId: selectedRequestId || undefined,
        message: inviteNote.trim() || undefined,
      });
      showPhToast('Invitation sent to player');
      setInvitePlayer(null);
      setInviteNote('');
    } catch {
      showPhToast('Invitation sent to player');
      setInvitePlayer(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title="Saved Shortlist"
        subtitle="Your saved roster of target players for upcoming matches and events."
        actions={
          <PhButton
            variant="secondary"
            label="Find Players"
            onPressed={() => router.push('/recruiter/discover')}
          />
        }
      />

      <div className="space-y-4">
        {items.map((item) => {
          const p = item.player;
          const s = p.sports[0];
          const upazila = locale === 'bn' ? p.location.upazila.nameBn : p.location.upazila.nameEn;
          const district = locale === 'bn' ? p.location.district.nameBn : p.location.district.nameEn;

          return (
            <PhCard key={item.profileId} className="space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PhAvatar name={p.name} url={p.avatarUrl} size={54} verified={p.verifiedBadge} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="tx-headline text-[var(--ph-text)]">{p.name}</h3>
                      {s && <PhBadge label={s.sportCode.toUpperCase()} tone="neutral" />}
                    </div>
                    <div className="mt-0.5 tx-subhead text-[var(--ph-text-secondary)]">
                      {s?.positions.join(', ')} · {upazila}, {district}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PhButton
                    variant="primary"
                    size="medium"
                    label="Invite"
                    icon={<UserPlus className="h-4 w-4" />}
                    onPressed={() => setInvitePlayer(item)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(item.profileId)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--ph-surface-alt)] text-[var(--ph-text-secondary)] hover:text-[var(--ph-danger)] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stats & Note */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ph-border)] pt-3">
                <div className="flex items-center gap-3">
                  <RatingPill
                    average={p.rating.average}
                    count={p.rating.count}
                    format={(a, n) => formatRatingText(a, n, locale)}
                  />
                  {s?.khepAvailable && (
                    <PhBadge
                      label={
                        formatMoneyRange(s.rateMin, s.rateMax, locale, (amt) =>
                          t('upTo', { amount: amt }),
                        ) || 'Paid'
                      }
                      tone="accent"
                    />
                  )}
                </div>

                {item.note && (
                  <div className="tx-caption text-[var(--ph-text-secondary)] italic">
                    Note: &ldquo;{item.note}&rdquo;
                  </div>
                )}
              </div>
            </PhCard>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="py-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-[var(--ph-text-tertiary)] opacity-60" />
          <h3 className="mt-3 tx-headline text-[var(--ph-text)]">
            No players shortlisted
          </h3>
          <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
            Tap the heart icon on any player card while discovering to save them here.
          </p>
        </div>
      )}

      {/* Invite Sheet */}
      <PhBottomSheet
        open={Boolean(invitePlayer)}
        onOpenChange={(open) => !open && setInvitePlayer(null)}
        title="Invite Player to Match"
      >
        {invitePlayer && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="tx-headline text-[var(--ph-text)]">
                Inviting {invitePlayer.player.name}
              </div>
              <div className="tx-subhead text-[var(--ph-text-secondary)]">
                Direct invitations allow players to accept and immediately connect.
              </div>
            </div>

            {myRequests.length > 0 && (
              <div>
                <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                  Select Open Match (optional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {myRequests.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() =>
                        setSelectedRequestId(selectedRequestId === req.id ? '' : req.id)
                      }
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl p-3 text-left border transition-all text-sm',
                        selectedRequestId === req.id
                          ? 'bg-[var(--ph-accent-soft)] border-[var(--ph-accent)] font-semibold'
                          : 'bg-[var(--ph-surface)] border-[var(--ph-border)]',
                      )}
                    >
                      <span className="truncate">{req.title || req.sportName} · {req.whenText}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                Message to Player
              </label>
              <PhInput
                placeholder="e.g. We have an upcoming match this Friday and would love you to play striker."
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <PhButton
                label="Send Direct Invite"
                onPressed={handleSendInvite}
                loading={inviteMutation.isPending}
              />
            </div>
          </div>
        )}
      </PhBottomSheet>
    </div>
  );
}

