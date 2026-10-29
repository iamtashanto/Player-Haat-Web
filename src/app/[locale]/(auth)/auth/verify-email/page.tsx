'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { PhButton, PhOtpField, showPhToast } from '@/design-system';
import { AuthScaffold, LanguageChip } from '@/components/auth/auth-widgets';
import { useAuth } from '@/lib/auth-context';
import { getErrorMessageKey } from '@/lib/errors';
import { toLocaleDigits } from '@/lib/format';

export default function VerifyEmailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    me,
    verifyEmailCode,
    resendVerificationEmail,
    getPostAuthRedirect,
  } = useAuth();

  const email = searchParams.get('email') || me?.email || '';
  const nextParam = searchParams.get('next');

  const [code, setCode] = useState('');
  const [wait, setWait] = useState(60);
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setInterval(() => {
      setWait((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [wait]);

  const finishAndLeave = () => {
    router.push(getPostAuthRedirect(me, nextParam));
  };

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || busy || !email) return;
    setWrong(false);
    setBusy(true);
    try {
      await verifyEmailCode(email, codeToVerify);
      showPhToast(t('emailVerified'), 'success');
      finishAndLeave();
    } catch (err) {
      setWrong(true);
      setCode('');
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (busy || wait > 0) return;
    setBusy(true);
    try {
      await resendVerificationEmail();
      setWait(60);
      showPhToast(t('codeSent'), 'success');
    } catch (err) {
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title={t('verifyEmailTitle')}
      subtitle={t('verifyEmailSubtitle', { email: email || 'your@email.com' })}
      leadingExtra={<LanguageChip />}
      footer={
        <div className="space-y-2">
          <PhButton
            label={t('verifyAndContinue')}
            loading={busy}
            disabled={code.length !== 6}
            onPressed={() => handleVerify(code)}
          />
          <PhButton
            label={t('verifyLater')}
            variant="ghost"
            onPressed={finishAndLeave}
          />
        </div>
      }
    >
      <div className="space-y-6">
        <PhOtpField
          value={code}
          onChange={(v) => {
            setCode(v);
            if (wrong) setWrong(false);
          }}
          onCompleted={(completedCode) => {
            void handleVerify(completedCode);
          }}
          error={wrong}
          enabled={!busy}
        />

        <div className="flex justify-center">
          {wait > 0 ? (
            <p className="tx-footnote">
              {t('otpResendIn', {
                seconds: toLocaleDigits(String(wait), locale),
              })}
            </p>
          ) : (
            <PhButton
              label={t('otpResend')}
              variant="ghost"
              size="small"
              expand={false}
              disabled={busy}
              onPressed={handleResend}
            />
          )}
        </div>
      </div>
    </AuthScaffold>
  );
}

