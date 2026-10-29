import React from 'react';
import { RoleShell } from '@/components/shells/role-shell';

export default function RecruiterGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleShell role="RECRUITER">{children}</RoleShell>;
}

