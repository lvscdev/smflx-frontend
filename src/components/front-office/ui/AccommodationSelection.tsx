"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserProfile } from "@/lib/api/dashboardTypes";
import { ArrowLeft, Check, AlertCircle, Loader2, MapPin } from "lucide-react";
import { ImageWithFallback } from "@/components/front-office/figma/ImageWithFallback";
import { initiateHostelAllocation, initiateHotelAllocation } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import {
  getAccommodationCategoryFacilities,
  getHotelRooms,
} from "@/lib/api/accommodation";
import { Facility, HotelRoom } from "@/lib/api/accommodation/types";


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

function safeSaveFlowState(state: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
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
  initialData?: AccommodationData | null;
  profile?: UserProfile | null;
  isSubmitting?: boolean;
  serverError?: string | null;
  categoryId: string;
}

export function AccommodationSelection({
  accommodationType,
  eventId,
  registrationId,
  userId,
  onComplete,
  onBack,
  initialData,
  profile,
  categoryId,
  isSubmitting: externalSubmitting,
  serverError: externalError,
}: AccommodationSelectionProps) {
  if (process.env.NODE_ENV !== "production") {
    console.log("userId", userId);
    console.log("registrationId", registrationId);
    console.log("eventId", eventId);
    console.log("profile", profile);
  }

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const isHostel = accommodationType.toLowerCase() === "hostel";
  const isHotel = accommodationType.toLowerCase() === "hotel";

  const isSelectionComplete = isHostel
    ? !!selectedFacility
    : !!(selectedFacility && selectedRoom);

  const getDisplayPrice = (): number => {
    if (isHostel && selectedFacility) {
      return selectedFacility.employedUserPrice || 0;
    }
    if (isHotel && selectedRoom) {
      return selectedRoom.price || 0;
    }
    return 0;
  };

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAccommodationCategoryFacilities({
        categoryId,
        regId: registrationId,
      });

      setFacilities(response);

      if (!response || response.length === 0) {
        setError("No accommodations available for this event at the moment.");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load accommodations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      loadAccommodations();
    }
  }, [categoryId, registrationId]);

  const loadHotelRooms = async (facilityId: string) => {
    try {
      setLoadingRooms(true);
      setRoomsError(null);

      const rooms = await getHotelRooms({ facilityId });
      setHotelRooms(rooms);

      if (!rooms || rooms.length === 0) {
        setRoomsError("No rooms available for this hotel.");
      }
    } catch (err) {
      setRoomsError(
        err instanceof ApiError
          ? err.message
          : "Failed to load hotel rooms. Please try again.",
      );
      setHotelRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setSelectedRoom(null);
    setRoomsError(null);

    if (isHotel) {
      loadHotelRooms(facility.facilityId);
    }
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
      const resolvedRegId = registrationId || "";
      
      if (!resolvedRegId || !resolvedUserId || !eventId || !selectedFacility?.facilityId) {
          setError("Missing booking details. Please refresh and try again.");
          setSubmitting(false);
          return;
        }

      let response;

    if (isHostel) {
      const facilityIdResolved =
        (selectedFacility as any)?.facilityId ||
        (selectedFacility as any)?.facilityid ||
        (selectedFacility as any)?.id ||
        (selectedFacility as any)?._id ||
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
      } else {
        response = await initiateHotelAllocation({
          registrationId: resolvedRegId,
          eventId: eventId,
          userId: resolvedUserId,
          facilityId: selectedFacility?.facilityId || "",
          roomTypeId: selectedRoom?.roomTypeId || "",
        });
      }

      if (response?.checkoutUrl) {
        // Mark pending accommodation payment so dashboard can auto-refresh/poll after return.
        try {
          localStorage.setItem("smflx_pending_accommodation_payment", "1");
          // Track when the 1-hour hold started so dashboard can show a countdown and auto-expire UI.
          localStorage.setItem(
            "smflx_pending_accommodation_payment_started_at",
            String(Date.now()),
          );
        } catch {
          // ignore
        }

        // Persist a minimal accommodation snapshot in flow state so UI shows type immediately.
        try {
          const saved = safeLoadFlowState() || {};
          const snapshot = {
            ...(saved.accommodation || {}),
            requiresAccommodation: true,
            paidForAccommodation: false,
            accommodationType: accommodationType,
            facility: selectedFacility?.facilityName || selectedFacility?.facilityId || "",
            // Hotel rooms use `roomType` (not `roomTypeName`). Hostels don't select rooms/bedspaces in this UI.
            room: selectedRoom?.roomType || selectedRoom?.roomTypeId || "",
          };
          safeSaveFlowState({ ...saved, accommodation: snapshot });
        } catch {
          // ignore
        }

        window.location.href = response.checkoutUrl;
        return;
      }

      const accommodationData: AccommodationData = {
        type: accommodationType,
        facilityId: selectedFacility?.facilityId,
        facilityName: selectedFacility?.facilityName,
        price: getDisplayPrice(),
      };

      await onComplete(accommodationData);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `${err.message}: ${err?.details?.data}`
          : "Failed to book accommodation. Please try again.",
      );
      setSubmitting(false);
    }
  };

  // Render loading state
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

  if (error && facilities.length === 0) {
    return (
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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

  const isProcessing = submitting || externalSubmitting;

  const getSpacesLeft = (totalCapacity: number, capacityOccupied: number) =>
    totalCapacity - capacityOccupied;

  const renderHostelAccommodation = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
            1
          </div>
          <h2 className="text-xl font-semibold">Select Facility</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities &&
            facilities.length > 0 &&
            facilities.map((facility) => (
              <button
                key={facility.facilityId}
                type="button"
                onClick={() => handleSelectFacility(facility)}
                disabled={facility?.capacityOccupied >= facility?.totalCapacity}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedFacility?.facilityId === facility.facilityId
                    ? "border-gray-900 bg-gray-50 shadow-md"
                    : facility?.capacityOccupied >= facility?.totalCapacity
                      ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                {selectedFacility?.facilityId === facility.facilityId && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-gray-100">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
                    alt={facility.facilityName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">
                  {facility.facilityName}
                </h3>

                {facility.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {facility.location}
                  </div>
                )}

                {facility.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {facility.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      facility?.capacityOccupied < facility?.totalCapacity
                        ? "default"
                        : "secondary"
                    }
                  >
                    {facility?.capacityOccupied < facility?.totalCapacity
                      ? `${getSpacesLeft(facility?.totalCapacity, facility?.capacityOccupied)} spaces left`
                      : "Fully booked"}
                  </Badge>
                </div>
              </button>
            ))}
        </div>
      </div>
    );
  };

  const renderHotelAccommodation = () => {
    return (
      <div className="space-y-8">
        {/* Step 1: Select Hotel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Select Hotel</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Hotel *
            </label>
            <select
              value={selectedFacility?.facilityId || ""}
              onChange={(e) => {
                const facility = facilities.find(
                  (f) => f.facilityId === e.target.value,
                );
                if (facility) {
                  handleSelectFacility(facility);
                }
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
            >
              <option value="">Choose a hotel</option>
              {facilities.map((facility) => (
                <option
                  key={facility.facilityId}
                  value={facility.facilityId}
                  disabled={
                    facility?.capacityOccupied >= facility?.totalCapacity
                  }
                >
                  {facility.facilityName}
                  {facility.location ? ` - ${facility.location}` : ""}
                  {facility?.capacityOccupied >= facility?.totalCapacity
                    ? " (Fully Booked)"
                    : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Select Room Type - Only show when hotel is selected */}
        {selectedFacility && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Select Room Type</h2>
            </div>

            {loadingRooms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border-2 border-gray-200 bg-white animate-pulse"
                  >
                    <div className="aspect-video w-full bg-gray-200 rounded-xl mb-3" />
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-3" />
                    <div className="h-6 w-1/3 bg-gray-200 rounded mb-2" />
                    <div className="h-6 w-20 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : roomsError ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
                {roomsError}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotelRooms &&
                    hotelRooms.length > 0 &&
                    hotelRooms.map((room, index) => {
                      const roomsLeft = getSpacesLeft(
                        room?.noOfRoomsAvailable,
                        room?.noOfRoomsOccupied,
                      );
                      const isFullyBooked = roomsLeft <= 0;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!isFullyBooked) {
                              setSelectedRoom(room);
                            }
                          }}
                          disabled={isFullyBooked}
                          className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                            selectedRoom?.roomTypeId === room.roomTypeId
                              ? "border-gray-900 bg-gray-50 shadow-md"
                              : isFullyBooked
                                ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                                : "border-gray-200 bg-white hover:border-gray-400"
                          }`}
                        >
                          {selectedRoom?.roomTypeId === room.roomTypeId && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center z-10">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-gray-100">
                            <ImageWithFallback
                              src={
                                "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80"
                              }
                              alt={room.roomType}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1">
                            {room.roomType}
                          </h3>

                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <MapPin className="w-3 h-3" />
                            {room.address}
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <div className="text-lg font-bold text-gray-900">
                              ₦{room.price?.toLocaleString("en-NG")}
                            </div>
                          </div>

                          <Badge
                            variant={!isFullyBooked ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {!isFullyBooked
                              ? `${roomsLeft} Room${roomsLeft !== 1 ? "s" : ""} Left`
                              : "Fully Booked"}
                          </Badge>
                        </button>
                      );
                    })}
                </div>

                {(!hotelRooms || hotelRooms.length === 0) && !roomsError && (
                  <div className="text-center py-8 text-gray-500">
                    No rooms available for this hotel
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto px-4 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">
            Select {isHostel ? "Hostel" : "Hotel"} Accommodation
          </h1>
          <p className="text-gray-600 text-sm">
            Choose your accommodation for the event
          </p>
        </div>

        {(error || externalError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || externalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {isHostel ? renderHostelAccommodation() : renderHotelAccommodation()}

          <div className="flex gap-4 sticky bottom-0 bg-white pt-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              disabled={!isSelectionComplete || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                `Pay`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

