'use client';

import React, { useState } from 'react';
import { Share2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  GlassContainer,
  PhButton,
  PhCard,
  PhGlassSheet,
  PhRadius,
  PhTextField,
  showPhToast,
} from '@/design-system';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { getErrorMessageKey } from '@/lib/errors';

export function PublicRequestActions({
  requestId,
  sportName,
  whenText,
  whereText,
  shareUrl,
  isPaid,
  offeredBudgetText,
  status,
}: {
  requestId: string;
  sportName: string;
  whenText: string;
  whereText: string;
  shareUrl: string;
  isPaid: boolean;
  offeredBudgetText: string;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'COMPLETED';
}) {
  const t = useTranslations();
  const router = useRouter();
  const { status: authStatus, me, activeRole } = useAuth();

  const [applySheetOpen, setApplySheetOpen] = useState(false);
  const [proposedRate, setProposedRate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  const isPlayerSignedIn =
    authStatus === 'authenticated' &&
    (me?.role === 'PLAYER' || activeRole === 'PLAYER');

  const handleShare = async () => {
    const text = t('shareRequestText', {
      sport: sportName,
      when: whenText,
      where: whereText,
      url: shareUrl,
    });
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: sportName, text, url: shareUrl });
        return;
      } catch {
        // fallback
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      showPhToast(t('linkCopied'), 'success');
    }
  };

  const handleSubmitApplication = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const rateNum =
        isPaid && proposedRate.trim().length > 0
          ? Number.parseInt(proposedRate.trim(), 10)
          : undefined;

      await apiRequest(`/requests/${encodeURIComponent(requestId)}/applications`, {
        method: 'POST',
        body: {
          ...(rateNum !== undefined && !Number.isNaN(rateNum)
            ? { proposedRate: rateNum }
            : {}),
          ...(message.trim() ? { message: message.trim() } : {}),
        },
      });
      setApplied(true);
      setApplySheetOpen(false);
      showPhToast(t('applied'), 'success');
    } catch (err) {
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <GlassContainer
        radius={PhRadius.lg}
        className="flex flex-wrap items-center justify-between gap-3 p-3.5"
      >
        <div className="flex items-center gap-2.5">
          <Smartphone className="h-5 w-5 text-[var(--ph-accent)]" />
          <div>
            <div className="tx-subhead-strong">{t('openInAppBannerTitle')}</div>
            <div className="tx-caption">{t('openInAppBannerBody')}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={`playerhaat://open/r/${encodeURIComponent(requestId)}`}>
            <PhButton
              label={t('openInApp')}
              variant="secondary"
              size="small"
              expand={false}
            />
          </a>
          <PhButton
            label={t('share')}
            icon={<Share2 className="h-4 w-4" />}
            variant="ghost"
            size="small"
            expand={false}
            onPressed={handleShare}
          />
        </div>
      </GlassContainer>

      {status === 'OPEN' && (
        <PhCard className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="tx-subhead-strong text-[var(--ph-text)]">
              {applied ? t('youApplied') : t('applyNow')}
            </div>
            <p className="mt-0.5 tx-footnote">
              {isPaid && offeredBudgetText
                ? t('applyRateHint', { range: offeredBudgetText })
                : t('freeGame')}
            </p>
          </div>

          {applied ? (
            <PhButton
              label={t('applied')}
              variant="secondary"
              size="medium"
              expand={false}
              disabled
            />
          ) : isPlayerSignedIn ? (
            <PhButton
              label={t('applyNow')}
              variant="primary"
              size="medium"
              expand={false}
              onPressed={() => setApplySheetOpen(true)}
            />
          ) : (
            <PhButton
              label={t('applyNow')}
              variant="primary"
              size="medium"
              expand={false}
              onPressed={() =>
                router.push(`/auth?next=${encodeURIComponent(`/r/${requestId}`)}`)
              }
            />
          )}
        </PhCard>
      )}

      {/* Apply Glass Sheet — 1:1 with `_ApplySheet` in `request_detail_screen.dart` */}
      <PhGlassSheet
        open={applySheetOpen}
        onOpenChange={setApplySheetOpen}
        title={t('applySheetTitle')}
      >
        <form onSubmit={handleSubmitApplication} className="space-y-4">
          {isPaid && (
            <PhTextField
              label={t('applyRateLabel')}
              hint={
                offeredBudgetText
                  ? t('applyRateHint', { range: offeredBudgetText })
                  : undefined
              }
              type="number"
              inputMode="numeric"
              maxLength={7}
              value={proposedRate}
              onChange={(val) => setProposedRate(val.replace(/\D/g, ''))}
            />
          )}

          <PhTextField
            label={t('applyMessageLabel')}
            hint={t('applyMessageHint')}
            multiline
            rows={3}
            maxLength={300}
            value={message}
            onChange={(val) => setMessage(val)}
          />

          <div className="pt-2">
            <PhButton
              label={t('sendApplication')}
              loading={submitting}
              onPressed={() => handleSubmitApplication()}
            />
          </div>
        </form>
      </PhGlassSheet>
    </div>
  );
}

