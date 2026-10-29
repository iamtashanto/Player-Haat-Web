'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';
import type { NamedEntity } from './player-api';
import type { SamplePlayerCardData } from '@/components/shared/domain-cards';

export type RecruiterTypeCode =
  | 'CLUB'
  | 'ACADEMY'
  | 'SCOUT'
  | 'AGENT'
  | 'ORGANIZER'
  | 'OTHER';

export interface RecruiterTypeItem {
  code: RecruiterTypeCode;
  nameEn: string;
  nameBn: string;
}

export interface MyRecruiterProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  type: RecruiterTypeCode;
  organization: string | null;
  bio: string | null;
  district: NamedEntity;
  sportIds: number[];
  verifiedBadge: boolean;
}

export interface PlayerSearchResultItem {
  id: string;
  name: string;
  avatarUrl: string | null;
  verifiedBadge: boolean;
  rating: {
    average: number;
    count: number;
  };
  noShowCount: number;
  lastActiveAt: string;
  location: {
    district: NamedEntity;
    upazila: NamedEntity;
    union?: NamedEntity | null;
  };
  sports: Array<{
    sportId: number;
    sportCode: string;
    positions: string[];
    skillLevel: number;
    khepAvailable: boolean;
    rateMin: number | null;
    rateMax: number | null;
    travelRadius: string;
    headline: string | null;
    experienceYears: number | null;
    currentTeam: string | null;
    rating: {
      average: number;
      count: number;
    };
    statsVerified: boolean;
    stats?: Record<string, number> | null;
  }>;
  shortlisted?: boolean;
}

export interface ShortlistItem {
  profileId: string;
  savedAt: string;
  note?: string | null;
  player: PlayerSearchResultItem;
}

export interface RecruiterRequestItem {
  id: string;
  kind: 'MATCH' | 'EVENT';
  title?: string | null;
  sportId: number;
  sportName: string;
  matchAt: string;
  whenText: string;
  venueText: string;
  location: {
    district: NamedEntity;
    upazila: NamedEntity;
    union?: NamedEntity | null;
  };
  positionsNeeded: string[];
  playersNeeded: number;
  spotsLeft: number;
  isPaid: boolean;
  budgetMin?: number | null;
  budgetMax?: number | null;
  notes?: string | null;
  status: 'OPEN' | 'FILLED' | 'COMPLETED' | 'CANCELLED';
  isBoosted?: boolean;
  applicantCount: number;
  acceptedCount: number;
}

export interface ApplicantItem {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  proposedRate: number | null;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  contact?: {
    phone: string | null;
  };
  player: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rating: {
      average: number;
      count: number;
    };
    noShowCount: number;
    verifiedBadge: boolean;
    sports: Array<{
      sportId: number;
      positions: string[];
      rateMin?: number | null;
      rateMax?: number | null;
      experienceYears?: number | null;
    }>;
  } | null;
}

// ──────────────────────────────────────────────
// QUERIES
// ──────────────────────────────────────────────

