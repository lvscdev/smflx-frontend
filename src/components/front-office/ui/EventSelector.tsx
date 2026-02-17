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
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Select an Event</h2>
          <p className="text-sm text-gray-500 mt-2">
            Choose the event you want to view your dashboard for.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-8">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading your events…
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-4">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No events found for this account.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.eventId}>
                <button
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                  onClick={() => onSelect(e.eventId)}
                >
                  <div className="font-semibold text-gray-900 group-hover:text-red-700">
                    {e.eventName && e.eventName !== e.eventId ? e.eventName : "WOTH Camp Meeting"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Tap to continue to your dashboard</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}