'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { PhButton, PhTextField, showPhToast } from '@/design-system';
import { AuthScaffold, LanguageChip } from '@/components/auth/auth-widgets';
import { useAuth } from '@/lib/auth-context';
import { looksLikeEmail } from '@/lib/auth-schemas';
import { getErrorMessageKey } from '@/lib/errors';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!looksLikeEmail(email)) {
      setErr(t('emailInvalid'));
      return;
    }

    const normalized = email.trim().toLowerCase();
    setErr(null);
    setBusy(true);
    try {
      await forgotPassword(normalized);
      showPhToast(t('resetSentGeneric'), 'info');
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(normalized)}`,
      );
    } catch (error) {
      const key = getErrorMessageKey(error);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title={t('forgotTitle')}
      subtitle={t('forgotSubtitle')}
      backHref="/auth/email"
      leadingExtra={<LanguageChip />}
      footer={
        <PhButton
          label={t('sendResetCode')}
          loading={busy}
          onPressed={() => handleSend()}
        />
      }
    >
      <form onSubmit={handleSend}>
        <PhTextField
          label={t('emailLabel')}
          placeholder="you@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          value={email}
          error={err ?? undefined}
          onChange={(val) => {
            setEmail(val);
            if (err) setErr(null);
          }}
        />
      </form>
    </AuthScaffold>
  );
}
