"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/front-office/ui/Dashboard";
import {
  AUTH_USER_STORAGE_KEY,
  getAuthToken,
  getStoredUser,
  setAuthToken,
} from "@/lib/api/client";
import { clearTokenCookie } from "@/lib/auth/session";
import { getMe, verifyToken, getUserDashboard, listMyRegistrations } from "@/lib/api";
import type {
  NormalizedDashboardResponse,
  UserProfile,
  DashboardRegistration,
  DashboardAccommodation,
} from "@/lib/api/dashboardTypes";
import {
  loadDashboardSnapshot,
  saveDashboardSnapshot,
  clearDashboardSnapshot,
} from "@/lib/storage/dashboardState";
import { readOtpCookie } from "@/lib/auth/otpCookie";
import { Loader2 } from "lucide-react";

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

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  useEffect(() => {
    async function boot() {
      const token = getAuthToken();

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
          setActiveEventId(preferred);

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

          // Show dashboard immediately; refresh will run below
          setLoading(false);
        }
      }

      // 1) No token: decide between new user vs returning user
      if (!token) {
        const otp = readOtpCookie();
        if (otp?.email) {
          router.replace(`/returning-user?email=${encodeURIComponent(otp.email)}`);
          return;
        }

        if (hasAccountFootprint()) {
          router.replace("/returning-user");
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
        // NOTE: These must live in this scope because we persist them to flow state later.
        let regForEvent: any = null;
        let accForEvent: any = null;
        let localSelectedEvent: { eventId: string; eventName: string } | null = null;

        // Fetch fresh profile from backend
        const me = await getMe();
        const mergedProfile = { ...(storedUser || {}), ...(me || {}) };
        setProfile(mergedProfile);

        const apiEmail = (me as any)?.email || "";
        if (apiEmail) setEmail(apiEmail);

        // Get eventId from flow state or fetch from registrations
        const saved0 = safeLoadFlowState() || {};
        let eventId = saved0?.selectedEvent?.eventId || saved0?.registration?.eventId;

        // If no eventId in flow state, fetch from user's registrations
        if (!eventId) {
          try {
            const registrations = await listMyRegistrations();

            if (Array.isArray(registrations) && registrations.length > 0) {
              const mostRecent = registrations[0];
              eventId = mostRecent.eventId;
              localSelectedEvent = {
                eventId: mostRecent.eventId,
                eventName: mostRecent.eventName || "Event",
              };
              setSelectedEvent(localSelectedEvent);
            }
          } catch (err) {
            console.error("Failed to fetch registrations:", err);
          }
        } else {
          // Load selectedEvent from saved state
          if (saved0?.selectedEvent) {
            localSelectedEvent = saved0.selectedEvent;
            setSelectedEvent(saved0.selectedEvent);
          }
        }

        // Fetch dashboard data if we have an eventId
        if (eventId) {
          try {
            const dashboardData = await getUserDashboard(eventId);

            setEventCache((prev) => ({ ...prev, [eventId]: dashboardData }));
            setActiveEventId(eventId);

            // Pick the most relevant items for this event
            regForEvent =
              dashboardData.registrations.find((r) => r.eventId === eventId) ??
              dashboardData.registrations[0] ??
              null;

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
            const isCamper =
              participationMode?.toUpperCase() === "CAMPER" ||
              attendeeType?.toLowerCase() === "camper";

            if (!accForEvent && isCamper && dashboardData.accommodations.length > 0) {
              accForEvent = dashboardData.accommodations[0];
              console.log("✅ Using first accommodation for camper (no eventId match)");
            }

            setRegistration(regForEvent);
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
          } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            // Continue without dashboard data - user can still see profile
          }
        }

        // Persist to flow state
        safeSaveFlowState({
          ...saved0,
          view: "dashboard",
          email: apiEmail || (storedUser?.email ?? saved0?.email ?? ""),
          profile: mergedProfile,
          selectedEvent: localSelectedEvent || selectedEvent || saved0?.selectedEvent,
          registration: regForEvent || saved0?.registration,
          accommodation: accForEvent || saved0?.accommodation,
          activeEventId: activeEventId || saved0?.activeEventId,
        });
      } catch (err: any) {
        const status = err?.status;
        if (status === 401 || status === 403) {
          setAuthToken(null);
          clearTokenCookie();
          safeClearFlowState();
          clearDashboardSnapshot();
          router.replace("/returning-user");
          return;
        }
        // Other errors: keep going, dashboard can show its own errors
      }

      // 3) Token valid: if there's a saved flow state that isn't dashboard, resume it
      const saved = safeLoadFlowState();
      if (saved?.view && saved.view !== "dashboard") {
        router.replace("/register");
        return;
      }

      // 4) Otherwise load saved dashboard context (if any)
      if (saved) {
        setEmail(saved.email || "");
        setProfile(saved.profile ?? null);
        setRegistration(saved.registration ?? null);
        setAccommodation(saved.accommodation ?? null);
        setSelectedEvent(saved.selectedEvent ?? null);
      }

      setLoading(false);
    }

    boot();
  }, [router]);

  const handleLogout = () => {
    setAuthToken(null);
    clearTokenCookie();
    safeClearFlowState();
    clearDashboardSnapshot();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Dashboard
      userEmail={email}
      profile={profile}
      registration={registration}
      accommodation={accommodation}
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
