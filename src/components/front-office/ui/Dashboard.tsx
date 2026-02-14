"use client";

import type { Dependent as ModalDependent } from "./DependentsModal";
import { useState, useEffect, useRef, useMemo, type ComponentProps } from "react";
import { Home, Tent, User, LogOut, X, Building2, Hotel, Users, Facebook, Instagram, Twitter, Youtube, Radio, Loader2, RefreshCcw } from "lucide-react";
import { InlineAlert } from "./InlineAlert";
import Image from "next/image";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AccommodationSelection } from "./AccommodationSelection";
import { DependentsBanner } from "./DependentsBanner";
import { DependentsModal } from "./DependentsModal";
import { DependentsPaymentModal } from "./DependentsPaymentModal";
import { DependentsSection } from "./DependentsSection";
import { DependentRegistrationSuccess } from "./DependentRegistrationSuccess";
import { UserProfile as UserProfileView } from "./UserProfile";
import { getUserDashboard, addDependent as apiAddDependent, addDependants as apiAddDependants, removeDependent as apiRemoveDependent, getAccommodations } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import type { NormalizedDashboardResponse, UserProfile, DashboardRegistration, DashboardAccommodation, DashboardDependent } from "@/lib/api/dashboardTypes";

const eventBgImage = "/assets/images/event-bg.png";
const badgeImage = "/assets/images/badge.png";
const logoImage = "/assets/images/logo.png";

const getEventId = (registration: unknown): string | undefined => {
  if (typeof registration !== "object" || registration === null) return undefined;

  const reg = registration as Record<string, unknown>;

  if ("eventId" in reg && reg.eventId != null) return String(reg.eventId);

  const evt = reg.event;
  if (typeof evt === "object" && evt !== null) {
    const e = evt as Record<string, unknown>;
    if ("eventId" in e && e.eventId != null) return String(e.eventId);
  }

  return undefined;
};

type Dependent = {
  id: string;
  name: string;
  age: string;
  gender: string;
  isRegistered: boolean;
  isPaid: boolean;
};

const toDependent = (d: DashboardDependent): Dependent => {
  const rec = d as unknown as Record<string, unknown>;

  const id =
    typeof rec.id === "string" && rec.id
      ? rec.id
      : typeof rec.dependantId === "string" && rec.dependantId
        ? rec.dependantId
        : typeof rec.dependentId === "string" && rec.dependentId
          ? rec.dependentId
          : crypto.randomUUID();

  const rawName =
    typeof rec.name === "string" && rec.name ? rec.name :
    typeof rec.fullName === "string" ? rec.fullName :
    typeof rec.dependentName === "string" ? rec.dependentName :
    typeof rec.dependantName === "string" ? rec.dependantName :
    "Dependent";

  const name = rawName.trim() ? rawName.trim() : "Dependent";

  const ageVal = rec.age ?? rec.dependantAge ?? rec.dependentAge;
  const age =
    typeof ageVal === "number" ? String(ageVal) :
    typeof ageVal === "string" ? ageVal.trim() :
    "";

  const genderVal = rec.gender ?? rec.dependantGender ?? rec.dependentGender;
  const gender = typeof genderVal === "string" ? genderVal : "";
  
  const isRegistered = typeof rec.isRegistered === "boolean" ? rec.isRegistered : true; // Assume registered if from API

  const isPaid =
    typeof rec.isPaid === "boolean" ? rec.isPaid :
    rec.paymentStatus === "PAID";

  return { id, name, age, gender, isRegistered, isPaid };
};

const getRegId = (registration: unknown): string | undefined => {
  if (typeof registration !== "object" || registration === null) return undefined;

  const reg = registration as Record<string, unknown>;

  // Most common on dashboard payload
  if ("regId" in reg && reg.regId != null) return String(reg.regId);

  // Some backends might use id / registrationId
  if ("registrationId" in reg && reg.registrationId != null) return String(reg.registrationId);
  if ("id" in reg && reg.id != null) return String(reg.id);

  return undefined;
};

const getOwnerRegId = (profile: unknown): string | undefined => {
  if (typeof profile !== "object" || profile === null) return undefined;
  const p = profile as Record<string, unknown>;

  if ("regId" in p && p.regId != null) return String(p.regId);
  if ("registrationId" in p && p.registrationId != null) return String(p.registrationId);

  return undefined;
};

function normalizeAttendeeType(reg: any): "camper" | "physical" | "online" | undefined {
  const raw = reg?.attendeeType ?? reg?.attendanceType ?? reg?.participationMode;
  if (!raw) return undefined;
  const val = String(raw).toLowerCase();
  if (val.includes("camp")) return "camper";
  if (val.includes("online")) return "online";
  return "physical";
}

function normalizeAccommodation(acc: any) {
  if (!acc) return null;
  const status = String(acc?.status ?? acc?.paymentStatus ?? "").toLowerCase();
  const paid =
    acc?.paidForAccommodation === true ||
    acc?.isPaid === true ||
    status === "paid" ||
    status === "success" ||
    status.includes("paid");

  return {
    ...acc,
    bed: acc?.bed ?? acc?.bedspace ?? acc?.bedSpace ?? acc?.bed_space ?? null,
    paidForAccommodation: paid,
  };
}

