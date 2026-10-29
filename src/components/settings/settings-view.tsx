'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Globe,
  Lock,
  LogOut,
  Mail,
  Moon,
  Phone,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { usePathname, useRouter, type AppLocale } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { usePhPreferences } from '@/components/providers';
import {
  GlassContainer,
  PhBadge,
  PhBottomSheet,
  PhButton,
  PhCard,
  PhChip,
  PhInput,
  PhLargeTitleBar,
  showPhToast,
} from '@/design-system';
import {
  useDeleteAccount,
  useLinkedMethods,
  useUnlinkMethod,
} from '@/lib/settings-api';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { reduceEffects, setReduceEffects } = usePhPreferences();
  const { me, logout, hasBothRoles, activeRole, switchActiveRole, enableOtherRole } = useAuth();

  const { data: methods } = useLinkedMethods();
  const unlinkMutation = useUnlinkMethod();
  const deleteAccountMutation = useDeleteAccount();

  // Delete Account Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const handleLanguageChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  const handleUnlink = async (provider: 'phone' | 'google' | 'apple') => {
    try {
      await unlinkMutation.mutateAsync(provider);
      showPhToast('Method unlinked');
    } catch {
      showPhToast('Could not unlink login method');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showPhToast('Please type DELETE to confirm');
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({
        confirm: 'DELETE',
        password: deletePassword ? deletePassword : undefined,
      });
      await logout();
      showPhToast('Your account has been deleted');
      router.push('/');
    } catch {
      showPhToast('Could not delete account. Check password.');
    }
  };

  const handleLogout = async () => {
    await logout();
    showPhToast('Signed out');
    router.push('/auth');
  };

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 max-w-3xl mx-auto">
      {/* Title */}
      <PhLargeTitleBar
        title={t('settingsTitle')}
        subtitle="Manage your language, display preferences, security, and account data."
      />

      {/* Language Section */}
      <PhCard className="p-5 space-y-3">
        <div className="flex items-center gap-2 tx-headline text-[var(--ph-text)]">
          <Globe className="h-5 w-5 text-[var(--ph-accent)]" />
          <span>Language / ভাষা</span>
        </div>
        <p className="tx-subhead text-[var(--ph-text-secondary)]">
          Choose your preferred language across the website.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={cn(
              'flex-1 rounded-2xl p-3.5 tx-subhead-strong border transition-all text-center',
              locale === 'en'
                ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] border-transparent shadow-sm'
                : 'bg-[var(--ph-surface)] text-[var(--ph-text)] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]',
            )}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('bn')}
            className={cn(
              'flex-1 rounded-2xl p-3.5 tx-subhead-strong border transition-all text-center',
              locale === 'bn'
                ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] border-transparent shadow-sm'
                : 'bg-[var(--ph-surface)] text-[var(--ph-text)] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]',
            )}
          >
            বাংলা
          </button>
        </div>
      </PhCard>

      {/* Appearance & Accessibility */}
      <PhCard className="p-5 space-y-4">
        <div className="flex items-center gap-2 tx-headline text-[var(--ph-text)]">
          <Sun className="h-5 w-5 text-[var(--ph-accent)]" />
          <span>Appearance & Motion</span>
        </div>

        {/* Theme Toggles */}
        <div className="flex gap-2">
          {(['system', 'light', 'dark'] as const).map((tMode) => (
            <PhChip
              key={tMode}
              label={tMode.charAt(0).toUpperCase() + tMode.slice(1)}
              selected={theme === tMode}
              onTap={() => setTheme(tMode)}
            />
          ))}
        </div>

        {/* Reduced Effects Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--ph-border)]">
          <div>
            <div className="tx-subhead-strong text-[var(--ph-text)]">Reduce Effects</div>
            <div className="tx-caption text-[var(--ph-text-secondary)]">
              Disables frosted transparency and motion transitions for low-spec devices.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReduceEffects(!reduceEffects)}
            className={cn(
              'relative h-7 w-12 rounded-full transition-colors',
              reduceEffects ? 'bg-[var(--ph-accent)]' : 'bg-[var(--ph-surface-alt)] border border-[var(--ph-border)]',
            )}
          >
            <span
              className={cn(
                'absolute top-1 block h-5 w-5 rounded-full bg-white transition-transform shadow-sm',
                reduceEffects ? 'left-6' : 'left-1',
              )}
            />
          </button>
        </div>
      </PhCard>

      {/* Account Roles */}
      <PhCard className="p-5 space-y-4">
        <div className="flex items-center gap-2 tx-headline text-[var(--ph-text)]">
          <UserPlus className="h-5 w-5 text-[var(--ph-accent)]" />
          <span>Active Roles</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="tx-subhead-strong text-[var(--ph-text)]">
              Current active view: <span className="text-[var(--ph-accent)]">{activeRole}</span>
            </div>
            <div className="tx-caption text-[var(--ph-text-secondary)]">
              {hasBothRoles
                ? 'Your account has both Player and Recruiter profiles enabled.'
                : 'You are currently registered under one role.'}
            </div>
          </div>

          <div className="flex gap-2">
            {hasBothRoles ? (
              <PhButton
                variant="secondary"
                size="small"
                label={activeRole === 'PLAYER' ? 'Switch to Recruiter' : 'Switch to Player'}
                onPressed={async () => {
                  const next = activeRole === 'PLAYER' ? 'RECRUITER' : 'PLAYER';
                  await switchActiveRole(next);
                  router.push(next === 'RECRUITER' ? '/recruiter' : '/player');
                }}
              />
            ) : (
              <PhButton
                variant="secondary"
                size="small"
                label={activeRole === 'PLAYER' ? 'Enable Recruiter' : 'Enable Player'}
                onPressed={async () => {
                  const other = activeRole === 'PLAYER' ? 'RECRUITER' : 'PLAYER';
                  await enableOtherRole(other);
                  router.push(other === 'RECRUITER' ? '/recruiter' : '/player');
                }}
              />
            )}
          </div>
        </div>
      </PhCard>

      {/* Linked Login Methods */}
      <PhCard className="p-5 space-y-4">
        <div className="flex items-center gap-2 tx-headline text-[var(--ph-text)]">
          <Lock className="h-5 w-5 text-[var(--ph-accent)]" />
          <span>Linked Login Methods</span>
        </div>
        <p className="tx-subhead text-[var(--ph-text-secondary)]">
          Sign-in credentials connected to your PlayerHaat account.
        </p>

        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--ph-surface-alt)]">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[var(--ph-accent)]" />
              <div>
                <div className="tx-subhead-strong text-[var(--ph-text)]">Mobile Number</div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  {methods?.phone || me?.phone || '+8801700000000'}
                </div>
              </div>
            </div>
            <PhBadge label="Active" tone="accent" />
          </div>

          {/* Email / Password */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--ph-surface-alt)]">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[var(--ph-accent)]" />
              <div>
                <div className="tx-subhead-strong text-[var(--ph-text)]">Email & Password</div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  {methods?.email || me?.email || 'Registered account'}
                </div>
              </div>
            </div>
            <PhBadge label="Enabled" tone="neutral" />
          </div>

          {/* Google */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--ph-surface-alt)]">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-[var(--ph-text)]" />
              <div>
                <div className="tx-subhead-strong text-[var(--ph-text)]">Google Account</div>
                <div className="tx-caption text-[var(--ph-text-secondary)]">
                  {methods?.google ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
            {methods?.google ? (
              <button
                type="button"
                onClick={() => handleUnlink('google')}
                className="tx-caption text-[var(--ph-danger)] font-semibold hover:underline"
              >
                Disconnect
              </button>
            ) : (
              <PhBadge label="Available" tone="neutral" />
            )}
          </div>
        </div>
      </PhCard>

      {/* Logout & Danger Zone */}
      <PhCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="tx-headline text-[var(--ph-text)]">Sign Out</div>
            <div className="tx-caption text-[var(--ph-text-secondary)]">
              Clears local session tokens and cookies.
            </div>
          </div>
          <PhButton
            variant="secondary"
            size="medium"
            label="Logout"
            icon={<LogOut className="h-4 w-4" />}
            onPressed={handleLogout}
          />
        </div>

        <div className="pt-4 border-t border-[var(--ph-border)] flex items-center justify-between">
          <div>
            <div className="tx-headline text-[var(--ph-danger)]">Delete Account</div>
            <div className="tx-caption text-[var(--ph-text-secondary)]">
              Permanently erase your profiles, match history, and ratings.
            </div>
          </div>
          <PhButton
            variant="danger"
            size="medium"
            label="Delete Account"
            icon={<Trash2 className="h-4 w-4" />}
            onPressed={() => setDeleteModalOpen(true)}
          />
        </div>
      </PhCard>

      {/* Account Deletion Confirmation Sheet */}
      <PhBottomSheet
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete PlayerHaat Account"
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-2xl bg-[var(--ph-danger-soft)] p-4 text-[var(--ph-danger)] border border-[var(--ph-danger)]/20 space-y-1">
            <div className="flex items-center gap-2 tx-subhead-strong">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>This action cannot be undone</span>
            </div>
            <p className="tx-caption opacity-90">
              All your player profiles, team requests, match reviews, and verified badges will be deleted immediately.
            </p>
          </div>

          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Type <span className="text-[var(--ph-danger)] font-bold">DELETE</span> to confirm
            </label>
            <PhInput
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block tx-subhead-strong text-[var(--ph-text)]">
              Password (if set)
            </label>
            <PhInput
              type="password"
              placeholder="Your account password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--ph-border)]">
            <PhButton
              variant="secondary"
              label={t('cancel')}
              onPressed={() => setDeleteModalOpen(false)}
            />
            <PhButton
              variant="danger"
              label="Permanently Delete"
              disabled={deleteConfirmText !== 'DELETE'}
              loading={deleteAccountMutation.isPending}
              onPressed={handleDeleteAccount}
            />
          </div>
        </div>
      </PhBottomSheet>
    </div>
  );
}

