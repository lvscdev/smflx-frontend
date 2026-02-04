"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppFloat } from "@/components/front-office/ui/WhatsAppFloat";
import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { EventRegistration } from "@/components/front-office/ui/EventRegistration";
import { AccommodationSelection } from "@/components/front-office/ui/AccommodationSelection";
import { Payment } from "@/components/front-office/ui/Payment";

import { getAuthToken, setAuthToken } from "@/lib/api/client";
import { createUserRegistration, getAccommodations } from "@/lib/api";

type View =
  | "verify"
  | "login"
  | "profile"
  | "event-selection"
  | "event-registration"
  | "accommodation"
  | "payment";

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
  const router = useRouter();
  const [view, setView] = useState<View>("verify");

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    eventName: string;
  } | null>(null);

  const [registration, setRegistration] = useState<any>(null);
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [registrationPersistError, setRegistrationPersistError] = useState<
    string | null
  >(null);
  const [accommodation, setAccommodation] = useState<any>(null);
  const [hostelSpacesLeft, setHostelSpacesLeft] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const saved = safeLoadFlowState();
    if (!saved) return;

    if (saved.view === "dashboard") {
      router.push("/dashboard");
      return;
    }

    setEmail(saved.email || "");
    setProfile(saved.profile ?? null);
    setSelectedEvent(saved.selectedEvent ?? null);
    setRegistration(saved.registration ?? null);
    setAccommodation(saved.accommodation ?? null);

    const nextView: View = saved.view || "verify";
    setView(nextView);
  }, [router]);

  // ✅ Fetch hostel availability count on mount
  useEffect(() => {
    async function fetchHostelAvailability() {
      try {
        // Fetch availability for currently active event if we have one
        const eventId = selectedEvent?.eventId;
        if (!eventId) return;

        const data = await getAccommodations({
          eventId,
          type: "HOSTEL",
        });

        // Use totalAvailable from metadata if available
        const available = data?.metadata?.totalAvailable;
        if (typeof available === "number") {
          setHostelSpacesLeft(available);
        }
      } catch (err) {
        // Silently fail - Sidebar will show "Limited" as fallback
        console.error("Failed to fetch hostel availability:", err);
      }
    }

    fetchHostelAvailability();
  }, [selectedEvent?.eventId]);

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
          view === "payment",
      },
      {
        id: 4,
        title: "Register",
        description: "Attendance & preferences",
        completed: view === "accommodation" || view === "payment",
      },
      {
        id: 5,
        title: "Accommodation",
        description: "Pick where you'll stay",
        completed: view === "payment",
      },
      {
        id: 6,
        title: "Payment",
        description: "Complete registration",
        completed: false,
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
        return 6;
      default:
        return 1;
    }
  }, [view]);

  const showSidebar = true;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {showSidebar && (
        <Sidebar
          currentStep={currentStep}
          steps={steps}
          onAlreadyRegistered={() => setView("login")}
          hostelSpacesLeft={hostelSpacesLeft}
        />
      )}

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
              router.push("/dashboard");
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
            eventId={selectedEvent?.eventId}
            initialData={registration}
            onBack={() => setView("event-selection")}
            isSubmitting={registrationSubmitting}
            serverError={registrationPersistError}
            onComplete={async (data) => {
              console.log("Event registration data:", data);
              setRegistrationPersistError(null);
              setRegistrationSubmitting(true);

              try {
                if (!selectedEvent?.eventId) {
                  throw new Error(
                    "No event selected. Please go back and select an event.",
                  );
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
                      : data.accommodationType === "hotel"
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
                  registrationId: (created as any)?.regId,
                  userId: (created as any)?.userId,
                };

                setRegistration(next);

                if (data.attendeeType === "camper") {
                  setView("accommodation");
                  return;
                }

                safeSaveFlowState({
                  view: "dashboard",
                  email,
                  profile,
                  selectedEvent,
                  registration: next,
                  accommodation,
                });
                router.push("/dashboard");
              } catch (e: any) {
                setRegistrationPersistError(
                  e?.message ||
                    "Unable to save registration. Please try again.",
                );
              } finally {
                setRegistrationSubmitting(false);
              }
            }}
          />
        )}

        {view === "accommodation" && (
          <AccommodationSelection
            categoryId={registration?.categoryId}
            accommodationType={registration?.accommodationType || "hostel"}
            eventId={selectedEvent?.eventId || ""}
            registrationId={registration?.registrationId}
            userId={registration?.userId}
            initialData={accommodation}
            profile={profile}
            onBack={() => setView("event-registration")}
            onComplete={async (data) => {
              setAccommodation(data);
            }}
          />
        )}

        {view === "payment" && (
          <Payment
            amount={paymentAmount}
            onBack={() => setView("accommodation")}
            onComplete={() => {
              safeSaveFlowState({
                view: "dashboard",
                email,
                profile,
                selectedEvent,
                registration,
                accommodation,
              });
              router.push("/dashboard");
            }}
          />
        )}
      </div>
      <WhatsAppFloat />
    </div>
  );
}