interface DashboardProps {
  userEmail: string;
  profile: UserProfile | null;
  registration: DashboardRegistration | null;
  accommodation: DashboardAccommodation | null;
  activeEventId?: string | null;
  ownerRegId?: string | null;
  onLogout: () => void;
  onAccommodationUpdate?: (data: DashboardAccommodation | null) => void;
  onRegistrationUpdate?: (data: DashboardRegistration | null) => void;
  onProfileUpdate?: (data: UserProfile | null) => void;
}

export function Dashboard({
  userEmail,
  profile,
  registration,
  accommodation,
  activeEventId,
  ownerRegId,
  onLogout,
  onAccommodationUpdate,
  onRegistrationUpdate,
  onProfileUpdate,
}: DashboardProps) {

  const resolvedEventId = (() => {
    if (activeEventId) return activeEventId;

    if (registration?.eventId) return registration.eventId;

    try {
      const flowRaw =
        localStorage.getItem("smflx_flow_state_v1") ||
        localStorage.getItem("smflx_flow_state") ||
        localStorage.getItem("flowState");

      if (flowRaw) {
        const flow = JSON.parse(flowRaw);
        const fromFlow =
          flow?.selectedEvent?.eventId ||
          flow?.event?.eventId ||
          flow?.eventId;

        if (fromFlow) return fromFlow;
      }
    } catch {
      // ignore corrupted storage
    }

    // Legacy fallback
    try {
      const legacy = localStorage.getItem("smflx_selected_event");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed?.eventId) return parsed.eventId;
      }
    } catch {
      // ignore
    }

    return undefined;
  })();

  const resolvedRegId = useMemo(() => {
    // Priority 1: ownerRegId prop (passed from dashboard page, extracted from /registrations/my-registrations)
    if (ownerRegId) {
      return ownerRegId;
    }
    
    // Priority 2: Get from registration object
    const regIdFromRegistration = getRegId(registration);
    if (regIdFromRegistration) {
      return regIdFromRegistration;
    }
    
    // Priority 3: Check profile for regId field (some backends might store it here)
    const p: any = profile as any;
    if (p?.regId) {
      return String(p.regId);
    }
    
    // ❌ DO NOT use userId as regId - they are different!
    // If we reach here, we don't have a valid regId
    return undefined;
  }, [ownerRegId, registration, profile]);

  // Log regId resolution only when it changes
  useEffect(() => {
    if (resolvedRegId) {
      console.log("✅ Resolved regId:", resolvedRegId);
    } else {
      console.error("❌ NO VALID regId FOUND!", {
        ownerRegId,
        registrationHasRegId: !!getRegId(registration),
        registration,
        profileHasRegId: !!((profile as any)?.regId),
        profile,
        WARNING: "This will cause dependent registration to fail!"
      });
    }
  }, [resolvedRegId]);

