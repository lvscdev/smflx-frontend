"use client";

import { useState, useEffect, useRef } from "react";
import {
  Home,
  Tent,
  User,
  LogOut,
  X,
  Building2,
  Hotel,
  Users,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Radio,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { InlineAlert } from "./InlineAlert";
import Image from "next/image";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AccommodationSelection } from "./AccommodationSelection";
import { Payment } from "./Payment";
import { DependentsBanner } from "./DependentsBanner";
import { DependentsModal } from "./DependentsModal";
import { DependentsPaymentModal } from "./DependentsPaymentModal";
import { DependentsSection } from "./DependentsSection";
import { DependentRegistrationSuccess } from "./DependentRegistrationSuccess";
import { UserProfile } from "./UserProfile";
import {
  getUserDashboard,
  addDependent as apiAddDependent,
  removeDependent as apiRemoveDependent,
  getAccommodations,
} from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

const eventBgImage = "/assets/images/event-bg.png";
const badgeImage = "/assets/images/badge.png";
const logoImage = "/assets/images/logo.png";

interface DashboardProps {
  userEmail: string;
  profile: any;
  registration: any;
  accommodation: any;
  onLogout: () => void;
  onAccommodationUpdate?: (data: any) => void;
  onRegistrationUpdate?: (data: any) => void;
  onProfileUpdate?: (data: any) => void;
}

