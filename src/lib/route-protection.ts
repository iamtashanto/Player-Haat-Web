import type { AppLocale } from '@/i18n/routing';
import type { AppRole, SessionMetaCookie } from './auth-types';

/**
 * Pure RBAC route protection decision engine used by `src/middleware.ts`.
 * Enforces:
 * 1. `ADMIN` / `SUPER_ADMIN` rejection (`AUTH_ADMIN_DASHBOARD_ONLY`)
 * 2. Unauthenticated visitor redirection from `/player/*` and `/recruiter/*` to `/[locale]/auth?next=...`
 * 3. Recruiter cannot edit player-owned data (`/player/profiles/edit`, `/player/onboarding`, `/player/profile/edit`)
 * 4. Signed-in user redirection away from `/auth` (except `/auth/verify-email`) to their active role area or onboarding
 */
export function resolveRouteProtection(params: {
  locale: AppLocale;
  pathWithoutLocale: string;
  hasRefreshCookie: boolean;
  meta: SessionMetaCookie | null;
  activeRoleCookie?: string | null;
  search?: string;
}): { redirectPath?: string; clearCookies?: boolean } {
  const {
    locale,
    pathWithoutLocale,
    hasRefreshCookie,
    meta,
    activeRoleCookie,
    search = '',
  } = params;

  const isPlayerRoute =
    pathWithoutLocale === '/player' || pathWithoutLocale.startsWith('/player/');
  const isRecruiterRoute =
    pathWithoutLocale === '/recruiter' ||
    pathWithoutLocale.startsWith('/recruiter/');
  const isAuthRoute =
    pathWithoutLocale === '/auth' || pathWithoutLocale.startsWith('/auth/');
  const isVerifyEmailRoute = pathWithoutLocale === '/auth/verify-email';

  const isAuthenticated = Boolean(hasRefreshCookie && meta);

  // 1. Reject ADMIN / SUPER_ADMIN accounts immediately from this website
  if (meta && (meta.role === 'ADMIN' || meta.role === 'SUPER_ADMIN')) {
    return {
      redirectPath: `/${locale}/auth?error=admin_dashboard_only`,
      clearCookies: true,
    };
  }

  // 2. Protect Player and Recruiter areas when unauthenticated
  if (!isAuthenticated && (isPlayerRoute || isRecruiterRoute)) {
    const nextTarget = encodeURIComponent(`${pathWithoutLocale}${search}`);
    return {
      redirectPath: `/${locale}/auth?next=${nextTarget}`,
    };
  }

  // 3. Enforce Recruiter cannot edit player-owned data
  if (isAuthenticated && meta) {
    const effectiveRole: AppRole =
      activeRoleCookie === 'RECRUITER' || activeRoleCookie === 'PLAYER'
        ? activeRoleCookie
        : meta.activeRole;

    const isPlayerEditRoute =
      pathWithoutLocale.startsWith('/player/profiles/edit') ||
      pathWithoutLocale.startsWith('/player/onboarding') ||
      pathWithoutLocale.startsWith('/player/profile/edit');

    if (
      isPlayerEditRoute &&
      effectiveRole === 'RECRUITER' &&
      meta.role === 'RECRUITER' &&
      !meta.hasPlayerProfile
    ) {
      return {
        redirectPath: `/${locale}/recruiter`,
      };
    }

    // 4. Redirect already-signed-in users away from `/auth` (except `/auth/verify-email`)
    if (isAuthRoute && !isVerifyEmailRoute) {
      if (effectiveRole === 'RECRUITER') {
        const dest =
          meta.hasRecruiterProfile === false
            ? `/${locale}/recruiter/onboarding`
            : `/${locale}/recruiter`;
        return { redirectPath: dest };
      }
      const dest =
        meta.hasPlayerProfile === false
          ? `/${locale}/player/onboarding`
          : `/${locale}/player`;
      return { redirectPath: dest };
    }
  }

  return {};
}

