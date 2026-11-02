'use client';

import React, { useState } from 'react';
import { MapPin, SlidersHorizontal, Users } from 'lucide-react';
import { PhBottomSheet, PhButton, PhChip, PhSegmented, PhSwitchTile, PhTextField } from '@/design-system';
import { CascadingLocationPicker, type SelectedLocationValue } from '@/components/shared/cascading-location-picker';
import { usePlayerSearch, type PlayerFilters } from '@/lib/api/social';
import { LoadMore, QueryState, Screen, useFmt } from '@/components/app/kit';
import { PlayerTile, useSports } from '@/components/app/cards';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type Area = SelectedLocationValue | null;

function activeCount(f: PlayerFilters, area: Area) {
  return [f.q, f.position, f.khepAvailable, f.minExperienceYears, f.minSkillLevel, f.statsVerified, f.minRating, f.availabilityDay, area].filter(Boolean).length;
}

function FilterFields({ f, setF, area, setArea }: { f: PlayerFilters; setF: (f: PlayerFilters) => void; area: Area; setArea: (a: Area) => void }) {
  const { t, name, locale } = useFmt();
  const { sports, sportById } = useSports();
  const sport = sportById(f.sportId);
  const [pickArea, setPickArea] = useState(false);
  const label = (k: string) => <div className="tx-subhead-strong mb-2 mt-5 text-[var(--ph-text)]">{k}</div>;
  const wrap = 'flex flex-wrap gap-2';
  return (
    <div>
      <PhTextField placeholder={t('filterName')} value={f.q ?? ''} maxLength={60} onChange={(v) => setF({ ...f, q: v.trim().length >= 2 ? v.trim() : undefined })} />
      <div className="mt-4 mb-2 tx-subhead-strong">{t('sortBy')}</div>
      <PhSegmented options={{ rating: t('sortRating'), active: t('sortActive') }} value={f.sort ?? 'rating'} onChanged={(v) => setF({ ...f, sort: v })} />
      {label(t('filterSport'))}
      <div className={wrap}>
        <PhChip label={t('filterAllSports')} selected={f.sportId === undefined} onTap={() => setF({ ...f, sportId: undefined, position: undefined })} />
        {sports.map((s) => (
          <PhChip key={s.id} label={name(s)} selected={f.sportId === s.id} onTap={() => setF({ ...f, sportId: s.id, position: undefined })} />
        ))}
      </div>
      {sport && sport.positions.length > 0 && (
        <>
          {label(t('filterPosition'))}
          <div className={wrap}>
            {sport.positions.map((p) => (
              <PhChip key={p.code} label={name(p)} selected={f.position === p.code} onTap={() => setF({ ...f, position: f.position === p.code ? undefined : p.code })} />
            ))}
          </div>
        </>
      )}
      {label(t('filterArea'))}
      <div className={wrap}>
        <PhChip icon={<MapPin className="h-3.5 w-3.5" />} label={area ? `${area.upazilaName}, ${area.districtName}` : t('anyArea')} selected={!!area} onTap={() => setPickArea(true)} />
        {area && <PhChip label={t('clear')} onTap={() => { setArea(null); setF({ ...f, districtId: undefined, upazilaId: undefined }); }} />}
      </div>
      <PhBottomSheet open={pickArea} onOpenChange={setPickArea} title={t('placePickerTitle')}>
        <CascadingLocationPicker
          showUnion={false}
          value={area}
          onChange={(v) => {
            setArea(v);
            setF({ ...f, districtId: v.districtId, upazilaId: v.upazilaId });
            setPickArea(false);
          }}
        />
      </PhBottomSheet>
      <div className="mt-4">
        <PhSwitchTile title={t('filterKhep')} value={f.khepAvailable === true} onChanged={(v) => setF({ ...f, khepAvailable: v ? true : undefined, rateMin: undefined, rateMax: undefined })} />
      </div>
      {f.khepAvailable && (
        <>
          {label(t('filterBudget'))}
          <div className="grid grid-cols-2 gap-3">
            <PhTextField placeholder={t('budgetMin')} type="number" inputMode="numeric" value={f.rateMin?.toString() ?? ''} onChange={(v) => setF({ ...f, rateMin: v ? Number(v) : undefined })} />
            <PhTextField placeholder={t('budgetMax')} type="number" inputMode="numeric" value={f.rateMax?.toString() ?? ''} onChange={(v) => setF({ ...f, rateMax: v ? Number(v) : undefined })} />
          </div>
        </>
      )}
      {label(t('filterExperience'))}
      <div className={wrap}>
        {[undefined, 1, 3, 5, 10].map((n) => (
          <PhChip key={String(n)} label={n === undefined ? t('filterAll') : t('expPlus', { n })} selected={f.minExperienceYears === n} onTap={() => setF({ ...f, minExperienceYears: n })} />
        ))}
      </div>
      {label(t('filterSkill'))}
      <div className={wrap}>
        {[undefined, 2, 3, 4, 5].map((n) => (
          <PhChip key={String(n)} label={n === undefined ? t('filterAll') : t('skillPlus', { n })} selected={f.minSkillLevel === n} onTap={() => setF({ ...f, minSkillLevel: n })} />
        ))}
      </div>
      <div className="mt-4">
        <PhSwitchTile title={t('filterStatsVerified')} value={f.statsVerified === true} onChanged={(v) => setF({ ...f, statsVerified: v ? true : undefined })} />
      </div>
      {label(t('filterMinRating'))}
      <div className={wrap}>
        {[undefined, 3, 4, 4.5].map((r) => (
          <PhChip key={String(r)} label={r === undefined ? t('filterAll') : t('starsAndUp', { value: r })} selected={f.minRating === r} onTap={() => setF({ ...f, minRating: r })} />
        ))}
      </div>
      {label(t('filterDay'))}
      <div className={wrap}>
        <PhChip label={t('anyDay')} selected={!f.availabilityDay} onTap={() => setF({ ...f, availabilityDay: undefined })} />
        {DAYS.map((d) => (
          <PhChip key={d} label={new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + DAYS.indexOf(d)))} selected={f.availabilityDay === d} onTap={() => setF({ ...f, availabilityDay: d })} />
        ))}
      </div>
    </div>
  );
}

