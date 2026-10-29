import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { parseSessionMeta, isAdminRole } from './auth-cookies';
import { AUTH_COOKIES, type AppRole } from './auth-types';

/**
 * Server-side route guard (Layer 2 of RBAC enforcement) called in `(player)/layout.tsx` and `(recruiter)/layout.tsx`.
 * Verifies the `httpOnly` refresh cookie + session metadata cookie and blocks `SUPER_ADMIN` / `ADMIN` accounts.
 */
export async function assertServerRoleAccess(params: {
  locale: string;
  requiredArea: AppRole;
}) {
  const { locale, requiredArea } = params;
  const cookieStore = await cookies();
  const hasRefresh = Boolean(
    cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value,
  );
  const meta = parseSessionMeta(
    cookieStore.get(AUTH_COOKIES.SESSION_META)?.value,
  );

  if (meta && isAdminRole(meta.role)) {
    redirect(`/${locale}/auth?error=admin_dashboard_only`);
  }

  if (!hasRefresh || !meta) {
    const nextPath = requiredArea === 'RECRUITER' ? '/recruiter' : '/player';
    redirect(`/${locale}/auth?next=${encodeURIComponent(nextPath)}`);
  }

  return meta;
}

