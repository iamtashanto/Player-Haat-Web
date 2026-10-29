'use client';

import React from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { PhRadius } from './tokens';
import { PhButton } from './buttons';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  circle?: boolean;
  className?: string;
}

/**
 * Loading placeholder matching Flutter's `Skeleton` (`app/lib/design_system/skeleton.dart`).
 * Shimmers normally; sits still when "Reduce effects" is on.
 */
export function Skeleton({
  width,
  height = 14,
  radius = 8,
  circle = false,
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: circle ? `${height}px` : typeof width === 'number' ? `${width}px` : width ?? '100%',
        height: `${height}px`,
        borderRadius: circle ? '9999px' : `${radius}px`,
      }}
      className={cn('ph-shimmer shrink-0', className)}
    />
  );
}

/**
 * Skeleton shaped like a player/request card matching Flutter's `CardSkeleton`.
 */
export function CardSkeleton({ avatar = true }: { avatar?: boolean }) {
  return (
    <div
      style={{ borderRadius: `${PhRadius.lg}px` }}
      className="flex w-full items-center border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)] p-4"
    >
      {avatar && <Skeleton height={52} circle className="mr-3" />}
      <div className="flex flex-1 flex-col items-start">
        <Skeleton width={140} height={16} />
        <div className="mt-2.5 w-full">
          <Skeleton height={12} />
        </div>
        <div className="mt-2">
          <Skeleton width={90} height={12} />
        </div>
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

/**
 * Friendly empty state: soft icon disc, one sentence, one action.
 * Matches Flutter's `EmptyState` (`app/lib/design_system/states.dart`).
 */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const discSize = compact ? 64 : 84;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-8',
        compact ? 'py-6' : 'py-10',
      )}
    >
      <div
        style={{ width: `${discSize}px`, height: `${discSize}px` }}
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--ph-accent-soft)] to-[var(--ph-accent-soft)]/40 text-[var(--ph-accent)]"
      >
        {icon}
      </div>
      <h3 className="mt-5 tx-title3 text-[var(--ph-text)]">{title}</h3>
      {message && <p className="mt-2 max-w-md tx-subhead">{message}</p>}
      {actionLabel && (
        <div className="mt-6">
          <PhButton
            label={actionLabel}
            onPressed={onAction}
            expand={false}
            size="medium"
          />
        </div>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  title: string;
  message?: string;
  retryLabel: string;
  onRetry: () => void;
  offline?: boolean;
  compact?: boolean;
}

/**
 * Error state with retry matching Flutter's `ErrorState`.
 */
export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
  offline = false,
  compact = false,
}: ErrorStateProps) {
  const iconSize = compact ? 28 : 35;

  return (
    <EmptyState
      icon={
        offline ? (
          <WifiOff style={{ width: iconSize, height: iconSize }} />
        ) : (
          <AlertTriangle style={{ width: iconSize, height: iconSize }} />
        )
      }
      title={title}
      message={message}
      actionLabel={retryLabel}
      onAction={onRetry}
      compact={compact}
    />
  );
}

/**
 * Slim banner shown while the device is offline (`OfflineBanner` in Flutter).
 */
export function OfflineBanner({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full items-center justify-center gap-2 bg-[var(--ph-warning-soft)] px-4 py-2 text-[var(--ph-warning)]"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span className="tx-footnote font-semibold text-[var(--ph-warning)]">
        {label}
      </span>
    </div>
  );
}

