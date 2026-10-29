import React from 'react';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { PhCard } from '@/design-system';
import { buildSeoMetadata } from '@/lib/public-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  return buildSeoMetadata({
    locale,
    path: '/privacy',
    title: `${t('privacyPageTitle')} | PlayerHaat`,
    description: t('privacySection1Body'),
  });
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PhCard className="p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="tx-title1">{t('privacyPageTitle')}</h1>
          <p className="mt-1 tx-caption">{t('privacyPageUpdated')}</p>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">{t('privacySection1Title')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('privacySection1Body')}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">{t('privacySection2Title')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('privacySection2Body')}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">{t('privacySection3Title')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('privacySection3Body')}
          </p>
        </div>
      </PhCard>
    </div>
  );
}

