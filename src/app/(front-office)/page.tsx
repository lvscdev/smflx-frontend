"use client";

import { useMemo, useState } from "react";

import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { EventRegistration } from "@/components/front-office/ui/EventRegistration";
import { Payment } from "@/components/front-office/ui/Payment";
import { Dashboard } from "@/components/front-office/ui/Dashboard";

type View =
  | "verify"
  | "login"
  | "profile"
  | "event-selection"
  | "event-registration"
  | "payment"
  | "dashboard";

export default function HomePage() {
  const [view, setView] = useState<View>("verify");

  const [email, setEmail] = useState<string>("");

  // Data we collect along the way
  const [profile, setProfile] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [accommodation, setAccommodation] = useState<any>(null);

  // You can compute this based on selectedEvent/registration later
  const paymentAmount = useMemo(() => {
    // Demo default
    return 2500;
  }, []);

  const steps = useMemo(() => {
    return [
      { id: 1, title: "Verify Email", description: "Confirm your email address", completed: view !== "verify" && view !== "login" },
      { id: 2, title: "Profile", description: "Enter personal details", completed: ["event-selection","event-registration","payment","dashboard"].includes(view) },
      { id: 3, title: "Select Event", description: "Choose your event", completed: ["event-registration","payment","dashboard"].includes(view) },
      { id: 4, title: "Register", description: "Attendance preferences", completed: ["payment","dashboard"].includes(view) },
      { id: 5, title: "Payment", description: "Confirm registration", completed: ["dashboard"].includes(view) },
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

  const handleLogout = () => {
    // Reset flow
    setEmail("");
    setProfile(null);
    setSelectedEvent(null);
    setRegistration(null);
    setAccommodation(null);
    setView("verify");
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        currentStep={currentStep}
        steps={steps}
        onAlreadyRegistered={() => setView("login")}
      />

      {/* Right panel fills height and scrolls inside */}
      <div className="flex-1 h-full overflow-y-auto bg-white">
        {view === "verify" && (
          <EmailVerification
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              setView("profile"); // ✅ go to Profile first
            }}
            onAlreadyRegistered={() => setView("login")}
          />
        )}

        {view === "login" && (
          <ReturningUserLogin
            onLoginSuccess={() => setView("dashboard")} // ✅ returning users land on dashboard
            onCancel={() => setView("verify")} // New Registration
          />
        )}

        {view === "profile" && (
          <ProfileForm
            initialData={profile}
            onBack={() => setView("verify")}
            onComplete={(p) => {
              setProfile(p);
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
              setView("event-registration");
            }}
          />
        )}

        {view === "event-registration" && (
          <EventRegistration
            initialData={registration}
            onBack={() => setView("event-selection")}
            onComplete={(reg) => {
              // Save event info into registration too (helps dashboard)
              const regWithEvent = {
                ...reg,
                eventId: selectedEvent?.id,
                eventName: selectedEvent?.name,
              };
              setRegistration(regWithEvent);
              setView("payment");
            }}
          />
        )}

        {view === "payment" && (
          <Payment
            amount={paymentAmount}
            onBack={() => setView("event-registration")}
            onComplete={() => setView("dashboard")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            userEmail={email}
            profile={profile}
            registration={registration}
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
