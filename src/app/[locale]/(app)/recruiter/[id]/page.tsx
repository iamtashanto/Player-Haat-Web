'use client';

import { useParams } from 'next/navigation';
import RecruiterCardView from '@/views/recruiter-card';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RecruiterCardView id={id} />;
}
