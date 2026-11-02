'use client';

import React, { useState } from 'react';
import { CalendarClock, Check, Flag, MapPin, Share2, Sparkles, Star, Users, X } from 'lucide-react';
import { ErrorState, PhAvatar, PhBadge, PhButton, PhCard, PhBottomSheet, PhTextField, RatingPill, Skeleton } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useAppConfig } from '@/lib/api/app-config';
import { useApplicationAction, useApply, useRequest, useRequestAction, useRequestApplicationsList } from '@/lib/api/requests';
import { useWallet } from '@/lib/api/billing';
import { ConfirmSheet, ReportSheet, useCreditsGate, useStartChat } from '@/components/app/actions';
import { RequestCard, requestTone, statusKey, useSports } from '@/components/app/cards';
import { LoadMore, Screen, SectionTitle, useFmt } from '@/components/app/kit';

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-[var(--ph-text-tertiary)]">{icon}</span>
      <div className="min-w-0">
        <div className="tx-footnote text-[var(--ph-text-tertiary)]">{label}</div>
        <div className="tx-body text-[var(--ph-text)]">{children}</div>
      </div>
    </div>
  );
}

function Applicants({ requestId, isEvent, canAct }: { requestId: string; isEvent: boolean; canAct: boolean }) {
  const { t, num, money, fail, ok, locale } = useFmt();
  const router = useRouter();
  const list = useRequestApplicationsList(requestId);
  const act = useApplicationAction();
  const chat = useStartChat();
  const decide = async (a: { id: string }, action: 'accept' | 'reject') => {
    try {
      await act.mutateAsync({ id: a.id, action });
      ok(t(action === 'accept' ? 'acceptedToast' : 'rejectedToast'));
    } catch (e) {
      fail(e);
    }
  };
  const visible = list.items.flatMap((a) => (a.status !== 'WITHDRAWN' && a.player ? [{ ...a, player: a.player }] : []));
  return (
    <>
      <SectionTitle>{t(isEvent ? 'applicantsInterested' : 'applicantsTitle')}</SectionTitle>
      {list.isLoading ? (
        <Skeleton height={72} radius={22} />
      ) : visible.length === 0 ? (
        <p className="tx-subhead">{t(isEvent ? 'interestedNone' : 'noApplicantsBody')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => (
            <PhCard key={a.id} onTap={() => router.push(`/player/${a.player.id}`)} paddingClassName="p-4">
              <div className="flex items-center gap-3">
                <PhAvatar name={a.player.name} url={a.player.avatarUrl} size={48} verified={a.player.verifiedBadge} />
                <div className="min-w-0 flex-1">
                  <div className="tx-headline truncate">{a.player.name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <RatingPill average={a.player.rating.average} count={a.player.rating.count} emptyLabel={t('newPlayerLabel')} />
                    {a.proposedRate != null && <span className="tx-footnote">{t('proposedRateLabel', { amount: money(a.proposedRate) })}</span>}
                  </div>
                </div>
                {a.status !== 'PENDING' && (
                  <PhBadge tone={a.status === 'ACCEPTED' ? 'accent' : 'neutral'} label={t(a.status === 'ACCEPTED' ? 'appAccepted' : 'appRejected')} />
                )}
              </div>
              {a.message && <p className="tx-subhead mt-2">{a.message}</p>}
              {a.status === 'ACCEPTED' && (
                <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  {a.contact?.phone && <PhButton label={t('call')} size="small" expand={false} onPressed={() => (window.location.href = `tel:${a.contact!.phone}`)} />}
                  <PhButton label={t('chatAction')} size="small" variant="secondary" expand={false} loading={chat.pending} onPressed={() => void chat.start({ profileId: a.player.id })} />
                </div>
              )}
              {canAct && a.status === 'PENDING' && !isEvent && (
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <PhButton label={t('accept')} icon={<Check className="h-4 w-4" />} size="small" loading={act.isPending} onPressed={() => void decide(a, 'accept')} />
                  <PhButton label={t('reject')} icon={<X className="h-4 w-4" />} size="small" variant="secondary" onPressed={() => void decide(a, 'reject')} />
                </div>
              )}
            </PhCard>
          ))}
          <LoadMore hasNext={!!list.hasNextPage} loading={list.isFetchingNextPage} onMore={() => void list.fetchNextPage()} />
        </div>
      )}
      <span hidden>{num(0)}{locale}</span>
    </>
  );
}

