"use client";

import { useMemo, useState } from "react";

import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { Payment } from "@/components/front-office/ui/Payment";
import { Dashboard } from "@/components/front-office/ui/Dashboard";

type View =
  | "verify"
  | "login"
  | "profile"
  | "event-selection"
  | "payment"
  | "dashboard";

type SelectedEvent = { id: string; name: string };

type ProfileData = {
  fullName: string;
  gender: string;
  ageRange: string;
  country: string;
  state: string;
  localAssembly: string;
  address: string;
  isMinister: string;
  employmentStatus: string;
  maritalStatus: string;
  spouseName?: string;
  isYAT?: boolean;
};

type RegistrationData = {
  eventId: string;
  eventName: string;
  attendeeType?: "camper" | "physical" | "online";
};

const EVENT_PRICES: Record<string, number> = {
  campmeeting26: 25000,
  "yat-campmeeting26": 15000,
  woth25: 0,
};

export default function HomePage() {
  const [view, setView] = useState<View>("verify");

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  // ✅ what dashboard expects
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [accommodation, setAccommodation] = useState<any>(null);

  const amount = useMemo(() => {
    if (!selectedEvent) return 0;
    return EVENT_PRICES[selectedEvent.id] ?? 25000;
  }, [selectedEvent]);

  const steps = useMemo(() => {
    const order: View[] = ["verify", "profile", "event-selection", "payment", "dashboard"];
    const idx = (v: View) => order.indexOf(v);

    return [
      {
        id: 1,
        title: "Verify Email",
        description: "Confirm your email address",
        completed: view !== "verify" && view !== "login",
      },
      {
        id: 2,
        title: "Profile",
        description: "Complete your details",
        completed: idx(view) > idx("profile"),
      },
      {
        id: 3,
        title: "Select Event",
        description: "Choose your event",
        completed: idx(view) > idx("event-selection"),
      },
      {
        id: 4,
        title: "Payment",
        description: "Make payment",
        completed: idx(view) > idx("payment"),
      },
      {
        id: 5,
        title: "Dashboard",
        description: "Finish setup",
        completed: view === "dashboard",
      },
    ];
  }, [view]);

  const currentStep = useMemo(() => {
    switch (view) {
      case "verify":
      case "login":
        return 1;
      case "profile":
        return 2;
      case "event-selection":
        return 3;
      case "payment":
        return 4;
      case "dashboard":
        return 5;
      default:
        return 1;
    }
  }, [view]);

  // ✅ Simple logout handler
  const handleLogout = () => {
    setView("verify");
    setEmail("");
    setProfile(null);
    setSelectedEvent(null);
    setRegistration(null);
    setAccommodation(null);
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        currentStep={currentStep}
        steps={steps}
        onAlreadyRegistered={() => setView("login")}
      />

      <div className="flex-1 h-full flex overflow-y-auto bg-white">
        {view === "verify" && (
          <EmailVerification
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              setView("profile");
            }}
            onAlreadyRegistered={() => setView("login")}
          />
        )}

        {view === "login" && (
          <ReturningUserLogin
            onLoginSuccess={() => {
              // ✅ demo mode: go straight to dashboard
              // (you can later fetch profile/registration from API)
              setView("dashboard");
            }}
            onCancel={() => setView("verify")}
          />
        )}

        {view === "profile" && (
          <ProfileForm
            initialData={profile}
            onBack={() => setView("verify")}
            onComplete={(profileData) => {
              setProfile(profileData);
              setView("event-selection");
            }}
          />
        )}

        {view === "event-selection" && (
          <EventSelection
            userProfile={profile}
            selectedEventId={selectedEvent?.id}
            onBack={() => setView("profile")}
            onSelectEvent={(eventId, eventName) => {
              setSelectedEvent({ id: eventId, name: eventName });

              // ✅ create/update registration object now
              setRegistration({
                eventId,
                eventName,
                attendeeType: "physical", // demo default; you can change later in registration flow
              });

              setView("payment");
            }}
          />
        )}

        {view === "payment" && (
          <Payment
            amount={amount}
            onBack={() => setView("event-selection")}
            onComplete={() => setView("dashboard")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            userEmail={email || "demo@smflx.com"}
            profile={profile || { fullName: "Demo User" }}
            registration={
              registration || {
                eventId: "campmeeting26",
                eventName: "WOTH Camp Meeting 2026",
                attendeeType: "physical",
              }
            }
            accommodation={accommodation}
            onLogout={handleLogout}
            onAccommodationUpdate={(data) => setAccommodation(data)}
            onRegistrationUpdate={(data) => setRegistration(data)}
          />
        )}
      </div>
    </div>
  );
}
