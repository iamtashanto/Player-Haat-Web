'use client';

import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Minus, Plus, Search, X } from 'lucide-react';
import { kMinTap, PhMotion, PhRadius } from './tokens';
import { Pressable } from './glass';
import { cn } from '@/lib/utils';
import { usePhPreferences } from '@/components/providers';

export interface PhTextFieldProps {
  label?: string;
  hint?: string;
  helper?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  onSubmit?: () => void;
  prefix?: React.ReactNode;
  prefixText?: string;
  suffix?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'search';
  obscure?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  name?: string;
}

/**
 * Filled text field with label above it (iOS-style), a focus ring, and inline error.
 * Exact parity with Flutter's `PhTextField` (`app/lib/design_system/inputs.dart`).
 */
export function PhTextField({
  label,
  hint,
  helper,
  error,
  value,
  defaultValue,
  onChange,
  onSubmit,
  prefix,
  prefixText,
  suffix,
  type = 'text',
  obscure = false,
  multiline = false,
  rows = 3,
  maxLength,
  disabled = false,
  autoFocus = false,
  className,
  inputClassName,
  name,
}: PhTextFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const hasError = Boolean(error && error.trim().length > 0);

  const ringColor = hasError
    ? 'var(--ph-danger)'
    : focused
      ? 'var(--ph-accent)'
      : 'transparent';

  return (
    <div className={cn('flex flex-col items-start w-full', className)}>
      {label && (
        <label htmlFor={id} className="pl-1 pb-2 tx-subhead-strong text-[var(--ph-text)]">
          {label}
        </label>
      )}
      <div
        style={{
          borderRadius: `${PhRadius.md}px`,
          borderColor: ringColor,
          borderWidth: '1.5px',
          minHeight: multiline ? '96px' : '52px',
        }}
        className={cn(
          'flex w-full px-4 transition-colors duration-150 bg-[var(--ph-surface-alt)]',
          multiline ? 'items-start' : 'items-center',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {prefix && (
          <span className={cn('mr-3 inline-flex shrink-0 text-[var(--ph-text-secondary)]', multiline && 'mt-3.5')}>
            {prefix}
          </span>
        )}
        {prefixText && (
          <span className={cn('mr-2 shrink-0 tx-body text-[var(--ph-text-secondary)] select-none', multiline && 'mt-3.5')}>
            {prefixText}
          </span>
        )}
        {multiline ? (
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            autoFocus={autoFocus}
            maxLength={maxLength}
            placeholder={hint}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'w-full flex-1 resize-none bg-transparent py-3.5 tx-body text-[var(--ph-text)] placeholder:text-[var(--ph-text-tertiary)] focus:outline-none',
              inputClassName,
            )}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={obscure ? (hidden ? 'password' : 'text') : type}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            autoFocus={autoFocus}
            maxLength={maxLength}
            placeholder={hint}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSubmit) {
                e.preventDefault();
                onSubmit();
              }
            }}
            className={cn(
              'w-full flex-1 bg-transparent py-3.5 tx-body text-[var(--ph-text)] placeholder:text-[var(--ph-text-tertiary)] focus:outline-none',
              inputClassName,
            )}
          />
        )}
        {obscure ? (
          <Pressable
            ariaLabel={hidden ? 'Show password' : 'Hide password'}
            onClick={() => setHidden(!hidden)}
            minSize={kMinTap}
            className="-mr-2 text-[var(--ph-text-secondary)]"
          >
            {hidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </Pressable>
        ) : (
          suffix && <div className="ml-2 shrink-0">{suffix}</div>
        )}
      </div>
      {(hasError || helper) && (
        <p
          className={cn(
            'pt-2 pl-1 tx-footnote',
            hasError ? 'text-[var(--ph-danger)]' : 'text-[var(--ph-text-secondary)]',
          )}
        >
          {hasError ? error : helper}
        </p>
      )}
    </div>
  );
}

export interface PhSearchFieldProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  hint: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Rounded search field with a clear button matching Flutter's `PhSearchField`.
 */
export function PhSearchField({
  value,
  onChange,
  onSubmit,
  hint,
  autoFocus = false,
  className,
}: PhSearchFieldProps) {
  return (
    <PhTextField
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      hint={hint}
      autoFocus={autoFocus}
      type="search"
      className={className}
      prefix={<Search className="h-[18px] w-[18px]" />}
      suffix={
        value.length > 0 ? (
          <Pressable
            ariaLabel="Clear"
            minSize={kMinTap}
            onClick={() => onChange('')}
            className="-mr-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ph-text-tertiary)]/30 text-[var(--ph-text-secondary)]">
              <X className="h-3.5 w-3.5" />
            </span>
          </Pressable>
        ) : null
      }
    />
  );
}

export interface PhSwitchTileProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onChanged?: (val: boolean) => void;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * A row with a title/subtitle and an iOS-style switch matching `PhSwitchTile`.
 */
