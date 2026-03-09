"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_USER_STORAGE_KEY, getAuthToken, getStoredUser, setAuthToken } from "@/lib/api/client";
import { clearTokenCookie, clearActiveEventCookie, setActiveEventCookie } from "@/lib/auth/session";
import { getMe, verifyToken, getUserDashboard, listMyRegistrations } from "@/lib/api";
import type { UserProfile, DashboardRegistration, DashboardAccommodation } from "@/lib/api/dashboardTypes";
import { clearDashboardSnapshot } from "@/lib/storage/dashboardState";
import { readOtpCookie } from "@/lib/auth/otpCookie";
import { toast } from "sonner";
import { cleanLegacyKeys, safeLoadFlowState, safeSaveFlowState, safeClearFlowState } from "@/lib/constants/flowState";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardBootState {
  loading: boolean;
  error: string | null;
  email: string;
  profile: UserProfile | null;
  ownerRegId: string | null;
  registration: DashboardRegistration | null;
  accommodation: DashboardAccommodation | null;
  activeEventId: string | null;
  setEmail: (v: string) => void;
  setProfile: (v: UserProfile | null) => void;
  setOwnerRegId: (v: string | null) => void;
  setRegistration: (v: DashboardRegistration | null) => void;
  setAccommodation: (v: DashboardAccommodation | null) => void;
  setActiveEventId: (v: string | null) => void;
  handleLogout: () => void;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function hasAccountFootprint(): boolean {
  try {
    return !!localStorage.getItem(AUTH_USER_STORAGE_KEY);
  } catch {
    return false;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardBoot(): DashboardBootState {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ownerRegId, setOwnerRegId] = useState<string | null>(null);
  const [registration, setRegistration] = useState<DashboardRegistration | null>(null);
  const [accommodation, setAccommodation] = useState<DashboardAccommodation | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const didHandleMissingAttendeeTypeRef = useRef(false);
  const bootRanRef = useRef(false);

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
        setProfile((prev: UserProfile | null) => prev ?? storedUser);
      }

      try {
        await verifyToken();

        let regForEvent: any = null;
        let accForEvent: any = null;
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

  return {
    loading,
    error,
    email,
    profile,
    ownerRegId,
    registration,
    accommodation,
    activeEventId,
    setEmail,
    setProfile,
    setOwnerRegId,
    setRegistration,
    setAccommodation,
    setActiveEventId,
    handleLogout,
  };
}