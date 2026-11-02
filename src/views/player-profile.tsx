'use client';

import React, { useState } from 'react';
import { BadgeCheck, Flag, MapPin, MessageCircle, Share2, UserPlus } from 'lucide-react';
import { PhAvatar, PhBadge, PhButton, PhCard, PhChip, RatingPill, ErrorState, Skeleton } from '@/design-system';
import { useAuth } from '@/lib/auth-context';
import { usePlayer, usePlayerRatings, useToggleShortlistHeart, type PlayerSportDetail } from '@/lib/api/social';
import { ShortlistHeart } from '@/components/app/shortlist-heart';
import { ContactReveal, InviteSheet, ReportSheet, useStartChat } from '@/components/app/actions';
import { LoadMore, Screen, SectionTitle, useFmt } from '@/components/app/kit';
import { useSports } from '@/components/app/cards';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function SportBlock({ s }: { s: PlayerSportDetail }) {
  const { t, name, money, num } = useFmt();
  const { sportById, positionNames } = useSports();
  const sport = sportById(s.sportId);
  const rate =
    s.khepAvailable &&
    (s.rateMin != null && s.rateMax != null ? `${money(s.rateMin)}–${num(s.rateMax)}` : s.rateMin != null ? `${money(s.rateMin)}+` : s.rateMax != null ? t('upTo', { amount: money(s.rateMax) }) : t('negotiableRate'));
  const radius = { UNION: 'radiusUnion', UPAZILA: 'radiusUpazila', DISTRICT: 'radiusDistrict' }[s.travelRadius];
  const stats = Object.entries(s.stats ?? {});
  return (
    <PhCard paddingClassName="p-4">
      <div className="flex items-center gap-2">
        <h3 className="tx-headline flex-1">{name(sport)}</h3>
        {s.statsVerified && <PhBadge tone="accent" icon={<BadgeCheck className="h-3 w-3" />} label={t('statsVerifiedBadge')} />}
      </div>
      {s.headline && <p className="tx-body mt-1">{s.headline}</p>}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 tx-footnote">
        {s.positions.length > 0 && (
          <div className="col-span-2">
            <dt className="text-[var(--ph-text-tertiary)]">{t('positionsLabel')}</dt>
            <dd className="tx-subhead-strong text-[var(--ph-text)]">{positionNames(s.sportId, s.positions)}</dd>
          </div>
        )}
        <div>
          <dt className="text-[var(--ph-text-tertiary)]">{t('skillLabel')}</dt>
          <dd className="tx-subhead-strong text-[var(--ph-text)]">{t(`skill${Math.min(5, Math.max(1, s.skillLevel))}`)}</dd>
        </div>
        {s.experienceYears != null && (
          <div>
            <dt className="text-[var(--ph-text-tertiary)]">{t('yearsShort', { n: num(s.experienceYears) })}</dt>
            <dd className="tx-subhead-strong text-[var(--ph-text)]">{s.currentTeam ?? ''}</dd>
          </div>
        )}
        {rate && (
          <div>
            <dt className="text-[var(--ph-text-tertiary)]">{t('khepRate')}</dt>
            <dd className="tx-subhead-strong text-[var(--ph-text)]">{rate}</dd>
          </div>
        )}
        <div>
          <dt className="text-[var(--ph-text-tertiary)]">{t('travelLabel')}</dt>
          <dd className="tx-subhead-strong text-[var(--ph-text)]">{t(radius)}</dd>
        </div>
      </dl>
      {stats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {stats.map(([k, v]) => (
            <PhBadge key={k} label={`${name(sport?.statFields.find((f) => f.key === k)) || k}: ${num(v)}`} />
          ))}
        </div>
      )}
      {(s.achievements?.length ?? 0) > 0 && (
        <ul className="mt-3 flex flex-col gap-1 tx-footnote">
          {s.achievements!.map((a) => (
            <li key={a.id}>
              <span className="tx-subhead-strong text-[var(--ph-text)]">{a.title}</span>
              {a.year ? ` · ${num(a.year)}` : ''}
            </li>
          ))}
        </ul>
      )}
    </PhCard>
  );
}

