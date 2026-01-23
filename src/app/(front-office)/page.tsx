"use client";

import { useMemo, useState } from "react";

import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { EventRegistration } from "@/components/front-office/ui/EventRegistration";
import { AccommodationSelection } from "@/components/front-office/ui/AccommodationSelection";
import { Payment } from "@/components/front-office/ui/Payment";
import { Dashboard } from "@/components/front-office/ui/Dashboard";

type View =
  | "verify"
  | "login"
  | "profile"
  | "event-selection"
  | "event-registration"
  | "accommodation"
  | "payment"
  | "dashboard";

export default function HomePage() {
  const [view, setView] = useState<View>("verify");

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    eventName: string;
  } | null>(null);

  const [registration, setRegistration] = useState<any>(null);
  const [accommodation, setAccommodation] = useState<any>(null);

  // ✅ Only campers pay (from accommodation selection price)
  const paymentAmount = useMemo(() => {
    if (accommodation?.price) return accommodation.price;
    return 0;
  }, [accommodation]);

  const steps = useMemo(() => {
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
        description: "Tell us about you",
        completed: view !== "verify" && view !== "login" && view !== "profile",
      },
      {
        id: 3,
        title: "Select Event",
        description: "Choose your event",
        completed:
          view === "event-registration" ||
          view === "accommodation" ||
          view === "payment" ||
          view === "dashboard",
      },
      {
        id: 4,
        title: "Register",
        description: "Attendance & preferences",
        completed:
          view === "accommodation" || view === "payment" || view === "dashboard",
      },
      {
        id: 5,
        title: "Accommodation",
        description: "Pick where you'll stay",
        completed: view === "payment" || view === "dashboard",
      },
      {
        id: 6,
        title: "Payment",
        description: "Complete registration",
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
      case "event-registration":
        return 4;
      case "accommodation":
        return 5;
      case "payment":
      case "dashboard":
        return 6;
      default:
        return 1;
    }
  }, [view]);

  // ✅ Sidebar visible until dashboard only
  const showSidebar = view !== "dashboard";

  return (
    <div className="flex h-screen w-full">
      {showSidebar && (
        <Sidebar
          currentStep={currentStep}
          steps={steps}
          onAlreadyRegistered={() => setView("login")}
        />
      )}

      {/* ✅ keep flex-col to preserve vertical centering of verification/login pages */}
      <div className="flex-1 h-full flex flex-col overflow-y-auto bg-white">
        {view === "verify" && (
          <EmailVerification
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              setView("profile"); // ✅ verify -> profile
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

        {view === "profile" && (
          <ProfileForm
            initialData={profile}
            onBack={() => setView("verify")}
            onComplete={(data) => {
              setProfile(data);
              setView("event-selection");
            }}
          />
        )}

        {view === "event-selection" && (
          <EventSelection
            userProfile={profile}
            selectedEventId={selectedEvent?.eventId}
            onBack={() => setView("profile")}
            onSelectEvent={(eventId, eventName) => {
              setSelectedEvent({ eventId, eventName });
              setView("event-registration");
            }}
          />
        )}

        {view === "event-registration" && (
          <EventRegistration
            initialData={registration}
            onBack={() => setView("event-selection")}
            onComplete={(data) => {
              const next = {
                ...data,
                eventId: selectedEvent?.eventId,
                eventName: selectedEvent?.eventName,
                email,
              };

              setRegistration(next);

              // ✅ Camper: accommodation -> payment -> dashboard
              if (next.attendeeType === "camper") {
                setView("accommodation");
                return;
              }

              // ✅ Physical/Online: straight to dashboard (NO payment)
              setView("dashboard");
            }}
          />
        )}

        {view === "accommodation" && (
          <AccommodationSelection
            accommodationType={registration?.accommodationType || "hostel"}
            initialData={accommodation}
            onBack={() => setView("event-registration")}
            onComplete={(data) => {
              setAccommodation(data);
              setView("payment");
            }}
          />
        )}

        {view === "payment" && (
          <Payment
            amount={paymentAmount}
            onBack={() => setView("accommodation")}
            onComplete={() => setView("dashboard")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            userEmail={email}
            profile={profile}
            registration={registration}
            accommodation={accommodation}
            onLogout={() => {
              setEmail("");
              setProfile(null);
              setSelectedEvent(null);
              setRegistration(null);
              setAccommodation(null);
              setView("verify");
            }}
            onAccommodationUpdate={(data) => setAccommodation(data)}
            onRegistrationUpdate={(data) => setRegistration(data)}
            onProfileUpdate={(data) => setProfile(data)}
          />
        )}
      </div>
    </div>
  );
}
