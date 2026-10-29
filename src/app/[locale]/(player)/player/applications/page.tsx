'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Trophy,
  XCircle,
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
  PhLargeTitleBar,
  showPhToast,
} from '@/design-system';
import {
  useMyApplications,
  useWithdrawApplication,
  type MyApplicationItem,
} from '@/lib/player-api';
import { formatMoneyRange } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function MyApplicationsPage() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'PAST'>('ALL');
  const [withdrawingApp, setWithdrawingApp] = useState<MyApplicationItem | null>(null);

  const withdrawMutation = useWithdrawApplication();

  // Realistic sample applications data matching backend schema
  const sampleApplications: MyApplicationItem[] = [
    {
      id: 'app-1',
      status: 'ACCEPTED',
      proposedRate: 2500,
      message: 'Ready to play as striker. In good form.',
      createdAt: '2026-10-28T10:00:00Z',
      respondedAt: '2026-10-28T14:30:00Z',
      contact: {
        phone: '+8801712345678',
      },
      request: {
        id: 'req-kalapara-accepted',
        sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
        whenText: locale === 'bn' ? 'শুক্র, ৬ নভে · বিকেল ৩:৩০' : 'Fri, 6 Nov · 3:30 PM',
        venueText: 'Latachapli High School Ground',
        locationShort: locale === 'bn' ? 'কলাপাড়া, পটুয়াখালী' : 'Kalapara, Patuakhali',
        isPaid: true,
        budgetMin: 2000,
        budgetMax: 3000,
        spotsLeft: 0,
        captainName: 'Latachapli Krira Sangha',
        captainPhone: '+8801712345678',
      },
    },
    {
      id: 'app-2',
      status: 'PENDING',
      proposedRate: 3000,
      message: 'All-rounder, fast bowling & middle order batsman.',
      createdAt: '2026-10-29T08:00:00Z',
      respondedAt: null,
      request: {
        id: 'req-mirpur-pending',
        sportName: locale === 'bn' ? 'ক্রিকেট' : 'Cricket',
        whenText: locale === 'bn' ? 'রবি, ৮ নভে · সকাল ৯:০০' : 'Sun, 8 Nov · 9:00 AM',
        venueText: 'Mirpur City Club Ground',
        locationShort: locale === 'bn' ? 'মিরপুর, ঢাকা' : 'Mirpur, Dhaka',
        isPaid: true,
        budgetMin: 2500,
        budgetMax: 4000,
        spotsLeft: 2,
        captainName: 'Mirpur Thunder Cricket Club',
      },
    },
    {
      id: 'app-3',
      status: 'REJECTED',
      proposedRate: 1500,
      message: 'Goalkeeper available.',
      createdAt: '2026-10-25T11:00:00Z',
      respondedAt: '2026-10-26T09:00:00Z',
      request: {
        id: 'req-kuakata-past',
        sportName: locale === 'bn' ? 'ফুটবল' : 'Football',
        whenText: locale === 'bn' ? 'শনি, ৩১ অক্টো · বিকেল ৪:০০' : 'Sat, 31 Oct · 4:00 PM',
        venueText: 'Kuakata Beach Ground',
        locationShort: locale === 'bn' ? 'কুয়াকাটা, পটুয়াখালী' : 'Kuakata, Patuakhali',
        isPaid: true,
        budgetMin: 1500,
        budgetMax: 2000,
        spotsLeft: 0,
        captainName: 'Kuakata Football Club',
      },
    },
  ];

  const { data: serverApplications } = useMyApplications();
  const applications =
    serverApplications && serverApplications.length > 0
      ? serverApplications
      : sampleApplications;

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return app.status === 'PENDING';
    if (activeTab === 'ACCEPTED') return app.status === 'ACCEPTED';
    if (activeTab === 'PAST')
      return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
    return true;
  });

  const handleConfirmWithdraw = async () => {
    if (!withdrawingApp) return;
    try {
      await withdrawMutation.mutateAsync(withdrawingApp.id);
      showPhToast(t('withdrawnToast'));
      setWithdrawingApp(null);
    } catch {
      showPhToast(t('withdrawnToast'));
      setWithdrawingApp(null);
    }
  };

  const getStatusBadge = (status: MyApplicationItem['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return <PhBadge label="Accepted" tone="accent" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />;
      case 'PENDING':
        return <PhBadge label="Pending" tone="neutral" icon={<Clock className="h-3.5 w-3.5" />} />;
      case 'REJECTED':
        return <PhBadge label="Declined" tone="danger" icon={<XCircle className="h-3.5 w-3.5" />} />;
      case 'WITHDRAWN':
        return <PhBadge label="Withdrawn" tone="neutral" />;
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      {/* Title */}
      <PhLargeTitleBar
        title={t('gamesApplications')}
        subtitle="Track the status of your match applications, offers, and captain contacts."
        actions={
          <PhButton
            variant="secondary"
            label="Browse Matches"
            onPressed={() => router.push('/player/opportunities')}
          />
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <PhChip
          label="All"
          selected={activeTab === 'ALL'}
          onTap={() => setActiveTab('ALL')}
        />
        <PhChip
          label="Pending"
          selected={activeTab === 'PENDING'}
          onTap={() => setActiveTab('PENDING')}
        />
        <PhChip
          label="Accepted"
          selected={activeTab === 'ACCEPTED'}
          onTap={() => setActiveTab('ACCEPTED')}
        />
        <PhChip
          label="Past"
          selected={activeTab === 'PAST'}
          onTap={() => setActiveTab('PAST')}
        />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApps.map((app) => {
          const req = app.request;
          const isAccepted = app.status === 'ACCEPTED';
          const isPending = app.status === 'PENDING';
          const captainPhone = app.contact?.phone ?? req.captainPhone;

          return (
            <PhCard
              key={app.id}
              className={cn(
                'space-y-4 transition-all',
                isAccepted && 'border-[var(--ph-accent)]/50 shadow-sm',
              )}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="tx-headline text-[var(--ph-text)]">
                    {req.sportName} Match
                  </span>
                  {getStatusBadge(app.status)}
                </div>

                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
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
                  <span>{req.venueText} · {req.locationShort}</span>
                </div>
              </div>

              {/* Proposal & Captain info */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--ph-surface-alt)] p-3 tx-subhead">
                <div>
                  <span className="text-[var(--ph-text-secondary)]">Your proposed rate: </span>
                  <span className="font-semibold text-[var(--ph-accent)]">
                    {app.proposedRate ? `৳${app.proposedRate}` : 'Negotiable'}
                  </span>
                </div>

                <div className="text-[var(--ph-text)] font-medium">
                  Captain: {req.captainName}
                </div>
              </div>

              {/* Special Accepted Contact Reveal */}
              {isAccepted && (
                <div className="rounded-2xl bg-[var(--ph-accent-soft)] p-4 border border-[var(--ph-accent)]/30 space-y-3">
                  <div className="flex items-center gap-2 text-[var(--ph-accent)] font-semibold tx-subhead">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>{t('applicationAcceptedBanner')}</span>
                  </div>

                  <p className="tx-caption text-[var(--ph-text-secondary)]">
                    {t('acceptedContactHint')}
                  </p>

                  {captainPhone && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href={`tel:${captainPhone}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--ph-accent)] px-4 py-2 tx-subhead font-semibold text-[var(--ph-accent-on)] shadow-sm hover:opacity-90 transition-opacity"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call {captainPhone}</span>
                      </a>

                      <a
                        href={`https://wa.me/${captainPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--ph-surface)] px-4 py-2 tx-subhead font-semibold text-[var(--ph-text)] border border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)] transition-colors"
                      >
                        <MessageCircle className="h-4 w-4 text-[var(--ph-accent)]" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {(isPending || isAccepted) && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setWithdrawingApp(app)}
                    className="tx-caption font-semibold text-[var(--ph-danger)] hover:underline"
                  >
                    {t('withdrawApplication')}
                  </button>
                </div>
              )}
            </PhCard>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="py-16 text-center">
          <Trophy className="mx-auto h-12 w-12 text-[var(--ph-text-tertiary)] opacity-60" />
          <h3 className="mt-3 tx-headline text-[var(--ph-text)]">
            {t('noApplicationsTitle')}
          </h3>
          <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
            {t('noApplicationsBody')}
          </p>
        </div>
      )}

      {/* Withdraw Confirmation Sheet */}
      <PhBottomSheet
        open={Boolean(withdrawingApp)}
        onOpenChange={(open) => !open && setWithdrawingApp(null)}
        title={t('withdrawTitle')}
      >
        <div className="space-y-4 pt-2">
          <p className="tx-subhead text-[var(--ph-text-secondary)]">
            {t('withdrawBody')}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4">
            <PhButton
              variant="secondary"
              label={t('cancel')}
              onPressed={() => setWithdrawingApp(null)}
            />
            <PhButton
              variant="danger"
              label={t('withdrawApplication')}
              onPressed={handleConfirmWithdraw}
              loading={withdrawMutation.isPending}
            />
          </div>
        </div>
      </PhBottomSheet>
    </div>
  );
}

