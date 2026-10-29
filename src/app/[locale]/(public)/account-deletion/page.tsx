import React from 'react';
import { Trash2 } from 'lucide-react';
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
    path: '/account-deletion',
    title: `${t('accountDeletionPageTitle')} | PlayerHaat`,
    description: t('accountDeletionPageSubtitle'),
  });
}

export default async function AccountDeletionInfoPage({
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
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ph-danger)]/15 text-[var(--ph-danger)]">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="tx-title1">{t('accountDeletionPageTitle')}</h1>
            <p className="mt-1 tx-subhead">
              {t('accountDeletionPageSubtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="tx-title3">{t('accountDeletionStepsTitle')}</h2>
          <ul className="space-y-2 tx-body text-[var(--ph-text-secondary)]">
            <li>{t('accountDeletionStep1')}</li>
            <li>{t('accountDeletionStep2')}</li>
            <li>{t('accountDeletionStep3')}</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="tx-title3">
            {t('accountDeletionWhatIsDeletedTitle')}
          </h2>
          <p className="tx-body text-[var(--ph-text-secondary)]">
            {t('accountDeletionWhatIsDeletedBody')}
          </p>
        </div>

        <div className="rounded-[16px] bg-[var(--ph-surface-alt)] p-4 tx-footnote">
          {t('accountDeletionEmailFallback')}
        </div>

        <div className="pt-2">
          <Link href="/auth">
            <PhButton
              label={`${t('signIn')} → ${t('deleteAccount')}`}
              variant="destructive"
              size="medium"
              expand={false}
            />
          </Link>
        </div>
      </PhCard>
    </div>
  );
}

