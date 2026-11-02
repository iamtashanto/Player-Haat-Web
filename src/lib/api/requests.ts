'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { del, get, patch, post, qs, type Body, type Data } from './core';
import { usePaged } from './paged';

export type PlayerRequest = Data<'/requests/{id}'>;
export type CreateRequestBody = Body<'/requests'>;
export type UpdateRequestBody = Body<'/requests/{id}', 'patch'>;
export type RequestApplication = Data<'/requests/{requestId}/applications'> extends (infer A)[] ? A : never;
export type MyApplication = Data<'/applications/mine'> extends (infer A)[] ? A : never;

export interface FeedFilters {
  sportId?: number;
  position?: string;
  districtId?: number;
  upazilaId?: number;
  isPaid?: boolean;
  kind?: 'MATCH' | 'EVENT';
}

export const useRequestFeed = (f: FeedFilters = {}) => usePaged<PlayerRequest>(['requests', 'feed'], '/requests', f);
export const useMyRequestsList = (status?: 'OPEN' | 'FILLED' | 'CANCELLED' | 'COMPLETED') =>
  usePaged<PlayerRequest>(['requests', 'mine'], '/requests/mine', { status });
export const useFeaturedRequests = (f: { kind?: 'MATCH' | 'EVENT'; sportId?: number; limit?: number } = {}) =>
  useQuery({ queryKey: ['requests', 'featured', f], queryFn: () => get<PlayerRequest[]>(`/requests/featured${qs(f)}`) });
export const useRequest = (id: string | null | undefined) =>
  useQuery({ queryKey: ['requests', 'detail', id], queryFn: () => get<PlayerRequest>(`/requests/${id}`), enabled: !!id });
export const useRequestApplicationsList = (requestId: string | null | undefined, status?: string) =>
  usePaged<RequestApplication>(['requests', requestId, 'applications'], `/requests/${requestId}/applications`, { status }, { enabled: !!requestId });
export const useMyApplicationsList = (status?: string) => usePaged<MyApplication>(['applications', 'mine'], '/applications/mine', { status });

function useRequestMutation<V>(fn: (v: V) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }) });
}

export const useCreateRequest = () => useRequestMutation((b: CreateRequestBody) => post<PlayerRequest>('/requests', b));
export const useEditRequest = () => useRequestMutation((v: { id: string; body: UpdateRequestBody }) => patch<PlayerRequest>(`/requests/${v.id}`, v.body));
export const useRequestAction = () => useRequestMutation((v: { id: string; action: 'boost' | 'cancel' | 'fill' | 'complete' }) => post<PlayerRequest>(`/requests/${v.id}/${v.action}`));

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { requestId: string; body?: Body<'/requests/{requestId}/applications'> }) => post(`/requests/${v.requestId}/applications`, v.body ?? {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] });
      void qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useApplicationAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; action: 'accept' | 'reject' | 'withdraw' }) => post(`/applications/${v.id}/${v.action}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] });
      void qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export { del };
