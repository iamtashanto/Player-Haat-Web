'use client';

import React, { useRef, useState } from 'react';
import { BadgeCheck, ImagePlus, Link2, X } from 'lucide-react';
import { PhBadge, PhButton, PhCard, PhTextField } from '@/design-system';
import { useRouter } from '@/i18n/routing';
import { uploadImage } from '@/lib/api/media';
import { useRecruiterVerification, useStatsVerification, useSubmitVerification } from '@/lib/api/verification';
import { Screen, useFmt } from '@/components/app/kit';

function Form({ sportId, onSent }: { sportId?: number; onSent: () => void }) {
  const { t, fail, ok } = useFmt();
  const submit = useSubmitVerification();
  const [note, setNote] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [images, setImages] = useState<{ publicId: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const addLink = () => {
    try {
      const u = new URL(link.trim());
      if (links.length < 3 && /^https?:$/.test(u.protocol)) setLinks([...links, u.toString()]);
      setLink('');
    } catch {
      fail(new Error('invalid'));
    }
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    setUploading(true);
    try {
      const r = await uploadImage('verification-doc', f);
      setImages((cur) => [...cur, { publicId: r.publicId, url: r.url }].slice(0, 3));
    } catch (e) {
      fail(e);
    } finally {
      setUploading(false);
    }
  };
  const go = async () => {
    try {
      await submit.mutateAsync({ sportId, body: { note: note.trim(), evidenceLinks: links, evidenceImages: images.map((i) => ({ publicId: i.publicId })) } });
      ok(t('verifySentToast'));
      onSent();
    } catch (e) {
      fail(e);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="tx-body text-[var(--ph-text-secondary)]">{t(sportId ? 'verifyStatsBody' : 'verifyRecruiterBody')}</p>
      <PhTextField placeholder={t('verifyNoteHint')} multiline rows={3} maxLength={500} value={note} onChange={setNote} />
      <div>
        <div className="flex gap-2">
          <div className="flex-1"><PhTextField placeholder={t('verifyLinkHint')} type="url" value={link} onChange={setLink} /></div>
          <PhButton label={t('verifyAddLink')} icon={<Link2 className="h-4 w-4" />} variant="secondary" expand={false} disabled={!link.trim() || links.length >= 3} onPressed={addLink} />
        </div>
        {links.map((l) => (
          <div key={l} className="mt-2 flex items-center gap-2 tx-footnote">
            <span className="min-w-0 flex-1 truncate">{l}</span>
            <button type="button" aria-label={t('remove')} onClick={() => setLinks(links.filter((x) => x !== l))}><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div>
        <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
        <PhButton label={t('verifyAddDoc')} icon={<ImagePlus className="h-4 w-4" />} variant="secondary" loading={uploading} disabled={images.length >= 3} onPressed={() => file.current?.click()} />
        <div className="mt-2 flex gap-2">
          {images.map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i.publicId} src={i.url} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
          ))}
        </div>
      </div>
      <PhButton label={t('verifySubmit')} loading={submit.isPending} disabled={!note.trim() || (links.length === 0 && images.length === 0)} onPressed={() => void go()} />
      {links.length === 0 && images.length === 0 && <p className="tx-footnote text-[var(--ph-text-tertiary)]">{t('verifyNeedEvidence')}</p>}
    </div>
  );
}

/** Ask for the verified badge: recruiter (no `sportId`) or a player's stats for one sport. */
export default function VerifyView({ sportId }: { sportId?: number }) {
  const { t, date } = useFmt();
  const router = useRouter();
  const recruiter = useRecruiterVerification();
  const stats = useStatsVerification(sportId ?? 0);
  const q = sportId ? stats : recruiter;
  const v = q.data;
  const [again, setAgain] = useState(false);
  return (
    <Screen title={t(sportId ? 'verifyStatsTitle' : 'verifyRecruiterTitle')} back>
      <div className="mx-auto max-w-xl">
        {q.isLoading ? null : v && !again ? (
          <PhCard paddingClassName="p-5">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 text-[var(--ph-accent)]" aria-hidden />
              <div className="tx-headline flex-1">{t(v.status === 'PENDING' ? 'verifyPending' : v.status === 'APPROVED' ? 'verifyApproved' : 'verifyRejected')}</div>
              <PhBadge tone={v.status === 'APPROVED' ? 'accent' : v.status === 'PENDING' ? 'warning' : 'danger'} label={date(v.createdAt)} />
            </div>
            {v.status === 'PENDING' && <p className="tx-subhead mt-2">{t('verifyPendingBody')}</p>}
            {v.reviewNote && <p className="tx-subhead mt-2">{v.reviewNote}</p>}
            {v.status === 'REJECTED' && <div className="mt-4"><PhButton label={t('verifyTryAgain')} onPressed={() => setAgain(true)} /></div>}
          </PhCard>
        ) : (
          <Form sportId={sportId} onSent={() => { setAgain(false); void q.refetch(); router.back(); }} />
        )}
      </div>
    </Screen>
  );
}
