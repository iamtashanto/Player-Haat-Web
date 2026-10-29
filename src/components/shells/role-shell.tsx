'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Briefcase,
  Heart,
  Home,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Trophy,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { usePhPreferences, type ActiveRole } from '@/components/providers';
import {
  GlassContainer,
  OfflineBanner,
  PhAvatar,
  PhButton,
  PhGlassTabBar,
  PhIconButton,
  PhPage,
  PhRadius,
  type PhTabItem,
} from '@/design-system';
import {
  BrandLogo,
  LanguageSwitcher,
  RoleSwitcherPill,
  ThemeToggleButton,
} from './header-controls';
import { cn } from '@/lib/utils';

export interface RoleShellProps {
  role: ActiveRole;
  children: React.ReactNode;
}

/**
 * Shared mobile-first + desktop side-nav shell for Player and Recruiter areas.
 * - On mobile (<768px): identical to the Flutter app (`AppShell` in `app/lib/app/shell.dart`),
 *   with a floating frosted `PhGlassTabBar` at the bottom and iOS collapsible header.
 * - On desktop (>=768px): centered professional layout with a frosted sticky sidebar,
 *   frosted top bar, active-role switcher, and generous whitespace.
 */
export function RoleShell({ role, children }: RoleShellProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveRole } = usePhPreferences();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setActiveRole(role);
  }, [role, setActiveRole]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // 5 tabs matching Flutter's AppShell (Home, Players/Discover, My games, Alerts, Me)
  const basePrefix = role === 'RECRUITER' ? '/recruiter' : '/player';

  const tabs: PhTabItem[] =
    role === 'RECRUITER'
      ? [
          {
            id: 'home',
            label: t('tabHome'),
            href: `${basePrefix}`,
            icon: <Home className="h-6 w-6" />,
          },
          {
            id: 'players',
            label: t('tabPlayers'),
            href: `${basePrefix}/discover`,
            icon: <Search className="h-6 w-6" />,
          },
          {
            id: 'games',
            label: t('gamesRequests'),
            href: `${basePrefix}/requests`,
            icon: <Trophy className="h-6 w-6" />,
          },
          {
            id: 'alerts',
            label: t('tabAlerts'),
            href: `${basePrefix}/alerts`,
            icon: <Bell className="h-6 w-6" />,
            badge: true,
          },
          {
            id: 'me',
            label: t('tabMe'),
            href: `${basePrefix}/me`,
            icon: <User className="h-6 w-6" />,
          },
        ]
      : [
          {
            id: 'home',
            label: t('tabHome'),
            href: `${basePrefix}`,
            icon: <Home className="h-6 w-6" />,
          },
          {
            id: 'players',
            label: t('tabPlayers'),
            href: `${basePrefix}/players`,
            icon: <Search className="h-6 w-6" />,
          },
          {
            id: 'games',
            label: t('tabGames'),
            href: `${basePrefix}/games`,
            icon: <Trophy className="h-6 w-6" />,
          },
          {
            id: 'alerts',
            label: t('tabAlerts'),
            href: `${basePrefix}/alerts`,
            icon: <Bell className="h-6 w-6" />,
            badge: true,
          },
          {
            id: 'me',
            label: t('tabMe'),
            href: `${basePrefix}/me`,
            icon: <User className="h-6 w-6" />,
          },
        ];

  // Desktop extra navigation items per role
  const desktopSecondaryNav =
    role === 'RECRUITER'
      ? [
          {
            id: 'shortlist',
            label: t('shortlistTitle'),
            href: `${basePrefix}/shortlist`,
            icon: <Heart className="h-5 w-5" />,
          },
          {
            id: 'messages',
            label: t('messagesTitle'),
            href: `${basePrefix}/messages`,
            icon: <MessageCircle className="h-5 w-5" />,
          },
          {
            id: 'settings',
            label: t('settingsTitle'),
            href: `${basePrefix}/settings`,
            icon: <Settings className="h-5 w-5" />,
          },
        ]
      : [
          {
            id: 'profiles',
            label: t('navMyProfiles'),
            href: `${basePrefix}/profiles`,
            icon: <Briefcase className="h-5 w-5" />,
          },
          {
            id: 'messages',
            label: t('messagesTitle'),
            href: `${basePrefix}/messages`,
            icon: <MessageCircle className="h-5 w-5" />,
          },
          {
            id: 'settings',
            label: t('settingsTitle'),
            href: `${basePrefix}/settings`,
            icon: <Settings className="h-5 w-5" />,
          },
        ];

  const activeIndex = Math.max(
    0,
    tabs.findIndex((item) =>
      item.href === basePrefix
        ? pathname === basePrefix
        : item.href && pathname.startsWith(item.href),
    ),
  );

  const handleRoleSwitch = (nextRole: ActiveRole) => {
    router.push(nextRole === 'RECRUITER' ? '/recruiter' : '/player');
  };

  return (
    <PhPage>
      {!online && (
        <div className="sticky top-0 z-50">
          <OfflineBanner label={t('offlineBanner')} />
        </div>
      )}

      {/* Centered desktop shell container */}
      <div className="mx-auto flex min-h-dvh max-w-[1360px] gap-6 md:px-6 lg:px-8">
        {/* Desktop Side Navigation (>=768px) */}
        <aside
          aria-label={role === 'RECRUITER' ? 'Recruiter Navigation' : 'Player Navigation'}
          className="hidden md:flex md:w-[272px] lg:w-[292px] shrink-0 flex-col py-6"
        >
          <div className="sticky top-6 flex flex-col gap-5">
            <GlassContainer radius={PhRadius.xl} className="p-5">
              <div className="flex items-center justify-between">
                <Link href="/">
                  <BrandLogo />
                </Link>
              </div>

              {/* Active Role Switcher */}
              <div className="mt-4">
                <RoleSwitcherPill
                  onRoleChange={handleRoleSwitch}
                  className="w-full justify-between"
                />
              </div>

              {/* Primary 5 tabs */}
              <nav className="mt-5 flex flex-col gap-1">
                {tabs.map((item, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <Link
                      key={item.id}
                      href={item.href ?? basePrefix}
                      className={cn(
                        'flex items-center justify-between rounded-[14px] px-3.5 py-2.5 tx-subhead-strong transition-all',
                        isSelected
                          ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]'
                          : 'text-[var(--ph-text-secondary)] hover:bg-[var(--ph-surface-alt)]/60 hover:text-[var(--ph-text)]',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="h-2 w-2 rounded-full bg-[var(--ph-danger)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="my-4 h-[0.5px] w-full bg-[var(--ph-border)]" />

              {/* Secondary links */}
              <nav className="flex flex-col gap-1">
                {desktopSecondaryNav.map((item) => {
                  const isSelected = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-[14px] px-3.5 py-2 tx-subhead transition-all',
                        isSelected
                          ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)] font-semibold'
                          : 'text-[var(--ph-text-secondary)] hover:bg-[var(--ph-surface-alt)]/60 hover:text-[var(--ph-text)]',
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {role === 'RECRUITER' && (
                <div className="mt-5">
                  <PhButton
                    label={t('postRequest')}
                    icon={<Plus className="h-5 w-5" />}
                    size="medium"
                    onPressed={() => router.push('/recruiter')}
                  />
                </div>
              )}
            </GlassContainer>

            {/* User summary card in sidebar */}
            <GlassContainer radius={PhRadius.lg} className="p-4">
              <div className="flex items-center gap-3">
                <PhAvatar
                  name={role === 'RECRUITER' ? 'Abahani Youth Club' : 'Sohel Rana'}
                  size={42}
                  verified
                />
                <div className="min-w-0 flex-1">
                  <div className="tx-subhead-strong truncate text-[var(--ph-text)]">
                    {role === 'RECRUITER' ? 'Abahani Youth Club' : 'Sohel Rana'}
                  </div>
                  <div className="tx-caption truncate text-[var(--ph-accent)]">
                    {role === 'RECRUITER'
                      ? t('accountTypeRecruiter')
                      : t('accountTypePlayer')}
                  </div>
                </div>
                <Link href="/gallery">
                  <PhIconButton
                    icon={<Settings className="h-4 w-4" />}
                    semanticLabel={t('navGallery')}
                    filled={false}
                  />
                </Link>
              </div>
            </GlassContainer>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex min-w-0 flex-1 flex-col pb-[96px] md:pb-12">
          {/* Top bar (Mobile + Desktop) */}
          <div className="sticky top-0 z-30 ph-glass border-b-[0.5px] border-[var(--ph-glass-border)] md:mt-6 md:rounded-[20px] md:border-[0.5px]">
            <div className="flex h-[56px] items-center justify-between px-4 md:px-5">
              <div className="flex items-center gap-3 md:hidden">
                <Link href="/">
                  <BrandLogo compact />
                </Link>
                <RoleSwitcherPill onRoleChange={handleRoleSwitch} />
              </div>

              <div className="hidden md:flex items-center gap-2 tx-subhead">
                <span className="font-semibold text-[var(--ph-text)]">
                  {role === 'RECRUITER'
                    ? t('accountTypeRecruiter')
                    : t('accountTypePlayer')}
                </span>
                <span className="text-[var(--ph-text-tertiary)]">·</span>
                <span>{t('anywhere')}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <LanguageSwitcher compact />
                <ThemeToggleButton />
                <Link href="/gallery">
                  <PhButton
                    label={t('navGallery')}
                    variant="secondary"
                    size="small"
                    expand={false}
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Screen Body */}
          <main className="w-full pt-2 md:pt-4">{children}</main>
        </div>
      </div>

      {/* Floating Frosted Bottom Tab Bar on Mobile (<768px) — 1:1 with Flutter AppShell */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <PhGlassTabBar
          items={tabs}
          activeIndex={activeIndex}
          onChange={(idx) => {
            const target = tabs[idx];
            if (target?.href) router.push(target.href);
          }}
        />
      </div>
    </PhPage>
  );
}

