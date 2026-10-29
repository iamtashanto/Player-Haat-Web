import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIES,
  type AccountRole,
  type AppRole,
  type SessionMetaCookie,
} from './auth-types';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export function getBackendApiBaseUrl(): string {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1'
  ).replace(/\/+$/, '');
}

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function isAdminRole(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function serializeSessionMeta(meta: SessionMetaCookie): string {
  return Buffer.from(JSON.stringify(meta), 'utf8').toString('base64url');
}

export function parseSessionMeta(
  raw?: string | null,
): SessionMetaCookie | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as Partial<SessionMetaCookie>;
    if (
      typeof parsed.userId === 'string' &&
      typeof parsed.role === 'string' &&
      (parsed.activeRole === 'PLAYER' || parsed.activeRole === 'RECRUITER')
    ) {
      return {
        userId: parsed.userId,
        role: parsed.role as AccountRole,
        activeRole: parsed.activeRole as AppRole,
        hasPlayerProfile: parsed.hasPlayerProfile,
        hasRecruiterProfile: parsed.hasRecruiterProfile,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verifies the double-submit CSRF token (`x-csrf-token` header matches `ph_csrf_token` cookie)
 * and ensures same-origin / non-cross-site intent for state-changing cookie endpoints.
 */
export function verifyCsrfRequest(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(AUTH_COOKIES.CSRF_TOKEN)?.value;
  const headerToken = req.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length < 16 || cookieToken !== headerToken) return false;
  return true;
}

/**
 * Attaches the `httpOnly, Secure, SameSite=Lax` refresh token cookie,
 * the readable CSRF cookie, and the session metadata cookie to a `NextResponse`.
 */
export function applyAuthCookies(
  res: NextResponse,
  params: {
    refreshToken: string;
    csrfToken?: string;
    meta: SessionMetaCookie;
  },
): string {
  const isProd = process.env.NODE_ENV === 'production';
  const csrf = params.csrfToken || generateCsrfToken();

  // 1. Refresh token in httpOnly, Secure, SameSite=Lax cookie
  res.cookies.set(AUTH_COOKIES.REFRESH_TOKEN, params.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  });

  // 2. CSRF token in readable SameSite=Lax cookie so client API layer can attach `x-csrf-token`
  res.cookies.set(AUTH_COOKIES.CSRF_TOKEN, csrf, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  });

  // 3. Lightweight session metadata for Next.js middleware route protection
  res.cookies.set(
    AUTH_COOKIES.SESSION_META,
    serializeSessionMeta(params.meta),
    {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: THIRTY_DAYS_SECONDS,
    },
  );

  // 4. Active role cookie
  res.cookies.set(AUTH_COOKIES.ACTIVE_ROLE, params.meta.activeRole, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  });

  return csrf;
}

/**
 * Clears all session and auth cookies on logout or session expiration.
 */
export function clearAuthCookies(res: NextResponse): void {
  const isProd = process.env.NODE_ENV === 'production';
  for (const name of Object.values(AUTH_COOKIES)) {
    res.cookies.set(name, '', {
      httpOnly: name === AUTH_COOKIES.REFRESH_TOKEN,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}

