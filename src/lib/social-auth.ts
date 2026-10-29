import { ApiException } from './errors';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; error?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getDismissedReason?: () => string;
            }) => void,
          ) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          nonce?: string;
          usePopup?: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization?: {
            id_token?: string;
            code?: string;
            state?: string;
          };
          user?: {
            name?: {
              firstName?: string;
              lastName?: string;
            };
            email?: string;
          };
        }>;
      };
    };
  }
}

export class SocialCancelledError extends Error {
  constructor() {
    super('SOCIAL_CANCELLED');
    this.name = 'SocialCancelledError';
  }
}

function loadScriptOnce(src: string, id: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('No document available'));
  }
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function generateNonce(length = 32): string {
  const chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

async function sha256Hex(raw: string): Promise<string> {
  const encoded = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isGoogleWebConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}

export function isAppleWebConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_APPLE_CLIENT_ID);
}

/**
 * Triggers Google Identity Services (`https://accounts.google.com/gsi/client`)
 * and resolves with `{ idToken }` to send to `POST /api/v1/auth/google`.
 */
export async function triggerGoogleWebSignIn(): Promise<{ idToken: string }> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiException({
      code: 'AUTH_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }

  try {
    await loadScriptOnce(
      'https://accounts.google.com/gsi/client',
      'ph-google-gsi-script',
    );
  } catch {
    throw new ApiException({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  }

  if (!window.google?.accounts?.id) {
    throw new ApiException({
      code: 'AUTH_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }

  return new Promise<{ idToken: string }>((resolve, reject) => {
    let settled = false;

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return;
        settled = true;
        if (response.credential) {
          resolve({ idToken: response.credential });
        } else {
          reject(
            new ApiException({
              code: 'AUTH_INVALID_SOCIAL_TOKEN',
              status: 401,
            }),
          );
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google!.accounts.id.prompt((notification) => {
      if (settled) return;
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        settled = true;
        reject(
          new ApiException({
            code: 'AUTH_PROVIDER_NOT_CONFIGURED',
            status: 503,
          }),
        );
      } else if (notification.isDismissedMoment()) {
        const reason = notification.getDismissedReason?.();
        if (reason !== 'credential_returned') {
          settled = true;
          reject(new SocialCancelledError());
        }
      }
    });
  });
}

/**
 * Triggers Sign in with Apple JS (`appleid.auth.js`) with SHA-256 nonce
 * and resolves with `{ identityToken, rawNonce, name }` to send to `POST /api/v1/auth/apple`.
 */
export async function triggerAppleWebSignIn(): Promise<{
  identityToken: string;
  rawNonce: string;
  name?: string;
}> {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiException({
      code: 'AUTH_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }

  try {
    await loadScriptOnce(
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
      'ph-apple-auth-script',
    );
  } catch {
    throw new ApiException({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  }

  if (!window.AppleID?.auth) {
    throw new ApiException({
      code: 'AUTH_PROVIDER_NOT_CONFIGURED',
      status: 503,
    });
  }

  const rawNonce = generateNonce(32);
  const hashedNonce = await sha256Hex(rawNonce);

  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI:
      process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || window.location.origin,
    nonce: hashedNonce,
    usePopup: true,
  });

  try {
    const res = await window.AppleID.auth.signIn();
    const identityToken = res?.authorization?.id_token;
    if (!identityToken) {
      throw new ApiException({
        code: 'AUTH_INVALID_SOCIAL_TOKEN',
        status: 401,
      });
    }
    const fullName = [res?.user?.name?.firstName, res?.user?.name?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      identityToken,
      rawNonce,
      ...(fullName ? { name: fullName } : {}),
    };
  } catch (err) {
    if (err instanceof ApiException) throw err;
    const maybeErr = err as { error?: string } | undefined;
    if (
      maybeErr?.error === 'popup_closed_by_user' ||
      maybeErr?.error === 'user_cancelled_authorize'
    ) {
      throw new SocialCancelledError();
    }
    throw new ApiException({
      code: 'AUTH_INVALID_SOCIAL_TOKEN',
      status: 401,
    });
  }
}

