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

  // shared state
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // ✅ Sidebar should NOT show on returning user flow + dashboard
  const showSidebar = view !== "login" && view !== "dashboard";

  const steps = useMemo(() => {
    // Only steps for new registration flow
    return [
      {
        id: 1,
        title: "Verify Email",
        description: "Confirm your email address",
        completed: view !== "verify",
      },
      {
        id: 2,
        title: "Profile",
        description: "Complete your details",
        completed: ["event-selection", "event-registration", "payment", "dashboard"].includes(view),
      },
      {
        id: 3,
        title: "Select Event",
        description: "Choose your event",
        completed: ["event-registration", "payment", "dashboard"].includes(view),
      },
      {
        id: 4,
        title: "Register",
        description: "Registration options",
        completed: ["payment", "dashboard"].includes(view),
      },
      {
        id: 5,
        title: "Payment",
        description: "Confirm payment",
        completed: ["dashboard"].includes(view),
      },
    ];
  }, [view]);

  const currentStep = useMemo(() => {
    switch (view) {
      case "verify":
        return 1;
      case "profile":
        return 2;
      case "event-selection":
        return 3;
      case "event-registration":
        return 4;
      case "payment":
        return 5;
      default:
        return 1;
    }
  }, [view]);

  return (
    <div className="flex min-h-screen w-full">
      {showSidebar && (
        <Sidebar
          currentStep={currentStep}
          steps={steps}
          onAlreadyRegistered={() => setView("login")}
        />
      )}

      {/* Right panel */}
      <div className="flex-1 min-h-screen overflow-y-auto bg-white">
        {view === "verify" && (
          <EmailVerification
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              // ✅ After verification -> Profile form (NEW registration)
              setView("profile");
            }}
            onAlreadyRegistered={() => setView("login")}
          />
        )}

        {view === "login" && (
          <ReturningUserLogin
            onLoginSuccess={() => {
              // ✅ Returning user goes straight to dashboard
              setView("dashboard");
            }}
            onCancel={() => setView("verify")} // New Registration
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
            onSelectEvent={(eventId, eventName) => {
              setSelectedEvent({ id: eventId, name: eventName });
              setView("event-registration");
            }}
            onBack={() => setView("profile")}
          />
        )}

        {view === "event-registration" && (
          <EventRegistration
            initialData={registration}
            onBack={() => setView("event-selection")}
            onComplete={(data) => {
              const reg = {
                ...data,
                eventId: selectedEvent?.id,
                eventName: selectedEvent?.name,
                email,
              };
              setRegistration(reg);

              // ✅ Decide payment amount (edit as needed)
              const amount =
                data.attendeeType === "online" ? 0 : 5000; // example logic
              setPaymentAmount(amount);

              setView(amount > 0 ? "payment" : "dashboard");
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
            accommodation={null}
            onLogout={() => {
              // reset to start
              setEmail("");
              setProfile(null);
              setSelectedEvent(null);
              setRegistration(null);
              setPaymentAmount(0);
              setView("verify");
            }}
          />
        )}
      </div>
    </div>
  );
}
