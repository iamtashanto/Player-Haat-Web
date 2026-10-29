import { NextRequest, NextResponse } from 'next/server';
import {
  applyAuthCookies,
  clearAuthCookies,
  getBackendApiBaseUrl,
  isAdminRole,
  parseSessionMeta,
  verifyCsrfRequest,
} from '@/lib/auth-cookies';
import { AUTH_COOKIES, type AuthTokens } from '@/lib/auth-types';

export async function POST(req: NextRequest) {
  // 1. Verify CSRF protection for cookie-based refresh
  if (!verifyCsrfRequest(req)) {
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_CSRF_INVALID',
          message: 'CSRF token missing or invalid',
        },
      },
      { status: 403 },
    );
  }

  // 2. Read httpOnly refresh token cookie
  const refreshToken = req.cookies.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;
  if (!refreshToken) {
    const res = NextResponse.json(
      {
        error: {
          code: 'AUTH_UNAUTHENTICATED',
          message: 'No active session cookie',
        },
      },
      { status: 401 },
    );
    clearAuthCookies(res);
    return res;
  }

  let body: { deviceId?: string } = {};
  try {
    body = (await req.json()) as { deviceId?: string };
  } catch {
    // optional body
  }

  const apiBase = getBackendApiBaseUrl();
  let backendRes: Response;
  try {
    backendRes = await fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') || 'PlayerHaat-Web',
      },
      body: JSON.stringify({
        refreshToken,
        ...(body.deviceId ? { deviceId: body.deviceId } : {}),
      }),
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Cannot reach API server',
        },
      },
      { status: 503 },
    );
  }

  const json = (await backendRes.json().catch(() => null)) as {
    data?: AuthTokens;
    error?: { code?: string; message?: string };
  } | null;

  if (!backendRes.ok || !json?.data?.accessToken || !json?.data?.refreshToken) {
    const res = NextResponse.json(
      json ?? {
        error: {
          code: 'AUTH_INVALID_REFRESH_TOKEN',
          message: 'Session expired',
        },
      },
      { status: backendRes.status || 401 },
    );
    if (backendRes.status === 401 || backendRes.status === 403) {
      clearAuthCookies(res);
    }
    return res;
  }

  const existingMeta = parseSessionMeta(
    req.cookies.get(AUTH_COOKIES.SESSION_META)?.value,
  );

  if (existingMeta && isAdminRole(existingMeta.role)) {
    const res = NextResponse.json(
      {
        error: {
          code: 'AUTH_ADMIN_DASHBOARD_ONLY',
          message: 'Admin accounts sign in through the admin dashboard.',
        },
      },
      { status: 403 },
    );
    clearAuthCookies(res);
    return res;
  }

  const tokens = json.data;
  const res = NextResponse.json({
    data: {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    },
  });

  applyAuthCookies(res, {
    refreshToken: tokens.refreshToken,
    csrfToken: req.cookies.get(AUTH_COOKIES.CSRF_TOKEN)?.value,
    meta: existingMeta ?? {
      userId: 'session',
      role: 'PLAYER',
      activeRole: 'PLAYER',
    },
  });

  return res;
}

