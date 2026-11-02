'use client';

import { RoleView } from '@/components/shells/role-view';
import PlayerHome from '@/views/player/home';
import RecruiterHome from '@/views/recruiter/home';

export default function Page() {
  return <RoleView player={<PlayerHome />} recruiter={<RecruiterHome />} />;
}
