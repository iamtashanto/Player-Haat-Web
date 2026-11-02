'use client';

import { RoleView } from '@/components/shells/role-view';
import { Redirect } from '@/components/shells/redirect';
import PlayerSetup from '@/views/player/onboarding';

export default function Page() {
  return <RoleView player={<PlayerSetup />} recruiter={<Redirect to="/setup/recruiter" />} />;
}
