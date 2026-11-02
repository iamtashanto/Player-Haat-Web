'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

/** One route, two role-specific screens, as in the Flutter app. Picks by the signed-in user's active role. */
export function RoleView({ player, recruiter }: { player: ReactNode; recruiter: ReactNode }) {
  const { activeRole, status } = useAuth();
  // Until the session is known the role is a guess; rendering (or redirecting) on it would flash the wrong screen.
  if (status !== 'authenticated') return null;
  return <>{activeRole === 'RECRUITER' ? recruiter : player}</>;
}
