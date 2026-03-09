"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserProfile } from "@/lib/api/dashboardTypes";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { initiateHostelAllocation } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { Facility, HotelRoom } from "@/lib/api/accommodation/types";
import { safeLoadFlowState, safeSaveFlowState } from "@/lib/constants/flowState";
import { useAccommodationLoader } from "@/hooks/useAccommodationLoader";
import { HostelFacilityGrid } from "./HostelFacilityGrid";
import { HotelRoomGrid } from "./HotelRoomGrid";
import { HotelContactModal } from "./HotelContactModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccommodationData {
  type: string;
  facilityId?: string;
  facilityName?: string;
  roomId?: string;
  roomNumber?: string;
  bedSpaceId?: string;
  bedNumber?: string;
  price?: number;
  bookingId?: string;
  isPaired?: boolean;
}

interface AccommodationSelectionProps {
  accommodationType: string;
  eventId: string;
  registrationId?: string;
  userId?: string;
  onComplete: (data: AccommodationData) => Promise<void> | void;
  onBack: () => void;
  onClose?: () => void;
  initialData?: AccommodationData | null;
  profile?: UserProfile | null;
  isSubmitting?: boolean;
  serverError?: string | null;
  categoryId: string;
  attendTeensEvent?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AccommodationSelection({
  accommodationType,
  eventId,
  registrationId,
  userId,
  onComplete,
  onBack,
  initialData: _initialData,
  profile,
  categoryId,
  isSubmitting: externalSubmitting,
  serverError: externalError,
  attendTeensEvent = false,
  onClose,
}: AccommodationSelectionProps) {
  if (process.env.NODE_ENV !== "production") {
    console.log("userId", userId);
    console.log("registrationId", registrationId);
    console.log("eventId", eventId);
    console.log("profile", profile);
  }

  const isHostel = accommodationType.toLowerCase() === "hostel";
  const isHotel  = accommodationType.toLowerCase() === "hotel";

  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [selectedRoom,     setSelectedRoom]     = useState<HotelRoom | null>(null);
  const [submitting,       setSubmitting]       = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [showHotelContactModal, setShowHotelContactModal] = useState(false);

  const {
    facilities,
    hotelRooms,
    loading,
    loadingRooms,
    error: loadError,
    roomsError,
    loadHotelRooms,
  } = useAccommodationLoader({ categoryId, accommodationType, profile, attendTeensEvent });

  // ─── Derived ───────────────────────────────────────────────────────────────

  const isSelectionComplete = isHostel
    ? !!selectedFacility
    : !!(selectedFacility && selectedRoom);

  const getDisplayPrice = (): number => {
    if (isHostel && selectedFacility) return selectedFacility.employedUserPrice || 0;
    if (isHotel  && selectedRoom)     return selectedRoom.price || 0;
    return 0;
  };

  const isProcessing = submitting || externalSubmitting;
  const displayError = error || loadError;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setSelectedRoom(null);
    if (isHotel) loadHotelRooms(facility.facilityId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectionComplete) {
      setError("Please complete your accommodation selection.");
      return;
    }
    await processBooking();
  };

  const processBooking = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const resolvedUserId = userId || profile?.userId || "";
      const resolvedRegId  = registrationId || "";

      if (!resolvedRegId || !resolvedUserId || !eventId || !selectedFacility?.facilityId) {
        setError("Missing booking details. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      let response;

      if (isHotel) {
        // Hotel payments are handled offline — show contact modal instead of Korapay.
        setSubmitting(false);
        setShowHotelContactModal(true);
        return;
      }

      if (isHostel) {
        const facilityIdResolved =
          (selectedFacility as any)?.facilityId  ||
          (selectedFacility as any)?.facilityid  ||
          (selectedFacility as any)?.id          ||
          (selectedFacility as any)?._id         ||
          "";

        if (!facilityIdResolved) {
          setError("Please select a hostel facility before continuing.");
          setSubmitting(false);
          return;
        }

        response = await initiateHostelAllocation({
          registrationId: resolvedRegId,
          eventId,
          userId: resolvedUserId,
          facilityid: facilityIdResolved,
        });
      }

      if (response?.checkoutUrl) {
        // Mark pending accommodation payment so dashboard can auto-refresh/poll after return.
        try {
          localStorage.setItem("smflx_pending_accommodation_payment", "1");
          localStorage.setItem(
            "smflx_pending_accommodation_payment_started_at",
            String(Date.now()),
          );
        } catch {}

        // Persist a minimal accommodation snapshot in flow state so UI shows type immediately.
        try {
          const saved = safeLoadFlowState() || {};
          const snapshot = {
            ...(saved.accommodation || {}),
            requiresAccommodation:  true,
            paidForAccommodation:   false,
            accommodationType,
            facilityId:   (selectedFacility as any)?.facilityId   || "",
            facilityName: (selectedFacility as any)?.facilityName  || "",
            roomTypeId:   (selectedRoom as any)?.roomTypeId        || "",
            roomTypeName: (selectedRoom as any)?.roomType          || "",
            facility:     (selectedFacility as any)?.facilityName  || (selectedFacility as any)?.facilityId || "",
            room:         (selectedRoom as any)?.roomType          || (selectedRoom as any)?.roomTypeId     || "",
          };
          safeSaveFlowState({ ...saved, accommodation: snapshot });
        } catch {}

        window.location.href = response.checkoutUrl;
        return;
      }

      const accommodationData: AccommodationData = {
        type: accommodationType,
        facilityId:   selectedFacility?.facilityId,
        facilityName: selectedFacility?.facilityName,
        price:        getDisplayPrice(),
      };

      await onComplete(accommodationData);
    } catch (err) {
      const raw = err instanceof ApiError ? String(err.message || "") : "";

      if      (/secured accommodation/i.test(raw))                setError("You already have accommodation secured for this event.");
      else if (/bad request/i.test(raw) && /accommodation/i.test(raw)) setError("We couldn't complete your accommodation request. Please try again.");
      else    setError(err instanceof ApiError ? err.message : "Failed to book accommodation. Please try again.");

      setSubmitting(false);
    }
  };

  // ─── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading accommodations...</p>
        </div>
      </div>
    );
  }

  if (loadError && facilities.length === 0) {
    return (
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-auto px-4 lg:px-8 py-8">
      <HotelContactModal
        isOpen={showHotelContactModal}
        onClose={() => { setShowHotelContactModal(false); (onClose ?? onBack)(); }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">
            Select {isHostel ? "Hostel" : "Hotel"} Accommodation
          </h1>
          <p className="text-gray-600 text-sm">
            Choose your accommodation for the event
          </p>
        </div>

        {(displayError || externalError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError || externalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {isHostel ? (
            <HostelFacilityGrid
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={handleSelectFacility}
            />
          ) : (
            <HotelRoomGrid
              facilities={facilities}
              hotelRooms={hotelRooms}
              loadingRooms={loadingRooms}
              roomsError={roomsError}
              selectedFacility={selectedFacility}
              selectedRoom={selectedRoom}
              onSelectFacility={handleSelectFacility}
              onSelectRoom={setSelectedRoom}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 sticky bottom-0 bg-white pt-4 pb-4 md:pb-[calc(env(safe-area-inset-bottom)+0.5rem)] border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              disabled={!isSelectionComplete || isProcessing}
              className="w-full sm:flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                "Pay"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}