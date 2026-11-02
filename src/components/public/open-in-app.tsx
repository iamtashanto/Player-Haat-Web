'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { PhButton } from '@/design-system';
import { useAuth } from '@/lib/auth-context';

/** Signed in → jump to the in-app view of the same thing; signed out → sign in and land there. */
export function OpenInApp({ appHref }: { appHref: string; backHref?: string }) {
  const t = useTranslations();
  const { status } = useAuth();
  if (status === 'loading') return null;
  if (status === 'authenticated') {
    return (
      <Link href={appHref}>
        <PhButton label={t('openInAppBannerTitle')} expand={false} />
      </Link>
    );
  }
  return (
    <Link href={`/auth?next=${encodeURIComponent(appHref)}`}>
      <PhButton label={t('signIn')} expand={false} />
    </Link>
  );
}
