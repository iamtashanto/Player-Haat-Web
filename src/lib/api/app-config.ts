'use client';

import { useQuery } from '@tanstack/react-query';
import { get, type Data } from './core';

export type AppConfig = Data<'/app-config'>;

/** Feature flags and pricing, read once and refreshed every 10 minutes (the app does the same). */
export const useAppConfig = () =>
  useQuery({ queryKey: ['app-config'], queryFn: () => get<AppConfig>('/app-config', { auth: false }), staleTime: 10 * 60_000 });