/** Find players. Phone: chips + a Filters sheet. Desktop: sticky filter panel + a card grid. */
export default function PlayersView() {
  const { t, name } = useFmt();
  const { sports } = useSports();
  const [f, setF] = useState<PlayerFilters>({ sort: 'rating' });
  const [area, setArea] = useState<Area>(null);
  const [sheet, setSheet] = useState(false);
  const results = usePlayerSearch(f);
  const count = activeCount(f, area);
  const reset = () => { setF({ sort: 'rating' }); setArea(null); };

  return (
    <Screen title={t('searchTitle')}>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-[22px] border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)] p-4">
            <FilterFields f={f} setF={setF} area={area} setArea={setArea} />
            {count > 0 && <div className="mt-5"><PhButton label={t('clearAll')} variant="secondary" onPressed={reset} /></div>}
          </div>
        </aside>
        <div className="min-w-0">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 lg:hidden">
            <PhChip icon={<SlidersHorizontal className="h-3.5 w-3.5" />} label={count > 0 ? t('filtersCount', { count }) : t('filters')} selected={count > 0} onTap={() => setSheet(true)} />
            <PhChip label={t('filterAllSports')} selected={f.sportId === undefined} onTap={() => setF({ ...f, sportId: undefined, position: undefined })} />
            {sports.map((s) => (
              <PhChip key={s.id} label={name(s)} selected={f.sportId === s.id} onTap={() => setF({ ...f, sportId: s.id, position: undefined })} />
            ))}
          </div>
          <div className="mt-3">
            <QueryState
              query={results}
              isEmpty={results.items.length === 0}
              emptyIcon={<Users className="h-6 w-6" />}
              emptyTitle={t('searchEmptyTitle')}
              emptyMessage={t('searchEmptyBody')}
              emptyAction={count > 0 ? { label: t('clearAll'), onAction: reset } : undefined}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {results.items.map((p) => (
                  <PlayerTile key={p.id} player={p} sportId={f.sportId} />
                ))}
              </div>
              <LoadMore hasNext={!!results.hasNextPage} loading={results.isFetchingNextPage} onMore={() => void results.fetchNextPage()} />
            </QueryState>
          </div>
        </div>
      </div>
      <PhBottomSheet open={sheet} onOpenChange={setSheet} title={t('filters')}>
        <FilterFields f={f} setF={setF} area={area} setArea={setArea} />
        <div className="mt-6 flex gap-3">
          <PhButton label={t('clearAll')} variant="secondary" onPressed={() => { reset(); setSheet(false); }} />
          <PhButton label={t('showResults')} onPressed={() => setSheet(false)} />
        </div>
      </PhBottomSheet>
    </Screen>
  );
}
