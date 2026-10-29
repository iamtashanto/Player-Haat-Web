'use client';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, ChevronLeft } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { PhMotion, PhRadius } from './tokens';
import { GlassContainer, Pressable } from './glass';
import { PhIconButton } from './buttons';
import { cn } from '@/lib/utils';
import { usePhPreferences } from '@/components/providers';

export type ToastKind = 'info' | 'success' | 'error';

/**
 * Floating glass pill toast at the bottom of the screen matching Flutter's `showPhToast` (`app/lib/design_system/toast.dart`).
 */
export function showPhToast(message: string, kind: ToastKind = 'info') {
  sonnerToast.custom(
    () => {
      const Icon =
        kind === 'success'
          ? CheckCircle2
          : kind === 'error'
            ? AlertCircle
            : Info;
      const iconColor =
        kind === 'success'
          ? 'var(--ph-accent)'
          : kind === 'error'
            ? 'var(--ph-danger)'
            : 'var(--ph-text-secondary)';

      return (
        <div role="status" aria-live="polite" className="w-[min(420px,calc(100vw-32px))]">
          <GlassContainer
            radius={PhRadius.md}
            shadow
            className="px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-[22px] w-[22px] shrink-0" style={{ color: iconColor }} />
              <span className="tx-callout font-medium text-[var(--ph-text)]">
                {message}
              </span>
            </div>
          </GlassContainer>
        </div>
      );
    },
    { duration: 3200 },
  );
}

export interface PhGlassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
}

/**
 * Frosted modal sheet (`showGlassSheet` in Flutter):
 * - On mobile (<768px): slides up from bottom with grabber bar (`PhRadius.sheet = 32px` top corners).
 * - On desktop (>=768px): centered frosted modal dialog (`PhRadius.xl = 28px`) with close button.
 */
export function PhGlassSheet({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
}: PhGlassSheetProps) {
  const { reduceEffects } = usePhPreferences();

  return (
    <Dialog.Root open={open} onOpenChange={dismissible ? onOpenChange : undefined}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceEffects ? 0.1 : 0.2 }}
                className="fixed inset-0 z-50 bg-[var(--ph-scrim)]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6 pointer-events-none">
                <motion.div
                  initial={reduceEffects ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={reduceEffects ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.98 }}
                  transition={reduceEffects ? { duration: 0.12 } : PhMotion.framerSpring}
                  className="pointer-events-auto w-full max-w-lg max-h-[92dvh] flex flex-col focus:outline-none"
                >
                  <GlassContainer
                    blur={30}
                    shadow
                    radius={0}
                    className="flex flex-col max-h-[92dvh] rounded-t-[32px] md:rounded-[28px]"
                  >
                    {/* Mobile grabber bar */}
                    <div className="pt-2.5 pb-1 flex justify-center md:hidden">
                      <div className="h-[5px] w-[38px] rounded-full bg-[var(--ph-text-tertiary)]/45" />
                    </div>
                    <div className="flex items-center justify-between px-5 pt-3 md:pt-5 pb-2">
                      {title ? (
                        <Dialog.Title className="tx-title2 text-[var(--ph-text)]">
                          {title}
                        </Dialog.Title>
                      ) : (
                        <Dialog.Title className="sr-only">Sheet</Dialog.Title>
                      )}
                      {dismissible && (
                        <Dialog.Close asChild>
                          <PhIconButton
                            icon={<X className="h-5 w-5" />}
                            semanticLabel="Close"
                            onPressed={() => onOpenChange(false)}
                          />
                        </Dialog.Close>
                      )}
                    </div>
                    <Dialog.Description className="sr-only">
                      {title ?? 'Dialog content'}
                    </Dialog.Description>
                    <div className="overflow-y-auto px-5 pt-2 pb-6">
                      {children}
                    </div>
                  </GlassContainer>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export interface PhTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: boolean;
  href?: string;
}

