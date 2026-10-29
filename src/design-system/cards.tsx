'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { kMinTap, PhRadius } from './tokens';
import { Pressable } from './glass';
import { cn } from '@/lib/utils';

export interface PhCardProps {
  children: React.ReactNode;
  onTap?: () => void;
  radius?: number;
  color?: string;
  semanticLabel?: string;
  className?: string;
  paddingClassName?: string;
}

/**
 * Surface card: solid fill + hairline border (+ subtle shadow in light mode).
 * Matches `PhCard` in `app/lib/design_system/cards.dart`.
 */
export function PhCard({
  children,
  onTap,
  radius = PhRadius.lg,
  color,
  semanticLabel,
  className,
  paddingClassName = 'p-4',
}: PhCardProps) {
  const card = (
    <div
      style={{
        borderRadius: `${radius}px`,
        backgroundColor: color ?? 'var(--ph-surface)',
        boxShadow: 'var(--ph-card-shadow)',
      }}
      className={cn(
        'w-full border-[0.5px] border-[var(--ph-border)] text-left transition-all duration-150',
        onTap && 'hover:border-[var(--ph-accent)]/35',
        paddingClassName,
        className,
      )}
    >
      {children}
    </div>
  );

  if (!onTap) return card;

  return (
    <Pressable
      ariaLabel={semanticLabel}
      onClick={onTap}
      scale={0.985}
      className="w-full text-left"
    >
      {card}
    </Pressable>
  );
}

export interface PhSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Section header: title on the left (`tx-title3`), optional action on the right (`tx-subhead-strong` in accent).
 */
export function PhSectionHeader({
  title,
  actionLabel,
  onAction,
  className,
}: PhSectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pt-6 pb-3', className)}>
      <h2 className="tx-title3 text-[var(--ph-text)]">{title}</h2>
      {actionLabel && (
        <Pressable
          onClick={onAction}
          minSize={kMinTap}
          className="px-2 tx-subhead-strong text-[var(--ph-accent)] hover:underline"
        >
          {actionLabel}
        </Pressable>
      )}
    </div>
  );
}

export interface PhGroupProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
  className?: string;
}

/**
 * Grouped iOS settings-style list: one rounded card (`PhRadius.lg`) with hairline separators.
 */
export function PhGroup({ children, header, footer, className }: PhGroupProps) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <div className={cn('flex flex-col items-start w-full', className)}>
      {header && (
        <div className="pl-4 pb-2 tx-overline">{header}</div>
      )}
      <div
        style={{ borderRadius: `${PhRadius.lg}px` }}
        className="w-full overflow-hidden border-[0.5px] border-[var(--ph-border)] bg-[var(--ph-surface)]"
      >
        {items.map((child, idx) => (
          <React.Fragment key={idx}>
            {child}
            {idx !== items.length - 1 && (
              <div className="pl-4">
                <div className="h-[0.5px] w-full bg-[var(--ph-border)]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {footer && (
        <div className="px-4 pt-2 tx-footnote">{footer}</div>
      )}
    </div>
  );
}

export interface PhRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  trailing?: React.ReactNode;
  onTap?: () => void;
  destructive?: boolean;
  chevron?: boolean;
}

/**
 * A tappable row for `PhGroup`: leading 32x32 squircle icon tile, title/subtitle, trailing widget or chevron.
 */
export function PhRow({
  title,
  subtitle,
  icon,
  iconColor,
  trailing,
  onTap,
  destructive = false,
  chevron = true,
}: PhRowProps) {
  const tint = destructive ? 'var(--ph-danger)' : iconColor ?? 'var(--ph-accent)';
  const tintBg = destructive
    ? 'var(--ph-danger-soft)'
    : iconColor
      ? 'color-mix(in srgb, ' + iconColor + ' 14%, transparent)'
      : 'var(--ph-accent-soft)';

  const content = (
    <div className="flex min-h-[56px] w-full items-center px-4 py-3 text-left transition-colors hover:bg-[var(--ph-surface-alt)]/40">
      {icon && (
        <div
          style={{
            borderRadius: '9px',
            backgroundColor: tintBg,
            color: tint,
          }}
          className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center"
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'tx-body truncate',
            destructive ? 'text-[var(--ph-danger)]' : 'text-[var(--ph-text)]',
          )}
        >
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 tx-footnote truncate">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="ml-2 shrink-0">{trailing}</div>}
      {chevron && onTap != null && trailing == null && (
        <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-[var(--ph-text-tertiary)]" />
      )}
    </div>
  );

  if (!onTap) return content;

  return (
    <Pressable
      ariaLabel={title}
      onClick={onTap}
      scale={0.995}
      className="w-full"
    >
      {content}
    </Pressable>
  );
}

