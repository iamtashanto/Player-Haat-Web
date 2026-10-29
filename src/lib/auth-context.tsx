'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  apiRequest,
  clearAccessToken,
  destroyWebSession,
  establishWebSession,
  getCsrfTokenFromCookie,
  onSessionExpired,
  readBrowserCookie,
  silentRefreshAccessToken,
  syncSessionMetaCookie,
  type EstablishSessionResult,
} from './api-client';
import { AUTH_COOKIES, type AppRole, type AuthUser, type Me } from './auth-types';
import { ApiException } from './errors';
import { normalizeBdPhone, type SignupRole } from './auth-schemas';

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'admin_rejected';

export interface AuthContextValue {
  status: AuthStatus;
  me: Me | null;
  authUser: AuthUser | null;
  signupRole: SignupRole;
  setSignupRole: (role: SignupRole) => void;
  activeRole: AppRole;
  hasBothRoles: boolean;
  switchActiveRole: (role: AppRole) => Promise<void>;
  enableOtherRole: (role: AppRole) => Promise<void>;
  adminBlockedMessage: boolean;
  clearAdminBlocked: () => void;
  // Auth actions
  signInWithEmail: (params: {
    email: string;
    password: string;
    locale?: string;
  }) => Promise<Me>;
  registerWithEmail: (params: {
    name: string;
    email: string;
    password: string;
    role?: SignupRole;
    locale?: string;
  }) => Promise<Me>;
  requestPhoneOtp: (phone: string, locale?: string) => Promise<void>;
  verifyPhoneOtp: (params: {
    phone: string;
    code: string;
    name?: string;
    role?: SignupRole;
    locale?: string;
  }) => Promise<{ me: Me; isNewUser: boolean }>;
  signInWithGoogle: (idToken: string, role?: SignupRole, locale?: string) => Promise<Me>;
  signInWithApple: (params: {
    identityToken: string;
    nonce?: string;
    name?: string;
    role?: SignupRole;
    locale?: string;
  }) => Promise<Me>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (params: {
    email: string;
    code: string;
    newPassword: string;
  }) => Promise<void>;
  refreshMe: () => Promise<Me | null>;
  logout: () => Promise<void>;
  getPostAuthRedirect: (meObj?: Me | null, nextParam?: string | null) => string;
}

