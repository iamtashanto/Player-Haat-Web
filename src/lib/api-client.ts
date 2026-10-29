import { AUTH_COOKIES, type AppRole, type AuthUser } from './auth-types';
import { ApiException } from './errors';

/**
 * Strictly in-memory access token storage.
 * Never persisted to `localStorage`, `sessionStorage`, or non-httpOnly cookies.
 */
let inMemoryAccessToken: string | null = null;
let inMemoryAccessExpiresAt = 0;

/** Single-flight refresh promise so concurrent 401s share a single `/api/auth/refresh` request */
let activeRefreshPromise: Promise<string | null> | null = null;

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(fn: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(fn);
  return () => {
    sessionExpiredListeners.delete(fn);
  };
}

function notifySessionExpired() {
  for (const fn of sessionExpiredListeners) {
    fn();
  }
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(
  token: string | null,
  expiresInSeconds = 900,
): void {
  inMemoryAccessToken = token;
  inMemoryAccessExpiresAt = token
    ? Date.now() + expiresInSeconds * 1000
    : 0;
}

export function clearAccessToken(): void {
  inMemoryAccessToken = null;
  inMemoryAccessExpiresAt = 0;
}

export function isAccessTokenExpiringSoon(bufferMs = 30_000): boolean {
  if (!inMemoryAccessToken) return true;
  return Date.now() + bufferMs >= inMemoryAccessExpiresAt;
}

/**
 * Reads a non-httpOnly cookie value in the browser (e.g. `ph_csrf_token` or `ph_session_meta`).
 */
export function readBrowserCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getCsrfTokenFromCookie(): string | null {
  return readBrowserCookie(AUTH_COOKIES.CSRF_TOKEN);
}

/**
 * Generates or retrieves a stable browser `deviceId` (mirrors Flutter's `appPrefsProvider.deviceId`).
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'web-ssr';
  try {
    const key = 'ph-device-id';
    let id = localStorage.getItem(key);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? `web-${crypto.randomUUID()}`
          : `web-${Math.random().toString(36).slice(2)}-${Date.now()}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'web-client';
  }
}

export function getPublicApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
  ).replace(/\/+$/, '');
}

/**
 * Silent refresh via Next.js BFF Route Handler (`POST /api/auth/refresh`),
 * which reads the `httpOnly` `ph_refresh_token` cookie and verifies `x-csrf-token`.
 */
export async function silentRefreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const csrf = getCsrfTokenFromCookie();
  if (!csrf) {
    // No CSRF cookie means no active web session was established
    clearAccessToken();
    return null;
  }

  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ deviceId: getDeviceId() }),
      });

      const json = (await res.json().catch(() => null)) as {
        data?: { accessToken?: string; expiresIn?: number };
        error?: { code?: string; message?: string };
      } | null;

      if (!res.ok || !json?.data?.accessToken) {
        clearAccessToken();
        if (res.status === 401 || res.status === 403) {
          notifySessionExpired();
        }
        return null;
      }

      setAccessToken(json.data.accessToken, json.data.expiresIn ?? 900);
      return json.data.accessToken;
    } catch {
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

export interface EstablishSessionResult {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
  isNewUser: boolean;
}

/**
 * Calls Next.js BFF `/api/auth/establish` to exchange credentials, set the `httpOnly` refresh cookie,
 * and store the access token strictly in memory.
 */
export async function establishWebSession(
  method: 'login' | 'register' | 'phone_verify' | 'google' | 'apple' | 'tokens',
  payload: Record<string, unknown>,
  locale = 'bn',
): Promise<EstablishSessionResult> {
  let res: Response;
  try {
    res = await fetch('/api/auth/establish', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale,
      },
      body: JSON.stringify({
        method,
        payload: {
          ...payload,
          deviceId: payload.deviceId ?? getDeviceId(),
        },
      }),
    });
  } catch {
    throw new ApiException({
      code: 'NETWORK_ERROR',
      status: 0,
      message: 'Network error',
    });
  }

  const json = (await res.json().catch(() => null)) as {
    data?: EstablishSessionResult;
    error?: {
      code?: string;
      message?: string;
      details?: Array<{ path: string; code: string; message: string }> | null;
    };
  } | null;

  if (!res.ok || !json?.data) {
    throw new ApiException({
      code: json?.error?.code || 'INTERNAL_ERROR',
      status: res.status || 500,
      message: json?.error?.message,
      details: json?.error?.details,
    });
  }

  setAccessToken(json.data.accessToken, json.data.expiresIn);
  return json.data;
}

/**
 * Updates the session metadata cookie (`activeRole`, `hasPlayerProfile`, `hasRecruiterProfile`).
 */
export async function syncSessionMetaCookie(meta: {
  userId?: string;
  role?: 'PLAYER' | 'RECRUITER';
  activeRole?: AppRole;
  hasPlayerProfile?: boolean;
  hasRecruiterProfile?: boolean;
}): Promise<void> {
  const csrf = getCsrfTokenFromCookie();
  if (!csrf) return;
  try {
    await fetch('/api/auth/meta', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
      },
      body: JSON.stringify(meta),
    });
  } catch {
    // non-fatal
  }
}

/**
 * Logs out by calling `/api/auth/logout` (which revokes the refresh token on the API and clears cookies)
 * and wiping the in-memory access token.
 */
export async function destroyWebSession(): Promise<void> {
  const csrf = getCsrfTokenFromCookie();
  clearAccessToken();
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'x-csrf-token': csrf } : {}),
      },
    });
  } catch {
    // best effort
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  locale?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Core API client targeting the Express + Prisma backend (`/api/v1`).
 * - Attaches `Authorization: Bearer <inMemoryAccessToken>` when `auth !== false`.
 * - Performs automatic silent refresh on `401` and retries the request once.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    locale = 'bn',
    headers = {},
    signal,
  } = options;

  const baseUrl = getPublicApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  let token = getAccessToken();
  if (auth && (!token || isAccessTokenExpiringSoon())) {
    const refreshed = await silentRefreshAccessToken();
    if (refreshed) token = refreshed;
  }

  const execute = async (bearerToken: string | null): Promise<Response> => {
    const reqHeaders: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Language': locale,
      ...headers,
    };

    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isFormData) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (auth && bearerToken) {
      reqHeaders.Authorization = `Bearer ${bearerToken}`;
    }

    return fetch(url, {
      method,
      headers: reqHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
      signal,
    });
  };

  let res: Response;
  try {
    res = await execute(token);
  } catch {
    throw new ApiException({
      code: 'NETWORK_ERROR',
      status: 0,
      message: 'Network error',
    });
  }

  // On 401 for an authenticated endpoint, attempt silent refresh once and retry
  if (res.status === 401 && auth) {
    const refreshedToken = await silentRefreshAccessToken();
    if (refreshedToken) {
      try {
        res = await execute(refreshedToken);
      } catch {
        throw new ApiException({
          code: 'NETWORK_ERROR',
          status: 0,
          message: 'Network error',
        });
      }
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = (await res.json().catch(() => null)) as {
    data?: T;
    meta?: unknown;
    error?: {
      code?: string;
      message?: string;
      details?: Array<{ path: string; code: string; message: string }> | null;
    };
  } | null;

  if (!res.ok) {
    throw new ApiException({
      code: json?.error?.code || 'INTERNAL_ERROR',
      status: res.status,
      message: json?.error?.message,
      details: json?.error?.details,
    });
  }

  return (json && 'data' in json ? json.data : (json as unknown)) as T;
}
