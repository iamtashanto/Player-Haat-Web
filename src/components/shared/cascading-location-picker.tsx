'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, MapPin, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  GlassContainer,
  PhButton,
  PhChip,
  PhInput,
  PhRadius,
} from '@/design-system';
import {
  useDistricts,
  useDivisions,
  useUnions,
  useUpazilas,
  type LocationDistrict,
  type LocationDivision,
  type LocationUnion,
  type LocationUpazila,
} from '@/lib/player-api';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export interface SelectedLocationValue {
  divisionId?: number | null;
  divisionName?: string | null;
  districtId: number;
  districtName: string;
  upazilaId: number;
  upazilaName: string;
  unionId?: number | null;
  unionName?: string | null;
}

export interface CascadingLocationPickerProps {
  value?: SelectedLocationValue | null;
  onChange: (val: SelectedLocationValue) => void;
  showUnion?: boolean;
  className?: string;
}

export function CascadingLocationPicker({
  value,
  onChange,
  showUnion = true,
  className,
}: CascadingLocationPickerProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;

  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(
    value?.divisionId ?? 1, // Default to Barishal/Dhaka or current
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    value?.districtId ?? null,
  );
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<number | null>(
    value?.upazilaId ?? null,
  );
  const [selectedUnionId, setSelectedUnionId] = useState<number | null>(
    value?.unionId ?? null,
  );

  const [filterQuery, setFilterQuery] = useState('');

  const { data: divisions = [] } = useDivisions();
  const { data: districts = [] } = useDistricts(selectedDivisionId);
  const { data: upazilas = [] } = useUpazilas(selectedDistrictId);
  const { data: unions = [] } = useUnions(selectedUpazilaId);

  // Local helper for name
  const getName = (item?: { nameBn: string; nameEn: string } | null) => {
    if (!item) return '';
    return locale === 'bn' ? item.nameBn : item.nameEn;
  };

  const filteredDistricts = useMemo(() => {
    if (!filterQuery.trim()) return districts;
    const q = filterQuery.toLowerCase();
    return districts.filter(
      (d) =>
        d.nameBn.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q),
    );
  }, [districts, filterQuery]);

  const filteredUpazilas = useMemo(() => {
    if (!filterQuery.trim()) return upazilas;
    const q = filterQuery.toLowerCase();
    return upazilas.filter(
      (u) =>
        u.nameBn.toLowerCase().includes(q) || u.nameEn.toLowerCase().includes(q),
    );
  }, [upazilas, filterQuery]);

  const filteredUnions = useMemo(() => {
    if (!filterQuery.trim()) return unions;
    const q = filterQuery.toLowerCase();
    return unions.filter(
      (u) =>
        u.nameBn.toLowerCase().includes(q) || u.nameEn.toLowerCase().includes(q),
    );
  }, [unions, filterQuery]);

  const handleSelectDistrict = (d: LocationDistrict) => {
    setSelectedDistrictId(d.id);
    setSelectedUpazilaId(null);
    setSelectedUnionId(null);
  };

  const handleSelectUpazila = (u: LocationUpazila) => {
    setSelectedUpazilaId(u.id);
    setSelectedUnionId(null);

    const divObj = divisions.find((dv) => dv.id === selectedDivisionId);
    const distObj = districts.find((dt) => dt.id === selectedDistrictId);

    onChange({
      divisionId: selectedDivisionId,
      divisionName: getName(divObj),
      districtId: selectedDistrictId!,
      districtName: getName(distObj),
      upazilaId: u.id,
      upazilaName: getName(u),
      unionId: null,
      unionName: null,
    });
  };

  const handleSelectUnion = (un: LocationUnion) => {
    setSelectedUnionId(un.id);

    const divObj = divisions.find((dv) => dv.id === selectedDivisionId);
    const distObj = districts.find((dt) => dt.id === selectedDistrictId);
    const upzObj = upazilas.find((up) => up.id === selectedUpazilaId);

    onChange({
      divisionId: selectedDivisionId,
      divisionName: getName(divObj),
      districtId: selectedDistrictId!,
      districtName: getName(distObj),
      upazilaId: selectedUpazilaId!,
      upazilaName: getName(upzObj),
      unionId: un.id,
      unionName: getName(un),
    });
  };

  const currentSummary = useMemo(() => {
    if (!selectedDistrictId || !selectedUpazilaId) return null;
    const dist = districts.find((d) => d.id === selectedDistrictId);
    const upz = upazilas.find((u) => u.id === selectedUpazilaId);
    const un = unions.find((u) => u.id === selectedUnionId);
    const parts = [getName(un), getName(upz), getName(dist)].filter(Boolean);
    return parts.join(', ');
  }, [selectedDistrictId, selectedUpazilaId, selectedUnionId, districts, upazilas, unions, locale]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current selection banner */}
      {currentSummary && (
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--ph-accent-soft)] px-4 py-3 text-[var(--ph-accent)] border border-[var(--ph-accent)]/20">
          <MapPin className="h-4 w-4 shrink-0" />
          <div className="flex-1 truncate tx-subhead-strong">
            {currentSummary}
          </div>
          <Check className="h-4 w-4 shrink-0" />
        </div>
      )}

      {/* Division chips */}
      <div>
        <label className="mb-2 block tx-footnote text-[var(--ph-text-secondary)] font-medium">
          1. {t('pickDivision')}
        </label>
        <div className="flex flex-wrap gap-2">
          {divisions.map((div) => {
            const isSel = selectedDivisionId === div.id;
            return (
              <PhChip
                key={div.id}
                label={getName(div)}
                selected={isSel}
                dense
                onTap={() => {
                  setSelectedDivisionId(div.id);
                  setSelectedDistrictId(null);
                  setSelectedUpazilaId(null);
                  setSelectedUnionId(null);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* District & Upazila Cascading Selector */}
      {selectedDivisionId && (
        <div className="space-y-3 pt-2 border-t border-[var(--ph-border)]">
          <div className="flex items-center justify-between">
            <label className="block tx-footnote text-[var(--ph-text-secondary)] font-medium">
              2. {t('pickDistrict')}
            </label>
            <span className="tx-caption text-[var(--ph-text-tertiary)]">
              {filteredDistricts.length} {t('pickDistrict').toLowerCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredDistricts.map((d) => {
              const isSel = selectedDistrictId === d.id;
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => handleSelectDistrict(d)}
                  className={cn(
                    'flex items-center justify-between rounded-xl p-2.5 text-left text-sm transition-all',
                    isSel
                      ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] font-semibold shadow-sm'
                      : 'bg-[var(--ph-surface)] text-[var(--ph-text)] hover:bg-[var(--ph-surface-alt)] border border-[var(--ph-border)]',
                  )}
                >
                  <span className="truncate">{getName(d)}</span>
                  <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 opacity-60', isSel && 'opacity-100')} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDistrictId && (
        <div className="space-y-3 pt-2 border-t border-[var(--ph-border)]">
          <div className="flex items-center justify-between">
            <label className="block tx-footnote text-[var(--ph-text-secondary)] font-medium">
              3. {t('pickUpazila')}
            </label>
            <span className="tx-caption text-[var(--ph-text-tertiary)]">
              {filteredUpazilas.length} {t('pickUpazila').toLowerCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredUpazilas.map((u) => {
              const isSel = selectedUpazilaId === u.id;
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => handleSelectUpazila(u)}
                  className={cn(
                    'flex items-center justify-between rounded-xl p-2.5 text-left text-sm transition-all',
                    isSel
                      ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] font-semibold shadow-sm'
                      : 'bg-[var(--ph-surface)] text-[var(--ph-text)] hover:bg-[var(--ph-surface-alt)] border border-[var(--ph-border)]',
                  )}
                >
                  <span className="truncate">{getName(u)}</span>
                  {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showUnion && selectedUpazilaId && unions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-[var(--ph-border)]">
          <div className="flex items-center justify-between">
            <label className="block tx-footnote text-[var(--ph-text-secondary)] font-medium">
              4. {t('pickUnion')}
            </label>
            <span className="tx-caption text-[var(--ph-text-tertiary)]">
              {filteredUnions.length} {t('pickUnion').toLowerCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredUnions.map((un) => {
              const isSel = selectedUnionId === un.id;
              return (
                <button
                  type="button"
                  key={un.id}
                  onClick={() => handleSelectUnion(un)}
                  className={cn(
                    'flex items-center justify-between rounded-xl p-2.5 text-left text-sm transition-all',
                    isSel
                      ? 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] font-semibold shadow-sm'
                      : 'bg-[var(--ph-surface)] text-[var(--ph-text)] hover:bg-[var(--ph-surface-alt)] border border-[var(--ph-border)]',
                  )}
                >
                  <span className="truncate">{getName(un)}</span>
                  {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

