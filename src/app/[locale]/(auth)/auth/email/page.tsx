'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import {
  PhButton,
  PhSegmented,
  PhTextField,
  showPhToast,
} from '@/design-system';
import {
  AccountTypePicker,
  AdminBlockedBanner,
  AuthScaffold,
  LanguageChip,
} from '@/components/auth/auth-widgets';
import { useAuth } from '@/lib/auth-context';
import { looksLikeEmail, passwordProblemKey } from '@/lib/auth-schemas';
import { getErrorMessageKey } from '@/lib/errors';

export default function EmailAuthPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const {
    signupRole,
    signInWithEmail,
    registerWithEmail,
    adminBlockedMessage,
    clearAdminBlocked,
    getPostAuthRedirect,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signup';

  const validate = (): boolean => {
    const nextNameErr =
      isSignUp && name.trim().length === 0 ? t('nameRequired') : null;
    const nextEmailErr = looksLikeEmail(email) ? null : t('emailInvalid');
    let nextPassErr: string | null = null;
    if (isSignUp) {
      const prob = passwordProblemKey(password);
      nextPassErr = prob ? t(prob) : null;
    } else if (password.length === 0) {
      nextPassErr = t('passwordRequiredField');
    }

    setNameErr(nextNameErr);
    setEmailErr(nextEmailErr);
    setPassErr(nextPassErr);

    return !nextNameErr && !nextEmailErr && !nextPassErr;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate() || busy) return;

    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (isSignUp) {
        const me = await registerWithEmail({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: signupRole,
          locale,
        });
        const postRedirect = getPostAuthRedirect(me, nextParam);
        const verifyQuery = new URLSearchParams({
          email: normalizedEmail,
          next: postRedirect,
        });
        router.push(`/auth/verify-email?${verifyQuery.toString()}`);
      } else {
        const me = await signInWithEmail({
          email: normalizedEmail,
          password,
          locale,
        });
        router.push(getPostAuthRedirect(me, nextParam));
      }
    } catch (err) {
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold
      title={isSignUp ? t('emailTitleSignUp') : t('emailTitleSignIn')}
      leadingExtra={<LanguageChip />}
      footer={
        <PhButton
          label={isSignUp ? t('createAccount') : t('signIn')}
          loading={busy}
          onPressed={() => handleSubmit()}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {adminBlockedMessage && (
          <AdminBlockedBanner onDismiss={clearAdminBlocked} />
        )}

        <PhSegmented<'signin' | 'signup'>
          options={{
            signin: t('signInTab'),
            signup: t('signUpTab'),
          }}
          value={mode}
          onChanged={(nextMode) => {
            setMode(nextMode);
            setNameErr(null);
            setEmailErr(null);
            setPassErr(null);
          }}
        />

        {isSignUp && (
          <>
            <div>
              <div className="mb-2 tx-overline">{t('accountTypeTitle')}</div>
              <AccountTypePicker showDescription />
            </div>

            <PhTextField
              label={t('nameLabel')}
              placeholder={t('nameHint')}
              value={name}
              error={nameErr ?? undefined}
              autoComplete="name"
              onChange={(val) => {
                setName(val);
                if (nameErr) setNameErr(null);
              }}
            />
          </>
        )}

        <PhTextField
          label={t('emailLabel')}
          placeholder="you@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          error={emailErr ?? undefined}
          onChange={(val) => {
            setEmail(val);
            if (emailErr) setEmailErr(null);
          }}
        />

        <PhTextField
          label={t('passwordLabel')}
          obscure
          helper={isSignUp ? t('passwordHintRules') : undefined}
          error={passErr ?? undefined}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          value={password}
          onChange={(val) => {
            setPassword(val);
            if (passErr) setPassErr(null);
          }}
        />

        {!isSignUp && (
          <div className="flex justify-start">
            <PhButton
              label={t('forgotPassword')}
              variant="ghost"
              size="small"
              expand={false}
              onPressed={() =>
                router.push(
                  email.trim()
                    ? `/auth/forgot-password?email=${encodeURIComponent(email.trim())}`
                    : '/auth/forgot-password',
                )
              }
            />
          </div>
        )}
      </form>
    </AuthScaffold>
  );
}