export default function RequestDetailView({ id }: { id: string }) {
  const { t, name, date, time, money, num, fail, ok } = useFmt();
  const router = useRouter();
  const { me } = useAuth();
  const q = useRequest(id);
  const cfg = useWallet();
  const appCfg = useAppConfig();
  const act = useRequestAction();
  const apply = useApply();
  const appAct = useApplicationAction();
  const gate = useCreditsGate();
  const { positionNames } = useSports();
  const [confirm, setConfirm] = useState<null | 'cancel' | 'fill' | 'complete' | 'boost'>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [report, setReport] = useState(false);
  const [rate, setRate] = useState('');
  const [message, setMessage] = useState('');
  const [withdraw, setWithdraw] = useState(false);
  const r = q.data;

  if (q.isLoading) {
    return (
      <Screen title="" back large={false}>
        <Skeleton height={160} radius={22} />
      </Screen>
    );
  }
  if (q.isError || !r) {
    return (
      <Screen title={t('requestTitle')} back large={false}>
        <ErrorState title={t('requestMissingTitle')} retryLabel={t('retry')} onRetry={() => void q.refetch()} />
      </Screen>
    );
  }

  const isEvent = r.kind === 'EVENT';
  const open = r.status === 'OPEN';
  const mine = r.myApplication;
  const active = mine && (mine.status === 'PENDING' || mine.status === 'ACCEPTED');
  const budget = r.isPaid ? (r.budgetMin != null && r.budgetMax != null ? `${money(r.budgetMin)}–${num(r.budgetMax)}` : r.budgetMax != null ? t('upTo', { amount: money(r.budgetMax) }) : r.budgetMin != null ? `${money(r.budgetMin)}+` : t('paidGame')) : t('freeGame');
  const matchStarted = new Date(r.matchAt).getTime() <= Date.now();
  const boostCost = cfg.data?.pricing.boostCreditCost;
  const boostEnabled = appCfg.data?.flags.boost_enabled && (boostCost ?? 0) > 0;
  const needsPlayerProfile = !r.isOwner && !me?.hasPlayerProfile;

  const run = async (action: 'cancel' | 'fill' | 'complete' | 'boost') => {
    try {
      await act.mutateAsync({ id, action });
      setConfirm(null);
      ok(t({ cancel: 'requestCancelledToast', fill: 'requestFilledToast', complete: 'requestCompletedToast', boost: 'boostedToast' }[action]));
    } catch (e) {
      setConfirm(null);
      if (action === 'boost') gate.handle(e);
      else fail(e);
    }
  };

  const submitApply = async () => {
    try {
      await apply.mutateAsync({ requestId: id, body: { proposedRate: rate ? Number(rate) : undefined, message: message.trim() || undefined } });
      setApplyOpen(false);
      ok(t('applied'));
    } catch (e) {
      fail(e);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/${document.documentElement.lang || 'bn'}/r/${r.id}`;
    try {
      if (navigator.share) await navigator.share({ title: r.title ?? name(r.sport), text: t('shareRequestText'), url });
      else {
        await navigator.clipboard.writeText(url);
        ok(t('linkCopied'));
      }
    } catch {
      /* dismissed */
    }
  };

  const banners: { key: string; tone: 'accent' | 'warning' | 'danger' }[] = [];
  if (mine?.status === 'ACCEPTED') banners.push({ key: 'applicationAcceptedBanner', tone: 'accent' });
  if (mine?.status === 'REJECTED') banners.push({ key: 'applicationRejectedBanner', tone: 'warning' });
  if (r.status === 'CANCELLED') banners.push({ key: 'requestCancelledBanner', tone: 'danger' });
  if (r.status === 'FILLED') banners.push({ key: 'requestFilledBanner', tone: 'accent' });
  if (r.status === 'COMPLETED') banners.push({ key: 'requestCompletedBanner', tone: 'accent' });

  const playerAction =
    !r.isOwner && open ? (
      needsPlayerProfile ? (
        <PhButton label={t('createProfileCta')} onPressed={() => router.push('/setup')} />
      ) : active ? (
        <PhButton label={isEvent ? t('interestedRemove') : t('withdrawApplication')} variant="secondary" onPressed={() => setWithdraw(true)} />
      ) : (
        <PhButton
          label={isEvent ? t('interestedAction') : t('applyNow')}
          loading={apply.isPending}
          onPressed={() => (isEvent ? void submitApply() : setApplyOpen(true))}
        />
      )
    ) : null;

  const ownerActions = r.isOwner ? (
    <div className="flex flex-col gap-2">
      {open && boostEnabled && (
        <PhButton label={r.boostedUntil ? t('boostActiveUntil', { when: `${date(r.boostedUntil)} ${time(r.boostedUntil)}` }) : t('boostAction')} icon={<Sparkles className="h-4 w-4" />} variant="secondary" onPressed={() => setConfirm('boost')} />
      )}
      {open && !isEvent && <PhButton label={t('markFilled')} variant="secondary" onPressed={() => setConfirm('fill')} />}
      {(open || r.status === 'FILLED') && matchStarted && <PhButton label={t('markCompleted')} onPressed={() => setConfirm('complete')} />}
      {r.status === 'COMPLETED' && <PhButton label={t('rateTitle')} icon={<Star className="h-4 w-4" />} onPressed={() => router.push(`/rate/${r.id}`)} />}
      {(open || r.status === 'FILLED') && <PhButton label={t('cancelRequest')} variant="ghost" onPressed={() => setConfirm('cancel')} />}
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {playerAction}
      {mine?.status === 'ACCEPTED' && r.status === 'COMPLETED' && <PhButton label={t('rateTitle')} icon={<Star className="h-4 w-4" />} onPressed={() => router.push(`/rate/${r.id}`)} />}
    </div>
  );

  return (
    <Screen
      title={isEvent && r.title ? r.title : name(r.sport)}
      back
      large={false}
      actions={<PhButton label={t('share')} icon={<Share2 className="h-4 w-4" />} variant="ghost" size="small" expand={false} onPressed={() => void share()} />}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          {banners.map((b) => (
            <div key={b.key} className="mb-3">
              <PhBadge tone={b.tone} label={t(b.key)} className="!whitespace-normal !rounded-[14px] !px-3 !py-2" />
            </div>
          ))}
          <PhCard paddingClassName="px-4 py-2">
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {isEvent && <PhBadge tone="accent" icon={<Flag className="h-3 w-3" />} label={t('eventLabel')} />}
              <PhBadge tone={requestTone(r.status)} label={t(statusKey(r.status))} />
              <PhBadge tone={r.isPaid ? 'accent' : 'neutral'} label={budget} />
            </div>
            <Row icon={<CalendarClock className="h-5 w-5" />} label={t('labelWhen')}>{date(r.matchAt)} · {time(r.matchAt)}</Row>
            <Row icon={<MapPin className="h-5 w-5" />} label={t('labelWhere')}>{r.venueText} · {name(r.location.upazila)}, {name(r.location.district)}</Row>
            <Row icon={<Users className="h-5 w-5" />} label={t('labelNeeded')}>
              {t('playersNeededCount', { count: r.playersNeeded })} · {r.positionsNeeded.length ? positionNames(r.sport.id, r.positionsNeeded) : t('anyPosition')}
              {open && <span className="text-[var(--ph-text-secondary)]"> · {t('spotsLeftCount', { count: r.spotsLeft })}</span>}
            </Row>
            {r.notes && <Row icon={<Flag className="h-5 w-5" />} label={t('labelNotes')}>{r.notes}</Row>}
          </PhCard>

          {!r.isOwner && (
            <>
              <SectionTitle>{t('labelCaptain')}</SectionTitle>
              <PhCard onTap={r.captain.recruiterId ? () => router.push(`/recruiter/${r.captain.recruiterId}`) : undefined} paddingClassName="p-4">
                <div className="flex items-center gap-3">
                  <PhAvatar name={r.captain.name} url={r.captain.avatarUrl} size={44} verified={r.captain.recruiterVerified} />
                  <div className="min-w-0 flex-1">
                    <div className="tx-headline truncate">{r.captain.name}</div>
                    <RatingPill average={r.captain.rating.average} count={r.captain.rating.count} emptyLabel={t('newPlayerLabel')} />
                  </div>
                </div>
              </PhCard>
            </>
          )}

          <div className="mt-5">{ownerActions}</div>
          {!r.isOwner && <PhButton label={t('reportAction')} icon={<Flag className="h-4 w-4" />} variant="ghost" onPressed={() => setReport(true)} />}
        </div>

        <div className="min-w-0">
          {r.isOwner ? (
            <Applicants requestId={id} isEvent={isEvent} canAct={open} />
          ) : (
            isEvent && r.interested.count > 0 && <p className="tx-subhead">{t('interestedCount', { n: num(r.interested.count) })}</p>
          )}
        </div>
      </div>

      <PhBottomSheet open={applyOpen} onOpenChange={setApplyOpen} title={t('applySheetTitle')}>
        <PhTextField label={t('applyRateLabel')} placeholder={t('applyRateHint')} type="number" inputMode="numeric" value={rate} onChange={setRate} />
        <div className="mt-4">
          <PhTextField label={t('applyMessageLabel')} placeholder={t('applyMessageHint')} multiline rows={3} maxLength={300} value={message} onChange={setMessage} />
        </div>
        <div className="mt-5">
          <PhButton label={t('sendApplication')} loading={apply.isPending} onPressed={() => void submitApply()} />
        </div>
      </PhBottomSheet>

      <ConfirmSheet open={withdraw} onOpenChange={setWithdraw} title={t('withdrawTitle')} body={t('withdrawBody')} confirmLabel={t('withdrawApplication')} destructive loading={appAct.isPending}
        onConfirm={async () => {
          try {
            await appAct.mutateAsync({ id: mine!.id, action: 'withdraw' });
            setWithdraw(false);
            ok(t('withdrawnToast'));
          } catch (e) {
            setWithdraw(false);
            fail(e);
          }
        }}
      />
      <ConfirmSheet open={confirm === 'cancel'} onOpenChange={(o) => !o && setConfirm(null)} title={t('cancelRequestTitle')} body={t('cancelRequestBody')} confirmLabel={t('cancelRequest')} destructive loading={act.isPending} onConfirm={() => void run('cancel')} />
      <ConfirmSheet open={confirm === 'fill'} onOpenChange={(o) => !o && setConfirm(null)} title={t('fillTitle')} body={t('fillBody')} confirmLabel={t('markFilled')} loading={act.isPending} onConfirm={() => void run('fill')} />
      <ConfirmSheet open={confirm === 'complete'} onOpenChange={(o) => !o && setConfirm(null)} title={t('completeTitle')} body={t('completeBody')} confirmLabel={t('markCompleted')} loading={act.isPending} onConfirm={() => void run('complete')} />
      <ConfirmSheet open={confirm === 'boost'} onOpenChange={(o) => !o && setConfirm(null)} title={t('boostSheetTitle')} body={t('boostBody', { hours: num(cfg.data?.pricing.boostHours ?? 0) })} confirmLabel={t('boostPay')} loading={act.isPending} onConfirm={() => void run('boost')} />
      <ReportSheet open={report} onOpenChange={setReport} targetType="REQUEST" targetId={r.id} />
      {gate.sheet}
    </Screen>
  );
}

export { RequestCard };
