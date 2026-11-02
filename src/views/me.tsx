'use client';

import React from 'react';
import { BadgeCheck, Briefcase, CreditCard, Eye, Heart, MessageCircle, Pencil, Send, Settings, Star, UserRound, Users } from 'lucide-react';
import { PhAvatar, PhBadge, PhCard, PhGroup, PhRow } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useMyPlayerProfile } from '@/lib/player-api';
import { useMyRecruiterProfile } from '@/lib/recruiter-api';
import { useWallet } from '@/lib/api/billing';
import { usePendingRatings } from '@/lib/api/ratings';
import { useReceivedInvites } from '@/lib/api/social';
import { useUnreadMessages } from '@/lib/api/chat';
import { Screen, useFmt } from '@/components/app/kit';

export default function MeView() {
  const { t, num } = useFmt();
  const router = useRouter();
  const { me, activeRole } = useAuth();
  const isRecruiter = activeRole === 'RECRUITER';
  const player = useMyPlayerProfile();
  const recruiter = useMyRecruiterProfile();
  const wallet = useWallet();
  const pending = usePendingRatings();
  const invites = useReceivedInvites('PENDING');
  const unread = useUnreadMessages();
  const p = isRecruiter ? null : player.data;
  const rec = isRecruiter ? recruiter.data : null;
  const toRate = pending.data?.length ?? 0;
  const go = (href: string) => () => router.push(href);

  return (
    <Screen title={t('meTitle')} actions={<button type="button" aria-label={t('settingsTitle')} onClick={go('/settings')} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--ph-text-secondary)] hover:bg-[var(--ph-surface-alt)]"><Settings className="h-5 w-5" /></button>}>
      <div className="mx-auto grid max-w-3xl gap-4">
        <PhCard onTap={p ? go(`/player/${p.id}`) : rec ? go(`/recruiter/${rec.id}`) : undefined} paddingClassName="p-4">
          <div className="flex items-center gap-4">
            <PhAvatar name={me?.name ?? ''} url={me?.avatarUrl} size={64} verified={p?.verifiedBadge || rec?.verifiedBadge} />
            <div className="min-w-0">
              <div className="tx-title2 truncate">{me?.name}</div>
              <div className="tx-subhead truncate">{me?.email ?? me?.phone}</div>
              <PhBadge tone="accent" label={t(isRecruiter ? 'accountTypeRecruiter' : 'accountTypePlayer')} className="mt-1" />
            </div>
          </div>
        </PhCard>

        <PhGroup>
          {isRecruiter ? (
            <>
              {rec && <PhRow icon={<Briefcase className="h-4 w-4" />} title={t('myRecruiterProfile')} subtitle={rec.organization ?? undefined} onTap={go(`/recruiter/${rec.id}`)} />}
              <PhRow icon={<Pencil className="h-4 w-4" />} title={t('recruiterEditTitle')} onTap={go('/recruiter/edit')} />
            </>
          ) : (
            <>
              {p ? (
                <PhRow icon={<UserRound className="h-4 w-4" />} title={t('myPlayerProfile')} onTap={go(`/player/${p.id}`)} />
              ) : (
                !player.isLoading && <PhRow icon={<UserRound className="h-4 w-4" />} title={t('createPlayerProfile')} subtitle={t('createPlayerProfileBody')} onTap={go('/setup')} />
              )}
              {p && <PhRow icon={<Pencil className="h-4 w-4" />} title={t('editProfile')} onTap={go('/profile/edit')} />}
            </>
          )}
        </PhGroup>

        <PhGroup>
          {toRate > 0 && <PhRow icon={<Star className="h-4 w-4" />} title={t('ratingsToGive')} trailing={<PhBadge tone="warning" label={num(toRate)} />} onTap={go('/games')} />}
          <PhRow icon={<CreditCard className="h-4 w-4" />} title={t('walletTitle')} subtitle={wallet.data ? num(wallet.data.balance) : undefined} onTap={go('/wallet')} />
          <PhRow icon={<MessageCircle className="h-4 w-4" />} title={t('messagesTitle')} trailing={unread > 0 ? <PhBadge tone="accent" label={num(unread)} /> : undefined} onTap={go('/messages')} />
          <PhRow icon={<Send className="h-4 w-4" />} title={t('meInvitations')} trailing={invites.items.length > 0 ? <PhBadge tone="warning" label={num(invites.items.length)} /> : undefined} onTap={go('/invites')} />
          {isRecruiter && <PhRow icon={<Heart className="h-4 w-4" />} title={t('shortlistTitle')} onTap={go('/shortlist')} />}
          {isRecruiter && rec && (
            <PhRow icon={<BadgeCheck className="h-4 w-4" />} title={rec.verifiedBadge ? t('verifyApproved') : t('verifyRecruiterTitle')} onTap={rec.verifiedBadge ? undefined : go('/verify/recruiter')} chevron={!rec.verifiedBadge} />
          )}
          {!isRecruiter && p && <PhRow icon={<Eye className="h-4 w-4" />} title={t('viewersTitle')} onTap={go('/me/viewers')} />}
          <PhRow icon={<Users className="h-4 w-4" />} title={t('teamsTitle')} onTap={go('/teams')} />
          <PhRow icon={<Settings className="h-4 w-4" />} title={t('settingsTitle')} onTap={go('/settings')} />
        </PhGroup>
      </div>
    </Screen>
  );
}
