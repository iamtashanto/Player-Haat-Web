'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { PhAvatar, PhBadge, PhButton, PhCard, PhSegmented } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useInviteAction, useReceivedInvites, useSentInvites, type Invite } from '@/lib/api/social';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';
import { useStartChat } from '@/components/app/actions';

const STATUS_KEY = { PENDING: 'inviteStatusPending', ACCEPTED: 'inviteStatusAccepted', DECLINED: 'inviteStatusDeclined', WITHDRAWN: 'inviteStatusWithdrawn' } as const;

function InviteCard({ i, mode }: { i: Invite; mode: 'received' | 'sent' }) {
  const { t, name, date, time, fail, ok } = useFmt();
  const router = useRouter();
  const act = useInviteAction();
  const chat = useStartChat();
  const who = mode === 'received' ? i.recruiter : i.player;
  const run = async (action: 'accept' | 'decline' | 'withdraw') => {
    try {
      await act.mutateAsync({ id: i.id, action });
      if (action === 'accept') ok(t('inviteAcceptedBody'));
    } catch (e) {
      fail(e);
    }
  };
  return (
    <PhCard onTap={i.request ? () => router.push(`/request/${i.request!.id}`) : undefined} paddingClassName="p-4">
      <div className="flex items-center gap-3">
        <PhAvatar name={who?.name ?? ''} url={who?.avatarUrl} size={44} verified={mode === 'received' ? i.recruiter?.verified : false} />
        <div className="min-w-0 flex-1">
          <div className="tx-headline truncate">{who?.name}</div>
          <div className="tx-subhead truncate">{i.request ? (i.request.title ?? `${name(i.sport)} · ${date(i.request.matchAt)} ${time(i.request.matchAt)}`) : name(i.sport)}</div>
        </div>
        <PhBadge tone={i.status === 'PENDING' ? 'warning' : i.status === 'ACCEPTED' ? 'accent' : 'neutral'} label={t(STATUS_KEY[i.status])} />
      </div>
      {i.message && <p className="tx-subhead mt-2">{i.message}</p>}
      <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        {mode === 'received' && i.status === 'PENDING' && (
          <>
            <PhButton label={t('inviteAccept')} size="small" expand={false} loading={act.isPending} onPressed={() => void run('accept')} />
            <PhButton label={t('inviteDecline')} size="small" variant="secondary" expand={false} onPressed={() => void run('decline')} />
          </>
        )}
        {mode === 'sent' && i.status === 'PENDING' && <PhButton label={t('inviteWithdraw')} size="small" variant="secondary" expand={false} onPressed={() => void run('withdraw')} />}
        {i.status === 'ACCEPTED' && i.contact?.phone && <PhButton label={t('call')} size="small" expand={false} onPressed={() => (window.location.href = `tel:${i.contact!.phone}`)} />}
        {i.status === 'ACCEPTED' && mode === 'received' && i.recruiter?.recruiterId && (
          <PhButton label={t('chatAction')} size="small" variant="secondary" expand={false} loading={chat.pending} onPressed={() => void chat.start({ recruiterId: i.recruiter!.recruiterId! })} />
        )}
      </div>
    </PhCard>
  );
}

export default function InvitesView() {
  const { t } = useFmt();
  const { activeRole } = useAuth();
  const isRecruiter = activeRole === 'RECRUITER';
  const [tab, setTab] = useState<'received' | 'sent'>(isRecruiter ? 'sent' : 'received');
  const received = useReceivedInvites();
  const sent = useSentInvites();
  const q = tab === 'received' ? received : sent;
  return (
    <Screen title={t('invitesTitle')} back>
      <div className="mx-auto max-w-2xl">
        <PhSegmented options={{ received: t('invitesReceived'), sent: t('invitesSent') }} value={tab} onChanged={setTab} />
        <div className="mt-3">
          <QueryState
            query={q}
            isEmpty={q.items.length === 0}
            emptyIcon={<Send className="h-6 w-6" />}
            emptyTitle={t(tab === 'received' ? 'invitesEmptyReceivedTitle' : 'invitesEmptySentTitle')}
            emptyMessage={t(tab === 'received' ? 'invitesEmptyReceivedBody' : 'invitesEmptySentBody')}
          >
            <div className="flex flex-col gap-3">
              {q.items.map((i) => (
                <InviteCard key={i.id} i={i} mode={tab} />
              ))}
            </div>
            <LoadMore hasNext={!!q.hasNextPage} loading={q.isFetchingNextPage} onMore={() => void q.fetchNextPage()} />
          </QueryState>
        </div>
      </div>
    </Screen>
  );
}
