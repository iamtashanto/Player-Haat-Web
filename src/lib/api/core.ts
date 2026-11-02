import type { paths } from './schema';
import { apiRequest, apiRequestWithMeta, type ApiRequestOptions } from '../api-client';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** The `data` of a successful (200/201) response for an OpenAPI path + method, generated from the server's /openapi.json. */
export type Data<P extends keyof paths, M extends Method = 'get'> = paths[P] extends infer Item
  ? Item extends Record<M, { responses: infer R }>
    ? R extends { 200: { content: { 'application/json': { data: infer D } } } }
      ? D
      : R extends { 201: { content: { 'application/json': { data: infer D } } } }
        ? D
        : unknown
    : unknown
  : unknown;

/** The JSON request body for a path + method. */
export type Body<P extends keyof paths, M extends Method = 'post'> = paths[P] extends infer Item
  ? Item extends Record<M, { requestBody?: { content: { 'application/json': infer B } } }>
    ? B
    : never
  : never;

/** Query-string builder that skips empty values. */
export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const out = sp.toString();
  return out ? `?${out}` : '';
}

export const get = <T>(path: string, o?: ApiRequestOptions) => apiRequest<T>(path, o);
export const post = <T>(path: string, body?: unknown, o?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...o, method: 'POST', body });
export const put = <T>(path: string, body?: unknown, o?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...o, method: 'PUT', body });
export const patch = <T>(path: string, body?: unknown, o?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...o, method: 'PATCH', body });
export const del = <T>(path: string, o?: ApiRequestOptions) => apiRequest<T>(path, { ...o, method: 'DELETE' });

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** One page of a cursor-paginated list (matches the app's `shared/paging/paged.dart`). */
export async function getPage<T>(path: string, params: object = {}, cursor?: string | null): Promise<Page<T>> {
  const { data, meta } = await apiRequestWithMeta<T[]>(`${path}${qs({ ...(params as Record<string, string | number | boolean | null | undefined>), cursor: cursor ?? undefined })}`);
  return { items: data ?? [], nextCursor: meta.nextCursor ?? null };
}
