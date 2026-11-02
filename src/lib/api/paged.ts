'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getPage } from './core';

type Params = object;

/** Cursor-paginated list with "load more", mirroring the app's paged providers. */
export function usePaged<T>(key: readonly unknown[], path: string, params: Params = {}, opts: { enabled?: boolean; refetchInterval?: number | false } = {}) {
  const q = useInfiniteQuery({
    queryKey: [...key, params],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => getPage<T>(path, params, pageParam),
    getNextPageParam: (last) => last.nextCursor,
    enabled: opts.enabled ?? true,
    refetchInterval: opts.refetchInterval ?? false,
    refetchIntervalInBackground: false,
  });
  return { ...q, items: q.data?.pages.flatMap((p) => p.items) ?? [] };
}
