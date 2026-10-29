'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import {
  PhButton,
  PhOtpField,
  PhTextField,
  showPhToast,
} from '@/design-system';
import { AuthScaffold, LanguageChip } from '@/components/auth/auth-widgets';
import { useAuth } from '@/lib/auth-context';
import { passwordProblemKey } from '@/lib/auth-schemas';
import { getErrorMessageKey } from '@/lib/errors';

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { resetPassword } = useAuth();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passErr, setPassErr] = useState<string | null>(null);
  const [wrongCode, setWrongCode] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleReset = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const prob = passwordProblemKey(password);
    if (prob || code.length !== 6) {
      setPassErr(prob ? t(prob) : null);
      if (code.length !== 6) setWrongCode(true);
      return;
    }

    setPassErr(null);
    setWrongCode(false);
    setBusy(true);
    try {
      await resetPassword({
        email,
        code,
        newPassword: password,
      });
      showPhToast(t('passwordResetDone'), 'success');
      router.push('/auth/email');
    } catch (err) {
      setWrongCode(true);
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title={t('resetTitle')}
      subtitle={t('verifyEmailSubtitle', { email: email || 'your@email.com' })}
      backHref="/auth/forgot-password"
      leadingExtra={<LanguageChip />}
      footer={
        <PhButton
          label={t('resetPassword')}
          loading={busy}
          onPressed={() => handleReset()}
        />
      }
    >
      <form onSubmit={handleReset} className="space-y-6">
        <div>
          <div className="mb-2 tx-subhead-strong">{t('resetCodeLabel')}</div>
          <PhOtpField
            value={code}
            onChange={(v) => {
              setCode(v);
              if (wrongCode) setWrongCode(false);
            }}
            error={wrongCode}
            enabled={!busy}
          />
        </div>

        <PhTextField
          label={t('newPasswordLabel')}
          obscure
          helper={t('passwordHintRules')}
          error={passErr ?? undefined}
          autoComplete="new-password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            if (passErr) setPassErr(null);
          }}
        />
      </form>
    </AuthScaffold>
  );
}
