import { NextRequest, NextResponse } from 'next/server';
import {
  isAdminRole,
  parseSessionMeta,
  serializeSessionMeta,
  verifyCsrfRequest,
} from '@/lib/auth-cookies';
import {
  AUTH_COOKIES,
  type AccountRole,
  type AppRole,
  type SessionMetaCookie,
} from '@/lib/auth-types';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

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

  let body: {
    userId?: string;
    role?: AccountRole;
    activeRole?: AppRole;
    hasPlayerProfile?: boolean;
    hasRecruiterProfile?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON' } },
      { status: 400 },
    );
  }

  const current = parseSessionMeta(
    req.cookies.get(AUTH_COOKIES.SESSION_META)?.value,
  );
  const nextRole = body.role ?? current?.role ?? 'PLAYER';
  if (isAdminRole(nextRole)) {
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_ADMIN_DASHBOARD_ONLY',
          message: 'Admin accounts sign in through the admin dashboard.',
        },
      },
      { status: 403 },
    );
  }

  const nextActiveRole: AppRole =
    body.activeRole === 'RECRUITER' || body.activeRole === 'PLAYER'
      ? body.activeRole
      : (current?.activeRole ?? (nextRole === 'RECRUITER' ? 'RECRUITER' : 'PLAYER'));

  const nextMeta: SessionMetaCookie = {
    userId: body.userId ?? current?.userId ?? 'session',
    role: nextRole,
    activeRole: nextActiveRole,
    hasPlayerProfile: body.hasPlayerProfile ?? current?.hasPlayerProfile,
    hasRecruiterProfile:
      body.hasRecruiterProfile ?? current?.hasRecruiterProfile,
  };

  const isProd = process.env.NODE_ENV === 'production';
  const res = NextResponse.json({ data: nextMeta });

  res.cookies.set(AUTH_COOKIES.SESSION_META, serializeSessionMeta(nextMeta), {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  });

  res.cookies.set(AUTH_COOKIES.ACTIVE_ROLE, nextActiveRole, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  });

  return res;
}

