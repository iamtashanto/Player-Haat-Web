'use client';

import { useParams } from 'next/navigation';
import ChatView from '@/views/chat';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <ChatView id={id} />;
}
