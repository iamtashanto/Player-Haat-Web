'use client';

import { Redirect } from '@/components/shells/redirect';
import { RoleView } from '@/components/shells/role-view';
import EditProfileView from '@/views/edit-profile';

export default function Page() {
  return <RoleView player={<EditProfileView />} recruiter={<Redirect to="/recruiter/edit" />} />;
}
