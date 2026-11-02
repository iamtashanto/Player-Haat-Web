'use client';

import { useParams } from 'next/navigation';
import TeamView from '@/views/team';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <TeamView id={id} />;
}
