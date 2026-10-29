'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Sparkles, ShieldCheck, UserCheck, Eye } from 'lucide-react';
import { Link, useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhBadge,
  PhButton,
  PhCard,
  PhIllustration,
  PhRadius,
  PhSectionHeader,
  PitchBackdrop,
} from '@/design-system';
import { PlayerTileCard, RequestCardView } from '@/components/shared/domain-cards';

export default function PublicLandingPreviewPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  return (
    <div className="space-y-12">
      {/* Hero Banner with PitchBackdrop */}
      <div
        style={{ borderRadius: `${PhRadius.xl}px` }}
        className="relative overflow-hidden border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14"
      >
        <PitchBackdrop className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <PhBadge
              label={t('webTagline')}
              tone="accent"
              icon={<Sparkles className="h-3.5 w-3.5" />}
            />
            <h1 className="tx-large-title sm:text-[42px] sm:leading-[1.15] text-[var(--ph-text)]">
              {t('authHeadline')}
            </h1>
            <p className="tx-body text-[var(--ph-text-secondary)] max-w-xl">
              {t('authSubhead')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <PhButton
                label={t('navGallery')}
                icon={<Eye className="h-5 w-5" />}
                expand={false}
                onPressed={() => router.push('/gallery')}
              />
              <PhButton
                label={t('shellPlayer')}
                variant="secondary"
                icon={<UserCheck className="h-5 w-5" />}
                expand={false}
                onPressed={() => router.push('/player')}
              />
              <PhButton
                label={t('shellRecruiter')}
                variant="outline"
                icon={<ShieldCheck className="h-5 w-5" />}
                expand={false}
                onPressed={() => router.push('/recruiter')}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <GlassContainer radius={PhRadius.lg} shadow className="p-4">
              <div className="tx-overline mb-2">{t('homeFeatured')}</div>
              <PlayerTileCard
                player={{
                  id: 'hero-p-1',
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
                }}
                showShortlist={false}
                onTap={() => router.push('/player')}
              />
            </GlassContainer>
          </div>
        </div>
      </div>

      {/* 3 Pillars (Find, Hire, Rate) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PhCard className="flex flex-col items-center text-center p-6">
            <PhIllustration kind="find" size={110} />
            <h2 className="mt-4 tx-title3">{t('onbFindTitle')}</h2>
            <p className="mt-2 tx-subhead">{t('onbFindBody')}</p>
          </PhCard>
          <PhCard className="flex flex-col items-center text-center p-6">
            <PhIllustration kind="hire" size={110} />
            <h2 className="mt-4 tx-title3">{t('onbHireTitle')}</h2>
            <p className="mt-2 tx-subhead">{t('onbHireBody')}</p>
          </PhCard>
          <PhCard className="flex flex-col items-center text-center p-6">
            <PhIllustration kind="rate" size={110} />
            <h2 className="mt-4 tx-title3">{t('onbRateTitle')}</h2>
            <p className="mt-2 tx-subhead">{t('onbRateBody')}</p>
          </PhCard>
        </div>
      </section>

      {/* Live Preview of Open Recruitment Requests */}
      <section>
        <PhSectionHeader
          title={t('homeNearby')}
          actionLabel={t('navGallery')}
          onAction={() => router.push('/gallery')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RequestCardView
            request={{
              id: 'pub-req-1',
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
            onTap={() => router.push('/player')}
          />
          <RequestCardView
            request={{
              id: 'pub-req-2',
              whenText: locale === 'bn' ? 'আগামীকাল · বিকেল ৪:০০' : 'Tomorrow · 4:00 PM',
              sportName: locale === 'bn' ? 'ক্রিকেট' : 'Cricket',
              positionsText: 'BATTER, PACE_BOWLER',
              venueText: locale === 'bn' ? 'বরিশাল জেলা স্টেডিয়াম' : 'Barishal District Stadium',
              locationShort: locale === 'bn' ? 'বরিশাল সদর' : 'Barishal Sadar',
              isPaid: true,
              budgetMin: 800,
              budgetMax: 1200,
              spotsLeft: 3,
              isEvent: true,
              title: locale === 'bn' ? 'অনূর্ধ্ব-১৯ পেস বোলিং ট্রায়াল' : 'Under-19 Pace Bowling Trial',
              captainName: 'Mahin Sardar',
              captainRatingAvg: 4.7,
              captainRatingCount: 24,
            }}
            onTap={() => router.push('/recruiter')}
          />
        </div>
      </section>
    </div>
  );
}

