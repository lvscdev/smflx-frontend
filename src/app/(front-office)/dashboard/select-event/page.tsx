"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventSelector } from "@/components/front-office/ui/EventSelector";
import { listActiveEvents } from "@/lib/api";
import { setActiveEventCookie } from "@/lib/auth/session";
import { getAuthToken } from "@/lib/api/client";
import { loadDashboardSnapshot } from "@/lib/storage/dashboardState";

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

function safeSaveFlowState(state: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {}
}

export default function SelectEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<{ eventId: string; eventName?: string }[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      // 0) Auth guard: this page calls authenticated endpoints.
      // If we don't have a token, route user back to login instead of showing "Unauthorized".
      const token = getAuthToken();
      if (!token) {
        router.replace("/register?view=login");
        return;
      }

      // 1) Payment callbacks can land here when the server-side active event cookie is missing.
      // Recover the last known eventId from local storage (flow state / dashboard snapshot),
      // set the cookie, then go straight back to /dashboard.
      try {
        const flow = safeLoadFlowState() || {};
        const snap = loadDashboardSnapshot();

        const recoveredEventId =
          (typeof flow?.eventId === "string" && flow.eventId.trim()) ? flow.eventId.trim() :
          (typeof flow?.activeEventId === "string" && flow.activeEventId.trim()) ? flow.activeEventId.trim() :
          (typeof snap?.activeEventId === "string" && snap.activeEventId.trim()) ? snap.activeEventId.trim() :
          null;

        if (recoveredEventId) {
          setActiveEventCookie(recoveredEventId);
          // Ensure flow state has the same eventId for future resumes.
          safeSaveFlowState({ ...flow, eventId: recoveredEventId, activeEventId: recoveredEventId });
          router.replace("/dashboard");
          return;
        }
      } catch {
        // ignore; we'll fall back to listing events
      }

      try {
        const activeEvents = await listActiveEvents();
        
        type EventItem = { eventId: string; eventName?: string };
        const list: EventItem[] = (Array.isArray(activeEvents) ? activeEvents : [])
          .map((event: any): EventItem | null => {
            const eventId = event?.eventId;
            if (!eventId) return null;

            const eventName = event?.eventName || undefined;

            return { eventId, eventName };
          })
          .filter((x): x is EventItem => x !== null);

        if (cancelled) return;

        // If only one event, auto-select and continue.
        if (list.length === 1) {
          const eventId = list[0].eventId;
          setActiveEventCookie(eventId);
          const saved = safeLoadFlowState() || {};
          safeSaveFlowState({ ...saved, eventId });
          router.replace("/dashboard");
          return;
        }

        setEvents(list);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Unable to load your events. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const onSelect = (eventId: string) => {
    setActiveEventCookie(eventId);
    const saved = safeLoadFlowState() || {};
    safeSaveFlowState({ ...saved, eventId, activeEventId: eventId });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      <EventSelector
        events={events}
        onSelect={onSelect}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}