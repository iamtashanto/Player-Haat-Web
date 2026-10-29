'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { Moon, Sun, Monitor, Globe, ShieldCheck, UserCheck } from 'lucide-react';
import { usePathname, useRouter, type AppLocale } from '@/i18n/routing';
import { usePhPreferences, type ActiveRole } from '@/components/providers';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { PhIconButton, PhRadius, PhSegmented } from '@/design-system';
import { cn } from '@/lib/utils';

/**
 * Brand mark + wordmark used across Public, Player, and Recruiter shells.
 */
export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        style={{ borderRadius: `${PhRadius.sm}px` }}
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--ph-accent)] text-[var(--ph-accent-on)] font-extrabold text-lg shadow-xs"
      >
        P
      </div>
      {!compact && (
        <div className="flex flex-col">
          <span className="tx-headline leading-none tracking-tight text-[var(--ph-text)]">
            PlayerHaat
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ph-accent)]">
            Bangladesh
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Language switcher (`en` / `bn`) in header: switches URL locale and remembers user choice.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  const toggleLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    try {
      localStorage.setItem('ph-locale', nextLocale);
    } catch {
      // ignore
    }
    if (status === 'authenticated') {
      void apiRequest('/users/me', {
        method: 'PATCH',
        body: { locale: nextLocale },
        locale: nextLocale,
      }).catch(() => {});
    }
    router.replace(pathname, { locale: nextLocale });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => toggleLocale(locale === 'bn' ? 'en' : 'bn')}
        aria-label="Switch language"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--ph-surface-alt)] px-3 tx-caption font-semibold text-[var(--ph-text)] transition-colors hover:bg-[var(--ph-accent-soft)] hover:text-[var(--ph-accent)] cursor-pointer"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{locale === 'bn' ? 'EN' : 'বাংলা'}</span>
      </button>
    );
  }

  return (
    <div className="w-[152px]">
      <PhSegmented<AppLocale>
        options={{ bn: 'বাংলা', en: 'EN' }}
        value={locale}
        onChanged={toggleLocale}
      />
    </div>
  );
}

/**
 * Theme toggle button (cycles Light -> Dark -> System or shows segmented control).
 */
export function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-[44px] w-[44px] flex items-center justify-center">
        <div className="h-9 w-9 rounded-full bg-[var(--ph-surface-alt)]" />
      </div>
    );
  }

  const nextTheme =
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  const Icon =
    theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <PhIconButton
      icon={<Icon className="h-[18px] w-[18px]" />}
      semanticLabel={`Theme: ${theme ?? 'system'}. Click to switch to ${nextTheme}`}
      onPressed={() => setTheme(nextTheme)}
    />
  );
}

/**
 * Active-role switcher (`PLAYER` <-> `RECRUITER`) shown in header when account has both roles enabled.
 */
export function RoleSwitcherPill({
  onRoleChange,
  className,
}: {
  onRoleChange?: (role: ActiveRole) => void;
  className?: string;
}) {
  const t = useTranslations();
  const { activeRole, setActiveRole, dualRolesEnabled } = usePhPreferences();

  if (!dualRolesEnabled) return null;

  const handleSelect = (role: ActiveRole) => {
    setActiveRole(role);
    onRoleChange?.(role);
  };

  return (
    <div
      role="group"
      aria-label={t('switchRole')}
      className={cn(
        'inline-flex h-9 items-center rounded-full bg-[var(--ph-surface-alt)] p-1 border-[0.5px] border-[var(--ph-border)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => handleSelect('PLAYER')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-full px-3 tx-caption font-semibold transition-all cursor-pointer',
          activeRole === 'PLAYER'
            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] shadow-xs'
            : 'text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)]',
        )}
      >
        <UserCheck className="h-3.5 w-3.5" />
        <span>{t('accountTypePlayer')}</span>
      </button>
      <button
        type="button"
        onClick={() => handleSelect('RECRUITER')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-full px-3 tx-caption font-semibold transition-all cursor-pointer',
          activeRole === 'RECRUITER'
            ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] shadow-xs'
            : 'text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)]',
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{t('accountTypeRecruiter')}</span>
      </button>
    </div>
  );
}

