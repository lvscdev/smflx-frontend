"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/front-office/ui/Dashboard";
import { AUTH_USER_STORAGE_KEY, getAuthToken, getStoredUser, setAuthToken } from "@/lib/api/client";
import { clearTokenCookie, clearActiveEventCookie, setActiveEventCookie } from "@/lib/auth/session";
import { getMe, verifyToken, getUserDashboard, listMyRegistrations } from "@/lib/api";
import type { NormalizedDashboardResponse, UserProfile, DashboardRegistration, DashboardAccommodation } from "@/lib/api/dashboardTypes";
import { clearDashboardSnapshot } from "@/lib/storage/dashboardState";
import { readOtpCookie } from "@/lib/auth/otpCookie";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const FLOW_STATE_KEY = "smflx_flow_state_v1";

const LEGACY_KEYS = [
  "smflx_flow_state",
  "flowState",
  "smflx_last_state",
  "smflx_selected_event",
  "smflx_pending_accommodation_payment",
  "smflx_pending_accommodation_payment_started_at",
  "smflx_pending_dependents_v1",
  "smflx_pending_payment_ctx",
];

function cleanLegacyKeys() {
  if (typeof window === "undefined") return;
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {}
}

function safeLoadFlowState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FLOW_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeClearFlowState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FLOW_STATE_KEY);
    cleanLegacyKeys();
  } catch {}
}

function safeSaveFlowState(state: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
  } catch {}
}

function hasAccountFootprint(): boolean {
  try {
    return !!localStorage.getItem(AUTH_USER_STORAGE_KEY);
  } catch {
    return false;
  }
}

function consumePostPaymentFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const flag = localStorage.getItem("smflx_post_payment_poll");
    if (flag) {
      localStorage.removeItem("smflx_post_payment_poll");
      return true;
    }
  } catch {}
  return false;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ownerRegId, setOwnerRegId] = useState<string | null>(null);
  const [registration, setRegistration] = useState<DashboardRegistration | null>(null);
  const [accommodation, setAccommodation] = useState<DashboardAccommodation | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{
    eventId: string;
    eventName: string;
  } | null>(null);

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [eventCache, setEventCache] = useState<Record<string, NormalizedDashboardResponse>>({});

  const didHandleMissingAttendeeTypeRef = useRef(false);
  const bootRanRef = useRef(false);

  useEffect(() => {
    if (bootRanRef.current) return;
    bootRanRef.current = true;

    cleanLegacyKeys();

    async function boot() {
      const token = getAuthToken();

      // 1) No token — redirect appropriately
      if (!token) {
        const otp = readOtpCookie();
        if (otp?.email) {
          try { sessionStorage.setItem("smflx_pending_email", String(otp.email)); } catch {}
          router.replace(`/register?view=login`);
          return;
        }
        router.replace(hasAccountFootprint() ? "/register?view=login" : "/register");
        return;
      }

      // 2) Hydrate email from stored user for fast display (skeleton only — API will override)
      let storedUser: any = null;
      try { storedUser = getStoredUser(); } catch {}

      if (storedUser) {
        const storedEmail = storedUser?.email || storedUser?.user?.email || storedUser?.data?.email || "";
        if (storedEmail) setEmail(storedEmail);
        setProfile((prev) => prev ?? storedUser);
      }

      try {
        await verifyToken();

        let regForEvent: any = null;
        let accForEvent: any = null;
        let localSelectedEvent: { eventId: string; eventName: string } | null = null;
        let matchForEvent: any = null;

        // 3) Fetch fresh profile from API
        const me = await getMe();
        const mergedProfile = { ...(storedUser || {}), ...(me || {}) };
        setProfile(mergedProfile);
        const apiEmail = (me as any)?.email || "";
        if (apiEmail) setEmail(apiEmail);

        // 4) Fetch registrations to get valid eventId
        let eventId: string | null = null;
        let myRegIdForEvent: string | null = null;

        try {
          if (process.env.NODE_ENV !== "production") console.log("📋 Fetching user registrations...");
          const myRegistrations = await listMyRegistrations();

          if (!Array.isArray(myRegistrations) || myRegistrations.length === 0) {
            if (process.env.NODE_ENV !== "production") console.warn("⚠️ No event registrations found");

            const saved = safeLoadFlowState();
            if (saved?.view && saved.view !== "dashboard") {
              router.replace("/register");
              return;
            }

            setError("You haven't registered for any events yet. Please select an event to continue.");
            setLoading(false);
            setTimeout(() => router.replace("/register?view=event-selection"), 2000);
            return;
          }

          const mostRecent = myRegistrations[0];
          eventId = mostRecent.eventId;
          matchForEvent = myRegistrations.find((r: any) => r?.eventId === eventId) ?? mostRecent;
          myRegIdForEvent = matchForEvent?.regId ? String(matchForEvent.regId) : null;

          if (process.env.NODE_ENV !== "production") console.log("🔑 Registration:", { eventId, regId: myRegIdForEvent });

          setOwnerRegId(myRegIdForEvent);

          if (!eventId) {
            setError("Registration data is incomplete. Please contact support.");
            setLoading(false);
            return;
          }

          localSelectedEvent = {
            eventId,
            eventName: mostRecent.eventName || (mostRecent as any)?.eventTitle || "Event",
          };
          setSelectedEvent(localSelectedEvent);

        } catch (regErr: any) {
          if (process.env.NODE_ENV !== "production") console.error("❌ Failed to fetch registrations:", regErr);
          setError(regErr?.message || "Failed to load your registrations. Please try again.");
          setLoading(false);
          return;
        }

        // 5) Fetch dashboard — single source of truth for all registration/accommodation/dependent data
        if (eventId) {
          try {
            if (process.env.NODE_ENV !== "production") console.log(`📊 Fetching dashboard for eventId: ${eventId}`);
            const dashboardData = await getUserDashboard(eventId);

            setEventCache((prev) => ({ ...prev, [eventId!]: dashboardData }));
            setActiveEventId(eventId);
            try { setActiveEventCookie(String(eventId)); } catch {}

            regForEvent =
              dashboardData.registrations.find((r) => r.eventId === eventId) ??
              dashboardData.registrations[0] ??
              null;

            const regAttendanceRaw =
              (regForEvent as any)?.attendeeType ??
              (regForEvent as any)?.attendanceType ??
              (regForEvent as any)?.participationMode ??
              (regForEvent as any)?.participation ??
              "";

            const registrationsAttendanceRaw =
              (matchForEvent as any)?.registrationData?.attendeeType ??
              (matchForEvent as any)?.registrationData?.participationMode ??
              (matchForEvent as any)?.attendeeType ??
              (matchForEvent as any)?.participationMode ??
              "";

            // Flow state only for attendee type set during wizard (not as data cache)
            const savedFlow = safeLoadFlowState() || {};
            const recoveredAttendanceRaw =
              savedFlow?.registration?.attendeeType ??
              savedFlow?.registration?.participationMode ??
              "";

            const pickFirstNonEmpty = (...vals: unknown[]) => {
              for (const v of vals) {
                const s = String(v ?? "").trim();
                if (s) return s;
              }
              return "";
            };

            const effectiveAttendanceRaw = pickFirstNonEmpty(
              regAttendanceRaw,
              registrationsAttendanceRaw,
              recoveredAttendanceRaw
            );

            if (!String(effectiveAttendanceRaw || "").trim()) {
              if (!didHandleMissingAttendeeTypeRef.current) {
                didHandleMissingAttendeeTypeRef.current = true;
                try {
                  const key = `smflx_missing_attendee_type_warned_${eventId}`;
                  const already = sessionStorage.getItem(key);
                  if (!already) {
                    sessionStorage.setItem(key, "1");
                    toast.error("Registration incomplete", {
                      description: "Missing attendee type. Please complete your registration to continue.",
                    });
                  }
                } catch {}
              }
              router.replace("/register?view=event-registration");
              return;
            }

            const isCamper = String(effectiveAttendanceRaw).toLowerCase().includes("camp");

            const normalizedRegistration = {
              ...(regForEvent || {}),
              regId: (regForEvent as any)?.regId ?? myRegIdForEvent ?? (regForEvent as any)?.registrationId ?? (regForEvent as any)?.id,
              attendeeType:
                (regForEvent as any)?.attendeeType ??
                (regForEvent as any)?.attendanceType ??
                (regForEvent as any)?.participationMode ??
                registrationsAttendanceRaw ??
                recoveredAttendanceRaw ??
                "",
            };

            // Accommodation — API is source of truth
            accForEvent = null;
            if (dashboardData.accommodations.length > 0) {
              accForEvent =
                dashboardData.accommodations.find((a) => a.eventId === eventId) ??
                (dashboardData.accommodations.length === 1 ? dashboardData.accommodations[0] : null) ??
                (isCamper ? dashboardData.accommodations[0] : null) ??
                null;
            }

            setRegistration(normalizedRegistration);
            setAccommodation(accForEvent);

            if (regForEvent) {
              localSelectedEvent = {
                eventId: (regForEvent.eventId || eventId) as string,
                eventName: (regForEvent.eventName || regForEvent.eventTitle || "Event") as string,
              };
              if (!selectedEvent) setSelectedEvent(localSelectedEvent);
            }

            // Flow state is now minimal — just wizard navigation marker
            safeSaveFlowState({ view: "dashboard", activeEventId: eventId });

            if (process.env.NODE_ENV !== "production") console.log("✅ Dashboard loaded successfully");
          } catch (dashErr: any) {
            if (process.env.NODE_ENV !== "production") console.error("❌ Failed to fetch dashboard:", dashErr);
            setError(dashErr?.message || "Failed to load dashboard. Please try again.");
          }
        }

      } catch (err: any) {
        if (process.env.NODE_ENV !== "production") console.error("❌ Auth error:", err);
        const status = err?.status;
        if (status === 401 || status === 403) {
          setAuthToken(null);
          clearTokenCookie();
          clearActiveEventCookie();
          safeClearFlowState();
          clearDashboardSnapshot();
          router.replace("/register?view=login");
          return;
        }
        setError(err?.message || "Failed to verify your session. Please try again.");
      }

      setLoading(false);
    }

    boot();
  }, []);

  // Post-payment polling — polls API until accommodation/registration payment is confirmed.
  // Triggered by smflx_post_payment_poll flag set by the payment callback page.
  const postPaymentPollingRef = useRef(false);
  useEffect(() => {
    if (postPaymentPollingRef.current) return;
    if (typeof window === "undefined") return;

    const isPostPayment = consumePostPaymentFlag();
    const flowState = safeLoadFlowState();
    const justPaid = isPostPayment || flowState?.paymentStatus === "success";

    if (!justPaid) return;

    postPaymentPollingRef.current = true;

    if (flowState?.paymentStatus) {
      safeSaveFlowState({ ...flowState, paymentStatus: undefined });
    }

    const MAX_POLLS = 6;
    const POLL_INTERVAL_MS = 4000;
    let pollCount = 0;
    let cancelled = false;

    const pollDashboard = async () => {
      if (cancelled || pollCount >= MAX_POLLS) return;
      pollCount++;

      try {
        const regs = await listMyRegistrations();
        if (cancelled) return;

        const latest = regs?.[0];
        if (!latest?.eventId) {
          if (pollCount < MAX_POLLS) setTimeout(pollDashboard, POLL_INTERVAL_MS);
          return;
        }

        const eventId = latest.eventId;
        const dashboardData = await getUserDashboard(eventId);
        if (cancelled) return;

        const regForEvent =
          dashboardData.registrations.find((r) => r.eventId === eventId) ??
          dashboardData.registrations[0] ??
          null;

        const accForEvent =
          dashboardData.accommodations.find((a) => a.eventId === eventId) ??
          dashboardData.accommodations[0] ??
          null;

        // Determine if accommodation payment confirmed
        const accStatus = String(
          (accForEvent as any)?.status ??
          (accForEvent as any)?.paymentStatus ??
          ""
        ).toLowerCase();
        const accPaid =
          (accForEvent as any)?.paidForAccommodation === true ||
          ["paid", "success", "completed", "confirmed"].includes(accStatus);

        // Determine if registration payment confirmed
        const regStatus = String(
          (regForEvent as any)?.status ??
          (regForEvent as any)?.paymentStatus ??
          (regForEvent as any)?.payment_status ??
          ""
        ).toUpperCase();
        const regPaid = ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED", "ACTIVE"].includes(regStatus);

        const isPaid = accPaid || regPaid;

        if (regForEvent) {
          if (isPaid && accForEvent) {
            const currentType = String(
              (regForEvent as any)?.attendeeType ??
              (regForEvent as any)?.attendanceType ??
              (regForEvent as any)?.participationMode ??
              ""
            ).toLowerCase();

            const isNonCamper =
              currentType === "physical" ||
              currentType === "online" ||
              currentType === "attendee" ||
              currentType === "";

            setRegistration(isNonCamper
              ? { ...regForEvent, attendeeType: "camper", attendanceType: "camper", participationMode: "CAMPER" }
              : regForEvent
            );
          } else {
            setRegistration(regForEvent);
          }
        }

        if (accForEvent) setAccommodation(accForEvent);
        setEventCache((prev) => ({ ...prev, [eventId]: dashboardData }));

        if (dashboardData.dependents && dashboardData.dependents.length > 0) {
          const freshDependents = dashboardData.dependents.map((d: any) => {
            const id = d.id ?? d.dependantId ?? d.dependentId ?? "";
            const paymentStatusRaw = (d.paymentStatus ?? d.payment_state ?? d.paymentState ?? d.status ?? "").toUpperCase();
            const paid =
              d.isPaid === true ||
              d.paid === true ||
              ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED"].includes(paymentStatusRaw);
            return {
              id,
              name: d.name ?? d.dependantName ?? d.dependentName ?? "Dependent",
              age: String(d.age ?? d.dependantAge ?? d.dependentAge ?? ""),
              gender: d.gender ?? d.dependantGender ?? "",
              isRegistered: typeof d.isRegistered === "boolean" ? d.isRegistered : true,
              isPaid: paid,
            };
          });
          // Dispatch to Dashboard via a custom event so the component can update its local state
          try {
            window.dispatchEvent(new CustomEvent("smflx:dependents:refresh", { detail: freshDependents }));
          } catch {}
        }

        if (isPaid || pollCount >= MAX_POLLS) {
          if (!isPaid && pollCount >= MAX_POLLS) {
            toast.warning("Payment is still being confirmed", {
              description: "Your payment was received but is still processing. Please refresh in a few minutes.",
              duration: 10000,
              action: { label: "Refresh now", onClick: () => window.location.reload() },
            });
          }
          return;
        }

        setTimeout(pollDashboard, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled && pollCount < MAX_POLLS) {
          setTimeout(pollDashboard, POLL_INTERVAL_MS);
        }
      }
    };

    const startTimer = setTimeout(pollDashboard, 3000);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, []);

  const handleLogout = () => {
    const id = toast.loading("Logging out...");
    setAuthToken(null);
    clearTokenCookie();
    clearActiveEventCookie();
    safeClearFlowState();
    clearDashboardSnapshot();
    toast.success("Logged out", { id, duration: 900 });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Retry
            </button>
            <button onClick={handleLogout} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      userEmail={email}
      profile={profile}
      registration={registration}
      accommodation={accommodation}
      activeEventId={activeEventId}
      ownerRegId={ownerRegId}
      onLogout={handleLogout}
      onProfileUpdate={(p) => {
        setProfile(p);
        const eid = activeEventId ?? (registration?.eventId ?? null);
        if (eid) {
          setEventCache((prev) => {
            const existing = prev[eid];
            if (!existing) return prev;
            return { ...prev, [eid]: { ...existing, profile: p ?? existing.profile } };
          });
        }
      }}
      onRegistrationUpdate={(r) => {
        setRegistration(r);
        const eid = activeEventId ?? (r?.eventId ?? registration?.eventId ?? null);
        if (!eid) return;
        setActiveEventId(eid);
        setEventCache((prev) => {
          const existing = prev[eid];
          if (!existing) return prev;
          const nextRegs = r
            ? [r, ...existing.registrations.filter((x) => x !== r)]
            : existing.registrations;
          return { ...prev, [eid]: { ...existing, registrations: nextRegs } };
        });
      }}
      onAccommodationUpdate={(a) => {
        setAccommodation(a);
        const eid = activeEventId ?? (registration?.eventId ?? null);
        if (!eid) return;
        setEventCache((prev) => {
          const existing = prev[eid];
          if (!existing) return prev;
          const nextAcc = a
            ? [a, ...existing.accommodations.filter((x) => x !== a)]
            : existing.accommodations;
          return { ...prev, [eid]: { ...existing, accommodations: nextAcc } };
        });
      }}
    />
  );
}