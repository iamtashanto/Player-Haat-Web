'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import {
  GlassContainer,
  PhButton,
  PhIllustration,
  PhPage,
  PhRadius,
  PitchBackdrop,
  showPhToast,
} from '@/design-system';
import {
  AccountTypePicker,
  AdminBlockedBanner,
  AppleMark,
  GoogleMark,
  LanguageChip,
  PhLogo,
  SocialAuthButton,
  TermsLine,
} from '@/components/auth/auth-widgets';
import { ThemeToggleButton } from '@/components/shells/header-controls';
import { useAuth } from '@/lib/auth-context';
import { getErrorMessageKey } from '@/lib/errors';
import {
  SocialCancelledError,
  triggerAppleWebSignIn,
  triggerGoogleWebSignIn,
} from '@/lib/social-auth';

export default function AuthLandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const queryError = searchParams.get('error');

  const {
    signupRole,
    signInWithGoogle,
    signInWithApple,
    adminBlockedMessage,
    clearAdminBlocked,
    getPostAuthRedirect,
  } = useAuth();

  const [busyProvider, setBusyProvider] = useState<'google' | 'apple' | null>(
    null,
  );

  const showAdminBanner =
    adminBlockedMessage || queryError === 'admin_dashboard_only';

  const handleSocial = async (provider: 'google' | 'apple') => {
    setBusyProvider(provider);
    try {
      if (provider === 'google') {
        const { idToken } = await triggerGoogleWebSignIn();
        const me = await signInWithGoogle(idToken, signupRole, locale);
        router.push(getPostAuthRedirect(me, nextParam));
      } else {
        const appleCred = await triggerAppleWebSignIn();
        const me = await signInWithApple({
          identityToken: appleCred.identityToken,
          nonce: appleCred.rawNonce,
          name: appleCred.name,
          role: signupRole,
          locale,
        });
        router.push(getPostAuthRedirect(me, nextParam));
      }
    } catch (err) {
      if (err instanceof SocialCancelledError) {
        return;
      }
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusyProvider(null);
    }
  };

  const phoneHref = nextParam
    ? `/auth/phone?next=${encodeURIComponent(nextParam)}`
    : '/auth/phone';
  const emailHref = nextParam
    ? `/auth/email?next=${encodeURIComponent(nextParam)}`
    : '/auth/email';

  const authActionsBlock = (
    <div className="flex flex-col">
      {showAdminBanner && (
        <AdminBlockedBanner onDismiss={clearAdminBlocked} />
      )}

      <div className="tx-overline">{t('accountTypeTitle')}</div>
      <div className="mt-2">
        <AccountTypePicker showDescription />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <PhButton
          label={t('continueWithPhone')}
          icon={<Phone className="h-5 w-5" />}
          disabled={busyProvider !== null}
          onPressed={() => router.push(phoneHref)}
        />

        <SocialAuthButton
          label={t('continueWithGoogle')}
          leading={<GoogleMark size={20} />}
          loading={busyProvider === 'google'}
          disabled={busyProvider !== null}
          onPressed={() => handleSocial('google')}
        />

        <SocialAuthButton
          label={t('continueWithApple')}
          leading={<AppleMark size={20} />}
          loading={busyProvider === 'apple'}
          disabled={busyProvider !== null}
          onPressed={() => handleSocial('apple')}
        />
      </div>

      <div className="mt-2 flex justify-center">
        <PhButton
          label={t('useEmail')}
          variant="ghost"
          size="medium"
          expand={false}
          disabled={busyProvider !== null}
          onPressed={() => router.push(emailHref)}
        />
      </div>

      <div className="mt-3">
        <TermsLine />
      </div>
    </div>
  );

  return (
    <PhPage className="relative min-h-dvh overflow-hidden">
      <PitchBackdrop
        opacity={0.09}
        className="pointer-events-none fixed inset-0"
      />

      {/* Mobile View (<768px) — 1:1 with `AuthLandingScreen` in `auth_landing_screen.dart` */}
      <div className="relative z-10 flex min-h-dvh flex-col justify-between px-5 py-3 md:hidden">
        <div className="flex items-center justify-end gap-1.5 pt-1">
          <LanguageChip />
          <ThemeToggleButton />
        </div>

        <div className="my-auto py-8">
          <PhLogo size={72} />
          <h1 className="mt-6 tx-large-title">{t('authHeadline')}</h1>
          <p className="mt-3 tx-body text-[var(--ph-text-secondary)]">
            {t('authSubhead')}
          </p>
        </div>

        <div className="pb-3">{authActionsBlock}</div>
      </div>

      {/* Desktop View (>=768px) — Centered Professional Split Glass Layout */}
      <div className="relative z-10 hidden min-h-dvh flex-col justify-between px-6 py-8 md:flex lg:px-12">
        <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <PhLogo size={42} />
            <div>
              <div className="tx-headline leading-none">PlayerHaat</div>
              <div className="mt-1 tx-caption text-[var(--ph-accent)]">
                {t('authDesktopBadge')}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageChip />
            <ThemeToggleButton />
          </div>
        </header>

        <div className="mx-auto my-8 grid w-full max-w-[1120px] grid-cols-12 items-center gap-8 lg:gap-12">
          {/* Left Hero Column */}
          <div className="col-span-6 flex flex-col space-y-6 pr-4">
            <PhLogo size={68} />
            <h1 className="tx-large-title">{t('authHeadline')}</h1>
            <p className="tx-body text-[var(--ph-text-secondary)]">
              {t('authSubhead')}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <GlassContainer radius={PhRadius.lg} className="p-4">
                <PhIllustration kind="find" height={84} />
                <div className="mt-3 tx-subhead-strong">
                  {t('onbFindTitle')}
                </div>
                <p className="mt-1 tx-caption">{t('onbFindBody')}</p>
              </GlassContainer>

              <GlassContainer radius={PhRadius.lg} className="p-4">
                <PhIllustration kind="hire" height={84} />
                <div className="mt-3 tx-subhead-strong">
                  {t('onbHireTitle')}
                </div>
                <p className="mt-1 tx-caption">{t('onbHireBody')}</p>
              </GlassContainer>

              <GlassContainer radius={PhRadius.lg} className="p-4">
                <PhIllustration kind="rate" height={84} />
                <div className="mt-3 tx-subhead-strong">
                  {t('onbRateTitle')}
                </div>
                <p className="mt-1 tx-caption">{t('onbRateBody')}</p>
              </GlassContainer>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="col-span-6">
            <GlassContainer
              radius={PhRadius.xl}
              className="mx-auto max-w-[460px] p-8 lg:p-10 shadow-lg"
            >
              {authActionsBlock}
            </GlassContainer>
          </div>
        </div>

        <footer className="mx-auto w-full max-w-[1120px] text-center tx-caption">
          {t('footerRights')}
        </footer>
      </div>
    </PhPage>
  );
}

