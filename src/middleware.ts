import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing, type AppLocale } from './i18n/routing';
import { AUTH_COOKIES, type SessionMetaCookie } from './lib/auth-types';
import { resolveRouteProtection } from './lib/route-protection';

const handleI18nRouting = createMiddleware(routing);

function decodeSessionMetaEdge(raw?: string | null): SessionMetaCookie | null {
  if (!raw) return null;
  try {
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    const json = atob(padded);
    const parsed = JSON.parse(json) as Partial<SessionMetaCookie>;
    if (
      typeof parsed.userId === 'string' &&
      typeof parsed.role === 'string' &&
      (parsed.activeRole === 'PLAYER' || parsed.activeRole === 'RECRUITER')
    ) {
      return parsed as SessionMetaCookie;
    }
    return null;
  } catch {
    return null;
  }
}

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = routing.locales.includes(firstSegment as AppLocale);
  const locale: AppLocale = hasLocalePrefix
    ? (firstSegment as AppLocale)
    : routing.defaultLocale;
  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join('/')}`
    : pathname;

  const hasRefreshCookie = Boolean(
    req.cookies.get(AUTH_COOKIES.REFRESH_TOKEN)?.value,
  );
  const meta = decodeSessionMetaEdge(
    req.cookies.get(AUTH_COOKIES.SESSION_META)?.value,
  );
  const activeRoleCookie = req.cookies.get(AUTH_COOKIES.ACTIVE_ROLE)?.value;

  const decision = resolveRouteProtection({
    locale,
    pathWithoutLocale: pathWithoutLocale === '' ? '/' : pathWithoutLocale,
    hasRefreshCookie,
    meta,
    activeRoleCookie,
    search,
  });

  if (decision.redirectPath) {
    const url = req.nextUrl.clone();
    const [targetPathname, targetQuery] = decision.redirectPath.split('?');
    url.pathname = targetPathname;
    url.search = targetQuery ? `?${targetQuery}` : '';
    const res = NextResponse.redirect(url);
    if (decision.clearCookies) {
      for (const name of Object.values(AUTH_COOKIES)) {
        res.cookies.delete(name);
      }
    }
    return res;
  }

  return handleI18nRouting(req);
}

export const config = {
  // Match all pathnames except for `/api`, `/trpc`, `/_next`, `/_vercel`, or files with a dot
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
