"use client";

import React from "react";

export function EventSelector({
  events,
  onSelect,
  isLoading,
  error,
}: {
  events: { eventId: string; eventName?: string }[];
  onSelect: (eventId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white text-gray-900 px-6">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold">Select an Event</h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose the event you want to view your dashboard for.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm">Loading your events…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : events.length === 0 ? (
          <p className="mt-6 text-sm">No events found for this account.</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {events.map((e) => (
              <li key={e.eventId}>
                <button
                  className="w-full px-4 py-3 border rounded-md hover:bg-gray-100 text-left"
                  onClick={() => onSelect(e.eventId)}
                >
                  <div className="font-medium">{e.eventName || e.eventId || "Event"}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}