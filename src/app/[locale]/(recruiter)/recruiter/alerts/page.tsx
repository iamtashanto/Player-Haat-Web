'use client';

import React from 'react';
import { Bell, Trophy, UserCheck, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { PhCard, PhLargeTitleBar } from '@/design-system';

export default function RecruiterAlertsPage() {
  const t = useTranslations();
  const router = useRouter();

  const alerts = [
    {
      id: 'ra-1',
      title: 'New Applicant for Friday Match',
      body: 'Sohel Rana applied for the Striker position (asks ৳2,500).',
      time: '1 hour ago',
      unread: true,
      href: '/recruiter/requests',
    },
    {
      id: 'ra-2',
      title: 'Player Accepted Direct Invite',
      body: 'Rakibul Hasan accepted your invitation for the Mirpur match.',
      time: '5 hours ago',
      unread: true,
      href: '/recruiter/requests',
    },
    {
      id: 'ra-3',
      title: 'Match Rating Window Open',
      body: 'You have 7 days to rate players from the completed Kalapara match.',
      time: '2 days ago',
      unread: false,
      href: '/recruiter/requests',
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PhLargeTitleBar
        title={t('tabAlerts')}
        subtitle="Notifications regarding applicant submissions, invite responses, and ratings."
      />

      <div className="space-y-3">
        {alerts.map((al) => (
          <PhCard
            key={al.id}
            onTap={() => router.push(al.href)}
            className="p-4 hover:border-[var(--ph-accent)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="tx-headline text-[var(--ph-text)] truncate">
                    {al.title}
                  </div>
                  <span className="tx-caption text-[var(--ph-text-tertiary)] shrink-0">
                    {al.time}
                  </span>
                </div>
                <p className="mt-1 tx-subhead text-[var(--ph-text-secondary)]">
                  {al.body}
                </p>
              </div>
              {al.unread && (
                <div className="h-2 w-2 rounded-full bg-[var(--ph-accent)] shrink-0 mt-2" />
              )}
            </div>
          </PhCard>
        ))}
      </div>
    </div>
  );
}

