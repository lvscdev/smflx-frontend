"use client";

import { Calendar, Clock, ArrowLeft } from "lucide-react";

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  isActive: boolean;
}

interface EventSelectionProps {
  onSelectEvent?: (eventId: string, eventName: string) => void;
  onContinue?: () => void;

  onBack: () => void;
  selectedEventId?: string;
  userProfile?: any;
}

const mockEvents: Event[] = [
  {
    id: 'woth25',
    name: 'WOTHSMFLX 25',
    startDate: '2025-07-15',
    endDate: '2025-07-20',
    registrationDeadline: '2025-07-01',
    isActive: false,
  },
  {
    id: 'campmeeting26',
    name: 'WOTH Camp Meeting 2026',
    startDate: '2026-04-30',
    endDate: '2026-05-03',
    registrationDeadline: '2026-04-02',
    isActive: true,
  },
  {
    id: 'yat-campmeeting26',
    name: 'WOTH YAT Camp Meeting 2026',
    startDate: '2026-04-30',
    endDate: '2026-05-03',
    registrationDeadline: '2026-04-02',
    isActive: true,
  },
];

export function EventSelection({
  onSelectEvent,
  onContinue,
  onBack,
  selectedEventId,
  userProfile,
}: EventSelectionProps) {
  // Filter events based on user's age range and YAT preference
  const isYATEligible = userProfile?.ageRange === '13-19' || (userProfile?.ageRange === '20-22' && userProfile?.isYAT);
  
  const filteredEvents = isYATEligible 
    ? mockEvents.filter(event => event.id === 'yat-campmeeting26') // Only show YAT event
    : mockEvents.filter(event => event.id !== 'yat-campmeeting26'); // Exclude YAT event

  return (
    <div className="flex-1 overflow-auto pt-8 lg:pt-[150px] px-4 lg:pr-[32px] lg:pb-[32px] lg:pl-[32px]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2 text-center">Select Event</h1>
          <p className="text-gray-600 text-sm text-center">
            Choose the SMFLX event you would like to attend
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                event.isActive
                  ? 'border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md'
                  : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl">{event.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    event.isActive 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {event.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    -{' '}
                    {new Date(event.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Registration closes:{' '}
                    {new Date(event.registrationDeadline).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectEvent) onSelectEvent(event.id, event.name);
                  else onContinue?.();
                }}
                disabled={!event.isActive}
                className={`w-full py-3 rounded-lg transition-colors ${
                  event.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {event.isActive ? 'Register for Event' : 'Registrations Closed'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}