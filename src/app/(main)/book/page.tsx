
'use client';

import { useRouter } from 'next/navigation';
import BookingForm from "./BookingForm";
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function BookingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <BookingForm />
    </div>
  );
}
