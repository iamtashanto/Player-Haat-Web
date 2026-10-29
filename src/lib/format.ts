import type { AppLocale } from '@/i18n/routing';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

/**
 * Convert Latin digits in a string to Bangla digits when locale === 'bn'.
 */
export function toLocaleDigits(input: string | number, locale: AppLocale): string {
  const str = String(input);
  if (locale !== 'bn') return str;
  return str.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/**
 * Format an integer with locale grouping ("1,200" or "১,২০০").
 */
export function formatNumber(n: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Format a 1-decimal rating ("4.8" or "৪.৮").
 */
export function formatDecimal1(v: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);
}

/**
 * Format BDT currency ("৳500" or "৳৫০০").
 */
export function formatMoney(bdt: number, locale: AppLocale): string {
  return `৳${formatNumber(bdt, locale)}`;
}

/**
 * Format a rate/budget range: "৳400–600", "৳400+", or "up to ৳600".
 */
export function formatMoneyRange(
  min: number | null | undefined,
  max: number | null | undefined,
  locale: AppLocale,
  upToFn?: (amount: string) => string,
): string {
  if (min != null && max != null) {
    return min === max
      ? formatMoney(min, locale)
      : `${formatMoney(min, locale)}–${formatNumber(max, locale)}`;
  }
  if (min != null) return `${formatMoney(min, locale)}+`;
  if (max != null) {
    const amt = formatMoney(max, locale);
    return upToFn ? upToFn(amt) : locale === 'bn' ? `সর্বোচ্চ ${amt}` : `up to ${amt}`;
  }
  return '';
}

/**
 * Format date in Asia/Dhaka ("5 November, 2026" or "৫ নভেম্বর, ২০২৬").
 */
export function formatDate(date: Date | string, locale: AppLocale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  }).format(d);
}

/**
 * Format short date in Asia/Dhaka ("Fri, 6 Nov" or "শুক্র, ৬ নভে").
 */
export function formatDateShort(date: Date | string, locale: AppLocale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(d);
}

/**
 * Format time in Asia/Dhaka ("6:30 PM" or natural Bangla period "সন্ধ্যা ৬:৩০").
 */
export function formatTime(date: Date | string, locale: AppLocale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (locale !== 'bn') {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka',
    }).format(d);
  }
  // Extract Dhaka hour
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Dhaka',
  }).formatToParts(d);
  const hour24 = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const period =
    hour24 < 4
      ? 'রাত'
      : hour24 < 12
        ? 'সকাল'
        : hour24 < 16
          ? 'দুপুর'
          : hour24 < 18
            ? 'বিকেল'
            : hour24 < 20
              ? 'সন্ধ্যা'
              : 'রাত';
  const hm = new Intl.DateTimeFormat('bn-BD', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dhaka',
  })
    .format(d)
    .replace(/\s*(AM|PM|পূর্বাহ্ণ|অপরাহ্ণ)\s*/gi, '')
    .trim();
  return `${period} ${hm}`;
}

/**
 * Format rating pill text: "4.8 (23)" or "৪.৮ (২৩)".
 */
export function formatRatingText(avg: number, count: number, locale: AppLocale): string {
  return `${formatDecimal1(avg, locale)} (${formatNumber(count, locale)})`;
}

