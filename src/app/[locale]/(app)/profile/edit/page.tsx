'use client';

import { RoleView } from '@/components/shells/role-view';
import PlayerProfiles from '@/views/player/profiles';
import RecruiterSetup from '@/views/recruiter/onboarding';

export default function Page() {
  return <RoleView player={<PlayerProfiles />} recruiter={<RecruiterSetup />} />;
}
