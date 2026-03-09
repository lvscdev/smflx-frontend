import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserRegistration } from "@/lib/api";
import { setActiveEventCookie } from "@/lib/auth/session";
import { safeSaveFlowState } from "@/lib/constants/flowState";

interface RegistrationData {
  attendeeType: string;
  accommodationType?: string;
  categoryId?: string;
  [key: string]: any;
}

interface SelectedEvent {
  eventId: string;
  eventName: string;
}

interface UseRegistrationSubmitOptions {
  email: string;
  profile: any;
  selectedEvent: SelectedEvent | null;
  accommodation: any;
  onSuccess: (next: any) => void;
  onCamper: (next: any) => void;
}

interface UseRegistrationSubmitResult {
  registrationSubmitting: boolean;
  registrationPersistError: string | null;
  setRegistrationPersistError: (err: string | null) => void;
  handleRegistrationComplete: (data: RegistrationData) => Promise<void>;
}

export function useRegistrationSubmit({
  email,
  profile,
  selectedEvent,
  accommodation,
  onSuccess,
  onCamper,
}: UseRegistrationSubmitOptions): UseRegistrationSubmitResult {
  const router = useRouter();
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [registrationPersistError, setRegistrationPersistError] = useState<
    string | null
  >(null);

  const handleRegistrationComplete = async (data: RegistrationData) => {
    setRegistrationPersistError(null);
    setRegistrationSubmitting(true);

    try {
      if (!selectedEvent?.eventId) {
        throw new Error(
          "No event selected. Please go back and select an event."
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

      if (data.attendeeType === "camper") {
        onCamper(next);
        return;
      }

      safeSaveFlowState({
        view: "dashboard",
        email,
        profile,
        selectedEvent,
        activeEventId: selectedEvent?.eventId ?? null,
        registration: next,
        accommodation,
      });
      if (selectedEvent?.eventId) setActiveEventCookie(selectedEvent.eventId);
      onSuccess(next);
      router.push("/dashboard");
    } catch (e: any) {
      setRegistrationPersistError(
        e?.message ?? "Unable to save registration. Please try again."
      );
    } finally {
      setRegistrationSubmitting(false);
    }
  };

  return {
    registrationSubmitting,
    registrationPersistError,
    setRegistrationPersistError,
    handleRegistrationComplete,
  };
}