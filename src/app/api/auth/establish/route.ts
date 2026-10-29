import { NextRequest, NextResponse } from 'next/server';
import {
  applyAuthCookies,
  getBackendApiBaseUrl,
  isAdminRole,
} from '@/lib/auth-cookies';
import type { AppRole, AuthTokens, AuthUser } from '@/lib/auth-types';

type EstablishMethod =
  | 'login'
  | 'register'
  | 'phone_verify'
  | 'google'
  | 'apple'
  | 'tokens';

interface EstablishRequestBody {
  method: EstablishMethod;
  payload: Record<string, unknown>;
}

const METHOD_TO_BACKEND_PATH: Record<
  Exclude<EstablishMethod, 'tokens'>,
  string
> = {
  login: '/auth/login',
  register: '/auth/register',
  phone_verify: '/auth/phone/verify',
  google: '/auth/google',
  apple: '/auth/apple',
};

export async function POST(req: NextRequest) {
  let body: EstablishRequestBody;
  try {
    body = (await req.json()) as EstablishRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid JSON request body',
        },
      },
      { status: 400 },
    );
  }

  if (!body || !body.method || typeof body.payload !== 'object') {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing auth method or payload',
        },
      },
      { status: 400 },
    );
  }

  let user: AuthUser;
  let tokens: AuthTokens;
  let isNewUser = false;

  if (body.method === 'tokens') {
    // Direct session update (e.g. after PUT /auth/password)
    const rawUser = body.payload.user as AuthUser | undefined;
    const rawTokens = body.payload.tokens as AuthTokens | undefined;
    if (!rawUser || !rawTokens?.accessToken || !rawTokens?.refreshToken) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing user or tokens',
          },
        },
        { status: 400 },
      );
    }
    user = rawUser;
    tokens = rawTokens;
  } else {
    const backendPath = METHOD_TO_BACKEND_PATH[body.method];
    if (!backendPath) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Unsupported auth method',
          },
        },
        { status: 400 },
      );
    }

    const apiBase = getBackendApiBaseUrl();
    let backendRes: Response;
    try {
      backendRes = await fetch(`${apiBase}${backendPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': req.headers.get('accept-language') || 'bn',
          'User-Agent': req.headers.get('user-agent') || 'PlayerHaat-Web',
        },
        body: JSON.stringify(body.payload),
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
      data?: {
        user?: AuthUser;
        tokens?: AuthTokens;
        isNewUser?: boolean;
      };
      error?: {
        code?: string;
        message?: string;
        details?: unknown;
      };
    } | null;

    if (!backendRes.ok || !json?.data?.user || !json?.data?.tokens) {
      return NextResponse.json(
        json ?? {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Authentication failed',
          },
        },
        { status: backendRes.status || 500 },
      );
    }

    user = json.data.user;
    tokens = json.data.tokens;
    isNewUser = Boolean(json.data.isNewUser);
  }

  // Enforce RBAC rule: SUPER_ADMIN / ADMIN tokens must never log in on this website
  if (isAdminRole(user.role)) {
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

  const activeRole: AppRole =
    user.role === 'RECRUITER' ? 'RECRUITER' : 'PLAYER';

  const res = NextResponse.json({
    data: {
      user,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      isNewUser,
    },
  });

  applyAuthCookies(res, {
    refreshToken: tokens.refreshToken,
    meta: {
      userId: user.id,
      role: user.role,
      activeRole,
    },
  });

  return res;
}

