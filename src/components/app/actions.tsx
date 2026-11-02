'use client';

import React, { useState } from 'react';
import { Copy, Flag, Lock, MessageCircle, Phone, Send } from 'lucide-react';
import { PhBottomSheet, PhButton, PhChip, PhCard, PhTextField, showPhToast } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { ApiException } from '@/lib/errors';
import { useContactStatus, useReport, useRevealContact, useSendInvite } from '@/lib/api/social';
import { useMyRequestsList } from '@/lib/api/requests';
import { useOpenConversation } from '@/lib/api/chat';
import { useFmt } from './kit';

/** A confirm dialog: bottom sheet on phones, centred dialog on desktop (same component as every other sheet). */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  body?: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}) {
  const { t } = useFmt();
  return (
    <PhBottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {body && <p className="tx-body text-[var(--ph-text-secondary)]">{body}</p>}
      <div className="mt-6 flex gap-3">
        <PhButton label={t('cancel')} variant="secondary" onPressed={() => onOpenChange(false)} />
        <PhButton label={confirmLabel} variant={destructive ? 'destructive' : 'primary'} loading={loading} onPressed={onConfirm} />
      </div>
    </PhBottomSheet>
  );
}

/** Credits gate: when a paid action fails with CREDITS_REQUIRED, send people to the wallet instead of showing a dead end. */
export function useCreditsGate() {
  const { t, fail } = useFmt();
  const router = useRouter();
  const [needCredits, setNeedCredits] = useState(false);
  const handle = (e: unknown) => {
    if (e instanceof ApiException && e.code === 'CREDITS_REQUIRED') setNeedCredits(true);
    else fail(e);
  };
  const sheet = (
    <PhBottomSheet open={needCredits} onOpenChange={setNeedCredits} title={t('needCreditsTitle')}>
      <p className="tx-body text-[var(--ph-text-secondary)]">{t('needCreditsBody')}</p>
      <div className="mt-6">
        <PhButton label={t('walletBuy')} onPressed={() => router.push('/wallet')} />
      </div>
    </PhBottomSheet>
  );
  return { handle, sheet };
}

/** Phone number: tap to reveal (free allowance, then credits), copy and call. */
export function ContactReveal({ profileId }: { profileId: string }) {
  const { t, num, ok } = useFmt();
  const status = useContactStatus(profileId);
  const reveal = useRevealContact();
  const gate = useCreditsGate();
  const [phone, setPhone] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const c = status.data;
  if (!c || c.state === 'SELF') return null;

  const showNumber = async () => {
    try {
      const r = await reveal.mutateAsync(profileId);
      setPhone(r.phone ?? '');
      setConfirm(false);
    } catch (e) {
      setConfirm(false);
      gate.handle(e);
    }
  };

  if (!c.hasPhone) return <p className="tx-footnote text-[var(--ph-text-tertiary)]">{t('contactNoPhone')}</p>;

  if (c.state === 'LOCKED' && !phone) {
    return (
      <PhCard paddingClassName="p-4">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-[var(--ph-text-tertiary)]" aria-hidden />
          <div>
            <div className="tx-headline">{t('contactLockedTitle')}</div>
            <p className="tx-subhead mt-0.5">{t('contactLockedBody')}</p>
          </div>
        </div>
      </PhCard>
    );
  }

  if (phone) {
    return (
      <PhCard paddingClassName="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Phone className="h-5 w-5 text-[var(--ph-accent)]" aria-hidden />
          <span className="tx-headline flex-1 select-all" dir="ltr">{phone}</span>
          <PhButton label={t('call')} size="small" expand={false} onPressed={() => (window.location.href = `tel:${phone}`)} />
          <PhButton
            label={t('payCopyNumber')}
            icon={<Copy className="h-4 w-4" />}
            size="small"
            variant="secondary"
            expand={false}
            onPressed={() => void navigator.clipboard.writeText(phone).then(() => ok(t('contactCopied')))}
          />
        </div>
      </PhCard>
    );
  }

  const free = c.freeLeftToday ?? 0;
  const paidView = c.cost > 0 && free <= 0 && !c.alreadyRevealed;
  return (
    <>
      <PhButton
        label={paidView ? t('contactShowCost', { n: num(c.cost) }) : t('contactShow')}
        icon={<Phone className="h-5 w-5" />}
        loading={reveal.isPending}
        onPressed={() => (paidView ? setConfirm(true) : void showNumber())}
      />
      {free > 0 && <p className="tx-footnote mt-1 text-center text-[var(--ph-text-tertiary)]">{t('contactFreeLeft', { n: num(free) })}</p>}
      <ConfirmSheet open={confirm} onOpenChange={setConfirm} title={t('contactConfirmTitle')} body={t('contactConfirmBody')} confirmLabel={t('contactShowCost', { n: num(c.cost) })} loading={reveal.isPending} onConfirm={() => void showNumber()} />
      {gate.sheet}
    </>
  );
}