export interface PhGlassTabBarProps {
  items: PhTabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

/**
 * Floating frosted bottom tab bar matching Flutter's `PhGlassTabBar` (`app/lib/design_system/glass_tab_bar.dart`).
 * Height = 66px, radius = 30px, with a spring-animated selection pill (`c.accentSoft`).
 */
export function PhGlassTabBar({
  items,
  activeIndex,
  onChange,
  className,
}: PhGlassTabBarProps) {
  const { reduceEffects } = usePhPreferences();
  const safeIndex = Math.max(0, Math.min(activeIndex, items.length - 1));

  return (
    <div className={cn('px-4 pb-3 pt-1', className)}>
      <GlassContainer
        radius={30}
        shadow
        as="nav"
        aria-label="Bottom Navigation"
        className="h-[66px] w-full max-w-md mx-auto"
      >
        <div className="relative flex h-[66px] w-full items-center">
          {/* Springing selection pill */}
          <motion.div
            aria-hidden="true"
            animate={{
              left: `calc(${(safeIndex * 100) / items.length}% + 6px)`,
              width: `calc(${100 / items.length}% - 12px)`,
            }}
            transition={reduceEffects ? { duration: 0.1 } : PhMotion.framerSpring}
            style={{ borderRadius: `${PhRadius.lg}px` }}
            className="absolute top-[7px] bottom-[7px] bg-[var(--ph-accent-soft)]"
          />
          {items.map((item, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <Pressable
                key={item.id}
                ariaLabel={item.label}
                scale={0.92}
                onClick={() => onChange(idx)}
                className="relative z-10 flex-1 h-full"
              >
                <div
                  aria-current={isSelected ? 'page' : undefined}
                  className="flex flex-col items-center justify-center h-full px-1"
                >
                  <div
                    className={cn(
                      'relative flex items-center justify-center transition-colors',
                      isSelected ? 'text-[var(--ph-accent)]' : 'text-[var(--ph-text-secondary)]',
                    )}
                  >
                    {isSelected && item.activeIcon ? item.activeIcon : item.icon}
                    {item.badge && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-1 -top-0.5 h-[9px] w-[9px] rounded-full bg-[var(--ph-danger)] ring-2 ring-[var(--ph-glass-solid)]"
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-[3px] max-w-full truncate text-[11px] leading-tight transition-colors',
                      isSelected
                        ? 'font-bold text-[var(--ph-accent)]'
                        : 'font-medium text-[var(--ph-text-secondary)]',
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Pressable>
            );
          })}
        </div>
      </GlassContainer>
    </div>
  );
}

export interface PhLargeTitleBarProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  largeTitle?: boolean;
}

/**
 * iOS-style navigation bar (`PhLargeTitleBar` in Flutter):
 * Large title collapses into a small centered title on a frosted sticky header as you scroll.
 */
export function PhLargeTitleBar({
  title,
  subtitle,
  leading,
  actions,
  largeTitle = true,
}: PhLargeTitleBarProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const collapseRange = subtitle ? 78 : 56;
  const t = largeTitle
    ? Math.min(1, Math.max(0, scrollY / collapseRange))
    : Math.min(1, Math.max(0, scrollY / 24));
  const showBlur = t > 0.04;

  return (
    <>
      <header className="sticky top-0 z-30 h-[52px] w-full transition-colors">
        {showBlur && (
          <div
            style={{ opacity: t }}
            className="ph-glass absolute inset-0 border-b-[0.5px] border-[var(--ph-glass-border)]"
          />
        )}
        <div className="relative z-10 flex h-[52px] items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-1 min-w-[44px]">{leading}</div>
          <div
            style={{ opacity: largeTitle ? t : 1 }}
            className="pointer-events-none absolute inset-x-16 flex items-center justify-center"
          >
            <span className="tx-headline truncate text-[var(--ph-text)]">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">{actions}</div>
        </div>
      </header>
      {largeTitle && (
        <div
          style={{
            opacity: Math.max(0, Math.min(1, 1 - t * 1.4)),
          }}
          className="px-5 md:px-8 pt-1 pb-2"
        >
          <h1 className="tx-large-title text-[var(--ph-text)]">{title}</h1>
          {subtitle && <p className="mt-0.5 tx-subhead">{subtitle}</p>}
        </div>
      )}
    </>
  );
}

/**
 * Standard back chevron button matching Flutter's `PhBackButton`.
 */
export function PhBackButton({
  label,
  onPressed,
}: {
  label: string;
  onPressed?: () => void;
}) {
  return (
    <PhIconButton
      icon={<ChevronLeft className="h-5 w-5" />}
      semanticLabel={label}
      onPressed={onPressed ?? (() => window.history.back())}
    />
  );
}

