import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link, type AppLocale } from '@/i18n/routing';
import { PhButton, PhCard } from '@/design-system';
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
    path: '/about',
    title: `${t('aboutPageTitle')} | PlayerHaat`,
    description: t('aboutPageSubtitle'),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PhCard className="p-6 sm:p-10 space-y-4">
        <h1 className="tx-title1">{t('aboutPageTitle')}</h1>
        <p className="tx-subhead">{t('aboutPageSubtitle')}</p>
        <div className="pt-4 space-y-3">
          <h2 className="tx-title3">{t('aboutMissionTitle')}</h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('aboutMissionBody')}
          </p>
        </div>
        <div className="pt-4">
          <Link href="/auth">
            <PhButton
              label={t('getStarted')}
              size="medium"
              expand={false}
            />
          </Link>
        </div>
      </PhCard>
    </div>
  );
}

