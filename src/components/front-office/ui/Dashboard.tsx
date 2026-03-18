"use client";

import { useEffect, useState, useRef, useMemo, type ComponentProps } from "react";
import{ Dependent as ModalDependent } from "./DependentsModal";
import { Home, Tent, User, LogOut, X, Building2, Hotel, Users, Facebook, Instagram, Twitter, Youtube, Radio, Loader2, RefreshCcw } from "lucide-react";
import { InlineAlert } from "./InlineAlert";
import Image from "next/image";
import { toast } from "sonner";
import { loadPendingDependentsPayments, clearOldPendingDependentsPayments } from "@/lib/storage/pendingDependentsPayments";
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
import { listAccommodationCategories } from "@/lib/api/accommodation";

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
  isProcessing: boolean;
};

const isDependentProcessing = (dependentId: string): boolean => {
  if (!dependentId) return false;
  clearOldPendingDependentsPayments(3 * 60 * 1000);

  const list = loadPendingDependentsPayments();
  const now = Date.now();
  const TTL_MS = 30 * 60 * 1000;

  return list.some((it) => {
    const ids = Array.isArray(it?.dependantIds) ? it.dependantIds : [];
    if (!ids.includes(dependentId)) return false;
    const startedAtMs = typeof it?.startedAtMs === "number" ? it.startedAtMs : 0;
    if (!startedAtMs) return false;
    if (now - startedAtMs > TTL_MS) return false;
    return true;
  });
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
          : (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2));

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

  const paymentStatusRaw =
    (rec as any).paymentStatus ??
    (rec as any).payment_state ??
    (rec as any).paymentState ??
    (rec as any).payment ??
    (rec as any).payment_status ??
    (rec as any).status;

  const paymentStatus =
    typeof paymentStatusRaw === "string" ? paymentStatusRaw.toUpperCase() : "";

  const isPaid =
    typeof rec.isPaid === "boolean"
      ? (rec.isPaid as boolean)
      : typeof (rec as any).paid === "boolean"
        ? Boolean((rec as any).paid)
        : ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED"].includes(paymentStatus);

  const isProcessing =
    !isPaid &&
    (["PENDING", "PROCESSING", "INITIATED", "IN_PROGRESS"].includes(paymentStatus) ||
      isDependentProcessing(id));

  return { id, name, age, gender, isRegistered, isPaid, isProcessing };
};

