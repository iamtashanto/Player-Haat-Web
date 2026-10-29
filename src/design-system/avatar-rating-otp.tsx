'use client';

import React, { useRef, useState } from 'react';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { kMinTap, PhAvatarPalettes, PhRadius } from './tokens';
import { Pressable } from './glass';
import { cn } from '@/lib/utils';

export interface PhAvatarProps {
  name: string;
  url?: string | null;
  size?: number;
  verified?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return '?';
  const firstChar = (s: string) => Array.from(s)[0] ?? '';
  return (firstChar(parts[0]) + (parts.length > 1 ? firstChar(parts[parts.length - 1]) : '')).toUpperCase();
}

function getPaletteIndex(name: string): number {
  const sum = Array.from(name).reduce((acc, ch) => acc + (ch.codePointAt(0) ?? 0), 0);
  return sum % PhAvatarPalettes.length;
}

/**
 * Avatar with deterministic gradient + initials fallback and optional verified tick.
 * Exact parity with Flutter's `PhAvatar` (`app/lib/design_system/avatar.dart`).
 */
export function PhAvatar({
  name,
  url,
  size = 48,
  verified = false,
  className,
}: PhAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [c1, c2] = PhAvatarPalettes[getPaletteIndex(name)];
  const initials = getInitials(name);
  const badgeSize = Math.round(size * 0.32);

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn('relative inline-flex shrink-0 select-none', className)}
      aria-label={name}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: !url || imgError ? `linear-gradient(135deg, ${c1}, ${c2})` : undefined,
        }}
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
      >
        {url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            style={{ fontSize: `${Math.round(size * 0.36)}px`, lineHeight: 1 }}
            className="font-semibold text-white"
          >
            {initials}
          </span>
        )}
      </div>
      {verified && (
        <span
          style={{ width: `${badgeSize}px`, height: `${badgeSize}px` }}
          className="absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full border-2 border-[var(--ph-surface)] bg-[var(--ph-accent)] text-[var(--ph-accent-on)]"
          title="Verified"
        >
          <Check style={{ width: `${Math.round(size * 0.2)}px`, height: `${Math.round(size * 0.2)}px` }} strokeWidth={3} />
        </span>
      )}
    </div>
  );
}

export interface RatingStarsProps {
  value: number;
  size?: number;
  className?: string;
}

/**
 * Read-only 5-star indicator matching Flutter's `RatingStars`.
 */
export function RatingStars({ value, size = 16, className }: RatingStarsProps) {
  return (
    <div
      aria-label={value.toFixed(1)}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const half = !filled && value >= i - 0.75;
        return (
          <Star
            key={i}
            style={{ width: `${size}px`, height: `${size}px` }}
            className={cn(
              filled || half
                ? 'fill-[var(--ph-star)] text-[var(--ph-star)]'
                : 'text-[var(--ph-text-tertiary)]/50',
            )}
          />
        );
      })}
    </div>
  );
}

export interface RatingPillProps {
  average: number;
  count: number;
  format?: (average: number, count: number) => string;
  emptyLabel?: string;
  className?: string;
}

/**
 * ★ 4.8 (23) — compact pill used on cards. Matches Flutter's `RatingPill`.
 */
export function RatingPill({
  average,
  count,
  format = (a, n) => `${a.toFixed(1)} (${n})`,
  emptyLabel = '—',
  className,
}: RatingPillProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star
        className={cn(
          'h-[13px] w-[13px]',
          count === 0
            ? 'text-[var(--ph-text-tertiary)]'
            : 'fill-[var(--ph-star)] text-[var(--ph-star)]',
        )}
      />
      <span className="tx-footnote font-semibold text-[var(--ph-text)]">
        {count === 0 ? emptyLabel : format(average, count)}
      </span>
    </span>
  );
}

export interface RatingInputProps {
  value: number;
  onChanged: (val: number) => void;
  size?: number;
  semanticLabel: string;
}

/**
 * Interactive 1–5 star rating selector matching Flutter's `RatingInput`.
 */
export function RatingInput({
  value,
  onChanged,
  size = 36,
  semanticLabel,
}: RatingInputProps) {
  return (
    <div
      role="radiogroup"
      aria-label={semanticLabel}
      className="inline-flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= value;
        return (
          <Pressable
            key={i}
            ariaLabel={`${i} / 5`}
            minSize={kMinTap}
            scale={0.85}
            onClick={() => onChanged(i)}
          >
            <motion.span
              animate={{ scale: i === value ? 1.12 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="inline-flex"
            >
              <Star
                style={{ width: `${size}px`, height: `${size}px` }}
                className={cn(
                  active
                    ? 'fill-[var(--ph-star)] text-[var(--ph-star)]'
                    : 'text-[var(--ph-text-tertiary)]/55',
                )}
              />
            </motion.span>
          </Pressable>
        );
      })}
    </div>
  );
}

export interface PhOtpFieldProps {
  value: string;
  onChange: (val: string) => void;
  onCompleted?: (val: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}

/**
 * 6-box one-time-code input backed by a single real `<input autocomplete="one-time-code">`.
 * Exact parity with Flutter's `PhOtpField` (`app/lib/design_system/otp_field.dart`).
 */
export function PhOtpField({
  value,
  onChange,
  onCompleted,
  length = 6,
  error = false,
  disabled = false,
}: PhOtpFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) {
      onCompleted?.(digits);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative flex w-full items-center justify-between gap-2 cursor-text"
    >
      {Array.from({ length }).map((_, i) => {
        const char = value[i] ?? '';
        const isActive =
          focused &&
          !disabled &&
          i === Math.min(value.length, length - 1);
        const borderColor = error
          ? 'var(--ph-danger)'
          : isActive
            ? 'var(--ph-accent)'
            : 'transparent';

        return (
          <div
            key={i}
            style={{
              borderRadius: `${PhRadius.md}px`,
              borderColor,
              borderWidth: '1.5px',
            }}
            className="flex h-[60px] w-[48px] sm:w-[54px] items-center justify-center bg-[var(--ph-surface-alt)] tx-title1 text-[var(--ph-text)] transition-colors duration-150"
          >
            {char}
          </div>
        );
      })}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        disabled={disabled}
        value={value}
        aria-label="Verification code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => handleChange(e.target.value)}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
