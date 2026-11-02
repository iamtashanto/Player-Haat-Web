'use client';

import { useParams } from 'next/navigation';
import PlayerProfileView from '@/views/player-profile';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PlayerProfileView id={id} />;
}
