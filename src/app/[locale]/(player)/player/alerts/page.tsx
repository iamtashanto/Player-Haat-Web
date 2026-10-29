'use client';

import React from 'react';
import { Bell, CheckCircle2, MessageSquare, Trophy, UserCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  PhBadge,
  PhCard,
  PhLargeTitleBar,
} from '@/design-system';

export default function PlayerAlertsPage() {
  const t = useTranslations();
  const router = useRouter();

  const alerts = [
    {
      id: 'al-1',
      title: 'Application Accepted!',
      body: 'Latachapli Krira Sangha accepted your application for the Friday match.',
      time: '2 hours ago',
      unread: true,
      href: '/player/applications',
    },
    {
      id: 'al-2',
      title: 'New Match Near You',
      body: 'Kuakata Football Club posted a match needing a Striker in your area.',
      time: 'Yesterday',
      unread: false,
      href: '/player/opportunities',
    },
    {
      id: 'al-3',
      title: 'Captain Rated You 5.0 ★',
      body: 'Latachapli Krira Sangha left a review: "Outstanding striker! Scored two goals."',
      time: '3 days ago',
      unread: false,
      href: '/player/ratings',
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PhLargeTitleBar
        title={t('tabAlerts')}
        subtitle="Notifications regarding match requests, applications, and ratings."
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

