'use client';

import { RoleView } from '@/components/shells/role-view';
import PlayerGames from '@/views/player/games';
import RecruiterRequests from '@/views/recruiter/requests';

export default function Page() {
  return <RoleView player={<PlayerGames />} recruiter={<RecruiterRequests />} />;
}