// Avatar dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeDashboardPage, setActiveDashboardPage] = useState<
    "dashboard" | "user-profile"
  >("dashboard");
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(profile);

  const [dashboardLoadError, setDashboardLoadError] = useState<string | null>(
    null,
  );

  const [dashboardHydrating, setDashboardHydrating] = useState(false);

  const reloadDashboard = async (): Promise<NormalizedDashboardResponse | null> => {
    setDashboardHydrating(true);
    setDashboardLoadError(null);

    // Resolve eventId (registration → flow state → legacy)
    const resolvedEventId: string | undefined = (() => {
      if (registration?.eventId) return registration.eventId;
      if (typeof window === "undefined") return undefined;

      try {
        const flowRaw =
          localStorage.getItem("smflx_flow_state_v1") ||
          localStorage.getItem("smflx_flow_state") ||
          localStorage.getItem("flowState");
        if (flowRaw) {
          const flow = JSON.parse(flowRaw) as unknown;
          if (flow && typeof flow === "object") {
            const f = flow as Record<string, unknown>;
            const selectedEvent = f["selectedEvent"] as unknown;
            if (selectedEvent && typeof selectedEvent === "object") {
              const se = selectedEvent as Record<string, unknown>;
              const id = se["eventId"];
              if (typeof id === "string" && id) return id;
            }
            const rid = f["eventId"];
            if (typeof rid === "string" && rid) return rid;
          }
        }
      } catch {
        // ignore
      }

      try {
        const legacy = localStorage.getItem("smflx_selected_event");
        if (legacy) {
          const parsed = JSON.parse(legacy) as unknown;
          if (parsed && typeof parsed === "object") {
            const p = parsed as Record<string, unknown>;
            const id = p["eventId"];
            if (typeof id === "string" && id) return id;
          }
        }
      } catch {
        // ignore
      }

      return undefined;
    })();

    if (!resolvedEventId) {
      setDashboardLoadError(
        "We couldn’t determine the active event. Please refresh or reselect your event."
      );
      setDashboardHydrating(false);
      return null;
    }

    try {
      const data = await getUserDashboard(resolvedEventId);

      const nextDependents: ModalDependent[] = data.dependents.map((d: DashboardDependent) => {
        const id = (typeof d.id === "string" && d.id) ? d.id :
                   (typeof d.dependantId === "string" && d.dependantId) ? d.dependantId :
                   (typeof d.dependentId === "string" && d.dependentId) ? d.dependentId :
                   crypto.randomUUID();
        
        const ageRaw = d.age ?? (d as any).dependantAge ?? (d as any).dependentAge;
        const ageNum =
          typeof ageRaw === "number" ? ageRaw :
          typeof ageRaw === "string" ? Number(ageRaw) :
          undefined;

        const genderRaw = d.gender ?? (d as any).dependantGender ?? (d as any).dependentGender;
        const gender = typeof genderRaw === "string" ? genderRaw : "";
        
        const nameRaw = d.name ?? (d as any).dependantName ?? (d as any).dependentName;

        return {
          id,
          name: typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : "Dependent",
          age: Number.isFinite(ageNum as number) ? String(ageNum as number) : "",
          gender,
          isRegistered: typeof d.isRegistered === "boolean" ? d.isRegistered : true, // Assume registered if from API
          isPaid: typeof d.isPaid === "boolean" ? d.isPaid : (d.paymentStatus === "PAID"),
        };
      });
      setDependents(nextDependents);

      // Profile (normalized)
      setLocalProfile(data.profile);
      onProfileUpdate?.(data.profile);

      // Select event-specific registration/accommodation if arrays include multiple events
      const regForEvent =
        data.registrations.find((r) => r.eventId === resolvedEventId) ??
        data.registrations[0] ??
        null;

      const accForEvent =
        data.accommodations.find((a) => a.eventId === resolvedEventId) ??
        data.accommodations[0] ??
        null;

      onRegistrationUpdate?.(regForEvent);
      onAccommodationUpdate?.(accForEvent);

      return data;
    } catch (err: unknown) {
      setDashboardLoadError(toUserMessage(err, { feature: "generic" }));
      return null;
    } finally {
      setDashboardHydrating(false);
    }
  };

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);
// Accommodation modal state
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] =
    useState(false);
  const [modalStep, setModalStep] = useState(1); 
  const [selectedAccommodationType, setSelectedAccommodationType] =
    useState("");

  const [availabilitySummary, setAvailabilitySummary] = useState<{
    loading: boolean;
    hostel?: { availableFacilities: number; totalCapacity: number };
    hotel?: { availableFacilities: number; totalCapacity: number };
    error?: string | null;
  }>({ loading: false, error: null });

  useEffect(() => {
    const eventId = registration?.eventId;
    if (!isAccommodationModalOpen || modalStep !== 1 || !eventId) return;

    let cancelled = false;
    (async () => {
      setAvailabilitySummary((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));
      try {
        const [hostel, hotel] = await Promise.all([
          getAccommodations({ eventId, type: "HOSTEL" }).catch(() => ({
            facilities: [],
          })),
          getAccommodations({ eventId, type: "HOTEL" }).catch(() => ({
            facilities: [],
          })),
        ]);

        if (cancelled) return;

      type FacilityLike = {
        availableSpaces?: number | string | null;
        totalSpaces?: number | string | null;
        totalCapacity?: number | string | null;
      };

      const summarize = (items: FacilityLike[]) => {
        const availableFacilities = items.filter((i) => {
          const avail = Number(i?.availableSpaces ?? 0) || 0;
          return avail > 0;
        }).length;

        const totalCapacity = items.reduce((sum, i) => {
          // prefer totalSpaces, else totalCapacity, else availableSpaces
          const cap =
            Number(i?.totalSpaces ?? i?.totalCapacity ?? i?.availableSpaces ?? 0) ||
            0;
          return sum + cap;
        }, 0);

        return { availableFacilities, totalCapacity };
      };

        setAvailabilitySummary({
          loading: false,
          hostel: summarize((hostel)?.facilities || []),
          hotel: summarize((hotel)?.facilities || []),
          error: null,
        });
      } catch (err: unknown) {
        if (cancelled) return;
        setAvailabilitySummary({
          loading: false,
          error: toUserMessage(err, { feature: "generic" }),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAccommodationModalOpen, modalStep, registration?.eventId]);

  // Dependents state
  type Dependent = {
  id: string;
  name: string;
  age: string;
  gender: string;
  isRegistered: boolean;
  isPaid: boolean;
};

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : typeof err === "string" ? err : fallback;

const asString = (v: unknown) => (typeof v === "string" ? v : "");


type AccommodationData = Parameters<
  NonNullable<ComponentProps<typeof AccommodationSelection>["onComplete"]>
>[0];


  const [dependents, setDependents] = useState<ModalDependent[]>(() => []);
  const [removingDependentId, setRemovingDependentId] = useState<string | null>(
    null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [dependentToDelete, setDependentToDelete] = useState<ModalDependent | null>(null);
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [isDependentsPaymentModalOpen, setIsDependentsPaymentModalOpen] =
    useState(false);
  const [selectedDependentsForPayment, setSelectedDependentsForPayment] =
    useState<ModalDependent[]>([]);
  const [isRegistrationSuccessModalOpen, setIsRegistrationSuccessModalOpen] =
    useState(false);
  const [registeredDependentName, setRegisteredDependentName] = useState("");
// Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(
        process.env.NEXT_PUBLIC_EVENT_START_DATE || "2026-04-30T00:00:00",
      ).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Load dependents on mount and when event changes
  useEffect(() => {
    let cancelled = false;
    
    const loadInitialDependents = async () => {
      const eventId = activeEventId ?? resolvedEventId;
      if (!eventId) return;

      try {
        const data = await getUserDashboard(eventId);
        if (!cancelled) {
          const deps = (data.dependents || []).map((d) => toDependent(d));
          setDependents(deps);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load dependents:", err);
        }
      }
    };

    void loadInitialDependents();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventId]); 

  const firstName =
    (localProfile?.firstName ?? "User");

  const attendeeType = normalizeAttendeeType(registration);
  const attendeeTypeNorm = (typeof attendeeType === "string" ? attendeeType.toLowerCase() : "");
  const isCamper = attendeeTypeNorm === "" || attendeeTypeNorm === "camper";
  const normalizedAccommodation = useMemo(
    () => normalizeAccommodation(accommodation),
    [accommodation],
  );
  
  const accAny = normalizedAccommodation as any;

  const accommodationFacilityName: string =
    (accAny?.room?.facilityName as string) ||
    (accAny?.facilityName as string) ||
    (accAny?.facility as string) ||
    "";

  const accommodationRoomLabel: string =
    (accAny?.room?.roomIdentifier as string) ||
    (accAny?.room?.roomCode as string) ||
    (accAny?.roomIdentifier as string) ||
    (accAny?.roomCode as string) ||
    "";

  const accommodationBedspaceLabel: string =
    (accAny?.bedspace?.bedspaceName as string) ||
    (accAny?.bedspaceName as string) ||
    (typeof accAny?.bed === "string" ? (accAny?.bed as string) : "") ||
    "";

  const accommodationImageUrl: string =
    (accAny?.accommodationImageUrl as string) ||
    (accAny?.imageUrl as string) ||
    "";
const isNonCamper = attendeeTypeNorm === "physical" || attendeeTypeNorm === "online";
  const paidForAccommodation = normalizedAccommodation?.paidForAccommodation === true;

  // Camper: when accommodation payment is pending, the space is held for 1 hour.
  const [accommodationHold, setAccommodationHold] = useState<{
    startedAtMs: number | null;
    expiresAtMs: number | null;
    remainingMs: number | null;
    expired: boolean;
  }>({ startedAtMs: null, expiresAtMs: null, remainingMs: null, expired: false });

  // Avoid effect-dependency churn when parent passes a new function identity each render.
  const onAccommodationUpdateRef = useRef(onAccommodationUpdate);
  useEffect(() => {
    onAccommodationUpdateRef.current = onAccommodationUpdate;
  }, [onAccommodationUpdate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isCamperLocal = isCamper;
    const hasPendingAccommodation = !!normalizedAccommodation && !paidForAccommodation;

    // If not in a pending accommodation state, clear countdown state.
    if (!isCamperLocal || !hasPendingAccommodation) {
      // Only update state if it isn't already cleared to avoid render loops.
      setAccommodationHold((prev) => {
        if (
          prev.startedAtMs === null &&
          prev.expiresAtMs === null &&
          prev.remainingMs === null &&
          prev.expired === false
        ) {
          return prev;
        }
        return {
          startedAtMs: null,
          expiresAtMs: null,
          remainingMs: null,
          expired: false,
        };
      });

      // If payment becomes confirmed, clear markers.
      if (paidForAccommodation) {
        try {
          localStorage.removeItem("smflx_pending_accommodation_payment");
          localStorage.removeItem("smflx_pending_accommodation_payment_started_at");
        } catch {
          // ignore
        }
      }
      return;
    }

    const HOLD_MS = 60 * 60 * 1000;

    const readStartedAt = (): number | null => {
      try {
        const raw = localStorage.getItem("smflx_pending_accommodation_payment_started_at");
        const n = raw ? Number(raw) : NaN;
        if (Number.isFinite(n) && n > 0) return n;
      } catch {
        // ignore
      }
      return null;
    };

    const ensureStartedAt = (): number => {
      const existing = readStartedAt();
      if (existing) return existing;

      // Fallback for older flows that only saved the pending flag.
      const now = Date.now();
      try {
        const pending = localStorage.getItem("smflx_pending_accommodation_payment");
        if (pending === "1") {
          localStorage.setItem(
            "smflx_pending_accommodation_payment_started_at",
            String(now),
          );
        }
      } catch {
        // ignore
      }
      return now;
    };

    const startedAtMs = ensureStartedAt();
    const expiresAtMs = startedAtMs + HOLD_MS;

    let handledExpire = false;

    const tick = () => {
      const remainingMs = Math.max(0, expiresAtMs - Date.now());
      const expired = remainingMs <= 0;

      setAccommodationHold((prev) => {
        if (
          prev.startedAtMs === startedAtMs &&
          prev.expiresAtMs === expiresAtMs &&
          prev.remainingMs === remainingMs &&
          prev.expired === expired
        ) {
          return prev;
        }
        return { startedAtMs, expiresAtMs, remainingMs, expired };
      });

      if (!expired || handledExpire) return;

      handledExpire = true;

      // Hold expired: clear markers and switch UI back to “Book Accommodation”.
      try {
        localStorage.removeItem("smflx_pending_accommodation_payment");
        localStorage.removeItem("smflx_pending_accommodation_payment_started_at");

        // Clear saved accommodation snapshot so the promo card matches “book again”.
        const raw =
          localStorage.getItem("smflx_flow_state_v1") ||
          localStorage.getItem("smflx_flow_state") ||
          localStorage.getItem("flowState");
        if (raw) {
          const flow = JSON.parse(raw) as Record<string, unknown>;
          const next = { ...flow, accommodation: null };
          // Prefer the v1 key if it exists; otherwise fall back.
          if (localStorage.getItem("smflx_flow_state_v1")) {
            localStorage.setItem("smflx_flow_state_v1", JSON.stringify(next));
          } else {
            localStorage.setItem("smflx_flow_state", JSON.stringify(next));
          }
        }
      } catch {
        // ignore
      }

      onAccommodationUpdateRef.current?.(null);
        };

        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
      }, [attendeeType, Boolean(normalizedAccommodation), paidForAccommodation]);

      const accommodationHoldExpired = accommodationHold.expired;
      const accommodationHoldRemainingMs = accommodationHold.remainingMs;

      const formatHoldRemaining = (ms: number | null) => {
        if (ms == null) return "";
        const totalSec = Math.max(0, Math.ceil(ms / 1000));
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}m ${s}s`;
      };

      const acc = normalizedAccommodation;

      const facilityName =
        acc?.room?.facilityName ||
        (acc as any)?.facilityName ||
        (acc as any)?.facility ||
        "";

      const roomLabel =
        acc?.room?.roomIdentifier ||
        acc?.room?.roomCode ||
        (acc as any)?.room?.roomIdentifier ||
        (acc as any)?.room?.roomCode ||
        (acc as any)?.room ||
        "";

      const accommodationTypeLabel =
        acc?.accommodationType || (acc as any)?.accommodationType || "";

      const paidAmount =
        typeof acc?.amountPaidForAccommodation === "number"
          ? acc.amountPaidForAccommodation
          : Number((acc as any)?.amountPaidForAccommodation ?? (acc as any)?.amountPaid ?? 0) || 0;

      const imageUrl =
        (acc as any)?.accommodationImageUrl ||
        (acc as any)?.imageUrl ||
        "";


      // Non-campers can book accommodation. Campers see the same CTA when the 1-hour hold expires.
      const showAccommodationPromo =
        (isNonCamper && !normalizedAccommodation) ||
        (isCamper && accommodationHoldExpired);

      const handleAccommodationType = (type: string) => {
        setSelectedAccommodationType(type);
        setModalStep(2);
      };

      const handleAccommodationComplete = (data: AccommodationData) => {
        // Save selection snapshot for UI, then close modal.
        const snapshot: DashboardAccommodation = {
          accommodationType: data.type,
          facility: data.facilityId ?? "",
          room: data.roomId ?? "",
          bedspace: data.bedSpaceId ?? "",
          requiresAccommodation: true,
          paidForAccommodation: false,
        };

        onAccommodationUpdate?.(snapshot);
        resetModal();
      };


      const resetModal = () => {
        setIsAccommodationModalOpen(false);
        setModalStep(1);
        setSelectedAccommodationType("");
      };

      const handleModalClose = () => resetModal();

      const handleModalBack = () => {
        if (modalStep > 1) {
          setModalStep((s) => s - 1);
        } else {
          handleModalClose();
        }
      };

      // Check if there are unregistered dependents
      const hasUnregisteredDependents = dependents.some((d) => !d.isRegistered);

      const handleSaveDependents = async (updatedDependents: ModalDependent[]) => {
        // optimistic UI
        const prev = dependents;
        setDependents(updatedDependents as ModalDependent[]);

        // Stage 2: persist newly added dependents (no demo fallbacks)
        try {
          const eventId = activeEventId ?? resolvedEventId;
          const regId = resolvedRegId;
        if (!eventId) {
            throw new Error("Missing eventId: cannot save dependents.");
          }
          if (!regId) {
            console.error("❌ Missing regId. Available data:", {
              ownerRegId,
              registration,
              profile,
              resolvedRegId
            });
            throw new Error(
              "Missing registration ID (regId). This is different from your user ID. " +
              "Please ensure you have completed event registration first. " +
              "If you see this error, try refreshing the page or contact support."
            );
          }

          const prevIds = new Set(prev.map((d) => d.id));
          const toCreate = updatedDependents.filter((d) => !prevIds.has(d.id));

          const payloads = toCreate.map((d) => {
            const genderRaw = String(d?.gender ?? "MALE").toUpperCase();

            const normalizedGender: "MALE" | "FEMALE" =
              genderRaw === "FEMALE" ? "FEMALE" : "MALE";

            return {
              regId,
              eventId,
              name: d?.name,
              age: Number(d?.age || 0),
              gender: normalizedGender,
            };
          });

          console.log("📤 Saving dependents:", {
            count: payloads.length,
            payloads,
            eventId,
            regId
          });

          if (payloads.length === 1) {
            await apiAddDependent(payloads[0]);
          } else if (payloads.length > 1) {
            await apiAddDependants(payloads);
          }
          
          console.log("✅ Dependents saved successfully");
          
          // Reload dashboard to get fresh data
          await reloadDashboard();
        } catch (err: unknown) {
          // revert optimistic update and surface error
          setDependents(prev);
          console.error("❌ Failed to save dependents:", err);
          setDashboardLoadError(
            getErrorMessage(err, "Failed to save dependents. Please try again."),
          );
        }
      };

      const handleRemoveDependent = (dependentId: string) => {
        const dependent = dependents.find((d) => d.id === dependentId);
        if (!dependent) return;

        // Open confirmation dialog instead of window.confirm
        setDependentToDelete(dependent);
        setConfirmDeleteOpen(true);
      };

      const confirmRemoveDependent = async () => {
        if (!dependentToDelete) return;

        const dependentId = dependentToDelete.id;
        const dependentName = dependentToDelete.name;

        // Prevent double-click / parallel deletes
        if (removingDependentId) return;
        setRemovingDependentId(dependentId);

        const prev = dependents;
        setDependents((ds) => ds.filter((d) => d.id !== dependentId));

        try {
          await apiRemoveDependent(dependentId);

          // ✅ SUCCESS TOAST
          toast.success(`${dependentName} removed successfully`, {
            description: "The dependent has been removed from your registration.",
          });
        } catch (err: unknown) {
          setDependents(prev);
          const msg =
            getErrorMessage(err, `Failed to remove ${dependentName}. Please try again.`);
          setDashboardLoadError(msg);

          // Error toast
          toast.error("Failed to remove dependent", {
            description: msg,
          });
        } finally {
          setRemovingDependentId(null);
          setDependentToDelete(null);
        }
      };

    const handleRegisterDependent = async (id: string) => {
      const dependent = dependents.find((d) => d.id === id);
      if (!dependent) return;

      const updatedDependents = dependents.map((d) =>
        d.id === id ? { ...d, isRegistered: true } : d,
      );
      setDependents(updatedDependents);

      try {
        const eventId = activeEventId ?? resolvedEventId;
        const regId = resolvedRegId;
        if (!eventId) {
          throw new Error("Missing eventId");
        }
        if (!regId) {
          throw new Error("Missing regId");
        }

        await apiAddDependent({
          regId,
          eventId,
          name: dependent.name,
          age: Number(dependent.age) || 0,
          gender: (dependent.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE",
        });

        setRegisteredDependentName(dependent.name);
        setIsRegistrationSuccessModalOpen(true);

        await reloadDashboard();

      } catch (err: unknown) {
        setDependents(dependents);
        setDashboardLoadError(
          getErrorMessage(err, `Failed to register ${dependent.name}. Please try again.`)
        );
      }
    };

      const handlePayForDependents = (ids: string[]) => {
        const selected = dependents.filter((d) => ids.includes(d.id));
        setSelectedDependentsForPayment(selected);
        setIsDependentsPaymentModalOpen(true);
      };

      const handleRegisterAndPayDependents = (selected: ModalDependent[]) => {
        setSelectedDependentsForPayment(selected);
        const updatedDependents = dependents.map((d) =>
          selected.find((sd) => sd.id === d.id)
            ? { ...d, isRegistered: true }
            : d,
        );
        setDependents(updatedDependents);
        setIsDependentsModalOpen(false);
        setIsDependentsPaymentModalOpen(true);
      };

      const handleDependentsPaymentComplete = () => {
        const updatedDependents = dependents.map((d) =>
          selectedDependentsForPayment.find((sd) => sd.id === d.id)
            ? { ...d, isPaid: true }
            : d,
        );
        setDependents(updatedDependents);
        setSelectedDependentsForPayment([]);
        setIsDependentsPaymentModalOpen(false);
      };

      if (activeDashboardPage === "user-profile") {
        return (
          <UserProfileView
            profile={localProfile}
            userEmail={userEmail}
            userPhone={asString((localProfile as Record<string, unknown> | null | undefined)?.["phone"]) || asString(localProfile?.phoneNumber)}
            dependents={dependents}
            onBack={() => setActiveDashboardPage("dashboard")}
            onUpdate={(updated) => {
              setLocalProfile(updated);
              onProfileUpdate?.(updated);
            }}
            onUpdateDependents={(updated) => setDependents(updated)}
          />
        );
      }

  return (
    <div className="flex-1 overflow-auto bg-[#F5F1E8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Image
            src={logoImage}
            alt="SMFLX"
            width={120}
            height={40}
            className="h-8 lg:h-10 w-auto"
          />

          {/* Avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Image
                src="https://images.unsplash.com/photo-1615843423179-bea071facf96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
                alt="User Avatar"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setActiveDashboardPage("user-profile");
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    User Profile
                  </span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl text-gray-900 mb-1">
            Hello {firstName}
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your WOTH Camp Meeting 2026 registration and view event
            details
          </p>
        </div>

        {(dashboardLoadError || dashboardHydrating) && (
          <InlineAlert
            variant={dashboardLoadError ? "warning" : "info"}
            title={
              dashboardLoadError ? "Dashboard couldn’t refresh" : "Refreshing"
            }
            actionLabel="Retry"
            onAction={() => {
              if (!dashboardHydrating) void reloadDashboard();
            }}
            className="mb-6"
          >
            {dashboardLoadError
              ? dashboardLoadError
              : "Refreshing your dashboard…"}
          </InlineAlert>
        )}

        <DependentsBanner
          hasDependents={dependents.length > 0}
          onManageDependents={() => setIsDependentsModalOpen(true)}
        />

        
        {/* Top grid */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Event card */}
          <div
            className="relative bg-cover bg-center rounded-3xl p-6 lg:p-8 text-white overflow-hidden min-h-50 lg:min-h-60"
            style={{ backgroundImage: `url(${eventBgImage})` }}
          >
            <div className="relative z-10">
              <h2 className="text-lg lg:text-xl font-semibold mb-1">
                Join Believers to Experience the
              </h2>
              <h3 className="text-xl lg:text-2xl font-bold mb-2">
                Move of God at WOTH Meeting
              </h3>
              <p className="text-sm mb-6 opacity-90">
                {process.env.NEXT_PUBLIC_EVENT_DETAILS ||
                  "Apr 30th - May 3rd, 2026 · Dansol High School, Agidingbi, Lagos State"}
              </p>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-15 lg:min-w-17.5">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {timeLeft.days}
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold">:</div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-15 lg:min-w-17.5">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold">:</div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-15 lg:min-w-17.5">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold">:</div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-center min-w-15 lg:min-w-17.5">
                  <div className="text-2xl lg:text-3xl font-bold">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Registration card */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
                  You are registered for
                </h3>
                <h4 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900">
                  {registration?.eventName || "WOTH Camp Meeting 2026"}
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">
                    {attendeeType === "physical" && "Physical Attendance"}
                    {attendeeType === "online" && "Online Participant"}
                    {!attendeeType && "Camper"}
                  </span>
                  <Tent className="w-5 h-5 text-gray-700" />
                </div>
              </div>

              <div className="w-20 h-20 lg:w-24 lg:h-24 shrink-0">
                <Image
                  src={badgeImage}
                  alt="Badge"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                Download Badge
              </button>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Meal Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Camper-only accommodation details */}
        {isCamper && (
          normalizedAccommodation && !accommodationHoldExpired ? (
            <div className="bg-white rounded-3xl p-6 lg:p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg lg:text-xl font-semibold">
                      Accommodation Details
                    </h3>
                  </div>
                  <span
                    className={
                      "px-3 py-1 text-sm rounded-full " +
                    (paidForAccommodation
                      ? "bg-gray-100 text-gray-700"
                      : "bg-amber-50 text-amber-800 border border-amber-200")
                    }
                    >
                    {paidForAccommodation ? "Reserved" : "Pending Payment"}
                    </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Type</span>
                      <span className="text-base font-semibold">
                        {(() => {
                          const a = normalizedAccommodation as Record<string, unknown>;
                          if (typeof a.accommodationType === "string") return a.accommodationType;
                          if (typeof a.type === "string") return a.type;
                          return "Hostel";
                        })()}
                      </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Hall</span>
                  <span className="text-base font-semibold">
                    {(accommodationFacilityName || "").replace(/-/g, " ") || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">
                    Room
                  </span>
                  <span className="text-base font-semibold">
                    {(accommodationBedspaceLabel || accommodationRoomLabel || "—").replace(/-/g, " ")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden h-35 lg:h-40">
                <Image
                  src={accommodationImageUrl || "https://images.unsplash.com/photo-1694595437436-2ccf5a95591f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"}
                  alt="Accommodation"
                  width={1080}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {isCamper && (
              normalizedAccommodation ? (
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  {paidForAccommodation ? (
                    "Payment confirmed. Your accommodation is reserved."
                  ) : (
                    <div className="space-y-1">
                      <div>
                        Payment not confirmed yet. If you just completed checkout, this may take a moment.
                      </div>
                      <div className="text-xs text-amber-700">
                        Your accommodation is being held for{" "}
                        <span className="font-semibold">1 hour</span>.
                        {typeof accommodationHoldRemainingMs === "number" &&
                        accommodationHoldRemainingMs > 0 ? (
                          <>
                            {" "}Time left:{" "}
                            <span className="font-semibold">
                              {formatHoldRemaining(accommodationHoldRemainingMs)}
                            </span>
                            .
                          </>
                        ) : null}{" "}
                        If the hold expires, you’ll need to book again.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={reloadDashboard}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw
                      className={
                        dashboardHydrating
                          ? "w-4 h-4 animate-spin"
                          : "w-4 h-4"
                      }
                    />
                    Refresh
                  </button>

                  {!paidForAccommodation && (
                    <button
                      onClick={() => {
                        setIsAccommodationModalOpen(true);
                        setModalStep(1);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Continue to Payment
                    </button>
                  )}
                </div>
              </div>
  ) : (
<div className="rounded-xl border p-4">
  <p className="font-medium">Accommodation</p>
  <p className="text-sm opacity-80">
    You’re registered as a camper. Your accommodation details aren’t loaded yet.
  </p>
</div>
  )
)}
          </div>
  ) : (
<div className="rounded-xl border p-4">
  <p className="font-medium">Accommodation</p>
  <p className="text-sm opacity-80">
    You’re registered as a camper. Your accommodation details aren’t loaded yet.
  </p>
</div>
  )
)}

        {/* Non-camper upgrade CTA (re-using your existing promo card) */}
        {showAccommodationPromo && (
          <div className="bg-linear-to-br from-pink-100 via-purple-100 to-blue-100 rounded-3xl p-6 lg:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-purple-700" />
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Need Accommodation?
                  </h3>
                </div>
                <p className="text-gray-700 mb-4 text-base">
                  {isCamper && accommodationHoldExpired ? (
                    <>
                      Your <span className="font-semibold">1-hour</span> accommodation hold has expired.
                      Please book again.
                    </>
                  ) : (
                    <>
                      You can still book your accommodation space. You have just{" "}
                      <span className="font-bold text-purple-800">100 spaces</span>{" "}
                      available, book now.
                    </>
                  )}
                </p>
                <button
                  onClick={() => setIsAccommodationModalOpen(true)}
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Book Accommodation
                </button>
              </div>

              <div className="w-full lg:w-48 h-32 lg:h-40 rounded-2xl overflow-hidden shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                  alt="Accommodation"
                  width={400}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dependents Section - Shows registered dependents */}
        <DependentsSection
          dependents={dependents}
          onRegister={handleRegisterDependent}
          onPay={handlePayForDependents}
        />

        {/* Resources */}
        <div className="mb-6">
          <h3 className="text-lg lg:text-xl font-semibold mb-4">Resources</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-linear-to-br from-indigo-900 via-purple-900 to-purple-800 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-30 flex items-end">
              <div>
                <h4 className="font-semibold text-lg">WOTH SMFLX</h4>
                <p className="text-base opacity-90">2025 Messages</p>
              </div>
            </div>

            <div className="bg-linear-to-br from-amber-900 via-orange-900 to-red-900 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-30 flex items-end">
              <div>
                <h4 className="font-semibold text-lg">WOTH 2025 Teens</h4>
                <p className="text-base opacity-90">and YA Messages</p>
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-700 via-pink-600 to-teal-500 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity min-h-30 flex items-end">
              <div>
                <h4 className="font-semibold text-lg">Photo</h4>
                <p className="text-base opacity-90">Gallery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social + Streaming (from Figma-make) */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Follow Us */}
          <div className="bg-white rounded-3xl p-6 lg:p-8">
            <h3 className="text-lg lg:text-xl font-semibold mb-4 text-gray-900">
              Follow Us
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              Stay connected with us on social media
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://www.facebook.com/wothsmflx/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/smflxofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-pink-600 via-purple-600 to-orange-500 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Instagram</span>
              </a>

              <a
                href="https://x.com/smflxofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-gray-800 to-black rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">X</span>
              </a>

              <a
                href="https://youtube.com/@smflxofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-red-600 to-red-700 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">YouTube</span>
              </a>
            </div>
          </div>

          {/* Stream Our Meetings */}
          <div className="bg-white rounded-3xl p-6 lg:p-8">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
              Stream Our Meetings
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              Join us live on your preferred platform
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://wothsmflx.mixlr.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Mixlr</span>
              </a>

              <a
                href="https://youtube.com/@smflxofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-red-600 to-red-700 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">YouTube</span>
              </a>

              <a
                href="https://app.waystream.io/wothsmflx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-teal-600 to-cyan-600 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Waystream</span>
              </a>

              <a
                href="https://www.facebook.com/wothsmflx/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>


      {/* Accommodation Modal */}
      {isAccommodationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl lg:text-2xl font-semibold">
                {modalStep === 1 && "Select Accommodation Type"}
                {modalStep === 2 && "Camp Accommodation"}              </h2>
              <button
                onClick={handleModalClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {modalStep === 1 && (
                <div className="p-6 lg:p-8">
                  <p className="text-gray-600 mb-6">
                    Choose your preferred accommodation type
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                    <button
                      onClick={() => handleAccommodationType("hostel")}
                      className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Building2 className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          Hostel/Camp
                        </h3>
                        <p className="text-sm text-gray-600">
                          {availabilitySummary.loading
                            ? "Loading availability…"
                            : availabilitySummary.hostel
                              ? `${availabilitySummary.hostel.availableFacilities} facilities available · capacity ${availabilitySummary.hostel.totalCapacity}`
                              : "View available facilities"}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAccommodationType("hotel")}
                      className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Hotel className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Hotel</h3>
                        <p className="text-sm text-gray-600">
                          {availabilitySummary.loading
                            ? "Loading availability…"
                            : availabilitySummary.hotel
                              ? `${availabilitySummary.hotel.availableFacilities} facilities available · capacity ${availabilitySummary.hotel.totalCapacity}`
                              : "View available facilities"}
                        </p>
                      </div>
                    </button>
                  </div>

                  {availabilitySummary.error && (
                    <p className="mt-4 text-sm text-amber-700">
                      {availabilitySummary.error}
                    </p>
                  )}
                </div>
              )}

              {modalStep === 2 && (() => {
                const eventId =
                  registration?.eventId ??
                  (registration?.event &&
                  typeof registration.event === "object" &&
                  "eventId" in registration.event
                    ? String(
                        (registration.event as { eventId?: unknown }).eventId || ""
                      )
                    : "");

                if (!eventId) {
                  return (
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
                      Missing eventId. Please go back and reselect the event.
                    </div>
                  );
                }

                return (
                  <AccommodationSelection
                    categoryId=""
                    accommodationType={selectedAccommodationType}
                    eventId={eventId}
                    registrationId={
                      typeof registration?.id === "string"
                        ? registration.id
                        : typeof registration?.registrationId === "string"
                          ? registration.registrationId
                          : typeof registration?.id === "number"
                            ? String(registration.id)
                            : typeof registration?.registrationId === "number"
                              ? String(registration.registrationId)
                              : undefined
                    }
                    profile={localProfile}
                    onComplete={handleAccommodationComplete}
                    onBack={handleModalBack}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Dependents Modal */}
      <DependentsModal
        onRemoveDependent={handleRemoveDependent}
        isOpen={isDependentsModalOpen}
        onClose={() => setIsDependentsModalOpen(false)}
        existingDependents={dependents}
        onSave={handleSaveDependents}
        onRegisterAndPay={handleRegisterAndPayDependents}
      />

      {/* Dependents Payment Modal */}
      <DependentsPaymentModal
        isOpen={isDependentsPaymentModalOpen}
        onClose={() => setIsDependentsPaymentModalOpen(false)}
        dependents={selectedDependentsForPayment}
        eventId={getEventId(registration)}
        parentRegId={resolvedRegId}
        onPaymentComplete={handleDependentsPaymentComplete}
      />

      {/* Dependent Registration Success Modal */}
      <DependentRegistrationSuccess
        isOpen={isRegistrationSuccessModalOpen}
        dependentName={registeredDependentName}
        onClose={() => setIsRegistrationSuccessModalOpen(false)}
      />

      {/* Confirmation Dialog for Remove Dependent */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Dependent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              {dependentToDelete?.name || "this dependent"}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDependentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveDependent}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}