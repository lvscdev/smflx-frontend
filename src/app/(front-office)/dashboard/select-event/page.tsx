"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventSelector } from "@/components/front-office/ui/EventSelector";
import { listMyRegistrations } from "@/lib/api";
import { setActiveEventCookie } from "@/lib/auth/session";

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

      try {
        const regs = await listMyRegistrations();
        type EventItem = { eventId: string; eventName?: string };
        const list: EventItem[] = (Array.isArray(regs) ? regs : [])
          .map((r: any): EventItem | null => {
            const rawEventId = r?.eventId ?? r?.event?.eventId ?? r?.event ?? "";
            const eventId = typeof rawEventId === "string" ? rawEventId : String(rawEventId || "");
            if (!eventId) return null;

            // HARD GUARD: if attendee type is missing for this registration, user cannot proceed.
            const attendanceRaw =
              r?.attendeeType ?? r?.attendanceType ?? r?.participationMode ?? r?.participation ?? "";
            if (!String(attendanceRaw || "").trim()) return null;

            const rawName =
              r?.eventName ??
              r?.event?.eventName ??
              r?.eventTitle ??
              r?.event?.title ??
              r?.event?.name ??
              r?.name ??
              r?.title;
            const eventName = typeof rawName === "string" && rawName.trim() ? rawName : undefined;

            return { eventId, eventName };
          })
          .filter((x): x is EventItem => x !== null);

        if (cancelled) return;

        if (list.length === 0) {
          setError("Registration incomplete: missing attendee type. Please login again to complete registration.");
          router.replace("/register?view=login");
          return;
        }

        if (list.length === 1) {
          const eventId = list[0].eventId;
          setActiveEventCookie(eventId);
          const saved = safeLoadFlowState() || {};
          safeSaveFlowState({ ...saved, eventId, activeEventId: eventId });
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
    <EventSelector
      events={events}
      onSelect={onSelect}
      isLoading={isLoading}
      error={error}
    />
  );
}