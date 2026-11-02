'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
  CardSkeleton,
  EmptyState,
  ErrorState,
  PhBackButton,
  PhButton,
  PhLargeTitleBar,
  showPhToast,
} from '@/design-system';
import { useRouter, type AppLocale } from '@/i18n/routing';
import { getErrorText } from '@/lib/errors';
import { formatDate, formatDateShort, formatMoney, formatNumber, formatTime } from '@/lib/format';

type Named = { nameBn: string; nameEn: string };

/** Translation + formatting helpers every screen needs, locale-aware (Bangla digits and dates in `bn`). */
export function useFmt() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const name = (n?: Named | null) => (n ? (locale === 'bn' ? n.nameBn : n.nameEn) : '');
  return {
    t,
    locale,
    name,
    num: (n: number) => formatNumber(n, locale),
    money: (n: number) => formatMoney(n, locale),
    date: (d: string | Date) => formatDate(d, locale),
    dateShort: (d: string | Date) => formatDateShort(d, locale),
    time: (d: string | Date) => formatTime(d, locale),
    /** "5 min ago", "3 h ago", "2 d ago", else a date. */
    ago: (iso: string) => {
      const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
      if (mins < 1) return t('justNow');
      if (mins < 60) return t('minutesAgo', { count: formatNumber(mins, locale) });
      if (mins < 1440) return t('hoursAgo', { count: formatNumber(Math.round(mins / 60), locale) });
      if (mins < 10080) return t('daysAgo', { count: formatNumber(Math.round(mins / 1440), locale) });
      return formatDateShort(iso, locale);
    },
    err: (e: unknown) => getErrorText((k) => t(k), e),
    /** Shows a translated error toast. */
    fail: (e: unknown) => showPhToast(getErrorText((k) => t(k), e), 'error'),
    ok: (msg: string) => showPhToast(msg, 'success'),
  };
}

export function Screen({
  title,
  subtitle,
  back,
  actions,
  children,
  large = true,
}: {
  title: string;
  subtitle?: string;
  /** Show a back button (detail screens). */
  back?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  large?: boolean;
}) {
  const { t } = useFmt();
  const router = useRouter();
  return (
    <>
      <PhLargeTitleBar
        title={title}
        subtitle={subtitle}
        largeTitle={large}
        leading={back ? <PhBackButton label={t('back')} onPressed={() => router.back()} /> : undefined}
        actions={actions}
      />
      <div className="px-4 pb-10 md:px-8">{children}</div>
    </>
  );
}

interface QueryLike {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

/** Loading → error (with retry) → empty → children, on every list screen. */
export function QueryState({
  query,
  empty,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  skeletons = 4,
  children,
}: {
  query: QueryLike;
  isEmpty: boolean;
  empty?: never;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyMessage?: string;
  emptyAction?: { label: string; onAction: () => void };
  skeletons?: number;
  children: React.ReactNode;
}) {
  const { t, err } = useFmt();
  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: skeletons }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return <ErrorState title={t('errorTitle')} message={err(query.error)} retryLabel={t('retry')} onRetry={() => void query.refetch()} />;
  }
  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onAction}
      />
    );
  }
  return <>{children}</>;
}

/** "Load more" for cursor lists; also loads on scroll when the sentinel nears the viewport. */
export function LoadMore({ hasNext, loading, onMore }: { hasNext: boolean; loading: boolean; onMore: () => void }) {
  const { t } = useFmt();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!hasNext || loading || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && onMore(), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, loading, onMore]);
  if (!hasNext) return null;
  return (
    <div ref={ref} className="flex justify-center py-4">
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-[var(--ph-text-tertiary)]" aria-hidden /> : <PhButton label={t('loadMore')} variant="ghost" expand={false} onPressed={onMore} />}
    </div>
  );
}

/** Section title row used on home/detail screens. */
export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="tx-title3 text-[var(--ph-text)]">{children}</h2>
      {action}
    </div>
  );
}
