"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, ArrowLeft, RefreshCcw } from "lucide-react";
import { listActiveEvents, type Event as ApiEvent } from "@/lib/api";
import { toUserMessage } from "@/lib/errors/userMessages";

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

function mapApiEvent(e: ApiEvent): Event {
  const startDate = e.startDate || new Date().toISOString();
  const endDate = e.endDate || startDate;
  return {
    id: e.eventId,
    name: e.eventName,
    startDate,
    endDate,
    registrationDeadline: e.registrationCloseAt || endDate,
    isActive: (e.eventStatus || "ACTIVE").toUpperCase() === "ACTIVE",
  };
}

export function EventSelection({
  onSelectEvent,
  onContinue,
  onBack,
  selectedEventId,
  userProfile,
}: EventSelectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [isEmpty, setIsEmpty] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const apiEvents = await listActiveEvents();
      const mapped = (apiEvents || []).map(mapApiEvent);
      setEvents(mapped);
      setIsEmpty(mapped.length === 0);
    } catch (e: any) {
      setIsEmpty(false);
      setLoadError(toUserMessage(e, { feature: "events", action: "list" }));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  // Filter events based on user's age range and YAT preference
  const isYATEligible = userProfile?.ageRange === "13-19" || (userProfile?.ageRange === "20-22" && userProfile?.isYAT);

  const filteredEvents = isYATEligible
    ? events.filter((event) => event.name.toLowerCase().includes("yat"))
    : events.filter((event) => !event.name.toLowerCase().includes("yat"));

  return (
    <div className="flex-1 overflow-auto pt-8 lg:pt-[150px] px-4 lg:pr-[32px] lg:pb-[32px] lg:pl-[32px]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2 text-center">Select Event</h1>
          <p className="text-gray-600 text-sm text-center">Choose the SMFLX event you would like to attend</p>
        </div>

        {loading && (
          <div className="text-center text-sm text-gray-500 mb-6">Loading events…</div>
        )}

        {loadError && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800 flex items-start justify-between gap-4">
            <span>{loadError}</span>
            <button
              onClick={loadEvents}
              className="inline-flex items-center gap-2 text-amber-900 hover:underline whitespace-nowrap"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && isEmpty && (
          <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-gray-50 text-center">
            <div className="text-base text-gray-900 mb-1">No events available</div>
            <div className="text-sm text-gray-600">
              There are currently no events open for registration. Please check back later.
            </div>
          </div>
        )}

        {!loading && !loadError && !isEmpty && filteredEvents.length === 0 && (
          <div className="text-center text-sm text-gray-600 mb-6">No events available for your profile.</div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                event.isActive
                  ? "border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md"
                  : "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl">{event.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    event.isActive ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {event.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(event.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Registration closes:{" "}
                    {new Date(event.registrationDeadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {event.isActive ? "Register for Event" : "Registrations Closed"}
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
