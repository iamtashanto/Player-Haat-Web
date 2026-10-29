'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';

export interface LinkedMethods {
  hasPassword: boolean;
  phone: string | null;
  email: string | null;
  google: boolean;
  apple: boolean;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsListResult {
  items: NotificationItem[];
  unreadCount: number;
}

export function useLinkedMethods() {
  return useQuery({
    queryKey: ['auth-methods'],
    queryFn: () => apiRequest<LinkedMethods>('/auth/methods'),
  });
}

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const qs = unreadOnly ? '?unread=true' : '';
      return apiRequest<NotificationItem[]>(`/notifications${qs}`);
    },
  });
}

export function useUnlinkMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: 'phone' | 'google' | 'apple') =>
      apiRequest(`/auth/methods/${provider}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-methods'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (body: { confirm: 'DELETE'; password?: string }) =>
      apiRequest('/auth/account', { method: 'DELETE', body }),
  });
}

