"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bed, Users, ArrowLeft, Check, AlertCircle, Loader2, MapPin } from "lucide-react";
import { ImageWithFallback } from "@/components/front-office/figma/ImageWithFallback";
import { PairingCodeModal } from "@/components/front-office/ui/PairingCodeModal";
import { getAccommodations, bookAccommodation, initiateHostelAllocation, initiateHotelAllocation } from "@/lib/api";
import type { Facility, Room, BedSpace } from "@/lib/api";
import { ApiError } from "@/lib/api/client";

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
  profile?: any;
  isSubmitting?: boolean;
  serverError?: string | null;
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
  isSubmitting: externalSubmitting,
  serverError: externalError
}: AccommodationSelectionProps) {
  // State
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    initialData?.facilityId || null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialData?.roomId || null
  );
  const [selectedBedSpaceId, setSelectedBedSpaceId] = useState<string | null>(
    initialData?.bedSpaceId || null
  );
  
  const [showPairingModal, setShowPairingModal] = useState(false);

  // Ref placed on Step 2 (bed/room grid) so we can scroll into view after a conflict refresh
  const selectionRef = useRef<HTMLDivElement | null>(null);

  // Derived state
  const selectedFacility = facilities.find(f => f.facilityId === selectedFacilityId);
  const selectedRoom = selectedFacility?.rooms.find(r => r.roomId === selectedRoomId);
  const selectedBedSpace = selectedRoom?.bedSpaces.find(b => b.bedSpaceId === selectedBedSpaceId);
  
  const isHostel = accommodationType.toLowerCase() === 'hostel';
  const isHotel = accommodationType.toLowerCase() === 'hotel';
  
  // For hostel, we need facility and bed space
  // For hotel, we need facility and room (no individual bed selection)
  const isSelectionComplete = isHostel 
    ? !!(selectedFacilityId && selectedBedSpaceId)
    : !!(selectedFacilityId && selectedRoomId);

  // ---------------------------------------------------------------------------
  // Fetch / refresh availability
  // ---------------------------------------------------------------------------
  const loadAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAccommodations({
        eventId,
        type: accommodationType.toUpperCase() as 'HOSTEL' | 'HOTEL'
      });
      
      setFacilities(response.facilities || []);
      
      if (!response.facilities || response.facilities.length === 0) {
        setError('No accommodations available for this event at the moment.');
      }
    } catch (err) {
      console.error('Failed to load accommodations:', err);
      setError(
        err instanceof ApiError 
          ? err.message 
          : 'Failed to load accommodations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, accommodationType]);

  // Fetch accommodations on mount (or when eventId / type changes)
  useEffect(() => {
    if (eventId) {
      loadAccommodations();
    }
  }, [eventId, loadAccommodations]);

  // Handle facility selection
  const handleSelectFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setSelectedRoomId(null);
    setSelectedBedSpaceId(null);
    setError(null);
  };

  // Handle room selection
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedBedSpaceId(null);
    setError(null);
  };

  // Handle bed space selection
  const handleSelectBedSpace = (bedSpaceId: string) => {
    setSelectedBedSpaceId(bedSpaceId);
    setError(null);
  };

  // Calculate price
  const calculatePrice = (): number => {
    if (isHostel && selectedBedSpace) {
      return selectedBedSpace.price;
    }
    if (isHotel && selectedRoom) {
      // Hotel price might be on the room or first bed space
      return selectedRoom.bedSpaces[0]?.price || 0;
    }
    return 0;
  };

  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSelectionComplete) {
      setError('Please complete your accommodation selection.');
      return;
    }

    // Check for pairing modal (married users selecting hotel)
    if (isHotel && profile?.maritalStatus === 'MARRIED') {
      setShowPairingModal(true);
      return;
    }

    await processBooking();
  };

  // ---------------------------------------------------------------------------
  // Conflict detection helper — returns true when the error looks like a
  // "someone else grabbed that bed/room" conflict (409 or common message patterns)
  // ---------------------------------------------------------------------------
  const isConflictError = (err: unknown): boolean => {
    if (err instanceof ApiError) {
      if (err.status === 409) return true;
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already booked') || msg.includes('not available') || msg.includes('already taken')) return true;
    }
    return false;
  };

  // Process the actual booking  →  allocate  →  hand off to Payment
  const processBooking = async (isPaired: boolean = false) => {
    try {
      setSubmitting(true);
      setError(null);

      // ---------------------------------------------------------------
      // 1. Book the accommodation (reserves the bed / room server-side)
      // ---------------------------------------------------------------
      const payload = {
        eventId,
        accommodationType: accommodationType.toUpperCase() as 'HOSTEL' | 'HOTEL',
        facilityId: selectedFacilityId!,
        roomId: selectedRoomId || undefined,
        bedSpaceId: selectedBedSpaceId || undefined,
        priceCategory: profile?.employmentStatus === 'STUDENT' 
          ? 'UNEMPLOYED_STUDENT' as const
          : 'EMPLOYED' as const,
      };

      let booking: Awaited<ReturnType<typeof bookAccommodation>>;
      try {
        booking = await bookAccommodation(payload);
      } catch (bookErr) {
        // ---------------------------------------------------------------
        // Conflict path: another user grabbed the same bed/room between
        // when we fetched availability and when we tried to book.
        // Re-fetch live state, clear stale selection, scroll to grid.
        // ---------------------------------------------------------------
        if (isConflictError(bookErr)) {
          setError('That space was just taken. Here is the updated availability — please pick again.');
          setSelectedBedSpaceId(null);
          setSelectedRoomId(null);
          // Re-fetch live availability (sets loading → false when done)
          await loadAccommodations();
          // Once state settles, scroll the selection grid into view
          setTimeout(() => {
            selectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
          return; // abort this booking attempt; user will retry
        }
        throw bookErr; // non-conflict errors fall through to the outer catch
      }

      // ---------------------------------------------------------------
      // 2. Allocate — wire the correct endpoint based on type
      //    Hostel: { registrationId, eventId, userId, facilityId }
      //    Hotel:  { registrationId, roomTypeId, eventId, userId, facilityId }
      // ---------------------------------------------------------------
      const resolvedUserId = userId || profile?.userId || '';
      const resolvedRegId  = registrationId || '';

      if (isHostel) {
        await initiateHostelAllocation({
          registrationId: resolvedRegId,
          eventId,
          userId: resolvedUserId,
          facilityId: selectedFacilityId!,
        });
      } else if (isHotel) {
        // roomTypeId comes from the room object the user selected
        const roomTypeId = selectedRoom?.roomType || selectedRoom?.roomId || '';
        await initiateHotelAllocation({
          registrationId: resolvedRegId,
          roomTypeId,
          eventId,
          userId: resolvedUserId,
          facilityId: selectedFacilityId!,
        });
      }

      // ---------------------------------------------------------------
      // 3. Hand off to parent (→ Payment or Dashboard if paired)
      // ---------------------------------------------------------------
      const accommodationData: AccommodationData = {
        type: accommodationType,
        facilityId: selectedFacilityId!,
        facilityName: selectedFacility?.name || booking.facilityName,
        roomId: selectedRoomId || booking.roomId,
        roomNumber: selectedRoom?.roomNumber || booking.roomNumber,
        bedSpaceId: selectedBedSpaceId || booking.bedSpaceId,
        bedNumber: selectedBedSpace?.bedNumber || booking.bedNumber,
        price: booking.price,
        bookingId: booking.bookingId,
        isPaired,
      };

      await onComplete(accommodationData);
      
    } catch (err) {
      console.error('Booking failed:', err);
      setError(
        err instanceof ApiError 
          ? err.message 
          : 'Failed to book accommodation. Please try again.'
      );
      setSubmitting(false);
    }
  };

  // Pairing modal handlers
  const handleProceedToPayment = () => {
    setShowPairingModal(false);
    processBooking(false);
  };

  const handleCodeVerified = () => {
    setShowPairingModal(false);
    processBooking(true);
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

  // Render error state with retry
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
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const price = calculatePrice();
  const isProcessing = submitting || externalSubmitting;

  return (
    <div className="flex-1 overflow-auto px-4 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">
            Select {isHostel ? 'Hostel' : 'Hotel'} Accommodation
          </h1>
          <p className="text-gray-600 text-sm">
            Choose your accommodation for the event
          </p>
        </div>

        {/* Error Messages */}
        {(error || externalError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || externalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Select Facility */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <h2 className="text-xl font-semibold">Select Facility</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((facility) => (
                <button
                  key={facility.facilityId}
                  type="button"
                  onClick={() => handleSelectFacility(facility.facilityId)}
                  disabled={facility.availableSpaces === 0}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    selectedFacilityId === facility.facilityId
                      ? 'border-gray-900 bg-gray-50 shadow-md'
                      : facility.availableSpaces === 0
                      ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  {selectedFacilityId === facility.facilityId && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {/* Facility Image */}
                  {facility.images && facility.images[0] && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-3">
                      <ImageWithFallback
                        src={facility.images[0]}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Facility Info */}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {facility.name}
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
                    <Badge variant={facility.availableSpaces > 0 ? "default" : "secondary"}>
                      {facility.availableSpaces > 0 
                        ? `${facility.availableSpaces} spaces left`
                        : 'Fully booked'
                      }
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Room (for hotels) or direct to bed (for hostels) */}
          {selectedFacility && (
            <div ref={selectionRef} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <h2 className="text-xl font-semibold">
                  {isHostel ? 'Select Bed Space' : 'Select Room'}
                </h2>
              </div>

              {isHotel ? (
                // Hotel: Show rooms
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedFacility.rooms.map((room) => {
                    const availableBeds = room.bedSpaces.filter(b => b.available).length;
                    const roomPrice = room.bedSpaces[0]?.price || 0;
                    
                    return (
                      <button
                        key={room.roomId}
                        type="button"
                        onClick={() => handleSelectRoom(room.roomId)}
                        disabled={availableBeds === 0}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                          selectedRoomId === room.roomId
                            ? 'border-gray-900 bg-gray-50 shadow-md'
                            : availableBeds === 0
                            ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        {selectedRoomId === room.roomId && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {room.roomType} - Room {room.roomNumber}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                          </p>
                        </div>

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenity, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-end justify-between">
                          <div className="text-xl font-bold text-gray-900">
                            ₦{roomPrice.toLocaleString('en-NG')}
                          </div>
                          <Badge variant={availableBeds > 0 ? "default" : "secondary"}>
                            {availableBeds > 0 
                              ? `${availableBeds} available`
                              : 'Fully booked'
                            }
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Hostel: Show all bed spaces from all rooms
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {selectedFacility.rooms.flatMap(room => 
                    room.bedSpaces.map(bedSpace => (
                      <button
                        key={bedSpace.bedSpaceId}
                        type="button"
                        onClick={() => handleSelectBedSpace(bedSpace.bedSpaceId)}
                        disabled={!bedSpace.available}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedBedSpaceId === bedSpace.bedSpaceId
                            ? 'border-gray-900 bg-gray-50 shadow-md'
                            : !bedSpace.available
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        {selectedBedSpaceId === bedSpace.bedSpaceId && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className="text-center">
                          <Bed className={`w-8 h-8 mx-auto mb-2 ${
                            bedSpace.available ? 'text-gray-700' : 'text-gray-400'
                          }`} />
                          <div className="font-semibold text-sm mb-1">
                            Bed {bedSpace.bedNumber}
                          </div>
                          <div className="text-xs text-gray-600">
                            ₦{bedSpace.price.toLocaleString('en-NG')}
                          </div>
                          {!bedSpace.available && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Taken
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          {isSelectionComplete && (
            <div className="p-6 bg-gray-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Selected Accommodation</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFacilityId(null);
                    setSelectedRoomId(null);
                    setSelectedBedSpaceId(null);
                  }}
                >
                  Change
                </Button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Facility:</span>
                  <span className="font-medium">{selectedFacility?.name}</span>
                </div>
                {isHotel && selectedRoom && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">
                      {selectedRoom.roomType} - Room {selectedRoom.roomNumber}
                    </span>
                  </div>
                )}
                {isHostel && selectedBedSpace && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bed:</span>
                    <span className="font-medium">Bed {selectedBedSpace.bedNumber}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₦{price.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-white pt-4 pb-2 border-t">
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
                `Continue to Payment (₦${price.toLocaleString('en-NG')})`
              )}
            </Button>
          </div>
        </form>

        {/* Pairing Modal */}
        {showPairingModal && (
          <PairingCodeModal
            isOpen={showPairingModal}
            onClose={() => setShowPairingModal(false)}
            onProceedToPayment={handleProceedToPayment}
            onCodeVerified={handleCodeVerified}
            registrationId={registrationId}
            eventId={eventId}
            userId={userId}
            facilityId={selectedFacilityId || ""}
            roomId={selectedRoomId || ""}
          />
        )}
      </div>
    </div>
  );
}