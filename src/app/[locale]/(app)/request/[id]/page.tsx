'use client';

import { useParams } from 'next/navigation';
import RequestDetailView from '@/views/request-detail';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RequestDetailView id={id} />;
}
