'use client';

import React from 'react';
import { kMinTap } from './tokens';
import { Pressable } from './glass';
import { cn } from '@/lib/utils';

export interface PhChipProps {
  label: string;
  selected?: boolean;
  onTap?: () => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  dense?: boolean;
  className?: string;
}

/**
 * Filter / choice chip matching Flutter's `PhChip` (`app/lib/design_system/chips.dart`).
 * Selected = accent tint + accent text + 1px accent border;
 * Unselected = quiet surface with hairline border.
 */
export function PhChip({
  label,
  selected = false,
  onTap,
  icon,
  trailing,
  dense = false,
  className,
}: PhChipProps) {
  return (
    <Pressable
      ariaLabel={label}
      onClick={onTap}
      disabled={onTap == null}
      minSize={dense ? 0 : kMinTap}
      className={cn('shrink-0', className)}
    >
      <div
        className={cn(
          'inline-flex items-center rounded-full transition-all duration-150',
          dense ? 'h-[30px] px-3 tx-caption' : 'h-[38px] px-4 tx-subhead-strong',
          selected
            ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)] border border-[var(--ph-accent)]/55'
            : 'bg-[var(--ph-surface)] text-[var(--ph-text)] border-[0.5px] border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]/60',
        )}
      >
        {icon && <span className="mr-1.5 inline-flex shrink-0 items-center">{icon}</span>}
        <span className="whitespace-nowrap">{label}</span>
        {trailing && <span className="ml-1.5 inline-flex shrink-0 items-center">{trailing}</span>}
      </div>
    </Pressable>
  );
}

export type PhTone = 'neutral' | 'accent' | 'warning' | 'danger';

export interface PhBadgeProps {
  label: string;
  tone?: PhTone;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Small status pill (e.g. "Paid", "Filled", "Verified", "৳400–600").
 * Matches Flutter's `PhBadge`.
 */
export function PhBadge({
  label,
  tone = 'neutral',
  icon,
  className,
}: PhBadgeProps) {
  const toneStyles: Record<PhTone, string> = {
    accent: 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]',
    warning: 'bg-[var(--ph-warning-soft)] text-[var(--ph-warning)]',
    danger: 'bg-[var(--ph-danger-soft)] text-[var(--ph-danger)]',
    neutral: 'bg-[var(--ph-surface-alt)] text-[var(--ph-text-secondary)]',
  };

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-[9px] py-[4px] tx-caption font-semibold',
        toneStyles[tone],
        className,
      )}
    >
      {icon && <span className="mr-1 inline-flex shrink-0 items-center">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
}

