'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useShortlistList } from '@/lib/api/social';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';
import { PlayerTile } from '@/components/app/cards';

export default function ShortlistView() {
  const { t } = useFmt();
  const router = useRouter();
  const q = useShortlistList();
  return (
    <Screen title={t('shortlistTitle')} back>
      <QueryState query={q} isEmpty={q.items.length === 0} emptyIcon={<Heart className="h-6 w-6" />} emptyTitle={t('shortlistEmptyTitle')} emptyMessage={t('shortlistEmptyBody')} emptyAction={{ label: t('tabPlayers'), onAction: () => router.push('/players') }}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {q.items.map((p) => (
            <PlayerTile key={p.id} player={p} />
          ))}
        </div>
        <LoadMore hasNext={!!q.hasNextPage} loading={q.isFetchingNextPage} onMore={() => void q.fetchNextPage()} />
      </QueryState>
    </Screen>
  );
}
