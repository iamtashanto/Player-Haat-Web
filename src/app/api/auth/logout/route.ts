import { NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookies,
  getBackendApiBaseUrl,
  verifyCsrfRequest,
} from '@/lib/auth-cookies';
import { AUTH_COOKIES } from '@/lib/auth-types';

export async function POST(req: NextRequest) {
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

  const refreshToken = req.cookies.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;
  if (refreshToken) {
    const apiBase = getBackendApiBaseUrl();
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': req.headers.get('user-agent') || 'PlayerHaat-Web',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort revocation; local cookie wipe always proceeds
    }
  }

  const res = NextResponse.json({ data: { loggedOut: true } });
  clearAuthCookies(res);
  return res;
}

