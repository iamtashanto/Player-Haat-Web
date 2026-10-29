'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DollarSign, MapPin, Plus, SlidersHorizontal } from 'lucide-react';
import type { AppLocale } from '@/i18n/routing';
import {
  PhChip,
  PhGlassSheet,
  PhIconButton,
  PhLargeTitleBar,
  PhSearchField,
  PhSectionHeader,
  PhButton,
  showPhToast,
} from '@/design-system';
import { PlayerTileCard } from '@/components/shared/domain-cards';

/**
 * Recruiter Shell Discovery Preview — 1:1 with Flutter's `SearchScreen` (`app/lib/features/search/presentation/search_screen.dart`).
 * Mobile view feels identical to the mobile app; desktop view displays a multi-column discovery grid.
 */
export default function RecruiterHomePage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<'ALL' | 'FOOTBALL' | 'CRICKET'>('ALL');
  const [khepOnly, setKhepOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const samplePlayers = [
    {
      id: 'rec-p-1',
      name: 'Sohel Rana',
      verifiedBadge: true,
      sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
      positions: ['GK', 'CB'],
      experienceYears: 6,
      ratingAverage: 4.8,
      ratingCount: 31,
      upazilaName: locale === 'bn' ? 'কলাপাড়া' : 'Kalapara',
      districtName: locale === 'bn' ? 'পটুয়াখালী' : 'Patuakhali',
      khepAvailable: true,
      rateMin: 400,
      rateMax: 600,
      shortlisted: true,
    },
    {
      id: 'rec-p-2',
      name: 'Imran Hossain',
      verifiedBadge: true,
      sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
      positions: ['ST', 'WING'],
      experienceYears: 4,
      ratingAverage: 4.7,
      ratingCount: 19,
      upazilaName: locale === 'bn' ? 'আমতলী' : 'Amtali',
      districtName: locale === 'bn' ? 'বরগুনা' : 'Barguna',
      khepAvailable: true,
      rateMin: 600,
      rateMax: 1000,
      shortlisted: false,
    },
    {
      id: 'rec-p-3',
      name: 'মাহিন সরদার',
      verifiedBadge: true,
      sportName: locale === 'bn' ? 'ক্রিকেট' : 'Cricket',
      positions: ['PACE_BOWLER', 'ALL_ROUNDER'],
      experienceYears: 5,
      ratingAverage: 4.9,
      ratingCount: 27,
      upazilaName: locale === 'bn' ? 'পটুয়াখালী সদর' : 'Patuakhali Sadar',
      districtName: locale === 'bn' ? 'পটুয়াখালী' : 'Patuakhali',
      khepAvailable: true,
      rateMin: 500,
      rateMax: 800,
      shortlisted: false,
    },
    {
      id: 'rec-p-4',
      name: 'Rakib Hasan',
      verifiedBadge: false,
      sportName: locale === 'bn' ? 'ক্রিকেট' : 'Cricket',
      positions: ['WICKET_KEEPER', 'BATTER'],
      experienceYears: 3,
      ratingAverage: 4.5,
      ratingCount: 12,
      upazilaName: locale === 'bn' ? 'বরিশাল সদর' : 'Barishal Sadar',
      districtName: locale === 'bn' ? 'বরিশাল' : 'Barishal',
      khepAvailable: false,
      shortlisted: false,
    },
  ];

  const filtered = samplePlayers.filter((p) => {
    if (khepOnly && !p.khepAvailable) return false;
    if (query.trim() && !p.name.toLowerCase().includes(query.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <PhLargeTitleBar
        title={t('searchTitle')}
        subtitle={t('recruiterSetupBody')}
        actions={
          <div className="flex items-center gap-1.5">
            <PhIconButton
              icon={<SlidersHorizontal className="h-5 w-5" />}
              semanticLabel={t('filters')}
              onPressed={() => setFilterOpen(true)}
            />
            <PhIconButton
              icon={<Plus className="h-5 w-5" />}
              semanticLabel={t('postRequest')}
              onPressed={() => showPhToast(t('newRequestTitle'))}
            />
          </div>
        }
      />

      <div className="px-5 md:px-8 space-y-4">
        <PhSearchField
          value={query}
          onChange={setQuery}
          hint={t('filterName')}
        />

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
          <PhChip
            label={t('anywhere')}
            icon={<MapPin className="h-4 w-4" />}
            onTap={() => setFilterOpen(true)}
          />
          <PhChip
            label={t('filterPaid')}
            icon={<DollarSign className="h-4 w-4" />}
            selected={khepOnly}
            onTap={() => setKhepOnly(!khepOnly)}
          />
        </div>

        <PhSectionHeader
          title={t('homeFeatured')}
          actionLabel={t('filters')}
          onAction={() => setFilterOpen(true)}
          className="pt-1"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PlayerTileCard
              key={p.id}
              player={p}
              onTap={() => showPhToast(p.name)}
            />
          ))}
        </div>
      </div>

      <PhGlassSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title={t('filters')}
      >
        <div className="space-y-4">
          <div className="tx-subhead">{t('filterSport')}</div>
          <div className="flex flex-wrap gap-2">
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
          <div className="pt-3">
            <PhButton
              label={t('showResults')}
              onPressed={() => setFilterOpen(false)}
            />
          </div>
        </div>
      </PhGlassSheet>
    </div>
  );
}