/** Recruiters invite a player to one of their open requests (or just say hello). */
export function InviteSheet({ open, onOpenChange, profileId, sportId }: { open: boolean; onOpenChange: (o: boolean) => void; profileId: string; sportId?: number }) {
  const { t, fail, ok, date } = useFmt();
  const mine = useMyRequestsList('OPEN');
  const invite = useSendInvite();
  const [requestId, setRequestId] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const submit = async () => {
    try {
      await invite.mutateAsync({ profileId, sportId, requestId, message: message.trim() || undefined });
      ok(t('inviteSentToast'));
      onOpenChange(false);
      setMessage('');
    } catch (e) {
      fail(e);
    }
  };
  return (
    <PhBottomSheet open={open} onOpenChange={onOpenChange} title={t('inviteSheetTitle')}>
      <div className="tx-subhead-strong mb-2">{t('inviteForEvent')}</div>
      {mine.items.length === 0 ? (
        <p className="tx-subhead">{t('inviteNoEvent')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {mine.items.map((r) => (
            <PhChip key={r.id} label={`${r.title ?? date(r.matchAt)}`} selected={requestId === r.id} onTap={() => setRequestId(requestId === r.id ? undefined : r.id)} />
          ))}
        </div>
      )}
      <div className="mt-4">
        <PhTextField placeholder={t('inviteMessageHint')} multiline rows={3} maxLength={300} value={message} onChange={setMessage} />
      </div>
      <div className="mt-5">
        <PhButton label={t('inviteSend')} icon={<Send className="h-4 w-4" />} loading={invite.isPending} disabled={!requestId} onPressed={() => void submit()} />
      </div>
    </PhBottomSheet>
  );
}

const REASONS = [
  ['FAKE_PROFILE', 'reportReasonFakeProfile'],
  ['HARASSMENT', 'reportReasonHarassment'],
  ['SPAM', 'reportReasonSpam'],
  ['SCAM_OR_PAYMENT', 'reportReasonScam'],
  ['INAPPROPRIATE_CONTENT', 'reportReasonInappropriate'],
  ['FALSE_NO_SHOW', 'reportReasonFalseNoShow'],
  ['OTHER', 'reportReasonOther'],
] as const;

export function ReportSheet({ open, onOpenChange, targetType, targetId }: { open: boolean; onOpenChange: (o: boolean) => void; targetType: 'PLAYER_PROFILE' | 'REQUEST' | 'TEAM' | 'CONVERSATION'; targetId: string }) {
  const { t, fail, ok } = useFmt();
  const report = useReport();
  const [reason, setReason] = useState<(typeof REASONS)[number][0] | null>(null);
  const [details, setDetails] = useState('');
  const submit = async () => {
    if (!reason) return;
    try {
      await report.mutateAsync({ targetType, targetId, reason, details: details.trim() || undefined });
      ok(t('reportSent'));
      onOpenChange(false);
    } catch (e) {
      fail(e);
    }
  };
  return (
    <PhBottomSheet open={open} onOpenChange={onOpenChange} title={t('reportTitle')}>
      <div className="flex flex-wrap gap-2">
        {REASONS.map(([code, key]) => (
          <PhChip key={code} label={t(key)} selected={reason === code} onTap={() => setReason(code)} />
        ))}
      </div>
      <div className="mt-4">
        <PhTextField label={t('reportDetails')} placeholder={t('reportDetailsHint')} multiline rows={3} maxLength={500} value={details} onChange={setDetails} />
      </div>
      <div className="mt-5">
        <PhButton label={t('reportAction')} icon={<Flag className="h-4 w-4" />} variant="destructive" loading={report.isPending} disabled={!reason} onPressed={() => void submit()} />
      </div>
    </PhBottomSheet>
  );
}

/** Open (or reuse) a conversation with a player/recruiter and go to it. */
export function useStartChat() {
  const router = useRouter();
  const open = useOpenConversation();
  const { fail } = useFmt();
  return {
    pending: open.isPending,
    start: async (target: { profileId?: string; recruiterId?: string }) => {
      try {
        const c = await open.mutateAsync(target);
        router.push(`/chat/${c.id}`);
      } catch (e) {
        fail(e);
      }
    },
  };
}

export { MessageCircle, showPhToast };