export function PhSwitchTile({
  title,
  subtitle,
  value,
  onChanged,
  icon,
  className,
}: PhSwitchTileProps) {
  const disabled = onChanged == null;

  return (
    <div
      role="switch"
      aria-checked={value}
      aria-label={title}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChanged?.(!value)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onChanged?.(!value);
        }
      }}
      className={cn(
        'flex min-h-[56px] w-full items-center px-4 py-3 select-none transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--ph-surface-alt)]/30',
        className,
      )}
    >
      {icon && (
        <div
          style={{ borderRadius: '9px' }}
          className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]"
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 pr-3">
        <div className="tx-body text-[var(--ph-text)]">{title}</div>
        {subtitle && <div className="mt-0.5 tx-footnote">{subtitle}</div>}
      </div>
      {/* iOS-style CupertinoSwitch */}
      <div
        className={cn(
          'relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-200',
          value ? 'bg-[var(--ph-accent)]' : 'bg-[var(--ph-text-tertiary)]/30',
        )}
      >
        <motion.div
          animate={{ x: value ? 20 : 0 }}
          transition={PhMotion.framerSpring}
          className="h-[27px] w-[27px] rounded-full bg-white shadow-sm"
        />
      </div>
    </div>
  );
}

export interface PhSegmentedProps<T extends string> {
  options: Record<T, string>;
  value: T;
  onChanged: (val: T) => void;
  className?: string;
}

/**
 * iOS-style segmented control with a sliding pill matching Flutter's `PhSegmented`.
 */
export function PhSegmented<T extends string>({
  options,
  value,
  onChanged,
  className,
}: PhSegmentedProps<T>) {
  const keys = Object.keys(options) as T[];
  const activeIdx = Math.max(0, keys.indexOf(value));
  const { reduceEffects } = usePhPreferences();

  return (
    <div
      role="tablist"
      style={{ borderRadius: `${PhRadius.sm + 2}px` }}
      className={cn(
        'relative flex h-[40px] w-full items-center bg-[var(--ph-surface-alt)] p-[3px]',
        className,
      )}
    >
      {/* Sliding active pill */}
      <motion.div
        aria-hidden="true"
        animate={{
          left: `calc(${(activeIdx * 100) / keys.length}% + 3px)`,
          width: `calc(${100 / keys.length}% - 6px)`,
        }}
        transition={reduceEffects ? { duration: 0.1 } : PhMotion.framerSpring}
        style={{ borderRadius: `${PhRadius.sm - 1}px` }}
        className=" absolute top-[3px] bottom-[3px] bg-[var(--ph-surface)] shadow-xs"
      />
      {keys.map((k) => {
        const selected = k === value;
        return (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChanged(k)}
            className={cn(
              'relative z-10 flex-1 h-full flex items-center justify-center px-2 tx-subhead-strong truncate transition-colors cursor-pointer focus-visible:outline-none',
              selected ? 'text-[var(--ph-text)]' : 'text-[var(--ph-text-secondary)] hover:text-[var(--ph-text)]',
            )}
          >
            {options[k]}
          </button>
        );
      })}
    </div>
  );
}

export interface PhStepperProps {
  value: number;
  onChanged: (val: number) => void;
  min?: number;
  max?: number;
  format?: (val: number) => string;
}

/**
 * − n + counter matching Flutter's `PhStepper`.
 */
export function PhStepper({
  value,
  onChanged,
  min = 1,
  max = 30,
  format,
}: PhStepperProps) {
  const canDec = value > min;
  const canInc = value < max;

  return (
    <div className="inline-flex items-center">
      <Pressable
        ariaLabel="Decrease"
        disabled={!canDec}
        onClick={() => canDec && onChanged(value - 1)}
        scale={0.9}
      >
        <div
          style={{ borderRadius: `${PhRadius.sm}px` }}
          className={cn(
            'flex h-[44px] w-[44px] items-center justify-center transition-colors',
            canDec
              ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]'
              : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text-tertiary)]',
          )}
        >
          <Minus className="h-5 w-5" />
        </div>
      </Pressable>
      <div className="w-[56px] text-center tx-title3 text-[var(--ph-text)]">
        {format ? format(value) : value}
      </div>
      <Pressable
        ariaLabel="Increase"
        disabled={!canInc}
        onClick={() => canInc && onChanged(value + 1)}
        scale={0.9}
      >
        <div
          style={{ borderRadius: `${PhRadius.sm}px` }}
          className={cn(
            'flex h-[44px] w-[44px] items-center justify-center transition-colors',
            canInc
              ? 'bg-[var(--ph-accent-soft)] text-[var(--ph-accent)]'
              : 'bg-[var(--ph-surface-alt)] text-[var(--ph-text-tertiary)]',
          )}
        >
          <Plus className="h-5 w-5" />
        </div>
      </Pressable>
    </div>
  );
}
