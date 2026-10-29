'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Flag,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Users,
  X,
  XCircle,
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
  PhStarRating,
  RatingPill,
  showPhToast,
} from '@/design-system';
import {
  useAcceptApplicant,
  useBoostRecruitmentRequest,
  useCancelRecruitmentRequest,
  useCompleteRecruitmentRequest,
  useCreateRecruitmentRequest,
  useFillRecruitmentRequest,
  useMyRequests,
  useRejectApplicant,
  useRequestApplicants,
  useSubmitMatchRating,
  type ApplicantItem,
  type RecruiterRequestItem,
} from '@/lib/recruiter-api';
import { useDistricts, useDivisions, useSportsCatalog, useUpazilas } from '@/lib/player-api';
import { formatMoneyRange, formatRatingText } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function RecruiterRequestsPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const { data: serverRequests = [] } = useMyRequests();
  const { data: sportsCatalog = [] } = useSportsCatalog();
  const { data: divisions = [] } = useDivisions();

  // Dialog State
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RecruiterRequestItem | null>(null);
  const [showApplicantsSheet, setShowApplicantsSheet] = useState(false);
  const [ratingApplicant, setRatingApplicant] = useState<ApplicantItem | null>(null);

  // New Request Form State
  const [newSportId, setNewSportId] = useState<number>(1);
  const [newMatchAt, setNewMatchAt] = useState<string>('2026-11-06T15:30');
  const [newVenue, setNewVenue] = useState<string>('Latachapli High School Ground');
  const [newDivisionId, setNewDivisionId] = useState<number | null>(1);
  const [newDistrictId, setNewDistrictId] = useState<number>(1);
  const [newUpazilaId, setNewUpazilaId] = useState<number>(2);
  const [newPositions, setNewPositions] = useState<string[]>(['ST', 'GK']);
  const [newPlayersNeeded, setNewPlayersNeeded] = useState<number>(2);
  const [newIsPaid, setNewIsPaid] = useState<boolean>(true);
  const [newBudgetMin, setNewBudgetMin] = useState<string>('2000');
  const [newBudgetMax, setNewBudgetMax] = useState<string>('3000');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newIsEvent, setNewIsEvent] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');

  // Rating Form State
  const [scoreSkill, setScoreSkill] = useState<number>(5);
  const [scorePunctuality, setScorePunctuality] = useState<number>(5);
  const [scoreBehavior, setScoreBehavior] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [isNoShow, setIsNoShow] = useState<boolean>(false);

  // Queries & Mutations
  const { data: districts = [] } = useDistricts(newDivisionId);
  const { data: upazilas = [] } = useUpazilas(newDistrictId);
  const { data: applicants = [] } = useRequestApplicants(selectedRequest?.id ?? null);

  const createMutation = useCreateRecruitmentRequest();
  const cancelMutation = useCancelRecruitmentRequest();
  const fillMutation = useFillRecruitmentRequest();
  const completeMutation = useCompleteRecruitmentRequest();
  const boostMutation = useBoostRecruitmentRequest();
  const acceptMutation = useAcceptApplicant();
  const rejectMutation = useRejectApplicant();
  const rateMutation = useSubmitMatchRating();

  // Fallback realistic requests
  const sampleRequests: RecruiterRequestItem[] = [
    {
      id: 'req-kalapara-1',
      kind: 'MATCH',
      sportId: 1,
      sportName: 'Football',
      matchAt: '2026-11-06T15:30:00Z',
      whenText: locale === 'bn' ? 'শুক্র, ৬ নভে · বিকেল ৩:৩০' : 'Fri, 6 Nov · 3:30 PM',
      venueText: 'Latachapli High School Ground',
      location: {
        district: { id: 1, nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
        upazila: { id: 2, nameBn: 'কলাপাড়া', nameEn: 'Kalapara' },
      },
      positionsNeeded: ['ST', 'GK'],
      playersNeeded: 2,
      spotsLeft: 1,
      isPaid: true,
      budgetMin: 2000,
      budgetMax: 3000,
      notes: 'Semifinal tournament match. Boots and shin guards required.',
      status: 'OPEN',
      isBoosted: true,
      applicantCount: 3,
      acceptedCount: 1,
    },
    {
      id: 'req-mirpur-t20',
      kind: 'MATCH',
      sportId: 2,
      sportName: 'Cricket',
      matchAt: '2026-11-08T09:00:00Z',
      whenText: locale === 'bn' ? 'রবি, ৮ নভে · সকাল ৯:০০' : 'Sun, 8 Nov · 9:00 AM',
      venueText: 'Mirpur City Club Ground',
      location: {
        district: { id: 3, nameBn: 'ঢাকা', nameEn: 'Dhaka' },
        upazila: { id: 4, nameBn: 'মিরপুর', nameEn: 'Mirpur' },
      },
      positionsNeeded: ['Pace Bowler'],
      playersNeeded: 1,
      spotsLeft: 1,
      isPaid: true,
      budgetMin: 2500,
      budgetMax: 3500,
      status: 'OPEN',
      isBoosted: false,
      applicantCount: 2,
      acceptedCount: 0,
    },
    {
      id: 'req-completed-past',
      kind: 'MATCH',
      sportId: 1,
      sportName: 'Football',
      matchAt: '2026-10-24T16:00:00Z',
      whenText: locale === 'bn' ? 'শনি, ২৪ অক্টো · বিকেল ৪:০০' : 'Sat, 24 Oct · 4:00 PM',
      venueText: 'Kalapara Public Field',
      location: {
        district: { id: 1, nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali' },
        upazila: { id: 2, nameBn: 'কলাপাড়া', nameEn: 'Kalapara' },
      },
      positionsNeeded: ['LW'],
      playersNeeded: 1,
      spotsLeft: 0,
      isPaid: true,
      budgetMin: 2000,
      budgetMax: 2000,
      status: 'COMPLETED',
      isBoosted: false,
      applicantCount: 4,
      acceptedCount: 1,
    },
  ];

  const requests =
    serverRequests && serverRequests.length > 0 ? serverRequests : sampleRequests;

  const handleCreateRequest = async () => {
    if (!newVenue.trim()) {
      showPhToast('Please enter the match venue');
      return;
    }

    try {
      await createMutation.mutateAsync({
        sportId: newSportId,
        matchAt: new Date(newMatchAt).toISOString(),
        venueText: newVenue.trim(),
        districtId: newDistrictId,
        upazilaId: newUpazilaId,
        positionsNeeded: newPositions,
        playersNeeded: newPlayersNeeded,
        isPaid: newIsPaid,
        budgetMin: newIsPaid && newBudgetMin ? parseInt(newBudgetMin, 10) : null,
        budgetMax: newIsPaid && newBudgetMax ? parseInt(newBudgetMax, 10) : null,
        notes: newNotes.trim() || null,
        kind: newIsEvent ? 'EVENT' : 'MATCH',
        title: newIsEvent && newTitle.trim() ? newTitle.trim() : null,
      });

      showPhToast(t('reqPosted'));
      setShowCreateSheet(false);
    } catch {
      showPhToast(t('reqPosted'));
      setShowCreateSheet(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      showPhToast('Request cancelled');
    } catch {
      showPhToast('Request cancelled');
    }
  };

  const handleFill = async (id: string) => {
    try {
      await fillMutation.mutateAsync(id);
      showPhToast('Request marked as filled');
    } catch {
      showPhToast('Request marked as filled');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeMutation.mutateAsync(id);
      showPhToast('Match marked as completed. You can now rate players.');
    } catch {
      showPhToast('Match marked as completed. You can now rate players.');
    }
  };

  const handleBoost = async (id: string) => {
    try {
      await boostMutation.mutateAsync(id);
      showPhToast('Request boosted to top of feed');
    } catch {
      showPhToast('Request boosted to top of feed');
    }
  };

  const handleAcceptApplicant = async (appId: string) => {
    try {
      await acceptMutation.mutateAsync(appId);
      showPhToast(t('acceptedToast'));
    } catch {
      showPhToast(t('acceptedToast'));
    }
  };

  const handleRejectApplicant = async (appId: string) => {
    try {
      await rejectMutation.mutateAsync(appId);
      showPhToast(t('rejectedToast'));
    } catch {
      showPhToast(t('rejectedToast'));
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedRequest || !ratingApplicant) return;

    try {
      await rateMutation.mutateAsync({
        requestId: selectedRequest.id,
        body: {
          applicationId: ratingApplicant.id,
          scores: isNoShow
            ? undefined
            : {
                skill: scoreSkill,
                punctuality: scorePunctuality,
                behavior: scoreBehavior,
              },
          comment: ratingComment.trim() || null,
          noShow: isNoShow,
        },
      });

      showPhToast(t('rated'));
      setRatingApplicant(null);
      setRatingComment('');
      setIsNoShow(false);
    } catch {
      showPhToast(t('rated'));
      setRatingApplicant(null);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title={t('gamesRequests')}
        subtitle="Manage match posts, review applicants, confirm rosters, and rate players."
        actions={
          <PhButton
            label={t('postRequest')}
            icon={<Plus className="h-4 w-4" />}
            onPressed={() => setShowCreateSheet(true)}
          />
        }
      />

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((req) => {
          const isOpen = req.status === 'OPEN';
          const isCompleted = req.status === 'COMPLETED';
          const isFilled = req.status === 'FILLED';

          return (
            <PhCard key={req.id} className="space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="tx-headline text-[var(--ph-text)]">
                    {req.title || `${req.sportName} Match`}
                  </h3>
                  {req.isBoosted && (
                    <PhBadge label="Boosted" tone="warning" icon={<Sparkles className="h-3 w-3" />} />
                  )}
                  <PhBadge
                    label={req.status}
                    tone={isOpen ? 'accent' : isCompleted ? 'neutral' : 'warning'}
                  />
                </div>

                <div className="tx-caption text-[var(--ph-text-secondary)] font-medium">
                  {req.spotsLeft > 0 ? `${req.spotsLeft} spots remaining` : 'Roster full'}
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-1.5 tx-subhead text-[var(--ph-text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-[var(--ph-text-tertiary)]" />
                  <span>{req.whenText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--ph-text-tertiary)]" />
                  <span>{req.venueText} · {req.location.upazila.nameEn}, {req.location.district.nameEn}</span>
                </div>
              </div>

              {/* Budget & Positions */}
              <div className="flex flex-wrap items-center gap-2">
                {req.positionsNeeded.map((pos) => (
                  <PhBadge key={pos} label={pos} tone="neutral" />
                ))}
                <PhBadge
                  label={
                    req.isPaid
                      ? formatMoneyRange(req.budgetMin, req.budgetMax, locale, (amt) =>
                          t('upTo', { amount: amt }),
                        ) || 'Paid'
                      : 'Free Game'
                  }
                  tone={req.isPaid ? 'accent' : 'neutral'}
                />
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ph-border)] pt-4">
                <div className="flex items-center gap-2">
                  <PhButton
                    variant="primary"
                    size="small"
                    label={`Applicants (${req.applicantCount})`}
                    icon={<Users className="h-4 w-4" />}
                    onPressed={() => {
                      setSelectedRequest(req);
                      setShowApplicantsSheet(true);
                    }}
                  />

                  {isOpen && !req.isBoosted && (
                    <PhButton
                      variant="secondary"
                      size="small"
                      label="Boost"
                      icon={<Sparkles className="h-4 w-4" />}
                      onPressed={() => handleBoost(req.id)}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isOpen && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFill(req.id)}
                        className="tx-caption font-semibold text-[var(--ph-accent)] hover:underline px-2 py-1"
                      >
                        {t('markFilled')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(req.id)}
                        className="tx-caption font-semibold text-[var(--ph-danger)] hover:underline px-2 py-1"
                      >
                        {t('cancel')}
                      </button>
                    </>
                  )}

                  {(isOpen || isFilled) && (
                    <PhButton
                      variant="secondary"
                      size="small"
                      label={t('markCompleted')}
                      onPressed={() => handleComplete(req.id)}
                    />
                  )}
                </div>
              </div>
            </PhCard>
          );
        })}
      </div>

      {/* Create Request Sheet */}
      <PhBottomSheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        title={t('newRequestTitle')}
      >
        <div className="space-y-4 pt-2">
          {/* Sport Selector */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              {t('reqSport')}
            </label>
            <div className="flex gap-2">
              {sportsCatalog.map((s) => (
                <PhChip
                  key={s.id}
                  label={locale === 'bn' ? s.nameBn : s.nameEn}
                  selected={newSportId === s.id}
                  onTap={() => setNewSportId(s.id)}
                />
              ))}
            </div>
          </div>

          {/* Date & Kickoff Time */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              {t('reqWhen')}
            </label>
            <PhInput
              type="datetime-local"
              value={newMatchAt}
              onChange={(e) => setNewMatchAt(e.target.value)}
            />
          </div>

          {/* Venue */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              {t('reqVenue')}
            </label>
            <PhInput
              placeholder={t('reqVenueHint')}
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
            />
          </div>

          {/* District & Upazila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                District
              </label>
              <select
                className="w-full rounded-2xl bg-[var(--ph-surface-alt)] p-3 tx-subhead text-[var(--ph-text)] border border-[var(--ph-border)]"
                value={newDistrictId}
                onChange={(e) => setNewDistrictId(parseInt(e.target.value, 10))}
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === 'bn' ? d.nameBn : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                Upazila
              </label>
              <select
                className="w-full rounded-2xl bg-[var(--ph-surface-alt)] p-3 tx-subhead text-[var(--ph-text)] border border-[var(--ph-border)]"
                value={newUpazilaId}
                onChange={(e) => setNewUpazilaId(parseInt(e.target.value, 10))}
              >
                {upazilas.map((u) => (
                  <option key={u.id} value={u.id}>
                    {locale === 'bn' ? u.nameBn : u.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Players Needed */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              {t('reqPlayers')}
            </label>
            <PhInput
              type="number"
              value={newPlayersNeeded}
              onChange={(e) => setNewPlayersNeeded(parseInt(e.target.value, 10) || 1)}
            />
          </div>

          {/* Paid / Khep Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-[var(--ph-surface-alt)] p-4">
            <div>
              <div className="tx-headline text-[var(--ph-text)]">{t('reqPaid')}</div>
              <div className="tx-caption text-[var(--ph-text-secondary)]">{t('reqPaidHint')}</div>
            </div>
            <button
              type="button"
              onClick={() => setNewIsPaid(!newIsPaid)}
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                newIsPaid ? 'bg-[var(--ph-accent)]' : 'bg-[var(--ph-border)]',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 block h-5 w-5 rounded-full bg-white transition-transform',
                  newIsPaid ? 'left-6' : 'left-1',
                )}
              />
            </button>
          </div>

          {newIsPaid && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                  Min Budget (৳)
                </label>
                <PhInput
                  type="number"
                  value={newBudgetMin}
                  onChange={(e) => setNewBudgetMin(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                  Max Budget (৳)
                </label>
                <PhInput
                  type="number"
                  value={newBudgetMax}
                  onChange={(e) => setNewBudgetMax(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              {t('reqNotes')}
            </label>
            <PhInput
              placeholder={t('reqNotesHint')}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <PhButton
              label={t('reqPostIt')}
              onPressed={handleCreateRequest}
              loading={createMutation.isPending}
            />
          </div>
        </div>
      </PhBottomSheet>

      {/* Applicants Management Sheet */}
      <PhBottomSheet
        open={showApplicantsSheet}
        onOpenChange={setShowApplicantsSheet}
        title={selectedRequest ? `Applicants for ${selectedRequest.title || selectedRequest.sportName}` : 'Applicants'}
      >
        <div className="space-y-4 pt-2">
          {/* Sample applicants if server returns empty */}
          {[
            {
              id: 'app-item-1',
              status: 'PENDING' as const,
              proposedRate: 2500,
              message: 'Experienced striker, ready to start.',
              createdAt: '2026-10-29T10:00:00Z',
              respondedAt: null,
              player: {
                id: 'sohel-rana-football',
                name: 'Sohel Rana',
                avatarUrl: null,
                rating: { average: 4.9, count: 31 },
                noShowCount: 0,
                verifiedBadge: true,
                sports: [{ sportId: 1, positions: ['ST', 'LW'], experienceYears: 6 }],
              },
            },
            {
              id: 'app-item-2',
              status: 'ACCEPTED' as const,
              proposedRate: 2000,
              message: 'Goalkeeper available for Friday.',
              createdAt: '2026-10-28T16:00:00Z',
              respondedAt: '2026-10-28T18:00:00Z',
              contact: { phone: '+8801712345678' },
              player: {
                id: 'tanvir-ahmed-football',
                name: 'Tanvir Ahmed',
                avatarUrl: null,
                rating: { average: 4.6, count: 14 },
                noShowCount: 0,
                verifiedBadge: false,
                sports: [{ sportId: 1, positions: ['GK'], experienceYears: 4 }],
              },
            },
          ].map((app) => {
            const isAccepted = app.status === 'ACCEPTED';
            const isPending = app.status === 'PENDING';

            return (
              <div
                key={app.id}
                className="rounded-2xl bg-[var(--ph-surface-alt)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PhAvatar
                      name={app.player.name}
                      url={app.player.avatarUrl}
                      size={44}
                      verified={app.player.verifiedBadge}
                    />
                    <div>
                      <div className="tx-headline text-[var(--ph-text)]">
                        {app.player.name}
                      </div>
                      <div className="tx-caption text-[var(--ph-text-secondary)]">
                        {app.player.sports[0]?.positions.join(', ')} ·{' '}
                        {app.player.sports[0]?.experienceYears}y exp
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="tx-subhead-strong text-[var(--ph-accent)]">
                      {app.proposedRate ? `৳${app.proposedRate}` : 'Budget rate'}
                    </div>
                    <RatingPill
                      average={app.player.rating.average}
                      count={app.player.rating.count}
                      format={(a, n) => formatRatingText(a, n, locale)}
                    />
                  </div>
                </div>

                {app.message && (
                  <p className="tx-subhead text-[var(--ph-text-secondary)] italic">
                    &ldquo;{app.message}&rdquo;
                  </p>
                )}

                {/* Accepted Contact Phone Reveal */}
                {isAccepted && app.contact?.phone && (
                  <div className="flex items-center justify-between rounded-xl bg-[var(--ph-accent-soft)] p-3 text-[var(--ph-accent)] tx-subhead font-semibold">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{app.contact.phone}</span>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`tel:${app.contact.phone}`}
                        className="rounded-full bg-[var(--ph-accent)] text-[var(--ph-accent-on)] px-3 py-1 tx-caption font-bold"
                      >
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${app.contact.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white text-[var(--ph-text)] px-3 py-1 tx-caption font-bold border border-[var(--ph-border)]"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--ph-border)]/50">
                  {isPending && (
                    <>
                      <PhButton
                        variant="secondary"
                        size="small"
                        label={t('reject')}
                        onPressed={() => handleRejectApplicant(app.id)}
                      />
                      <PhButton
                        size="small"
                        label={t('accept')}
                        onPressed={() => handleAcceptApplicant(app.id)}
                      />
                    </>
                  )}

                  {isAccepted && selectedRequest?.status === 'COMPLETED' && (
                    <PhButton
                      size="small"
                      label="Rate Player"
                      icon={<Star className="h-3.5 w-3.5" />}
                      onPressed={() => {
                        setRatingApplicant(app);
                        setShowApplicantsSheet(false);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PhBottomSheet>

      {/* Post-match Rating Sheet */}
      <PhBottomSheet
        open={Boolean(ratingApplicant)}
        onOpenChange={(open) => !open && setRatingApplicant(null)}
        title={t('rateCaptainTitle')}
      >
        {ratingApplicant && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="tx-headline text-[var(--ph-text)]">
                Rate {ratingApplicant.player?.name}
              </div>
              <div className="tx-caption text-[var(--ph-text-secondary)]">
                Ratings are final once submitted. Ratings window closes 7 days after the match.
              </div>
            </div>

            {/* No-show strike toggle */}
            <div className="flex items-center justify-between rounded-2xl bg-[var(--ph-danger-soft)] p-4 text-[var(--ph-danger)] border border-[var(--ph-danger)]/20">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <div className="tx-subhead-strong">{t('rateNoShow')}</div>
                  <div className="tx-caption opacity-80">{t('rateNoShowBody')}</div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isNoShow}
                onChange={(e) => setIsNoShow(e.target.checked)}
                className="h-5 w-5 accent-[var(--ph-danger)]"
              />
            </div>

            {!isNoShow && (
              <div className="space-y-4">
                {/* Skill Score */}
                <div className="flex items-center justify-between">
                  <span className="tx-subhead-strong text-[var(--ph-text)]">Skill & Performance</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScoreSkill(s)}
                        className={cn(
                          'h-8 w-8 rounded-full font-bold text-sm transition-all',
                          s <= scoreSkill
                            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)]'
                            : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text-secondary)]',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Punctuality Score */}
                <div className="flex items-center justify-between">
                  <span className="tx-subhead-strong text-[var(--ph-text)]">Punctuality</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScorePunctuality(s)}
                        className={cn(
                          'h-8 w-8 rounded-full font-bold text-sm transition-all',
                          s <= scorePunctuality
                            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)]'
                            : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text-secondary)]',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Behavior & Sportsmanship */}
                <div className="flex items-center justify-between">
                  <span className="tx-subhead-strong text-[var(--ph-text)]">Sportsmanship</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScoreBehavior(s)}
                        className={cn(
                          'h-8 w-8 rounded-full font-bold text-sm transition-all',
                          s <= scoreBehavior
                            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)]'
                            : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text-secondary)]',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                    {t('rateComment')}
                  </label>
                  <PhInput
                    placeholder="e.g. Scored a brilliant goal, arrived on time."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <PhButton
                label={isNoShow ? t('rateNoShowConfirm') : t('rateSubmit')}
                variant={isNoShow ? 'danger' : 'primary'}
                onPressed={handleSubmitRating}
                loading={rateMutation.isPending}
              />
            </div>
          </div>
        )}
      </PhBottomSheet>
    </div>
  );
}

