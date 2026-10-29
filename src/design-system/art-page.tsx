'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type PhArtKind = 'find' | 'hire' | 'rate';

/**
 * Vector illustrations drawn in code (SVG) — exact parity with Flutter's `PhIllustration` (`app/lib/design_system/art.dart`).
 * Adapts automatically to light and dark mode via CSS variables.
 */
export function PhIllustration({
  kind,
  size,
  height,
  className,
}: {
  kind: PhArtKind;
  size?: number;
  height?: number;
  className?: string;
}) {
  const resolvedSize = size ?? height ?? 120;
  if (kind === 'find') {
    const spots: Array<{ cx: number; cy: number; color: string }> = [
      { cx: 52, cy: 68, color: '#3A7BD5' },
      { cx: 148, cy: 55, color: '#F2994A' },
      { cx: 158, cy: 120, color: '#8E54E9' },
      { cx: 82, cy: 158, color: '#EB5757' },
      { cx: 38, cy: 116, color: '#0BA360' },
      { cx: 114, cy: 36, color: '#00B4DB' },
    ];
    return (
      <svg
        width={resolvedSize}
        height={resolvedSize}
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        className={cn('shrink-0 select-none', className)}
      >
        {/* Radar rings */}
        <circle cx="100" cy="100" r="88" fill="var(--ph-accent)" fillOpacity="0.06" stroke="var(--ph-accent)" strokeOpacity="0.25" />
        <circle cx="100" cy="100" r="58" fill="var(--ph-accent)" fillOpacity="0.09" stroke="var(--ph-accent)" strokeOpacity="0.28" />
        <circle cx="100" cy="100" r="30" fill="var(--ph-accent)" fillOpacity="0.14" stroke="var(--ph-accent)" strokeOpacity="0.32" />
        {/* Player nodes */}
        {spots.map((s, i) => (
          <g key={i}>
            <circle cx={s.cx} cy={s.cy} r="14" fill="var(--ph-surface)" />
            <circle cx={s.cx} cy={s.cy} r="11" fill={s.color} />
            <circle cx={s.cx} cy={s.cy - 2} r="3.5" fill="#FFFFFF" fillOpacity="0.92" />
            <path
              d={`M ${s.cx - 6} ${s.cy + 7} A 6 5 0 0 1 ${s.cx + 6} ${s.cy + 7} Z`}
              fill="#FFFFFF"
              fillOpacity="0.92"
            />
          </g>
        ))}
        {/* Center "you are here" */}
        <circle cx="100" cy="100" r="22" fill="var(--ph-accent)" fillOpacity="0.22" />
        <circle cx="100" cy="100" r="14" fill="var(--ph-accent)" />
        <circle cx="100" cy="100" r="5" fill="var(--ph-accent-on)" />
      </svg>
    );
  }

  if (kind === 'hire') {
    return (
      <svg
        width={resolvedSize}
        height={resolvedSize}
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        className={cn('shrink-0 select-none', className)}
      >
        <circle cx="100" cy="100" r="86" fill="var(--ph-accent)" fillOpacity="0.09" />
        <g transform="translate(100 100) rotate(-6) translate(-100 -100)">
          <rect
            x="30"
            y="50"
            width="140"
            height="100"
            rx="24"
            fill="var(--ph-surface)"
            stroke="var(--ph-border)"
          />
          <circle cx="64" cy="84" r="18" fill="var(--ph-accent)" />
          <path
            d="M 56 84 L 62 90 L 73 77"
            stroke="var(--ph-accent-on)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="92" y="74" width="58" height="9" rx="4.5" fill="var(--ph-surface-alt)" />
          <rect x="92" y="90" width="38" height="9" rx="4.5" fill="var(--ph-surface-alt)" />
          <rect x="46" y="112" width="108" height="28" rx="12" fill="var(--ph-accent-soft)" />
          <text
            x="60"
            y="131"
            fill="var(--ph-accent)"
            fontWeight="800"
            fontSize="16"
          >
            ৳ 500
          </text>
        </g>
        {/* Gold coins */}
        <circle cx="32" cy="40" r="13" fill="var(--ph-star)" />
        <circle cx="168" cy="46" r="10" fill="var(--ph-star)" />
        <circle cx="162" cy="162" r="15" fill="var(--ph-star)" />
      </svg>
    );
  }

  // rate
  return (
    <svg
      width={resolvedSize}
      height={resolvedSize}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 select-none', className)}
    >
      <circle cx="100" cy="100" r="86" fill="var(--ph-accent)" fillOpacity="0.09" />
      {/* 3 ascending bars */}
      <rect x="48" y="102" width="28" height="44" rx="10" fill="var(--ph-accent)" fillOpacity="0.65" />
      <rect x="86" y="80" width="28" height="66" rx="10" fill="var(--ph-accent)" fillOpacity="0.82" />
      <rect x="124" y="52" width="28" height="94" rx="10" fill="var(--ph-accent)" />
      {/* Stars above bars */}
      <polygon
        points="62,76 65,83 72,84 67,89 68,96 62,92 56,96 57,89 52,84 59,83"
        fill="var(--ph-star)"
      />
      <polygon
        points="100,52 104,60 112,61 106,67 108,75 100,71 92,75 94,67 88,61 96,60"
        fill="var(--ph-star)"
      />
      <polygon
        points="138,20 143,30 153,31 146,38 148,48 138,43 128,48 130,38 123,31 133,30"
        fill="var(--ph-star)"
      />
      <line
        x1="36"
        y1="156"
        x2="164"
        y2="156"
        stroke="var(--ph-border)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Faint football-pitch line art backdrop (`PitchBackdrop` in Flutter).
 */
export function PitchBackdrop({
  opacity,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 800 500"
      fill="none"
      aria-hidden="true"
      style={opacity !== undefined ? { opacity } : undefined}
      className={cn('pointer-events-none select-none opacity-10 text-[var(--ph-accent)]', className)}
    >
      <rect x="40" y="30" width="720" height="440" rx="16" stroke="currentColor" strokeWidth="2.5" />
      <line x1="400" y1="30" x2="400" y2="470" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="400" cy="250" r="85" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="400" cy="250" r="5" fill="currentColor" />
      <rect x="40" y="135" width="110" height="230" stroke="currentColor" strokeWidth="2.5" />
      <rect x="650" y="135" width="110" height="230" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Page container with the signature subtle radial pitch-green glow in the top-left corner (`PhPage` in Flutter).
 */
export function PhPage({
  children,
  glow = true,
  className,
}: {
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative min-h-dvh w-full bg-[var(--ph-bg)] text-[var(--ph-text)]', className)}>
      {glow && (
        <div
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--ph-accent) 13%, transparent) 0%, transparent 55%)',
          }}
          className="pointer-events-none fixed inset-0 z-0"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

