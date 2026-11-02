'use client';

import { useParams } from 'next/navigation';
import RateView from '@/views/rate';

export default function Page() {
  const { requestId } = useParams<{ requestId: string }>();
  return <RateView requestId={requestId} />;
}
