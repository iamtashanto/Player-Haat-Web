'use client';

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { PhBottomSheet, PhButton, PhChip, PhTextField } from '@/design-system';
import { CascadingLocationPicker, type SelectedLocationValue } from '@/components/shared/cascading-location-picker';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { useCreateRecruiterProfile, useMyRecruiterProfile, useRecruiterTypes, useUpdateRecruiterProfile, type RecruiterTypeCode } from '@/lib/recruiter-api';
import { useSports } from '@/components/app/cards';
import { Screen, useFmt } from '@/components/app/kit';

/** Recruiter setup (required before searching players) and edit. */
export default function SetupRecruiterView({ editing = false }: { editing?: boolean }) {
  const { t, name, fail, ok } = useFmt();
  const router = useRouter();
  const { refreshMe } = useAuth();
  const { sports } = useSports();
  const types = useRecruiterTypes();
  const mine = useMyRecruiterProfile();
  const create = useCreateRecruiterProfile();
  const update = useUpdateRecruiterProfile();
  const [type, setType] = useState<RecruiterTypeCode | undefined>();
  const [org, setOrg] = useState('');
  const [bio, setBio] = useState('');
  const [sportIds, setSportIds] = useState<number[]>([]);
  const [area, setArea] = useState<SelectedLocationValue | null>(null);
  const [pickArea, setPickArea] = useState(false);
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const m = mine.data;
    if (editing && m && !loaded) {
      setType(m.type);
      setOrg(m.organization ?? '');
      setBio(m.bio ?? '');
      setSportIds(m.sportIds);
      setDistrictId(m.district.id);
      setLoaded(true);
    }
  }, [editing, mine.data, loaded]);

  const district = area?.districtId ?? districtId;
  const valid = !!type && !!district && sportIds.length > 0;
  const busy = create.isPending || update.isPending;

  const submit = async () => {
    if (!type || !district) return;
    const body = { type, organization: org.trim() || null, bio: bio.trim() || null, districtId: district, sportIds };
    try {
      if (editing) await update.mutateAsync(body);
      else await create.mutateAsync(body);
      await refreshMe();
      ok(t('recruiterSetupDone'));
      router.replace(editing ? '/me' : '/home');
    } catch (e) {
      fail(e);
    }
  };

  const label = (k: string) => <div className="tx-subhead-strong mb-2 mt-5">{k}</div>;
  return (
    <Screen title={t(editing ? 'recruiterEditTitle' : 'recruiterSetupTitle')} subtitle={editing ? undefined : t('recruiterSetupBody')} back={editing}>
      <div className="mx-auto max-w-xl lg:rounded-[28px] lg:border-[0.5px] lg:border-[var(--ph-border)] lg:bg-[var(--ph-surface)] lg:p-8">
        {label(t('recruiterTypeLabel'))}
        <div className="flex flex-wrap gap-2">
          {types.data?.map((x) => (
            <PhChip key={x.code} label={name(x)} selected={type === x.code} onTap={() => setType(x.code)} />
          ))}
        </div>
        <div className="mt-5"><PhTextField label={t('recruiterOrganization')} placeholder={t('recruiterOrganizationHint')} maxLength={100} value={org} onChange={setOrg} /></div>
        {label(t('recruiterSports'))}
        <div className="flex flex-wrap gap-2">
          {sports.map((s) => (
            <PhChip key={s.id} label={name(s)} selected={sportIds.includes(s.id)} onTap={() => setSportIds((cur) => (cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id]))} />
          ))}
        </div>
        {label(t('filterArea'))}
        <PhChip icon={<MapPin className="h-3.5 w-3.5" />} label={area ? `${area.districtName}` : districtId ? (name(mine.data?.district) || t('changeLocation')) : t('pickLocation')} selected={!!district} onTap={() => setPickArea(true)} />
        <PhBottomSheet open={pickArea} onOpenChange={setPickArea} title={t('placePickerTitle')}>
          <CascadingLocationPicker showUnion={false} value={area} onChange={(v) => { setArea(v); setPickArea(false); }} />
        </PhBottomSheet>
        <div className="mt-5"><PhTextField label={t('recruiterBio')} multiline rows={4} maxLength={500} value={bio} onChange={setBio} /></div>
        <div className="mt-6"><PhButton label={t('recruiterSetupFinish')} loading={busy} disabled={!valid} onPressed={() => void submit()} /></div>
      </div>
    </Screen>
  );
}
