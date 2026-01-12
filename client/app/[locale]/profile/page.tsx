'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="text-center py-12 text-gray-500">
        Profile management coming soon...
      </div>
    </div>
  );
}
