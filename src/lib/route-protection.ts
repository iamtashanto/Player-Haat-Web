import type { AppLocale } from '@/i18n/routing';
import type { AppRole, SessionMetaCookie } from './auth-types';

/** First path segments of the signed-in app (the `(app)` route group). Everything else is public or auth. */
export const APP_SEGMENTS = [
  'home', 'players', 'games', 'alerts', 'me', 'settings', 'shortlist', 'profile', 'setup', 'invites', 'wallet',
  'messages', 'chat', 'teams', 'team', 'verify', 'request', 'rate', 'player', 'recruiter',
] as const;

export function isAppPath(pathWithoutLocale: string): boolean {
  const seg = pathWithoutLocale.split('/').filter(Boolean)[0];
  return (APP_SEGMENTS as readonly string[]).includes(seg ?? '');
}

/**
 * Pure RBAC route protection decision engine used by `src/middleware.ts`.
 * 1. `ADMIN` / `SUPER_ADMIN` accounts are refused (`admin_dashboard_only`).
 * 2. Signed-out visitors on app routes go to `/auth?next=...`.
 * 3. Signed-in users on `/auth` (except `/auth/verify-email`) go to `/home`, or to the setup they still owe
 *    (recruiters can't skip theirs). The API stays the real authority on what each role may do.
 */
export function resolveRouteProtection(params: {
  locale: AppLocale;
  pathWithoutLocale: string;
  hasRefreshCookie: boolean;
  meta: SessionMetaCookie | null;
  activeRoleCookie?: string | null;
  search?: string;
}): { redirectPath?: string; clearCookies?: boolean } {
  const { locale, pathWithoutLocale, hasRefreshCookie, meta, activeRoleCookie, search = '' } = params;

  const isAuthRoute = pathWithoutLocale === '/auth' || pathWithoutLocale.startsWith('/auth/');
  const isVerifyEmailRoute = pathWithoutLocale === '/auth/verify-email';
  const isAuthenticated = Boolean(hasRefreshCookie && meta);

  if (meta && (meta.role === 'ADMIN' || meta.role === 'SUPER_ADMIN')) {
    return { redirectPath: `/${locale}/auth?error=admin_dashboard_only`, clearCookies: true };
  }

  if (!isAuthenticated && isAppPath(pathWithoutLocale)) {
    const nextTarget = encodeURIComponent(`${pathWithoutLocale}${search}`);
    return { redirectPath: `/${locale}/auth?next=${nextTarget}` };
  }

  if (isAuthenticated && meta && isAuthRoute && !isVerifyEmailRoute) {
    const effectiveRole: AppRole =
      activeRoleCookie === 'RECRUITER' || activeRoleCookie === 'PLAYER' ? activeRoleCookie : meta.activeRole;
    if (effectiveRole === 'RECRUITER' && meta.hasRecruiterProfile === false) {
      return { redirectPath: `/${locale}/setup/recruiter` };
    }
    if (effectiveRole === 'PLAYER' && meta.hasPlayerProfile === false) {
      return { redirectPath: `/${locale}/setup` };
    }
    return { redirectPath: `/${locale}/home` };
  }

  return {};
}
