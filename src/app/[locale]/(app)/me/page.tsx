'use client';

import { RoleView } from '@/components/shells/role-view';
import PlayerMe from '@/views/player/me';
import RecruiterMe from '@/views/recruiter/me';

export default function Page() {
  return <RoleView player={<PlayerMe />} recruiter={<RecruiterMe />} />;
}
