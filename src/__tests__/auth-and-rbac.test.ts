import { describe, expect, it } from 'vitest';
import {
  emailSignInSchema,
  emailSignUpSchema,
  formatBdPhoneDisplay,
  looksLikeBdMobile,
  looksLikeEmail,
  nationalDigits,
  normalizeBdPhone,
  passwordProblemKey,
} from '../lib/auth-schemas';
import {
  generateCsrfToken,
  isAdminRole,
  parseSessionMeta,
  serializeSessionMeta,
} from '../lib/auth-cookies';
import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenExpiringSoon,
  setAccessToken,
} from '../lib/api-client';
import { resolveRouteProtection } from '../lib/route-protection';

describe('Bangladesh phone normalization & validation', () => {
  it('extracts 11-digit national numbers from various inputs', () => {
    expect(nationalDigits('01712345678')).toBe('01712345678');
    expect(nationalDigits('+8801712345678')).toBe('01712345678');
    expect(nationalDigits('880 1812-345678')).toBe('01812345678');
    expect(nationalDigits('1912345678')).toBe('01912345678');
  });

  it('validates BD operator prefixes (013-019) and normalizes to E.164', () => {
    expect(looksLikeBdMobile('01712345678')).toBe(true);
    expect(looksLikeBdMobile('01312345678')).toBe(true);
    expect(looksLikeBdMobile('01112345678')).toBe(false);
    expect(looksLikeBdMobile('0171234567')).toBe(false);

    expect(normalizeBdPhone('01712-345678')).toBe('+8801712345678');
    expect(normalizeBdPhone('+880 1612 345678')).toBe('+8801612345678');
    expect(normalizeBdPhone('invalid')).toBeNull();
    expect(formatBdPhoneDisplay('01712345678')).toBe('+880 1712345678');
  });
});

describe('Auth schemas & password rules', () => {
  it('enforces password length and letter+number mix', () => {
    expect(passwordProblemKey('short1')).toBe('passwordTooShort');
    expect(passwordProblemKey('onlyletters')).toBe('passwordNeedsMix');
    expect(passwordProblemKey('123456789')).toBe('passwordNeedsMix');
    expect(passwordProblemKey('ValidPass1')).toBeNull();
  });

  it('validates email sign-up and sign-in schemas', () => {
    expect(looksLikeEmail('player@playerhaat.com')).toBe(true);
    expect(looksLikeEmail('bad-email')).toBe(false);

    const validSignUp = emailSignUpSchema.safeParse({
      name: 'Sohel Rana',
      email: 'Sohel@Example.com',
      password: 'Password123',
      role: 'PLAYER',
    });
    expect(validSignUp.success).toBe(true);
    if (validSignUp.success) {
      expect(validSignUp.data.email).toBe('sohel@example.com');
    }

    const invalidSignIn = emailSignInSchema.safeParse({
      email: 'sohel@example.com',
      password: '',
    });
    expect(invalidSignIn.success).toBe(false);
  });
});

describe('Session metadata, CSRF & in-memory token store', () => {
  it('serializes and parses SessionMetaCookie round-trip', () => {
    const meta = {
      userId: 'usr_123',
      role: 'RECRUITER' as const,
      activeRole: 'RECRUITER' as const,
      hasPlayerProfile: false,
      hasRecruiterProfile: true,
    };
    const encoded = serializeSessionMeta(meta);
    expect(parseSessionMeta(encoded)).toEqual(meta);
    expect(parseSessionMeta('corrupted-base64')).toBeNull();
  });

  it('identifies ADMIN and SUPER_ADMIN roles as blocked from website', () => {
    expect(isAdminRole('ADMIN')).toBe(true);
    expect(isAdminRole('SUPER_ADMIN')).toBe(true);
    expect(isAdminRole('PLAYER')).toBe(false);
    expect(isAdminRole('RECRUITER')).toBe(false);
  });

  it('manages accessToken strictly in memory with expiry window', () => {
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
    expect(isAccessTokenExpiringSoon()).toBe(true);

    setAccessToken('jwt-access-token', 900);
    expect(getAccessToken()).toBe('jwt-access-token');
    expect(isAccessTokenExpiringSoon()).toBe(false);

    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('generates 48-hex-character cryptographic CSRF tokens', () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    expect(t1).toHaveLength(48);
    expect(t1).not.toBe(t2);
  });
});

describe('Middleware RBAC route protection (resolveRouteProtection)', () => {
  it('redirects unauthenticated visitors from /player and /recruiter to /auth?next=...', () => {
    const res1 = resolveRouteProtection({
      locale: 'bn',
      pathWithoutLocale: '/player',
      hasRefreshCookie: false,
      meta: null,
    });
    expect(res1.redirectPath).toBe('/bn/auth?next=%2Fplayer');

    const res2 = resolveRouteProtection({
      locale: 'en',
      pathWithoutLocale: '/recruiter/requests',
      hasRefreshCookie: false,
      meta: null,
    });
    expect(res2.redirectPath).toBe('/en/auth?next=%2Frecruiter%2Frequests');
  });

  it('blocks ADMIN / SUPER_ADMIN tokens and clears cookies', () => {
    const res = resolveRouteProtection({
      locale: 'en',
      pathWithoutLocale: '/player',
      hasRefreshCookie: true,
      meta: {
        userId: 'adm_1',
        role: 'ADMIN',
        activeRole: 'PLAYER',
      },
    });
    expect(res.redirectPath).toBe('/en/auth?error=admin_dashboard_only');
    expect(res.clearCookies).toBe(true);
  });

  it('redirects signed-in users away from /auth (except /auth/verify-email)', () => {
    const meta = {
      userId: 'usr_1',
      role: 'PLAYER' as const,
      activeRole: 'PLAYER' as const,
      hasPlayerProfile: true,
    };
    const fromAuth = resolveRouteProtection({
      locale: 'bn',
      pathWithoutLocale: '/auth/email',
      hasRefreshCookie: true,
      meta,
    });
    expect(fromAuth.redirectPath).toBe('/bn/player');

    const onVerifyEmail = resolveRouteProtection({
      locale: 'bn',
      pathWithoutLocale: '/auth/verify-email',
      hasRefreshCookie: true,
      meta,
    });
    expect(onVerifyEmail.redirectPath).toBeUndefined();
  });

  it('blocks recruiters without a player profile from player edit routes', () => {
    const res = resolveRouteProtection({
      locale: 'en',
      pathWithoutLocale: '/player/profiles/edit',
      hasRefreshCookie: true,
      meta: {
        userId: 'rec_1',
        role: 'RECRUITER',
        activeRole: 'RECRUITER',
        hasPlayerProfile: false,
        hasRecruiterProfile: true,
      },
    });
    expect(res.redirectPath).toBe('/en/recruiter');
  });
});
