'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { PhButton, PhPage } from '@/design-system';
import { BrandLogo, LanguageSwitcher, ThemeToggleButton } from './header-controls';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const { status, activeRole } = useAuth();
  const dashboardHref = activeRole === 'RECRUITER' ? '/recruiter' : '/player';

  const navLinks = [
    { href: '/', label: t('tabHome') },
    { href: '/discover', label: t('navDiscover') },
    { href: '/opportunities', label: t('navOpportunities') },
    { href: '/gallery', label: t('navGallery') },
  ];

  return (
    <PhPage>
      {/* Frosted sticky top header */}
      <header className="sticky top-0 z-40 w-full ph-glass border-b-[0.5px] border-[var(--ph-glass-border)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="focus:outline-none">
              <BrandLogo />
            </Link>
            <nav aria-label="Public Navigation" className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-full px-4 py-2 tx-subhead-strong transition-colors',
                      isActive
                        ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]'
                        : 'text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)] hover:bg-[var(--ph-surface-alt)]/50',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeToggleButton />
            <div className="hidden sm:flex items-center gap-2">
              {status === 'authenticated' ? (
                <Link href={dashboardHref}>
                  <PhButton
                    label={t('tabHome')}
                    variant="primary"
                    size="small"
                    expand={false}
                  />
                </Link>
              ) : (
                <>
                  <Link href="/auth/email">
                    <PhButton
                      label={t('signIn')}
                      variant="secondary"
                      size="small"
                      expand={false}
                    />
                  </Link>
                  <Link href="/auth">
                    <PhButton
                      label={t('getStarted')}
                      variant="primary"
                      size="small"
                      expand={false}
                    />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {children}
      </main>

      {/* Public SEO Footer */}
      <footer className="mt-16 border-t-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)]/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <BrandLogo />
              <p className="mt-2 max-w-md tx-footnote">{t('footerRights')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 tx-subhead">
              <Link href="/about" className="hover:text-[var(--ph-accent)] transition-colors">
                {t('settingsAbout')}
              </Link>
              <Link href="/contact" className="hover:text-[var(--ph-accent)] transition-colors">
                {t('contactPageTitle')}
              </Link>
              <Link href="/privacy" className="hover:text-[var(--ph-accent)] transition-colors">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="hover:text-[var(--ph-accent)] transition-colors">
                {t('termsOfService')}
              </Link>
              <Link href="/account-deletion" className="hover:text-[var(--ph-accent)] transition-colors">
                {t('deleteAccount')}
              </Link>
              <Link href="/gallery" className="hover:text-[var(--ph-accent)] transition-colors">
                {t('navGallery')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </PhPage>
  );
}

