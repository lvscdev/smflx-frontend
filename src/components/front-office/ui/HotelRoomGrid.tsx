import { Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/front-office/figma/ImageWithFallback";
import { Facility, HotelRoom } from "@/lib/api/accommodation/types";

interface HotelRoomGridProps {
  facilities: Facility[];
  hotelRooms: HotelRoom[];
  loadingRooms: boolean;
  roomsError: string | null;
  selectedFacility?: Facility;
  selectedRoom: HotelRoom | null;
  onSelectFacility: (facility: Facility) => void;
  onSelectRoom: (room: HotelRoom) => void;
}

function getSpacesLeft(totalCapacity: number, capacityOccupied: number) {
  return totalCapacity - capacityOccupied;
}

export function HotelRoomGrid({
  facilities,
  hotelRooms,
  loadingRooms,
  roomsError,
  selectedFacility,
  selectedRoom,
  onSelectFacility,
  onSelectRoom,
}: HotelRoomGridProps) {
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const facility = facilities.find(
                (f: Facility) => f.facilityId === e.target.value,
              );
              if (facility) {
                onSelectFacility(facility);
              }
            }}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
          >
            <option value="">Choose a hotel</option>
            {facilities.map((facility: Facility) => (
              <option
                key={facility.facilityId}
                value={facility.facilityId}
                disabled={facility?.capacityOccupied >= facility?.totalCapacity}
              >
                {facility.facilityName}
                {facility.location ? ` - ${facility.location}` : ""}
                {facility?.capacityOccupied >= facility?.totalCapacity ? " (Fully Booked)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Select Room Type - only shown when hotel is selected */}
      {selectedFacility && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Select Room Type</h2>
          </div>

          {loadingRooms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                  hotelRooms.map((room: HotelRoom, index: number) => {
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
                          if (!isFullyBooked) onSelectRoom(room);
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
                            src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80"
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
}