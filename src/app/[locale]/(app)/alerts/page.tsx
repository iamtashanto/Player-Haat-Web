'use client';

import { RoleView } from '@/components/shells/role-view';
import PlayerAlerts from '@/views/player/alerts';
import RecruiterAlerts from '@/views/recruiter/alerts';

export default function Page() {
  return <RoleView player={<PlayerAlerts />} recruiter={<RecruiterAlerts />} />;
}
