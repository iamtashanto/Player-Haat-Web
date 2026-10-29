'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import {
  Bell,
  DollarSign,
  Gauge,
  Home,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trophy,
  User,
} from 'lucide-react';
import { Link, usePathname, useRouter, type AppLocale } from '@/i18n/routing';
import { usePhPreferences } from '@/components/providers';
import {
  CardSkeleton,
  EmptyState,
  ErrorState,
  GlassContainer,
  OfflineBanner,
  PhAvatar,
  PhBackButton,
  PhBadge,
  PhButton,
  PhCard,
  PhChip,
  PhGlassSheet,
  PhGlassTabBar,
  PhGroup,
  PhIconButton,
  PhIllustration,
  PhLargeTitleBar,
  PhOtpField,
  PhPage,
  PhRadius,
  PhRow,
  PhSearchField,
  PhSectionHeader,
  PhSegmented,
  PhStepper,
  PhSwitchTile,
  PhTextField,
  RatingInput,
  RatingPill,
  RatingStars,
  showPhToast,
} from '@/design-system';
import { PlayerTileCard, RequestCardView } from '@/components/shared/domain-cards';
import { RoleSwitcherPill } from '@/components/shells/header-controls';
import { formatMoneyRange, formatNumber, formatRatingText } from '@/lib/format';

