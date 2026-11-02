'use client';

import { RoleView } from '@/components/shells/role-view';
import PlayerPlayers from '@/views/player/players';
import RecruiterDiscover from '@/views/recruiter/discover';

export default function Page() {
  return <RoleView player={<PlayerPlayers />} recruiter={<RecruiterDiscover />} />;
}
