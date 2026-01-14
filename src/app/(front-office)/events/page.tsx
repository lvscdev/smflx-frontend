'use client';

import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
        <p className="text-gray-600 mb-8">
          Browse and register for upcoming SMFLX events
        </p>
        
        {/* Add your events list here */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-gray-500">Events coming soon...</p>
        </div>
      </div>
    </div>
  );
}