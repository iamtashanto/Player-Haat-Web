'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { PhAvatar, PhBadge, PhCard } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useConversations } from '@/lib/api/chat';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';

export function ConversationList({ activeId }: { activeId?: string }) {
  const { t, ago, num } = useFmt();
  const router = useRouter();
  const q = useConversations();
  return (
    <QueryState query={q} isEmpty={q.items.length === 0} emptyIcon={<MessageCircle className="h-6 w-6" />} emptyTitle={t('chatEmptyTitle')} emptyMessage={t('chatEmptyBody')}>
      <div className="flex flex-col gap-2">
        {q.items.map((c) => (
          <PhCard key={c.id} onTap={() => router.push(`/chat/${c.id}`)} paddingClassName={`p-3 ${activeId === c.id ? 'ring-2 ring-[var(--ph-accent)]' : ''}`}>
            <div className="flex items-center gap-3">
              <PhAvatar name={c.other.name} url={c.other.avatarUrl} size={46} verified={c.other.verified} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="tx-headline truncate">{c.other.organization ?? c.other.name}</span>
                  <span className="tx-footnote ml-auto shrink-0 text-[var(--ph-text-tertiary)]">{ago(c.lastMessageAt)}</span>
                </div>
                <div className="tx-subhead truncate">{c.lastMessagePreview ?? ''}</div>
              </div>
              {c.unread > 0 && <PhBadge tone="accent" label={num(c.unread)} />}
            </div>
          </PhCard>
        ))}
      </div>
      <LoadMore hasNext={!!q.hasNextPage} loading={q.isFetchingNextPage} onMore={() => void q.fetchNextPage()} />
    </QueryState>
  );
}

/** Messages: a list on phones; on desktop the same list sits beside the open thread (see /chat/[id]). */
export default function MessagesView() {
  const { t } = useFmt();
  return (
    <Screen title={t('messagesTitle')} back>
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <ConversationList />
        <div className="hidden lg:flex min-h-[420px] items-center justify-center rounded-[22px] border-[0.5px] border-[var(--ph-border)] text-[var(--ph-text-tertiary)]">
          <MessageCircle className="h-8 w-8" aria-hidden />
        </div>
      </div>
    </Screen>
  );
}
