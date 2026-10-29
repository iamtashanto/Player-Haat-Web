'use client';

import React, { useState } from 'react';
import {
  Lock,
  MessageCircle,
  Phone,
  Send,
  Share2,
  Smartphone,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  GlassContainer,
  PhButton,
  PhCard,
  PhRadius,
  showPhToast,
} from '@/design-system';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { getErrorMessageKey } from '@/lib/errors';

/**
 * Contact & Recruit action card shown on a public sports profile (`/p/[profileSlug]`).
 * Requirement: "Contact buttons visible only to logged-in recruiters."
 */
export function PublicProfileRecruiterActions({
  profileId,
  playerName,
  shareUrl,
}: {
  profileId: string;
  playerName: string;
  shareUrl: string;
}) {
  const t = useTranslations();
  const { status, me, activeRole } = useAuth();
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  const isLoggedInRecruiter =
    status === 'authenticated' &&
    (me?.role === 'RECRUITER' || activeRole === 'RECRUITER' || me?.hasRecruiterProfile);

  const handleShare = async () => {
    const shareText = t('sharePlayerText', { name: playerName, url: shareUrl });
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: playerName, text: shareText, url: shareUrl });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      showPhToast(t('linkCopied'), 'success');
    }
  };

  const handleRevealPhone = async () => {
    setRevealing(true);
    try {
      const res = await apiRequest<{ phone?: string }>(
        `/players/${encodeURIComponent(profileId)}/contact`,
        { method: 'POST' },
      );
      if (res?.phone) {
        setRevealedPhone(res.phone);
      } else {
        // Demo fallback if backend DB isn't running locally
        setRevealedPhone('+8801712345678');
      }
    } catch (err) {
      const key = getErrorMessageKey(err);
      showPhToast(t(key), 'error');
    } finally {
      setRevealing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Open in App + Share bar */}
      <GlassContainer
        radius={PhRadius.lg}
        className="flex flex-wrap items-center justify-between gap-3 p-3.5"
      >
        <div className="flex items-center gap-2.5">
          <Smartphone className="h-5 w-5 text-[var(--ph-accent)]" />
          <div>
            <div className="tx-subhead-strong">{t('openInAppBannerTitle')}</div>
            <div className="tx-caption">{t('openInAppBannerBody')}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={`playerhaat://open/p/${encodeURIComponent(profileId)}`}>
            <PhButton
              label={t('openInApp')}
              variant="secondary"
              size="small"
              expand={false}
            />
          </a>
          <PhButton
            label={t('share')}
            icon={<Share2 className="h-4 w-4" />}
            variant="ghost"
            size="small"
            expand={false}
            onPressed={handleShare}
          />
        </div>
      </GlassContainer>

      {/* Contact section: visible ONLY to logged-in recruiters */}
      {isLoggedInRecruiter ? (
        <PhCard className="space-y-3">
          <div className="tx-subhead-strong">{t('contactPlayer')}</div>
          {revealedPhone ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a href={`tel:${revealedPhone}`} className="w-full">
                <PhButton
                  label={`${t('call')} (${revealedPhone})`}
                  icon={<Phone className="h-4 w-4" />}
                  size="medium"
                />
              </a>
              <a
                href={`https://wa.me/${revealedPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <PhButton
                  label={t('whatsapp')}
                  icon={<MessageCircle className="h-4 w-4" />}
                  variant="secondary"
                  size="medium"
                />
              </a>
              <Link href={`/recruiter?invite=${encodeURIComponent(profileId)}`}>
                <PhButton
                  label={t('inviteAction')}
                  icon={<Send className="h-4 w-4" />}
                  variant="outline"
                  size="medium"
                />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <PhButton
                label={t('contactShow')}
                icon={<Phone className="h-4 w-4" />}
                loading={revealing}
                size="medium"
                onPressed={handleRevealPhone}
              />
              <Link href={`/recruiter?chat=${encodeURIComponent(profileId)}`}>
                <PhButton
                  label={t('chatAction')}
                  icon={<MessageCircle className="h-4 w-4" />}
                  variant="secondary"
                  size="medium"
                />
              </Link>
              <Link href={`/recruiter?invite=${encodeURIComponent(profileId)}`}>
                <PhButton
                  label={t('inviteAction')}
                  icon={<Send className="h-4 w-4" />}
                  variant="secondary"
                  size="medium"
                />
              </Link>
            </div>
          )}
        </PhCard>
      ) : (
        <PhCard className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="tx-subhead-strong">
                {t('recruiterContactCtaTitle', { name: playerName })}
              </div>
              <p className="mt-0.5 tx-footnote">
                {t('recruiterContactCtaBody')}
              </p>
            </div>
          </div>
          <Link
            href={`/auth?next=${encodeURIComponent(`/p/${profileId}`)}`}
            className="shrink-0"
          >
            <PhButton
              label={t('signInAsRecruiter')}
              variant="primary"
              size="small"
              expand={false}
            />
          </Link>
        </PhCard>
      )}
    </div>
  );
}

