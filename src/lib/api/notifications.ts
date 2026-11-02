'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, type Data } from './core';
import { usePaged } from './paged';

export type AppNotification = Data<'/notifications'> extends (infer A)[] ? A : never;

/** The unread badge: polled every 2 minutes like the app's shell; failures quietly show 0. */
export const useUnreadCount = (enabled = true) =>
  useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      try {
        return (await get<{ count?: number; unread?: number } | number>('/notifications/unread-count')) as unknown;
      } catch {
        return 0;
      }
    },
    select: (v) => (typeof v === 'number' ? v : ((v as { count?: number; unread?: number } | null)?.count ?? (v as { unread?: number } | null)?.unread ?? 0)),
    refetchInterval: 120_000,
    enabled,
  });

export const useNotificationList = (unreadOnly = false) => usePaged<AppNotification>(['notifications', 'list'], '/notifications', { unreadOnly: unreadOnly || undefined });

export function useReadNotification() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post(`/notifications/${id}/read`), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}
export function useReadAllNotifications() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => post('/notifications/read-all'), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}
