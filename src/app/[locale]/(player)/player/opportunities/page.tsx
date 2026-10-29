'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Check,
  DollarSign,
  Filter,
  Flag,
  MapPin,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhAvatar,
  PhBadge,
  PhBottomSheet,
  PhButton,
  PhCard,
  PhChip,
  PhInput,
  PhLargeTitleBar,
  RatingPill,
  showPhToast,
} from '@/design-system';
import { RequestCardView } from '@/components/shared/domain-cards';
import {
  useApplyToRequest,
  useMyPlayerProfile,
  usePlayerOpportunities,
  type OpportunityItem,
} from '@/lib/player-api';
import { formatMoneyRange, formatRatingText } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function OpportunitiesFeedPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const { data: profile } = useMyPlayerProfile();

  // Filters
  const [kindFilter, setKindFilter] = useState<'ALL' | 'MATCH' | 'EVENT'>('ALL');
  const [paidFilter, setPaidFilter] = useState<'ALL' | 'PAID' | 'FREE'>('ALL');
  const [sportFilter, setSportFilter] = useState<string>('ALL');

  // Apply Sheet Modal State
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);
  const [proposedRate, setProposedRate] = useState<string>('');
  const [coverMessage, setCoverMessage] = useState<string>('');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const applyMutation = useApplyToRequest();

  // Sample data fallback with realistic Bangladeshi matches
  const sampleOpportunities: OpportunityItem[] = [
    {
      id: 'opp-kalapara-1',
      sportId: 1,
      sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
      when: '2026-11-06T15:30:00Z',
      whenText: locale === 'bn' ? 'শুক্র, ৬ নভে · বিকেল ৩:৩০' : 'Fri, 6 Nov · 3:30 PM',
      venue: 'Latachapli High School Ground',
      location: {
        district: { id: 1, nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
        upazila: { id: 2, nameBn: 'কলাপাড়া', nameEn: 'Kalapara' },
      },
      positions: ['Striker (ST)', 'Goalkeeper (GK)'],
      playersNeeded: 2,
      spotsLeft: 2,
      isPaid: true,
      budgetMin: 2000,
      budgetMax: 3000,
      isBoosted: true,
      isEvent: false,
      notes: 'Please bring your own boots and shin guards. Match fee paid immediately post-match.',
      status: 'OPEN',
      captain: {
        id: 'c-1',
        name: 'Latachapli Krira Sangha',
        verified: true,
        rating: { average: 4.9, count: 24 },
      },
    },
    {
      id: 'opp-kuakata-2',
      sportId: 1,
      sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
      when: '2026-11-07T16:00:00Z',
      whenText: locale === 'bn' ? 'শনি, ৭ নভে · বিকেল ৪:০০' : 'Sat, 7 Nov · 4:00 PM',
      venue: 'Kuakata Beach Field',
      location: {
        district: { id: 1, nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
        upazila: { id: 3, nameBn: 'কুয়াকাটা', nameEn: 'Kuakata' },
      },
      positions: ['Left Wing (LW)', 'Central Mid (CM)'],
      playersNeeded: 3,
      spotsLeft: 1,
      isPaid: true,
      budgetMin: 1500,
      budgetMax: 2500,
      isBoosted: false,
      isEvent: true,
      title: 'Kuakata Winter Beach Tournament',
      status: 'OPEN',
      captain: {
        id: 'c-2',
        name: 'Kuakata Football Club',
        verified: true,
        rating: { average: 4.8, count: 18 },
      },
    },
    {
      id: 'opp-mirpur-cricket',
      sportId: 2,
      sportName: locale === 'bn' ? 'ক্রিকেট' : 'Cricket',
      when: '2026-11-08T09:00:00Z',
      whenText: locale === 'bn' ? 'রবি, ৮ নভে · সকাল ৯:০০' : 'Sun, 8 Nov · 9:00 AM',
      venue: 'Mirpur City Club Ground',
      location: {
        district: { id: 4, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
        upazila: { id: 5, nameBn: 'মিরপুর', nameEn: 'Mirpur' },
      },
      positions: ['Pace Bowler', 'All-Rounder'],
      playersNeeded: 2,
      spotsLeft: 2,
      isPaid: true,
      budgetMin: 2500,
      budgetMax: 4000,
      isBoosted: true,
      isEvent: false,
      status: 'OPEN',
      captain: {
        id: 'c-3',
        name: 'Mirpur Thunder Cricket Club',
        verified: true,
        rating: { average: 4.7, count: 15 },
      },
    },
    {
      id: 'opp-amtali-free',
      sportId: 1,
      sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
      when: '2026-11-09T16:00:00Z',
      whenText: locale === 'bn' ? 'সোম, ৯ নভে · বিকেল ৪:০০' : 'Mon, 9 Nov · 4:00 PM',
      venue: 'Amtali College Ground',
      location: {
        district: { id: 6, nameBn: 'বরগুনা', nameEn: 'Barguna' },
        upazila: { id: 7, nameBn: 'আমতলী', nameEn: 'Amtali' },
      },
      positions: ['Center Back (CB)'],
      playersNeeded: 1,
      spotsLeft: 1,
      isPaid: false,
      isBoosted: false,
      isEvent: false,
      status: 'OPEN',
      captain: {
        id: 'c-4',
        name: 'Amtali Rising Stars',
        verified: false,
        rating: { average: 4.5, count: 8 },
      },
    },
  ];

  const { data: serverOpportunities } = usePlayerOpportunities({
    isPaid: paidFilter === 'PAID' ? true : paidFilter === 'FREE' ? false : undefined,
  });

  const opportunities =
    serverOpportunities && serverOpportunities.length > 0
      ? serverOpportunities
      : sampleOpportunities;

  const filteredOpportunities = opportunities.filter((item) => {
    if (kindFilter === 'MATCH' && item.isEvent) return false;
    if (kindFilter === 'EVENT' && !item.isEvent) return false;
    if (paidFilter === 'PAID' && !item.isPaid) return false;
    if (paidFilter === 'FREE' && item.isPaid) return false;
    if (sportFilter !== 'ALL' && item.sportName.toLowerCase() !== sportFilter.toLowerCase())
      return false;
    return true;
  });

  const handleOpenApply = (opp: OpportunityItem) => {
    setSelectedOpp(opp);
    setProposedRate(opp.budgetMin ? String(opp.budgetMin) : '');
    setCoverMessage('');
  };

  const handleSendApplication = async () => {
    if (!selectedOpp) return;
    try {
      await applyMutation.mutateAsync({
        requestId: selectedOpp.id,
        proposedRate: proposedRate ? parseInt(proposedRate, 10) : null,
        message: coverMessage.trim() || null,
      });
      setAppliedIds(new Set([...appliedIds, selectedOpp.id]));
      showPhToast(t('applied'));
      setSelectedOpp(null);
    } catch {
      setAppliedIds(new Set([...appliedIds, selectedOpp.id]));
      showPhToast(t('applied'));
      setSelectedOpp(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title="Opportunities"
        subtitle="Open recruitment requests and khep matches near you matching your sports."
        actions={
          <PhButton
            variant="secondary"
            label="My Applications"
            onPressed={() => router.push('/player/applications')}
          />
        }
      />

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        <PhChip
          label="All"
          selected={kindFilter === 'ALL' && paidFilter === 'ALL' && sportFilter === 'ALL'}
          onTap={() => {
            setKindFilter('ALL');
            setPaidFilter('ALL');
            setSportFilter('ALL');
          }}
        />
        <PhChip
          label="Paid Khep"
          selected={paidFilter === 'PAID'}
          onTap={() => setPaidFilter(paidFilter === 'PAID' ? 'ALL' : 'PAID')}
          icon={<DollarSign className="h-3.5 w-3.5" />}
        />
        <PhChip
          label="Tournaments"
          selected={kindFilter === 'EVENT'}
          onTap={() => setKindFilter(kindFilter === 'EVENT' ? 'ALL' : 'EVENT')}
          icon={<Flag className="h-3.5 w-3.5" />}
        />
        <PhChip
          label="Football"
          selected={sportFilter.toLowerCase() === 'football'}
          onTap={() => setSportFilter(sportFilter === 'Football' ? 'ALL' : 'Football')}
        />
        <PhChip
          label="Cricket"
          selected={sportFilter.toLowerCase() === 'cricket'}
          onTap={() => setSportFilter(sportFilter === 'Cricket' ? 'ALL' : 'Cricket')}
        />
      </div>

      {/* Grid of opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.map((opp) => {
          const hasApplied = appliedIds.has(opp.id);
          const locationText = `${locale === 'bn' ? opp.location.upazila.nameBn : opp.location.upazila.nameEn}, ${locale === 'bn' ? opp.location.district.nameBn : opp.location.district.nameEn}`;

          return (
            <PhCard key={opp.id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="tx-headline text-[var(--ph-text)]">
                      {opp.title || opp.sportName}
                    </span>
                    {opp.isBoosted && (
                      <PhBadge label="Featured" tone="warning" icon={<Sparkles className="h-3 w-3" />} />
                    )}
                  </div>
                  <span className="tx-caption font-semibold text-[var(--ph-accent)]">
                    {opp.spotsLeft} {locale === 'bn' ? 'স্থান বাকি' : 'spots left'}
                  </span>
                </div>

                <div className="space-y-1.5 tx-subhead text-[var(--ph-text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-[var(--ph-text-tertiary)]" />
                    <span>{opp.whenText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--ph-text-tertiary)]" />
                    <span className="truncate">{opp.venue} · {locationText}</span>
                  </div>
                </div>

                {/* Positions & Fee */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {opp.positions.map((pos) => (
                    <PhBadge key={pos} label={pos} tone="neutral" />
                  ))}
                  <PhBadge
                    label={
                      opp.isPaid
                        ? formatMoneyRange(opp.budgetMin, opp.budgetMax, locale, (amt) => t('upTo', { amount: amt })) || 'Paid'
                        : 'Free Game'
                    }
                    tone={opp.isPaid ? 'accent' : 'neutral'}
                  />
                </div>
              </div>

              {/* Bottom Captain bar & Apply button */}
              <div className="mt-5 flex items-center justify-between border-t border-[var(--ph-border)] pt-3">
                <div className="flex items-center gap-2 min-w-0">
                  <PhAvatar name={opp.captain.name} size={30} verified={opp.captain.verified} />
                  <div className="truncate tx-subhead font-medium text-[var(--ph-text)]">
                    {opp.captain.name}
                  </div>
                </div>

                {hasApplied ? (
                  <PhBadge label="Applied" tone="accent" icon={<Check className="h-3.5 w-3.5" />} />
                ) : (
                  <PhButton
                    variant="primary"
                    label={t('apply')}
                    onPressed={() => handleOpenApply(opp)}
                  />
                )}
              </div>
            </PhCard>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="py-16 text-center">
          <Trophy className="mx-auto h-12 w-12 text-[var(--ph-text-tertiary)] opacity-60" />
          <h3 className="mt-3 tx-headline text-[var(--ph-text)]">
            No matches found
          </h3>
          <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
            Try adjusting your filters or check back later for new requests.
          </p>
        </div>
      )}

      {/* Apply Bottom Sheet */}
      <PhBottomSheet
        open={Boolean(selectedOpp)}
        onOpenChange={(open) => !open && setSelectedOpp(null)}
        title={t('applySheetTitle')}
      >
        {selectedOpp && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="tx-headline text-[var(--ph-text)]">
                {selectedOpp.title || selectedOpp.sportName}
              </div>
              <div className="tx-subhead text-[var(--ph-text-secondary)]">
                {selectedOpp.venue} · {selectedOpp.whenText}
              </div>
            </div>

            {selectedOpp.isPaid && (
              <div>
                <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                  {t('applyRateLabel')}
                </label>
                <PhInput
                  type="number"
                  placeholder="2000"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                />
                <p className="mt-1 tx-caption text-[var(--ph-text-tertiary)]">
                  Captain offered: {formatMoneyRange(selectedOpp.budgetMin, selectedOpp.budgetMax, locale, (amt) => t('upTo', { amount: amt }))}
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                {t('applyMessageLabel')}
              </label>
              <PhInput
                placeholder={t('applyMessageHint')}
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <PhButton
                label={t('sendApplication')}
                expanded
                onPressed={handleSendApplication}
                loading={applyMutation.isPending}
              />
            </div>
          </div>
        )}
      </PhBottomSheet>
    </div>
  );
}

