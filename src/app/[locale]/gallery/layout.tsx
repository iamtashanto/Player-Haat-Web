import { notFound } from 'next/navigation';

/** The component gallery is a developer tool; it doesn't exist in production. */
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();
  return children;
}
