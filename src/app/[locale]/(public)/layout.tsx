import React from 'react';
import { PublicShell } from '@/components/shells/public-shell';

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}

