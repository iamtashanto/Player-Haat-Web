'use client';

import React, { useRef, useState } from 'react';
import { BadgeCheck, Camera, ImagePlus, MapPin, Plus, Trash2 } from 'lucide-react';
import { PhAvatar, PhBottomSheet, PhButton, PhCard, PhChip, PhSegmented, PhSwitchTile, PhTextField } from '@/design-system';
import { CascadingLocationPicker, type SelectedLocationValue } from '@/components/shared/cascading-location-picker';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { useAddAchievement, useAddSportProfile, useAddVideo, useDeleteAchievement, useDeleteMedia, useDeleteSportProfile, useMyPlayerProfile, useUpdatePlayerProfile, useUpdateSportProfile, type PlayerSportProfile } from '@/lib/player-api';
import { uploadAvatar, uploadPlayerPhoto } from '@/lib/api/media';
import { SportFields, emptySportForm, formFromSport, sportBody, type SportForm } from '@/components/app/sport-editor';
import { ConfirmSheet } from '@/components/app/actions';
import { QueryState, Screen, SectionTitle, useFmt } from '@/components/app/kit';
import { useSports } from '@/components/app/cards';

export default function EditProfileView() {
  const { t, name, fail, ok } = useFmt();
  const router = useRouter();
  const { me, refreshMe } = useAuth();
  const q = useMyPlayerProfile();
  const { sports, sportById } = useSports();
  const update = useUpdatePlayerProfile();
  const addSport = useAddSportProfile();
  const updSport = useUpdateSportProfile();
  const delSport = useDeleteSportProfile();
  const addAch = useAddAchievement();
  const delAch = useDeleteAchievement();
  const addVideo = useAddVideo();
  const delMedia = useDeleteMedia();
  const avatarInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const p = q.data;
  const [fullName, setFullName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [pickArea, setPickArea] = useState(false);
  const [editor, setEditor] = useState<SportForm | null>(null);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [ach, setAch] = useState<{ sportId: number; title: string; year: string } | null>(null);
  const [video, setVideo] = useState('');
  const [busy, setBusy] = useState(false);

  const guard = async (fn: () => Promise<unknown>, done?: string) => {
    try {
      await fn();
      if (done) ok(done);
    } catch (e) {
      fail(e);
    }
  };

  const saveBasics = () =>
    guard(async () => {
      if (fullName !== null && fullName.trim() !== me?.name) {
        await apiRequest('/users/me', { method: 'PATCH', body: { name: fullName.trim() } });
        await refreshMe();
      }
      if (bio !== null) await update.mutateAsync({ bio: bio.trim() || null });
    }, t('saved'));

  const saveSport = async () => {
    if (!editor?.sportId) return;
    setBusy(true);
    await guard(async () => {
      const body = sportBody(editor, sportById(editor.sportId));
      if (editing) await updSport.mutateAsync({ sportId: editor.sportId!, body });
      else await addSport.mutateAsync({ sportId: editor.sportId!, ...body });
      setEditor(null);
    }, t('saved'));
    setBusy(false);
  };

  const existingIds = new Set(p?.sports.map((s) => s.sportId));

  return (
    <Screen title={t('editProfile')} back>
      <QueryState query={q} isEmpty={!p} emptyIcon={<Camera className="h-6 w-6" />} emptyTitle={t('createPlayerProfile')} emptyMessage={t('createPlayerProfileBody')} emptyAction={{ label: t('createProfileCta'), onAction: () => router.push('/setup') }}>
        {p && (
          <div className="mx-auto grid max-w-3xl gap-4">
            <PhCard paddingClassName="p-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => avatarInput.current?.click()} aria-label={t('changePhoto')} className="relative shrink-0">
                  <PhAvatar name={me?.name ?? ''} url={me?.avatarUrl} size={72} />
                  <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ph-accent)] text-[var(--ph-accent-on)]"><Camera className="h-4 w-4" /></span>
                </button>
                <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void guard(async () => { await uploadAvatar(f); await refreshMe(); }, t('saved')); }} />
                <div className="min-w-0 flex-1"><PhTextField label={t('nameLabel')} value={fullName ?? me?.name ?? ''} onChange={setFullName} maxLength={80} /></div>
              </div>
              <div className="mt-4"><PhTextField label={t('bioLabel')} placeholder={t('bioHint')} multiline rows={3} maxLength={500} value={bio ?? p.bio ?? ''} onChange={setBio} /></div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PhChip icon={<MapPin className="h-3.5 w-3.5" />} label={`${name(p.location.upazila)}, ${name(p.location.district)}`} onTap={() => setPickArea(true)} />
                <PhButton label={t('save')} expand={false} loading={update.isPending} disabled={fullName === null && bio === null} onPressed={() => void saveBasics()} />
              </div>
            </PhCard>

            <PhCard paddingClassName="p-4">
              <PhSwitchTile title={t('profileVisible')} subtitle={p.hiddenByAdmin ? t('adminHidden') : t('profileVisibleHint')} value={p.isVisible} onChanged={(v) => void guard(() => update.mutateAsync({ isVisible: v }))} />
              <div className="tx-subhead-strong mb-2 mt-4">{t('contactVisibilityTitle')}</div>
              <PhSegmented options={{ ON_TAP: t('contactVisibilityTap'), AFTER_ACCEPT: t('contactVisibilityAccept') }} value={p.contactVisibility} onChanged={(v) => void guard(() => update.mutateAsync({ contactVisibility: v }))} />
              <p className="tx-footnote mt-1 text-[var(--ph-text-tertiary)]">{t(p.contactVisibility === 'ON_TAP' ? 'contactVisibilityTapHint' : 'contactVisibilityAcceptHint')}</p>
            </PhCard>

            <SectionTitle action={sports.some((s) => !existingIds.has(s.id)) ? <PhButton label={t('addSport')} icon={<Plus className="h-4 w-4" />} size="small" variant="secondary" expand={false} onPressed={() => { setEditing(false); setEditor(emptySportForm(sports.find((s) => !existingIds.has(s.id))?.id)); }} /> : undefined}>{t('manageSports')}</SectionTitle>
            {p.sports.map((s: PlayerSportProfile) => (
              <PhCard key={s.sportId} paddingClassName="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="tx-headline flex-1">{name(sportById(s.sportId))}</h3>
                  {s.hiddenByAdmin && <span className="tx-footnote text-[var(--ph-danger)]">{t('sportAdminHidden')}</span>}
                  {s.isVisible === false && <span className="tx-footnote text-[var(--ph-text-tertiary)]">{t('sportHiddenBadge')}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PhButton label={t('edit')} size="small" variant="secondary" expand={false} onPressed={() => { setEditing(true); setEditor(formFromSport(s)); }} />
                  <PhButton label={s.statsVerified ? t('statsVerifiedBadge') : t('verifyStatsTitle')} icon={<BadgeCheck className="h-4 w-4" />} size="small" variant="secondary" expand={false} onPressed={() => router.push(`/verify/stats/${s.sportId}`)} />
                  {p.sports.length > 1 && <PhButton label={t('remove')} icon={<Trash2 className="h-4 w-4" />} size="small" variant="ghost" expand={false} onPressed={() => setRemoving(s.sportId)} />}
                </div>
                <div className="tx-subhead-strong mt-4">{t('achievementsLabel')}</div>
                <ul className="mt-1 flex flex-col gap-1">
                  {s.achievements?.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 tx-footnote">
                      <span className="min-w-0 flex-1 truncate">{a.title}{a.year ? ` · ${a.year}` : ''}</span>
                      <button type="button" aria-label={t('remove')} className="p-2" onClick={() => void guard(() => delAch.mutateAsync({ sportId: s.sportId, achievementId: a.id }))}><Trash2 className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
                <PhButton label={t('achievementAdd')} icon={<Plus className="h-4 w-4" />} size="small" variant="ghost" expand={false} onPressed={() => setAch({ sportId: s.sportId, title: '', year: '' })} />
              </PhCard>
            ))}

            <SectionTitle>{t('mediaManage')}</SectionTitle>
            <PhCard paddingClassName="p-4">
              <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                {p.media.filter((m) => m.type === 'PHOTO').map((m) => (
                  <div key={m.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="aspect-square w-full rounded-[12px] object-cover" />
                    <button type="button" aria-label={t('remove')} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white" onClick={() => void guard(() => delMedia.mutateAsync(m.id))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void guard(async () => { await uploadPlayerPhoto(f); await q.refetch(); }, t('saved')); }} />
              <div className="mt-3"><PhButton label={t('addPhotoAction')} icon={<ImagePlus className="h-4 w-4" />} variant="secondary" expand={false} disabled={p.media.filter((m) => m.type === 'PHOTO').length >= 6} onPressed={() => photoInput.current?.click()} /></div>
              <p className="tx-footnote mt-1 text-[var(--ph-text-tertiary)]">{t('photosLimit')}</p>
              <div className="tx-subhead-strong mb-2 mt-4">{t('videosLabel')}</div>
              {p.media.filter((m) => m.type === 'VIDEO').map((m) => (
                <div key={m.id} className="flex items-center gap-2 tx-footnote"><span className="min-w-0 flex-1 truncate">{m.url}</span><button type="button" aria-label={t('remove')} className="p-2" onClick={() => void guard(() => delMedia.mutateAsync(m.id))}><Trash2 className="h-4 w-4" /></button></div>
              ))}
              <div className="mt-2 flex gap-2">
                <div className="flex-1"><PhTextField placeholder={t('videoUrlHint')} type="url" value={video} onChange={setVideo} /></div>
                <PhButton label={t('addLink')} variant="secondary" expand={false} disabled={!/^https?:\/\//.test(video.trim())} onPressed={() => void guard(async () => { await addVideo.mutateAsync(video.trim()); setVideo(''); })} />
              </div>
            </PhCard>
          </div>
        )}
      </QueryState>

      <PhBottomSheet open={pickArea} onOpenChange={setPickArea} title={t('placePickerTitle')}>
        <CascadingLocationPicker onChange={(v: SelectedLocationValue) => { setPickArea(false); void guard(() => update.mutateAsync({ districtId: v.districtId, upazilaId: v.upazilaId, unionId: v.unionId ?? null }), t('saved')); }} />
      </PhBottomSheet>

      <PhBottomSheet open={!!editor} onOpenChange={(o) => !o && setEditor(null)} title={t('sportEditorTitle')}>
        {editor && (
          <>
            {!editing && (
              <div className="mb-2 flex flex-wrap gap-2">
                {sports.filter((s) => !existingIds.has(s.id)).map((s) => (
                  <PhChip key={s.id} label={name(s)} selected={editor.sportId === s.id} onTap={() => setEditor(emptySportForm(s.id))} />
                ))}
              </div>
            )}
            <SportFields value={editor} onChange={setEditor} sport={sportById(editor.sportId)} />
            <div className="mt-6"><PhButton label={t('save')} loading={busy} disabled={editor.positions.length === 0} onPressed={() => void saveSport()} /></div>
          </>
        )}
      </PhBottomSheet>

      <PhBottomSheet open={!!ach} onOpenChange={(o) => !o && setAch(null)} title={t('achievementsLabel')}>
        {ach && (
          <>
            <PhTextField placeholder={t('achievementTitleHint')} value={ach.title} maxLength={80} onChange={(v) => setAch({ ...ach, title: v })} />
            <div className="mt-3"><PhTextField placeholder={t('achievementYearHint')} type="number" inputMode="numeric" value={ach.year} onChange={(v) => setAch({ ...ach, year: v })} /></div>
            <div className="mt-5"><PhButton label={t('achievementAdd')} disabled={ach.title.trim().length < 2} loading={addAch.isPending} onPressed={() => void guard(async () => { await addAch.mutateAsync({ sportId: ach.sportId, body: { title: ach.title.trim(), year: ach.year ? Number(ach.year) : null } }); setAch(null); })} /></div>
          </>
        )}
      </PhBottomSheet>

      <ConfirmSheet open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)} title={t('removeSportTitle')} body={t('removeSportBody')} confirmLabel={t('remove')} destructive loading={delSport.isPending} onConfirm={() => void guard(async () => { await delSport.mutateAsync(removing!); setRemoving(null); })} />
    </Screen>
  );
}
