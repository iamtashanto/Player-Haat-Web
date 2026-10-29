'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PhRadius } from './tokens';
import { cn } from '@/lib/utils';
import { usePhPreferences } from '@/components/providers';

export interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  blur?: number;
  shadow?: boolean;
  as?: 'div' | 'header' | 'nav' | 'section' | 'aside';
}

/**
 * Frosted glass: blurred backdrop + translucent tint + hairline border + soft top highlight.
 * Automatically falls back to solid surface when "Reduce effects" or `prefers-reduced-transparency` is active.
 */
export const GlassContainer = React.forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ className, children, radius = PhRadius.lg, blur = 24, shadow = false, style, as: Component = 'div', ...props }, ref) => {
    const { reduceEffects } = usePhPreferences();

    return (
      <Component
        ref={ref}
        className={cn(
          'ph-glass overflow-hidden transition-colors duration-200',
          shadow && 'shadow-[var(--ph-glass-shadow)]',
          className,
        )}
        style={{
          borderRadius: `${radius}px`,
          ...(blur !== 24 && !reduceEffects
            ? {
                backdropFilter: `blur(${blur}px) saturate(180%)`,
                WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
              }
            : {}),
          ...style,
        }}
        {...props}
      >
        <div className="relative z-10 h-full w-full">{children}</div>
      </Component>
    );
  },
);
GlassContainer.displayName = 'GlassContainer';

export interface PressableProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  scale?: number;
  className?: string;
  ariaLabel?: string;
  minSize?: number;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Tactile scale-on-press wrapper matching Flutter's `Pressable`.
 */
export function Pressable({
  children,
  onClick,
  disabled = false,
  scale = 0.97,
  className,
  ariaLabel,
  minSize = 0,
  type = 'button',
}: PressableProps) {
  const { reduceEffects } = usePhPreferences();

  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      whileTap={disabled || reduceEffects ? undefined : { scale }}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      style={minSize > 0 ? { minWidth: `${minSize}px`, minHeight: `${minSize}px` } : undefined}
      className={cn(
        'inline-flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ph-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ph-bg)]',
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

