'use client';

import { RoleView } from '@/components/shells/role-view';
import { Redirect } from '@/components/shells/redirect';
import Shortlist from '@/views/recruiter/shortlist';

export default function Page() {
  return <RoleView player={<Redirect to="/home" />} recruiter={<Shortlist />} />;
}
