'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';
import type { NamedEntity } from './player-api';

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
