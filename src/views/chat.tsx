'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Ban, Send } from 'lucide-react';
import { PhAvatar, PhButton, PhIconButton } from '@/design-system';
import { useChatAction, useConversation, useSendMessage, useThread } from '@/lib/api/chat';
import { ConfirmSheet } from '@/components/app/actions';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';
import { ConversationList } from './messages';

function Thread({ id }: { id: string }) {
  const { t, time, fail } = useFmt();
  const thread = useThread(id);
  const { conversation } = useConversation(id);
  const send = useSendMessage(id);
  const act = useChatAction(id);
  const [text, setText] = useState('');
  const [block, setBlock] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const lastId = thread.items.at(-1)?.id;

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [lastId]);
  useEffect(() => {
    if (conversation && conversation.unread > 0) act.mutate('read');
    // mark read once per new unread state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, conversation?.unread]);

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      await send.mutateAsync(body);
    } catch (e) {
      setText(body);
      fail(e);
    }
  };
  const blocked = conversation?.blockedByMe;

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[360px] flex-col rounded-[22px] md:border-[0.5px] md:border-[var(--ph-border)] md:bg-[var(--ph-surface)]">
      {conversation && (
        <div className="flex items-center gap-3 border-b-[0.5px] border-[var(--ph-border)] px-4 py-3">
          <PhAvatar name={conversation.other.name} url={conversation.other.avatarUrl} size={36} verified={conversation.other.verified} />
          <div className="tx-headline min-w-0 flex-1 truncate">{conversation.other.organization ?? conversation.other.name}</div>
          <PhIconButton icon={<Ban className="h-4 w-4" />} semanticLabel={blocked ? t('chatUnblock') : t('chatBlock')} filled={false} onPressed={() => (blocked ? act.mutate('unblock') : setBlock(true))} />
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <QueryState query={thread} isEmpty={thread.items.length === 0} emptyIcon={<Send className="h-6 w-6" />} emptyTitle={t('chatEmptyThread')} skeletons={2}>
          <LoadMore hasNext={!!thread.hasNextPage} loading={thread.isFetchingNextPage} onMore={() => void thread.fetchNextPage()} />
          <div className="flex flex-col gap-1.5">
            {thread.items.map((m) => (
              <div key={m.id} className={`max-w-[80%] rounded-[18px] px-3.5 py-2 tx-body ${m.mine ? 'self-end bg-[var(--ph-accent)] text-[var(--ph-accent-on)]' : 'self-start bg-[var(--ph-surface-alt)] text-[var(--ph-text)]'}`}>
                <span className="whitespace-pre-wrap break-words">{m.body}</span>
                <span className="ml-2 align-bottom text-[10px] opacity-70">{time(m.createdAt)}</span>
              </div>
            ))}
          </div>
          <div ref={bottom} />
        </QueryState>
      </div>
      {blocked ? (
        <p className="px-4 py-3 text-center tx-footnote text-[var(--ph-text-tertiary)]">{t('chatBlockedBanner')}</p>
      ) : (
        <form
          className="flex items-end gap-2 border-t-[0.5px] border-[var(--ph-border)] p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder={t('chatTypeHint')}
            rows={1}
            maxLength={2000}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface-alt)] px-4 py-2.5 tx-body text-[var(--ph-text)] outline-none focus:border-[var(--ph-accent)]"
          />
          <PhButton label={t('chatSendLabel')} type="submit" icon={<Send className="h-4 w-4" />} expand={false} loading={send.isPending} disabled={!text.trim()} />
        </form>
      )}
      <ConfirmSheet open={block} onOpenChange={setBlock} title={t('chatBlockTitle')} body={t('chatBlockBody')} confirmLabel={t('chatBlock')} destructive loading={act.isPending} onConfirm={() => act.mutate('block', { onSuccess: () => setBlock(false), onError: fail })} />
    </div>
  );
}

/** One conversation. Desktop: the list on the left, the thread on the right. */
export default function ChatView({ id }: { id: string }) {
  const { t } = useFmt();
  return (
    <Screen title={t('messagesTitle')} back large={false}>
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ConversationList activeId={id} />
        </div>
        <Thread id={id} />
      </div>
    </Screen>
  );
}
