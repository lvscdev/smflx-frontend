"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, ArrowLeft, Check } from "lucide-react";
import { ImageWithFallback } from "@/components/front-office/figma/ImageWithFallback";
import { PairingCodeModal } from "@/components/front-office/ui/PairingCodeModal";
import { validateAccommodationSelection } from "@/lib/validation/accommodation";

interface AccommodationData {
  type: string;
  facility?: string;
  room?: string;
  bed?: string;
  roomType?: string;
  roomMembers?: string[];
  price?: number;
  priceCategory?: 'employed' | 'unemployed-student';
  isPaired?: boolean;
}

interface AccommodationSelectionProps {
  accommodationType: string;
  onComplete: (data: AccommodationData) => void;
  onBack: () => void;
  initialData?: AccommodationData | null;
  profile?: any;
}

const campFacilities = [
  { 
    id: 'dansol-high', 
    name: 'Dansol High', 
    spaces: 102,
    image: 'https://images.unsplash.com/photo-1761417327344-66e899ed9a63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3N0ZWwlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NzgxNTU5NHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 'dansol-annex', 
    name: 'Dansol Annex', 
    spaces: 86,
    image: 'https://images.unsplash.com/photo-1748143175931-77bd21b43bc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3JtaXRvcnklMjBidWlsZGluZyUyMGNhbXB1c3xlbnwxfHx8fDE3Njc4MTU1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  { 
    id: 'akin-osiyemi', 
    name: 'Akin Osiyemi', 
    spaces: 54,
    image: 'https://images.unsplash.com/photo-1695979164037-f093c6824b84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwYWNjb21tb2RhdGlvbiUyMGJ1aWxkaW5nfGVufDF8fHx8MTc2Nzc5MjU3Mnww&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

const hotels = [
  { 
    id: 'grand', 
    name: 'Grand Plaza Hotel',
    location: 'Victoria Island, Lagos',
    roomTypes: [
      { 
        id: 'standard', 
        name: 'Standard Room', 
        price: 150000,
        roomsLeft: 8,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      },
      { 
        id: 'deluxe', 
        name: 'Deluxe Room', 
        price: 250000,
        roomsLeft: 5,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      },
      { 
        id: 'suite', 
        name: 'Suite', 
        price: 400000,
        roomsLeft: 2,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      }
    ]
  },
  { 
    id: 'royal', 
    name: 'Royal Inn',
    location: 'Agidingbi, Ikeja Lagos',
    roomTypes: [
      { 
        id: 'standard', 
        name: 'Standard Room', 
        price: 120000,
        roomsLeft: 12,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      },
      { 
        id: 'deluxe', 
        name: 'Deluxe Room', 
        price: 200000,
        roomsLeft: 4,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      }
    ]
  },
];

const sharedApartments = [
  { 
    id: 'downtown', 
    name: 'Downtown Apartments',
    location: 'Lekki Phase 1, Lagos',
    roomTypes: [
      { 
        id: '2-bedroom', 
        name: '2-Bedroom', 
        price: 180000,
        roomsLeft: 6,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      },
      { 
        id: '3-bedroom', 
        name: '3-Bedroom', 
        price: 250000,
        roomsLeft: 3,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      }
    ]
  },
  { 
    id: 'lakeside', 
    name: 'Lakeside Residences',
    location: 'Ikoyi, Lagos',
    roomTypes: [
      { 
        id: '2-bedroom', 
        name: '2-Bedroom', 
        price: 200000,
        roomsLeft: 8,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      },
      { 
        id: '3-bedroom', 
        name: '3-Bedroom', 
        price: 280000,
        roomsLeft: 5,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      },
      { 
        id: '4-bedroom', 
        name: '4-Bedroom', 
        price: 350000,
        roomsLeft: 2,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
      }
    ]
  },
];

export function AccommodationSelection({ accommodationType, onComplete, onBack, initialData, profile }: AccommodationSelectionProps) {
  const [selection, setSelection] = useState<AccommodationData>(initialData || {
    type: accommodationType,
  });
  const [newMember, setNewMember] = useState('');
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate price based on marital status
  // Students: 10,000, Employed/Unemployed: 15,000
  const getCampPrice = () => {
    if (profile?.maritalStatus === 'student') {
      return 10000;
    }
    return 15000; // For employed, unemployed, single, married, divorced, widowed
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = validateAccommodationSelection(accommodationType, selection);
    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    setFormError(null);

    // Check if user is married and selecting hotel accommodation
    if (accommodationType === 'hotel' && profile?.maritalStatus === 'married') {
      setShowPairingModal(true);
    } else {
      onComplete(selection);
    }
  };

  const handleProceedToPayment = () => {
    setShowPairingModal(false);
    onComplete(selection);
  };

  const handleCodeVerified = () => {
    setShowPairingModal(false);
    // Mark as paired and skip payment - pass special flag
    onComplete({ ...selection, isPaired: true });
  };

  const addRoomMember = () => {
    if (newMember.trim()) {
      setSelection({
        ...selection,
        roomMembers: [...(selection.roomMembers || []), newMember.trim()],
      });
      setNewMember('');
    }
  };

  const removeMember = (index: number) => {
    const updatedMembers = [...(selection.roomMembers || [])];
    updatedMembers.splice(index, 1);
    setSelection({ ...selection, roomMembers: updatedMembers });
  };

  const isFormValid = () => {
    if (accommodationType === 'hostel') {
      return selection.facility && selection.price;
    }
    if (accommodationType === 'hotel') {
      return selection.facility && selection.roomType;
    }
    if (accommodationType === 'shared') {
      return selection.facility && selection.roomType;
    }
    return false;
  };

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">
            {accommodationType === 'hostel' && 'Camp Accommodation'}
            {accommodationType === 'hotel' && 'Hotel Accommodation'}
            {accommodationType === 'shared' && 'Shared Apartment'}
          </h1>
          <p className="text-gray-600 text-sm">
            Select your accommodation preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {formError}
            </div>
          )}
          {/* Hostel Flow */}
          {accommodationType === 'hostel' && (
            <>
              <div className="space-y-3">
                <label className="block text-sm text-gray-700 font-medium">Select Camp Facility *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campFacilities.map((facility) => {
                    const price = getCampPrice();
                    return (
                      <button
                        key={facility.id}
                        type="button"
                        onClick={() => { setFormError(null); setSelection({ ...selection, facility: facility.id, price }); }}
                        className={`p-5 rounded-2xl border transition-all duration-200 text-left ${
                          selection.facility === facility.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-4/3 w-full rounded-xl overflow-hidden mb-4">
                          <ImageWithFallback
                            src={facility.image}
                            alt={facility.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {facility.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {facility.spaces} Spaces Left
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Hotel Flow */}
          {accommodationType === 'hotel' && (
            <>
              <div className="space-y-2">
                <label htmlFor="hotel" className="block text-sm text-gray-700">Select Hotel *</label>
                <select
                  id="hotel"
                  value={selection.facility}
                  onChange={(e) => { setFormError(null); setSelection({ ...selection, facility: e.target.value, roomType: '', price: undefined }); }}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Choose a hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name} - {hotel.location}
                    </option>
                  ))}
                </select>
              </div>

              {selection.facility && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm text-gray-700 font-medium">Select Room Type *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels
                      .find((h) => h.id === selection.facility)
                      ?.roomTypes.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => { setFormError(null); setSelection({ ...selection, roomType: room.id, price: room.price }); }}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 text-left ${
                            selection.roomType === room.id
                              ? 'border-gray-900 bg-gray-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {selection.roomType === room.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="aspect-4/3 w-full rounded-xl overflow-hidden mb-4">
                            <ImageWithFallback
                              src={room.image}
                              alt={room.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {room.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {hotels.find((h) => h.id === selection.facility)?.location}
                          </p>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-bold text-gray-900">
                              ₦{room.price.toLocaleString('en-NG')}
                            </div>
                            <p className="text-sm text-gray-500">
                              {room.roomsLeft} Rooms Left
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Shared Apartment Flow */}
          {accommodationType === 'shared' && (
            <>
              <div className="space-y-2">
                <label htmlFor="apartment" className="block text-sm text-gray-700">Select Apartment *</label>
                <select
                  id="apartment"
                  value={selection.facility}
                  onChange={(e) => { setFormError(null); setSelection({ ...selection, facility: e.target.value, roomType: '' }); }}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Choose an apartment</option>
                  {sharedApartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name}
                    </option>
                  ))}
                </select>
              </div>

              {selection.facility && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm text-gray-700 font-medium">Select Room Type *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sharedApartments
                      .find((a) => a.id === selection.facility)
                      ?.roomTypes.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => { setFormError(null); setSelection({ ...selection, roomType: room.id, price: room.price }); }}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 text-left ${
                            selection.roomType === room.id
                              ? 'border-gray-900 bg-gray-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {selection.roomType === room.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="aspect-4/3 w-full rounded-xl overflow-hidden mb-4">
                            <ImageWithFallback
                              src={room.image}
                              alt={room.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {room.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {sharedApartments.find((a) => a.id === selection.facility)?.location}
                          </p>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-bold text-gray-900">
                              ₦{room.price.toLocaleString('en-NG')}
                            </div>
                            <p className="text-sm text-gray-500">
                              {room.roomsLeft} Rooms Left
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                isFormValid()
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {accommodationType === 'hostel' && selection.price 
                ? `Pay ₦${selection.price.toLocaleString('en-NG')}`
                : 'Continue to Payment'
              }
            </button>
          </div>
        </form>
      </div>
      {showPairingModal && (
        <PairingCodeModal
          isOpen={showPairingModal}
          onClose={() => setShowPairingModal(false)}
          onProceedToPayment={handleProceedToPayment}
          onCodeVerified={handleCodeVerified}
        />
      )}
    </div>
  );
}