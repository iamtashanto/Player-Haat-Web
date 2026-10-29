import React from 'react';
import { Clock, Mail, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { PhCard, PhGroup, PhRow } from '@/design-system';
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
    path: '/contact',
    title: `${t('contactPageTitle')} | PlayerHaat`,
    description: t('contactPageSubtitle'),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'bn') as AppLocale;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PhCard className="p-6 sm:p-8 space-y-2">
        <h1 className="tx-title1">{t('contactPageTitle')}</h1>
        <p className="tx-subhead">{t('contactPageSubtitle')}</p>
      </PhCard>

      <PhGroup>
        <PhRow
          icon={<Mail className="h-4 w-4" />}
          title={t('contactEmailLabel')}
          subtitle="support@playerhaat.com"
          chevron={false}
        />
        <PhRow
          icon={<Clock className="h-4 w-4" />}
          title={t('contactHoursLabel')}
          subtitle={t('contactHoursValue')}
          chevron={false}
        />
        <PhRow
          icon={<MapPin className="h-4 w-4" />}
          title={t('contactLocationLabel')}
          subtitle={t('contactLocationValue')}
          chevron={false}
        />
      </PhGroup>
    </div>
  );
}

