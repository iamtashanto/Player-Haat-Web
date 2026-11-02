'use client';

import React, { useState } from 'react';
import { PartyPopper, Star } from 'lucide-react';
import { PhAvatar, PhButton, PhCard, PhTextField, RatingInput } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { usePendingRatings, useSubmitRatings } from '@/lib/api/ratings';
import { ConfirmSheet } from '@/components/app/actions';
import { QueryState, Screen, useFmt } from '@/components/app/kit';

type Target = { applicationId: string | null; name: string; avatarUrl: string | null };

function RateCard({ requestId, asCaptain, isPaid, target }: { requestId: string; asCaptain: boolean; isPaid: boolean; target: Target }) {
  const { t, fail, ok } = useFmt();
  const submit = useSubmitRatings();
  const keys = asCaptain ? ['skill', 'punctuality', 'behavior'] : ['behavior', 'organization', ...(isPaid ? ['payment'] : [])];
  const labelKey: Record<string, string> = { skill: 'scoreSkill', punctuality: 'scorePunctuality', behavior: 'scoreBehavior', organization: 'scoreOrganization', payment: 'scorePayment' };
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [noShow, setNoShow] = useState(false);
  const [done, setDone] = useState(false);

  const send = async (isNoShow: boolean) => {
    try {
      await submit.mutateAsync({ requestId, body: { applicationId: target.applicationId ?? undefined, scores: isNoShow ? undefined : scores, comment: isNoShow ? undefined : comment.trim() || undefined, noShow: isNoShow || undefined } });
      setDone(true);
      ok(t('rated'));
    } catch (e) {
      fail(e);
    } finally {
      setNoShow(false);
    }
  };

  if (done) {
    return (
      <PhCard paddingClassName="p-4">
        <div className="flex items-center gap-3">
          <PhAvatar name={target.name} url={target.avatarUrl} size={40} />
          <span className="tx-headline flex-1">{target.name}</span>
          <span className="tx-subhead text-[var(--ph-accent)]">{t('ratedLabel')}</span>
        </div>
      </PhCard>
    );
  }
  const complete = keys.every((k) => (scores[k] ?? 0) > 0);
  return (
    <PhCard paddingClassName="p-4">
      <div className="flex items-center gap-3">
        <PhAvatar name={target.name} url={target.avatarUrl} size={48} />
        <span className="tx-headline">{target.name}</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {keys.map((k) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <span className="tx-subhead-strong">{t(labelKey[k]!)}</span>
            <RatingInput value={scores[k] ?? 0} onChanged={(v) => setScores((s) => ({ ...s, [k]: v }))} semanticLabel={t('tapToRate')} />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <PhTextField placeholder={t('rateComment')} multiline rows={2} maxLength={500} value={comment} onChange={setComment} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PhButton label={t('rateSubmit')} icon={<Star className="h-4 w-4" />} expand={false} disabled={!complete} loading={submit.isPending} onPressed={() => void send(false)} />
        {asCaptain && target.applicationId && <PhButton label={t('rateNoShow')} variant="destructive" expand={false} onPressed={() => setNoShow(true)} />}
      </div>
      <ConfirmSheet open={noShow} onOpenChange={setNoShow} title={t('rateNoShowTitle')} body={t('rateNoShowBody')} confirmLabel={t('rateNoShowConfirm')} destructive loading={submit.isPending} onConfirm={() => void send(true)} />
    </PhCard>
  );
}

/** Rate everyone from a finished game: players rate the captain, captains rate each accepted player. */
export default function RateView({ requestId }: { requestId: string }) {
  const { t } = useFmt();
  const router = useRouter();
  const q = usePendingRatings();
  const pending = q.data?.find((p) => (p.request as { id?: string }).id === requestId);
  return (
    <Screen title={t('rateTitle')} back>
      <div className="mx-auto max-w-xl">
        <QueryState
          query={q}
          isEmpty={!pending}
          emptyIcon={<PartyPopper className="h-6 w-6" />}
          emptyTitle={t('nothingToRate')}
          emptyMessage={t('rateAllSet')}
          emptyAction={{ label: t('goBack'), onAction: () => router.push('/games') }}
        >
          {pending && (
            <div className="flex flex-col gap-3">
              <p className="tx-subhead">{t('rateRemaining', { count: pending.targets.length })}</p>
              {pending.targets.map((target) => (
                <RateCard key={target.applicationId ?? 'captain'} requestId={requestId} asCaptain={pending.role === 'CAPTAIN'} isPaid={Boolean((pending.request as { isPaid?: boolean }).isPaid)} target={target} />
              ))}
            </div>
          )}
        </QueryState>
      </div>
    </Screen>
  );
}
