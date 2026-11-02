'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, type Body, type Data } from './core';

export type PendingRating = Data<'/ratings/pending'>;

export const usePendingRatings = () => useQuery({ queryKey: ['ratings', 'pending'], queryFn: () => get<PendingRating>('/ratings/pending') });
export function useSubmitRatings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { requestId: string; body: Body<'/requests/{requestId}/ratings'> }) => post(`/requests/${v.requestId}/ratings`, v.body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ratings'] });
      void qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
