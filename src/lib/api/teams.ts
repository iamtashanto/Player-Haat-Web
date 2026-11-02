'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { del, get, patch, post, type Body, type Data } from './core';

export type Team = Data<'/teams/{id}'>;
export type TeamSummary = Data<'/teams/mine'> extends (infer A)[] ? A : never;

export const useMyTeams = () => useQuery({ queryKey: ['teams', 'mine'], queryFn: () => get<TeamSummary[]>('/teams/mine') });
export const useTeam = (id: string | null | undefined) => useQuery({ queryKey: ['teams', 'detail', id], queryFn: () => get<Team>(`/teams/${id}`), enabled: !!id });

function useTeamMutation<V, R = unknown>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }) });
}
export const useCreateTeam = () => useTeamMutation((b: Body<'/teams'>) => post<Team>('/teams', b));
export const useJoinTeam = () => useTeamMutation((code: string) => post<Team>('/teams/join', { code }));
export const useUpdateTeam = () => useTeamMutation((v: { id: string; body: Body<'/teams/{id}', 'patch'> }) => patch<Team>(`/teams/${v.id}`, v.body));
export const useNewJoinCode = () => useTeamMutation((id: string) => post<Team>(`/teams/${id}/join-code`));
export const useLeaveTeam = () => useTeamMutation((id: string) => post(`/teams/${id}/leave`));
export const useRemoveMember = () => useTeamMutation((v: { id: string; memberId: string }) => del(`/teams/${v.id}/members/${v.memberId}`));
export const useDeleteTeam = () => useTeamMutation((id: string) => del(`/teams/${id}`));