export default function ComponentGalleryPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { reduceEffects, setReduceEffects } = usePhPreferences();

  // Interactive demo states matching Flutter's _ComponentGalleryState
  const [loading, setLoading] = useState(false);
  const [khepSwitch, setKhepSwitch] = useState(true);
  const [stepperVal, setStepperVal] = useState(11);
  const [stars, setStars] = useState(4);
  const [segTime, setSegTime] = useState<'today' | 'week' | 'all'>('week');
  const [selectedPositions, setSelectedPositions] = useState<string[]>(['GK']);
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [otp, setOtp] = useState('042');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );
  };

  const colorSwatches: Array<{ name: string; cssVar: string }> = [
    { name: 'accent', cssVar: 'var(--ph-accent)' },
    { name: 'accentSoft', cssVar: 'var(--ph-accent-soft)' },
    { name: 'surface', cssVar: 'var(--ph-surface)' },
    { name: 'surfaceAlt', cssVar: 'var(--ph-surface-alt)' },
    { name: 'danger', cssVar: 'var(--ph-danger)' },
    { name: 'warning', cssVar: 'var(--ph-warning)' },
    { name: 'star', cssVar: 'var(--ph-star)' },
    { name: 'text', cssVar: 'var(--ph-text)' },
  ];

  return (
    <PhPage>
      <div className="mx-auto max-w-6xl pb-28">
        <PhLargeTitleBar
          title={t('galleryTitle')}
          subtitle={t('gallerySubtitle')}
          leading={<PhBackButton label={t('back')} onPressed={() => router.push('/')} />}
          actions={
            <div className="flex items-center gap-2">
              <RoleSwitcherPill />
              <Link href="/">
                <PhButton label={t('shellPublic')} variant="secondary" size="small" expand={false} />
              </Link>
              <Link href="/player">
                <PhButton label={t('shellPlayer')} variant="secondary" size="small" expand={false} />
              </Link>
              <Link href="/recruiter">
                <PhButton label={t('shellRecruiter')} variant="secondary" size="small" expand={false} />
              </Link>
            </div>
          }
        />

        {/* Responsive 2-column grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2 px-5 md:px-8">
          {/* 1. Appearance & Accessibility */}
          <section>
            <PhSectionHeader title={t('settingsAppearance')} />
            <PhCard className="space-y-3">
              <PhSegmented<'system' | 'light' | 'dark'>
                options={{
                  system: t('themeSystem'),
                  light: t('themeLight'),
                  dark: t('themeDark'),
                }}
                value={(theme as 'system' | 'light' | 'dark') ?? 'system'}
                onChanged={(val) => setTheme(val)}
              />
              <PhSegmented<AppLocale>
                options={{ en: 'English', bn: 'বাংলা' }}
                value={locale}
                onChanged={(nextLocale) => router.replace(pathname, { locale: nextLocale })}
              />
              <div className="pt-1">
                <PhSwitchTile
                  title={t('reduceEffectsLabel')}
                  subtitle={t('reduceEffectsDesc')}
                  icon={<Gauge className="h-[18px] w-[18px]" />}
                  value={reduceEffects}
                  onChanged={setReduceEffects}
                  className="px-1"
                />
              </div>
            </PhCard>
          </section>

          {/* 2. Layout Shells Quick Switcher */}
          <section>
            <PhSectionHeader title={t('shellPreviewTitle')} />
            <PhGroup
              header="NAVIGATION SHELLS"
              footer="Test mobile bottom glass tab bar (<768px) and desktop side navigation (>=768px)."
            >
              <PhRow
                icon={<LayoutGrid className="h-[18px] w-[18px]" />}
                title={t('shellPublic')}
                subtitle="SEO header, bilingual landing & footer"
                onTap={() => router.push('/')}
              />
              <PhRow
                icon={<User className="h-[18px] w-[18px]" />}
                title={t('shellPlayer')}
                subtitle="Player feed, sports profiles, applications & ratings"
                onTap={() => router.push('/player')}
              />
              <PhRow
                icon={<Trophy className="h-[18px] w-[18px]" />}
                title={t('shellRecruiter')}
                subtitle="Discover players, shortlists, recruitment requests"
                onTap={() => router.push('/recruiter')}
              />
            </PhGroup>
          </section>

          {/* 3. Typography */}
          <section>
            <PhSectionHeader title="Typography (Inter + Hind Siliguri)" />
            <PhCard className="space-y-2">
              <div className="tx-large-title">Large title</div>
              <div className="tx-title1">Title 1 · খেলোয়াড় খুঁজুন</div>
              <div className="tx-title2">Title 2 · ম্যাচের বিবরণ</div>
              <div className="tx-title3">Title 3 · কুয়াকাটা সী-বিচ গ্রাউন্ড</div>
              <div className="tx-headline">Headline · শুক্রবারের খেপ ম্যাচ</div>
              <p className="tx-body pt-1">
                Body — Looking for a goalkeeper for Friday evening in Kalapara.{' '}
                {formatMoneyRange(500, 500, locale)} per match, বৃহস্পতিবার সন্ধ্যা ৬টা।
              </p>
              <div className="tx-subhead pt-1">Subhead · secondary information sits here</div>
              <div className="tx-footnote">
                Footnote · {formatNumber(12, locale)} applicants · {formatNumber(3, locale)} spots left
              </div>
              <div className="tx-overline">CAPTION · OVERLINE</div>
            </PhCard>
          </section>

          {/* 4. Colour Tokens */}
          <section>
            <PhSectionHeader title="Colour Tokens (WCAG AA)" />
            <PhCard>
              <div className="grid grid-cols-4 gap-3">
                {colorSwatches.map((swatch) => (
                  <div key={swatch.name} className="flex flex-col items-center">
                    <div
                      style={{
                        backgroundColor: swatch.cssVar,
                        borderRadius: `${PhRadius.sm}px`,
                      }}
                      className="h-12 w-full border-[0.5px] border-[var(--ph-border)]"
                    />
                    <span className="mt-1.5 tx-caption">{swatch.name}</span>
                  </div>
                ))}
              </div>
            </PhCard>
          </section>

          {/* 5. Buttons */}
          <section>
            <PhSectionHeader title="Buttons" />
            <PhCard className="space-y-3">
              <PhButton
                label={t('postRequest')}
                icon={<Plus className="h-5 w-5" />}
                onPressed={() => showPhToast(t('reqPosted'), 'success')}
              />
              <PhButton
                label={loading ? 'Saving…' : 'Tap for loading'}
                loading={loading}
                onPressed={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1000);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <PhButton
                  label="Secondary"
                  variant="secondary"
                  size="medium"
                  onPressed={() => showPhToast('Secondary tapped')}
                />
                <PhButton
                  label="Outline"
                  variant="outline"
                  size="medium"
                  onPressed={() => showPhToast('Outline tapped')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PhButton
                  label={t('reject')}
                  variant="destructive"
                  size="medium"
                  onPressed={() => showPhToast(t('rejectedToast'), 'error')}
                />
                <PhButton label="Disabled" size="medium" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <PhButton
                  label="Small"
                  size="small"
                  expand={false}
                  onPressed={() => {}}
                />
                <PhButton
                  label="Ghost"
                  variant="ghost"
                  size="small"
                  expand={false}
                  onPressed={() => {}}
                />
                <PhIconButton
                  icon={<SlidersHorizontal className="h-5 w-5" />}
                  semanticLabel={t('filters')}
                  onPressed={() => setSheetOpen(true)}
                />
                <PhIconButton
                  icon={<Bell className="h-5 w-5" />}
                  semanticLabel={t('tabAlerts')}
                  badge
                  onPressed={() => showPhToast('3 new notifications')}
                />
              </div>
            </PhCard>
          </section>

          {/* 6. Inputs, OTP, Stepper & Segmented */}
          <section>
            <PhSectionHeader title="Inputs & Controls" />
            <PhCard className="space-y-4">
              <PhTextField
                value={phone}
                onChange={setPhone}
                label={t('phoneLabel')}
                hint="01XXXXXXXXX"
                prefixText="+880"
                type="tel"
              />
              <PhTextField
                label={t('emailLabel')}
                hint="you@example.com"
                error={t('emailInvalid')}
              />
              <PhSearchField
                value={search}
                onChange={setSearch}
                hint="Search players or places"
              />
              <div>
                <div className="pl-1 pb-2 tx-subhead-strong text-[var(--ph-text)]">
                  6-Digit OTP Input ({t('otpTitle')})
                </div>
                <PhOtpField
                  value={otp}
                  onChange={setOtp}
                  onCompleted={(code) => showPhToast(`OTP verified: ${code}`, 'success')}
                />
              </div>
              <PhSwitchTile
                title={t('filterKhep')}
                subtitle="Captains can see your rate"
                icon={<DollarSign className="h-[18px] w-[18px]" />}
                value={khepSwitch}
                onChanged={setKhepSwitch}
                className="px-0"
              />
              <div className="flex items-center justify-between">
                <span className="tx-body">{t('reqPlayers')}</span>
                <PhStepper
                  value={stepperVal}
                  onChanged={setStepperVal}
                  format={(v) => formatNumber(v, locale)}
                />
              </div>
              <PhSegmented<'today' | 'week' | 'all'>
                options={{
                  today: t('today'),
                  week: 'This week',
                  all: 'Any time',
                }}
                value={segTime}
                onChanged={setSegTime}
              />
            </PhCard>
          </section>

          {/* 7. Chips, Badges, Avatars & Ratings */}
          <section>
            <PhSectionHeader title="Chips, Badges, Avatars & Ratings" />
            <PhCard className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {['GK', 'CB', 'CM', 'ST', 'WING'].map((p) => (
                  <PhChip
                    key={p}
                    label={p}
                    selected={selectedPositions.includes(p)}
                    onTap={() => togglePosition(p)}
                  />
                ))}
                <PhChip
                  label={t('filterPaid')}
                  icon={<DollarSign className="h-4 w-4" />}
                  selected
                  onTap={() => {}}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <PhBadge
                  label={t('paidGame')}
                  tone="accent"
                  icon={<DollarSign className="h-3 w-3" />}
                />
                <PhBadge label={t('spotsLeftCount', { count: 2 })} tone="warning" />
                <PhBadge label={t('statusCancelled')} tone="danger" />
                <PhBadge label={t('statusFilled')} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <PhAvatar name="Sohel Rana" size={56} verified />
                  <PhAvatar name="Imran Hossain" size={56} />
                  <PhAvatar name="মাহিন সরদার" size={56} />
                </div>
                <div className="flex flex-col items-end">
                  <RatingStars value={4.6} />
                  <div className="mt-1">
                    <RatingPill
                      average={4.6}
                      count={23}
                      format={(a, n) => formatRatingText(a, n, locale)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-[0.5px] border-[var(--ph-border)] pt-4 flex flex-col items-center">
                <span className="tx-caption mb-1">{t('tapToRate')}</span>
                <RatingInput
                  value={stars}
                  onChanged={setStars}
                  semanticLabel={t('scoreSkill')}
                />
              </div>
            </PhCard>
          </section>

          {/* 8. Glass Surfaces, Frosted Sheet & Toast */}
          <section>
            <PhSectionHeader title="Glass Surfaces, Sheets & Toasts" />
            <div className="space-y-3">
              <div
                style={{ borderRadius: `${PhRadius.xl}px` }}
                className="relative h-[196px] w-full overflow-hidden bg-gradient-to-br from-[#0BA360] via-[#3A7BD5] to-[#F2994A]"
              >
                <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full bg-white/40" />
                <div className="absolute right-6 bottom-16 h-20 w-20 rounded-full bg-black/35" />
                <div className="absolute inset-x-3 bottom-3">
                  <GlassContainer className="p-4">
                    <div className="flex items-center gap-3">
                      <PhAvatar name="Rakib Hasan" size={44} verified />
                      <div className="min-w-0 flex-1">
                        <div className="tx-headline text-[var(--ph-text)] truncate">
                          Kuakata Beach Ground
                        </div>
                        <div className="tx-footnote truncate">
                          Fri 6:30 PM · {t('spotsLeftCount', { count: 2 })}
                        </div>
                      </div>
                      <PhBadge label={formatMoneyRange(500, 500, locale)} tone="accent" />
                    </div>
                  </GlassContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PhButton
                  label="Open Glass Sheet"
                  variant="secondary"
                  size="medium"
                  onPressed={() => setSheetOpen(true)}
                />
                <PhButton
                  label="Show Glass Toast"
                  variant="secondary"
                  size="medium"
                  onPressed={() => showPhToast(t('errUnknown'), 'error')}
                />
              </div>

              {/* Interactive Floating Glass Tab Bar Demo */}
              <div className="pt-2">
                <div className="pl-1 pb-1.5 tx-caption">
                  Floating Glass Bottom Tab Bar (`PhGlassTabBar`)
                </div>
                <PhGlassTabBar
                  items={[
                    { id: 'home', label: t('tabHome'), icon: <Home className="h-6 w-6" /> },
                    { id: 'players', label: t('tabPlayers'), icon: <Search className="h-6 w-6" /> },
                    { id: 'games', label: t('tabGames'), icon: <Trophy className="h-6 w-6" /> },
                    { id: 'alerts', label: t('tabAlerts'), icon: <Bell className="h-6 w-6" />, badge: true },
                    { id: 'me', label: t('tabMe'), icon: <User className="h-6 w-6" /> },
                  ]}
                  activeIndex={tabIndex}
                  onChange={setTabIndex}
                  className="px-0 pb-0"
                />
              </div>
            </div>
          </section>

          {/* 9. Domain Cards (PlayerTile & RequestCard) */}
          <section className="lg:col-span-2">
            <PhSectionHeader title="Domain Cards (1:1 Flutter Parity)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlayerTileCard
                player={{
                  id: 'demo-player-1',
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
                }}
                onTap={() => showPhToast('Player card tapped')}
              />

              <RequestCardView
                request={{
                  id: 'demo-req-1',
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
                onTap={() => showPhToast('Request card tapped')}
              />
            </div>
          </section>

          {/* 10. Loading, Empty, Offline & Error States */}
          <section>
            <PhSectionHeader title="Loading & Offline States" />
            <div className="space-y-3">
              <div className="overflow-hidden rounded-[16px]">
                <OfflineBanner label={t('offlineBanner')} />
              </div>
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </section>

          <section>
            <PhSectionHeader title="Empty & Error States" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PhCard>
                <EmptyState
                  icon={<Trophy className="h-7 w-7" />}
                  title={t('homeEmptyTitle')}
                  message={t('homeEmptyBody')}
                  actionLabel={t('postRequest')}
                  onAction={() => showPhToast(t('postRequest'))}
                  compact
                />
              </PhCard>
              <PhCard>
                <ErrorState
                  title={t('offlineTitle')}
                  message={t('errNetwork')}
                  retryLabel={t('retry')}
                  onRetry={() => showPhToast('Retrying…')}
                  offline
                  compact
                />
              </PhCard>
            </div>
          </section>

          {/* 11. Custom Vector Illustrations */}
          <section className="lg:col-span-2">
            <PhSectionHeader title="Illustrations (Find, Hire, Rate)" />
            <PhCard>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
                <div className="flex flex-col items-center text-center">
                  <PhIllustration kind="find" size={120} />
                  <div className="mt-3 tx-headline">{t('onbFindTitle')}</div>
                  <p className="mt-1 tx-footnote max-w-xs">{t('onbFindBody')}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <PhIllustration kind="hire" size={120} />
                  <div className="mt-3 tx-headline">{t('onbHireTitle')}</div>
                  <p className="mt-1 tx-footnote max-w-xs">{t('onbHireBody')}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <PhIllustration kind="rate" size={120} />
                  <div className="mt-3 tx-headline">{t('onbRateTitle')}</div>
                  <p className="mt-1 tx-footnote max-w-xs">{t('onbRateBody')}</p>
                </div>
              </div>
            </PhCard>
          </section>
        </div>
      </div>

      {/* Frosted Glass Sheet Modal */}
      <PhGlassSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={t('filters')}
      >
        <div className="space-y-4">
          <p className="tx-subhead">
            A frosted sheet with springy entrance on mobile and centered modal on desktop.
          </p>
          <div className="flex flex-wrap gap-2">
            <PhChip label="Football · ফুটবল" selected onTap={() => {}} />
            <PhChip label="Cricket · ক্রিকেট" onTap={() => {}} />
          </div>
          <div className="pt-2">
            <PhButton
              label={t('apply')}
              onPressed={() => {
                setSheetOpen(false);
                showPhToast('Filters applied', 'success');
              }}
            />
          </div>
        </div>
      </PhGlassSheet>
    </PhPage>
  );
}

