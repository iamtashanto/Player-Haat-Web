'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react';
import { useRouter, type AppLocale } from '@/i18n/routing';
import {
  PhAvatar,
  PhBadge,
  PhCard,
  PhChip,
  PhIconButton,
  PhLargeTitleBar,
  PhSectionHeader,
  RatingPill,
  showPhToast,
} from '@/design-system';
import { RequestCardView } from '@/components/shared/domain-cards';
import { formatRatingText } from '@/lib/format';

/**
 * Player Shell Home Preview — 1:1 with Flutter's `HomeScreen` (`app/lib/features/home/presentation/home_screen.dart`).
 * Mobile view feels identical to the mobile app; desktop view expands cleanly into a multi-column responsive layout.
 */
export default function PlayerHomePage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [kindFilter, setKindFilter] = useState<'ALL' | 'MATCH' | 'EVENT'>('ALL');
  const [paidFilter, setPaidFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'FOOTBALL' | 'CRICKET'>('ALL');

  const featuredPlayers = [
    { id: 'fp-1', name: 'Sohel Rana', upazila: locale === 'bn' ? 'কলাপাড়া' : 'Kalapara', avg: 4.8, count: 31, verified: true },
    { id: 'fp-2', name: 'Imran Hossain', upazila: locale === 'bn' ? 'আমতলী' : 'Amtali', avg: 4.7, count: 19, verified: true },
    { id: 'fp-3', name: 'মাহিন সরদার', upazila: locale === 'bn' ? 'পটুয়াখালী সদর' : 'Patuakhali Sadar', avg: 4.9, count: 27, verified: true },
    { id: 'fp-4', name: 'Rakib Hasan', upazila: locale === 'bn' ? 'কুয়াকাটা' : 'Kuakata', avg: 4.5, count: 12, verified: false },
  ];

  return (
    <div className="space-y-4">
      <PhLargeTitleBar
        title={t('homeGreeting', { name: 'Sohel' })}
        subtitle={t('homeSubtitle')}
        actions={
          <div className="flex items-center gap-1">
            <PhIconButton
              icon={<MessageCircle className="h-5 w-5" />}
              semanticLabel={t('messagesTitle')}
              badge
              onPressed={() => showPhToast(t('messagesTitle'))}
            />
            <PhIconButton
              icon={<Plus className="h-5 w-5" />}
              semanticLabel={t('postRequest')}
              onPressed={() => showPhToast(t('postRequest'))}
            />
          </div>
        }
      />

      <div className="px-5 md:px-8 space-y-5">
        {/* Complete Profile Setup Banner (1:1 with _SetupBanner in Flutter) */}
        <PhCard
          color="var(--ph-accent-soft)"
          onTap={() => router.push('/gallery')}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--ph-accent)] text-[var(--ph-accent-on)]">
              <UserPlus className="h-[22px] w-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="tx-headline text-[var(--ph-text)]">{t('setupBannerTitle')}</div>
              <div className="mt-0.5 tx-footnote">{t('setupBannerBody')}</div>
            </div>
            <PhBadge label={t('setupBannerAction')} tone="accent" />
          </div>
        </PhCard>

        {/* 3 Filter Chip Rows (1:1 with _FilterBar in Flutter) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <PhChip
              label={t('kindAll')}
              selected={kindFilter === 'ALL'}
              onTap={() => setKindFilter('ALL')}
            />
            <PhChip
              label={t('kindMatches')}
              selected={kindFilter === 'MATCH'}
              onTap={() => setKindFilter('MATCH')}
            />
            <PhChip
              label={t('kindEvents')}
              selected={kindFilter === 'EVENT'}
              onTap={() => setKindFilter('EVENT')}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <PhChip
              label={t('anywhere')}
              icon={<MapPin className="h-4 w-4" />}
              onTap={() => showPhToast(t('placePickerTitle'))}
            />
            <PhChip
              label={t('filterFree')}
              selected={paidFilter === 'FREE'}
              onTap={() => setPaidFilter(paidFilter === 'FREE' ? 'ALL' : 'FREE')}
            />
            <PhChip
              label={t('filterPaid')}
              selected={paidFilter === 'PAID'}
              onTap={() => setPaidFilter(paidFilter === 'PAID' ? 'ALL' : 'PAID')}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <PhChip
              label={t('filterAllSports')}
              selected={sportFilter === 'ALL'}
              onTap={() => setSportFilter('ALL')}
            />
            <PhChip
              label={locale === 'bn' ? 'ফুটবল' : 'Football'}
              selected={sportFilter === 'FOOTBALL'}
              onTap={() => setSportFilter('FOOTBALL')}
            />
            <PhChip
              label={locale === 'bn' ? 'ক্রিকেট' : 'Cricket'}
              selected={sportFilter === 'CRICKET'}
              onTap={() => setSportFilter('CRICKET')}
            />
          </div>
        </div>

        {/* Top Players Strip (_FeaturedStrip in Flutter) */}
        <div>
          <PhSectionHeader
            title={t('homeFeatured')}
            actionLabel={t('seeAll')}
            onAction={() => router.push('/recruiter')}
            className="pt-2"
          />
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {featuredPlayers.map((fp) => (
              <div key={fp.id} className="w-[136px] shrink-0">
                <PhCard
                  paddingClassName="p-3"
                  onTap={() => showPhToast(fp.name)}
                >
                  <div className="flex flex-col items-center text-center">
                    <PhAvatar name={fp.name} size={56} verified={fp.verified} />
                    <div className="mt-2 w-full truncate tx-subhead-strong text-[var(--ph-text)]">
                      {fp.name}
                    </div>
                    <div className="mt-0.5 w-full truncate tx-caption">
                      {fp.upazila}
                    </div>
                    <div className="mt-1">
                      <RatingPill
                        average={fp.avg}
                        count={fp.count}
                        format={(a, n) => formatRatingText(a, n, locale)}
                      />
                    </div>
                  </div>
                </PhCard>
              </div>
            ))}
          </div>
        </div>

        {/* Open Recruitment Requests Near Me */}
        <div>
          <PhSectionHeader title={t('homeNearby')} className="pt-2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RequestCardView
              request={{
                id: 'pl-req-1',
                whenText: locale === 'bn' ? 'আজ · সন্ধ্যা ৬:৩০' : 'Today · 6:30 PM',
                sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
                positionsText: 'GK, CB',
                venueText: locale === 'bn' ? 'লতাচাপলী স্কুল মাঠ' : 'Latachapli School Field',
                locationShort: locale === 'bn' ? 'কলাপাড়া, পটুয়াখালী' : 'Kalapara, Patuakhali',
                isPaid: true,
                budgetMin: 500,
                budgetMax: 700,
                spotsLeft: 2,
                isBoosted: true,
                captainName: 'Imran Hossain',
                captainRatingAvg: 4.9,
                captainRatingCount: 18,
              }}
              onTap={() => showPhToast(t('applySheetTitle'))}
            />
            <RequestCardView
              request={{
                id: 'pl-req-2',
                whenText: locale === 'bn' ? 'আগামীকাল · বিকেল ৪:৩০' : 'Tomorrow · 4:30 PM',
                sportName: locale === 'bn' ? 'ক্রিকেট' : 'Cricket',
                positionsText: 'ALL_ROUNDER, WICKET_KEEPER',
                venueText: locale === 'bn' ? 'কলাপাড়া সরকারি কলেজ মাঠ' : 'Kalapara Govt. College Ground',
                locationShort: locale === 'bn' ? 'কলাপাড়া, পটুয়াখালী' : 'Kalapara, Patuakhali',
                isPaid: false,
                spotsLeft: 4,
                captainName: 'Tanvir Ahmed',
                captainRatingAvg: 4.6,
                captainRatingCount: 11,
              }}
              onTap={() => showPhToast(t('applySheetTitle'))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