export function useRecruiterTypes() {
  return useQuery({
    queryKey: ['recruiter-types'],
    queryFn: () => apiRequest<RecruiterTypeItem[]>('/recruiter-types', { auth: false }),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useMyRecruiterProfile() {
  return useQuery({
    queryKey: ['recruiter-profile', 'me'],
    queryFn: () => apiRequest<MyRecruiterProfile>('/recruiters/me'),
    retry: 1,
  });
}

export function useSearchPlayers(filters: {
  sportId?: number;
  districtId?: number;
  upazilaId?: number;
  position?: string;
  skillLevel?: number;
  khepOnly?: boolean;
  verifiedOnly?: boolean;
  rateMax?: number;
  query?: string;
} = {}) {
  return useQuery({
    queryKey: ['search-players', filters],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filters.sportId) p.set('sportId', String(filters.sportId));
      if (filters.districtId) p.set('districtId', String(filters.districtId));
      if (filters.upazilaId) p.set('upazilaId', String(filters.upazilaId));
      if (filters.position) p.set('position', filters.position);
      if (filters.skillLevel) p.set('minSkill', String(filters.skillLevel));
      if (filters.khepOnly) p.set('khepAvailable', 'true');
      if (filters.verifiedOnly) p.set('verified', 'true');
      if (filters.rateMax) p.set('maxRate', String(filters.rateMax));
      if (filters.query) p.set('q', filters.query);

      const qs = p.toString();
      return apiRequest<PlayerSearchResultItem[]>(`/players${qs ? `?${qs}` : ''}`);
    },
    staleTime: 1000 * 30,
  });
}

export function useShortlist() {
  return useQuery({
    queryKey: ['shortlist'],
    queryFn: () => apiRequest<ShortlistItem[]>('/shortlist'),
  });
}

export function useMyRequests() {
  return useQuery({
    queryKey: ['my-requests'],
    queryFn: () => apiRequest<RecruiterRequestItem[]>('/requests/mine'),
  });
}

export function useRequestApplicants(requestId: string | null) {
  return useQuery({
    queryKey: ['request-applicants', requestId],
    queryFn: () =>
      requestId
        ? apiRequest<ApplicantItem[]>(`/requests/${requestId}/applications`)
        : Promise.resolve([]),
    enabled: Boolean(requestId),
  });
}

// ──────────────────────────────────────────────
// MUTATIONS
// ──────────────────────────────────────────────

export function useCreateRecruiterProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      type: RecruiterTypeCode;
      organization?: string | null;
      bio?: string | null;
      districtId: number;
      sportIds: number[];
    }) => apiRequest<MyRecruiterProfile>('/recruiters/me', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-profile', 'me'] });
    },
  });
}

export function useUpdateRecruiterProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{
      type: RecruiterTypeCode;
      organization: string | null;
      bio: string | null;
      districtId: number;
      sportIds: number[];
    }>) => apiRequest<MyRecruiterProfile>('/recruiters/me', { method: 'PATCH', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-profile', 'me'] });
    },
  });
}

export function useToggleShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      shortlisted,
      note,
    }: {
      profileId: string;
      shortlisted: boolean;
      note?: string;
    }) => {
      if (shortlisted) {
        return apiRequest(`/shortlist/${profileId}`, {
          method: 'PUT',
          body: { note: note ?? null },
        });
      } else {
        return apiRequest(`/shortlist/${profileId}`, { method: 'DELETE' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlist'] });
      queryClient.invalidateQueries({ queryKey: ['search-players'] });
    },
  });
}

export function useCreateRecruitmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      sportId: number;
      matchAt: string;
      venueText: string;
      districtId: number;
      upazilaId: number;
      unionId?: number | null;
      positionsNeeded?: string[];
      playersNeeded?: number;
      isPaid?: boolean;
      budgetMin?: number | null;
      budgetMax?: number | null;
      notes?: string | null;
      kind?: 'MATCH' | 'EVENT';
      title?: string | null;
    }) => apiRequest<RecruiterRequestItem>('/requests', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useCancelRecruitmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/requests/${requestId}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useFillRecruitmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/requests/${requestId}/fill`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useCompleteRecruitmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/requests/${requestId}/complete`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useBoostRecruitmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiRequest(`/requests/${requestId}/boost`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useAcceptApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      apiRequest(`/applications/${applicationId}/accept`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useRejectApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      apiRequest(`/applications/${applicationId}/reject`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useSendPlayerInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      profileId: string;
      sportId?: number;
      requestId?: string;
      message?: string;
    }) => apiRequest('/invites', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites', 'sent'] });
    },
  });
}

export function useSubmitMatchRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: {
        applicationId?: string;
        scores?: {
          skill?: number;
          punctuality?: number;
          behavior?: number;
        };
        comment?: string | null;
        noShow?: boolean;
      };
    }) =>
      apiRequest(`/requests/${requestId}/ratings`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}

export function useRevealPlayerContact() {
  return useMutation({
    mutationFn: (playerId: string) =>
      apiRequest<{ phone: string | null; contactCost?: number }>(`/players/${playerId}/contact`, {
        method: 'POST',
      }),
  });
}
