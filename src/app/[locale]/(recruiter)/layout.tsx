import React from 'react';
import { RoleShell } from '@/components/shells/role-shell';
import { assertServerRoleAccess } from '@/lib/server-guard';

export default async function RecruiterGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await assertServerRoleAccess({ locale, requiredArea: 'RECRUITER' });

  return <RoleShell role="RECRUITER">{children}</RoleShell>;
}