const getRegId = (registration: unknown): string | undefined => {
  if (typeof registration !== "object" || registration === null) return undefined;

  const reg = registration as Record<string, unknown>;
  if ("regId" in reg && reg.regId != null) return String(reg.regId);
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

  const status = String(
    acc?.status ??
    acc?.paymentStatus ??
    acc?.payment_status ??
    acc?.accommodationPaymentStatus ??
    ""
  ).toLowerCase();

  const paid =
    acc?.paidForAccommodation === true ||
    acc?.isPaid === true ||
    acc?.paid === true ||
    acc?.isConfirmed === true ||
    status === "paid" ||
    status === "success" ||
    status === "completed" ||
    status === "confirmed" ||
    status === "active" ||
    status.includes("paid");

  // Normalize facility/room fields so Dashboard display logic works regardless of shape
  const facilityName =
    acc?.facilityName ??
    acc?.facility?.facilityName ??
    acc?.facility?.name ??
    (typeof acc?.facility === "string" ? acc.facility : null) ??
    acc?.hostelName ??
    acc?.hotelName ??
    null;

  const roomIdentifier =
    acc?.room?.roomIdentifier ??
    acc?.room?.roomCode ??
    acc?.room?.roomNumber ??
    acc?.roomIdentifier ??
    acc?.roomCode ??
    acc?.roomNumber ??
    (typeof acc?.room === "string" ? acc.room : null) ??
    null;

  const bedspaceName =
    acc?.bedspace?.bedspaceName ??
    acc?.bedspace?.name ??
    acc?.bedspaceName ??
    acc?.bedNumber ??
    (typeof acc?.bed === "string" ? acc.bed : null) ??
    (typeof acc?.bedspace === "string" ? acc.bedspace : null) ??
    null;

  return {
    ...acc,
    // Ensure nested room object always carries facilityName for display
    room: acc?.room && typeof acc.room === "object"
      ? { ...acc.room, facilityName: acc.room.facilityName ?? facilityName }
      : acc?.room ?? null,
    facilityName: acc?.facilityName ?? facilityName,
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

    useEffect(() => {
    async function enterpriseReconcile() {
      try {
        if (
          registration?.paymentStatus === "pending" &&
          registration?.paymentReference
        ) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/verify/${registration.paymentReference}`,
            { method: "GET" }
          );

          const data = await res.json();

          if (data?.status === "success") {
            onRegistrationUpdate?.({
              ...registration,
              paymentStatus: "paid",
            });
          }
        }
      } catch (err) {
        console.error("Enterprise reconcile failed:", err);
      }
    }

    enterpriseReconcile();
  }, [registration, onRegistrationUpdate]);

  const resolvedEventId = (() => {
    if (activeEventId) return activeEventId;

    if (registration?.eventId) return String(registration.eventId);

    try {
      const flowRaw = localStorage.getItem("smflx_flow_state_v1");
      if (flowRaw) {
        const flow = JSON.parse(flowRaw);
        const fromFlow = flow?.selectedEvent?.eventId || flow?.event?.eventId || flow?.eventId || flow?.activeEventId;
        if (fromFlow) return fromFlow;
      }
    } catch {
      // ignore
    }

    return undefined;
  })();

  const resolvedRegId = (() => {
    // Priority 1: ownerRegId prop (passed from dashboard page, extracted from /registrations/my-registrations)
    if (ownerRegId) return ownerRegId;
    
    // Priority 2: Get from registration object
    const regIdFromRegistration = getRegId(registration);
    if (regIdFromRegistration) return regIdFromRegistration;
    
    // Priority 3: Check profile for regId field (some backends might store it here)
    const p: any = profile as any;
    if (p?.regId) return String(p.regId);
    
    return undefined;
  })();

  const badgeHref = (() => {
    const p: any = profile as any;
    const firstName = (p?.firstName ?? p?.firstname ?? "").toString().trim();
    const lastName = (p?.lastName ?? p?.lastname ?? "").toString().trim();

    const qs = new URLSearchParams();
    if (firstName) qs.set("firstName", firstName);
    if (lastName) qs.set("lastName", lastName);

    const suffix = qs.toString();
    return suffix
      ? `https://livelybadge.vercel.app/badge?${suffix}`
      : "https://livelybadge.vercel.app/badge";
  })();


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

    // Resolve eventId (prop → registration → flow state)
    const resolvedEventId: string | undefined = (() => {
      if (activeEventId) return activeEventId;
      if (registration?.eventId) return registration.eventId;
      if (typeof window === "undefined") return undefined;

      try {
        const flowRaw = localStorage.getItem("smflx_flow_state_v1");
        if (flowRaw) {
          let flow: Record<string, unknown> = {};
            try {
              flow = JSON.parse(flowRaw);
            } catch {
              flow = {};
            }
          const se = flow["selectedEvent"] as Record<string, unknown> | undefined;
          const id = se?.["eventId"] ?? flow["activeEventId"] ?? flow["eventId"];
          if (typeof id === "string" && id) return id;
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

      const rawAcc =
        data.accommodations.find((a) => a.eventId === resolvedEventId) ??
        data.accommodations[0] ??
        null;

      const accForEvent = (() => {
        if (!rawAcc) return null;
        const st = String(
          (rawAcc as any)?.status ??
          (rawAcc as any)?.paymentStatus ??
          (rawAcc as any)?.payment_status ??
          (rawAcc as any)?.accommodationPaymentStatus ??
          ""
        ).toLowerCase();
        const paid =
          (rawAcc as any)?.paidForAccommodation === true ||
          (rawAcc as any)?.isPaid === true ||
          (rawAcc as any)?.paid === true ||
          (rawAcc as any)?.isConfirmed === true ||
          ["paid", "success", "completed", "confirmed", "active"].includes(st);
        return paid ? { ...rawAcc, paidForAccommodation: true } : rawAcc;
      })();

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
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedAccommodationType, setSelectedAccommodationType] = useState("");
  const [accommodationCategories, setAccommodationCategories] = useState<
    Array<{ categoryId: string; name: string; type: string }> 
    >([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [availabilitySummary, setAvailabilitySummary] = useState<{
    loading: boolean;
    hostel?: { availableFacilities: number; totalCapacity: number; availableSpaces: number };
    hotel?: { availableFacilities: number; totalCapacity: number; availableSpaces: number };
    error?: string | null;
  }>({ loading: false, error: null });

  useEffect(() => {
    const eventId = registration?.eventId;
    if (!eventId) return;

    const hasSummary = Boolean(availabilitySummary.hostel || availabilitySummary.hotel);
    const shouldRefreshForModal = isAccommodationModalOpen && modalStep === 1;
    if (!shouldRefreshForModal && hasSummary) return;

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
          const cap =
            Number(i?.totalSpaces ?? i?.totalCapacity ?? i?.availableSpaces ?? 0) ||
            0;
          return sum + cap;
        }, 0);

        // availableSpaces is the UNOCCUPIED count — what we display on promo cards
        const availableSpaces = items.reduce((sum, i) => {
          const avail = Number(i?.availableSpaces ?? 0) || 0;
          return sum + avail;
        }, 0);

        return { availableFacilities, totalCapacity, availableSpaces };
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

      // Fetch accommodation categories when modal opens
    useEffect(() => {
      const eventId =
        activeEventId ??
        resolvedEventId ??
        registration?.eventId ??
        (registration?.event &&
        typeof registration.event === "object" &&
        "eventId" in registration.event
          ? String((registration.event as { eventId?: unknown }).eventId || "")
          : "");
      if (!isAccommodationModalOpen || !eventId) return;

      let cancelled = false;
      
      (async () => {
        setLoadingCategories(true);
        try {
          const categories = await listAccommodationCategories({ eventId });
          
          if (cancelled) return;
          
        const mappedCategories = categories.map((cat) => {
          const nameUpper = (cat.name || "").toUpperCase();

          let type: "hotel" | "hostel" | "shared" | "unknown" = "unknown";

          if (nameUpper.includes("HOTEL")) type = "hotel";
          else if (nameUpper.includes("HOSTEL")) type = "hostel";
          else if (nameUpper.includes("SHARED") || nameUpper.includes("APARTMENT")) type = "shared";

          return {
            categoryId: cat.categoryId,
            name: cat.name,
            type,
          };
        });
          
          setAccommodationCategories(mappedCategories);
        } catch (error) {
          console.error('Failed to load accommodation categories:', error);
          toast.error('Failed to load accommodation options');
        } finally {
          if (!cancelled) {
            setLoadingCategories(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [isAccommodationModalOpen, activeEventId, resolvedEventId]);


  // Dependents state
  type Dependent = {
  id: string;
  name: string;
  age: string;
  gender: string;
  isRegistered: boolean;
  isPaid: boolean;
  isProcessing: boolean;
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

  useEffect(() => {
    let cancelled = false;

    const loadInitialDependents = async () => {
      const eventId = activeEventId ?? resolvedEventId;
      if (!eventId) return;

      try {
        const data = await getUserDashboard(eventId);
        if (cancelled) return;
        const deps = (data.dependents || []).map((d) => toDependent(d));
        setDependents(deps);
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
  }, [activeEventId]); // Only depend on activeEventId, not resolvedEventId

  const firstName =
    (localProfile?.firstName ?? "User");

  const attendeeType = normalizeAttendeeType(registration);
  const attendeeTypeNorm = (typeof attendeeType === "string" ? attendeeType.toLowerCase() : "");
  const isCamper = attendeeTypeNorm === "camper";
  const normalizedAccommodation = useMemo(
    () => normalizeAccommodation(accommodation),
    [accommodation],
  );
  
  const accAny = normalizedAccommodation as any;

  const accommodationFacilityName: string =
    (accAny?.room?.facilityName as string) ||
    (accAny?.facilityName as string) ||
    (accAny?.facility?.facilityName as string) ||
    (accAny?.facility?.name as string) ||
    (typeof accAny?.facility === "string" ? accAny.facility : "") ||
    (accAny?.hostelName as string) ||
    (accAny?.hotelName as string) ||
    "";

  const accommodationRoomLabel: string =
    (accAny?.room?.roomIdentifier as string) ||
    (accAny?.room?.roomCode as string) ||
    (accAny?.room?.roomNumber as string) ||
    (accAny?.room?.roomType as string) ||
    (accAny?.roomIdentifier as string) ||
    (accAny?.roomCode as string) ||
    (accAny?.roomNumber as string) ||
    (typeof accAny?.room === "string" ? accAny.room : "") ||
    "";

  const accommodationBedspaceLabel: string =
    (accAny?.bedspace?.bedspaceName as string) ||
    (accAny?.bedspace?.name as string) ||
    (accAny?.bedspaceName as string) ||
    (accAny?.bedNumber as string) ||
    (typeof accAny?.bed === "string" ? (accAny?.bed as string) : "") ||
    (typeof accAny?.bedspace === "string" ? accAny.bedspace : "") ||
    "";

  const accommodationTypeDisplay: string =
    (accAny?.accommodationType as string) ||
    (accAny?.type as string) ||
    (accAny?.category as string) ||
    "";

  const accommodationImageUrl: string =
    (accAny?.accommodationImageUrl as string) ||
    (accAny?.imageUrl as string) ||
    "";
const isNonCamper = attendeeTypeNorm === "physical" || attendeeTypeNorm === "online" || attendeeTypeNorm === "";
  const paidForAccommodation = normalizedAccommodation?.paidForAccommodation === true;
  // Hotel bookings are handled offline — different card UI and no Korapay payment button
  const isHotelAccommodation = (accAny?.accommodationType ?? accAny?.type ?? "").toString().toUpperCase().includes("HOTEL");

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

  // Listen for post-payment dependents refresh dispatched by the dashboard page polling loop.
  // This updates local dependents state to show isPaid:true after returning from checkout.
  useEffect(() => {
    const handler = (e: Event) => {
      const fresh = (e as CustomEvent).detail;
      if (Array.isArray(fresh) && fresh.length > 0) {
        setDependents(fresh);
      }
    };
    window.addEventListener("smflx:dependents:refresh", handler);
    return () => window.removeEventListener("smflx:dependents:refresh", handler);
  }, []);

  useEffect(() => {
    const HOLD_MS = 60 * 60 * 1000;
    const hasPendingAccommodation = !!normalizedAccommodation && !paidForAccommodation;

    if (!hasPendingAccommodation) {
      setAccommodationHold((prev) => {
        if (prev.startedAtMs === null && prev.expiresAtMs === null && prev.remainingMs === null && prev.expired === false) return prev;
        return { startedAtMs: null, expiresAtMs: null, remainingMs: null, expired: false };
      });
      return;
    }

    // Derive hold start time from API (preferred) or localStorage bridge flag written by AccommodationSelection
    const getStartedAtMs = (): number | null => {
      const a = normalizedAccommodation as any;
      const apiTs =
        a?.bookingInitiatedAt ?? a?.booking_initiated_at ??
        a?.holdStartedAt ?? a?.hold_started_at ??
        a?.createdAt ?? a?.created_at ?? null;
      if (apiTs) {
        const ms = typeof apiTs === "number" ? apiTs : new Date(apiTs).getTime();
        if (Number.isFinite(ms) && ms > 0) return ms;
      }
      // Bridge fallback — removed from localStorage on next dashboard boot
      try {
        const raw = localStorage.getItem("smflx_pending_accommodation_payment_started_at");
        const n = raw ? Number(raw) : NaN;
        if (Number.isFinite(n) && n > 0) return n;
      } catch {}
      return null;
    };

    const startedAtMs = getStartedAtMs();
    if (!startedAtMs) {
      setAccommodationHold({ startedAtMs: null, expiresAtMs: null, remainingMs: null, expired: false });
      return;
    }

    const expiresAtMs = startedAtMs + HOLD_MS;
    let handledExpire = false;

    const tick = () => {
      const remainingMs = Math.max(0, expiresAtMs - Date.now());
      const expired = remainingMs <= 0;

      setAccommodationHold((prev) => {
        if (prev.startedAtMs === startedAtMs && prev.expiresAtMs === expiresAtMs && prev.remainingMs === remainingMs && prev.expired === expired) return prev;
        return { startedAtMs, expiresAtMs, remainingMs, expired };
      });

      if (!expired || handledExpire) return;
      handledExpire = true;
      onAccommodationUpdateRef.current?.(null);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [Boolean(normalizedAccommodation), paidForAccommodation]);

  const accommodationHoldExpired = accommodationHold.expired;
  const accommodationHoldRemainingMs = accommodationHold.remainingMs;

  const hasActivePendingAccommodationHold = useMemo(() => {
    if (!normalizedAccommodation) return false;
    if (paidForAccommodation) return false;
    const HOLD_MS = 60 * 60 * 1000;
    const a = normalizedAccommodation as any;
    const apiTs = a?.bookingInitiatedAt ?? a?.booking_initiated_at ?? a?.holdStartedAt ?? a?.hold_started_at ?? a?.createdAt ?? a?.created_at ?? null;
    let startedAtMs: number | null = null;
    if (apiTs) {
      const ms = typeof apiTs === "number" ? apiTs : new Date(apiTs).getTime();
      if (Number.isFinite(ms) && ms > 0) startedAtMs = ms;
    }
    if (!startedAtMs) {
      try {
        const raw = localStorage.getItem("smflx_pending_accommodation_payment_started_at");
        const n = raw ? Number(raw) : NaN;
        if (Number.isFinite(n) && n > 0) startedAtMs = n;
      } catch {}
    }
    if (!startedAtMs) return false;
    return Date.now() - startedAtMs < HOLD_MS;
  }, [Boolean(normalizedAccommodation), paidForAccommodation]);

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

      const hasAccommodationBookingDetails =
        Boolean((facilityName || "").trim()) ||
        Boolean((roomLabel || "").trim()) ||
        Boolean((accommodationTypeLabel || "").trim());

      const paidAmount =
        typeof acc?.amountPaidForAccommodation === "number"
          ? acc.amountPaidForAccommodation
          : Number((acc as any)?.amountPaidForAccommodation ?? (acc as any)?.amountPaid ?? 0) || 0;

      const imageUrl =
        (acc as any)?.accommodationImageUrl ||
        (acc as any)?.imageUrl ||
        "";

      const showAccommodationPromo =
        // Only show promo/CTA when the user has no accommodation object from the API.
        // If the API returned accommodation data (even unpaid), show the details card instead.
        !normalizedAccommodation;

      const promoSpacesCount = (() => {
        // Use availableSpaces (unoccupied) — not totalCapacity (total beds)
        const hostelAvail = availabilitySummary.hostel?.availableSpaces ?? 0;
        const hotelAvail = availabilitySummary.hotel?.availableSpaces ?? 0;
        const avail = (Number(hostelAvail) || 0) + (Number(hotelAvail) || 0);
        if (avail > 0) return avail;

        const hostelFac = availabilitySummary.hostel?.availableFacilities ?? 0;
        const hotelFac = availabilitySummary.hotel?.availableFacilities ?? 0;
        const fac = (Number(hostelFac) || 0) + (Number(hotelFac) || 0);
        return fac;
      })();

      const handleAccommodationType = (type: string) => {
        setSelectedAccommodationType(type);
        setModalStep(2);
      };

      const handleAccommodationComplete = (data: AccommodationData) => {
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
          setConfirmDeleteOpen(false);
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

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-medium">
                    {attendeeType === "camper" && "Camper"}
                    {attendeeType === "physical" && "Physical Attendance"}
                    {attendeeType === "online" && "Online Participant"}
                    {!attendeeType && "Registered"}
                  </span>
                  <Tent className="w-5 h-5 text-gray-700" />
                  {/* Payment status badge */}
                  {(() => {
                    const regStatus = String(
                      (registration as any)?.status ??
                      (registration as any)?.paymentStatus ??
                      (registration as any)?.payment_status ??
                      ""
                    ).toUpperCase();
                    const isPaid = ["PAID", "SUCCESS", "COMPLETED", "CONFIRMED", "ACTIVE"].includes(regStatus);
                    const isPending = ["PENDING", "PROCESSING", "INITIATED", "IN_PROGRESS"].includes(regStatus);
                    if (isPaid) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Paid
                        </span>
                      );
                    }
                    if (isPending) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Payment Pending
                        </span>
                      );
                    }
                    if (regStatus && !isPaid && !isPending) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {regStatus.charAt(0) + regStatus.slice(1).toLowerCase()}
                        </span>
                      );
                    }
                    return null;
                  })()}
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
              <a
                href={badgeHref}
                target="_blank"
                rel="noreferrer noopener"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                Download Badge
              </a>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Meal Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Camper-only notice when no accommodation has been booked yet */}
        {isCamper && !normalizedAccommodation && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
            <p className="font-medium text-amber-900">Accommodation</p>
            <p className="text-sm text-amber-800 mt-1 opacity-90">
              You are registered as a camper and your accommodation details are yet to be confirmed.
              Please book an accommodation below to confirm your status as a camper.
            </p>
          </div>
        )}

        {normalizedAccommodation ? (
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
                  {paidForAccommodation ? "Reserved" : isHotelAccommodation ? "Pending Confirmation" : "Pending Payment"}
                </span>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">Type</span>
                    <span className="text-base font-semibold">
                      {accommodationTypeDisplay || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">Hall</span>
                    <span className="text-base font-semibold">
                      {(accommodationFacilityName || "").replace(/-/g, " ") || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">Room</span>
                    <span className="text-base font-semibold">
                      {(accommodationBedspaceLabel || accommodationRoomLabel || "—").replace(/-/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden h-35 lg:h-40">
                  <Image
                    src={
                      accommodationImageUrl ||
                      "https://images.unsplash.com/photo-1694595437436-2ccf5a95591f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                    }
                    alt="Accommodation"
                    width={1080}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  {paidForAccommodation ? (
                    "Payment confirmed. Your accommodation is reserved."
                  ) : isHotelAccommodation ? (
                    /* Hotel: offline booking — show coordinator contact */
                    <div className="space-y-3">
                      <p className="text-amber-800 text-sm">
                        Your hotel booking is <span className="font-semibold">pending confirmation</span>. Contact our accommodation coordinator to complete your booking and payment.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Sis. Damilola Olawuni</p>
                          <p className="text-sm text-amber-800">+234 708 950 9539</p>
                          <p className="text-xs text-amber-700">Calls &amp; WhatsApp</p>
                        </div>
                        <div className="flex gap-2 ml-auto shrink-0">
                          <a
                            href="tel:+2347089509539"
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                            Call
                          </a>
                          <a
                            href="https://wa.me/2347089509539?text=Hi%20Sis.%20Damilola%2C%20I%20selected%20a%20hotel%20room%20for%20the%20WOTH%20event%20and%20would%20like%20to%20complete%20my%20booking."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
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
                        If the hold expires, you will need to book again.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={reloadDashboard}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw
                      className={
                        dashboardHydrating ? "w-4 h-4 animate-spin" : "w-4 h-4"
                      }
                    />
                    Refresh
                  </button>

                  {/* Change accommodation — only when unpaid. Hotel users can always switch type. Hostel users can switch before hold expires. */}
                  {!paidForAccommodation && (
                    <button
                      onClick={() => {
                        if (!localProfile?.ageRange) {
                          toast.error("Please update your Age Range in your profile before booking accommodation.");
                          return;
                        }
                        if (!localProfile?.gender) {
                          toast.error("Please update your Gender in your profile before booking accommodation.");
                          return;
                        }
                        setIsAccommodationModalOpen(true);
                        setModalStep(1);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      Change Accommodation
                    </button>
                  )}

                  {/* Pay Now — hostel only; hotel is offline */}
                  {!paidForAccommodation && !isHotelAccommodation && (
                    <button
                      onClick={() => {
                        if (!localProfile?.ageRange) {
                          toast.error("Please update your Age Range in your profile before booking accommodation.");
                          return;
                        }
                        if (!localProfile?.gender) {
                          toast.error("Please update your Gender in your profile before booking accommodation.");
                          return;
                        }
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
            </div>
          ) : null}

        <DependentsSection
          dependents={dependents}
          onRegister={handleRegisterDependent}
          onPay={handlePayForDependents}
        />

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
                      <span className="font-bold text-purple-800">
                        {availabilitySummary.loading
                          ? "…"
                          : promoSpacesCount > 0
                          ? `${promoSpacesCount} ${promoSpacesCount === 1 ? "space" : "spaces"}`
                          : "few spaces"}
                      </span>{" "}
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
                  activeEventId ??
                  resolvedEventId ??
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

                const matchingCategory = accommodationCategories.find((cat) => {
                  if (selectedAccommodationType === "hostel") return cat.type === "hostel";
                  if (selectedAccommodationType === "hotel") return cat.type === "hotel";
                  if (selectedAccommodationType === "shared") return cat.type === "shared";
                  return false;
                });

                if (loadingCategories) {
                  return (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Loading accommodation options...</p>
                    </div>
                  );
                }

                if (!matchingCategory) {
                  return (
                    <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-900">
                      <p className="font-semibold mb-2">Accommodation category not found</p>
                      <p className="text-sm">
                        Unable to find {selectedAccommodationType} accommodations for this event.
                        Please go back and try again, or contact support if the issue persists.
                      </p>
                    </div>
                  );
                }

                return (
                  <AccommodationSelection
                    categoryId={matchingCategory.categoryId} 
                    accommodationType={selectedAccommodationType}
                    eventId={eventId}
                    registrationId={
                      resolvedRegId ||
                      (typeof (registration as any)?.regId === "string" ? (registration as any).regId : undefined) ||
                      (typeof registration?.id === "string" ? registration.id : undefined) ||
                      (typeof registration?.registrationId === "string" ? registration.registrationId : undefined) ||
                      (typeof (registration as any)?.regId === "number" ? String((registration as any).regId) : undefined) ||
                      (typeof registration?.id === "number" ? String(registration.id) : undefined) ||
                      (typeof registration?.registrationId === "number" ? String(registration.registrationId) : undefined)
                    }
                    userId={profile?.userId || (profile as any)?.id || (profile as any)?._id}
                    profile={localProfile}
                    onComplete={handleAccommodationComplete}
                    onBack={handleModalBack}
                    onClose={resetModal}
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