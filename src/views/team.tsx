'use client';

import React, { useState } from 'react';
import { Copy, RefreshCw, Trash2, UserMinus } from 'lucide-react';
import { ErrorState, PhAvatar, PhBadge, PhButton, PhCard, Skeleton } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useDeleteTeam, useLeaveTeam, useNewJoinCode, useRemoveMember, useTeam } from '@/lib/api/teams';
import { ConfirmSheet } from '@/components/app/actions';
import { Screen, SectionTitle, useFmt } from '@/components/app/kit';

export default function TeamView({ id }: { id: string }) {
  const { t, name, num, fail, ok } = useFmt();
  const router = useRouter();
  const q = useTeam(id);
  const leave = useLeaveTeam();
  const del = useDeleteTeam();
  const reset = useNewJoinCode();
  const remove = useRemoveMember();
  const [confirm, setConfirm] = useState<null | 'leave' | 'delete' | 'reset'>(null);
  const tm = q.data;

  if (q.isLoading) return <Screen title="" back large={false}><Skeleton height={120} radius={22} /></Screen>;
  if (q.isError || !tm) return <Screen title={t('teamsTitle')} back large={false}><ErrorState title={t('errorTitle')} retryLabel={t('retry')} onRetry={() => void q.refetch()} /></Screen>;

  const run = async (fn: () => Promise<unknown>, done?: () => void) => {
    try {
      await fn();
      setConfirm(null);
      done?.();
    } catch (e) {
      setConfirm(null);
      fail(e);
    }
  };

  return (
    <Screen title={tm.name} back large={false}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <PhAvatar name={tm.name} url={tm.logoUrl} size={72} />
          <div className="min-w-0">
            <h1 className="tx-title1 truncate">{tm.name}</h1>
            <p className="tx-subhead">{name(tm.sport)} · {name(tm.location.upazila)}, {name(tm.location.district)}</p>
            <p className="tx-footnote text-[var(--ph-text-tertiary)]">{t('teamMemberCount', { n: num(tm.memberCount) })}</p>
          </div>
        </div>

        {tm.isCaptain && tm.joinCode && (
          <PhCard paddingClassName="p-4" className="mt-5">
            <div className="tx-footnote text-[var(--ph-text-tertiary)]">{t('teamShareCode')}</div>
            <div className="flex items-center gap-3">
              <span className="tx-title1 flex-1 select-all tracking-widest" dir="ltr">{tm.joinCode}</span>
              <PhButton label={t('teamCode')} icon={<Copy className="h-4 w-4" />} size="small" variant="secondary" expand={false} onPressed={() => void navigator.clipboard.writeText(tm.joinCode!).then(() => ok(t('teamCodeCopied')))} />
              <PhButton label={t('teamResetCode')} icon={<RefreshCw className="h-4 w-4" />} size="small" variant="ghost" expand={false} onPressed={() => setConfirm('reset')} />
            </div>
          </PhCard>
        )}

        <SectionTitle>{t('teamMembers')}</SectionTitle>
        <div className="flex flex-col gap-2">
          {tm.members?.map((m) => (
            <PhCard key={m.memberId} onTap={m.profileId ? () => router.push(`/player/${m.profileId}`) : undefined} paddingClassName="p-3">
              <div className="flex items-center gap-3">
                <PhAvatar name={m.name} url={m.avatarUrl} size={40} />
                <span className="tx-headline min-w-0 flex-1 truncate">{m.name}</span>
                {m.role === 'CAPTAIN' && <PhBadge tone="accent" label={t('teamCaptainRole')} />}
                {tm.isCaptain && m.role !== 'CAPTAIN' && (
                  <span onClick={(e) => e.stopPropagation()}>
                    <PhButton label={t('teamRemoveMember')} icon={<UserMinus className="h-4 w-4" />} size="small" variant="ghost" expand={false} onPressed={() => void run(() => remove.mutateAsync({ id, memberId: m.memberId }))} />
                  </span>
                )}
              </div>
            </PhCard>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {tm.isCaptain ? (
            <PhButton label={t('teamDelete')} icon={<Trash2 className="h-4 w-4" />} variant="destructive" onPressed={() => setConfirm('delete')} />
          ) : (
            tm.isMember && <PhButton label={t('teamLeave')} variant="destructive" onPressed={() => setConfirm('leave')} />
          )}
        </div>
      </div>
      <ConfirmSheet open={confirm === 'leave'} onOpenChange={(o) => !o && setConfirm(null)} title={t('teamLeaveTitle')} confirmLabel={t('teamLeave')} destructive loading={leave.isPending} onConfirm={() => void run(() => leave.mutateAsync(id), () => router.replace('/teams'))} />
      <ConfirmSheet open={confirm === 'delete'} onOpenChange={(o) => !o && setConfirm(null)} title={t('teamDeleteTitle')} body={t('teamDeleteBody')} confirmLabel={t('teamDelete')} destructive loading={del.isPending} onConfirm={() => void run(() => del.mutateAsync(id), () => router.replace('/teams'))} />
      <ConfirmSheet open={confirm === 'reset'} onOpenChange={(o) => !o && setConfirm(null)} title={t('teamResetCode')} body={t('teamResetBody')} confirmLabel={t('teamResetCode')} loading={reset.isPending} onConfirm={() => void run(() => reset.mutateAsync(id))} />
    </Screen>
  );
}
