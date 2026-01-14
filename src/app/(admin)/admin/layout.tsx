'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // TODO: Replace with your actual authentication logic
    const checkAuth = async () => {
      const isAuthenticated = await verifyAdminAuth();
      
      if (!isAuthenticated) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router, pathname]);

  const verifyAdminAuth = async () => {
    // TODO: Implement your auth verification
    // Check tokens, session, etc.
    // For now, return true during development
    return true;
  };

  return (
    <div className="admin-layout">
      {/* Optional: Add admin-specific header/navigation */}
      <nav className="bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h2 className="text-xl font-bold">SMFLX Admin</h2>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
          >
            Back to Site
          </button>
        </div>
      </nav>
      
      {children}
    </div>
  );
}