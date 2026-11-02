'use client';

import React, { useState } from 'react';
import { Inbox, Plus, Sparkles, Trophy, UserRound } from 'lucide-react';
import { PhBadge, PhButton, PhCard, PhChip } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useFeaturedRequests, useRequestFeed } from '@/lib/api/requests';
import { useReceivedInvites } from '@/lib/api/social';
import { LoadMore, QueryState, Screen, SectionTitle, useFmt } from '@/components/app/kit';
import { RequestCard, useSports } from '@/components/app/cards';

/** Home: greeting, setup nudge, featured games, and open games near you (soonest first). */
export default function HomeView() {
  const { t, name } = useFmt();
  const router = useRouter();
  const { me, activeRole } = useAuth();
  const { sports } = useSports();
  const [sportId, setSportId] = useState<number | undefined>();
  const [kind, setKind] = useState<'MATCH' | 'EVENT' | undefined>();
  const [paid, setPaid] = useState<boolean | undefined>();

  const feed = useRequestFeed({ sportId, kind, isPaid: paid });
  const featured = useFeaturedRequests({ sportId, kind });
  const invites = useReceivedInvites('PENDING');

  const isRecruiter = activeRole === 'RECRUITER';
  const needsSetup = isRecruiter ? !me?.hasRecruiterProfile : !me?.hasPlayerProfile;
  const first = (me?.name ?? '').split(' ')[0] ?? '';

  const aside = (
    <div className="flex flex-col gap-3">
      {needsSetup && (
        <PhCard paddingClassName="p-4">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-5 w-5 text-[var(--ph-accent)]" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="tx-headline">{t('setupBannerTitle')}</div>
              <p className="tx-subhead mt-0.5">{t('setupBannerBody')}</p>
              <div className="mt-3">
                <PhButton label={t('setupBannerAction')} size="small" expand={false} onPressed={() => router.push(isRecruiter ? '/setup/recruiter' : '/setup')} />
              </div>
            </div>
          </div>
        </PhCard>
      )}
      {(invites.items.length > 0) && (
        <PhCard onTap={() => router.push('/invites')} paddingClassName="p-4">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-[var(--ph-accent)]" aria-hidden />
            <div className="tx-headline flex-1">{t('meInvitations')}</div>
            <PhBadge tone="accent" label={String(invites.items.length)} />
          </div>
        </PhCard>
      )}
      {isRecruiter && (
        <PhButton label={t('postRequest')} icon={<Plus className="h-5 w-5" />} onPressed={() => router.push('/request/new')} />
      )}
    </div>
  );

  return (
    <Screen title={t('homeGreeting', { name: first })} subtitle={t('homeSubtitle')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="lg:hidden">{aside}</div>

          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="group">
            <PhChip label={t('filterAllSports')} selected={sportId === undefined} onTap={() => setSportId(undefined)} />
            {sports.map((s) => (
              <PhChip key={s.id} label={name(s)} selected={sportId === s.id} onTap={() => setSportId(s.id)} />
            ))}
          </div>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            <PhChip label={t('kindAll')} selected={!kind} onTap={() => setKind(undefined)} dense />
            <PhChip label={t('kindMatches')} selected={kind === 'MATCH'} onTap={() => setKind('MATCH')} dense />
            <PhChip label={t('kindEvents')} selected={kind === 'EVENT'} onTap={() => setKind('EVENT')} dense />
            <PhChip label={t('filterFree')} selected={paid === false} onTap={() => setPaid(paid === false ? undefined : false)} dense />
            <PhChip label={t('filterPaid')} selected={paid === true} onTap={() => setPaid(paid === true ? undefined : true)} dense />
          </div>

          {(featured.data?.length ?? 0) > 0 && (
            <>
              <SectionTitle>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[var(--ph-warning)]" aria-hidden />
                  {t('homeFeatured')}
                </span>
              </SectionTitle>
              <div className="flex flex-col gap-3">
                {featured.data!.map((r) => (
                  <RequestCard key={r.id} request={r} />
                ))}
              </div>
            </>
          )}

          <SectionTitle>{t('homeNearby')}</SectionTitle>
          <QueryState
            query={feed}
            isEmpty={feed.items.length === 0}
            emptyIcon={<Trophy className="h-6 w-6" />}
            emptyTitle={t('homeEmptyTitle')}
            emptyMessage={t('homeEmptyBody')}
            emptyAction={isRecruiter ? { label: t('postRequest'), onAction: () => router.push('/request/new') } : undefined}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {feed.items.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </div>
            <LoadMore hasNext={!!feed.hasNextPage} loading={feed.isFetchingNextPage} onMore={() => void feed.fetchNextPage()} />
          </QueryState>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-16">{aside}</div>
        </aside>
      </div>
    </Screen>
  );
}
