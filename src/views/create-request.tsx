'use client';

import React, { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { PhBottomSheet, PhButton, PhChip, PhSegmented, PhSwitchTile, PhTextField } from '@/design-system';
import { CascadingLocationPicker, type SelectedLocationValue } from '@/components/shared/cascading-location-picker';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useCreateRequest } from '@/lib/api/requests';
import { useMyTeams } from '@/lib/api/teams';
import { Screen, useFmt } from '@/components/app/kit';
import { useSports } from '@/components/app/cards';

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Post a "player needed" request (or, for recruiters, a trial/camp event). */
export default function CreateRequestView() {
  const { t, name, fail, ok } = useFmt();
  const router = useRouter();
  const { activeRole } = useAuth();
  const { sports, sportById } = useSports();
  const teams = useMyTeams();
  const create = useCreateRequest();
  const isRecruiter = activeRole === 'RECRUITER';

  const [kind, setKind] = useState<'MATCH' | 'EVENT'>('MATCH');
  const [title, setTitle] = useState('');
  const [sportId, setSportId] = useState<number | undefined>();
  const [when, setWhen] = useState(() => {
    const d = new Date(Date.now() + 48 * 3600_000);
    d.setMinutes(0, 0, 0);
    return toLocalInput(d);
  });
  const [venue, setVenue] = useState('');
  const [area, setArea] = useState<SelectedLocationValue | null>(null);
  const [pickArea, setPickArea] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  const [needed, setNeeded] = useState('1');
  const [paid, setPaid] = useState(false);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [notes, setNotes] = useState('');
  const [teamId, setTeamId] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sport = sportById(sportId);
  const sportTeams = useMemo(() => (teams.data ?? []).filter((x) => x.sport.id === sportId), [teams.data, sportId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!sportId) e.sport = t('sportRequired');
    if (!venue.trim()) e.venue = t('venueRequired');
    if (!area) e.area = t('areaRequired');
    if (new Date(when).getTime() <= Date.now()) e.when = t('matchInPast');
    if (kind === 'EVENT' && title.trim().length < 3) e.title = t('eventTitleHint');
    if (paid && min && max && Number(min) > Number(max)) e.budget = t('budgetOrder');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || !sportId || !area) return;
    try {
      const r = await create.mutateAsync({
        sportId,
        matchAt: new Date(when).toISOString(),
        venueText: venue.trim(),
        districtId: area.districtId,
        upazilaId: area.upazilaId,
        unionId: area.unionId ?? undefined,
        positionsNeeded: positions,
        playersNeeded: Math.max(1, Math.min(30, Number(needed) || 1)),
        isPaid: paid,
        budgetMin: paid && min ? Number(min) : undefined,
        budgetMax: paid && max ? Number(max) : undefined,
        notes: notes.trim() || undefined,
        teamId,
        kind,
        title: kind === 'EVENT' ? title.trim() : undefined,
      });
      ok(t('reqPosted'));
      router.replace(`/request/${r.id}`);
    } catch (e) {
      fail(e);
    }
  };

  const label = (k: string) => <div className="tx-subhead-strong mb-2 mt-5">{k}</div>;
  const errLine = (k: string) => errors[k] && <p className="mt-1 tx-footnote text-[var(--ph-danger)]" role="alert">{errors[k]}</p>;

  return (
    <Screen title={kind === 'EVENT' ? t('postEvent') : t('newRequestTitle')} back>
      <form
        className="mx-auto max-w-xl lg:rounded-[28px] lg:border-[0.5px] lg:border-[var(--ph-border)] lg:bg-[var(--ph-surface)] lg:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {isRecruiter && (
          <PhSegmented options={{ MATCH: t('kindMatches'), EVENT: t('eventLabel') }} value={kind} onChanged={setKind} />
        )}
        {kind === 'EVENT' && (
          <div className="mt-4">
            <PhTextField label={t('eventTitleLabel')} placeholder={t('eventTitleHint')} maxLength={80} value={title} onChange={setTitle} error={errors.title} />
          </div>
        )}

        {label(t('reqSport'))}
        <div className="flex flex-wrap gap-2">
          {sports.map((s) => (
            <PhChip key={s.id} label={name(s)} selected={sportId === s.id} onTap={() => { setSportId(s.id); setPositions([]); setTeamId(undefined); }} />
          ))}
        </div>
        {errLine('sport')}

        {label(t('reqWhen'))}
        <input
          type="datetime-local"
          value={when}
          min={toLocalInput(new Date())}
          onChange={(e) => setWhen(e.target.value)}
          className="h-12 w-full rounded-[14px] border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface-alt)] px-3 tx-body text-[var(--ph-text)]"
        />
        {errLine('when')}

        <div className="mt-5">
          <PhTextField label={t('reqVenue')} placeholder={t('reqVenueHint')} maxLength={200} value={venue} onChange={setVenue} error={errors.venue} />
        </div>

        {label(t('reqArea'))}
        <PhChip icon={<MapPin className="h-3.5 w-3.5" />} label={area ? `${area.upazilaName}, ${area.districtName}` : t('pickLocation')} selected={!!area} onTap={() => setPickArea(true)} />
        {errLine('area')}
        <PhBottomSheet open={pickArea} onOpenChange={setPickArea} title={t('placePickerTitle')}>
          <CascadingLocationPicker value={area} onChange={(v) => { setArea(v); setPickArea(false); }} />
        </PhBottomSheet>

        {sport && sport.positions.length > 0 && kind === 'MATCH' && (
          <>
            {label(t('reqPositions'))}
            <div className="flex flex-wrap gap-2">
              {sport.positions.map((p) => (
                <PhChip key={p.code} label={name(p)} selected={positions.includes(p.code)} onTap={() => setPositions((cur) => (cur.includes(p.code) ? cur.filter((c) => c !== p.code) : cur.length < 6 ? [...cur, p.code] : cur))} />
              ))}
            </div>
            <p className="mt-1 tx-footnote text-[var(--ph-text-tertiary)]">{t('reqPositionsHint')}</p>
          </>
        )}

        {kind === 'MATCH' && (
          <div className="mt-5">
            <PhTextField label={t('reqPlayers')} type="number" inputMode="numeric" value={needed} onChange={setNeeded} />
          </div>
        )}

        <div className="mt-5">
          <PhSwitchTile title={t('reqPaid')} subtitle={t('reqPaidHint')} value={paid} onChanged={setPaid} />
        </div>
        {paid && (
          <>
            {label(t('reqBudget'))}
            <div className="grid grid-cols-2 gap-3">
              <PhTextField placeholder={t('budgetMin')} type="number" inputMode="numeric" value={min} onChange={setMin} />
              <PhTextField placeholder={t('budgetMax')} type="number" inputMode="numeric" value={max} onChange={setMax} error={errors.budget} />
            </div>
          </>
        )}

        {sportTeams.length > 0 && (
          <>
            {label(t('teamPostFor'))}
            <div className="flex flex-wrap gap-2">
              <PhChip label={t('teamNone')} selected={!teamId} onTap={() => setTeamId(undefined)} />
              {sportTeams.map((tm) => (
                <PhChip key={tm.id} label={tm.name} selected={teamId === tm.id} onTap={() => setTeamId(tm.id)} />
              ))}
            </div>
          </>
        )}

        <div className="mt-5">
          <PhTextField label={t('reqNotes')} placeholder={t('reqNotesHint')} multiline rows={3} maxLength={500} value={notes} onChange={setNotes} />
        </div>

        <div className="mt-6">
          <PhButton label={kind === 'EVENT' ? t('postEvent') : t('reqPostIt')} type="submit" loading={create.isPending} />
        </div>
      </form>
    </Screen>
  );
}
