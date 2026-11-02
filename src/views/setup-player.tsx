'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PhAvatar, PhBottomSheet, PhButton, PhChip, PhTextField } from '@/design-system';
import { CascadingLocationPicker, type SelectedLocationValue } from '@/components/shared/cascading-location-picker';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { useAddSportProfile, useCreatePlayerProfile } from '@/lib/player-api';
import { uploadAvatar } from '@/lib/api/media';
import { SportFields, emptySportForm, sportBody, type SportForm } from '@/components/app/sport-editor';
import { useSports } from '@/components/app/cards';
import { useFmt } from '@/components/app/kit';

/** First-run player setup: name & photo → sport → place → finish. Same order as the app; skippable. */
export default function SetupPlayerView() {
  const { t, name, fail, ok } = useFmt();
  const router = useRouter();
  const { me, refreshMe } = useAuth();
  const { sports, sportById } = useSports();
  const createProfile = useCreatePlayerProfile();
  const addSport = useAddSportProfile();
  const file = useRef<HTMLInputElement>(null);

  const total = 4;
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(me?.name ?? '');
  const [avatar, setAvatar] = useState<string | null>(me?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<SportForm>(emptySportForm());
  const [area, setArea] = useState<SelectedLocationValue | null>(null);
  const [pickArea, setPickArea] = useState(false);
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);
  const sport = sportById(form.sportId);

  const onPhoto = async (f?: File) => {
    if (!f) return;
    setUploading(true);
    try {
      setAvatar((await uploadAvatar(f)).avatarUrl);
    } catch (e) {
      fail(e);
    } finally {
      setUploading(false);
    }
  };

  const canNext = step === 1 ? fullName.trim().length >= 2 : step === 2 ? !!form.sportId && form.positions.length > 0 : step === 3 ? !!area : true;

  const next = async () => {
    if (step < total) return setStep(step + 1);
    if (!area || !form.sportId) return;
    setBusy(true);
    try {
      if (fullName.trim() !== me?.name) await apiRequest('/users/me', { method: 'PATCH', body: { name: fullName.trim() } });
      await createProfile.mutateAsync({ bio: bio.trim() || null, districtId: area.districtId, upazilaId: area.upazilaId, unionId: area.unionId ?? null, isVisible: true, contactVisibility: 'ON_TAP' });
      await addSport.mutateAsync({ sportId: form.sportId, ...sportBody(form, sport) });
      await refreshMe();
      ok(t('setupDone'));
      router.replace('/home');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const titles = [t('stepNameTitle'), t('stepSportsTitle'), t('stepLocationTitle'), t('finishSetup')];
  const bodies = [t('stepNameBody'), t('stepSportsBody'), t('stepLocationBody'), t('setupDone')];

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <button type="button" onClick={() => (step > 1 ? setStep(step - 1) : router.replace('/home'))} className="inline-flex min-h-11 items-center gap-1.5 tx-subhead text-[var(--ph-text-secondary)]">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {step > 1 ? t('back') : t('setupSkip')}
        </button>
        <span className="tx-footnote text-[var(--ph-text-tertiary)]">{t('stepOf', { current: step, total })}</span>
        <button type="button" onClick={() => router.replace('/home')} className="min-h-11 tx-subhead text-[var(--ph-text-secondary)]">{t('setupSkip')}</button>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--ph-border)]" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
        <div className="h-full rounded-full bg-[var(--ph-accent)] transition-[width] duration-300" style={{ width: `${(step / total) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
          <h1 className="tx-title1">{titles[step - 1]}</h1>
          <p className="tx-subhead mt-1">{bodies[step - 1]}</p>

          {step === 1 && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <button type="button" onClick={() => file.current?.click()} aria-label={avatar ? t('changePhoto') : t('addPhoto')} className="relative">
                <PhAvatar name={fullName || '?'} url={avatar} size={112} />
                <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ph-accent)] text-[var(--ph-accent-on)]"><Camera className="h-4 w-4" /></span>
              </button>
              <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              <span className="tx-subhead text-[var(--ph-accent)]">{uploading ? '…' : avatar ? t('changePhoto') : t('addPhoto')}</span>
              <div className="w-full"><PhTextField label={t('nameLabel')} value={fullName} onChange={setFullName} maxLength={80} autoComplete="name" /></div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                  <PhChip key={s.id} label={name(s)} selected={form.sportId === s.id} onTap={() => setForm({ ...emptySportForm(s.id) })} />
                ))}
              </div>
              {sport && <SportFields value={form} onChange={setForm} sport={sport} />}
            </div>
          )}

          {step === 3 && (
            <div className="mt-6">
              <PhChip icon={<MapPin className="h-3.5 w-3.5" />} label={area ? `${area.upazilaName}, ${area.districtName}` : t('pickLocation')} selected={!!area} onTap={() => setPickArea(true)} />
              <div className="mt-5"><PhTextField label={t('bioLabel')} placeholder={t('bioHint')} multiline rows={4} maxLength={500} value={bio} onChange={setBio} /></div>
              <PhBottomSheet open={pickArea} onOpenChange={setPickArea} title={t('placePickerTitle')}>
                <CascadingLocationPicker value={area} onChange={(v) => { setArea(v); setPickArea(false); }} />
              </PhBottomSheet>
            </div>
          )}

          {step === 4 && (
            <div className="mt-6 rounded-[22px] border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)] p-4">
              <div className="flex items-center gap-3">
                <PhAvatar name={fullName} url={avatar} size={52} />
                <div>
                  <div className="tx-headline">{fullName}</div>
                  <div className="tx-subhead">{name(sport)} · {area?.upazilaName}, {area?.districtName}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8">
        <PhButton label={step === total ? t('finishSetup') : t('continueLabel')} loading={busy} disabled={!canNext} onPressed={() => void next()} />
      </div>
    </div>
  );
}
