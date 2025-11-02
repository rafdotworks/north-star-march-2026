'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CVPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/documents/CV.pdf');
  }, [router]);

  return null;
}
