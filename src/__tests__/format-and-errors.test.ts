import { describe, expect, it } from 'vitest';
import {
  formatDecimal1,
  formatMoney,
  formatMoneyRange,
  formatNumber,
  formatRatingText,
  toLocaleDigits,
} from '../lib/format';
import { ApiException, getErrorText } from '../lib/errors';
import { PhColors, PhRadius, PhSpace } from '../design-system/tokens';

describe('Phase 1: Design Tokens & Locale Formatting', () => {
  it('exposes exact 8-pt grid spacing and corner radii matching Flutter PhSpace & PhRadius', () => {
    expect(PhSpace.x1).toBe(4);
    expect(PhSpace.x4).toBe(16);
    expect(PhSpace.gutter).toBe(20);
    expect(PhRadius.sm).toBe(12);
    expect(PhRadius.md).toBe(16);
    expect(PhRadius.lg).toBe(22);
    expect(PhRadius.xl).toBe(28);
    expect(PhRadius.sheet).toBe(32);
  });

  it('exposes light and dark color palettes with pitch-green brand accent', () => {
    expect(PhColors.light.accent).toBe('#0A8443');
    expect(PhColors.dark.accent).toBe('#34D17A');
    expect(PhColors.light.bg).toBe('#F3F5F1');
    expect(PhColors.dark.bg).toBe('#0B0F0C');
  });

  it('formats numbers, money, ranges, and ratings in English and Bangla', () => {
    expect(toLocaleDigits('2026', 'bn')).toBe('২০২৬');
    expect(toLocaleDigits('2026', 'en')).toBe('2026');

    expect(formatNumber(1250, 'en')).toBe('1,250');
    expect(formatNumber(1250, 'bn')).toBe('১,২৫০');

    expect(formatDecimal1(4.8, 'en')).toBe('4.8');
    expect(formatDecimal1(4.8, 'bn')).toBe('৪.৮');

    expect(formatMoney(500, 'en')).toBe('৳500');
    expect(formatMoney(500, 'bn')).toBe('৳৫০০');

    expect(formatMoneyRange(400, 600, 'en')).toBe('৳400–600');
    expect(formatMoneyRange(400, 600, 'bn')).toBe('৳৪০০–৬০০');
    expect(formatMoneyRange(400, null, 'en')).toBe('৳400+');
    expect(formatMoneyRange(null, 600, 'en', (a) => `up to ${a}`)).toBe('up to ৳600');

    expect(formatRatingText(4.8, 31, 'en')).toBe('4.8 (31)');
    expect(formatRatingText(4.8, 31, 'bn')).toBe('৪.৮ (৩১)');
  });

  it('maps API error codes to localized message keys', () => {
    const mockT = (k: string) => `translated:${k}`;
    const err = new ApiException({
      status: 403,
      code: 'AUTH_ADMIN_DASHBOARD_ONLY',
      message: 'Admin accounts sign in through the admin dashboard',
    });
    expect(getErrorText(mockT, err)).toBe('translated:errAdminDashboardOnly');
  });
});

