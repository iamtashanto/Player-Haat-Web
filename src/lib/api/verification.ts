'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, type Body, type Data } from './core';

export type Verification = Data<'/recruiters/me/verification'>;

export const useRecruiterVerification = () => useQuery({ queryKey: ['verification', 'recruiter'], queryFn: () => get<Verification>('/recruiters/me/verification') });
export const useStatsVerification = (sportId: number) =>
  useQuery({ queryKey: ['verification', 'stats', sportId], queryFn: () => get<Verification>(`/players/me/sports/${sportId}/verification`) });

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sportId?: number; body: Body<'/recruiters/me/verification'> }) =>
      post(v.sportId ? `/players/me/sports/${v.sportId}/verification` : '/recruiters/me/verification', v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verification'] }),
  });
}
