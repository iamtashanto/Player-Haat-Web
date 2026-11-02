'use client';

import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { PhButton, PhCard } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useNotificationList, useReadAllNotifications, useReadNotification, type AppNotification } from '@/lib/api/notifications';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';

/** Mirrors the app's `routeForNotification`. */
export function routeForNotification(n: { type: string; data: Record<string, unknown> }): string | null {
  const id = (k: string) => (typeof n.data?.[k] === 'string' ? (n.data[k] as string) : null);
  switch (n.type) {
    case 'INVITE_RECEIVED':
    case 'INVITE_ACCEPTED':
    case 'INVITE_DECLINED':
      return '/invites';
    case 'CONTACT_VIEWED':
      return '/me/viewers';
    case 'NEW_MESSAGE':
      return id('conversationId') ? `/chat/${id('conversationId')}` : '/messages';
    case 'TEAM_JOINED':
      return id('teamId') ? `/team/${id('teamId')}` : '/teams';
    case 'VERIFICATION_RESULT':
      return null;
    case 'SYSTEM':
      return id('paymentId') ? '/wallet' : null;
    case 'RATING_REMINDER':
      return id('requestId') ? `/rate/${id('requestId')}` : null;
    default:
      return id('requestId') ? `/request/${id('requestId')}` : null;
  }
}

export default function AlertsView() {
  const { t, ago, fail } = useFmt();
  const router = useRouter();
  const list = useNotificationList();
  const read = useReadNotification();
  const readAll = useReadAllNotifications();
  const unread = list.items.some((n) => !n.readAt);

  const open = (n: AppNotification) => {
    if (!n.readAt) read.mutate(n.id);
    const route = routeForNotification({ type: n.type, data: (n.data ?? {}) as Record<string, unknown> });
    if (route) router.push(route);
  };

  return (
    <Screen
      title={t('alertsTitle')}
      actions={unread ? <PhButton label={t('markAllRead')} icon={<CheckCheck className="h-4 w-4" />} variant="ghost" size="small" expand={false} onPressed={() => readAll.mutate(undefined, { onError: fail })} /> : undefined}
    >
      <div className="mx-auto max-w-2xl">
        <QueryState query={list} isEmpty={list.items.length === 0} emptyIcon={<Bell className="h-6 w-6" />} emptyTitle={t('noAlertsTitle')} emptyMessage={t('noAlertsBody')}>
          <div className="flex flex-col gap-2">
            {list.items.map((n) => (
              <PhCard key={n.id} onTap={() => open(n)} paddingClassName="p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? 'bg-transparent' : 'bg-[var(--ph-accent)]'}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="tx-subhead-strong text-[var(--ph-text)]">{n.title}</div>
                    <p className="tx-subhead">{n.body}</p>
                    <p className="tx-footnote mt-1 text-[var(--ph-text-tertiary)]">{ago(n.createdAt)}</p>
                  </div>
                </div>
              </PhCard>
            ))}
          </div>
          <LoadMore hasNext={!!list.hasNextPage} loading={list.isFetchingNextPage} onMore={() => void list.fetchNextPage()} />
        </QueryState>
      </div>
    </Screen>
  );
}
