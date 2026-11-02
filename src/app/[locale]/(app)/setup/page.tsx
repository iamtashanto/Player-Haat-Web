'use client';

import { Redirect } from '@/components/shells/redirect';
import { RoleView } from '@/components/shells/role-view';
import SetupPlayerView from '@/views/setup-player';

export default function Page() {
  return <RoleView player={<SetupPlayerView />} recruiter={<Redirect to="/setup/recruiter" />} />;
}