const CACHED_ME_KEY = 'ph_cached_me_v1';
const DUAL_ROLE_ENABLED_KEY = 'ph_dual_role_enabled';
const SIGNUP_ROLE_KEY = 'ph_signup_role';

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function AuthProvider({
  children,
  onRoleSync,
  onDualRoleSync,
}: {
  children: React.ReactNode;
  onRoleSync?: (role: AppRole) => void;
  onDualRoleSync?: (enabled: boolean) => void;
}) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [signupRole, setSignupRoleState] = useState<SignupRole>('PLAYER');
  const [activeRole, setActiveRoleState] = useState<AppRole>('PLAYER');
  const [dualRoleUnlocked, setDualRoleUnlocked] = useState<boolean>(false);
  const [adminBlockedMessage, setAdminBlockedMessage] = useState(false);

  const setSignupRole = useCallback((role: SignupRole) => {
    setSignupRoleState(role);
    try {
      sessionStorage.setItem(SIGNUP_ROLE_KEY, role);
    } catch {
      // ignore
    }
  }, []);

  const hasBothRoles = Boolean(
    dualRoleUnlocked ||
      (me && me.hasPlayerProfile && me.hasRecruiterProfile),
  );

  useEffect(() => {
    onDualRoleSync?.(hasBothRoles || status === 'unauthenticated');
  }, [hasBothRoles, status, onDualRoleSync]);

  const applySignedInMe = useCallback(
    async (profile: Me, preferredRole?: AppRole) => {
      if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
        await destroyWebSession();
        setMe(null);
        setAuthUser(null);
        setAdminBlockedMessage(true);
        setStatus('admin_rejected');
        throw new ApiException({
          code: 'AUTH_ADMIN_DASHBOARD_ONLY',
          status: 403,
        });
      }

      setMe(profile);
      setStatus('authenticated');
      setAdminBlockedMessage(false);

      const savedCookieRole = readBrowserCookie(AUTH_COOKIES.ACTIVE_ROLE);
      const resolvedActiveRole: AppRole =
        preferredRole ??
        (savedCookieRole === 'RECRUITER' || savedCookieRole === 'PLAYER'
          ? savedCookieRole
          : profile.role === 'RECRUITER'
            ? 'RECRUITER'
            : 'PLAYER');

      setActiveRoleState(resolvedActiveRole);
      onRoleSync?.(resolvedActiveRole);

      try {
        localStorage.setItem(CACHED_ME_KEY, JSON.stringify(profile));
        if (profile.hasPlayerProfile && profile.hasRecruiterProfile) {
          localStorage.setItem(DUAL_ROLE_ENABLED_KEY, 'true');
          setDualRoleUnlocked(true);
        }
      } catch {
        // ignore
      }

      await syncSessionMetaCookie({
        userId: profile.id,
        role: profile.role === 'RECRUITER' ? 'RECRUITER' : 'PLAYER',
        activeRole: resolvedActiveRole,
        hasPlayerProfile: profile.hasPlayerProfile,
        hasRecruiterProfile: profile.hasRecruiterProfile,
      });
    },
    [onRoleSync],
  );

  // Restore session on mount using silent refresh if `ph_csrf_token` cookie exists
  useEffect(() => {
    let mounted = true;

    try {
      const savedSignup = sessionStorage.getItem(SIGNUP_ROLE_KEY);
      if (savedSignup === 'PLAYER' || savedSignup === 'RECRUITER') {
        setSignupRoleState(savedSignup);
      }
      const savedDual = localStorage.getItem(DUAL_ROLE_ENABLED_KEY);
      if (savedDual === 'true') {
        setDualRoleUnlocked(true);
      }
    } catch {
      // ignore
    }

    const restore = async () => {
      const csrf = getCsrfTokenFromCookie();
      if (!csrf) {
        if (mounted) setStatus('unauthenticated');
        return;
      }

      const token = await silentRefreshAccessToken();
      if (!token) {
        if (mounted) setStatus('unauthenticated');
        return;
      }

      try {
        const profile = await apiRequest<Me>('/users/me', { method: 'GET' });
        if (mounted && profile) {
          await applySignedInMe(profile);
        }
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiException && (err.isNetwork || err.isServerError)) {
          try {
            const raw = localStorage.getItem(CACHED_ME_KEY);
            if (raw) {
              const cached = JSON.parse(raw) as Me;
              await applySignedInMe(cached);
              return;
            }
          } catch {
            // ignore
          }
        }
        setStatus('unauthenticated');
      }
    };

    void restore();

    const unsub = onSessionExpired(() => {
      if (!mounted) return;
      clearAccessToken();
      setMe(null);
      setAuthUser(null);
      setStatus('unauthenticated');
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [applySignedInMe]);

  const completeSessionEstablish = useCallback(
    async (res: EstablishSessionResult): Promise<Me> => {
      if (res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN') {
        await destroyWebSession();
        setAdminBlockedMessage(true);
        setStatus('admin_rejected');
        throw new ApiException({
          code: 'AUTH_ADMIN_DASHBOARD_ONLY',
          status: 403,
        });
      }

      setAuthUser(res.user);

      // Fetch full `/users/me` profile (or synthesize fallback if backend `/users/me` is unreachable in offline dev)
      let profile: Me;
      try {
        profile = await apiRequest<Me>('/users/me', {
          method: 'GET',
          locale: res.user.locale,
        });
      } catch {
        profile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          emailVerified: res.user.emailVerified,
          phone: res.user.phone,
          phoneVerified: Boolean(res.user.phone),
          avatarUrl: res.user.avatarUrl,
          locale: res.user.locale,
          role: res.user.role,
          birthYear: null,
          hasPlayerProfile: false,
          hasRecruiterProfile: false,
          onboardingStep:
            res.user.role === 'RECRUITER'
              ? 'RECRUITER_PROFILE'
              : 'PLAYER_PROFILE',
          captainRating: { average: 0, count: 0 },
          createdAt: new Date().toISOString(),
        };
      }

      const targetRole: AppRole =
        profile.role === 'RECRUITER' ? 'RECRUITER' : 'PLAYER';
      await applySignedInMe(profile, targetRole);
      return profile;
    },
    [applySignedInMe],
  );

  const signInWithEmail = useCallback(
    async ({
      email,
      password,
      locale = 'bn',
    }: {
      email: string;
      password: string;
      locale?: string;
    }): Promise<Me> => {
      try {
        const res = await establishWebSession(
          'login',
          { email: email.trim().toLowerCase(), password },
          locale,
        );
        return await completeSessionEstablish(res);
      } catch (err) {
        if (
          err instanceof ApiException &&
          err.code === 'AUTH_ADMIN_DASHBOARD_ONLY'
        ) {
          setAdminBlockedMessage(true);
          setStatus('admin_rejected');
        }
        throw err;
      }
    },
    [completeSessionEstablish],
  );

  const registerWithEmail = useCallback(
    async ({
      name,
      email,
      password,
      role,
      locale = 'bn',
    }: {
      name: string;
      email: string;
      password: string;
      role?: SignupRole;
      locale?: string;
    }): Promise<Me> => {
      const chosenRole = role ?? signupRole;
      const res = await establishWebSession(
        'register',
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: chosenRole,
          locale: locale === 'en' ? 'en' : 'bn',
        },
        locale,
      );
      return await completeSessionEstablish(res);
    },
    [signupRole, completeSessionEstablish],
  );

  const requestPhoneOtp = useCallback(
    async (phone: string, locale = 'bn'): Promise<void> => {
      const normalized = normalizeBdPhone(phone) ?? phone.trim();
      await apiRequest('/auth/phone/request', {
        method: 'POST',
        auth: false,
        locale,
        body: { phone: normalized },
      });
    },
    [],
  );

  const verifyPhoneOtp = useCallback(
    async ({
      phone,
      code,
      name,
      role,
      locale = 'bn',
    }: {
      phone: string;
      code: string;
      name?: string;
      role?: SignupRole;
      locale?: string;
    }): Promise<{ me: Me; isNewUser: boolean }> => {
      const normalized = normalizeBdPhone(phone) ?? phone.trim();
      const chosenRole = role ?? signupRole;
      try {
        const res = await establishWebSession(
          'phone_verify',
          {
            phone: normalized,
            code: code.trim(),
            role: chosenRole,
            ...(name?.trim() ? { name: name.trim() } : {}),
          },
          locale,
        );
        const profile = await completeSessionEstablish(res);
        return { me: profile, isNewUser: res.isNewUser };
      } catch (err) {
        if (
          err instanceof ApiException &&
          err.code === 'AUTH_ADMIN_DASHBOARD_ONLY'
        ) {
          setAdminBlockedMessage(true);
          setStatus('admin_rejected');
        }
        throw err;
      }
    },
    [signupRole, completeSessionEstablish],
  );

  const signInWithGoogle = useCallback(
    async (
      idToken: string,
      role?: SignupRole,
      locale = 'bn',
    ): Promise<Me> => {
      try {
        const res = await establishWebSession(
          'google',
          {
            idToken,
            role: role ?? signupRole,
          },
          locale,
        );
        return await completeSessionEstablish(res);
      } catch (err) {
        if (
          err instanceof ApiException &&
          err.code === 'AUTH_ADMIN_DASHBOARD_ONLY'
        ) {
          setAdminBlockedMessage(true);
          setStatus('admin_rejected');
        }
        throw err;
      }
    },
    [signupRole, completeSessionEstablish],
  );

  const signInWithApple = useCallback(
    async ({
      identityToken,
      nonce,
      name,
      role,
      locale = 'bn',
    }: {
      identityToken: string;
      nonce?: string;
      name?: string;
      role?: SignupRole;
      locale?: string;
    }): Promise<Me> => {
      try {
        const res = await establishWebSession(
          'apple',
          {
            identityToken,
            role: role ?? signupRole,
            ...(nonce ? { nonce } : {}),
            ...(name ? { name } : {}),
          },
          locale,
        );
        return await completeSessionEstablish(res);
      } catch (err) {
        if (
          err instanceof ApiException &&
          err.code === 'AUTH_ADMIN_DASHBOARD_ONLY'
        ) {
          setAdminBlockedMessage(true);
          setStatus('admin_rejected');
        }
        throw err;
      }
    },
    [signupRole, completeSessionEstablish],
  );

  const verifyEmailCode = useCallback(
    async (email: string, code: string): Promise<void> => {
      await apiRequest('/auth/verify-email', {
        method: 'POST',
        auth: false,
        body: { email: email.trim().toLowerCase(), code: code.trim() },
      });
      if (status === 'authenticated') {
        try {
          const updated = await apiRequest<Me>('/users/me', { method: 'GET' });
          await applySignedInMe(updated, activeRole);
        } catch {
          // ignore
        }
      }
    },
    [status, applySignedInMe, activeRole],
  );

  const resendVerificationEmail = useCallback(async (): Promise<void> => {
    await apiRequest('/auth/resend-verification', {
      method: 'POST',
      auth: true,
    });
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    await apiRequest('/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email: email.trim().toLowerCase() },
    });
  }, []);

  const resetPassword = useCallback(
    async ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }): Promise<void> => {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        auth: false,
        body: {
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        },
      });
    },
    [],
  );

  const refreshMe = useCallback(async (): Promise<Me | null> => {
    try {
      const updated = await apiRequest<Me>('/users/me', { method: 'GET' });
      await applySignedInMe(updated, activeRole);
      return updated;
    } catch {
      return me;
    }
  }, [applySignedInMe, activeRole, me]);

  const switchActiveRole = useCallback(
    async (role: AppRole): Promise<void> => {
      setActiveRoleState(role);
      onRoleSync?.(role);
      await syncSessionMetaCookie({
        userId: me?.id,
        role: me?.role === 'RECRUITER' ? 'RECRUITER' : 'PLAYER',
        activeRole: role,
        hasPlayerProfile: me?.hasPlayerProfile,
        hasRecruiterProfile: me?.hasRecruiterProfile,
      });
    },
    [me, onRoleSync],
  );

  const enableOtherRole = useCallback(
    async (role: AppRole): Promise<void> => {
      setDualRoleUnlocked(true);
      try {
        localStorage.setItem(DUAL_ROLE_ENABLED_KEY, 'true');
      } catch {
        // ignore
      }
      await switchActiveRole(role);
    },
    [switchActiveRole],
  );

  const logout = useCallback(async (): Promise<void> => {
    await destroyWebSession();
    setMe(null);
    setAuthUser(null);
    setStatus('unauthenticated');
    try {
      localStorage.removeItem(CACHED_ME_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getPostAuthRedirect = useCallback(
    (meObj?: Me | null, nextParam?: string | null): string => {
      const target = meObj ?? me;
      if (
        nextParam &&
        nextParam.startsWith('/') &&
        !nextParam.startsWith('//') &&
        !nextParam.startsWith('/auth')
      ) {
        return nextParam;
      }
      if (!target) {
        return activeRole === 'RECRUITER' ? '/recruiter' : '/player';
      }
      if (target.role === 'RECRUITER') {
        return target.hasRecruiterProfile
          ? '/recruiter'
          : '/recruiter/onboarding';
      }
      return target.hasPlayerProfile ? '/player' : '/player/onboarding';
    },
    [me, activeRole],
  );

  return (
    <AuthContext.Provider
      value={{
        status,
        me,
        authUser,
        signupRole,
        setSignupRole,
        activeRole,
        hasBothRoles,
        switchActiveRole,
        enableOtherRole,
        adminBlockedMessage,
        clearAdminBlocked: () => setAdminBlockedMessage(false),
        signInWithEmail,
        registerWithEmail,
        requestPhoneOtp,
        verifyPhoneOtp,
        signInWithGoogle,
        signInWithApple,
        verifyEmailCode,
        resendVerificationEmail,
        forgotPassword,
        resetPassword,
        refreshMe,
        logout,
        getPostAuthRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

