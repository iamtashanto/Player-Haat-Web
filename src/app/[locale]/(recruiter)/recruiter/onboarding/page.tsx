'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhBadge,
  PhButton,
  PhCard,
  PhChip,
  PhInput,
  PhLargeTitleBar,
  showPhToast,
} from '@/design-system';
import {
  useCreateRecruiterProfile,
  useRecruiterTypes,
  type RecruiterTypeCode,
} from '@/lib/recruiter-api';
import { useDistricts, useDivisions, useSportsCatalog } from '@/lib/player-api';
import { cn } from '@/lib/utils';

export default function RecruiterOnboardingPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Recruiter Type
  const [selectedType, setSelectedType] = useState<RecruiterTypeCode>('CLUB');

  // Step 2: Organization Name & Bio
  const [organization, setOrganization] = useState('');
  const [bio, setBio] = useState('');

  // Step 3: Location (District)
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(1);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(1);

  // Step 4: Sports Recruited For
  const [selectedSportIds, setSelectedSportIds] = useState<number[]>([1]); // Football by default

  const { data: recruiterTypes = [] } = useRecruiterTypes();
  const { data: divisions = [] } = useDivisions();
  const { data: districts = [] } = useDistricts(selectedDivisionId);
  const { data: sportsCatalog = [] } = useSportsCatalog();

  const createMutation = useCreateRecruiterProfile();

  const fallbackTypes: Array<{ code: RecruiterTypeCode; nameBn: string; nameEn: string }> = [
    { code: 'CLUB', nameBn: 'ক্লাব / দল', nameEn: 'Club / Team' },
    { code: 'ACADEMY', nameBn: 'একাডেমি', nameEn: 'Academy' },
    { code: 'SCOUT', nameBn: 'স্কাউট', nameEn: 'Scout' },
    { code: 'ORGANIZER', nameBn: 'টুর্নামেন্ট আয়োজক', nameEn: 'Tournament Organizer' },
    { code: 'AGENT', nameBn: 'এজেন্ট / ম্যানেজার', nameEn: 'Agent / Manager' },
    { code: 'OTHER', nameBn: 'অন্যান্য', nameEn: 'Other' },
  ];

  const typesToDisplay = recruiterTypes.length > 0 ? recruiterTypes : fallbackTypes;

  const toggleSport = (sportId: number) => {
    if (selectedSportIds.includes(sportId)) {
      if (selectedSportIds.length === 1) {
        showPhToast('Select at least one sport');
        return;
      }
      setSelectedSportIds(selectedSportIds.filter((id) => id !== sportId));
    } else {
      setSelectedSportIds([...selectedSportIds, sportId]);
    }
  };

  const handleFinish = async () => {
    if (!selectedDistrictId) {
      showPhToast('Please select a district');
      return;
    }

    try {
      await createMutation.mutateAsync({
        type: selectedType,
        organization: organization.trim() || null,
        bio: bio.trim() || null,
        districtId: selectedDistrictId,
        sportIds: selectedSportIds,
      });

      showPhToast(t('setupDone'));
      router.push('/recruiter');
    } catch {
      showPhToast(t('setupDone'));
      router.push('/recruiter');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      {/* Top Header & Progress */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : router.push('/recruiter'))}
          className="inline-flex items-center gap-1.5 tx-subhead text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{step > 1 ? t('back') : t('skip')}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                s === step
                  ? 'w-6 bg-[var(--ph-accent)]'
                  : s < step
                  ? 'w-2 bg-[var(--ph-accent)]/50'
                  : 'w-2 bg-[var(--ph-border)]',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/recruiter')}
          className="tx-subhead text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)]"
        >
          {t('skip')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="tx-title1 text-[var(--ph-text)]">
                What best describes you?
              </h1>
              <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
                This helps players recognize who is reaching out and recruiting them.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {typesToDisplay.map((item) => {
                const isSel = selectedType === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setSelectedType(item.code)}
                    className={cn(
                      'flex items-center justify-between rounded-2xl p-4 text-left border transition-all',
                      isSel
                        ? 'bg-[var(--ph-accent-soft)] border-[var(--ph-accent)] shadow-sm'
                        : 'bg-[var(--ph-surface)] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          isSel
                            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)]'
                            : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text)]',
                        )}
                      >
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <span className="tx-subhead-strong text-[var(--ph-text)]">
                        {locale === 'bn' ? item.nameBn : item.nameEn}
                      </span>
                    </div>

                    {isSel && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ph-accent)] text-[var(--ph-accent-on)]">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="tx-title1 text-[var(--ph-text)]">
                Organization or Team
              </h1>
              <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
                Tell players which club, team, or tournament you represent.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                  Club / Organization Name
                </label>
                <PhInput
                  placeholder="e.g. Abahani Youth Club, Kalapara Krira Sangha"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
                  Short Bio or Recruitment Goals
                </label>
                <PhInput
                  placeholder="e.g. Recruiting talented strikers and all-rounders for upcoming district league."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="tx-title1 text-[var(--ph-text)]">
                Primary District
              </h1>
              <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
                Where are your team&apos;s matches or trials primarily held?
              </p>
            </div>

            {/* Division Selector */}
            <div>
              <label className="mb-2 block tx-footnote text-[var(--ph-text-secondary)] font-medium">
                1. {t('pickDivision')}
              </label>
              <div className="flex flex-wrap gap-2">
                {divisions.map((div) => {
                  const isSel = selectedDivisionId === div.id;
                  return (
                    <PhChip
                      key={div.id}
                      label={locale === 'bn' ? div.nameBn : div.nameEn}
                      selected={isSel}
                      dense
                      onTap={() => {
                        setSelectedDivisionId(div.id);
                        setSelectedDistrictId(null);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* District Selector */}
            <div className="pt-2 border-t border-[var(--ph-border)]">
              <label className="mb-2 block tx-footnote text-[var(--ph-text-secondary)] font-medium">
                2. {t('pickDistrict')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {districts.map((d) => {
                  const isSel = selectedDistrictId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDistrictId(d.id)}
                      className={cn(
                        'flex items-center justify-between rounded-xl p-2.5 text-left text-sm transition-all',
                        isSel
                          ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] font-semibold shadow-sm'
                          : 'bg-[var(--ph-surface)] text-[var(--ph-text)] hover:bg-[var(--ph-surface-alt)] border border-[var(--ph-border)]',
                      )}
                    >
                      <span className="truncate">{locale === 'bn' ? d.nameBn : d.nameEn}</span>
                      {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="tx-title1 text-[var(--ph-text)]">
                Sports Recruited For
              </h1>
              <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
                Select which sports you discover and recruit players for.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sportsCatalog.map((sport) => {
                const isSel = selectedSportIds.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => toggleSport(sport.id)}
                    className={cn(
                      'flex items-center justify-between rounded-3xl p-5 text-left border transition-all',
                      isSel
                        ? 'bg-[var(--ph-accent-soft)] border-[var(--ph-accent)] shadow-sm'
                        : 'bg-[var(--ph-surface)] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                          isSel
                            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)]'
                            : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text)]',
                        )}
                      >
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="tx-headline text-[var(--ph-text)]">
                          {locale === 'bn' ? sport.nameBn : sport.nameEn}
                        </div>
                        <div className="tx-caption text-[var(--ph-text-secondary)]">
                          {sport.positions.length} Positions
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
                        isSel
                          ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] border-transparent'
                          : 'border-[var(--ph-border)]',
                      )}
                    >
                      {isSel && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sticky Action Bar */}
      <div className="mt-10 flex items-center justify-between pt-4 border-t border-[var(--ph-border)]">
        {step > 1 ? (
          <PhButton
            variant="secondary"
            label={t('back')}
            onPressed={() => setStep(step - 1)}
          />
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <PhButton
            label={t('continueLabel')}
            onPressed={() => setStep(step + 1)}
            trailing={<ArrowRight className="h-4 w-4" />}
          />
        ) : (
          <PhButton
            label={t('finishSetup')}
            onPressed={handleFinish}
            loading={createMutation.isPending}
            trailing={<Check className="h-4 w-4" />}
          />
        )}
      </div>
    </div>
  );
}

