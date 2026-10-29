import { z } from 'zod';

/**
 * Normalizes a Bangladesh mobile number to the 11-digit national form (`01XXXXXXXXX`).
 * Mirrors Flutter's `nationalDigits` in `app/lib/features/auth/presentation/phone_screens.dart`.
 */
export function nationalDigits(input: string): string {
  let d = input.replace(/[^\d]/g, '');
  if (d.startsWith('00880')) d = d.slice(5);
  else if (d.startsWith('880')) d = d.slice(3);
  if (d.length === 10 && d.startsWith('1')) d = `0${d}`;
  return d;
}

/**
 * Normalizes a Bangladesh mobile number to E.164 (`+8801XXXXXXXXX`) or returns `null` if invalid.
 * Mirrors `normalizeBdPhone` in `server/src/lib/phone.ts`.
 */
export function normalizeBdPhone(input: string): string | null {
  const nat = nationalDigits(input);
  if (!looksLikeBdMobile(nat)) return null;
  return `+880${nat.slice(1)}`;
}

/**
 * Checks whether a string is a valid 11-digit Bangladeshi mobile number (`013`–`019`).
 * Mirrors `looksLikeBdMobile` in `app/lib/features/auth/presentation/auth_widgets.dart`.
 */
export function looksLikeBdMobile(digits: string): boolean {
  return /^01[3-9]\d{8}$/.test(digits);
}

/**
 * Formats an 11-digit national BD number or E.164 number for display (`+880 1712345678`).
 */
export function formatBdPhoneDisplay(input: string): string {
  const nat = nationalDigits(input);
  if (nat.length === 11 && nat.startsWith('0')) {
    return `+880 ${nat.slice(1)}`;
  }
  return input;
}

/**
 * Email validation rule matching `looksLikeEmail` in `auth_widgets.dart` & server Zod.
 */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Password validation returning the localization key if invalid, or `null` when valid.
 * Mirrors `passwordProblem` in `app/lib/features/auth/presentation/auth_widgets.dart`
 * and `passwordSchema` in `server/src/modules/auth/auth.schema.ts`.
 */
export function passwordProblemKey(
  value: string,
): 'passwordTooShort' | 'passwordNeedsMix' | null {
  if (value.length < 8) return 'passwordTooShort';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'passwordNeedsMix';
  return null;
}

// ── Zod Schemas mirroring API validation (`server/src/modules/auth/auth.schema.ts`) ──

export const signupRoleSchema = z.enum(['PLAYER', 'RECRUITER']);
export type SignupRole = z.infer<typeof signupRoleSchema>;

export const phoneRequestSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((val) => looksLikeBdMobile(nationalDigits(val)), {
      message: 'phoneInvalid',
    }),
});

export const phoneVerifySchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((val) => looksLikeBdMobile(nationalDigits(val)), {
      message: 'phoneInvalid',
    }),
  code: z.string().regex(/^\d{6}$/, { message: 'errAuthInvalidOtp' }),
  name: z.string().trim().min(1).max(80).optional(),
  role: signupRoleSchema.optional(),
});

export const emailSignInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(looksLikeEmail, { message: 'emailInvalid' }),
  password: z.string().min(1, { message: 'passwordRequiredField' }).max(128),
});

export const emailSignUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'nameRequired' })
    .max(80, { message: 'nameRequired' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(looksLikeEmail, { message: 'emailInvalid' }),
  password: z
    .string()
    .min(8, { message: 'passwordTooShort' })
    .max(128)
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
      message: 'passwordNeedsMix',
    }),
  role: signupRoleSchema.default('PLAYER'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(looksLikeEmail, { message: 'emailInvalid' }),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(looksLikeEmail, { message: 'emailInvalid' }),
  code: z.string().regex(/^\d{6}$/, { message: 'errAuthInvalidOtp' }),
  newPassword: z
    .string()
    .min(8, { message: 'passwordTooShort' })
    .max(128)
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
      message: 'passwordNeedsMix',
    }),
});

