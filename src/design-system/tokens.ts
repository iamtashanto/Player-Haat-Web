/**
 * PlayerHaat Shared Design Tokens
 * Exact parity with the Flutter mobile app (`app/lib/design_system/tokens.dart`, `colors.dart`, `typography.dart`)
 * plus responsive desktop tokens.
 */

export const PhSpace = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
  x12: 48,
  x16: 64,
  /** Horizontal page gutter (mobile: 20px, desktop: 32px) */
  gutter: 20,
  gutterDesktop: 32,
} as const;

export const PhRadius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  sheet: 32,
  pill: 9999,
} as const;

export const PhMotion = {
  fastMs: 140,
  baseMs: 240,
  slowMs: 420,
  /** cubic-bezier equivalent of Curves.easeOutCubic */
  out: [0.215, 0.61, 0.355, 1.0] as const,
  /** Slight overshoot — the "spring" feel for sheets, selection pills and press-release (Cubic(0.2, 0.9, 0.25, 1.06)) */
  spring: [0.2, 0.9, 0.25, 1.06] as const,
  /** Framer Motion spring config matching the iOS sheet / pill feel */
  framerSpring: {
    type: 'spring' as const,
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  },
} as const;

export const kHairline = 0.5;
export const kMinTap = 44;

export interface PhColorPalette {
  brightness: 'light' | 'dark';
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentOn: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  star: string;
  glassTint: string;
  glassSolid: string;
  glassBorder: string;
  glassHighlight: string;
  shimmerBase: string;
  shimmerHighlight: string;
  scrim: string;
}

/**
 * Contrast checked:
 * - accent on white = 4.8:1 (WCAG AA)
 * - text on bg >= 15:1
 * - textSecondary >= 6:1
 * - textTertiary >= 4.6:1
 */
export const PhColors: { light: PhColorPalette; dark: PhColorPalette } = {
  light: {
    brightness: 'light',
    bg: '#F3F5F1',
    surface: '#FFFFFF',
    surfaceAlt: '#EBEEE9',
    border: 'rgba(0, 0, 0, 0.08)',
    text: '#0F1511',
    textSecondary: '#55605A',
    textTertiary: '#6B756F',
    accent: '#0A8443',
    accentOn: '#FFFFFF',
    accentSoft: 'rgba(10, 132, 67, 0.12)',
    danger: '#C62828',
    dangerSoft: 'rgba(198, 40, 40, 0.10)',
    warning: '#8A5A00',
    warningSoft: 'rgba(245, 164, 0, 0.12)',
    star: '#F2A900',
    glassTint: 'rgba(255, 255, 255, 0.64)',
    glassSolid: 'rgba(255, 255, 255, 0.96)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassHighlight: 'rgba(255, 255, 255, 0.70)',
    shimmerBase: '#E4E8E2',
    shimmerHighlight: '#F4F6F2',
    scrim: 'rgba(0, 0, 0, 0.40)',
  },
  dark: {
    brightness: 'dark',
    bg: '#0B0F0C',
    surface: '#151B17',
    surfaceAlt: '#1D2520',
    border: 'rgba(255, 255, 255, 0.10)',
    text: '#F2F5F3',
    textSecondary: '#A6B1AA',
    textTertiary: '#86918A',
    accent: '#34D17A',
    accentOn: '#04210F',
    accentSoft: 'rgba(52, 209, 122, 0.16)',
    danger: '#FF6B63',
    dangerSoft: 'rgba(255, 107, 99, 0.16)',
    warning: '#FFC24D',
    warningSoft: 'rgba(255, 194, 77, 0.16)',
    star: '#FFC53D',
    glassTint: 'rgba(24, 32, 27, 0.64)',
    glassSolid: 'rgba(23, 30, 25, 0.96)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHighlight: 'rgba(255, 255, 255, 0.08)',
    shimmerBase: '#1B231E',
    shimmerHighlight: '#26302A',
    scrim: 'rgba(0, 0, 0, 0.60)',
  },
};

/**
 * Deterministic avatar gradient palettes matching `PhAvatar._palettes` in Flutter.
 */
export const PhAvatarPalettes: readonly [string, string][] = [
  ['#11998E', '#38EF7D'],
  ['#3A7BD5', '#00D2FF'],
  ['#F2994A', '#F2C94C'],
  ['#8E54E9', '#4776E6'],
  ['#EB5757', '#F2994A'],
  ['#0BA360', '#3CBA92'],
] as const;

/**
 * Type scale modelled on iOS (largeTitle -> overline).
 * In Bangla mode (`bn`), font size scales by 1.06x and line-height by 1.18x so matras and conjuncts never clip.
 */
export const PhTypography = {
  largeTitle: { size: 34, lineHeight: 41, weight: 700, tracking: '-0.018em' },
  title1: { size: 28, lineHeight: 34, weight: 700, tracking: '-0.014em' },
  title2: { size: 22, lineHeight: 28, weight: 700, tracking: '-0.012em' },
  title3: { size: 20, lineHeight: 25, weight: 600, tracking: '-0.01em' },
  headline: { size: 17, lineHeight: 22, weight: 600, tracking: '-0.01em' },
  body: { size: 17, lineHeight: 24, weight: 400, tracking: '-0.01em' },
  bodyStrong: { size: 17, lineHeight: 24, weight: 600, tracking: '-0.01em' },
  callout: { size: 16, lineHeight: 22, weight: 400, tracking: '-0.009em' },
  subhead: { size: 15, lineHeight: 20, weight: 400, tracking: '-0.006em' },
  subheadStrong: { size: 15, lineHeight: 20, weight: 600, tracking: '-0.006em' },
  footnote: { size: 13, lineHeight: 18, weight: 400, tracking: '0em' },
  caption: { size: 12, lineHeight: 16, weight: 500, tracking: '0.008em' },
  button: { size: 17, lineHeight: 22, weight: 600, tracking: '-0.01em' },
  overline: { size: 12, lineHeight: 16, weight: 600, tracking: '0.05em' },
} as const;
