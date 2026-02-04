"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/front-office/ui/Dashboard";
import { getAuthToken, setAuthToken } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

const FLOW_STATE_KEY = "smflx_flow_state_v1";

function safeLoadFlowState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FLOW_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeClearFlowState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FLOW_STATE_KEY);
  } catch {
    // ignore
  }
}

function safeSaveFlowState(state: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [accommodation, setAccommodation] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/");
      return;
    }

    const saved = safeLoadFlowState();

    if (saved) {
      setEmail(saved.email || "");
      setProfile(saved.profile ?? null);
      setRegistration(saved.registration ?? null);
      setAccommodation(saved.accommodation ?? null);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    setAuthToken(null);
    safeClearFlowState();
    setLoading(true);
    router.replace("/");
  };

  const handleAccommodationUpdate = (data: any) => {
    setAccommodation(data);
    const saved = safeLoadFlowState();
    safeSaveFlowState({ ...saved, accommodation: data });
  };

  const handleRegistrationUpdate = (data: any) => {
    setRegistration(data);
    const saved = safeLoadFlowState();
    safeSaveFlowState({ ...saved, registration: data });
  };

  const handleProfileUpdate = (data: any) => {
    setProfile(data);
    const saved = safeLoadFlowState();
    safeSaveFlowState({ ...saved, profile: data });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-white">
      <Dashboard
        userEmail={email}
        profile={profile}
        registration={registration}
        accommodation={accommodation}
        onLogout={handleLogout}
        onAccommodationUpdate={handleAccommodationUpdate}
        onRegistrationUpdate={handleRegistrationUpdate}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
