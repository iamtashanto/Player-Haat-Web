'use client';

import React from 'react';
import { BadgeCheck, MapPin, MessageCircle } from 'lucide-react';
import { ErrorState, PhAvatar, PhBadge, PhButton, Skeleton } from '@/design-system';
import { useQuery } from '@tanstack/react-query';
import { get, type Data } from '@/lib/api/core';
import { useRecruiterTypes } from '@/lib/recruiter-api';
import { useStartChat } from '@/components/app/actions';
import { Screen, SectionTitle, useFmt } from '@/components/app/kit';
import { useSports } from '@/components/app/cards';

export default function RecruiterCardView({ id }: { id: string }) {
  const { t, name } = useFmt();
  const q = useQuery({ queryKey: ['recruiters', id], queryFn: () => get<Data<'/recruiters/{id}'>>(`/recruiters/${id}`) });
  const types = useRecruiterTypes();
  const { sports } = useSports();
  const chat = useStartChat();
  const r = q.data;
  if (q.isLoading) return <Screen title="" back large={false}><Skeleton height={120} radius={22} /></Screen>;
  if (q.isError || !r) return <Screen title={t('recruiterTitle')} back large={false}><ErrorState title={t('errorTitle')} retryLabel={t('retry')} onRetry={() => void q.refetch()} /></Screen>;
  const type = types.data?.find((x) => x.code === r.type);
  return (
    <Screen title={r.organization ?? r.name} back large={false}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <PhAvatar name={r.name} url={r.avatarUrl} size={84} verified={r.verifiedBadge} />
          <div className="min-w-0">
            <h1 className="tx-title1 truncate">{r.organization ?? r.name}</h1>
            <p className="tx-subhead">{r.name}{type ? ` · ${name(type)}` : ''}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {r.verifiedBadge && <PhBadge tone="accent" icon={<BadgeCheck className="h-3 w-3" />} label={t('recruiterVerified')} />}
              <span className="inline-flex items-center gap-1 tx-footnote text-[var(--ph-text-tertiary)]"><MapPin className="h-3 w-3" aria-hidden />{name(r.district)}</span>
            </div>
          </div>
        </div>
        {r.bio && <p className="tx-body mt-4 whitespace-pre-line">{r.bio}</p>}
        {r.sportIds.length > 0 && (
          <>
            <SectionTitle>{t('recruitsFor')}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {r.sportIds.map((sid) => (
                <PhBadge key={sid} label={name(sports.find((s) => s.id === sid))} />
              ))}
            </div>
          </>
        )}
        <div className="mt-6">
          <PhButton label={t('chatAction')} icon={<MessageCircle className="h-5 w-5" />} variant="secondary" loading={chat.pending} onPressed={() => void chat.start({ recruiterId: r.id })} />
        </div>
      </div>
    </Screen>
  );
}
