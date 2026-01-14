'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Wifi, ArrowLeft, Tent, Users, Monitor, Building2, Home, Check, Radio, Youtube, Facebook } from 'lucide-react';

interface RegistrationData {
  attendeeType: string;
  accommodationType: string;
}

interface EventRegistrationProps {
  onComplete: (data: RegistrationData) => void;
  onBack: () => void;
  initialData?: RegistrationData | null;
}

interface GridOptionProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

function GridOption({ value, selected, onClick, icon, label, description, gradientFrom = 'from-white', gradientTo = 'to-gray-50' }: GridOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-300 text-left bg-linear-to-br ${gradientFrom} ${gradientTo} ${
        selected
          ? 'border-gray-700 shadow-sm'
          : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className="flex items-start gap-2.5">
        {icon && <div className={`mt-0.5 ${selected ? 'text-gray-700' : 'text-gray-400'}`}>{icon}</div>}
        <div className="flex-1">
          <div className={`text-sm font-medium mb-0.5 ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-gray-500">
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

const accommodationSpaces = {
  hostel: 45,
  hotel: 12,
  shared: 8,
};

export function EventRegistration({ onComplete, onBack, initialData }: EventRegistrationProps) {
  const [registration, setRegistration] = useState<RegistrationData>(initialData || {
    attendeeType: '',
    accommodationType: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(registration);
  };

  const isFormValid = () => {
    if (!registration.attendeeType) return false;
    if (registration.attendeeType === 'camper') {
      return !!registration.accommodationType;
    }
    return true;
  };

  const getButtonText = () => {
    if (registration.attendeeType === 'camper') {
      return 'Continue to Accommodation';
    }
    return 'Go to Dashboard';
  };

  return (
    <div className="flex-1 overflow-auto px-4 lg:px-8 py-8 lg:py-[60.32px] lg:pt-18 lg:pr-8 lg:pb-8 lg:pl-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">Event Registration</h1>
          <p className="text-gray-600 text-sm">
            Choose your attendance type and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendee Type - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Attendee Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="camper"
                selected={registration.attendeeType === 'camper'}
                onClick={() => setRegistration({ ...registration, attendeeType: 'camper', accommodationType: '' })}
                icon={<Tent className="w-5 h-5" />}
                label="Camper"
                description="Stay on-site with full camping experience"
              />
              <GridOption
                value="physical"
                selected={registration.attendeeType === 'physical'}
                onClick={() => setRegistration({ ...registration, attendeeType: 'physical', accommodationType: '' })}
                icon={<MapPin className="w-5 h-5" />}
                label="Physical Attendance"
                description="Attend in person without camping"
              />
              <div className="col-span-2">
                <GridOption
                  value="online"
                  selected={registration.attendeeType === 'online'}
                  onClick={() => setRegistration({ ...registration, attendeeType: 'online', accommodationType: '' })}
                  icon={<Monitor className="w-5 h-5" />}
                  label="Online Participant"
                  description="Join us virtually via live stream"
                />
              </div>
            </div>
          </div>

          {/* Physical Attendance - Location Info */}
          {registration.attendeeType === 'physical' && (
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-blue-900">Event Location</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    123 Conference Center Drive, Downtown District, City 12345
                  </p>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-600">
                    Map with directions would appear here
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Online Participant - Streaming Info */}
          {registration.attendeeType === 'online' && (
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <Wifi className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-purple-900">Join Us Online</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Watch the event live on multiple platforms:
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href="https://www.waystream.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium hover:bg-cyan-200 transition-colors"
                    >
                      <Radio className="w-4 h-4" />
                      Waystream
                    </a>
                    <a
                      href="http://mixlr.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
                    >
                      <Radio className="w-4 h-4" />
                      Mixlr
                    </a>
                    <a
                      href="https://www.youtube.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </a>
                    <a
                      href="https://www.facebook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Camper - Accommodation Type Grid Selector */}
          {registration.attendeeType === 'camper' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm text-gray-700 font-medium">Accommodation Type *</label>
              <div className="grid grid-cols-3 gap-3">
                <GridOption
                  value="hostel"
                  selected={registration.accommodationType === 'hostel'}
                  onClick={() => setRegistration({ ...registration, accommodationType: 'hostel' })}
                  icon={<Tent className="w-5 h-5" />}
                  label="Hostel (Camper)"
                  description={`${accommodationSpaces.hostel} spaces available`}
                />
                <GridOption
                  value="hotel"
                  selected={registration.accommodationType === 'hotel'}
                  onClick={() => setRegistration({ ...registration, accommodationType: 'hotel' })}
                  icon={<Building2 className="w-5 h-5" />}
                  label="Hotel"
                  description={`${accommodationSpaces.hotel} spaces available`}
                />
                <GridOption
                  value="shared"
                  selected={registration.accommodationType === 'shared'}
                  onClick={() => setRegistration({ ...registration, accommodationType: 'shared' })}
                  icon={<Users className="w-5 h-5" />}
                  label="Shared Apartment"
                  description={`${accommodationSpaces.shared} spaces available`}
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4">
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
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}