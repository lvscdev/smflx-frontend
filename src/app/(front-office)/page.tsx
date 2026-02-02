"use client";

import { useEffect, useMemo, useState } from "react";
import { WhatsAppFloat } from "@/components/front-office/ui/WhatsAppFloat";
import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { EventRegistration } from "@/components/front-office/ui/EventRegistration";
import { AccommodationSelection } from "@/components/front-office/ui/AccommodationSelection";
import { Payment } from "@/components/front-office/ui/Payment";
import { Dashboard } from "@/components/front-office/ui/Dashboard";

import { getAuthToken, setAuthToken } from "@/lib/api/client";
import { createUserRegistration } from "@/lib/api";

type View =
  | "verify"
  | "login"
  | "profile"
  | "event-selection"
  | "event-registration"
  | "accommodation"
  | "payment"
  | "dashboard";

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

function safeSaveFlowState(state: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
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

export default function HomePage() {
  const [view, setView] = useState<View>("verify");

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    eventName: string;
  } | null>(null);

  const [registration, setRegistration] = useState<any>(null);
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [registrationPersistError, setRegistrationPersistError] = useState<string | null>(null);
  const [accommodation, setAccommodation] = useState<any>(null);

  // ✅ Rehydrate session + resume flow if user already verified once (token exists)
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const saved = safeLoadFlowState();

    if (saved) {
      // restore data
      setEmail(saved.email || "");
      setProfile(saved.profile ?? null);
      setSelectedEvent(saved.selectedEvent ?? null);
      setRegistration(saved.registration ?? null);
      setAccommodation(saved.accommodation ?? null);

      // restore view (fallback to dashboard)
      const nextView: View = saved.view || "dashboard";
      setView(nextView);
      return;
    }

    // token exists but no saved flow state => go to dashboard by default
    setView("dashboard");
  }, []);

  // ✅ Save progress (only after auth screens)
  useEffect(() => {
    if (view === "verify" || view === "login") return;

    safeSaveFlowState({
      view,
      email,
      profile,
      selectedEvent,
      registration,
      accommodation,
    });
  }, [view, email, profile, selectedEvent, registration, accommodation]);

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
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {showSidebar && (
        <Sidebar
          currentStep={currentStep}
          steps={steps}
          onAlreadyRegistered={() => setView("login")}
        />
      )}

      {/* ✅ keep flex-col to preserve vertical centering of verification/login pages */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-white">
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
            onLoginSuccess={(userEmail) => {
              if (userEmail) setEmail(userEmail);
              setView("dashboard");
            }}
            onCancel={() => setView("verify")}
          />
        )}

        {view === "profile" && (
          <ProfileForm
            email={email}
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
            isSubmitting={registrationSubmitting}
            serverError={registrationPersistError}
            onComplete={async (data) => {
              setRegistrationPersistError(null);
              setRegistrationSubmitting(true);

              try {
                if (!selectedEvent?.eventId) {
                  throw new Error("No event selected. Please go back and select an event.");
                }

                const participationMode =
                  data.attendeeType === "camper"
                    ? "CAMPER"
                    : data.attendeeType === "online"
                    ? "ONLINE"
                    : "ATTENDEE";

                const accommodationType =
                  participationMode === "CAMPER"
                    ? data.accommodationType === "hostel"
                      ? "HOSTEL"
                      : data.accommodationType === "hotel" || data.accommodationType === "shared"
                      ? "HOTEL"
                      : "NONE"
                    : "NONE";

                const created = await createUserRegistration({
                  eventId: selectedEvent.eventId,
                  participationMode,
                  accommodationType,
                });

                const next = {
                  ...data,
                  eventId: selectedEvent.eventId,
                  eventName: selectedEvent.eventName,
                  email,
                  participationMode,
                  accommodationType,
                  registrationId: (created as any)?.registrationId,
                };

                setRegistration(next);

                if (data.attendeeType === "camper") {
                  setView("accommodation");
                  return;
                }

                setView("dashboard");
              } catch (e: any) {
                setRegistrationPersistError(
                  e?.message || "Unable to save registration. Please try again."
                );
              } finally {
                setRegistrationSubmitting(false);
              }
            }}
          />
        )}


        {view === "accommodation" && (
          <AccommodationSelection
            accommodationType={registration?.accommodationType || "hostel"}
            eventId={selectedEvent?.eventId || ""}
            registrationId={registration?.registrationId}
            initialData={accommodation}
            profile={profile}
            onBack={() => setView("event-registration")}
            onComplete={async (data) => {
              setAccommodation(data);
              if (data.isPaired) {
                setView("dashboard");
              } else {
                setView("payment");
              }
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
              setAuthToken(null);
              safeClearFlowState();

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
      <WhatsAppFloat />
    </div>
  );
}