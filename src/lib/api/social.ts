'use client';

import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { del, get, post, put, type Body, type Data, type Page } from './core';
import { usePaged } from './paged';

/* ── players ── */
export type PlayerCard = Data<'/players'> extends (infer A)[] ? A : never;
export type PlayerSportDetail = PlayerCard['sports'][number] & {
  achievements?: { id: string; title: string; year: number | null; description: string | null }[];
  availability?: Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string[]>> | null;
};
/** `GET /players/:id`: the card plus bio, media and detailed sport profiles (the schema types it loosely). */
export type PlayerProfile = Omit<PlayerCard, 'sports'> & {
  sports: PlayerSportDetail[];
  bio: string | null;
  media: { id: string; type: 'PHOTO' | 'VIDEO'; url: string; order: number }[];
  memberSince: string;
};
export type PlayerFilters = {
  sportId?: number; position?: string; districtId?: number; upazilaId?: number; unionId?: number;
  khepAvailable?: boolean; rateMin?: number; rateMax?: number; minRating?: number; minExperienceYears?: number;
  minSkillLevel?: number; statsVerified?: boolean; q?: string; availabilityDay?: string; sort?: 'rating' | 'active';
};
export const usePlayerSearch = (f: PlayerFilters) => usePaged<PlayerCard>(['players', 'search'], '/players', f);
export const usePlayer = (id: string | null | undefined) =>
  useQuery({ queryKey: ['players', 'detail', id], queryFn: () => get<PlayerProfile>(`/players/${id}`), enabled: !!id });
export const usePlayerRatings = (id: string | null | undefined) => usePaged<Data<'/players/{id}/ratings'> extends (infer A)[] ? A : never>(['players', id, 'ratings'], `/players/${id}/ratings`, {}, { enabled: !!id });

/* ── shortlist (optimistic heart) ── */
export const useShortlistList = (sportId?: number) => usePaged<PlayerCard>(['shortlist'], '/shortlist', { sportId });
export function useToggleShortlistHeart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { profileId: string; saved: boolean }) => (v.saved ? put(`/shortlist/${v.profileId}`) : del(`/shortlist/${v.profileId}`)),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ['players'] });
      const snapshots = qc.getQueriesData<InfiniteData<Page<PlayerCard>>>({ queryKey: ['players', 'search'] });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        qc.setQueryData(key, { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map((c) => (c.id === v.profileId ? { ...c, shortlisted: v.saved } : c)) })) });
      }
      qc.setQueryData<PlayerProfile>(['players', 'detail', v.profileId], (old) => (old ? { ...old, shortlisted: v.saved } : old));
      return { snapshots };
    },
    onError: (_e, _v, ctx) => ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['shortlist'] }),
  });
}

/* ── contact reveal & viewers ── */
export type Contact = Data<'/players/{id}/contact'>;
export const useContactStatus = (id: string | null | undefined) =>
  useQuery({ queryKey: ['contact', id], queryFn: () => get<Contact>(`/players/${id}/contact`), enabled: !!id });
export function useRevealContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post<{ phone: string | null; cost: number; balance: number | null }>(`/players/${id}/contact`),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: ['contact', id] });
      void qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}
export const useContactViews = () => usePaged<Data<'/players/me/contact-views'> extends (infer A)[] ? A : never>(['contact-views'], '/players/me/contact-views');

/* ── invites ── */
export type Invite = Data<'/invites/received'> extends (infer A)[] ? A : never;
export const useReceivedInvites = (status?: string) => usePaged<Invite>(['invites', 'received'], '/invites/received', { status });
export const useSentInvites = (status?: string) => usePaged<Invite>(['invites', 'sent'], '/invites/sent', { status });
export function useSendInvite() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (b: Body<'/invites'>) => post('/invites', b), onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }) });
}
export function useInviteAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; action: 'accept' | 'decline' | 'withdraw' }) => post(`/invites/${v.id}/${v.action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
  });
}

/* ── reports ── */
export const useReport = () => useMutation({ mutationFn: (b: Body<'/reports'>) => post('/reports', b) });
