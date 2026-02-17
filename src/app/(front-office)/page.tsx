"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WhatsAppFloat } from "@/components/front-office/ui/WhatsAppFloat";
import { Sidebar } from "@/components/front-office/ui/Sidebar";
import { EmailVerification } from "@/components/front-office/ui/EmailVerification";
import { ReturningUserLogin } from "@/components/front-office/ui/ReturningUserLogin";
import { ProfileForm } from "@/components/front-office/ui/ProfileForm";
import { EventSelection } from "@/components/front-office/ui/EventSelection";
import { EventRegistration } from "@/components/front-office/ui/EventRegistration";
import { getHostelUnoccupiedCapacity } from "@/lib/api/accommodations";
import { AccommodationSelection } from "@/components/front-office/ui/AccommodationSelection";
import { Payment } from "@/components/front-office/ui/Payment";
import { getAuthToken } from "@/lib/api/client";
import { createUserRegistration } from "@/lib/api";
import { setActiveEventCookie } from "@/lib/auth/session";

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
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("verify");

  useEffect(() => {
    const v = searchParams.get("view");
    const e = searchParams.get("email");
    if (e) setEmail(e);
    if (
      v === "verify" ||
      v === "login" ||
      v === "profile" ||
      v === "event-selection" ||
      v === "event-registration" ||
      v === "accommodation" ||
      v === "payment"
    ) {
      setView(v);
    }
  }, [searchParams]);

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

    const viewParam = searchParams.get("view");
    if (
      viewParam === "verify" ||
      viewParam === "login" ||
      viewParam === "profile" ||
      viewParam === "event-selection" ||
      viewParam === "event-registration" ||
      viewParam === "accommodation" ||
      viewParam === "payment"
    ) {
      return;
    }

    const saved = safeLoadFlowState();
    if (!saved) return;

    if (saved.view === "dashboard") {
      const eventId = saved.activeEventId || saved.selectedEvent?.eventId || selectedEvent?.eventId;
      if (eventId) setActiveEventCookie(eventId);
      else if (selectedEvent?.eventId) setActiveEventCookie(selectedEvent.eventId);
      router.push("/dashboard");
      return;
    }

    setEmail(saved.email || "");
    setProfile(saved.profile ?? null);
    setRegistration(saved.registration ?? null);
    setAccommodation(saved.accommodation ?? null);

    const nextView: View = saved.view || "verify";
    if (nextView !== "verify") setView(nextView);
  }, [router, selectedEvent?.eventId, searchParams]);

  useEffect(() => {
    async function fetchHostelAvailability() {
      try {
        if (!selectedEvent?.eventId) return;

        const left = await getHostelUnoccupiedCapacity();
        if (typeof left === "number") {
          setHostelSpacesLeft(left);
        }
      } catch (err) {
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
  console.log("current view, ", view);

  return (
    <div className="flex flex-col lg:flex-row min-h-svh lg:h-screen w-full">
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
            initialEmail={email}
            onLoginSuccess={(userEmail) => {
              const nextEmail = (userEmail || email).trim();
              if (nextEmail) setEmail(nextEmail);

              // Best-effort: hydrate profile from stored user details (set during OTP verification)
              let nextProfile = profile;
              if (!nextProfile) {
                try {
                  const raw = localStorage.getItem("smflx_user");
                  const stored = raw ? JSON.parse(raw) : null;
                  nextProfile = stored?.userDetails || stored || null;
                } catch {
                  nextProfile = profile;
                }
              }
              if (nextProfile !== profile) setProfile(nextProfile);

              safeSaveFlowState({
                view: "dashboard",
                email: nextEmail || email,
                profile: nextProfile ?? profile,
                selectedEvent,
                registration,
                accommodation,
              });

              if (selectedEvent?.eventId)
                setActiveEventCookie(selectedEvent.eventId);
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
              if (eventId) setActiveEventCookie(eventId);
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
              if (process.env.NODE_ENV !== "production") {
                console.log("Event registration data:", data);
              }
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
                if (selectedEvent?.eventId)
                  setActiveEventCookie(selectedEvent.eventId);
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
              safeSaveFlowState({
                view: "dashboard",
                email,
                profile,
                selectedEvent,
                registration,
                accommodation: data,
              });

              if (selectedEvent?.eventId) setActiveEventCookie(selectedEvent.eventId);
              router.push("/dashboard");
            }}

          />
        )}

        {view === "payment" && (
          <Payment
            amount={paymentAmount}
            eventId={selectedEvent?.eventId}
            userId={registration?.userId}
            registrationId={registration?.registrationId}
            email={email}
            profile={profile}
            registration={registration}
            accommodation={accommodation}
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
              if (selectedEvent?.eventId)
                setActiveEventCookie(selectedEvent.eventId);
              router.push("/dashboard");
            }}
          />
        )}
      </div>
      <WhatsAppFloat />
    </div>
  );
}
