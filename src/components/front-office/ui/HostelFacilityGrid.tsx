import { Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/front-office/figma/ImageWithFallback";
import { Facility } from "@/lib/api/accommodation/types";

interface HostelFacilityGridProps {
  facilities: Facility[];
  selectedFacility?: Facility;
  onSelectFacility: (facility: Facility) => void;
}

function getSpacesLeft(totalCapacity: number, capacityOccupied: number) {
  return totalCapacity - capacityOccupied;
}

export function HostelFacilityGrid({
  facilities,
  selectedFacility,
  onSelectFacility,
}: HostelFacilityGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
          1
        </div>
        <h2 className="text-xl font-semibold">Select Facility</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {facilities &&
          facilities.length > 0 &&
          facilities.map((facility: Facility) => (
            <button
              key={facility.facilityId}
              type="button"
              onClick={() => onSelectFacility(facility)}
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
}