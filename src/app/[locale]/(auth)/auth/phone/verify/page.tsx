'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import {
  PhButton,
  PhOtpField,
  PhTextField,
  showPhToast,
} from '@/design-system';
import {
  AdminBlockedBanner,
  AuthScaffold,
  LanguageChip,
} from '@/components/auth/auth-widgets';
import { useAuth } from '@/lib/auth-context';
import {
  formatBdPhoneDisplay,
  looksLikeBdMobile,
  nationalDigits,
} from '@/lib/auth-schemas';
import { ApiException, getErrorMessageKey } from '@/lib/errors';
import { toLocaleDigits } from '@/lib/format';

export default function PhoneVerifyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPhone = searchParams.get('phone') || '';
  const nextParam = searchParams.get('next');
  const phone = nationalDigits(rawPhone);

  const {
    signupRole,
    requestPhoneOtp,
    verifyPhoneOtp,
    adminBlockedMessage,
    clearAdminBlocked,
    getPostAuthRedirect,
  } = useAuth();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [wait, setWait] = useState(60);
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  // Redirect back to `/auth/phone` if phone query param is missing or invalid
  useEffect(() => {
    if (!looksLikeBdMobile(phone)) {
      router.replace('/auth/phone');
    }
  }, [phone, router]);

  // 60-second resend countdown timer — 1:1 with `_PhoneVerifyScreenState._startCountdown`
  useEffect(() => {
    if (wait <= 0) return;
    const id = setInterval(() => {
      setWait((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [wait]);

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || busy) return;
    setWrong(false);
    setBusy(true);
    try {
      const { me } = await verifyPhoneOtp({
        phone,
        code: codeToVerify,
        name: name.trim() || undefined,
        role: signupRole,
        locale,
      });
      router.push(getPostAuthRedirect(me, nextParam));
    } catch (err) {
      setWrong(true);
      if (!(err instanceof ApiException && err.code === 'AUTH_OTP_COOLDOWN')) {
        setCode('');
      }
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
      await requestPhoneOtp(phone, locale);
      setCode('');
      setWrong(false);
      setWait(60);
      showPhToast(t('codeSent'), 'success');
    } catch (err) {
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  const displayPhone = formatBdPhoneDisplay(phone);

  return (
    <AuthScaffold
      title={t('otpTitle')}
      subtitle={t('otpSubtitle', {
        phone: toLocaleDigits(displayPhone, locale),
      })}
      backHref="/auth/phone"
      leadingExtra={<LanguageChip />}
      footer={
        <PhButton
          label={t('verifyAndContinue')}
          loading={busy}
          disabled={code.length !== 6}
          onPressed={() => handleVerify(code)}
        />
      }
    >
      <div className="space-y-6">
        {adminBlockedMessage && (
          <AdminBlockedBanner onDismiss={clearAdminBlocked} />
        )}

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

        <PhTextField
          label={t('nameLabel')}
          placeholder={t('optionalNameHint')}
          value={name}
          onChange={(val) => setName(val)}
          autoComplete="name"
        />

        <div className="flex flex-col items-center gap-1 pt-2">
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

          <PhButton
            label={t('otpChangeNumber')}
            variant="ghost"
            size="small"
            expand={false}
            onPressed={() => router.push('/auth/phone')}
          />
        </div>
      </div>
    </AuthScaffold>
  );
}
