'use client';

import React from 'react';
import { Globe, ShieldAlert } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter, type AppLocale } from '@/i18n/routing';
import {
  GlassContainer,
  PhBackButton,
  PhChip,
  PhIllustration,
  PhPage,
  PhRadius,
  PitchBackdrop,
  Pressable,
} from '@/design-system';
import { ThemeToggleButton } from '@/components/shells/header-controls';
import { useAuth } from '@/lib/auth-context';
import type { SignupRole } from '@/lib/auth-schemas';

/**
 * Pitch-green squircle with a white "H" and a ball — 1:1 with `PhLogo` in `app/lib/features/auth/presentation/auth_widgets.dart`.
 */
export function PhLogo({ size = 64 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.3)}px`,
        background:
          'linear-gradient(135deg, var(--ph-accent) 0%, #0B3D24 100%)',
        boxShadow: `0 ${Math.round(size * 0.14)}px ${Math.round(size * 0.4)}px rgba(10, 132, 67, 0.35)`,
      }}
      className="relative inline-flex shrink-0 items-center justify-center select-none"
    >
      <span
        style={{
          fontSize: `${Math.round(size * 0.56)}px`,
          lineHeight: 1,
        }}
        className="font-extrabold text-[var(--ph-accent-on)]"
      >
        H
      </span>
      <span
        style={{
          width: `${Math.round(size * 0.17)}px`,
          height: `${Math.round(size * 0.17)}px`,
          right: `${Math.round(size * 0.17)}px`,
          top: `${Math.round(size * 0.17)}px`,
        }}
        className="absolute rounded-full bg-[var(--ph-accent-on)]"
      />
    </div>
  );
}

/**
 * Multi-color Google "G" SVG — 1:1 with `GoogleMark` in `auth_widgets.dart`.
 */
export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.1 0 10 0 12s.6 3.9 1.6 5.6l3.7-2.8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.8 1.1-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.4 7.4 23 12 23z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6l3.5 2.7c2.1-1.9 3.9-4.8 3.9-8.5z"
      />
    </svg>
  );
}

/**
 * Apple mark SVG for Sign in with Apple button.
 */
export function AppleMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 text-[var(--ph-text)]"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/**
 * Compact EN | বাংলা switch — 1:1 with `LanguageChip` in `auth_widgets.dart`.
 */
export function LanguageChip() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale: AppLocale = locale === 'bn' ? 'en' : 'bn';

  return (
    <PhChip
      label={locale === 'bn' ? 'English' : 'বাংলা'}
      icon={<Globe className="h-4 w-4" />}
      dense
      onTap={() => router.replace(pathname, { locale: nextLocale })}
    />
  );
}

/**
 * Player or Recruiter role picker — 1:1 with `_AccountTypePicker` in `auth_landing_screen.dart`
 * plus optional descriptive subtitle on desktop.
 */
export function AccountTypePicker({
  value,
  onChange,
  showDescription = false,
}: {
  value?: SignupRole;
  onChange?: (role: SignupRole) => void;
  showDescription?: boolean;
}) {
  const t = useTranslations();
  const { signupRole, setSignupRole } = useAuth();
  const current = value ?? signupRole;

  const handleSelect = (role: SignupRole) => {
    setSignupRole(role);
    onChange?.(role);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <PhChip
          label={t('accountTypePlayer')}
          selected={current === 'PLAYER'}
          onTap={() => handleSelect('PLAYER')}
        />
        <PhChip
          label={t('accountTypeRecruiter')}
          selected={current === 'RECRUITER'}
          onTap={() => handleSelect('RECRUITER')}
        />
      </div>
      {showDescription && (
        <p className="mt-2.5 tx-footnote">
          {current === 'RECRUITER'
            ? t('authRecruiterRoleDesc')
            : t('authPlayerRoleDesc')}
        </p>
      )}
    </div>
  );
}

/**
 * Social sign-in button — 1:1 with `_SocialButton` in `auth_landing_screen.dart` (height 54px, surface bg, hairline border).
 */
export function SocialAuthButton({
  label,
  leading,
  loading = false,
  disabled = false,
  onPressed,
}: {
  label: string;
  leading: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPressed?: () => void;
}) {
  return (
    <Pressable
      onClick={disabled || loading ? undefined : onPressed}
      disabled={disabled || loading}
      ariaLabel={label}
      className="w-full"
    >
      <div
        style={{ borderRadius: `${PhRadius.md}px` }}
        className="flex h-[54px] w-full items-center justify-center gap-3 border border-[var(--ph-border)] bg-[var(--ph-surface)] px-4 tx-button text-[var(--ph-text)] transition-colors hover:bg-[var(--ph-surface-alt)]"
      >
        {loading ? (
          <span className="h-[22px] w-[22px] animate-spin rounded-full border-2 border-[var(--ph-text)] border-t-transparent" />
        ) : (
          <>
            {leading}
            <span>{label}</span>
          </>
        )}
      </div>
    </Pressable>
  );
}

/**
 * "By continuing, you agree to our Terms and Privacy Policy." — 1:1 with `TermsLine` in `auth_widgets.dart`.
 */
export function TermsLine() {
  const t = useTranslations();

  return (
    <p className="text-center tx-footnote">
      {t.rich('authTermsLine', {
        terms: () => (
          <Link
            href="/terms"
            className="font-semibold text-[var(--ph-accent)] hover:underline"
          >
            {t('authTerms')}
          </Link>
        ),
        privacy: () => (
          <Link
            href="/privacy"
            className="font-semibold text-[var(--ph-accent)] hover:underline"
          >
            {t('authPrivacy')}
          </Link>
        ),
      })}
    </p>
  );
}

/**
 * Dedicated banner shown if a `SUPER_ADMIN` or `ADMIN` token attempts to log in on this website.
 */
export function AdminBlockedBanner({ onDismiss }: { onDismiss?: () => void }) {
  const t = useTranslations();

  return (
    <div
      role="alert"
      style={{ borderRadius: `${PhRadius.md}px` }}
      className="mb-4 flex items-start gap-3 border border-[var(--ph-danger)]/40 bg-[var(--ph-danger)]/10 p-4 text-[var(--ph-text)]"
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ph-danger)]" />
      <div className="min-w-0 flex-1">
        <div className="tx-subhead-strong text-[var(--ph-danger)]">
          {t('errAdminDashboardOnly')}
        </div>
        <div className="mt-1 tx-caption text-[var(--ph-text-secondary)]">
          {t('authAdminRedirectHint')}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="tx-caption font-semibold text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)] cursor-pointer"
        >
          {t('close')}
        </button>
      )}
    </div>
  );
}

/**
 * Frame for every pre-sign-in screen:
 * - On mobile (<768px): 1:1 with Flutter's `AuthScaffold` in `app/lib/features/auth/presentation/auth_widgets.dart`
 *   (top back button + optional language chip, scrollable body with `title1` + `subhead`, bottom footer button).
 * - On desktop (>=768px): Awesome professional 2-column split card with pitch backdrop, brand story & illustration
 *   on the left, and frosted glass form container on the right.
 */
export function AuthScaffold({
  title,
  subtitle,
  children,
  showBack = true,
  backHref = '/auth',
  footer,
  leadingExtra,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  backHref?: string;
  footer?: React.ReactNode;
  leadingExtra?: React.ReactNode;
}) {
  const t = useTranslations();
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push(backHref);
    }
  };

  return (
    <PhPage className="relative min-h-dvh overflow-hidden">
      <PitchBackdrop opacity={0.08} className="pointer-events-none fixed inset-0" />

      {/* Mobile View (<768px) — 1:1 with Flutter AuthScaffold */}
      <div className="relative z-10 flex min-h-dvh flex-col md:hidden">
        <div className="flex items-center justify-between px-2 pt-2">
          {showBack ? (
            <PhBackButton label={t('back')} onPressed={handleBack} />
          ) : (
            <div className="h-[44px]" />
          )}
          <div className="flex items-center gap-1.5">
            {leadingExtra ?? <LanguageChip />}
            <ThemeToggleButton />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <h1 className="tx-title1">{title}</h1>
          {subtitle && <p className="mt-2 tx-subhead">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>

        {footer && <div className="px-5 pb-5 pt-2">{footer}</div>}
      </div>

      {/* Desktop View (>=768px) — Centered Professional Split Glass Layout */}
      <div className="relative z-10 hidden min-h-dvh flex-col justify-between px-6 py-8 md:flex lg:px-12">
        {/* Top bar */}
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
            {leadingExtra ?? <LanguageChip />}
            <ThemeToggleButton />
          </div>
        </header>

        {/* Main Split Container */}
        <div className="mx-auto my-8 grid w-full max-w-[1120px] grid-cols-12 items-center gap-8 lg:gap-12">
          {/* Left Hero Column */}
          <div className="col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <PhIllustration kind="find" height={170} />
              <h2 className="mt-6 tx-large-title">{t('authHeadline')}</h2>
              <p className="mt-3 tx-body text-[var(--ph-text-secondary)]">
                {t('authSubhead')}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <GlassContainer radius={PhRadius.lg} className="p-4">
                <div className="tx-subhead-strong text-[var(--ph-accent)]">
                  {t('onbFindTitle')}
                </div>
                <p className="mt-1 tx-caption">{t('onbFindBody')}</p>
              </GlassContainer>
              <GlassContainer radius={PhRadius.lg} className="p-4">
                <div className="tx-subhead-strong text-[var(--ph-accent)]">
                  {t('onbHireTitle')}
                </div>
                <p className="mt-1 tx-caption">{t('onbHireBody')}</p>
              </GlassContainer>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="col-span-7">
            <GlassContainer
              radius={PhRadius.xl}
              className="mx-auto max-w-[520px] p-8 lg:p-10 shadow-lg"
            >
              {showBack && (
                <div className="-ml-2 mb-4">
                  <PhBackButton label={t('back')} onPressed={handleBack} />
                </div>
              )}
              <h1 className="tx-title1">{title}</h1>
              {subtitle && <p className="mt-2 tx-subhead">{subtitle}</p>}
              <div className="mt-7">{children}</div>
              {footer && <div className="mt-8">{footer}</div>}
            </GlassContainer>
          </div>
        </div>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-[1120px] text-center tx-caption">
          {t('footerRights')}
        </footer>
      </div>
    </PhPage>
  );
}
