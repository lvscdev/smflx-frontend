'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  // TODO: Add your authentication check
  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [router]);

  const checkAuth = () => {
    // TODO: Implement your auth check logic
    // For now, return true to allow access during development
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Welcome to the SMFLX admin panel
          </p>
          
          {/* Add your admin interface here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Total Registrations</h3>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Active Events</h3>
              <p className="text-3xl font-bold text-green-600">3</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">₦18.5M</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}