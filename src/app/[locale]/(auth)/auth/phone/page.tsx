'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { PhButton, PhTextField, showPhToast } from '@/design-system';
import {
  AccountTypePicker,
  AuthScaffold,
  LanguageChip,
} from '@/components/auth/auth-widgets';
import { useAuth } from '@/lib/auth-context';
import { looksLikeBdMobile, nationalDigits } from '@/lib/auth-schemas';
import { getErrorMessageKey } from '@/lib/errors';

export default function PhoneAuthPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  const { requestPhoneOtp } = useAuth();
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const digits = nationalDigits(phoneInput);
    if (!looksLikeBdMobile(digits)) {
      setError(t('phoneInvalid'));
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await requestPhoneOtp(digits, locale);
      const query = new URLSearchParams({ phone: digits });
      if (nextParam) query.set('next', nextParam);
      router.push(`/auth/phone/verify?${query.toString()}`);
    } catch (err) {
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title={t('phoneTitle')}
      subtitle={t('phoneSubtitle')}
      leadingExtra={<LanguageChip />}
      footer={
        <PhButton
          label={t('sendCode')}
          loading={busy}
          onPressed={() => handleSend()}
        />
      }
    >
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <div className="mb-2 tx-overline">{t('accountTypeTitle')}</div>
          <AccountTypePicker />
        </div>

        <PhTextField
          label={t('phoneLabel')}
          placeholder="01XXXXXXXXX"
          prefixText="+880"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus
          maxLength={18}
          value={phoneInput}
          error={error ?? undefined}
          onChange={(val) => {
            const cleaned = val.replace(/[^0-9+\s-]/g, '');
            setPhoneInput(cleaned);
            if (error) setError(null);
          }}
        />

        <p className="tx-footnote">{t('phoneHelp')}</p>
      </form>
    </AuthScaffold>
  );
}
