'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DaySlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type AvailabilitySchedule = Partial<Record<Weekday, DaySlot[]>>;

export interface NamedEntity {
  id: number;
  nameBn: string;
  nameEn: string;
}

export interface PositionInfo {
  code: string;
  nameBn: string;
  nameEn: string;
}

export interface StatFieldInfo {
  key: string;
  decimal: boolean;
  nameBn: string;
  nameEn: string;
}

export interface SportCatalogItem {
  id: number;
  code: string;
  nameBn: string;
  nameEn: string;
  positions: PositionInfo[];
  statFields: StatFieldInfo[];
}

export interface LocationDivision extends NamedEntity {
  code: string;
}

export interface LocationDistrict extends NamedEntity {
  divisionId: number;
}

export interface LocationUpazila extends NamedEntity {
  districtId: number;
}

export interface LocationUnion extends NamedEntity {
  upazilaId: number;
}

export interface LocationSearchResult {
  level: 'division' | 'district' | 'upazila' | 'union';
  id: number;
  nameBn: string;
  nameEn: string;
  divisionName?: string;
  districtName?: string;
  upazilaName?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  year?: number | null;
  description?: string | null;
}

export interface PlayerSportProfile {
  sportId: number;
  sportCode: string;
  positions: string[];
  skillLevel: number;
  khepAvailable: boolean;
  rateMin: number | null;
  rateMax: number | null;
  travelRadius: 'UNION' | 'UPAZILA' | 'DISTRICT';
  headline: string | null;
  experienceYears: number | null;
  currentTeam: string | null;
  stats: Record<string, number> | null;
  rating: {
    average: number;
    count: number;
  };
  statsVerified: boolean;
  preferredFoot?: 'LEFT' | 'RIGHT' | 'BOTH' | null;
  battingStyle?: 'RIGHT_HAND' | 'LEFT_HAND' | null;
  availability?: AvailabilitySchedule | null;
  achievements?: AchievementItem[];
  isVisible?: boolean;
  hiddenByAdmin?: boolean;
}

export interface PlayerMediaItem {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  url: string;
  order: number;
}

export interface MyPlayerProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  verifiedBadge: boolean;
  rating: {
    average: number;
    count: number;
  };
  noShowCount: number;
  lastActiveAt: string;
  memberSince?: string;
  isVisible: boolean;
  hiddenByAdmin: boolean;
  contactVisibility: 'ON_TAP' | 'AFTER_ACCEPT';
  location: {
    district: NamedEntity;
    upazila: NamedEntity;
    union: NamedEntity | null;
  };
  sports: PlayerSportProfile[];
  media: PlayerMediaItem[];
}

export interface OpportunityItem {
  id: string;
  sportId: number;
  sportName: string;
  when: string;
  whenText: string;
  venue: string;
  location: {
    district: NamedEntity;
    upazila: NamedEntity;
    union?: NamedEntity | null;
  };
  positions: string[];
  playersNeeded: number;
  spotsLeft: number;
  isPaid: boolean;
  budgetMin?: number | null;
  budgetMax?: number | null;
  isBoosted?: boolean;
  isEvent?: boolean;
  title?: string;
  notes?: string | null;
  status: 'OPEN' | 'FILLED' | 'COMPLETED' | 'CANCELLED';
  captain: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    verified: boolean;
    rating: {
      average: number;
      count: number;
    };
  };
  hasApplied?: boolean;
}

export interface MyApplicationItem {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  proposedRate: number | null;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  contact?: {
    phone: string | null;
  };
  request: {
    id: string;
    sportName: string;
    whenText: string;
    venueText: string;
    locationShort: string;
    isPaid: boolean;
    budgetMin?: number | null;
    budgetMax?: number | null;
    spotsLeft: number;
    captainName: string;
    captainPhone?: string | null;
  };
}

export interface PlayerReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  reviewerName: string;
  reviewerAvatarUrl?: string | null;
  reviewerRole: string;
  sportName: string;
  matchDate: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// QUERIES
// ──────────────────────────────────────────────

