'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Filter,
  Grid,
  Heart,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhBadge,
  PhBottomSheet,
  PhButton,
  PhCard,
  PhChip,
  PhIconButton,
  PhInput,
  PhLargeTitleBar,
  RatingPill,
  showPhToast,
} from '@/design-system';
import { PlayerTileCard, ShortlistHeart } from '@/components/shared/domain-cards';
import {
  useSearchPlayers,
  useToggleShortlist,
  type PlayerSearchResultItem,
} from '@/lib/recruiter-api';
import { useDistricts, useDivisions, useSportsCatalog } from '@/lib/player-api';
import { formatMoneyRange, formatRatingText } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function DiscoverPlayersPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportId, setSelectedSportId] = useState<number | undefined>(undefined);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [khepOnly, setKhepOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [minSkill, setMinSkill] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');

  // Filter Drawer Sheet State
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const { data: sportsCatalog = [] } = useSportsCatalog();
  const { data: divisions = [] } = useDivisions();
  const { data: districts = [] } = useDistricts(selectedDivisionId);

  const toggleShortlistMutation = useToggleShortlist();

  // Sample fallback players
  const samplePlayers: PlayerSearchResultItem[] = [
    {
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
      shortlisted: true,
    },
    {
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
      shortlisted: false,
    },
    {
      id: 'imran-hossain-football',
      name: 'Imran Hossain',
      avatarUrl: null,
      verifiedBadge: true,
      rating: { average: 4.7, count: 22 },
      noShowCount: 0,
      lastActiveAt: '2026-10-27T10:00:00Z',
      location: {
        district: { id: 5, nameBn: 'বরগুনা', nameEn: 'Barguna' },
        upazila: { id: 6, nameBn: 'আমতলী', nameEn: 'Amtali' },
      },
      sports: [
        {
          sportId: 1,
          sportCode: 'football',
          positions: ['Striker', 'RW'],
          skillLevel: 4,
          khepAvailable: true,
          rateMin: 1200,
          rateMax: 2200,
          travelRadius: 'UPAZILA',
          headline: 'Target man striker',
          experienceYears: 4,
          currentTeam: 'Amtali Rising Club',
          rating: { average: 4.7, count: 22 },
          statsVerified: false,
        },
      ],
      shortlisted: false,
    },
    {
      id: 'tanvir-ahmed-football',
      name: 'Tanvir Ahmed',
      avatarUrl: null,
      verifiedBadge: false,
      rating: { average: 4.6, count: 14 },
      noShowCount: 0,
      lastActiveAt: '2026-10-26T18:00:00Z',
      location: {
        district: { id: 7, nameBn: 'সিলেট', nameEn: 'Sylhet' },
        upazila: { id: 8, nameBn: 'বিয়ানীবাজার', nameEn: 'Beanibazar' },
      },
      sports: [
        {
          sportId: 1,
          sportCode: 'football',
          positions: ['Goalkeeper'],
          skillLevel: 4,
          khepAvailable: true,
          rateMin: 1000,
          rateMax: 1800,
          travelRadius: 'UPAZILA',
          headline: 'Agile shot-stopper',
          experienceYears: 4,
          currentTeam: 'Beanibazar Stars',
          rating: { average: 4.6, count: 14 },
          statsVerified: false,
        },
      ],
      shortlisted: false,
    },
  ];

  const { data: serverPlayers } = useSearchPlayers({
    sportId: selectedSportId,
    districtId: selectedDistrictId ?? undefined,
    position: selectedPosition || undefined,
    khepOnly,
    verifiedOnly,
    skillLevel: minSkill || undefined,
    rateMax: maxRate ? parseInt(maxRate, 10) : undefined,
    query: searchQuery || undefined,
  });

  const players =
    serverPlayers && serverPlayers.length > 0 ? serverPlayers : samplePlayers;

  const filteredPlayers = players.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesSport = p.sports.some((s) => s.sportCode.toLowerCase().includes(q));
      const matchesUpazila =
        p.location.upazila.nameBn.toLowerCase().includes(q) ||
        p.location.upazila.nameEn.toLowerCase().includes(q);
      if (!matchesName && !matchesSport && !matchesUpazila) return false;
    }
    if (selectedSportId) {
      if (!p.sports.some((s) => s.sportId === selectedSportId)) return false;
    }
    if (khepOnly) {
      if (!p.sports.some((s) => s.khepAvailable)) return false;
    }
    if (verifiedOnly && !p.verifiedBadge) return false;
    if (minSkill > 0) {
      if (!p.sports.some((s) => s.skillLevel >= minSkill)) return false;
    }
    return true;
  });

  const handleShortlistToggle = (profileId: string, currentSaved: boolean) => {
    void toggleShortlistMutation.mutateAsync({
      profileId,
      shortlisted: !currentSaved,
    });
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title & View Toggle */}
      <PhLargeTitleBar
        title="Discover Players"
        subtitle="Search verified grassroots players across Bangladesh by sport, position, area, and fee."
        actions={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'CARD' ? 'LIST' : 'CARD')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--ph-surface)] border border-[var(--ph-border)] text-[var(--ph-text)] hover:bg-[var(--ph-surface-alt)]"
            >
              {viewMode === 'CARD' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            </button>
            <PhButton
              variant="secondary"
              label="Shortlist"
              icon={<Heart className="h-4 w-4" />}
              onPressed={() => router.push('/recruiter/shortlist')}
            />
          </div>
        }
      />

      {/* Search Input Bar with Filter Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <PhInput
            leading={<Search className="h-4 w-4" />}
            placeholder="Search players by name, sport, or upazila…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterDrawerOpen(true)}
          className={cn(
            'flex h-[48px] items-center gap-2 rounded-2xl px-4 tx-subhead font-semibold transition-all border',
            selectedDistrictId || khepOnly || verifiedOnly || minSkill > 0
              ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)] border-[var(--ph-accent)]/30'
              : 'bg-[var(--ph-surface)] text-[var(--ph-text)] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <PhChip
          label="All Sports"
          selected={selectedSportId === undefined}
          onTap={() => setSelectedSportId(undefined)}
        />
        {sportsCatalog.map((sport) => {
          const isSel = selectedSportId === sport.id;
          return (
            <PhChip
              key={sport.id}
              label={locale === 'bn' ? sport.nameBn : sport.nameEn}
              selected={isSel}
              onTap={() => setSelectedSportId(isSel ? undefined : sport.id)}
            />
          );
        })}

        <div className="h-5 w-[1px] bg-[var(--ph-border)] mx-1" />

        <PhChip
          label="Paid Khep"
          selected={khepOnly}
          icon={<DollarSign className="h-3.5 w-3.5" />}
          onTap={() => setKhepOnly(!khepOnly)}
        />

        <PhChip
          label="Verified"
          selected={verifiedOnly}
          icon={<UserCheck className="h-3.5 w-3.5" />}
          onTap={() => setVerifiedOnly(!verifiedOnly)}
        />
      </div>

      {/* Players Results Grid / List */}
      <div
        className={cn(
          'grid gap-4',
          viewMode === 'CARD'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1',
        )}
      >
        {filteredPlayers.map((player) => {
          const primarySport = player.sports[0];
          const upazilaName = locale === 'bn' ? player.location.upazila.nameBn : player.location.upazila.nameEn;
          const districtName = locale === 'bn' ? player.location.district.nameBn : player.location.district.nameEn;

          return (
            <PlayerTileCard
              key={player.id}
              player={{
                id: player.id,
                name: player.name,
                avatarUrl: player.avatarUrl,
                verifiedBadge: player.verifiedBadge,
                sportName: primarySport?.sportCode ? primarySport.sportCode.toUpperCase() : 'Football',
                positions: primarySport?.positions ?? ['ALL'],
                experienceYears: primarySport?.experienceYears ?? undefined,
                ratingAverage: player.rating.average,
                ratingCount: player.rating.count,
                upazilaName,
                districtName,
                khepAvailable: primarySport?.khepAvailable,
                rateMin: primarySport?.rateMin,
                rateMax: primarySport?.rateMax,
                shortlisted: player.shortlisted,
              }}
              onTap={() => router.push(`/p/${player.id}`)}
            />
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="py-16 text-center">
          <Trophy className="mx-auto h-12 w-12 text-[var(--ph-text-tertiary)] opacity-60" />
          <h3 className="mt-3 tx-headline text-[var(--ph-text)]">
            No matching players
          </h3>
          <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
            Try loosening your filters or expanding your search district.
          </p>
        </div>
      )}

      {/* Advanced Filter Bottom Sheet */}
      <PhBottomSheet
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        title="Filter Players"
      >
        <div className="space-y-5 pt-2">
          {/* Minimum Skill Level */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Minimum Skill Level
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map((lvl) => (
                <PhChip
                  key={lvl}
                  label={lvl === 0 ? 'Any' : `${lvl} Stars & up`}
                  selected={minSkill === lvl}
                  onTap={() => setMinSkill(lvl)}
                />
              ))}
            </div>
          </div>

          {/* Division Filter */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Division
            </label>
            <div className="flex flex-wrap gap-1.5">
              {divisions.map((div) => (
                <PhChip
                  key={div.id}
                  label={locale === 'bn' ? div.nameBn : div.nameEn}
                  selected={selectedDivisionId === div.id}
                  dense
                  onTap={() => {
                    setSelectedDivisionId(selectedDivisionId === div.id ? null : div.id);
                    setSelectedDistrictId(null);
                  }}
                />
              ))}
            </div>
          </div>

          {/* District Filter */}
          {selectedDivisionId && districts.length > 0 && (
            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                District
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {districts.map((d) => (
                  <PhChip
                    key={d.id}
                    label={locale === 'bn' ? d.nameBn : d.nameEn}
                    selected={selectedDistrictId === d.id}
                    dense
                    onTap={() =>
                      setSelectedDistrictId(selectedDistrictId === d.id ? null : d.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Max Rate Filter */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Max Khep Fee (৳)
            </label>
            <PhInput
              type="number"
              placeholder="e.g. 2500"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[var(--ph-border)]">
            <PhButton
              variant="secondary"
              label="Reset"
              onPressed={() => {
                setSelectedDivisionId(null);
                setSelectedDistrictId(null);
                setKhepOnly(false);
                setVerifiedOnly(false);
                setMinSkill(0);
                setMaxRate('');
              }}
            />
            <PhButton
              label="Apply Filters"
              onPressed={() => setFilterDrawerOpen(false)}
            />
          </div>
        </div>
      </PhBottomSheet>
    </div>
  );
}

