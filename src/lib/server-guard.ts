import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { parseSessionMeta, isAdminRole } from './auth-cookies';
import { AUTH_COOKIES } from './auth-types';

/**
 * Server-side route guard (Layer 2 of RBAC enforcement) called in `(app)/layout.tsx`.
 * Verifies the `httpOnly` refresh cookie + session metadata cookie and blocks `SUPER_ADMIN` / `ADMIN` accounts.
 */
export async function assertServerSession(params: { locale: string; next?: string }) {
  const { locale, next } = params;
  const cookieStore = await cookies();
  const hasRefresh = Boolean(cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value);
  const meta = parseSessionMeta(cookieStore.get(AUTH_COOKIES.SESSION_META)?.value);

  if (meta && isAdminRole(meta.role)) {
    redirect(`/${locale}/auth?error=admin_dashboard_only`);
  }
  if (!hasRefresh || !meta) {
    redirect(`/${locale}/auth${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  }
  return meta;
}
