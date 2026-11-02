'use client';

import { useParams } from 'next/navigation';
import VerifyView from '@/views/verify';

export default function Page() {
  const { sportId } = useParams<{ sportId: string }>();
  return <VerifyView sportId={Number(sportId)} />;
}
