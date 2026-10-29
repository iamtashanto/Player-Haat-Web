export type AccountRole = 'PLAYER' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN';
export type AppRole = 'PLAYER' | 'RECRUITER';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  avatarUrl: string | null;
  locale: 'bn' | 'en';
  role: AccountRole;
  hasPassword: boolean;
  loginMethods: Array<'EMAIL' | 'PHONE' | 'GOOGLE' | 'APPLE'>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresAt: string;
}

export interface Me {
  id: string;
  name: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  avatarUrl: string | null;
  locale: 'bn' | 'en';
  role: AccountRole;
  birthYear: number | null;
  hasPlayerProfile: boolean;
  hasRecruiterProfile: boolean;
  onboardingStep: 'PLAYER_PROFILE' | 'RECRUITER_PROFILE' | null;
  captainRating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface SessionMetaCookie {
  userId: string;
  role: AccountRole;
  activeRole: AppRole;
  hasPlayerProfile?: boolean;
  hasRecruiterProfile?: boolean;
}

// Cookie names used by Next.js BFF Route Handlers and `src/middleware.ts`
export const AUTH_COOKIES = {
  /** Strictly httpOnly, Secure (in prod), SameSite=Lax refresh token */
  REFRESH_TOKEN: 'ph_refresh_token',
  /** Readable SameSite=Lax CSRF token verified via `x-csrf-token` header */
  CSRF_TOKEN: 'ph_csrf_token',
  /** Lightweight metadata cookie for `middleware.ts` route protection */
  SESSION_META: 'ph_session_meta',
  /** Active role cookie (`PLAYER` | `RECRUITER`) for dual-role switch */
  ACTIVE_ROLE: 'ph_active_role',
} as const;

