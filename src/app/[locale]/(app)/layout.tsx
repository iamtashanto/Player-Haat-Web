import React from 'react';
import { AppShell } from '@/components/shells/app-shell';
import { assertServerSession } from '@/lib/server-guard';

export default async function AppGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await assertServerSession({ locale });
  return <AppShell>{children}</AppShell>;
}