export default function PlayerProfileView({ id }: { id: string }) {
  const { t, name, date, ago, ok } = useFmt();
  const { activeRole } = useAuth();
  const q = usePlayer(id);
  const reviews = usePlayerRatings(id);
  const heart = useToggleShortlistHeart();
  const chat = useStartChat();
  const [invite, setInvite] = useState(false);
  const [report, setReport] = useState(false);
  const p = q.data;
  const isRecruiter = activeRole === 'RECRUITER';

  if (q.isLoading) {
    return (
      <Screen title="" back large={false}>
        <div className="flex flex-col gap-3">
          <Skeleton height={88} radius={22} />
          <Skeleton height={140} radius={22} />
        </div>
      </Screen>
    );
  }
  if (q.isError || !p) {
    return (
      <Screen title={t('playerTitle')} back large={false}>
        <ErrorState title={t('errorTitle')} message={q.error ? undefined : t('errNotFound')} retryLabel={t('retry')} onRetry={() => void q.refetch()} />
      </Screen>
    );
  }

  const share = async () => {
    const url = `${window.location.origin}/${document.documentElement.lang || 'bn'}/p/${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: p.name, text: t('sharePlayerText', { name: p.name }), url });
      else {
        await navigator.clipboard.writeText(url);
        ok(t('linkCopied'));
      }
    } catch {
      /* dismissed */
    }
  };

  const actions = (
    <div className="flex flex-col gap-3">
      <ContactReveal profileId={p.id} />
      {isRecruiter && (
        <>
          <PhButton label={t('chatAction')} icon={<MessageCircle className="h-5 w-5" />} variant="secondary" loading={chat.pending} onPressed={() => void chat.start({ profileId: p.id })} />
          <PhButton label={t('inviteAction')} icon={<UserPlus className="h-5 w-5" />} variant="secondary" onPressed={() => setInvite(true)} />
        </>
      )}
      <PhButton label={t('reportAction')} icon={<Flag className="h-4 w-4" />} variant="ghost" onPressed={() => setReport(true)} />
    </div>
  );

  return (
    <Screen
      title={p.name}
      back
      large={false}
      actions={
        <>
          {isRecruiter && (
            <ShortlistHeart key={String(p.shortlisted)} initialSaved={p.shortlisted} onToggle={(saved) => heart.mutate({ profileId: p.id, saved })} />
          )}
          <PhButton label={t('share')} icon={<Share2 className="h-4 w-4" />} variant="ghost" size="small" expand={false} onPressed={() => void share()} />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <PhAvatar name={p.name} url={p.avatarUrl} size={84} verified={p.verifiedBadge} />
            <div className="min-w-0">
              <h1 className="tx-title1 truncate">{p.name}</h1>
              {p.verifiedBadge && <PhBadge tone="accent" icon={<BadgeCheck className="h-3 w-3" />} label={t('verifiedPlayer')} />}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <RatingPill average={p.rating.average} count={p.rating.count} emptyLabel={t('noRatingsYet')} />
                <span className="inline-flex items-center gap-1 tx-footnote text-[var(--ph-text-secondary)]">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {name(p.location.upazila)}, {name(p.location.district)}
                </span>
              </div>
              <p className="mt-1 tx-footnote text-[var(--ph-text-tertiary)]">
                {t('lastActive', { when: ago(p.lastActiveAt) })} · {t('memberSince', { date: date(p.memberSince) })}
                {p.noShowCount > 0 ? ` · ${t('noShowsCount', { count: p.noShowCount })}` : ''}
              </p>
            </div>
          </div>

          <div className="mt-5 lg:hidden">{actions}</div>

          {p.bio && (
            <>
              <SectionTitle>{t('aboutLabel')}</SectionTitle>
              <p className="tx-body whitespace-pre-line">{p.bio}</p>
            </>
          )}

          <SectionTitle>{t('sportsLabel')}</SectionTitle>
          <div className="flex flex-col gap-3">
            {p.sports.map((s) => (
              <SportBlock key={s.sportId} s={s} />
            ))}
          </div>

          {(() => {
            const avail = p.sports.find((s) => s.availability)?.availability;
            const slots = avail ? DAYS.filter((d) => (avail[d]?.length ?? 0) > 0) : [];
            return (
              <>
                <SectionTitle>{t('availabilityLabel')}</SectionTitle>
                {slots.length === 0 ? (
                  <p className="tx-subhead">{t('noAvailability')}</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {slots.map((d) => (
                      <div key={d} className="flex flex-wrap items-center gap-2">
                        <span className="w-16 tx-subhead-strong">{new Intl.DateTimeFormat(document.documentElement.lang || 'en', { weekday: 'short' }).format(new Date(2024, 0, 1 + DAYS.indexOf(d)))}</span>
                        {avail![d]!.map((slot) => (
                          <PhChip key={slot} dense label={t(`slot${slot[0]!.toUpperCase()}${slot.slice(1)}`)} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {p.media.length > 0 && (
            <>
              <SectionTitle>{t('mediaLabel')}</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {p.media.filter((m) => m.type === 'PHOTO').map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={m.id} src={m.url} alt="" loading="lazy" className="aspect-square w-full rounded-[14px] object-cover" />
                ))}
              </div>
              {p.media.filter((m) => m.type === 'VIDEO').map((m) => (
                <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="mt-2 block tx-subhead text-[var(--ph-accent)] underline">
                  {m.url}
                </a>
              ))}
            </>
          )}

          <SectionTitle>{t('reviewsLabel')}</SectionTitle>
          {reviews.items.length === 0 && !reviews.isLoading ? (
            <p className="tx-subhead">{t('noReviews')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.items.map((r) => (
                <PhCard key={r.id} paddingClassName="p-4">
                  <div className="flex items-center gap-2">
                    <PhAvatar name={r.rater.name} url={r.rater.avatarUrl} size={28} />
                    <span className="tx-subhead-strong flex-1 truncate">{r.rater.name}</span>
                    <RatingPill average={r.overall} count={0} />
                  </div>
                  {r.comment && <p className="tx-body mt-2">{r.comment}</p>}
                  <p className="tx-footnote mt-1 text-[var(--ph-text-tertiary)]">{date(r.createdAt)}</p>
                </PhCard>
              ))}
              <LoadMore hasNext={!!reviews.hasNextPage} loading={reviews.isFetchingNextPage} onMore={() => void reviews.fetchNextPage()} />
            </div>
          )}
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-16">{actions}</div>
        </aside>
      </div>
      {isRecruiter && <InviteSheet open={invite} onOpenChange={setInvite} profileId={p.id} sportId={p.sports[0]?.sportId} />}
      <ReportSheet open={report} onOpenChange={setReport} targetType="PLAYER_PROFILE" targetId={p.id} />
    </Screen>
  );
}