export function Dashboard({
  userEmail,
  profile,
  registration,
  accommodation,
  onLogout,
  onAccommodationUpdate,
  onRegistrationUpdate,
  onProfileUpdate,
}: DashboardProps) {
  // Avatar dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeDashboardPage, setActiveDashboardPage] = useState<
    "dashboard" | "user-profile"
  >("dashboard");
  const [localProfile, setLocalProfile] = useState<any>(profile);

  const [dashboardLoadError, setDashboardLoadError] = useState<string | null>(
    null,
  );

  const [dashboardHydrating, setDashboardHydrating] = useState(false);

  const reloadDashboard = async () => {
    setDashboardHydrating(true);
    setDashboardLoadError(null);
    try {
      const data: any = await getUserDashboard();

      const deps =
        data?.dependants ||
        data?.dependents ||
        data?.dependentRegistrations ||
        [];
      if (Array.isArray(deps)) {
        setDependents(
          deps.map((d: any) => ({
            id: d?.id || d?.dependantId || crypto.randomUUID(),
            name: d?.name,
            age: d?.age,
            gender: d?.gender?.toString()?.toLowerCase() || "male",
            isRegistered: d?.isRegistered ?? true,
            isPaid: d?.isPaid ?? (d?.paymentStatus === "PAID" ? true : false),
          })),
        );
      } else {
        setDependents([]);
      }

      // Optionally hydrate profile from API
      if (data?.user && typeof data.user === "object") {
        setLocalProfile((prev: any) => ({ ...prev, ...data.user }));
      }
    } catch (err: any) {
      setDashboardLoadError(toUserMessage(err, { feature: "generic" }));
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
  const [modalStep, setModalStep] = useState(1); // 1: Type selection, 2: Facility selection, 3: Payment
  const [selectedAccommodationType, setSelectedAccommodationType] =
    useState("");
  const [accommodationData, setAccommodationData] = useState<any>(null);

  // Availability summary (best-effort) for the accommodation type picker.
  // Note: the current API docs expose facility `totalCapacity` + `available` but do not expose
  // real-time remaining spaces/rooms, so we avoid showing misleading "X left" numbers.
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

        const summarize = (items: any[]) => {
          const availableFacilities = items.filter(
            (i) => (Number(i?.availableSpaces ?? 0) || 0) > 0,
          ).length;
          const totalCapacity = items.reduce(
            (sum, i) =>
              sum + (Number(i?.totalSpaces ?? i?.availableSpaces ?? 0) || 0),
            0,
          );
          return { availableFacilities, totalCapacity };
        };

        setAvailabilitySummary({
          loading: false,
          hostel: summarize((hostel as any)?.facilities || []),
          hotel: summarize((hotel as any)?.facilities || []),
          error: null,
        });
      } catch (err: any) {
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
  const [dependents, setDependents] = useState<any[]>([]);
  const [removingDependentId, setRemovingDependentId] = useState<string | null>(
    null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [dependentToDelete, setDependentToDelete] = useState<any>(null);
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [isDependentsPaymentModalOpen, setIsDependentsPaymentModalOpen] =
    useState(false);
  const [selectedDependentsForPayment, setSelectedDependentsForPayment] =
    useState<any[]>([]);
  const [isRegistrationSuccessModalOpen, setIsRegistrationSuccessModalOpen] =
    useState(false);
  const [registeredDependentName, setRegisteredDependentName] = useState("");

  // Stage 2: hydrate dashboard data from API when available
  useEffect(() => {
    let mounted = true;
    (async () => {
      await reloadDashboard();
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
      const eventDate = new Date("2026-04-30T00:00:00").getTime();
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

  const firstName =
    profile?.firstName || (profile as any)?.fullName?.split(" ")?.[0] || "User";

  const attendeeType = registration?.attendeeType as
    | "camper"
    | "physical"
    | "online"
    | undefined;
  const isNonCamper = attendeeType === "physical" || attendeeType === "online";
  const showAccommodationPromo = isNonCamper && !accommodation;

  const handleAccommodationType = (type: string) => {
    setSelectedAccommodationType(type);
    setModalStep(2);
  };

  const handleFacilitySelection = (data: any) => {
    setAccommodationData(data);
    setModalStep(3);
  };

  const resetModal = () => {
    setIsAccommodationModalOpen(false);
    setModalStep(1);
    setSelectedAccommodationType("");
    setAccommodationData(null);
  };

  const handlePaymentComplete = () => {
    onAccommodationUpdate?.(accommodationData);

    onRegistrationUpdate?.({ ...registration, attendeeType: "camper" });

    resetModal();
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

  const handleSaveDependents = async (updatedDependents: any[]) => {
    // optimistic UI
    const prev = dependents;
    setDependents(updatedDependents);

    // Stage 2: persist newly added dependents (no demo fallbacks)
    try {
      const eventId = registration?.eventId || registration?.event?.eventId;
      if (!eventId) {
        throw new Error("Missing eventId: cannot save dependents.");
      }

      const prevIds = new Set(prev.map((d: any) => d.id));
      const toCreate = updatedDependents.filter((d: any) => !prevIds.has(d.id));

      for (const d of toCreate) {
        const gender = (d?.gender || "male").toString().toUpperCase();
        const normalizedGender = gender === "FEMALE" ? "FEMALE" : "MALE";
        await apiAddDependent({
          eventId,
          name: d?.name,
          age: Number(d?.age || 0),
          gender: normalizedGender,
        });
      }
    } catch (err: any) {
      // revert optimistic update and surface error
      setDependents(prev);
      setDashboardLoadError(
        err?.message || "Failed to save dependents. Please try again.",
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
    } catch (err: any) {
      setDependents(prev);
      const msg =
        err?.message || `Failed to remove ${dependentName}. Please try again.`;
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

  const handleRegisterDependent = (id: string) => {
    const updatedDependents = dependents.map((d) =>
      d.id === id ? { ...d, isRegistered: true } : d,
    );
    const registered = dependents.find((d) => d.id === id);
    if (registered?.name) {
      setRegisteredDependentName(registered.name);
      setIsRegistrationSuccessModalOpen(true);
    }
    setDependents(updatedDependents);
  };

  const handlePayForDependents = (ids: string[]) => {
    const selected = dependents.filter((d) => ids.includes(d.id));
    setSelectedDependentsForPayment(selected);
    setIsDependentsPaymentModalOpen(true);
  };

  const handleRegisterAndPayDependents = (selected: any[]) => {
    setSelectedDependentsForPayment(selected);
    // mark them registered before payment
    const updatedDependents = dependents.map((d) =>
      selected.find((sd: any) => sd.id === d.id)
        ? { ...d, isRegistered: true }
        : d,
    );
    setDependents(updatedDependents);
    setIsDependentsModalOpen(false);
    setIsDependentsPaymentModalOpen(true);
  };

  const handleDependentsPaymentComplete = () => {
    const updatedDependents = dependents.map((d) =>
      selectedDependentsForPayment.find((sd: any) => sd.id === d.id)
        ? { ...d, isPaid: true }
        : d,
    );
    setDependents(updatedDependents);
    setSelectedDependentsForPayment([]);
    setIsDependentsPaymentModalOpen(false);
  };

  if (activeDashboardPage === "user-profile") {
    return (
      <UserProfile
        profile={localProfile}
        userEmail={userEmail}
        userPhone={localProfile?.phone || localProfile?.phoneNumber || ""}
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
          <h1 className="text-2xl lg:text-3xl mb-1">Hello {firstName}</h1>
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

        <DependentsSection
          dependents={dependents}
          onRegister={handleRegisterDependent}
          onPay={handlePayForDependents}
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
                Apr 30th - May 3rd, 2026 · Dansol High School, Agidingbi, Lagos
                State
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
                <h3 className="text-lg lg:text-xl font-semibold mb-1">
                  You are registered for
                </h3>
                <h4 className="text-xl lg:text-2xl font-bold mb-4">
                  {registration?.eventName || "WOTH Camp Meeting 2026"}
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">
                    {attendeeType === "camper" && "Camper"}
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
        {accommodation && attendeeType === "camper" && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg lg:text-xl font-semibold">
                  Accommodation Details
                </h3>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                Reserved
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Type</span>
                  <span className="text-base font-semibold capitalize">
                    {accommodation.type || "Hostel"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Hall</span>
                  <span className="text-base font-semibold capitalize">
                    {accommodation.facility?.replace("-", " ") || "Grace Hall"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-2">
                    Bedspace
                  </span>
                  <span className="text-base font-semibold capitalize">
                    {accommodation.bed?.replace("-", " ") || "Bedspace 101"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden h-35 lg:h-40">
                <Image
                  src="https://images.unsplash.com/photo-1694595437436-2ccf5a95591f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                  alt="Accommodation"
                  width={1080}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
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
                  You can still book your accommodation space. You have just{" "}
                  <span className="font-bold text-purple-800">100 spaces</span>{" "}
                  available, book now.
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
                <p className="text-base opacity-90">an YA Messages</p>
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
            <h3 className="text-lg lg:text-xl font-semibold mb-4">Follow Us</h3>
            <p className="text-gray-600 text-sm mb-5">
              Stay connected with us on social media
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://facebook.com"
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
                href="https://instagram.com"
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
                href="https://x.com"
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
                href="https://youtube.com"
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
            <h3 className="text-lg lg:text-xl font-semibold mb-4">
              Stream Our Meetings
            </h3>
            <p className="text-gray-600 text-sm mb-5">
              Join us live on your preferred platform
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://mixlr.com"
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
                href="https://youtube.com"
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
                href="https://waystream.com"
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
                href="https://facebook.com"
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
                {modalStep === 2 && "Camp Accommodation"}
                {modalStep === 3 && "Payment"}
              </h2>
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

              {modalStep === 2 && (
                <AccommodationSelection
                  categoryId=""
                  accommodationType={selectedAccommodationType}
                  eventId={registration?.eventId}
                  registrationId={
                    registration?.id || registration?.registrationId
                  }
                  profile={localProfile}
                  onComplete={handleFacilitySelection}
                  onBack={handleModalBack}
                />
              )}

              {modalStep === 3 && (
                <Payment
                  amount={accommodationData?.price || 250}
                  onComplete={handlePaymentComplete}
                  onBack={handleModalBack}
                  profile={localProfile}
                  accommodation={accommodationData}
                  registration={registration}
                />
              )}
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
        eventId={registration?.eventId || registration?.event?.eventId}
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
