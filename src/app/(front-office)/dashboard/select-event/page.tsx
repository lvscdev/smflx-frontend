"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listMyRegistrations } from "@/lib/api";
import { setActiveEventCookie } from "@/lib/auth/session";
import { Loader2, Calendar, ChevronRight, CheckCircle2, Clock } from "lucide-react";

const FLOW_STATE_KEY = "smflx_flow_state_v1";

function safeLoadFlowState() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(FLOW_STATE_KEY) || "null"); } catch { return null; }
}
function safeSaveFlowState(state: any) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state)); } catch {}
}

type EventItem = {
  eventId: string;
  eventName: string;
  status: string;
  paymentStatus: string;
  attendeeType: string;
  createdAt: string | null;
  startDate: string | null;
};

function deriveStatus(r: any): { label: string; variant: "active" | "pending" | "past" } {
  const regStatus = String(r?.status ?? "").toUpperCase();
  const payStatus = String(r?.paymentStatus ?? r?.payment_status ?? "").toUpperCase();
  if (["ACTIVE", "CONFIRMED", "COMPLETED"].includes(regStatus) || ["PAID", "SUCCESS"].includes(payStatus))
    return { label: "Registered", variant: "active" };
  if (["PENDING", "PROCESSING", "INITIATED"].includes(payStatus) || regStatus === "PENDING")
    return { label: "Pending payment", variant: "pending" };
  return { label: "Registered", variant: "active" };
}

function formatDate(raw: string | null): string {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

export default function SelectEventPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const regs = await listMyRegistrations();
        const list: EventItem[] = (Array.isArray(regs) ? regs : [])
          .map((r: any): EventItem | null => {
            const eventId = String(r?.eventId ?? r?.event?.eventId ?? r?.event ?? "");
            if (!eventId) return null;
            const attendanceRaw = String(r?.attendeeType ?? r?.attendanceType ?? r?.participationMode ?? "").trim();
            if (!attendanceRaw) return null;
            const rawName = r?.eventName ?? r?.event?.eventName ?? r?.eventTitle ?? r?.event?.title ?? r?.event?.name;
            return {
              eventId,
              eventName: typeof rawName === "string" && rawName.trim() ? rawName.trim() : "WOTH Camp Meeting",
              status: String(r?.status ?? ""),
              paymentStatus: String(r?.paymentStatus ?? r?.payment_status ?? ""),
              attendeeType: attendanceRaw,
              createdAt: typeof r?.createdAt === "string" ? r.createdAt : null,
              startDate: typeof r?.startDate === "string" ? r.startDate :
                         typeof r?.event?.startDate === "string" ? r.event.startDate : null,
            };
          })
          .filter((x): x is EventItem => x !== null);

        if (cancelled) return;

        if (list.length === 0) {
          router.replace("/register?view=login");
          return;
        }

        // Auto-route when there is only one valid registration — no need to show a picker
        if (list.length === 1) {
          const { eventId } = list[0];
          setActiveEventCookie(eventId);
          safeSaveFlowState({ ...(safeLoadFlowState() || {}), eventId, activeEventId: eventId });
          router.replace("/dashboard");
          return;
        }

        // Multiple events: sort newest/most-recent first so the top choice is always the
        // current event. Users almost always want the latest registration.
        const sorted = [...list].sort((a, b) => {
          const da = a.startDate ?? a.createdAt ?? "";
          const db = b.startDate ?? b.createdAt ?? "";
          return db.localeCompare(da); // descending
        });

        setEvents(sorted);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unable to load your events. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  const select = (eventId: string) => {
    setActiveEventCookie(eventId);
    safeSaveFlowState({ ...(safeLoadFlowState() || {}), eventId, activeEventId: eventId });
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading your events…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => router.replace("/register?view=login")}
            className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Your Events</h1>
          <p className="text-sm text-gray-500 mt-2">
            You have registrations across multiple events.<br />
            Select the one you want to view.
          </p>
        </div>

        <div className="space-y-3">
          {events.map((e, i) => {
            const { label, variant } = deriveStatus(e);
            const isNewest = i === 0;
            return (
              <button
                key={e.eventId}
                onClick={() => select(e.eventId)}
                className={
                  "w-full bg-white rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm " +
                  "border-2 transition-all hover:shadow-md " +
                  (isNewest ? "border-gray-900 hover:border-gray-700" : "border-transparent hover:border-gray-200")
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">{e.eventName}</span>
                    {isNewest && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-900 text-white px-2 py-0.5 rounded-full shrink-0">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {e.startDate && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(e.startDate)}
                      </span>
                    )}
                    <span className={
                      "text-xs flex items-center gap-1 font-medium " +
                      (variant === "active" ? "text-green-700" :
                       variant === "pending" ? "text-amber-700" : "text-gray-400")
                    }>
                      {variant === "active"
                        ? <CheckCircle2 className="w-3 h-3" />
                        : <Clock className="w-3 h-3" />}
                      {label}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{e.attendeeType.toLowerCase()}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Your most recent event is shown first.
        </p>
      </div>
    </div>
  );
}