export function useSportsCatalog() {
  return useQuery({
    queryKey: ['sports-catalog'],
    queryFn: () => apiRequest<SportCatalogItem[]>('/sports', { auth: false }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useDivisions() {
  return useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: () => apiRequest<LocationDivision[]>('/locations/divisions', { auth: false }),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useDistricts(divisionId?: number | null) {
  return useQuery({
    queryKey: ['locations', 'districts', divisionId],
    queryFn: () =>
      divisionId
        ? apiRequest<LocationDistrict[]>(`/locations/districts?divisionId=${divisionId}`, { auth: false })
        : Promise.resolve([]),
    enabled: Boolean(divisionId),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useUpazilas(districtId?: number | null) {
  return useQuery({
    queryKey: ['locations', 'upazilas', districtId],
    queryFn: () =>
      districtId
        ? apiRequest<LocationUpazila[]>(`/locations/upazilas?districtId=${districtId}`, { auth: false })
        : Promise.resolve([]),
    enabled: Boolean(districtId),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useUnions(upazilaId?: number | null) {
  return useQuery({
    queryKey: ['locations', 'unions', upazilaId],
    queryFn: () =>
      upazilaId
        ? apiRequest<LocationUnion[]>(`/locations/unions?upazilaId=${upazilaId}`, { auth: false })
        : Promise.resolve([]),
    enabled: Boolean(upazilaId),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useMyPlayerProfile() {
  return useQuery({
    queryKey: ['player-profile', 'me'],
    queryFn: () => apiRequest<MyPlayerProfile>('/players/me'),
    retry: 1,
  });
}

export function usePlayerOpportunities(filters: {
  sportId?: number;
  districtId?: number;
  upazilaId?: number;
  isPaid?: boolean;
} = {}) {
  return useQuery({
    queryKey: ['player-opportunities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.sportId) params.set('sportId', String(filters.sportId));
      if (filters.districtId) params.set('districtId', String(filters.districtId));
      if (filters.upazilaId) params.set('upazilaId', String(filters.upazilaId));
      if (filters.isPaid !== undefined) params.set('isPaid', String(filters.isPaid));
      const qs = params.toString();
      return apiRequest<OpportunityItem[]>(`/requests${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useMyApplications(status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN') {
  return useQuery({
    queryKey: ['my-applications', status],
    queryFn: () => {
      const qs = status ? `?status=${status}` : '';
      return apiRequest<MyApplicationItem[]>(`/applications/mine${qs}`);
    },
  });
}

export function usePlayerReviews(playerId?: string) {
  return useQuery({
    queryKey: ['player-reviews', playerId],
    queryFn: () =>
      playerId
        ? apiRequest<PlayerReviewItem[]>(`/players/${playerId}/ratings`)
        : Promise.resolve([]),
    enabled: Boolean(playerId),
  });
}

// ──────────────────────────────────────────────
// MUTATIONS
// ──────────────────────────────────────────────

export function useCreatePlayerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      bio?: string | null;
      districtId: number;
      upazilaId: number;
      unionId?: number | null;
      isVisible?: boolean;
      contactVisibility?: 'ON_TAP' | 'AFTER_ACCEPT';
    }) => apiRequest<MyPlayerProfile>('/players/me', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useUpdatePlayerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      bio?: string | null;
      districtId?: number;
      upazilaId?: number;
      unionId?: number | null;
      isVisible?: boolean;
      contactVisibility?: 'ON_TAP' | 'AFTER_ACCEPT';
    }) => apiRequest<MyPlayerProfile>('/players/me', { method: 'PATCH', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useAddSportProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      sportId: number;
      positions: string[];
      skillLevel: number;
      preferredFoot?: 'LEFT' | 'RIGHT' | 'BOTH' | null;
      battingStyle?: 'RIGHT_HAND' | 'LEFT_HAND' | null;
      khepAvailable?: boolean;
      rateMin?: number | null;
      rateMax?: number | null;
      availability?: AvailabilitySchedule | null;
      travelRadius?: 'UNION' | 'UPAZILA' | 'DISTRICT';
      headline?: string | null;
      experienceYears?: number | null;
      currentTeam?: string | null;
      stats?: Record<string, number> | null;
      isVisible?: boolean;
    }) => apiRequest<PlayerSportProfile>('/players/me/sports', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useUpdateSportProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sportId,
      body,
    }: {
      sportId: number;
      body: Partial<{
        positions: string[];
        skillLevel: number;
        preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH' | null;
        battingStyle: 'RIGHT_HAND' | 'LEFT_HAND' | null;
        khepAvailable: boolean;
        rateMin: number | null;
        rateMax: number | null;
        availability: AvailabilitySchedule | null;
        travelRadius: 'UNION' | 'UPAZILA' | 'DISTRICT';
        headline: string | null;
        experienceYears: number | null;
        currentTeam: string | null;
        stats: Record<string, number> | null;
        isVisible: boolean;
      }>;
    }) =>
      apiRequest<PlayerSportProfile>(`/players/me/sports/${sportId}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useDeleteSportProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sportId: number) =>
      apiRequest(`/players/me/sports/${sportId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useAddAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sportId,
      body,
    }: {
      sportId: number;
      body: { title: string; year?: number | null; description?: string | null };
    }) =>
      apiRequest<AchievementItem>(`/players/me/sports/${sportId}/achievements`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sportId, achievementId }: { sportId: number; achievementId: string }) =>
      apiRequest(`/players/me/sports/${sportId}/achievements/${achievementId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useAddVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      apiRequest('/players/me/media/videos', { method: 'POST', body: { url } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) =>
      apiRequest(`/players/me/media/${mediaId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', 'me'] });
    },
  });
}

export function useApplyToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      proposedRate,
      message,
    }: {
      requestId: string;
      proposedRate?: number | null;
      message?: string | null;
    }) =>
      apiRequest(`/requests/${requestId}/applications`, {
        method: 'POST',
        body: { proposedRate, message },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['player-opportunities'] });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      apiRequest(`/applications/${applicationId}/withdraw`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['player-opportunities'] });
    },
  });
}

