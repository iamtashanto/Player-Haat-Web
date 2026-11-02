'use client';

import React from 'react';
import { PhChip, PhSegmented, PhSwitchTile, PhTextField } from '@/design-system';
import type { PlayerSportProfile, SportCatalogItem } from '@/lib/player-api';
import { useFmt } from './kit';

export interface SportForm {
  sportId?: number;
  positions: string[];
  skillLevel: number;
  experienceYears: string;
  currentTeam: string;
  headline: string;
  preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH' | null;
  battingStyle: 'RIGHT_HAND' | 'LEFT_HAND' | null;
  khepAvailable: boolean;
  rateMin: string;
  rateMax: string;
  travelRadius: 'UNION' | 'UPAZILA' | 'DISTRICT';
  isVisible: boolean;
}

export const emptySportForm = (sportId?: number): SportForm => ({
  sportId,
  positions: [],
  skillLevel: 3,
  experienceYears: '',
  currentTeam: '',
  headline: '',
  preferredFoot: null,
  battingStyle: null,
  khepAvailable: false,
  rateMin: '',
  rateMax: '',
  travelRadius: 'UPAZILA',
  isVisible: true,
});

export const formFromSport = (s: PlayerSportProfile): SportForm => ({
  sportId: s.sportId,
  positions: s.positions,
  skillLevel: s.skillLevel,
  experienceYears: s.experienceYears?.toString() ?? '',
  currentTeam: s.currentTeam ?? '',
  headline: s.headline ?? '',
  preferredFoot: s.preferredFoot ?? null,
  battingStyle: s.battingStyle ?? null,
  khepAvailable: s.khepAvailable,
  rateMin: s.rateMin?.toString() ?? '',
  rateMax: s.rateMax?.toString() ?? '',
  travelRadius: s.travelRadius,
  isVisible: s.isVisible ?? true,
});

const num = (v: string) => (v.trim() === '' ? null : Number(v));

export function sportBody(f: SportForm, sport: SportCatalogItem | undefined) {
  const cricket = sport?.code.toLowerCase() === 'cricket';
  return {
    positions: f.positions,
    skillLevel: f.skillLevel,
    experienceYears: num(f.experienceYears),
    currentTeam: f.currentTeam.trim() || null,
    headline: f.headline.trim() || null,
    preferredFoot: cricket ? null : f.preferredFoot,
    battingStyle: cricket ? f.battingStyle : null,
    khepAvailable: f.khepAvailable,
    rateMin: f.khepAvailable ? num(f.rateMin) : null,
    rateMax: f.khepAvailable ? num(f.rateMax) : null,
    travelRadius: f.travelRadius,
    isVisible: f.isVisible,
  };
}

/** The per-sport form shared by setup and the sport editor sheet (`sport_editor` in the app). */
export function SportFields({ value: f, onChange, sport }: { value: SportForm; onChange: (f: SportForm) => void; sport: SportCatalogItem | undefined }) {
  const { t, name } = useFmt();
  const cricket = sport?.code.toLowerCase() === 'cricket';
  const set = (patch: Partial<SportForm>) => onChange({ ...f, ...patch });
  const label = (k: string) => <div className="tx-subhead-strong mb-2 mt-5">{k}</div>;
  return (
    <div>
      {label(`${t('positionsLabel')} · ${t('positionsMax')}`)}
      <div className="flex flex-wrap gap-2">
        {sport?.positions.map((p) => (
          <PhChip key={p.code} label={name(p)} selected={f.positions.includes(p.code)} onTap={() => set({ positions: f.positions.includes(p.code) ? f.positions.filter((c) => c !== p.code) : f.positions.length < 4 ? [...f.positions, p.code] : f.positions })} />
        ))}
      </div>
      {label(t('skillLabel'))}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <PhChip key={n} label={t(`skill${n}`)} selected={f.skillLevel === n} onTap={() => set({ skillLevel: n })} />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <PhTextField label={t('sportExperience')} type="number" inputMode="numeric" value={f.experienceYears} onChange={(v) => set({ experienceYears: v })} />
        <PhTextField label={t('sportTeam')} value={f.currentTeam} maxLength={80} onChange={(v) => set({ currentTeam: v })} />
      </div>
      <div className="mt-4">
        <PhTextField label={t('sportHeadline')} placeholder={t('sportHeadlineHint')} maxLength={100} value={f.headline} onChange={(v) => set({ headline: v })} />
      </div>
      {cricket ? (
        <>
          {label(t('battingLabel'))}
          <PhSegmented options={{ RIGHT_HAND: t('batRight'), LEFT_HAND: t('batLeft') }} value={f.battingStyle ?? 'RIGHT_HAND'} onChanged={(v) => set({ battingStyle: v })} />
        </>
      ) : (
        <>
          {label(t('footLabel'))}
          <PhSegmented options={{ RIGHT: t('footRight'), LEFT: t('footLeft'), BOTH: t('footBoth') }} value={f.preferredFoot ?? 'RIGHT'} onChanged={(v) => set({ preferredFoot: v })} />
        </>
      )}
      {label(t('travelLabel'))}
      <PhSegmented options={{ UNION: t('travelUnion'), UPAZILA: t('travelUpazila'), DISTRICT: t('travelDistrict') }} value={f.travelRadius} onChanged={(v) => set({ travelRadius: v })} />
      <div className="mt-5">
        <PhSwitchTile title={t('khepToggle')} subtitle={t('stepKhepBody')} value={f.khepAvailable} onChanged={(v) => set({ khepAvailable: v })} />
      </div>
      {f.khepAvailable && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PhTextField label={t('rateFrom')} type="number" inputMode="numeric" value={f.rateMin} onChange={(v) => set({ rateMin: v })} />
          <PhTextField label={t('rateTo')} type="number" inputMode="numeric" value={f.rateMax} onChange={(v) => set({ rateMax: v })} />
        </div>
      )}
      <div className="mt-4">
        <PhSwitchTile title={t('sportVisible')} subtitle={t('sportVisibleHint')} value={f.isVisible} onChanged={(v) => set({ isVisible: v })} />
      </div>
    </div>
  );
}
