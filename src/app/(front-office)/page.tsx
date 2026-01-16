"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventRegistration } from "@/components/front-office/ui/EventRegistration";
import { Payment } from "@/components/front-office/ui/Payment";
import { Dashboard } from "@/components/front-office/ui/Dashboard";

type View =
  | "verify"
  | "login"
  | "event-selection"
  | "profile"
  | "event-registration"
  | "payment"
  | "dashboard";

export default function HomePage() {
  const [view, setView] = useState<View>("verify");
  const [email, setEmail] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);

  const steps = useMemo(() => {
    return [
      { id: 1, title: "Verify Email", description: "Confirm your email address", completed: view !== "verify" && view !== "login" },
      { id: 2, title: "Select Event", description: "Choose your event", completed: !!selectedEvent && view !== "event-selection" },
      { id: 3, title: "Profile", description: "Tell us about you", completed: !!profile && view !== "profile" },
      { id: 4, title: "Register", description: "Attendance preferences", completed: !!registration && view !== "event-registration" },
      { id: 5, title: "Payment", description: "Confirm your spot", completed: view === "dashboard" },
    ];
  }, [view, selectedEvent, profile, registration]);

  const currentStep = useMemo(() => {
    switch (view) {
      case "verify":
      case "login":
        return 1;
      case "event-selection":
        return 2;
      case "profile":
        return 3;
      case "event-registration":
        return 4;
      case "payment":
        return 5;
      case "dashboard":
        return 5;
      default:
        return 1;
    }
  }, [view]);

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        currentStep={currentStep}
        steps={steps}
        onAlreadyRegistered={() => setView("login")}
      />

      {/* 🔥 THIS is the wrapper that affects your EmailVerification centering */}
      <div className="flex-1 h-full flex overflow-y-auto bg-white">
        {view === "verify" && (
          <EmailVerification
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              setView("event-selection");
            }}
            onAlreadyRegistered={() => setView("login")}
          />
        )}

        {view === "login" && (
          <ReturningUserLogin
            onLoginSuccess={() => setView("dashboard")}
            onCancel={() => setView("verify")}
          />
        )}

        {view === "event-selection" && (
          <EventSelection
            onSelectEvent={(eventId, eventName) => {
              setSelectedEvent({ id: eventId, name: eventName });
              setView("profile");
            }}
            onBack={() => setView("verify")}
            selectedEventId={selectedEvent?.id}
            userProfile={profile}
          />
        )}

        {view === "profile" && (
          <ProfileForm
            onComplete={(p) => {
              setProfile(p);
              setView("event-registration");
            }}
            onBack={() => setView("event-selection")}
            initialData={profile}
          />
        )}

        {view === "event-registration" && (
          <EventRegistration
            onComplete={(data) => {
              setRegistration({
                ...data,
                eventId: selectedEvent?.id,
                eventName: selectedEvent?.name,
              });
              setView("payment");
            }}
            onBack={() => setView("profile")}
            initialData={registration}
          />
        )}

        {view === "payment" && (
          <Payment
            amount={2500}
            onComplete={() => setView("dashboard")}
            onBack={() => setView("event-registration")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            userEmail={email}
            profile={profile}
            registration={registration}
            accommodation={null}
            onLogout={() => {
              setEmail("");
              setSelectedEvent(null);
              setProfile(null);
              setRegistration(null);
              setView("verify");
            }}
          />
        )}
      </div>
    </div>
  );
}
