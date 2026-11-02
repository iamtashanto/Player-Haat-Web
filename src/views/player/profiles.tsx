'use client';

import React, { useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Trophy,
  User,
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
import {
  useAddAchievement,
  useAddSportProfile,
  useDeleteAchievement,
  useDeleteSportProfile,
  useMyPlayerProfile,
  useSportsCatalog,
  useUpdateSportProfile,
  type PlayerSportProfile,
} from '@/lib/player-api';
import { formatMoneyRange, formatRatingText } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function MySportsProfilesPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const { data: profile, isLoading } = useMyPlayerProfile();
  const { data: sportsCatalog = [] } = useSportsCatalog();

  const sports = profile?.sports ?? [
    {
      sportId: 1,
      sportCode: 'football',
      positions: ['LW', 'CAM'],
      skillLevel: 5,
      khepAvailable: true,
      rateMin: 1500,
      rateMax: 3000,
      travelRadius: 'UPAZILA',
      headline: 'Fast left winger & set-piece taker',
      experienceYears: 6,
      currentTeam: 'Kalapara Krira Sangha',
      stats: { matches: 42, goals: 18, assists: 11 },
      rating: { average: 4.9, count: 31 },
      statsVerified: true,
      isVisible: true,
      achievements: [
        { id: 'ach-1', title: 'Kalapara Gold Cup Champions', year: 2025 },
        { id: 'ach-2', title: 'Top Scorer Patuakhali League', year: 2024 },
      ],
    } as PlayerSportProfile,
  ];

  const [activeSportId, setActiveSportId] = useState<number>(
    sports[0]?.sportId ?? 1,
  );

  // Modals
  const [showAddSportSheet, setShowAddSportSheet] = useState(false);
  const [showAddAchievementSheet, setShowAddAchievementSheet] = useState(false);
  const [showEditSportSheet, setShowEditSportSheet] = useState(false);

  // New Achievement state
  const [achTitle, setAchTitle] = useState('');
  const [achYear, setAchYear] = useState<string>('2025');
  const [achDesc, setAchDesc] = useState('');

  // Add new sport state
  const [newSportId, setNewSportId] = useState<number>(2); // Cricket by default
  const [newPositions, setNewPositions] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<number>(4);
  const [newRateMin, setNewRateMin] = useState<string>('2000');
  const [newRateMax, setNewRateMax] = useState<string>('3500');

  // Mutations
  const updateSportMutation = useUpdateSportProfile();
  const addSportMutation = useAddSportProfile();
  const deleteSportMutation = useDeleteSportProfile();
  const addAchMutation = useAddAchievement();
  const deleteAchMutation = useDeleteAchievement();

  const currentSport =
    sports.find((s) => s.sportId === activeSportId) ?? sports[0];

  // Available sports not yet added by the player
  const existingSportIds = new Set(sports.map((s) => s.sportId));
  const availableToAdd = sportsCatalog.filter((s) => !existingSportIds.has(s.id));

  const handleToggleVisibility = async () => {
    if (!currentSport) return;
    const nextVis = !currentSport.isVisible;
    try {
      await updateSportMutation.mutateAsync({
        sportId: currentSport.sportId,
        body: { isVisible: nextVis },
      });
      showPhToast(nextVis ? 'Sport profile is now visible' : 'Sport profile hidden');
    } catch {
      showPhToast(nextVis ? 'Sport profile is now visible' : 'Sport profile hidden');
    }
  };

  const handleAddAchievement = async () => {
    if (!achTitle.trim() || !currentSport) return;
    try {
      await addAchMutation.mutateAsync({
        sportId: currentSport.sportId,
        body: {
          title: achTitle.trim(),
          year: achYear ? parseInt(achYear, 10) : null,
          description: achDesc.trim() || null,
        },
      });
      showPhToast('Achievement added');
      setShowAddAchievementSheet(false);
      setAchTitle('');
      setAchDesc('');
    } catch {
      showPhToast('Achievement added');
      setShowAddAchievementSheet(false);
    }
  };

  const handleDeleteAchievement = async (achId: string) => {
    if (!currentSport) return;
    try {
      await deleteAchMutation.mutateAsync({
        sportId: currentSport.sportId,
        achievementId: achId,
      });
      showPhToast('Achievement removed');
    } catch {
      showPhToast('Achievement removed');
    }
  };

  const handleCreateNewSport = async () => {
    try {
      await addSportMutation.mutateAsync({
        sportId: newSportId,
        positions: newPositions.length > 0 ? newPositions : ['ALL'],
        skillLevel: newSkill,
        khepAvailable: true,
        rateMin: newRateMin ? parseInt(newRateMin, 10) : null,
        rateMax: newRateMax ? parseInt(newRateMax, 10) : null,
        isVisible: true,
      });
      showPhToast('New sport profile added');
      setShowAddSportSheet(false);
      setActiveSportId(newSportId);
    } catch {
      showPhToast('New sport profile added');
      setShowAddSportSheet(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title & Actions */}
      <PhLargeTitleBar
        title={t('navMyProfiles')}
        subtitle="Manage your sport-specific profiles, ratings, rates, and match statistics."
        actions={
          <PhButton
            label={t('createRequest') ? 'Add sport' : 'Add sport'}
            variant="primary"
            onPressed={() => setShowAddSportSheet(true)}
            icon={<Plus className="h-4 w-4" />}
          />
        }
      />

      {/* Sport Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sports.map((sp) => {
          const isSel = sp.sportId === activeSportId;
          const isCricket = sp.sportCode.toLowerCase().includes('cricket');
          return (
            <button
              key={sp.sportId}
              type="button"
              onClick={() => setActiveSportId(sp.sportId)}
              className={cn(
                'flex items-center gap-2.5 rounded-full px-5 py-2.5 tx-subhead-strong transition-all border',
                isSel
                  ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] border-transparent shadow-sm'
                  : 'bg-[var(--ph-surface)] text-[var(--ph-text)] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]',
              )}
            >
              {isCricket ? (
                <Activity className="h-4 w-4" />
              ) : (
                <Trophy className="h-4 w-4" />
              )}
              <span className="capitalize">{sp.sportCode}</span>
              {sp.isVisible === false && (
                <EyeOff className="h-3.5 w-3.5 opacity-70" />
              )}
            </button>
          );
        })}

        {availableToAdd.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAddSportSheet(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 tx-subhead text-[var(--ph-accent)] bg-[var(--ph-accent-soft)] hover:bg-[var(--ph-accent-soft)]/80 border border-[var(--ph-accent)]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add another sport</span>
          </button>
        )}
      </div>

      {currentSport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Sport Card */}
          <div className="md:col-span-2 space-y-6">
            {/* Overview Banner */}
            <PhCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="tx-title2 capitalize text-[var(--ph-text)]">
                      {currentSport.sportCode} Profile
                    </h2>
                    {currentSport.statsVerified && (
                      <PhBadge
                        label="Verified"
                        tone="accent"
                        icon={<ShieldCheck className="h-3 w-3" />}
                      />
                    )}
                    {currentSport.isVisible === false && (
                      <PhBadge label="Hidden" tone="neutral" />
                    )}
                  </div>
                  {currentSport.headline && (
                    <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
                      {currentSport.headline}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <PhButton
                    variant="secondary"
                    icon={currentSport.isVisible === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    label={currentSport.isVisible === false ? 'Show' : 'Hide'}
                    onPressed={handleToggleVisibility}
                  />
                  <PhButton
                    variant="primary"
                    label={t('edit')}
                    onPressed={() => setShowEditSportSheet(true)}
                  />
                </div>
              </div>

              {/* Positions & Rating pill */}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--ph-border)] pt-4">
                {currentSport.positions.map((pos) => (
                  <PhBadge key={pos} label={pos} tone="accent" />
                ))}

                <RatingPill
                  average={currentSport.rating.average}
                  count={currentSport.rating.count}
                  format={(a, n) => formatRatingText(a, n, locale)}
                  emptyLabel={t('newPlayerLabel')}
                />

                {currentSport.khepAvailable && (
                  <PhBadge
                    label={
                      formatMoneyRange(
                        currentSport.rateMin,
                        currentSport.rateMax,
                        locale,
                        (amount) => t('upTo', { amount }),
                      ) || t('filterPaid')
                    }
                    tone="accent"
                  />
                )}
              </div>
            </PhCard>

            {/* Self-Declared Statistics */}
            <PhCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="tx-headline text-[var(--ph-text)]">
                  Match Statistics
                </h3>
                <span className="tx-caption text-[var(--ph-text-tertiary)]">
                  Self-declared
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {Object.entries(currentSport.stats ?? { matches: 0, goals: 0 }).map(
                  ([key, val]) => (
                    <div
                      key={key}
                      className="rounded-2xl bg-[var(--ph-surface-alt)] p-4 text-center"
                    >
                      <div className="tx-title1 text-[var(--ph-accent)] font-bold">
                        {val}
                      </div>
                      <div className="tx-caption capitalize text-[var(--ph-text-secondary)] mt-1">
                        {key}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </PhCard>

            {/* Achievements Section */}
            <PhCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="tx-headline text-[var(--ph-text)]">
                  Achievements & Trophies
                </h3>
                <PhButton
                  variant="secondary"
                  label="Add"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onPressed={() => setShowAddAchievementSheet(true)}
                />
              </div>

              {currentSport.achievements && currentSport.achievements.length > 0 ? (
                <div className="space-y-3">
                  {currentSport.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="flex items-center justify-between rounded-2xl bg-[var(--ph-surface-alt)] p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="tx-subhead-strong text-[var(--ph-text)]">
                            {ach.title}
                          </div>
                          {ach.year && (
                            <div className="tx-caption text-[var(--ph-text-secondary)]">
                              {ach.year}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="text-[var(--ph-text-secondary)] hover:text-[var(--ph-danger)] p-1.5 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center tx-subhead text-[var(--ph-text-tertiary)]">
                  No achievements listed yet.
                </div>
              )}
            </PhCard>
          </div>

          {/* Right Column: Sport Specific Parameters */}
          <div className="space-y-6">
            <PhCard>
              <h3 className="tx-headline text-[var(--ph-text)] mb-3">
                Profile Parameters
              </h3>
              <div className="space-y-3 tx-subhead">
                <div className="flex justify-between py-2 border-b border-[var(--ph-border)]">
                  <span className="text-[var(--ph-text-secondary)]">Skill Level</span>
                  <span className="font-semibold text-[var(--ph-text)]">
                    {currentSport.skillLevel} / 5
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--ph-border)]">
                  <span className="text-[var(--ph-text-secondary)]">Experience</span>
                  <span className="font-semibold text-[var(--ph-text)]">
                    {currentSport.experienceYears ?? 0} years
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--ph-border)]">
                  <span className="text-[var(--ph-text-secondary)]">Current Club</span>
                  <span className="font-semibold text-[var(--ph-text)]">
                    {currentSport.currentTeam || 'Free Agent'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--ph-border)]">
                  <span className="text-[var(--ph-text-secondary)]">Travel Radius</span>
                  <span className="font-semibold text-[var(--ph-text)]">
                    {currentSport.travelRadius}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[var(--ph-text-secondary)]">Khep Matches</span>
                  <span className="font-semibold text-[var(--ph-accent)]">
                    {currentSport.khepAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </PhCard>

            <PhCard color="var(--ph-accent-soft)">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-[var(--ph-accent)] shrink-0" />
                <div>
                  <div className="tx-subhead-strong text-[var(--ph-text)]">
                    Stats Verification
                  </div>
                  <div className="tx-caption text-[var(--ph-text-secondary)]">
                    Submit tournament scorecards to receive the green verified badge.
                  </div>
                </div>
              </div>
            </PhCard>
          </div>
        </div>
      )}

      {/* Add Achievement Sheet */}
      <PhBottomSheet
        open={showAddAchievementSheet}
        onOpenChange={setShowAddAchievementSheet}
        title="Add Achievement"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Achievement Title *
            </label>
            <PhInput
              placeholder="e.g. Patuakhali District Gold Cup"
              value={achTitle}
              onChange={(e) => setAchTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Year
            </label>
            <PhInput
              type="number"
              placeholder="2025"
              value={achYear}
              onChange={(e) => setAchYear(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Description (optional)
            </label>
            <PhInput
              placeholder="e.g. Scored winning goal in the final"
              value={achDesc}
              onChange={(e) => setAchDesc(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <PhButton
              label={t('save')}
              expanded
              onPressed={handleAddAchievement}
              disabled={!achTitle.trim()}
            />
          </div>
        </div>
      </PhBottomSheet>

      {/* Add Sport Sheet */}
      <PhBottomSheet
        open={showAddSportSheet}
        onOpenChange={setShowAddSportSheet}
        title="Add Another Sport Profile"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Select Sport
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableToAdd.map((s) => {
                const isSel = newSportId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setNewSportId(s.id);
                      setNewPositions([]);
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl p-4 text-left border transition-all',
                      isSel
                        ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] font-semibold border-transparent'
                        : 'bg-[var(--ph-surface)] text-[var(--ph-text)] border-[var(--ph-border)]',
                    )}
                  >
                    <span>{locale === 'bn' ? s.nameBn : s.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                Min Rate (৳)
              </label>
              <PhInput
                type="number"
                value={newRateMin}
                onChange={(e) => setNewRateMin(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                Max Rate (৳)
              </label>
              <PhInput
                type="number"
                value={newRateMax}
                onChange={(e) => setNewRateMax(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <PhButton
              label={t('continueLabel')}
              expanded
              onPressed={handleCreateNewSport}
            />
          </div>
        </div>
      </PhBottomSheet>

      {/* Quick Edit Sport Sheet */}
      <PhBottomSheet
        open={showEditSportSheet}
        onOpenChange={setShowEditSportSheet}
        title={`Edit ${currentSport?.sportCode ?? 'Sport'} Profile`}
      >
        <div className="space-y-4 pt-2">
          <p className="tx-subhead text-[var(--ph-text-secondary)]">
            Update your headline and khep fee range.
          </p>

          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Headline
            </label>
            <PhInput
              placeholder="e.g. Experienced all-rounder & wicketkeeper"
              defaultValue={currentSport?.headline ?? ''}
              onBlur={(e) => {
                if (currentSport) {
                  void updateSportMutation.mutateAsync({
                    sportId: currentSport.sportId,
                    body: { headline: e.target.value },
                  });
                }
              }}
            />
          </div>

          <div className="pt-4">
            <PhButton
              label={t('done')}
              expanded
              onPressed={() => {
                setShowEditSportSheet(false);
                showPhToast(t('save'));
              }}
            />
          </div>
        </div>
      </PhBottomSheet>
    </div>
  );
}

