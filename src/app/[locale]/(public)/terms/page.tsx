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
    path: '/terms',
    title: `${t('termsPageTitle')} | PlayerHaat`,
    description: t('termsSection1Body'),
  });
}

export default async function TermsPage({
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
          <h1 className="tx-title1">{t('termsPageTitle')}</h1>
          <p className="mt-1 tx-caption">{t('termsPageUpdated')}</p>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">{t('termsSection1Title')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('termsSection1Body')}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">{t('termsSection2Title')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('termsSection2Body')}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">{t('termsSection3Title')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('termsSection3Body')}
          </p>
        </div>
      </PhCard>
    </div>
  );
}

