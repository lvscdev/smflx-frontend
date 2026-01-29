'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/front-office/ui/Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  
  // TODO: Replace with actual data from your API/database
  const [userData, setUserData] = useState({
    email: 'user@example.com',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      ageRange: '23-29',
      country: 'Nigeria',
      state: 'Lagos',
      localAssembly: 'Word of Truth Assembly',
      address: '123 Main Street, Lagos',
      isMinister: 'no',
      employmentStatus: 'employed',
      maritalStatus: 'single',
    },
    registration: {
      eventName: 'WOTH Camp Meeting 2026',
      attendeeType: 'camper',
      accommodationType: 'hostel',
    },
    accommodation: {
      type: 'hostel',
      facility: 'dansol-high',
      bed: 'B-101',
      price: 15000,
    },
  });

  const handleLogout = () => {
    // TODO: Add your logout logic here
    // Clear session, tokens, etc.
    router.push('/');
  };

  const handleAccommodationUpdate = (data: any) => {
    setUserData({
      ...userData,
      accommodation: data,
    });
  };

  const handleRegistrationUpdate = (data: any) => {
    setUserData({
      ...userData,
      registration: data,
    });
  };

  return (
    <Dashboard
      userEmail={userData.email}
      profile={userData.profile}
      registration={userData.registration}
      accommodation={userData.accommodation}
      onLogout={handleLogout}
      onAccommodationUpdate={handleAccommodationUpdate}
      onRegistrationUpdate={handleRegistrationUpdate}
    />
  );
}