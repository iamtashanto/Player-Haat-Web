'use client';

import React, { useState } from 'react';
import { ClipboardList, Plus, Star, Trophy } from 'lucide-react';
import { PhBadge, PhButton, PhCard, PhChip, PhSegmented } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useMyApplicationsList, useMyRequestsList, type PlayerRequest } from '@/lib/api/requests';
import { usePendingRatings } from '@/lib/api/ratings';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';
import { RequestCard } from '@/components/app/cards';

const STATUSES = ['OPEN', 'FILLED', 'COMPLETED', 'CANCELLED'] as const;
const APP_STATUS_KEY = { PENDING: 'appPending', ACCEPTED: 'appAccepted', REJECTED: 'appRejected', WITHDRAWN: 'appWithdrawn' } as const;
const STATUS_LABEL = { OPEN: 'statusOpen', FILLED: 'statusFilled', COMPLETED: 'statusCompleted', CANCELLED: 'statusCancelled' } as const;

/** Games: the requests I posted and (for players) the applications I sent, plus a nudge to rate finished games. */
export default function GamesView() {
  const { t } = useFmt();
  const router = useRouter();
  const { activeRole } = useAuth();
  const isRecruiter = activeRole === 'RECRUITER';
  const [tab, setTab] = useState<'apps' | 'requests'>(isRecruiter ? 'requests' : 'apps');
  const [status, setStatus] = useState<(typeof STATUSES)[number] | undefined>();
  const requests = useMyRequestsList(status);
  const apps = useMyApplicationsList();
  const pending = usePendingRatings();
  const toRate = pending.data ?? [];
  const showTabs = !isRecruiter;
  const current = showTabs ? tab : 'requests';

  return (
    <Screen
      title={t('gamesTitle')}
      actions={<PhButton label={t('postRequest')} icon={<Plus className="h-4 w-4" />} size="small" expand={false} onPressed={() => router.push('/request/new')} />}
    >
      <div className="mx-auto max-w-3xl">
        {toRate.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {toRate.map((p) => {
              const req = p.request as { id: string };
              return (
                <PhCard key={req.id} onTap={() => router.push(`/rate/${req.id}`)} paddingClassName="p-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-[var(--ph-warning)]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="tx-headline">{t('toRateTitle')}</div>
                      <div className="tx-subhead">{t('rateRemaining', { count: p.targets.length })}</div>
                    </div>
                    <PhBadge tone="warning" label={t('rateTitle')} />
                  </div>
                </PhCard>
              );
            })}
          </div>
        )}

        {showTabs && <PhSegmented options={{ apps: t('gamesApplications'), requests: t('gamesRequests') }} value={tab} onChanged={setTab} />}

        {current === 'requests' ? (
          <>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
              <PhChip label={t('filterAll')} selected={!status} onTap={() => setStatus(undefined)} dense />
              {STATUSES.map((s) => (
                <PhChip key={s} label={t(STATUS_LABEL[s])} selected={status === s} onTap={() => setStatus(s)} dense />
              ))}
            </div>
            <div className="mt-3">
              <QueryState
                query={requests}
                isEmpty={requests.items.length === 0}
                emptyIcon={<Trophy className="h-6 w-6" />}
                emptyTitle={t('noRequestsTitle')}
                emptyMessage={t('noRequestsBody')}
                emptyAction={{ label: t('postRequest'), onAction: () => router.push('/request/new') }}
              >
                <div className="flex flex-col gap-3">
                  {requests.items.map((r: PlayerRequest) => (
                    <RequestCard key={r.id} request={r} showCaptain={false} trailing={r.pendingApplicants ? <PhBadge tone="accent" label={t('applicantsCount', { count: r.pendingApplicants })} /> : undefined} />
                  ))}
                </div>
                <LoadMore hasNext={!!requests.hasNextPage} loading={requests.isFetchingNextPage} onMore={() => void requests.fetchNextPage()} />
              </QueryState>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <QueryState
              query={apps}
              isEmpty={apps.items.length === 0}
              emptyIcon={<ClipboardList className="h-6 w-6" />}
              emptyTitle={t('noApplicationsTitle')}
              emptyMessage={t('noApplicationsBody')}
              emptyAction={{ label: t('browseGames'), onAction: () => router.push('/home') }}
            >
              <div className="flex flex-col gap-3">
                {apps.items.map((a) => (
                  <RequestCard
                    key={a.id}
                    request={a.request as unknown as PlayerRequest}
                    trailing={<PhBadge tone={a.status === 'ACCEPTED' ? 'accent' : a.status === 'PENDING' ? 'neutral' : 'danger'} label={t(APP_STATUS_KEY[a.status])} />}
                  />
                ))}
              </div>
              <LoadMore hasNext={!!apps.hasNextPage} loading={apps.isFetchingNextPage} onMore={() => void apps.fetchNextPage()} />
            </QueryState>
          </div>
        )}
      </div>
    </Screen>
  );
}
