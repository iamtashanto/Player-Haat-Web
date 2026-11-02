'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { PhAvatar, PhBadge, PhCard } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useContactViews } from '@/lib/api/social';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';

/** Who opened my number (players only; the server returns nothing for anyone else). */
export default function ViewersView() {
  const { t, ago } = useFmt();
  const router = useRouter();
  const q = useContactViews();
  return (
    <Screen title={t('viewersTitle')} back>
      <div className="mx-auto max-w-2xl">
        <QueryState query={q} isEmpty={q.items.length === 0} emptyIcon={<Eye className="h-6 w-6" />} emptyTitle={t('viewersEmptyTitle')} emptyMessage={t('viewersEmptyBody')}>
          <div className="flex flex-col gap-2">
            {q.items.map((v) => (
              <PhCard key={v.id} onTap={v.viewer.recruiterId ? () => router.push(`/recruiter/${v.viewer.recruiterId}`) : undefined} paddingClassName="p-4">
                <div className="flex items-center gap-3">
                  <PhAvatar name={v.viewer.name} url={v.viewer.avatarUrl} size={44} verified={v.viewer.verified} />
                  <div className="min-w-0 flex-1">
                    <div className="tx-headline truncate">{v.viewer.name}</div>
                    <div className="tx-subhead truncate">{v.viewer.organization ?? ''}</div>
                  </div>
                  <span className="tx-footnote text-[var(--ph-text-tertiary)]">{ago(v.createdAt)}</span>
                  {v.viewer.verified && <PhBadge tone="accent" label="✓" />}
                </div>
              </PhCard>
            ))}
          </div>
          <LoadMore hasNext={!!q.hasNextPage} loading={q.isFetchingNextPage} onMore={() => void q.fetchNextPage()} />
        </QueryState>
      </div>
    </Screen>
  );
}
