'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, qs, type Body, type Data } from './core';
import { usePaged } from './paged';

export type Conversation = Data<'/conversations'> extends (infer A)[] ? A : never;
export type ChatMessage = Data<'/conversations/{id}/messages'> extends (infer A)[] ? A : never;

/** Same cadence as the app: the open thread polls every 4 s, the conversation list every 30 s; both pause in a hidden tab. */
export const CHAT_POLL_MS = 4000;
export const LIST_POLL_MS = 30_000;

export const useConversations = () => usePaged<Conversation>(['chat', 'list'], '/conversations', {}, { refetchInterval: LIST_POLL_MS });

export function useOpenConversation() {
  return useMutation({ mutationFn: (b: Body<'/conversations'>) => post<Conversation>('/conversations', b) });
}

/** Newest first from the server; the hook returns oldest → newest for display and polls for anything newer. */
export function useThread(id: string | null | undefined) {
  const q = useInfiniteQuery({
    queryKey: ['chat', 'thread', id],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const items = await get<ChatMessage[]>(`/conversations/${id}/messages${qs({ before: pageParam ?? undefined, limit: 30 })}`);
      return { items, nextCursor: items.length >= 30 ? (items[items.length - 1] as { id: string }).id : null };
    },
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!id,
    refetchInterval: CHAT_POLL_MS,
    refetchIntervalInBackground: false,
  });
  const newestFirst = q.data?.pages.flatMap((p) => p.items) ?? [];
  const seen = new Set<string>();
  const items = newestFirst.filter((m) => !seen.has((m as { id: string }).id) && seen.add((m as { id: string }).id)).reverse();
  return { ...q, items };
}

export function useSendMessage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => post<ChatMessage>(`/conversations/${id}/messages`, { body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'thread', id] });
      void qc.invalidateQueries({ queryKey: ['chat', 'list'] });
    },
  });
}

export function useChatAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: 'read' | 'block' | 'unblock') => post(`/conversations/${id}/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat'] }),
  });
}

export const useConversation = (id: string) => {
  const list = useConversations();
  return { conversation: list.items.find((c) => (c as { id: string }).id === id), loading: list.isLoading };
};

export const useUnreadMessages = () => {
  const { items } = useConversations();
  return items.reduce((n, c) => n + ((c as { unread?: number }).unread ?? 0), 0);
};
export { useQuery };
