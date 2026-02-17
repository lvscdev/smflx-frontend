"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/front-office/ui/Dashboard";
import { AUTH_USER_STORAGE_KEY, getAuthToken, getStoredUser, setAuthToken } from "@/lib/api/client";
import { clearTokenCookie, getActiveEventCookie, clearActiveEventCookie } from "@/lib/auth/session";
import { getMe, verifyToken, getUserDashboard, listMyRegistrations } from "@/lib/api";
import type { NormalizedDashboardResponse, UserProfile, DashboardRegistration, DashboardAccommodation } from "@/lib/api/dashboardTypes";
import { loadDashboardSnapshot, saveDashboardSnapshot, clearDashboardSnapshot } from "@/lib/storage/dashboardState";
import { readOtpCookie } from "@/lib/auth/otpCookie";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


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

function safeClearFlowState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FLOW_STATE_KEY);
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
  const [eventCache, setEventCache] = useState<Record<string, NormalizedDashboardResponse>>(
    {}
  );

  const didHandleMissingAttendeeTypeRef = useRef(false);

  useEffect(() => {
    async function boot() {
      const token = getAuthToken();

      let hasRegistrations = false;

      // 0) Fast hydrate from 7-day snapshot (multi-event ready)
      const snap = loadDashboardSnapshot();
      if (snap?.profile) {
        setProfile(snap.profile);

        const snapEmail = (snap.profile.email ?? "") as string;
        if (snapEmail) setEmail(snapEmail);
      }
      if (snap?.events && typeof snap.events === "object") {
        const entries = Object.entries(snap.events);
        if (entries.length > 0) {
          const preferred = snap.activeEventId ?? entries[0][0];
          if (preferred && String(preferred).trim()) {
            setActiveEventId(preferred);
          }

          // rebuild cache into normalized responses
          const rebuilt: Record<string, NormalizedDashboardResponse> = {};
          for (const [eid, ed] of entries) {
            rebuilt[eid] = {
              eventId: eid,
              profile: snap.profile ?? {},
              registrations: ed.registrations ?? [],
              accommodations: ed.accommodations ?? [],
              dependents: ed.dependents ?? [],
              paymentSummary: ed.paymentSummary ?? null,
            };
          }
          setEventCache(rebuilt);

          const active = rebuilt[preferred];
          if (active?.registrations?.length) setRegistration(active.registrations[0]);
          if (active?.accommodations?.length) setAccommodation(active.accommodations[0]);
          if (active?.registrations?.length) {
            const r0 = active.registrations[0];
            setSelectedEvent({
              eventId: r0.eventId ?? preferred,
              eventName: (r0.eventName ?? r0.eventTitle ?? "Event") as string,
            });
          }

          if (preferred && String(preferred).trim()) {
            setLoading(false);
          }
        }
      }

      // 1) No token: decide between new user vs returning user
      if (!token) {
        const otp = readOtpCookie();
        if (otp?.email) {
          router.replace(`/register?view=login&email=${encodeURIComponent(otp.email)}`);
          return;
        }

        if (hasAccountFootprint()) {
          router.replace("/register?view=login");
        } else {
          router.replace("/register");
        }
        return;
      }

      // 2) Token exists: validate it
      let storedUser: any = null;

      try {
        storedUser = getStoredUser();
      } catch {
        storedUser = null;
      }

      // Hydrate email/profile from local storage
      if (storedUser) {
        const storedEmail =
          storedUser?.email || storedUser?.user?.email || storedUser?.data?.email || "";

        if (storedEmail) setEmail(storedEmail);
        setProfile(storedUser);
      }


      try {
        await verifyToken();

        // Local references to freshly derived items (avoid relying on async React state)
        let regForEvent: any = null;
        let accForEvent: any = null;
        let normalizedRegForEvent: any = null;
        let localSelectedEvent: { eventId: string; eventName: string } | null = null;

        // 3) Fetch fresh profile from backend
        const me = await getMe();
        const mergedProfile = { ...(storedUser || {}), ...(me || {}) };
        setProfile(mergedProfile);

        const apiEmail = (me as any)?.email || "";
        if (apiEmail) setEmail(apiEmail);

        // 4) ✅ CRITICAL FIX: Fetch registrations FIRST to get valid eventId
        let eventId: string | null = null;
        let myRegistrations: any[] = [];
        let myRegIdForEvent: string | null = null;

        try {
          console.log("📋 Fetching user registrations...");
          myRegistrations = await listMyRegistrations();

          hasRegistrations = Array.isArray(myRegistrations) && myRegistrations.length > 0;

          const registrations = myRegistrations;

          if (!Array.isArray(registrations) || registrations.length === 0) {
            console.warn("⚠️ User has no event registrations");

            // Check if there's a saved flow state for incomplete registration
            const saved = safeLoadFlowState();
            if (saved?.view && saved.view !== "dashboard") {
              console.log("📍 Resuming incomplete registration flow");
              router.replace("/register");
              return;
            }

            // No registrations and no incomplete flow - redirect to event selection
            console.log("🔄 Redirecting to event selection (no registrations)");
            setError("You haven't registered for any events yet. Please select an event to continue.");
            setLoading(false);
            
            // Redirect after showing error briefly
            setTimeout(() => {
              router.replace("/register?view=event-selection");
            }, 2000);
            return;
          }

          const mostRecent = registrations[0];
          eventId = mostRecent.eventId;

          // Persist the owner regId for this event (used for dependents payment & registration)
          const matchForEvent = registrations.find((r: any) => r?.eventId === eventId) ?? mostRecent;
          myRegIdForEvent = matchForEvent?.regId ? String(matchForEvent.regId) : null;
          
          console.log("🔑 Registration ID (regId) for event:", {
            eventId,
            regId: myRegIdForEvent,
            registrationData: matchForEvent,
          });
          
          if (myRegIdForEvent) {
            setOwnerRegId(myRegIdForEvent); 
          } else {
            console.warn("⚠️ No regId found in registration data!");
            setOwnerRegId(null);
          }


          if (!eventId) {
            console.error("❌ Registration exists but has no eventId:", mostRecent);
            setError("Registration data is incomplete. Please contact support.");
            setLoading(false);
            return;
          }

          console.log(`✅ Found eventId from registrations: ${eventId}`);

          localSelectedEvent = {
            eventId: eventId,
            eventName: mostRecent.eventName || (mostRecent as any)?.eventTitle || "Event",
          };
          setSelectedEvent(localSelectedEvent);

        } catch (regErr: any) {
          console.error("❌ Failed to fetch registrations:", regErr);
          setError(regErr?.message || "Failed to load your registrations. Please try again.");
          setLoading(false);
          return;
        }

        // 5) ✅ Now fetch dashboard data with valid eventId
        if (eventId) {
          try {
            console.log(`📊 Fetching dashboard for eventId: ${eventId}`);
            const dashboardData = await getUserDashboard(eventId);

            setEventCache((prev) => ({ ...prev, [eventId!]: dashboardData }));
            setActiveEventId(eventId);

            // Pick the most relevant items for this event
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

          const savedFlow = safeLoadFlowState() || {};
          const savedReg = savedFlow?.registration || {};
          const recoveredAttendanceRaw =
            savedReg?.attendeeType ??
            savedReg?.participationMode ??
            savedReg?.attendanceType ??
            "";

          const effectiveAttendanceRaw = String(regAttendanceRaw || "").trim()
            ? regAttendanceRaw
            : recoveredAttendanceRaw;

          if (!String(effectiveAttendanceRaw || "").trim()) {
            if (!didHandleMissingAttendeeTypeRef.current) {
              didHandleMissingAttendeeTypeRef.current = true;
              try {
                const key = `smflx_missing_attendee_type_warned_${eventId}`;
                const already = sessionStorage.getItem(key);
                if (!already) {
                  sessionStorage.setItem(key, "1");
                  toast.error("Registration incomplete", {
                    description:
                      "Missing attendee type. Please complete your registration to continue.",
                  });
                }
              } catch {
                // ignore sessionStorage
              }
            }

            router.replace("/register?view=event-registration");
            return;
          }

          const isCamper = String(effectiveAttendanceRaw).toLowerCase().includes("camp");

          const normalizedRegistration = {
            ...(regForEvent || {}),
            // Ensure regId is present (backend requires it for dependents flows)
            regId: (regForEvent as any)?.regId ?? myRegIdForEvent ?? (regForEvent as any)?.registrationId ?? (regForEvent as any)?.id,
            attendeeType:
              (regForEvent as any)?.attendeeType ??
              (regForEvent as any)?.attendanceType ??
              (regForEvent as any)?.participationMode ??
              (regForEvent as any)?.participation ??
              recoveredAttendanceRaw ??
              "",
          };

            // IMPROVED: Better accommodation matching - multiple strategies
            accForEvent = null;

            // Strategy 1: Match by eventId
            if (dashboardData.accommodations.length > 0) {
              accForEvent =
                dashboardData.accommodations.find((a) => a.eventId === eventId) ?? null;
            }

            // Strategy 2: If only one accommodation exists, use it (single-event user)
            if (!accForEvent && dashboardData.accommodations.length === 1) {
              accForEvent = dashboardData.accommodations[0];
              console.log("✅ Using single accommodation for camper");
            }

            // Strategy 3: If user is camper and has any accommodation, use first one
            const participationMode = (regForEvent as any)?.participationMode;
            const attendeeType = (regForEvent as any)?.attendeeType;

            if (!accForEvent && isCamper && dashboardData.accommodations.length > 0) {
              accForEvent = dashboardData.accommodations[0];
              console.log("✅ Using first accommodation for camper (no eventId match)");
            }

            setRegistration(normalizedRegistration);
            normalizedRegForEvent = normalizedRegistration;
            setAccommodation(accForEvent);

            // Debug logging for campers without accommodation
            if (isCamper && !accForEvent) {
              console.warn("⚠️ Camper registration but no accommodation found:", {
                eventId,
                registrationId: regForEvent?.registrationId,
                participationMode,
                attendeeType,
                accommodationsCount: dashboardData.accommodations.length,
                accommodations: dashboardData.accommodations,
              });
            }

            if (regForEvent) {
              localSelectedEvent = {
                eventId: (regForEvent.eventId || eventId) as string,
                eventName: (regForEvent.eventName ||
                  regForEvent.eventTitle ||
                  "Event") as string,
              };
              if (!selectedEvent) setSelectedEvent(localSelectedEvent);
            }

            // Persist multi-event snapshot (7-day resume)
            saveDashboardSnapshot(eventId, mergedProfile as unknown as UserProfile, dashboardData);
            
            console.log("✅ Dashboard data loaded successfully");
          } catch (dashErr: any) {
            console.error("❌ Failed to fetch dashboard data:", dashErr);
            setError(dashErr?.message || "Failed to load dashboard. Please try again.");
          }
        }

        // Persist to flow state (do NOT let stale saved state override current event data)
        const saved0 = safeLoadFlowState() || {};
        const sameEvent = (saved0?.activeEventId && eventId) ? String(saved0.activeEventId) === String(eventId) : true;

        safeSaveFlowState({
          ...saved0,
          view: "dashboard",
          email: apiEmail || (storedUser?.email ?? saved0?.email ?? ""),
          profile: mergedProfile,
          ownerRegId: ownerRegId || myRegIdForEvent || saved0?.ownerRegId || (mergedProfile as any)?.userId || null,
          selectedEvent: localSelectedEvent || selectedEvent || saved0?.selectedEvent,
          registration: (normalizedRegForEvent ?? regForEvent) || (sameEvent ? saved0?.registration : null),
          accommodation: accForEvent || (sameEvent ? saved0?.accommodation : null),
          activeEventId: eventId || activeEventId || saved0?.activeEventId,
        });

      } catch (err: any) {
        console.error("❌ Auth verification failed:", err);
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
        // Other errors: show error but keep user on page
        setError(err?.message || "Failed to verify your session. Please try again.");
      }

      // 3) Token valid: only resume a saved non-dashboard flow if the user has NO registrations yet.
      // Returning users often have stale local flow state which would otherwise cause a redirect loop.
      const saved = safeLoadFlowState();
      if (!hasRegistrations && saved?.view && saved.view !== "dashboard") {
        router.replace("/register");
        return;
      }

      // 4) Otherwise hydrate from saved dashboard context (if any) WITHOUT overwriting fresh state.
      if (saved) {
        setEmail((prev) => prev || saved.email || "");
        setProfile((prev) => prev ?? (saved.profile ?? null));
        setRegistration((prev) => prev ?? (saved.registration ?? null));
        setAccommodation((prev) => prev ?? (saved.accommodation ?? null));
        setSelectedEvent((prev) => prev ?? (saved.selectedEvent ?? null));
        if (!activeEventId && saved.activeEventId) setActiveEventId(saved.activeEventId);
      }

  setLoading(false);
(false);
}

boot();
}, [router]);


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
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
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
        if (eid) saveDashboardSnapshot(eid, p, eventCache[eid] ?? null);
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
          const next = { ...existing, registrations: nextRegs };
          saveDashboardSnapshot(eid, profile, next);
          return { ...prev, [eid]: next };
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
          const next = { ...existing, accommodations: nextAcc };
          saveDashboardSnapshot(eid, profile, next);
          return { ...prev, [eid]: next };
        });
      }}
    />
  );
  }