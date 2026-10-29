'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { kMinTap, PhRadius } from './tokens';
import { Pressable } from './glass';
import { cn } from '@/lib/utils';

export type PhButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger';
export type PhButtonSize = 'large' | 'medium' | 'small';

export interface PhButtonProps {
  label: string;
  onPressed?: () => void;
  variant?: PhButtonVariant;
  size?: PhButtonSize;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
  expand?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * Exact parity with Flutter's `PhButton` (`app/lib/design_system/buttons.dart`).
 * Heights: large=54px, medium=46px, small=36px.
 * Corner radii: large=16px (PhRadius.md), medium/small=12px (PhRadius.sm).
 */
export function PhButton({
  label,
  onPressed,
  variant = 'primary',
  size = 'large',
  icon,
  trailing,
  loading = false,
  expand,
  expanded,
  disabled: explicitDisabled,
  type = 'button',
  className,
}: PhButtonProps) {
  const isExpanded = expanded ?? expand ?? true;
  const effectiveVariant: PhButtonVariant = variant === 'danger' ? 'destructive' : variant;
  const isDisabled = explicitDisabled ?? (onPressed == null && !loading);

  const height = size === 'large' ? 54 : size === 'medium' ? 46 : 36;
  const radius = size === 'large' ? PhRadius.md : PhRadius.sm;

  const variantClasses: Record<string, string> = {
    primary: 'bg-[var(--ph-accent)] text-[var(--ph-accent-on)] border-transparent hover:brightness-105',
    secondary: 'bg-[var(--ph-surface-alt)] text-[var(--ph-text)] border-transparent hover:brightness-95 dark:hover:brightness-110',
    outline: 'bg-transparent text-[var(--ph-text)] border border-[var(--ph-border)] hover:bg-[var(--ph-surface-alt)]/50',
    ghost: 'bg-transparent text-[var(--ph-text)] border-transparent hover:bg-[var(--ph-surface-alt)]/40',
    destructive: 'bg-[var(--ph-danger)] text-white border-transparent hover:brightness-105',
    danger: 'bg-[var(--ph-danger)] text-white border-transparent hover:brightness-105',
  };

  return (
    <Pressable
      type={type}
      ariaLabel={label}
      disabled={isDisabled || loading}
      onClick={onPressed}
      minSize={kMinTap}
      className={cn(isExpanded ? 'w-full' : 'w-auto', className)}
    >
      <div
        style={{ height: `${height}px`, borderRadius: `${radius}px` }}
        className={cn(
          'flex items-center justify-center gap-2 transition-all duration-150',
          isExpanded ? 'w-full' : 'w-auto',
          size === 'small' ? 'px-4 tx-subhead-strong' : 'px-6 tx-button',
          variantClasses[effectiveVariant],
        )}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <>
            {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
            <span className="truncate">{label}</span>
            {trailing && <span className="inline-flex shrink-0 items-center">{trailing}</span>}
          </>
        )}
      </div>
    </Pressable>
  );
}

export interface PhIconButtonProps {
  icon: React.ReactNode;
  semanticLabel: string;
  onPressed?: () => void;
  filled?: boolean;
  badge?: boolean;
  color?: string;
  className?: string;
}

/**
 * 44x44 round icon button matching Flutter's `PhIconButton`.
 * Visual circle is 36x36 inside a 44x44 accessible tap target.
 */
export function PhIconButton({
  icon,
  semanticLabel,
  onPressed,
  filled = true,
  badge = false,
  color,
  className,
}: PhIconButtonProps) {
  return (
    <Pressable
      ariaLabel={semanticLabel}
      disabled={onPressed == null}
      onClick={onPressed}
      scale={0.9}
      minSize={kMinTap}
      className={cn('relative inline-flex h-[44px] w-[44px] items-center justify-center rounded-full', className)}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        style={{
          backgroundColor: filled ? 'var(--ph-surface-alt)' : 'transparent',
          color: color ?? 'var(--ph-text)',
        }}
      >
        {icon}
        {badge && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--ph-danger)] ring-2 ring-[var(--ph-bg)]"
          />
        )}
      </div>
    </Pressable>
  );
}

