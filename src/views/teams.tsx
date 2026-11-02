'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Users } from 'lucide-react';
import { PhAvatar, PhBottomSheet, PhButton, PhCard, PhChip, PhTextField } from '@/design-system';
import { CascadingLocationPicker, type SelectedLocationValue } from '@/components/shared/cascading-location-picker';
import { useRouter } from '@/i18n/routing';
import { useCreateTeam, useJoinTeam, useMyTeams } from '@/lib/api/teams';
import { QueryState, Screen, useFmt } from '@/components/app/kit';
import { useSports } from '@/components/app/cards';

export default function TeamsView() {
  const { t, name, num, fail, ok } = useFmt();
  const router = useRouter();
  const q = useMyTeams();
  const create = useCreateTeam();
  const join = useJoinTeam();
  const { sports } = useSports();
  const [sheet, setSheet] = useState<null | 'create' | 'join'>(null);
  const [teamName, setTeamName] = useState('');
  const [sportId, setSportId] = useState<number | undefined>();
  const [area, setArea] = useState<SelectedLocationValue | null>(null);
  const [pickArea, setPickArea] = useState(false);
  const [code, setCode] = useState('');

  const doCreate = async () => {
    if (!sportId || !area) return;
    try {
      const tm = await create.mutateAsync({ name: teamName.trim(), sportId, districtId: area.districtId, upazilaId: area.upazilaId, unionId: area.unionId ?? undefined });
      ok(t('teamCreatedToast'));
      setSheet(null);
      router.push(`/team/${tm.id}`);
    } catch (e) {
      fail(e);
    }
  };
  const doJoin = async () => {
    try {
      const tm = await join.mutateAsync(code.trim());
      ok(t('teamJoinedToast'));
      setSheet(null);
      router.push(`/team/${tm.id}`);
    } catch (e) {
      fail(e);
    }
  };

  return (
    <Screen
      title={t('teamsTitle')}
      back
      actions={
        <>
          <PhButton label={t('teamJoin')} variant="secondary" size="small" expand={false} onPressed={() => setSheet('join')} />
          <PhButton label={t('teamCreate')} icon={<Plus className="h-4 w-4" />} size="small" expand={false} onPressed={() => setSheet('create')} />
        </>
      }
    >
      <div className="mx-auto max-w-3xl">
        <QueryState query={q} isEmpty={(q.data?.length ?? 0) === 0} emptyIcon={<Users className="h-6 w-6" />} emptyTitle={t('teamsEmptyTitle')} emptyMessage={t('teamsEmptyBody')} emptyAction={{ label: t('teamCreate'), onAction: () => setSheet('create') }}>
          <div className="grid gap-3 md:grid-cols-2">
            {q.data?.map((tm) => (
              <PhCard key={tm.id} onTap={() => router.push(`/team/${tm.id}`)} paddingClassName="p-4">
                <div className="flex items-center gap-3">
                  <PhAvatar name={tm.name} url={tm.logoUrl} size={48} />
                  <div className="min-w-0">
                    <div className="tx-headline truncate">{tm.name}</div>
                    <div className="tx-subhead truncate">{name(tm.sport)} · {t('teamMemberCount', { n: num(tm.memberCount) })}</div>
                    <div className="tx-footnote inline-flex items-center gap-1 text-[var(--ph-text-tertiary)]"><MapPin className="h-3 w-3" aria-hidden />{name(tm.location.upazila)}</div>
                  </div>
                </div>
              </PhCard>
            ))}
          </div>
        </QueryState>
      </div>

      <PhBottomSheet open={sheet === 'create'} onOpenChange={(o) => !o && setSheet(null)} title={t('teamCreate')}>
        <PhTextField label={t('teamNameLabel')} value={teamName} onChange={setTeamName} maxLength={60} />
        <div className="tx-subhead-strong mb-2 mt-4">{t('reqSport')}</div>
        <div className="flex flex-wrap gap-2">
          {sports.map((s) => (
            <PhChip key={s.id} label={name(s)} selected={sportId === s.id} onTap={() => setSportId(s.id)} />
          ))}
        </div>
        <div className="tx-subhead-strong mb-2 mt-4">{t('reqArea')}</div>
        <PhChip icon={<MapPin className="h-3.5 w-3.5" />} label={area ? `${area.upazilaName}, ${area.districtName}` : t('pickLocation')} selected={!!area} onTap={() => setPickArea(true)} />
        <PhBottomSheet open={pickArea} onOpenChange={setPickArea} title={t('placePickerTitle')}>
          <CascadingLocationPicker value={area} onChange={(v) => { setArea(v); setPickArea(false); }} />
        </PhBottomSheet>
        <div className="mt-5">
          <PhButton label={t('teamCreate')} loading={create.isPending} disabled={teamName.trim().length < 2 || !sportId || !area} onPressed={() => void doCreate()} />
        </div>
      </PhBottomSheet>

      <PhBottomSheet open={sheet === 'join'} onOpenChange={(o) => !o && setSheet(null)} title={t('teamJoin')}>
        <PhTextField placeholder={t('teamCodeHint')} value={code} onChange={(v) => setCode(v.toUpperCase())} maxLength={12} autoComplete="off" />
        <div className="mt-5">
          <PhButton label={t('teamJoin')} loading={join.isPending} disabled={code.trim().length < 4} onPressed={() => void doJoin()} />
        </div>
      </PhBottomSheet>
    </Screen>
  );
}
