import React from 'react';
import { RoleShell } from '@/components/shells/role-shell';

export default function PlayerGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleShell role="PLAYER">{children}</RoleShell>;
}

