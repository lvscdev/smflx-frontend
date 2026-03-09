"use client";

import { Loader2 } from "lucide-react";
import { Dashboard } from "@/components/front-office/ui/Dashboard";
import { useDashboardBoot } from "@/hooks/useDashboardBoot";
import { usePostPaymentPolling } from "@/hooks/usePostPaymentPolling";

export default function DashboardPage() {
  const {
    loading,
    error,
    email,
    profile,
    ownerRegId,
    registration,
    accommodation,
    activeEventId,
    setProfile,
    setRegistration,
    setAccommodation,
    setActiveEventId,
    handleLogout,
  } = useDashboardBoot();

  usePostPaymentPolling({ setRegistration, setAccommodation });

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      userEmail={email}
      profile={profile}
      registration={registration}
      accommodation={accommodation}
      activeEventId={activeEventId}
      ownerRegId={ownerRegId}
      onLogout={handleLogout}
      onProfileUpdate={(p) => {
        setProfile(p);
      }}
      onRegistrationUpdate={(r) => {
        setRegistration(r);
        const eid = activeEventId ?? (r?.eventId ?? registration?.eventId ?? null);
        if (eid) setActiveEventId(eid);
      }}
      onAccommodationUpdate={(a) => {
        setAccommodation(a);
      }}
    />
  );
}